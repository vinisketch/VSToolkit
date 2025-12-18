/**
 *  @class
 *  An Event object, or simply an event, contains information about an
 *  input action such as a button click or a key down. The Event object contains
 *  pertinent information about each event, such as where the cursor was located
 *  or which character was typed.<br>
 *  When an event is caught by an application component, the callback
 *  receives as parameters an instance (or sub instance) of this class.
 *  <p>
 *  It specifies the source of the event (which object has generated the event),
 *  the type of the event and an event data.
 */
import { EventSource } from './EventSource';
export default class Event {
    #private;
    private static eventPool;
    get type(): string | undefined;
    /**
     * The optional data associated to the event.
     */
    private data;
    /**
     * The component which produce the event
     */
    src: EventSource | undefined;
    /**
     * [Deprecated] The component which produce the event. <br>
     * In case of DOM event, the Event is mapped to the DOM event. Then
     * the developer has access to srcTarget (and many other data).
     * @deprecated
     */
    srcTarget: EventSource | undefined;
    /**
     * @param {string} type the event type [mandatory]
     * @param {Object} data complementary event data [optional]
     */
    constructor(type?: string, data?: any);
    configure(type: string, data?: any): void;
    static retain(): Event;
    static release(event: Event): void;
}
//# sourceMappingURL=Event.d.ts.map