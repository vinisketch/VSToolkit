import { SupportMixins, Mixin } from 'vs_utils';

type ObjectId = string;
interface BaseIdentifiable {
    readonly id: string;
}

type InitFunction = () => void;
/**
 *  @class Object
 *  core.Object is the root class of most class hierarchies. Through
 *  core.Object, objects inherit a basic interface for configuration
 *  and clone mechanism. It provides a unique identifier for objects.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @param {Object} config the configuration structure
*/
declare class Component extends SupportMixins implements BaseIdentifiable {
    #private;
    static instances: {
        [id: string]: Component;
    };
    readonly id: string;
    constructor(id?: ObjectId);
    /**
     *  Object default init. <p>
     *
     *  @example
     *  myObject = new core.Object (core.createId ());
     *  myObject.init ();
     *  @return {Object} this
     */
    init(): this;
    protected initComponent(): void;
    protected componentDidInitialize(): void;
    protected destructor(): void;
    isDeleted(): boolean;
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     *
     * @return {Object} the object value for stringify
     */
    toJSON(): string;
    /**
     *  Set objet's properties from JSON stringification.<p/>
     *  This can be used when retrieve data from serialization.
     *
     * @param {String} json The JSON String
     */
    parseJSON(json: string): void;
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     */
    protected serialize(): any;
    protected deserialize(data: any): void;
}
interface Component extends BaseIdentifiable, EventSource {
}

type HandlerFunction = string | Function;
declare class Handler {
    #private;
    get func(): string | Function | undefined;
    get obj(): Component | undefined;
    constructor();
    configure(obj?: Component, func?: HandlerFunction): void;
    release(): void;
    static retain(): Handler;
    static release(handler: Handler): void;
}

declare function isEventSource(obj: unknown): obj is EventSource;
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
declare class EventSource extends Mixin {
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

declare class Event {
    #private;
    private static readonly eventPool;
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

//# sourceMappingURL=index.d.ts.map

type index_d$1_Event = Event;
declare const index_d$1_Event: typeof Event;
type index_d$1_EventSource = EventSource;
declare const index_d$1_EventSource: typeof EventSource;
type index_d$1_Handler = Handler;
declare const index_d$1_Handler: typeof Handler;
declare const index_d$1_isEventSource: typeof isEventSource;
declare namespace index_d$1 {
  export {
    index_d$1_Event as Event,
    index_d$1_EventSource as EventSource,
    index_d$1_Handler as Handler,
    index_d$1_isEventSource as isEventSource,
  };
}

interface TaskDelegate {
    taskDidEnd?: Function;
    taskDidStart?: Function;
    taskDidStop?: Function;
    taskDidPause?: Function;
}

declare enum TaskState {
    /**
     * The task is started
     * @const
     * @name core.TaskState.STARTED
     */
    STARTED = 1,
    /**
     * The task is stopped
     * @const
     * @name core.TaskState.STOPPED
     */
    STOPPED = 0,
    /**
     * The task is paused
     * @const
     * @name core.TaskState.PAUSED
     */
    PAUSED = 2
}

//# sourceMappingURL=index.d.ts.map

type index_d_TaskDelegate = TaskDelegate;
type index_d_TaskState = TaskState;
declare const index_d_TaskState: typeof TaskState;
declare namespace index_d {
  export { index_d_TaskState as TaskState };
  export type { index_d_TaskDelegate as TaskDelegate };
}

declare function Input(value: any, { name, addInitializer, ...rest }: any): void;

interface LeveledLogMethod {
    (message: string): void;
    (message: string, meta: any): void;
    (message: string, ...meta: any[]): void;
    (message: any): void;
    (infoObject: object): void;
}
interface ILogger {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
    verbose: LeveledLogMethod;
}
declare const LOGGER: {
    id: Symbol;
    cast: (param: unknown) => ILogger;
    toString(): string;
};

export { Input, LOGGER, index_d$1 as event, index_d as task };
export type { ILogger, InitFunction };
