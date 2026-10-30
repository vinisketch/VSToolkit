import { SupportMixins, Mixin } from 'vs_utils';

type ObjectId = string;
/**
 * Interface for objects that have an identifier
 */
interface BaseIdentifiable {
    readonly id: ObjectId;
}

/**
 *  Connects an out property of a component on the default dataflow. Not to
 *  be instantiated: it is returned by the connect() method of the
 *  components.
 *
 *  @example
 *  slider.connect('value').to(view, 'rotation');
 *
 *  @deprecated use connect() and the property references (component.$),
 *  which are typed and chain the connections:
 *  connect(slider.$.value).to(view.$.rotation)
 */
declare class Connector {
    private readonly objId;
    private readonly pOut;
    private intermediateObjId;
    constructor(objId: ObjectId, pOut: string);
    /**
     * Connects the out property of the connector to an in property of the
     * object (see DataFlow.connect).
     *
     * @param {Component} object the target component
     * @param {String} pIn the in property of the target
     * @param {Function} func the function mapping the value [optional]
     * @return {Connector} this connector
     */
    to(object: BaseIdentifiable, pIn: string, func?: any): this;
    /**
     * Not supported yet: chaining connections will be reworked.
     *
     * @param {String} pIn an out property
     * @return {Connector} a new connector
     */
    connect(pIn: string): Connector;
}

/**
 * The direction of a property in the dataflow:
 * 'in' can only be connected to, 'out' can only be connected from,
 * 'inout' both.
 */
type PropertyDirection = 'in' | 'out' | 'inout';
/**
 * The API of a dataflow node.
 * Every Component is a dataflow node: DataflowNodeMixin is applied to it.
 */
interface DataflowNode extends BaseIdentifiable {
    /**
     *  Called by the dataflow when input properties have been changed.
     *  Reimplement it to compute output properties.
     *
     * @return {boolean} true to stop the propagation (output properties not
     *         changed), false to continue it
     */
    propertiesDidChange(): boolean;
    /**
     * Returns the descriptor of a property, along the prototype chain
     */
    getPropertyDescriptor(propName: string): PropertyDescriptor | undefined;
    /**
     * Returns the names of the declared properties (see Model), [] by default
     */
    getModelProperties(): string[];
    /**
     * Returns the direction of a declared property (see Model), undefined
     * when it is not declared: such a property can be connected both ways.
     */
    getPropertyDirection(propName: string): PropertyDirection | undefined;
    /**
     * Connects an out property of this node, using the default dataflow
     * (see Connector).
     *
     * @example
     * slider.connect('value').to(view, 'rotation');
     *
     * @deprecated use connect() and the property references (Component.$):
     * connect(slider.$.value).to(view.$.rotation)
     * @return {Connector} the connector of the out property
     */
    connect(propertyName: string): Connector;
}

/**
 * A dataflow: a graph of connections between properties of nodes (the
 * components), along which the property values are propagated.
 * See DataFlow, and docs/dataflow.md.
 */
interface IDataFlow {
    /**
     * Propagates the values from a node, along the connections.
     * outputPropagation: true when only the node's out properties changed:
     * its propertiesDidChange() is then not called first.
     */
    propagate(obj: DataflowNode, outputPropagation?: boolean): void;
    /**
     * Connects out properties of src to in properties of trg, through an
     * optional function; returns the id of the connection (edge).
     */
    connect(src: ObjectId | DataflowNode, outDesc: string | string[], trg: ObjectId | DataflowNode, inDesc: string | string[], func?: Function): number;
    /**
     * Removes a connection, by its id or by its nodes and properties.
     */
    disconnect(edgeId: number): void;
    disconnect(src: ObjectId, outDesc: string, trg: ObjectId, inDesc: string): void;
    disconnect(src: DataflowNode, outDesc: string, trg: DataflowNode, inDesc: string): void;
    disconnect(src: ObjectId, outDesc: string[], trg: ObjectId, inDesc: string[]): void;
    disconnect(src: DataflowNode, outDesc: string[], trg: DataflowNode, inDesc: string[]): void;
    /**
     * Starts a chain of connections from properties of a component (see
     * Component.$ and connect())
     */
    from<Sources extends PropertyRef<any>[]>(...sources: Sources): Pipe<ValuesOf<Sources>>;
    /**
     * Compiles the connections; done automatically by the next propagation
     * after connecting or disconnecting
     */
    build(): void;
    /**
     * Pauses the propagation (the pauses add up)
     */
    pausePropagation(): void;
    /**
     * Ends a pause; it does not propagate the changes made during the pause
     */
    restartPropagation(): void;
}
/**
 * The token of the default dataflow, used by connect()/Connector:
 * container.get(DEFAULT_DATAFLOW)
 */
declare const DEFAULT_DATAFLOW: {
    id: Symbol;
    cast: (param: unknown) => IDataFlow;
    toString(): string;
};

/**
 * A reference to a property of a node: what component.$.property gives.
 * T is the type of the property.
 */
