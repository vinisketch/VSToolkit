import { Event } from './event';
import { Action } from "./Action";
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
export declare const ON_NEXT_FRAME = -1;
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
export declare function scheduleAction(action: Action, delay?: number): void;
/**
 * Put an asynchronous event into the event queue and request the mainloop
 *
 * @private
 */
export declare function queueProcAsyncEvent(event: Event, handlerList: any[]): void;
/**
 * Set up a synchronous event and request the mainloop
 *
 * @private
 */
export declare function queueProcSyncEvent(event: Event, handler_list: any[]): void;
//# sourceMappingURL=MainLoop.d.ts.map