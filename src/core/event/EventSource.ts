import { isEmpty, isObject, Mixin } from 'vs_utils';
import Component from '../Component';
import { queueProcAsyncEvent } from '../MainLoop';
import Handler, { HandlerFunction } from './Handler';
import Container, { isContainer } from '../Container';
import Event from './Event';

export function isEventSource(obj: unknown): obj is EventSource {
  return (
    isObject(obj) &&
    'dispatchEvent' in obj &&
    'bind' in obj &&
    'unbind' in obj &&
    'addEventListener' in obj &&
    'removeEventListener' in obj
  );
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
export class EventSource extends Mixin {
  readonly #bindings = new Map<string, Handler[]>();

  protected initMixin(): void {
  }

  protected releaseMixin (): void {
    super.releaseMixin();
    for (const [spec, handlerList] of this.#bindings.entries()) {
      handlerList.forEach(handler => handler.release());
      handlerList.length = 0;
      this.#bindings.delete(spec);
    }
  }

  bind(spec: string, obj: Component, func: HandlerFunction): void {
    if (!spec || !obj) return;

    let handlerList = this.#bindings.get(spec);
    if (!handlerList) {
      handlerList = [];
      this.#bindings.set(spec, handlerList);
    }

    const handler = Handler.retain();
    handler.configure(obj, func);
    handlerList.push(handler);
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
    let handlerList = this.#bindings.get(type);

    if (!handlerList) {
      handlerList = [];
      this.#bindings.set(type, handlerList);
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
    if (!this.#bindings.has(type)) return;

    function unbind(handlerList: any[]): void {
      const idx = handlerList.findIndex(handler => handler.func === func);
      if (idx !== -1) {
        const handlers = handlerList.splice(idx, 1);
        handlers.forEach(handle => handle.release());
      }
    }

    unbind(this.#bindings.get(type)!);
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
  unbind(spec: string, obj: Component, func: HandlerFunction) {
    if (!this.#bindings.has(spec)) return;

    function unbind(handlerList: any[]): void {
      const idx = handlerList.findIndex(handler => handler.func === func && handler.obj === obj);
      if (idx !== -1) {
        const handlers = handlerList.splice(idx, 1);
        handlers.forEach(handle => handle.release());
      }
    }

    unbind(this.#bindings.get(spec)!);
  }

  /**
   *  Dispatches an Event at the specified EventSource, invoking the affected
   *  EventListeners in the appropriate order.
   */
  dispatchEvent(this: typeof EventSource, event: Event): boolean {
    if (!event.type) return false;
    // @ts-ignore
    const handlerList = this.#bindings.get(event.type);

    // bubbling
    if (isEmpty(handlerList)) {
      if (isContainer(this)) {
        // @ts-ignore
        const parent = Container.getParent(this);
        if (isEventSource(parent)) {
          // @ts-ignore
          parent.dispatchEvent(event);
        }
      }
      return true;
    }

    // @ts-ignore
    event.src = this;
    // @ts-ignore
    event.srcTarget = this;
    queueProcAsyncEvent(event, handlerList);
    return true;
  }
}