declare class PropertyRef<T = unknown> {
    readonly node: DataflowNode;
    readonly name: string;
    constructor(node: DataflowNode, name: string);
    __type?: (value: T) => void;
    /**
     * Connects this property, on the default dataflow: same as
     * connect(this).to(…)
     */
    to<Targets extends RefsOf<[T]>>(...targets: Targets): Pipe<[T]>;
    /**
     * Same as connect(this).map(func)
     */
    map<R>(func: (value: T) => R): Pipe<[R]>;
    /**
     * Same as connect(this).mapAll(func)
     */
    mapAll<R extends unknown[]>(func: (value: T) => R): Pipe<R>;
    toString(): string;
}
/**
 * The type of the value of a property reference
 */
type ValueOf<R> = R extends PropertyRef<infer T> ? T : never;
/**
 * The types of the values of property references
 */
type ValuesOf<Refs extends readonly PropertyRef<any>[]> = {
    [K in keyof Refs]: ValueOf<Refs[K]>;
};
/**
 * Property references accepting values of the given types
 */
type RefsOf<V extends readonly unknown[]> = {
    [K in keyof V]: PropertyRef<V[K]>;
};
/**
 * The property references of a component: component.$
 */
type PropertyRefs<C> = {
    readonly [K in keyof C as K extends '$' ? never : C[K] extends Function ? never : K]: PropertyRef<C[K]>;
};
type Transform = (...values: unknown[]) => unknown[];
/**
 * A chain of connections, created by connect() or DataFlow.from().
 * V is the types of the values it carries.
 *
 * @example
 *  connect(slider.$.value)
 *    .map(value => `${value}°`)
 *    .to(label.$.text);
 */
declare class Pipe<V extends unknown[]> {
    private readonly dataflow;
    private readonly sources;
    private readonly transform;
    private readonly edges;
    /**
     * @private use connect() or DataFlow.from()
     */
    constructor(dataflow: IDataFlow, sources: PropertyRef<unknown>[], transform: Transform | undefined, edges: number[]);
    /**
     *  Maps the values to one value
     *
     * @param {Function} func called with the values, returns the new value
     */
    map<R>(func: (...values: V) => R): Pipe<[R]>;
    /**
     *  Maps the values to several values
     *
     * @param {Function} func called with the values, returns the new values
     */
    mapAll<R extends unknown[]>(func: (...values: V) => R): Pipe<R>;
    /**
     *  Connects the values to properties of a node, one value per property,
     *  and returns a pipe from these properties, to chain the connections.
     *  Throws if the properties are not of the same node, or for any reason
     *  DataFlow.connect throws (e.g. an unknown property, or different numbers
     *  of values and properties without map).
     *
     * @param {PropertyRef} targets the properties to connect to
     * @return {Pipe} a pipe from the target properties
     */
    to<Targets extends RefsOf<V>>(...targets: Targets): Pipe<V>;
    /**
     *  Removes all the connections of the chain (the ones created by its
     *  to() calls).
     */
    disconnect(): void;
}
/**
 *  Starts a chain of connections from properties of a component, on the
 *  default dataflow (see DataFlow.from for another dataflow).
 *
 *  @example
 *  connect(slider.$.value).to(view.$.rotation);
 *  connect(slider.$.value).map(v => `${v}°`).to(label.$.text);
 *  connect(a.$.x).to(b.$.x).to(c.$.x);                  // a.x -> b.x -> c.x
 *  connect(p.$.x, p.$.y).map((x, y) => Math.hypot(x, y)).to(q.$.distance);
 *
 * @param {PropertyRef} sources the properties to connect from
 * @return {Pipe} the pipe from these properties
 */
declare function connect<Sources extends PropertyRef<any>[]>(...sources: Sources): Pipe<ValuesOf<Sources>>;

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
    /**
     * The living components, by id (read only).
     * A component leaves it when it is destroyed, or garbage collected.
     */
    static get instances(): ReadonlyMap<ObjectId, Component>;
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
    /**
     *  Returns true once init() has initialized the component (even if
     *  componentDidInitialize() then failed), until it is deleted.
     */
    isInitialized(): boolean;
    protected initComponent(): void;
    protected componentDidInitialize(): void;
    /**
     *  Destroys the component: releases its resources (e.g. its event
     *  bindings, as source and as observer) and frees its id.
     *  Calling it again does nothing.
     *  <p>
     *  Subclasses release their own resources by overriding destructor().
     */
    destroy(): void;
    /**
     *  Releases the component resources. Called once, by destroy().
     *  When overriding it, call super.destructor().
     */
    protected destructor(): void;
    /**
     *  The references to the properties of the component, to connect them in
     *  the dataflow (see connect()).
     *
     *  @example
     *  connect(slider.$.value).to(view.$.rotation);
     */
    get $(): PropertyRefs<this>;
    isDeleted(): boolean;
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  Called by JSON.stringify(), so that a component (alone or nested in
     *  other data) is serialized as the object returned by serialize().
     *
     * @return {Object} the object value for stringify
     */
    toJSON(): any;
    /**
     *  Returns the JSON string of the component.<p/>
     *  This can be used for persistence; the reverse operation is parseJSON().
     *
     * @return {String} the JSON string
     */
    stringify(): string;
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
interface Component extends BaseIdentifiable, EventSource, DataflowNode {
}

