import { Mixin } from 'vs_utils';
import Component from '../Component';
import { HandlerFunction } from './Handler';
import Event from './Event';
export declare function isEventSource(obj: unknown): obj is EventSource;
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
    #private;
    protected initMixin(): void;
    protected releaseMixin(): void;
    bind(spec: string, obj: Component, func: HandlerFunction): void;
    /**
     *  The EventSource.addEventListener() method registers the specified
     *  listener on the EventSource it's called on. The event target may be any
     *  GL object that supports events
     *
     * @param {string} type the event specification [mandatory]
     * @param {HandlerFunction} handler the object interested to catch the event [mandatory]
     */
    addEventListener(type: string, func: (e: Event) => void): void;
    /**
     *  Removes the event listener previously registered with
     *  EventSource.addEventListener.
     *
     * @param {string} type the event specification [mandatory]
     * @param {Object} handler the object interested to catch the event [mandatory]
     * @param {Boolean} useCapture If true, useCapture indicates that the user
     *          wishes to initiate captured [optional]
     */
    removeEventListener(type: string, func: (e: Event) => void): void;
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
    unbind(spec: string, obj: Component, func: HandlerFunction): void;
    /**
     *  Dispatches an Event at the specified EventSource, invoking the affected
     *  EventListeners in the appropriate order.
     */
    dispatchEvent(this: typeof EventSource, event: Event): boolean;
}
//# sourceMappingURL=EventSource.d.ts.map