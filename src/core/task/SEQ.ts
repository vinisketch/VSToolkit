import { asError } from "vs_utils";
import BaseTask from "./helper";
import { TaskAndParams } from "./task";
import { TaskState } from "./taskState";

/**
 *  Methods that create a SEQ group
 *
 *  <p>
 *  @example
 *
 *  // Declare the Task_PAR
 *  var group = vs.seq ([scale, comp0], [rotate, comp0]);
 *
 *  // Start the task => start animations
 *  group.start ();
 *
 *  parameter
 * @param params
 */
export const seq = (params: TaskAndParams[]): SEQ | undefined => {
  if (params.length === 0) return;

  const task = new SEQ();
  task.setTasks(params);

  return task;
};


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
export default class SEQ extends BaseTask {

  /********************************************************************

   ********************************************************************/

  /**
   *  Index of the running (or paused) task, -1 when the sequence is stopped
   *  @private
   */
  #currentTask = -1;
  /**
   *  @private
   */
  #startParam: any[] | undefined = undefined;

  /********************************************************************

   ********************************************************************/


  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start(param?: any[]) {
    if (this.state === TaskState.STARTED) {
      return false;
    }

    // resume the paused task, otherwise start from the first one
    const index = (this.state === TaskState.PAUSED) ? this.#currentTask : 0;
    return this.#startTask(index, param);
  }

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop() {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.state = TaskState.STOPPED;

    const taskAndParams = this.tasksAndParams [this.#currentTask];
    this.#currentTask = -1;

    // the task callback is ignored, since this sequence is already stopped
    taskAndParams?.[0].stop();
    this.#notify('taskDidStop');

    return true;
  }

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause(): boolean {
    // only a running sequence can be paused
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.state = TaskState.PAUSED;

    // the task callback is ignored, since this sequence is already paused
    this.tasksAndParams [this.#currentTask]?.[0].pause();
    this.#notify('taskDidPause');

    return true;
  }

  /**
   *  @private
   */
  #startTask(index: number, param?: any[]): boolean {
    const taskAndParams = this.tasksAndParams [index];

    if (!taskAndParams) {
      this.#currentTask = -1;
      this.state = TaskState.STOPPED;
      return false;
    }

    this.#currentTask = index;
    this.state = TaskState.STARTED;
    this.#startParam = param;

    taskAndParams [0].delegate = this;
    taskAndParams [0].start((taskAndParams [1]) ? taskAndParams [1] : param);

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
   delegate methodes
   ********************************************************************/

  /**
   *  The running task was stopped by someone else than this sequence
   */
  taskDidStop(): void {
    if (this.state === TaskState.STOPPED) return;

    this.state = TaskState.STOPPED;
    this.#currentTask = -1;
    this.#notify('taskDidStop');
  }

  /**
   *  The running task was paused by someone else than this sequence
   */
  taskDidPause(): void {
    if (this.state !== TaskState.STARTED) return;

    this.state = TaskState.PAUSED;
    this.#notify('taskDidPause');
  }

  /**
   */
  taskDidEnd(): void {
    if (this.state !== TaskState.STARTED) return;

    if (this.#currentTask + 1 < this.tasksAndParams.length) {
      // start the next task
      this.#startTask(this.#currentTask + 1, this.#startParam);
    } else {
      this.#currentTask = -1;
      this.state = TaskState.STOPPED;
      this.#notify('taskDidEnd');
    }
  }
}