type HandlerFunction = string | Function;

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
    protected initMixin(): void;
    /**
     *  Releases the bindings of this object: the ones of its events (as
     *  source), and the ones on the events of other sources (as observer).
     */
    protected releaseMixin(): void;
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
    unbind(spec: string, obj: Component, func?: HandlerFunction): void;
    /**
     *  Dispatches an Event at the specified EventSource, invoking the affected
     *  EventListeners in the appropriate order.
     *  <p>
     *  When this source has no handler for the event, the event bubbles up to
     *  its parent Container (if it is an EventSource), and so on. The event src
     *  stays this source.
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
    get data(): any | undefined;
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
    /**
     * Returns a function calling the handler callback with the event, as it
     * is now: later changes of the handler (release, reuse) do not affect it.
     * A callback given by name is looked up on the object when called.
     * Nothing is called when the object was deleted meanwhile (the event
     * is delivered asynchronously).
     */
    toListener(): (event: Event) => void;
    static retain(): Handler;
    static release(handler: Handler): void;
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
    taskDidResume?: (task: Task) => void;
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
 * The events emitted by a task (see Task#on)
 */
type TaskEvent = 'start' | 'pause' | 'resume' | 'stop' | 'end';
type TaskListener = (task: Task) => void;
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
     *  Adds a listener called (synchronously) each time the task emits the
     *  event, right after its delegate. A listener is added only once per
     *  event.
     *
     *  @example
     *  const unsubscribe = task.on('end', () => console.log('done'));
     *  unsubscribe();
     *
     * @name core.Task#on
     * @function
     *
     * @param {TaskEvent} event 'start' | 'pause' | 'resume' | 'stop' | 'end'
     * @param {TaskListener} listener called with the task
     * @return {Function} a function removing the listener
     */
    on(event: TaskEvent, listener: TaskListener): () => void;
    /**
     *  Same as on(), but the listener is removed after its first call.
     *
     * @name core.Task#once
     * @function
     *
     * @param {TaskEvent} event 'start' | 'pause' | 'resume' | 'stop' | 'end'
     * @param {TaskListener} listener called with the task
     * @return {Function} a function removing the listener
     */
    once(event: TaskEvent, listener: TaskListener): () => void;
    /**
     *  Removes a listener added with on() or once().
     *  Without listener, removes all the listeners of the event.
     *
     * @name core.Task#off
     * @function
     *
     * @param {TaskEvent} event 'start' | 'pause' | 'resume' | 'stop' | 'end'
     * @param {TaskListener} listener the listener to remove [optional]
     */
    off(event: TaskEvent, listener?: TaskListener): void;
    /**
     *  Starts the task from its beginning.<br />
     *  The task must be stopped: never started, ended or stopped. Starting a
     *  started or paused task throws an Error (use resume() for a paused
     *  task).<br />
     *  Returns a promise resolved when this run finishes, with 'ended' when the
     *  task reached its end or 'stopped' when it was stopped before. It stays
     *  pending while the task is paused.
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
     *  Implements the task start, from its beginning.
     *  Called by start() when the task is stopped.
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
    /**
     *  Resumes a paused task.<br />
     *  When the task is resumed, it calls the TaskDelegate.taskDidResume
     *  if it declared. The promise returned by start() keeps tracking the run.
     *
     * @name core.Task#resume
     * @function
     * @return {boolean} false if the task was not paused
     */
    abstract resume(): boolean;
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
    abstract taskDidResume(task: Task): void;
    /**
     *  Throws if one of the group tasks is running, since it could not be
     *  started by the group.
     *  @protected
     */
    protected checkTasksStopped(): void;
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
     *  Resumes the paused task of the sequence
     */
    resume(): boolean;
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
     *  The paused task was resumed by someone else than this sequence
     */
    taskDidResume(task: Task): void;
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
     *  Resumes the tasks which have not ended yet
     */
    resume(): boolean;
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
     *  A task was resumed by someone else than this group: nothing to do,
     *  the group only tracks the end of its tasks.
     */
    taskDidResume(_task: Task): void;
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
     *  Resumes the task for the time left
     */
    resume(): boolean;
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
type index_d_TaskEvent = TaskEvent;
type index_d_TaskListener = TaskListener;
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
  export type { index_d_TaskAndParams as TaskAndParams, index_d_TaskDelegate as TaskDelegate, index_d_TaskEvent as TaskEvent, index_d_TaskListener as TaskListener, index_d_TaskOptions as TaskOptions, index_d_TaskParam as TaskParam, index_d_TaskResult as TaskResult };
}

/**
 *  The Dataflow class
 *
 *  @class
 *  A dataflow connects properties of nodes (every Component is a node), and
 *  propagates their values along the connections:
 *  <ol>
 *    <li />connect() the out properties of a node to in properties of
 *      another one, possibly through a function;
 *    <li />build() the dataflow: it sorts the nodes (topologically) and
 *      compiles the connections;
 *    <li />propagate() from a node whose properties changed: the values are
 *      copied along the connections, and each reached node gets its
 *      propertiesDidChange() called, in the sorted order.
 *  </ol>
 *  The properties are accessors (getter for an out property, setter for an
 *  in property). The Model properties propagate when they change; for the
 *  other components, call propagate().
 *  <p>
 *  A default dataflow is given by container.get(DEFAULT_DATAFLOW); it is the
 *  one used by the connect() method of the components (see Connector).
 *  See docs/dataflow.md.
 *
 *  @example
 *  const df = new DataFlow();
 *  df.connect(slider, 'value', view, 'rotation');
 *  df.connect(slider, 'value', label, 'text', (value) => `${value}°`);
 *  df.build();
 *
 *  slider.value = 45;
 *  df.propagate(slider);
 *
 *  @author David Thevenin
 */
