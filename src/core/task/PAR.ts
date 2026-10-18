import BaseTask from "./helper";
import Task, { TaskAndParams, TaskOptions, TaskParam } from "./task";
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
 * @param options optional delegate and abort signal
 */
export const par = (params: TaskAndParams[], options?: TaskOptions): PAR => new PAR(params, options);

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
  protected override doStart(param?: TaskParam): boolean {
    this.checkTasksStopped();

    this.#runningTasks.clear();
    this.tasksAndParams.forEach(([task]) => this.#runningTasks.add(task));

    if (this.#runningTasks.size === 0) {
      return false;
    }
    this.state = TaskState.STARTED;

    for (let taskAndParams of this.tasksAndParams) {
      taskAndParams [0].start(this.paramFor(taskAndParams, param));
    }
    this.notify('taskDidStart');

    return true;
  }

  /**
   *  Resumes the tasks which have not ended yet
   */
  resume(): boolean {
    if (this.state !== TaskState.PAUSED) {
      return false;
    }
    this.state = TaskState.STARTED;

    // the tasks callbacks are ignored, since this group is already started
    this.#runningTasks.forEach(task => task.resume());
    this.notify('taskDidResume');

    // tasks resumed by someone else may have ended while the group was paused
    if (this.#runningTasks.size === 0) {
      this.state = TaskState.STOPPED;
      this.notify('taskDidEnd');
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
    this.notify('taskDidStop');

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
    this.notify('taskDidPause');

    return true;
  }

  /********************************************************************
   delegate methods
   ********************************************************************/

  /**
   *  A task was stopped by someone else than this group: it will not end,
   *  so the group stops when no other task is running.
   */
  taskDidStop(task: Task): void {
    // ignore tasks this group is not running (a task may belong to several groups)
    if (this.state === TaskState.STOPPED || !this.#runningTasks.has(task)) return;

    this.#runningTasks.delete(task);
    if (this.#runningTasks.size === 0) {
      this.state = TaskState.STOPPED;
      this.notify('taskDidStop');
    }
  }

  /**
   *  A task was paused by someone else than this group: the group keeps
   *  running and waits for the task to be resumed.
   */
  taskDidPause(_task: Task): void {}

  /**
   *  A task was resumed by someone else than this group: nothing to do,
   *  the group only tracks the end of its tasks.
   */
  taskDidResume(_task: Task): void {}

  /**
   */
  taskDidEnd(task: Task): void {
    if (this.state === TaskState.STOPPED || !this.#runningTasks.has(task)) return;

    this.#runningTasks.delete(task);
    if (this.state === TaskState.STARTED && this.#runningTasks.size === 0) {
      this.state = TaskState.STOPPED;
      this.notify('taskDidEnd');
    }
  }
}
