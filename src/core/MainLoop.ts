import { container, isFunction } from 'vs_utils';
import {
  initSetImmediatePolyfill,
  runImmediatePolyfill
} from './polyfillSetImmediate';
import { Event } from './event';
import { Action } from "./Action";
import { ILogger, LOGGER, consoleLogger } from './ILogger';

/**
 * Schedule your action on next frame.
 *
 * @example
 * core.scheduleAction (function() {...}, core.ON_NEXT_FRAME);
 *
 * @see core.scheduleAction
 *
 * @type {String}
 * @const
 * @public
 */
export const ON_NEXT_FRAME = -1;

// type Action = (...args: any[]) => void;

type EventHandler = any;

interface EventBurst {
  handlerList: EventHandler[],
  event: Event;
}

// Events queue. This array contains event structure for future propagation.
// This array is part of the algorithm that secure event propagation, in
// particular that avoids a event pass a previous one.
const asyncEventsQueue: EventBurst[] = [];

// Event reference on the current synchronous event.
let syncEvent: EventBurst | undefined = undefined;

// Boolean indicating if we are propagating a event or not.
// To secure event propagation, in particular to avoid a event pass a previous
// event, we manage a events queue and block new propagation if a event is
// in propagation.
let isAsyncEventsPropagating = false;
let isSyncEventsPropagating = false;

// Boolean indicating if we are running an action or not.
// This boolean is used only in case we use our own implementation of
// setImmediate.
let isActionRunning = false;
let isWaiting = false;

/********************************************************************
 Actions Management
 *********************************************************************/


/**
 * Install our awn setImmediate implementation, if needs
 *
 * @private
 */

const loopSetImmediate =
  (typeof setImmediate !== 'undefined') ? setImmediate :
  (typeof window !== 'undefined' && window.setImmediate) ? window.setImmediate.bind(window) :
  initSetImmediatePolyfill();

/**
 * Schedule an action to be executed asynchronously.
 * <br />
 * There is three basic scheduling; the action can be executed:
 * <ul>
 *   <li>as soon as possible.
 *   <li>on the next frame
 *   <li>after a delay
 * </ul>
 *
 * 1- As soon as possible<br />
 * The action will be executed as soon as possible in a manner that is
 * typically more efficient and consumes less power than the usual
 * setTimeout(..., 0) pattern.<br />
 * It based on setImmediate if it is available; otherwise it will use postMessage
 * if it is possible and at least setTimeout(..., 0) pattern if previous APIs are
 * not available.
 *<br /><br />
 *
 * 2- On next frame<br />
 * The action will be executed on next frame.<br />It is equivalent to use
 * window.requestAnimationFrame.
 *<br /><br />
 *
 * 2- After a delay<br />
 * The action will be executed after a given delay in millisecond.<br />
 * It is equivalent to use window.setTimeout(..., delay).
 *
 * @example
 * // run asap
 * core.scheduleAction ((...args: any[]) {...});
 * // run on next frame
 * core.scheduleAction ((...args: any[]) {...}, core.ON_NEXT_FRAME);
 * // run after 1s
 * core.scheduleAction ((...args: any[]) {...}, 1000);
 *
 * @type {String}
 * @function
 * @public
 *
 * @param {Action} The action to run
 * @param {(Number)} delay when run the action [optional]
 */
export function scheduleAction(action: Action, delay?: number) {
  if (delay && delay > 0) {
    setTimeout(action.run, delay);
  } else if (delay === ON_NEXT_FRAME) {
    requestAnimationFrame(action.run);
  } else loopSetImmediate(action.run);
}


// /********************************************************************
//       Do one event
// *********************************************************************/

/*
 *----------------------------------------------------------------------
 *
 * _DoOneEvent --
 *
 *  Process a single event of some sort.  If there's no work to
 *  do, wait for an event to occur, then process it.
 *
 *
 *----------------------------------------------------------------------
 */