declare class DataFlow implements IDataFlow {
    #private;
    private static propagationCount;
    private get logger();
    private propagateValues;
    /**
     *  Propagates the values from a node along the connections, then from each
     *  reached node, in the sorted order: each reached node gets its
     *  propertiesDidChange() called, before its values are propagated (unless
     *  it returns true).<br />
     *  Does nothing while paused, or when called during a propagation (a node
     *  setting a property during the propagation).
     *
     * @param {DataflowNode} obj the node whose properties changed
     * @param {Boolean} outputPropagation true when only the out properties of
     *        the node changed: its propertiesDidChange() is not called first.
     *        False by default: its in properties changed.
     */
    propagate(obj: DataflowNode, outputPropagation?: boolean): void;
    /**
     *  Connects out properties of the source to in properties of the target.
     *  The nodes take part in this dataflow (see DataflowState).<br />
     *  Without function, the values are copied one by one: there must be as
     *  many out as in properties. With a function, it is called with the out
     *  values and returns the in values: an array, or a single value for one
     *  in property; the numbers of properties may differ.<br />
     *  Throws for an unknown node or property, an in property of the source
     *  or an out property of the target (see Model), or different numbers of
     *  properties without function.<br />
     *  Call build() once the connections are done, before propagating.
     *
     *  @example
     *  df.connect(a, 'value', b, 'value');
     *  df.connect(a, ['x', 'y'], b, 'distance', (x, y) => Math.hypot(x, y));
     *
     * @param {ObjectId|DataflowNode} src the source node, or its id
     * @param {String|Array} outDesc the out property(ies) of the source
     * @param {ObjectId|DataflowNode} trg the target node, or its id
     * @param {String|Array} inDesc the in property(ies) of the target
     * @param {Function} func maps the out values to the in values [optional]
     * @return {number} the id of the connection (see disconnect)
     */
    connect(src: ObjectId | DataflowNode, outDesc: string | string[], trg: ObjectId | DataflowNode, inDesc: string | string[], func?: Function): number;
    /**
     *  Removes a connection, by its id, or by its nodes and properties: the
     *  given properties are removed from the connections between the two
     *  nodes, and a connection left without out or in property is removed.
     *  Nothing happens for a connection which does not exist; throws for an
     *  unknown node.<br />
     *  Call build() once the changes are done, before propagating.
     *
     *  @example
     *  const id = df.connect(a, 'value', b, 'value');
     *  df.disconnect(id);
     *  // or
     *  df.disconnect(a, 'value', b, 'value');
     *
     * @param {Number|ObjectId|DataflowNode} edgeId the id returned by connect,
     *        or the source node (or its id)
     * @param {String|Array} outDesc the out property(ies) of the source
     * @param {ObjectId|DataflowNode} trg the target node, or its id
     * @param {String|Array} inDesc the in property(ies) of the target
     */
    disconnect(edgeId: number): void;
    disconnect(src: ObjectId, outDesc: string, trg: ObjectId, inDesc: string): void;
    disconnect(src: DataflowNode, outDesc: string, trg: DataflowNode, inDesc: string): void;
    disconnect(src: ObjectId, outDesc: string[], trg: ObjectId, inDesc: string[]): void;
    disconnect(src: DataflowNode, outDesc: string[], trg: DataflowNode, inDesc: string[]): void;
    /**
     * Removes connections by their nodes and properties (see disconnect)
     *
     * @protected
     * @param {DataflowNode} srcObj the source node
     * @param {Array} propertiesOut the out properties of the source
     * @param {DataflowNode} trgObj the target node
     * @param {Array} propertiesIn the in properties of the target
     */
    protected disconnectByParams(srcObj: DataflowNode, propertiesOut: string[], trgObj: DataflowNode, propertiesIn: string[]): void;
    /**
     * Removes a connection by its id (see disconnect)
     *
     * @protected
     * @param {Number} edgeId the id returned by connect
     */
    protected disconnectById(edgeId: number): void;
    /**
     * Sorts the nodes topologically, for the propagation order (see build).<p>
     * Returns true if the graph is acyclic, false otherwise. When the graph is
     * cyclic, the nodes are partially ordered, and a warning is logged.
     *
     * @protected
     * @return {boolean} true if the graph is acyclic
     */
    protected sort(): boolean;
    /**
     *  Starts a chain of connections from properties of a component, on this
     *  dataflow (see connect() for the default dataflow).
     *
     *  @example
     *  df.from(slider.$.value).map(v => `${v}°`).to(label.$.text);
     *
     * @param {PropertyRef} sources the properties to connect from
     * @return {Pipe} the pipe from these properties
     */
    from<Sources extends PropertyRef<any>[]>(...sources: Sources): Pipe<ValuesOf<Sources>>;
    /**
     *  Compiles the dataflow: sorts the nodes and compiles the connections.
     *  It is done automatically by the next propagation after connecting or
     *  disconnecting; calling it explicitly compiles the dataflow at once.
     *  The destroyed components and their connections are forgotten.
     */
    build(): void;
    /**
     *  Pauses the propagation: propagate() does nothing until
     *  restartPropagation() is called as many times.
     */
    pausePropagation(): void;
    /**
     *  Ends a pause (see pausePropagation). It does not propagate the changes
     *  made during the pause: call propagate() for that.
     */
    restartPropagation(): void;
    /**
     * Compiles the connections: resolves the nodes, and the getters and
     * setters of the connected properties
     */
    private optimize;
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
/**
 * Logger writing to the console, used when no LOGGER is registered
 */
declare const consoleLogger: ILogger;

/**
 * A model property decorator: on an auto-accessor, or on a setter
 */
interface PropertyDecorator {
    <This extends Model<any>, V>(target: ClassAccessorDecoratorTarget<This, V>, context: ClassAccessorDecoratorContext<This, V>): ClassAccessorDecoratorResult<This, V>;
    <This extends Model<any>, V>(target: (this: This, value: V) => void, context: ClassSetterDecoratorContext<This, V>): (this: This, value: V) => void;
}
/**
 * Declares an in model property: it can be connected to, not from.
 * On an auto-accessor, or on a setter (with side effects):
 * @example
 *  @In accessor query = '';
 *  @In set size(v: number[]) { … }
 */
declare const In: PropertyDecorator;
/**
 * Declares an out model property: it can be connected from, not to.
 * @example
 *  @Out accessor count = 0;
 */
declare const Out: PropertyDecorator;
/**
 * Declares an in/out model property: it can be connected both ways.
 * @example
 *  @InOut accessor done = false;
 */
declare const InOut: PropertyDecorator;
/**
 * Listener of the 'change' event: called with the model and the names of
 * the changed properties.
 */
type ChangeListener<M extends Model<any> = Model> = (model: M, properties: string[]) => void;
/**
 * Listener of the 'change:<property>' events: called with the model and the
 * name of the changed property.
 */
type PropertyChangeListener<M extends Model<any> = Model> = (model: M, property: string) => void;
type ModelEvent = 'change' | `change:${string}`;
/**
 * The events of a model subclass: the name of each event, with the
 * arguments its listeners get after the model.
 * @example
 *  class Button extends View<{ select: [] }> { … }
 *  button.on('select', (button) => { … });
 */
type ModelEvents = Record<string, unknown[]>;
/**
 * Listener of an event of a model subclass (see ModelEvents)
 */
type EventListener<M, Args extends unknown[]> = (model: M, ...args: Args) => void;
/**
 * The core.Model class
 *
 * @extends core.Component
 * @class
 * A Model holds data as declared properties, and notifies their changes.
 * <p>
 * Model properties are declared with the In, Out or InOut decorators on
 * accessors. Setting a property to a different value:
 * <ul>
 *  <li>emits the 'change:<property>' event, then the 'change' event, to the
 *    listeners (see on), synchronously;
 *  <li>propagates the change through the dataflows the model is connected
 *    to.
 * </ul>
 * batch() groups several changes into one notification.
 * <p>
 * The model properties are serialized with the component (see stringify and
 * parseJSON).
 *
 * @example
 *  class TodoModel extends Model {
 *    @Out accessor date = new Date();
 *    @InOut accessor done = false;
 *    @InOut accessor content = '';
 *  }
 *
 *  const todo = new TodoModel();
 *  todo.on('change:done', (model) => { … });
 *  todo.on('change', (model, properties) => { … });
 *
 *  todo.done = true;   // 'change:done', then 'change' with ['done']
 *
 *  todo.batch(() => {  // 'change:done', 'change:content', then one 'change'
 *    todo.done = false;
 *    todo.content = 'Something to do';
 *  });
 *  // or
 *  todo.assign({ done: false, content: 'Something to do' });
 *
 *  // dataflow
 *  connect(todo.$.done).to(checkbox.$.checked);
 *
 * @author David Thevenin
 *
 * @constructor
 *  Main constructor
 *
 * @name core.Model
 *
 * @param {ObjectId} id the model id [optional]
 */
declare class Model<Events extends ModelEvents = {}> extends Component {
    #private;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The names of the declared model properties, in declaration order
     */
    get modelProperties(): string[];
    /**
     * @see modelProperties (used by the dataflow)
     */
    getModelProperties(): string[];
    /**
     * The direction of a declared model property, undefined for another one
     */
    getPropertyDirection(propName: string): PropertyDirection | undefined;
    /**
     *  Sets several model properties, with one notification (see batch).
     *  Throws, without changing the model, for a name which is not a model
     *  property.
     *
     * @param {Object} values the values, by property name
     */
    assign(values: Partial<Record<string, unknown>>): void;
    /*****************************************************************
     *  Change notification
     ****************************************************************/
    /**
     *  Notifies the change of a property: the model properties do it when
     *  they are set to a different value. Call it after changing a value in
     *  place (e.g. adding an item to an array property).
     *
     * @param {string} property the name of the changed property
     */
    propertyChange(property: string): void;
    /**
     *  Runs the function, and notifies the properties it changed once it
     *  returns (or throws): each 'change:<property>' event once, then one
     *  'change' event, then the dataflow propagation. Batches can be nested.
     *
     * @param {Function} func the function changing the model
     * @return the result of the function
     */
    batch<T>(func: () => T): T;
    /*****************************************************************
     *  Events
     ****************************************************************/
    /**
     *  Adds a listener called (synchronously) on each change: 'change' for
     *  any change, 'change:<property>' for the changes of a property; or on
     *  an event of the subclass (see ModelEvents and emit).
     *  A listener is added only once per event.
     *
     * @return {Function} a function removing the listener
     */
    on(event: 'change', listener: ChangeListener<this>): () => void;
    on(event: `change:${string}`, listener: PropertyChangeListener<this>): () => void;
    on<K extends keyof Events & string>(event: K, listener: EventListener<this, Events[K]>): () => void;
    /**
     *  Same as on(), but the listener is removed after its first call.
     *
     * @return {Function} a function removing the listener
     */
    once(event: 'change', listener: ChangeListener<this>): () => void;
    once(event: `change:${string}`, listener: PropertyChangeListener<this>): () => void;
    once<K extends keyof Events & string>(event: K, listener: EventListener<this, Events[K]>): () => void;
    /**
     *  Removes a listener added with on() or once(). Without listener,
     *  removes all the listeners of the event.
     */
    off(event: ModelEvent | (keyof Events & string), listener?: Function): void;
    /**
     *  Emits an event of the subclass to its listeners (see on), synchronously.
     *  An exception thrown by a listener is logged.
     *
     * @param {string} event the event
     * @param {...any} args the arguments given to the listeners, after the model
     */
    protected emit<K extends keyof Events & string>(event: K, ...args: Events[K]): void;
    /*****************************************************************
     *  Life cycle and serialization
     ****************************************************************/
    protected destructor(): void;
    /**
     *  Serializes the id and the model properties
     */
    protected serialize(): any;
    /**
     *  Sets the model properties present in the data (see assign); the other
     *  data (e.g. the id) is ignored.
     */
    protected deserialize(data: any): void;
}

interface Arc {
    to: string;
    on: string;
    output: string;
}
interface Transition extends Arc {
    from: string;
}
/**
 *  The Fsm class
 *
 *  @extends core.Component
 *  @class
 *  Fsm defines a deterministic Finite-State-Machine (aka Finite-State
 *  Automaton), such as:
 *  <ul>
 *    <li />there is only one initial state;
 *    <li />there is no transition conditioned on a null input: every
 *      transition has an input;
 *    <li />there is only one transition for a given input and a given state.
 *  </ul>
 *
 *  A fsm is specified by:
 *  <ul>
 *    <li />Q, the set of states;
 *    <li />I, the input alphabet: the words that make the fsm cross a
 *      transition;
 *    <li />O, the output alphabet: the words produced when a transition is
 *      crossed;
 *    <li />E, the transitions: (from state, input, to state, optional output);
 *    <li />an initial state.
 *  </ul>
 *  States, inputs and outputs are declared before being used: using an
 *  unknown one throws.
 *
 *  activate() puts the fsm in its initial state (see currentState). Then the
 *  fsm crosses the transition of its current state for each input it
 *  receives, and ignores the inputs without transition. activate() again goes
 *  back to the initial state.<br /><br />
 *
 *  Inputs are received:
 *  <ul>
 *    <li />from events, by associating an event of a source to an input with
 *      setInput();
 *    <li />or by calling fsmNotify(input, data).
 *  </ul>
 *
 *  Outputs are associated to transitions (Mealy machine). When a transition
 *  with an output is crossed, the fsm:
 *  <ul>
 *    <li />calls the action associated to the output with setOutput(), with
 *      the fsm owner as this;
 *    <li />then dispatches an event named after the output, with the data of
 *      the input; bind it or listen to it on the fsm.
 *  </ul>
 *  Known limitation: only one output can be produced when crossing a
 *  transition.
 *
 *  @example
 *  const fsm = new Fsm(owner);
 *  // states, inputs and outputs declaration
 *  fsm.addState('1');
 *  fsm.addState('2');
 *  fsm.addInput('a');
 *  fsm.addInput('b');
 *  fsm.addOutput('c');
 *  fsm.addOutput('d');
 *  // transitions declaration: 1 -a/c-> 2 -b/d-> 1
 *  fsm.addTransition('1', '2', 'a', 'c');
 *  fsm.addTransition('2', '1', 'b', 'd');
 *  // initial state declaration
 *  fsm.initialState = '1';
 *
 *  // "a" is received when the button emits 'select'
 *  fsm.setInput('a', aButton, 'select');
 *  // owner.onSelect is called when crossing a transition with the output "c"
 *  fsm.setOutput('c', 'onSelect');
 *  // the fsm also dispatches the event "d"
 *  fsm.addEventListener('d', (event) => { … });
 *
 *  // activate the FSM: it is in the state "1"
 *  fsm.activate();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new core.Fsm.
 *
 * @param {core.Component} owner the component using this fsm: the output
 *        actions are called with it as this [mandatory]
 */
declare class Fsm extends Component {
    #private;
    private readonly owner;
    constructor(owner: Component);
    /**
     *  The initial state, used by activate(); '' for none.
     *  Setting an unknown state throws.
     *
     *  @name core.Fsm#initialState
     *  @param {string} stateId the state
     */
    set initialState(stateId: string);
    /**
     * @ignore
     */
    get initialState(): string;
    /**
     *  The current state (read only): '' until the fsm is activated, or when
     *  the current state is removed or the fsm is cleared.
     *
     *  @name core.Fsm#currentState
     */
    get currentState(): string;
    /**
     *  Declares the states, inputs, outputs and transitions of the fsm.
     *  Throws, without changing the fsm, if:
     *  <ul>
     *    <li />a list is missing;
     *    <li />a state is empty, listed twice or already declared;
     *    <li />an input or an output is empty;
     *    <li />a transition uses a state, an input or an output which is
     *      neither declared nor listed.
     *  </ul>
     *  Inputs and outputs already declared, or listed twice, are accepted.
     *
     *  @example
     *  // 1 -a/x-> 2 -b-> 1
     *  fsm.initWithData(['1', '2'], ['a', 'b'], ['x'], [
     *    { from: '1', to: '2', on: 'a', output: 'x' },
     *    { from: '2', to: '1', on: 'b', output: '' },
     *  ]);
     *
     * @param {Array<string>} states the states
     * @param {Array<string>} inputs the inputs
     * @param {Array<string>} outputs the outputs
     * @param {Array<Transition>} transitions the transitions {from, to, on, output}
     */
    initWithData(states: string[], inputs: string[], outputs: string[], transitions: Transition[]): void;
    /**
     *  Declares the fsm from a state x state matrix:
     *  <ul>
     *    <li />the first row lists the "to" states, and declares them;
     *    <li />the first column lists the "from" states, which must be in the
     *      first row;
     *    <li />each other cell is empty (no transition), or the transition from
     *      the state of its row to the state of its column, as "input",
     *      "input/" or "input/output". Its input and output are declared.
     *  </ul>
     *  Throws, without changing the fsm, if the first row is missing, if a
     *  cell has no input (e.g. "/o"), if a state is twice in the first row or
     *  the first column, or for any reason initWithData() throws (e.g. a row's
     *  state which is not in the first row).
     *
     *  @example
     *  // 1 -a-> 2 -b/x-> 3 -c-> 1
     *  fsm.initWithMatrix([
     *    ['',  '1',  '2',  '3'  ],
     *    ['1', '',   'a',  ''   ],
     *    ['2', '',   '',   'b/x'],
     *    ['3', 'c/', '',   ''   ],
     *  ]);
     *
     * @param {Array<Array<string>>} matrix
     */
    initWithMatrix(matrix: string[][]): void;
    /*******************************************
     Managing inputs
     *******************************************/
    /**
     *  Declares an input (a word of the input alphabet).
     *  Declaring it again does nothing; an empty input throws.
     *
     * @param {string} input the input
     */
    addInput(input: string): void;
    /**
     *  Returns the declared inputs
     *
     * @return {Iterator<string>} the inputs
     */
    getInputs(): IterableIterator<string>;
    /**
     *  Tests if an input is declared
     *
     * @param {string} input the input
     * @return {boolean} true if it is declared
     */
    existInput(input: string): boolean;
    /*******************************************
     Managing outputs
     *******************************************/
    /**
     *  Declares an output (a word of the output alphabet).
     *  Declaring it again does nothing; an empty output throws.
     *
     * @param {string} output the output
     */
    addOutput(output: string): void;
    /**
     *  Returns the declared outputs
     *
     * @return {Iterator<string>} the outputs
     */
    getOutputs(): IterableIterator<string>;
    /**
     *  Tests if an output is declared
     *
     * @param {string} output the output
     * @return {boolean} true if it is declared
     */
    existOutput(output: string): boolean;
    /*******************************************
     Managing States
     *******************************************/
    /**
     *  Declares a state
     *
     * @param {string} name the state name
     * @return {boolean} false if the name is empty or the state already exists
     */
    addState(name: string): boolean;
    /**
     *  Removes a state, and the transitions to it.
     *  The initial and current states become '' if they were the removed state.
     *
     * @param {string} name the state name
     * @return {boolean} false if the state does not exist
     */
    removeState(name: string): boolean;
    /**
     *  Renames a state. The transitions to it, and the initial and current
     *  states, follow.
     *
     * @param {string} oldName the old state name
     * @param {string} newName the new state name
     * @return {boolean} false if the old state does not exist or the new one
     *         already exists
     */
    renameState(oldName: string, newName: string): boolean;
    /**
     *  Returns the names of the states
     *
     * @return {Iterator<string>} the states
     */
    getListState(): IterableIterator<string>;
    /**
     *  Tests if a state is declared
     *
     * @param {string} state the state
     * @return {boolean} true if it is declared
     */
    existState(state: string): boolean;
    /**
     *  Adds the transition from the state "from" to the state "to", on the
     *  input "on". It replaces the transition of "from" on "on", if any.
     *  The states, the input and the output (if any) must be declared,
     *  otherwise it throws.
     *
     * @param {string} from the state the transition starts from
     * @param {string} to the state the transition goes to
     * @param {string} on the input crossing the transition
     * @param {string} output the output produced when crossing it [optional]
     */
    addTransition(from: string, to: string, on: string, output?: string): void;
    /**
     *  Removes the transition of the state "from" on the input "on" (nothing
     *  happens if there is none). Throws for an unknown state or input.
     *
     * @param {string} from the state the transition starts from
     * @param {string} on the input of the transition
     */
    removeTransitionFrom(from: string, on: string): void;
    /**
     *  Removes the transitions to the state "to" on the input "on", from every
     *  state (nothing happens if there is none). Throws for an unknown state
     *  or input.
     *
     * @param {string} to the state the transitions go to
     * @param {string} on the input of the transitions
     */
    removeTransitionTo(to: string, on: string): void;
    /**
     *  Returns the transitions to a state (copies), [] for an unknown state
     *
     * @param {string} to the state
     * @return {Array<Transition>} the transitions
     */
    getTransitionsToState(to: string): Transition[];
    /**
     *  Returns the transitions from a state (copies), [] for an unknown state
     *
     * @param {string} from the state
     * @return {Array<Transition>} the transitions
     */
    getTransitionsFromState(from: string): Transition[];
    /**
     *  Switches the names of two states: each state keeps its transitions, and
     *  the transitions to the two states, the initial and the current states
     *  follow. Throws for an unknown state; does nothing for the same state.
     *
     * @param {string} stateId1 a state
     * @param {string} stateId2 another state
     */
    switchStates(stateId1: string, stateId2: string): void;
    /*******************************************
     Inputs and outputs binding
     *******************************************/
    /**
     *  Associates an event of a source to an input: each time the source
     *  dispatches the event, the fsm receives the input (see fsmNotify), with
     *  the event data.<br />
     *  Several inputs can be associated to the same event: they are received
     *  in the order of association. Associating the same input and event again
     *  does nothing.<br />
     *  Throws for an unknown input, a source which is not an EventSource or an
     *  empty event specification.
     *
     * @param {string} on the input
     * @param {core.EventSource} src the source of the event
     * @param {string} eventSpec the event specification, e.g. 'select'
     */
    setInput(on: string, src: EventSource, eventSpec: string): void;
    /**
     *  Associates an action to an output: it is called each time the fsm
     *  crosses a transition producing this output, with the fsm owner as this
     *  and the input event (type: the input, src: the fsm) as parameter.
     *  The action may keep the event.<br />
     *  It replaces the previous action of the output. Throws for an unknown
     *  output, or an action which is not a function or a method name.
     *
     * @param {string} output the output
     * @param {Function|string} action a function, or the name of a method of
     *        the fsm owner
     */
    setOutput(output: string, action: string | Function): void;
    /**
     *  Removes the association of an event of a source to an input (see
     *  setInput); the source event is unbound once no input uses it.
     *  Nothing happens if there is no such association. Throws for an unknown
     *  input.
     *
     * @param {string} on the input
     * @param {core.EventSource} src the source of the event
     * @param {string} eventSpec the event specification
     */
    unsetInput(on: string, src: EventSource, eventSpec: string): void;
    /**
     *  Removes the action of an output (see setOutput); the output event is
     *  still dispatched. Nothing happens if the output has no action. Throws
     *  for an unknown output.
     *
     * @param {string} output the output
     */
    unsetOutput(output: string): void;
    /*******************************************
     Running
     *******************************************/
    /**
     *  Activates the fsm: its current state becomes the initial state (also
     *  when it is already activated). No output is produced.
     *
     * @return {boolean} false if there is no initial state
     */
    activate(): boolean;
    /**
     *  Goes to a state, and produces the output: calls its action, then
     *  dispatches the output event.<br />
     *  Used by the fsm to cross a transition (and by activate()).
     *  @protected
     *
     * @param {string} stateId the state to go to
     * @param {string} output the output to produce [optional]
     * @param {Event} event the input event, given to the action [optional]
     * @return {boolean} false if the state does not exist
     */
    protected goTo(stateId: string, output?: string, event?: Event): boolean;
    /**
     *  Clears the fsm: removes the states, inputs, outputs, transitions, the
     *  initial and current states, the output actions and the input bindings
     *  (the sources events are unbound).
     */
    clear(): void;
    /**
     *  Receives the events bound by setInput(), and notifies their inputs
     *  @private
     *
     * @param {Event} event the event
     */
    private readonly handleEvent;
    /**
     *  Returns the name of the state the fsm would go to on the input, from
     *  its current state; undefined if there is no such transition or the fsm
     *  is not activated.
     *
     * @param {string} on the input
     * @return {string} the state
     */
    getAccessibleStateOn(on: string): string | undefined;
    /**
     *  Sends an input to the fsm: crosses the transition of the current state
     *  on this input, if any, and produces its output (see setOutput).
     *
     * @param {string} on the input
     * @param {any} data the data of the input, given to the output action
     *        (in the event) and to the output event
     * @return {boolean} true if a transition was crossed
     */
    fsmNotify(on: string, data: any): boolean;
}

export { Component, Connector, DEFAULT_DATAFLOW, DataFlow, Fsm, In, InOut, LOGGER, Model, Out, Pipe, PropertyRef, connect, consoleLogger, index_d$1 as event, index_d as task };
export type { ChangeListener, DataflowNode, EventListener, IDataFlow, ILogger, InitFunction, ModelEvent, ModelEvents, PropertyChangeListener, PropertyDirection, PropertyRefs, RefsOf, Transition, ValueOf, ValuesOf };
