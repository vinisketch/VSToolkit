import { isNotEmpty, Mixin } from 'vs_utils';
import Component from '../Component';
import { queueProcAsyncEvent } from '../MainLoop';
import Handler from './Handler';
import { HandlerFunction } from './HandlerFunction';
import Container from '../Container';
import Event from './Event';

export function isEventSource(obj: unknown): obj is EventSource {
  return (
    // any object: vs_utils isObject() only accepts plain objects
    typeof obj === 'object' && obj !== null &&
    'dispatchEvent' in obj &&
    'bind' in obj &&
    'unbind' in obj &&
    'addEventListener' in obj &&
    'removeEventListener' in obj
  );
}

/**
 * Bindings of each event source: event spec => handlers.
 *
 * EventSource is used as a mixin (see Component): its methods are copied on
 * the target class prototype, but not its fields. A #private field would not
 * exist on the target instances (reading it throws), so the bindings are
 * stored here, by instance.
 */
const sourceBindings = new WeakMap<object, Map<string, Handler[]>>();

function bindingsOf(source: object): Map<string, Handler[]> {
  let bindings = sourceBindings.get(source);
  if (!bindings) {
    bindings = new Map();
    sourceBindings.set(source, bindings);
  }
  return bindings;
}

/**
 * Sources each object is bound to (see bind()): observer => sources.
 * Used to remove the bindings of an observer when it is released.
 */
const observerSources = new WeakMap<object, Set<object>>();

function trackObserver(source: object, observer: object): void {
  let sources = observerSources.get(observer);
  if (!sources) {
    sources = new Set();
    observerSources.set(observer, sources);
  }
  sources.add(source);
}

/**
 * Forgets the source for the observer, unless the observer is still bound to
 * one of its events.
 */
function untrackObserver(source: object, observer: object): void {
  const bindings = sourceBindings.get(source);
  for (const handlerList of bindings?.values() ?? []) {
    if (handlerList.some(handler => handler.obj === observer)) return;
  }
  observerSources.get(observer)?.delete(source);
}

/**
 * Removes all the bindings of the observer, on every source.
 */
function unbindObserver(observer: object): void {
  for (const source of observerSources.get(observer) ?? []) {
    for (const handlerList of sourceBindings.get(source)?.values() ?? []) {
      for (let i = handlerList.length - 1; i >= 0; i--) {
        if (handlerList[i].obj === observer) {
          Handler.release(handlerList.splice(i, 1)[0]);
        }
      }
    }
  }
  observerSources.delete(observer);
}

/**
 *  @class
 *  EventSource is a class that forms the basis of event and command
 *  processing. All class that handles events must inherit form EventSource.
 **
 *  @constructor
 *  Main constructor
 *
 * @param {Object} config the configuration structure [mandatory]
 */
export default class EventSource extends Mixin {
  protected initMixin(): void { }

  /**
   *  Releases the bindings of this object: the ones of its events (as
   *  source), and the ones on the events of other sources (as observer).
   */
  protected releaseMixin (): void {
    super.releaseMixin();

    // as observer
    unbindObserver(this);

    // as source
    const bindings = sourceBindings.get(this);
    if (!bindings) return;

    for (const handlerList of bindings.values()) {
      handlerList.forEach(handler => {
        if (handler.obj) observerSources.get(handler.obj)?.delete(this);
        Handler.release(handler);
      });
      handlerList.length = 0;
    }
    sourceBindings.delete(this);
  }

  /**
   *  Binds a callback of an object to an event of this source.
   *
   * @name core.EventSource#bind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {core.Object} obj the object interested to catch the event [mandatory]
   * @param {Function|string} func the callback, or the name of a method of obj,
   *        called with obj as this [mandatory]
   */
  bind(spec: string, obj: Component, func: HandlerFunction): void {
    if (!spec || !obj || !func) return;

    const bindings = bindingsOf(this);
    let handlerList = bindings.get(spec);
    if (!handlerList) {
      handlerList = [];
      bindings.set(spec, handlerList);
    }

    const handler = Handler.retain();
    handler.configure(obj, func);
    handlerList.push(handler);
    trackObserver(this, obj);
  }

