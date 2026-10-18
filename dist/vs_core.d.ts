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
    taskDidEnd?: (task: Task) => void;
    taskDidStart?: (task: Task) => void;
    taskDidStop?: (task: Task) => void;
    taskDidPause?: (task: Task) => void;
}

/**
 * The parameter given to a task when it starts (scalar, Array, Object)
 */
type TaskParam = unknown;
type TaskAndParams = [Task, TaskParam] | Task;
/**
 * How a task run finished: 'ended' when the task reached its end,
 * 'stopped' when it was stopped before (by stop() or the task abort signal).
 */
type TaskResult = 'ended' | 'stopped';
interface TaskOptions {
    /**
     * The task delegate (see Task#delegate)
     */
    delegate?: TaskDelegate;
    /**
     * Stops the task whenever the signal is aborted, which has the same
     * effect as calling stop(). Once aborted, the task cannot be started.
     */
    signal?: AbortSignal;
}
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
 * @param {TaskOptions} options optional delegate and abort signal
 */
declare abstract class Task extends Component {
    #private;
    constructor({ delegate, signal }?: TaskOptions);
    /********************************************************************
  
     ********************************************************************/
    /**
     * TaskDelegate.
     * Methods are called when state changes (stop | pause)
     *
     *  <p>
     *  @example
     *  const delegate = {};
     *  delegate.taskDidEnd = function () { ... }
     *
     *  // Declare a PAR task including a SEC Task
     *  const task = new Task (...)
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
    protected destructor(): void;
    /**
     *  Notifies the task's delegate and groups of a state change.
     *  An exception thrown by a callback is logged and does not propagate.
     *
     * @name core.Task#notify
     * @function
     * @protected
     */
    protected notify(method: keyof TaskDelegate): void;
    /**
     *  Starts the task, or resumes it when paused.<br />
     *  Returns a promise resolved when this run finishes, with 'ended' when the
     *  task reached its end or 'stopped' when it was stopped before. It stays
     *  pending while the task is paused.<br />
     *  When the task is already started, it is not restarted (param is
     *  ignored) and the promise of the current run is returned.
     *
     *  When the task abort signal (see TaskOptions) is aborted, the task is
     *  not started and the promise is resolved with 'stopped'.
     *
     *  @example
     *  const result = await seq([fadeOut, new Wait(200), fadeIn]).start(view);
     *
     *  // aborting the signal has the same effect as calling stop()
     *  const controller = new AbortController();
     *  par([rotate, scale], { signal: controller.signal }).start(view);
     *  controller.abort();
     *
     * @name core.Task#start
     * @function
     *
     * @param {any} param any parameter (scalar, Array, Object)
     * @return {Promise<TaskResult>}
     */
    start(param?: TaskParam): Promise<TaskResult>;
    /**
     *  Implements the task start (or resume when paused).
     *  Called by start() when the task is not started.
     *
     * @name core.Task#doStart
     * @function
     * @protected
     *
     * @param {any} param any parameter (scalar, Array, Object)
     * @return {boolean} false if the task could not be started
     */
    protected abstract doStart(param?: TaskParam): boolean;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the TaskDelegate.taskDidStop
     *  if it declared.
     *
     * @name core.Task#stop
     * @function
     */
    abstract stop(): boolean;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls the TaskDelegate.taskDidPause
     *  if it declared.
     *
     * @name core.Task#pause
     * @function
     */
    abstract pause(): boolean;
}

/**
 * Base class of the task groups (SEQ, PAR).
 * A group does not take the delegate of its tasks: it is notified through
 * the task group registry, so a task keeps its own delegate and can belong to
 * several groups.
 */
