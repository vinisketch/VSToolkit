import { asError } from "vs_utils";
import BaseTask from "./helper";
import Task, { TaskAndParams } from "./task";
import { TaskState } from "./taskState";

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
 */
export const par = (params: TaskAndParams[]): PAR | undefined => {
  if (params.length === 0) return;

  const task = new PAR();
  task.setTasks(params);

  return task;
};

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
export default class PAR extends BaseTask {

  /**
   * Tasks started and not yet ended (running or paused)
   *  @private
   */
  readonly #runningTasks = new Set<Task>();

  /**
   *  Starts the task
   *
   * @name task.PAR#start
   * @function
   * @ignore
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start(param?: any[]): boolean {
    if (this.state === TaskState.STARTED) {
      return false;
    }

    // when resuming, only restart the tasks which have not ended yet
    if (this.state !== TaskState.PAUSED) {
      this.#runningTasks.clear();
      this.tasksAndParams.forEach(([task]) => this.#runningTasks.add(task));
    }

    if (this.#runningTasks.size === 0) {
      this.state = TaskState.STOPPED;
      return false;
    }
    this.state = TaskState.STARTED;

    for (let taskAndParams of this.tasksAndParams) {
      if (!this.#runningTasks.has(taskAndParams [0])) continue;

      taskAndParams [0].delegate = this;
      taskAndParams [0].start((taskAndParams [1]) ? taskAndParams [1] : param);
    }

    return true;
  }

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @function
   * @ignore
   */
  stop() {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.state = TaskState.STOPPED;

    // the tasks callbacks are ignored, since this group is already stopped
    const tasks = [...this.#runningTasks];
    this.#runningTasks.clear();
    tasks.forEach(task => task.stop());
    this.#notify('taskDidStop');

    return true;
  }

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the taskDidPause if it exits.
   *  @ignore
   * @function
   */
  pause() {
    // only a running group can be paused
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.state = TaskState.PAUSED;

    // the tasks callbacks are ignored, since this group is already paused
    this.#runningTasks.forEach(task => task.pause());
    this.#notify('taskDidPause');

    return true;
  }

  /**
   *  @private
   */
  #notify(method: 'taskDidEnd' | 'taskDidStop' | 'taskDidPause'): void {
    const callback = this.delegate?.[method];
    if (!callback) return;

    try {
      callback.call(this.delegate, this);
    } catch (e) {
      const err = asError(e);
      if (err.stack) console.log(err.stack)
      console.error(err);
    }
  }

  /********************************************************************
   delegate methods
   ********************************************************************/

  /**
   *  A task was stopped by someone else than this group: it will not end,
   *  so the group stops when no other task is running.
   */
  taskDidStop(task: Task): void {
    if (this.state === TaskState.STOPPED) return;

    this.#runningTasks.delete(task);
    if (this.#runningTasks.size === 0) {
      this.state = TaskState.STOPPED;
      this.#notify('taskDidStop');
    }
  }

  /**
   *  A task was paused by someone else than this group: the group keeps
   *  running and waits for the task to be resumed.
   */
  taskDidPause(): void {}

  /**
   */
  taskDidEnd(task: Task): void {
    if (this.state === TaskState.STOPPED) return;

    this.#runningTasks.delete(task);
    if (this.state === TaskState.STARTED && this.#runningTasks.size === 0) {
      this.state = TaskState.STOPPED;
      this.#notify('taskDidEnd');
    }
  }
}
