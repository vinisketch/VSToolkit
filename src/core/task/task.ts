import { asError } from "vs_utils";
import Component from "../Component";
import { TaskState } from "./taskState";
import { TaskDelegate } from "./taskDelegate";

/**
 * The parameter given to a task when it starts (scalar, Array, Object)
 */
export type TaskParam = unknown;

export type TaskAndParams = [Task, TaskParam] | Task;

/**
 * How a task run finished: 'ended' when the task reached its end,
 * 'stopped' when it was stopped before (by stop() or the task abort signal).
 */
export type TaskResult = 'ended' | 'stopped';

export interface TaskOptions {
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
export type TaskEvent = 'start' | 'pause' | 'resume' | 'stop' | 'end';

export type TaskListener = (task: Task) => void;

const EVENT_OF: Record<keyof TaskDelegate, TaskEvent> = {
  taskDidStart: 'start',
  taskDidPause: 'pause',
  taskDidResume: 'resume',
  taskDidStop: 'stop',
  taskDidEnd: 'end',
};

interface ListenerEntry {
  listener: TaskListener;
  once: boolean;
}

interface TaskRun {
  promise: Promise<TaskResult>;
  resolve: (result: TaskResult) => void;
}

/**
 * Groups (SEQ, PAR) each task belongs to. Groups are notified of the task
 * state changes without taking the task's delegate.
 * Internal: not exported from the task module index.
 */
const taskGroups = new WeakMap<Task, Set<TaskDelegate>>();

export function attachToGroup(task: Task, group: TaskDelegate): void {
  let groups = taskGroups.get(task);
  if (!groups) {
    groups = new Set();
    taskGroups.set(task, groups);
  }
  groups.add(group);
}

export function detachFromGroup(task: Task, group: TaskDelegate): void {
  taskGroups.get(task)?.delete(group);
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
export default abstract class Task extends Component {
  constructor({ delegate, signal }: TaskOptions = {}) {
    super();
    this.delegate = delegate;

    if (signal) {
      this.#signal = signal;
      signal.addEventListener('abort', this.#onAbort, { once: true });
    }
  }

  /**
   *  @private
   */
  readonly #signal: AbortSignal | undefined;

  /**
   *  @private
   */
  readonly #onAbort = (): void => { this.stop(); };

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

  /********************************************************************
   States
   ********************************************************************/
  /**
   *	@private
   */
  #state: TaskState = TaskState.STOPPED;

  /**
   *  Return the task State. <br />
   *  Possible values: {@link core.Task.STARTED},
   *  {@link core.Task.STOPPED},
   *  {@link core.Task.PAUSED}
   */
  get state(): TaskState {
    return this.#state;
  }

  protected set state(state: TaskState) {
    this.#state = state;
  }

  /********************************************************************

   ********************************************************************/

  /**
   *  Default task destructor
   *
   * @name core.Task#destructor
   * @function
   */
  protected override destructor() {
    this.#signal?.removeEventListener('abort', this.#onAbort);
    this.stop ();
    this.#listeners.clear();
    super.destructor();
  }

  /**
   *  Notifies the task's delegate and groups of a state change.
   *  An exception thrown by a callback is logged and does not propagate.
   *
   * @name core.Task#notify
   * @function
   * @protected
   */
  protected notify(method: keyof TaskDelegate): void {
    // settle the start() promise before the callbacks, so a callback
    // restarting the task gets a new one
    if (method === 'taskDidEnd') this.#settleRun('ended');
    else if (method === 'taskDidStop') this.#settleRun('stopped');

    // 1) the delegate
    const delegateCallback = this.delegate?.[method];
    if (delegateCallback) this.#safeCall(delegateCallback, this.delegate);

    // 2) the event listeners
    this.#emit(EVENT_OF[method]);

    // 3) the groups of the task
    for (const group of taskGroups.get(this) ?? []) {
      const callback = group[method];
      if (callback) this.#safeCall(callback, group);
    }
  }

  /**
   *  Calls a listener, logging an exception instead of propagating it
   *  @private
   */
  #safeCall(callback: (task: Task) => void, thisArg: unknown): void {
    try {
      callback.call(thisArg, this);
    } catch (e) {
      const err = asError(e);
      if (err.stack) console.log(err.stack)
      console.error(err);
    }
  }

  /********************************************************************
   Events
   ********************************************************************/

  /**
   *  @private
   */
  readonly #listeners = new Map<TaskEvent, ListenerEntry[]>();

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
  on(event: TaskEvent, listener: TaskListener): () => void {
    return this.#addListener(event, listener, false);
  }

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
  once(event: TaskEvent, listener: TaskListener): () => void {
    return this.#addListener(event, listener, true);
  }

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
  off(event: TaskEvent, listener?: TaskListener): void {
    if (!listener) {
      this.#listeners.delete(event);
      return;
    }
    const entries = this.#listeners.get(event);
    const index = entries?.findIndex(entry => entry.listener === listener) ?? -1;
    if (index !== -1) entries!.splice(index, 1);
  }

  #addListener(event: TaskEvent, listener: TaskListener, once: boolean): () => void {
    let entries = this.#listeners.get(event);
    if (!entries) {
      entries = [];
      this.#listeners.set(event, entries);
    }
    if (!entries.some(entry => entry.listener === listener)) {
      entries.push({ listener, once });
    }
    return () => this.off(event, listener);
  }

  #emit(event: TaskEvent): void {
    const entries = this.#listeners.get(event);
    if (!entries?.length) return;

    // a listener may add or remove listeners: iterate over a copy
    for (const entry of [...entries]) {
      if (entry.once) this.off(event, entry.listener);
      this.#safeCall(entry.listener, undefined);
    }
  }

  // /**
  //  * @name core.Task#_clone
  //  * @function
  //  * @private
  //  *
  //  * @param {vs.VSObject} obj The cloned object
  //  * @param {Object} map Map of cloned objects
  //  */
  // override _clone (obj, cloned_map)
  // {
  //   super(obj, cloned_map);
  //
  //   obj.#state = this.#state;
  // }

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
  start(param?: TaskParam): Promise<TaskResult> {
    if (this.state === TaskState.STARTED) {
      throw new Error(`Task ${this.id} is already started`);
    }
    if (this.state === TaskState.PAUSED) {
      throw new Error(`Task ${this.id} is paused, call resume() to resume it`);
    }
    if (this.#signal?.aborted) {
      return Promise.resolve('stopped');
    }

    const run = this.#createRun();

    if (!this.doStart(param) && this.state === TaskState.STOPPED) {
      // nothing to run (e.g. an empty group): the run is already over
      this.#settleRun('ended');
    }

    return run.promise;
  }

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

  /**
   *  The current run, from start() until the task ends or is stopped
   *  @private
   */
  #run: TaskRun | undefined;

  #createRun(): TaskRun {
    let resolve!: (result: TaskResult) => void;
    const promise = new Promise<TaskResult>((res) => { resolve = res; });

    this.#run = { promise, resolve };
    return this.#run;
  }

  #settleRun(result: TaskResult): void {
    const run = this.#run;
    if (!run) return;

    this.#run = undefined;
    run.resolve(result);
  }
}