declare abstract class BaseTask extends Task implements TaskDelegate {
    #private;
    constructor(tasksAndParams?: TaskAndParams[], options?: TaskOptions);
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Tasks with their own optional parameter (undefined when none)
     *  @private
     */
    protected readonly tasksAndParams: [Task, TaskParam][];
    /**
     *  Returns the parameter to start a task with: its own parameter if it
     *  has one, the group parameter otherwise.
     *  @protected
     */
    protected paramFor([, ownParam]: [Task, TaskParam], groupParam: TaskParam): TaskParam;
    /**
     *  Set tasks.
     *  The task has to be stopped
     *
     * @name core.task.BaseTask#setTasks
     * @function
     *
     * @param tasksAndParams list of tasks, each one optionally with its own
     *        parameter: task | [task] | [task, param]
     */
    setTasks(tasksAndParams: TaskAndParams[]): boolean;
    /********************************************************************
     callbacks from the group tasks
     ********************************************************************/
    abstract taskDidEnd(task: Task): void;
    abstract taskDidStop(task: Task): void;
    abstract taskDidPause(task: Task): void;
    /**
     *  Stops the group and releases its tasks
     *  @protected
     */
    protected destructor(): void;
}

/**
 *  Methods that create a SEQ group
 *
 *  <p>
 *  @example
 *
 *  // Declare the Task_PAR
 *  const group = vs.seq ([scale, comp0], [rotate, comp0]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 *  parameter
 * @param params
 * @param options optional delegate and abort signal
 */
declare const seq: (params: TaskAndParams[], options?: TaskOptions) => SEQ;
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
 *  const rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  const scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the task.SEQ
 *  const seq = task.SEQ ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations sequentially
 *  seq.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  const seq = new task.SEQ
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
    protected doStart(param?: TaskParam): boolean;
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
     delegate methods
     ********************************************************************/
    /**
     *  The running task was stopped by someone else than this sequence
     */
    taskDidStop(task: Task): void;
    /**
     *  The running task was paused by someone else than this sequence
     */
    taskDidPause(task: Task): void;
    /**
     */
    taskDidEnd(task: Task): void;
}

/**
 *  Methods that create a PAR group
 *
 *  <p>
 *  @example
 *
 *  // Declare the task.PAR
 *  const group = vs.par ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 *  parameter
 * @param params
 * @param options optional delegate and abort signal
 */
declare const par: (params: TaskAndParams[], options?: TaskOptions) => PAR;
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
 *  const rotate = new vs.fx.RotateXYZAnimation (30, 50, 100);
 *  rotate.durations = '3s';
 *  const scale = new vs.fx.ScaleAnimation (2,0.5);
 *  scale.durations = '2s';
 *
 *  // Declare the task.PAR
 *  const par = task.PAR ([rotate, comp1], [scale, comp2]);
 *
 *  // Start the task => start animations
 *  par.start ();
 *
 *  // Declare a PAR task including a SEC Task
 *  const seq = new Task_SEQ
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
    protected doStart(param?: TaskParam): boolean;
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
     *  A task was stopped by someone else than this group: it will not end,
     *  so the group stops when no other task is running.
     */
    taskDidStop(task: Task): void;
    /**
     *  A task was paused by someone else than this group: the group keeps
     *  running and waits for the task to be resumed.
     */
    taskDidPause(_task: Task): void;
    /**
     */
    taskDidEnd(task: Task): void;
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
 * @param options optional delegate and abort signal
 *  parameter
 */
declare class Wait extends Task {
    #private;
    constructor(time: number, options?: TaskOptions);
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
    protected doStart(): boolean;
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
type index_d_TaskAndParams = TaskAndParams;
type index_d_TaskDelegate = TaskDelegate;
type index_d_TaskOptions = TaskOptions;
type index_d_TaskParam = TaskParam;
type index_d_TaskResult = TaskResult;
type index_d_TaskState = TaskState;
declare const index_d_TaskState: typeof TaskState;
type index_d_Wait = Wait;
declare const index_d_Wait: typeof Wait;
declare const index_d_par: typeof par;
declare const index_d_seq: typeof seq;
declare namespace index_d {
  export { index_d_PAR as PAR, index_d_SEQ as SEQ, index_d_Task as Task, index_d_TaskState as TaskState, index_d_Wait as Wait, index_d_par as par, index_d_seq as seq };
  export type { index_d_TaskAndParams as TaskAndParams, index_d_TaskDelegate as TaskDelegate, index_d_TaskOptions as TaskOptions, index_d_TaskParam as TaskParam, index_d_TaskResult as TaskResult };
}

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

export { LOGGER, index_d$1 as event, index_d as task };
export type { ILogger, InitFunction };