/**
 * doOneEvent will dispatch One event to all observers.
 *
 * @private
 * @param {Object} burst a event burst structure
 * @param {Boolean} isSynchro if its true the callbacks are executed
 *             synchronously, otherwise they are executed within a setImmediate
 */
function doOneEvent(burst: EventBurst, isSynchro?: boolean): void {
  const { handlerList } = burst;
  const len = handlerList.length;
  let l = len;
  const event = burst.event;
  const logger = container.get(LOGGER);

  if (isSynchro) isSyncEventsPropagating = true;
  else isAsyncEventsPropagating = true;

  // Test is all observers have been called
  function endPropagation() {
    l--;
    if (l <= 0) {
      if (isSynchro) isSyncEventsPropagating = false;
      else isAsyncEventsPropagating = false;
    }
  }

  /**
   * doOneHandler will dispatch One event to an observer.
   *
   * @param {Handler} handler
   */
  function doOneHandler(handler: EventHandler) {
    if (handler) {
      try {
        if (isFunction(handler)) {
          // call function
          handler(event);
        } else if (isFunction(handler.handleEvent)) {
          // default handleEvent method
          handler.handleEvent.call(handler, event);
        }
      } catch (e: any) {
        if (e.stack) logger.error(e.stack);
        else logger.error(e);
      }
    }
    endPropagation();
  }

  if (len === 0) endPropagation(); // should not occur

  // For each observer, schedule the handler call (callback execution)
  for (let i = 0; i < len; i++) {
    if (isSynchro) doOneHandler(handlerList[i]);
    else {
      ((handler: EventHandler) => loopSetImmediate(() => doOneHandler(handler)))(handlerList[i]);
    }
  }
}

/**
 * doOneAsyncEvent will dispatch One event to all observers.
 *
 * @private
 */
function doOneAsyncEvent() {
  if (
    isAsyncEventsPropagating ||
    isSyncEventsPropagating ||
    asyncEventsQueue.length === 0
  ) return;

  // dequeue the next event burst and do it
  doOneEvent(asyncEventsQueue.shift()!);
}

/**
 * doOneSyncEvent will dispatch the synchronous event to all observers.
 *
 * @private
 */
function doOneSyncEvent(): void {
  if (!syncEvent) return;
  doOneEvent(syncEvent, true);
  syncEvent = undefined;
}

/**
 * Mainloop core
 *
 * @private
 */
function serviceLoop() {
  if (syncEvent) doOneSyncEvent();

  if (isWaiting) return;

  function loop() {
    isWaiting = false;
    serviceLoop();
  }

  if (isAsyncEventsPropagating || isSyncEventsPropagating) {
    // do the loop
    loopSetImmediate(loop);
    return;
  }

  // dispatch an event to observers
  runImmediatePolyfill();
  if (asyncEventsQueue.length) doOneAsyncEvent();
}

// /********************************************************************
//       Event dispatch
// *********************************************************************/

/**
 * Put an asynchronous event into the event queue and request the mainloop
 *
 * @private
 */
export function queueProcAsyncEvent(event: Event, handlerList: any[]) {
  const burst: EventBurst = {
    handlerList,
    event,
  };

  // push the event to dispatch into the queue
  asyncEventsQueue.push(burst);

  // request for the mainloop
  serviceLoop();
}

/**
 * Set up a synchronous event and request the mainloop
 *
 * @private
 */
export function queueProcSyncEvent(event: Event, handler_list: any[]) {
  if (!event || !handler_list) return;

  const burst: EventBurst = {
    handlerList: handler_list,
    event,
  };

  // push the event to dispatch into the queue
  syncEvent = burst;

  // launch for the mainloop
  serviceLoop();
}

// /********************************************************************
//       Mainloop code
// *********************************************************************/

// // var _waiting_for_service_loop = false;
// // function requestServiceLoop() {
// //   if (_waiting_for_service_loop) return;
// //
// //   setImmediate (serviceLoop);
// //   _waiting_for_service_loop = true;
// // }