  /**
   *  The EventSource.addEventListener() method registers the specified
   *  listener on the EventSource it's called on. The event target may be any
   *  GL object that supports events
   *
   * @param {string} type the event specification [mandatory]
   * @param {HandlerFunction} handler the object interested to catch the event [mandatory]
   */
  addEventListener(type: string, func: (e: Event) => void): void {
    if (!type || !func) return;

    const bindings = bindingsOf(this);
    let handlerList = bindings.get(type);
    if (!handlerList) {
      handlerList = [];
      bindings.set(type, handlerList);
    }

    const handler = Handler.retain();
    handler.configure(undefined, func);
    handlerList.push(handler);
  }

  /**
   *  Removes the event listener previously registered with
   *  EventSource.addEventListener.
   *
   * @param {string} type the event specification [mandatory]
   * @param {Object} handler the object interested to catch the event [mandatory]
   * @param {Boolean} useCapture If true, useCapture indicates that the user
   *          wishes to initiate captured [optional]
   */
  removeEventListener(type: string, func: (e: Event) => void): void {
    const handlerList = sourceBindings.get(this)?.get(type);
    if (!handlerList) return;

    const idx = handlerList.findIndex(handler => !handler.obj && handler.func === func);
    if (idx !== -1) {
      Handler.release(handlerList.splice(idx, 1)[0]);
    }
  }

  /**
   *  The event unbind method
   *  <p>
   *  Should be call when you want stop event listening on this object
   *
   * @name core.EventSource#unbind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {core.Object} obj the object you want to unbind [mandatory]
   * @param {string} func the name of a callback. If it's not defined
   *        all binding with <spec, obj> will be removed
   */
  unbind(spec: string, obj: Component, func?: HandlerFunction) {
    const handlerList = sourceBindings.get(this)?.get(spec);
    if (!handlerList) return;

    if (func) {
      const idx = handlerList.findIndex(handler => handler.obj === obj && handler.func === func);
      if (idx !== -1) {
        Handler.release(handlerList.splice(idx, 1)[0]);
      }
    } else {
      // no callback: remove all the bindings of obj
      for (let i = handlerList.length - 1; i >= 0; i--) {
        if (handlerList[i].obj === obj) {
          Handler.release(handlerList.splice(i, 1)[0]);
        }
      }
    }

    untrackObserver(this, obj);
  }

  /**
   *  Dispatches an Event at the specified EventSource, invoking the affected
   *  EventListeners in the appropriate order.
   *  <p>
   *  When this source has no handler for the event, the event bubbles up to
   *  its parent Container (if it is an EventSource), and so on. The event src
   *  stays this source.
   */
  dispatchEvent(this: EventSource, event: Event): boolean {
    if (!event.type) return false;

    event.src = this;
    event.srcTarget = this;
    deliver(this, event);

    return true;
  }
}

/**
 * Delivers the event to the handlers of the source, or bubbles it up to the
 * first parent having handlers for it.
 * (a module function, not a #private method, which would not exist on the
 * classes EventSource is mixed in)
 */
function deliver(source: EventSource, event: Event): void {
  const handlerList = sourceBindings.get(source)?.get(event.type!);

  if (isNotEmpty(handlerList)) {
    // the event is delivered asynchronously: deliver it to the handlers
    // bound at dispatch time, as plain functions, since a handler unbound
    // meanwhile is released to the pool and may be reused by another binding
    queueProcAsyncEvent(event, handlerList!.map(handler => handler.toListener()));
    return;
  }

  // bubbling
  const parent = Container.getParent(source as unknown as Component);
  if (isEventSource(parent)) {
    deliver(parent, event);
  }
}
