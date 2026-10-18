import { asError } from "vs_utils";
import Component from "../Component";
import { TaskState } from "./taskState";
import { TaskDelegate } from "./taskDelegate";

/**
 * The parameter given to a task when it starts (scalar, Array, Object)
 */
export type TaskParam = unknown;

export type TaskAndParams = [Task, TaskParam] | [Task] | Task;

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
 * @param {Object} config the configuration structure
 */
export default abstract class Task extends Component {

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
    this.stop ();
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
    const listeners = [this.delegate, ...(taskGroups.get(this) ?? [])];

    for (const listener of listeners) {
      const callback = listener?.[method];
      if (!callback) continue;

      try {
        callback.call(listener, this);
      } catch (e) {
        const err = asError(e);
        if (err.stack) console.log(err.stack)
        console.error(err);
      }
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
   *  Starts the task
   *
   * @name core.Task#start
   * @function
   *
   * @param {any} param any parameter (scalar, Array, Object)
   */
  abstract start(param?: TaskParam): boolean;

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
