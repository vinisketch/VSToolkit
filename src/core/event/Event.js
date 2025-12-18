export default class Event {
    static eventPool = [];
    /**
     * The event spec. For instance 'click' for a mouse click event.
     */
    #type;
    get type() {
        return this.#type;
    }
    /**
     * The optional data associated to the event.
     */
    data;
    /**
     * The component which produce the event
     */
    src;
    /**
     * [Deprecated] The component which produce the event. <br>
     * In case of DOM event, the Event is mapped to the DOM event. Then
     * the developer has access to srcTarget (and many other data).
     * @deprecated
     */
    srcTarget;
    /**
     * @param {string} type the event type [mandatory]
     * @param {Object} data complementary event data [optional]
     */
    constructor(type, data) {
        if (type)
            this.configure(type, data);
    }
    configure(type, data) {
        this.#type = type;
        this.data = data;
    }
    static retain() {
        if (this.eventPool.length > 0) {
            return this.eventPool.pop();
        }
        return new Event();
    }
    static release(event) {
        this.eventPool.push(event);
    }
}
//# sourceMappingURL=Event.js.map