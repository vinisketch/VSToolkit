import { SupportMixins, Mixin } from 'vs_utils';

type ObjectId = string;
/**
 * Interface for objects that have an identifier
 */
interface BaseIdentifiable {
    readonly id: ObjectId;
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
    static readonly instances: {
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

/**
 * @class
 * Handler is a class that represents an event handler binding between an
 * EventSource and a Component.
 *
 * Call Handler.retain() to get an instance from the pool.
 * Call Handler.release() to return an instance to the pool and release its resources.
 */
declare class Handler {
    #private;
    get func(): string | Function | undefined;
    get obj(): Component | undefined;
    private constructor();
    configure(obj?: Component, func?: HandlerFunction): void;
    static retain(): Handler;
    static release(handler: Handler): void;
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
    dispatchEvent(this: EventSource, event: Event): boolean;
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
    private constructor();
    /**
     * @param {string} type the event type [mandatory]
     * @param {Object} data complementary event data [optional]
     */
    configure(type: string, data?: any): void;
    static retain(): Event;
    static release(event: Event): void;
}

type index_d$1_Event = Event;
declare const index_d$1_Event: typeof Event;
type index_d$1_EventSource = EventSource;
declare const index_d$1_EventSource: typeof EventSource;
type index_d$1_Handler = Handler;
declare const index_d$1_Handler: typeof Handler;
type index_d$1_HandlerFunction = HandlerFunction;
declare namespace index_d$1 {
  export { index_d$1_Event as Event, index_d$1_EventSource as EventSource, index_d$1_Handler as Handler };
  export type { index_d$1_HandlerFunction as HandlerFunction };
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

interface TaskDelegate {
    taskDidEnd?: (task: any) => void;
    taskDidStart?: (task: any) => void;
    taskDidStop?: (task: any) => void;
    taskDidPause?: (task: any) => void;
}

type TaskAndParams = [Task, any[]] | [Task] | Task;
/**
 *  The core.Task class
 *
 *  <p>
 *
 * Delegates:
 *  <ul>
 *    <li/>taskDidStop : function (core.Task)
 *    <li/>taskDidPause : function (core.Task)
 *    <li/>taskDidEnd : function (core.Task)
 *  </ul>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new core.Task .
 *
 * @name core.Task
 *
 * @param {Object} config the configuration structure
 */
declare abstract class Task extends Component {
    #private;
    /********************************************************************
  
     ********************************************************************/
    /**
     * TaskDelegate.
     * Methods are called when state changes (stop | pause)
     *
     *  <p>
     *  @example
     *  var delegate = {};
     *  delegate.taskDidEnd = function () { ... }
     *
     *  // Declare a PAR task including a SEC Task
     *  var task = new Task (...)
     *  task.delegate = delegate;
     *  task.start ();
     *
     * @name core.Task#delegate
     *
     * @property {object}
     */
    delegate: TaskDelegate | undefined;
    /**
     *  Return the task State. <br />
     *  Possible values: {@link core.Task.STARTED},
     *  {@link core.Task.STOPPED},
     *  {@link core.Task.PAUSED}
     */
    get state(): TaskState;
    protected set state(state: TaskState);
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Default task destructor
     *
     * @name core.Task#destructor
     * @function
     */
    destructor(): void;
    /**
     *  Starts the task
     *
     * @name core.Task#start
     * @function
     *
     * @param {any} param any parameter (scalar, Array, Object)
     */
    start(param: any): void;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the TaskDelegate.taskDidStop
     *  if it declared.
     *
     * @name core.Task#stop
     * @function
     */
    stop(): void;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls the TaskDelegate.taskDidPause
     *  if it declared.
     *
     * @name core.Task#pause
     * @function
     */
    pause(): void;
}

declare abstract class BaseTask extends Task {
    constructor(tasksAndParams?: TaskAndParams[]);
    /********************************************************************
  
     ********************************************************************/
    /**
     *  @private
     */
    protected readonly tasksAndParams: [Task, any[] | null][];
    /**
     *  Set tasks.
     *  The task has to be stopped
     *
     * @name core.task.SEQ#setTasks
     * @function
     *
     *  parameter
     * @param tasksAndParams
     */
    setTasks(tasksAndParams: TaskAndParams[]): boolean;
}

/**
 *  The task.SEQ class
 *
 *  @extends core.Task
 *
 *  @class
 *  Implements {@link core.Task}.
 *  <p>
 *  The task.SEQ class provides a sequential group of tasks.<br />
 *  task.SEQ is a core.Task that runs its tasks in sequence, i.e., it starts
 *  one task after another has ended. <br />
 *  The tasks are started in the order they are defined within the constructor.
 *  <br />
 *  The task.SEQ finishes when its last tasks has ended.
 *
 *  <p>
 *
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (core.Task)
 *    <li/>taskDidPause : function (core.Task)
 *    <li/>taskDidEnd : function (core.Task)
 *  </ul>
 *
 *  Methods borrowed from class {@link core.Task}:<br />
 *  &nbsp;&nbsp;&nbsp;&nbsp;{@link core.Task#pause}, {@link core.Task#start},
 *  {@link core.Task#stop}
 *
 *  @example
 *  // Declare two tasks (animations)
 *  var rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  var scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the task.SEQ
 *  var seq = task.SEQ ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations sequentially
 *  seq.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  var seq = new task.SEQ
 *    ([scale, comp0], new Task_PAR ([rotate, comp1], [rotate, comp2]));
 *  seq.delegate = this;
 *  seq.start ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new core.task.SEQ.
 *
 * @name core.task.SEQ
 *
 * @param list List of task to start sequentially with an optional
 *  parameter
 */
declare class SEQ extends BaseTask {
    #private;
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Starts the task
     *
     * @param {any} param any parameter (scalar, Array, Object)
     * @ignore
     * @function
     */
    start(param: any[]): boolean;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the taskDidStop if it exits.
     * @ignore
     * @function
     */
    stop(): boolean;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls
     *  the TaskDelegate.taskDidPause if it exits.
     * @ignore
     * @function
     */
    pause(): boolean;
    /********************************************************************
     delegate methodes
     ********************************************************************/
    /**
     */
    taskDidStop(): void;
    /**
     */
    taskDidPause(): void;
    /**
     */
    taskDidEnd(): void;
}

/**
 *  The core.task.PAR class
 *
 *  @extends core.Task
 *
 *  @class
 *  Implements {@link core.Task}.
 *  <p>
 *  The task.PAR class provides a parallel group of tasks.<br />
 *  task.PAR is a core.Task that starts all its tasks when it is started itself.
 *  <br />
 *  The Task_SEQ ended when longest lasting task has ended.
 *
 *  <p>
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (core.Task)
 *    <li/>taskDidPause : function (core.Task)
 *    <li/>taskDidEnd : function (core.Task)
 *  </ul>
 *
 *  Methods borrowed from class {@link core.Task}:<br />
 *  &nbsp;&nbsp;&nbsp;&nbsp;{@link core.Task#pause}, {@link core.Task#start},
 *  {@link core.Task#stop}
 *
 *  <p>
 *  @example
 *  // Declare two tasks (animations)
 *  var rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  var scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the task.PAR
 *  var par = task.PAR ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  par.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  var seq = new Task_SEQ
 *    ([scale, comp0], new task.PAR ([rotate, comp1], [rotate, comp2]));
 *  seq.delegate = this;
 *  seq.start ();
 *
 *  @author David Thevenin
 *
 *  @borrows core.Task#start as task.PAR#start
 *
 *  @constructor
 *   Creates a new core.Task.
 *
 * @name core.task.PAR
 *
 * @param list List of task to start parallel with an optional
 *  parameter
 */
declare class PAR extends BaseTask {
    #private;
    /**
     *  Starts the task
     *
     * @name task.PAR#start
     * @function
     * @ignore
     * @param {any} param any parameter (scalar, Array, Object)
     */
    start(param: any[]): boolean;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the taskDidStop if it exits.
     * @function
     * @ignore
     */
    stop(): boolean;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls the taskDidPause if it exits.
     *  @ignore
     * @function
     */
    pause(): boolean;
    /********************************************************************
     delegate methods
     ********************************************************************/
    /**
     */
    taskDidStop(): void;
    /**
     */
    taskDidPause(): void;
    /**
     */
    taskDidEnd(): void;
}

/**
 *  The core.task.Wait class
 *
 *  @extends core.Task
 *
 *  @class
 *  Implements {@link core.Task}.
 *  <p>
 *  The core.task.Wait class provides ...
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new core.task.Wait.
 *
 * @name core.task.Wait
 *
 * @param time The time to wait, using millisecond
 *  parameter
 */
declare class Wait extends Task {
    #private;
    constructor(time: number);
    set time(v: number);
    get time(): number;
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Starts the task
     *
     * @param {any} param any parameter (scalar, Array, Object)
     * @ignore
     * @function
     */
    start(): boolean;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the taskDidStop if it exits.
     * @ignore
     * @function
     */
    stop(): boolean;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls
     *  the TaskDelegate.taskDidPause if it exits.
     * @ignore
     * @function
     */
    pause(): boolean;
}

type index_d_PAR = PAR;
declare const index_d_PAR: typeof PAR;
type index_d_SEQ = SEQ;
declare const index_d_SEQ: typeof SEQ;
type index_d_Task = Task;
declare const index_d_Task: typeof Task;
type index_d_TaskDelegate = TaskDelegate;
type index_d_TaskState = TaskState;
declare const index_d_TaskState: typeof TaskState;
type index_d_Wait = Wait;
declare const index_d_Wait: typeof Wait;
declare namespace index_d {
  export { index_d_PAR as PAR, index_d_SEQ as SEQ, index_d_Task as Task, index_d_TaskState as TaskState, index_d_Wait as Wait };
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
