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
   *  @private
   */
  #nextTaskToStart = 0;
  /**
   *  @private
   */
  #startParam: any[] | null = null;

  /********************************************************************

   ********************************************************************/


  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start(param: any[]) {
    if (this.state === TaskState.STARTED) {
      return false;
    }

    const taskAndParams = this.tasksAndParams [this.#nextTaskToStart];
    this.#nextTaskToStart++;

    if (!taskAndParams) {
      this.#nextTaskToStart = 0;
      this.state = TaskState.STOPPED;
      return false;
    }

    this.state = TaskState.STARTED;
    this.#startParam = param;

    taskAndParams [0].delegate = this;
    taskAndParams [0].start((taskAndParams [1]) ? taskAndParams [1] : param);

    return true;
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

    const taskAndParams = this.tasksAndParams [this.#nextTaskToStart - 1];
    this.#nextTaskToStart = 0;

    if (!taskAndParams) {
      return false;
    }

    taskAndParams [0].stop();

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
    if (this.state === TaskState.PAUSED) {
      return false;
    }
    this.state = TaskState.PAUSED;

    const taskAndParams = this.tasksAndParams [this.#nextTaskToStart - 1];
    if (!taskAndParams) {
      return false;
    }

    taskAndParams [0].pause();

    return true;
  }

  /********************************************************************
   delegate methodes
   ********************************************************************/

  /**
   */
  taskDidStop(): void {
    this.state = TaskState.STOPPED;

    this.#nextTaskToStart = 0;

    if (this.delegate?.taskDidStop) {
      try {
        this.delegate.taskDidStop(this);
      } catch (e) {
        if (e.stack) console.log(e.stack)
        console.error(e);
      }
    }
  }

  /**
   */
  taskDidPause(): void {
    this.state = TaskState.PAUSED;

    this.#nextTaskToStart = this.#nextTaskToStart - 1;

    if (this.delegate?.taskDidPause) {
      try {
        this.delegate.taskDidPause(this);
      } catch (e) {
        if (e.stack) console.log(e.stack)
        console.error(e);
      }
    }
  }

  /**
   */
  taskDidEnd(): void {
    this.state = TaskState.STOPPED;

    if (this.#nextTaskToStart < this.tasksAndParams.length) {
      // start the next task
      this.start(this.#startParam);
    } else {
      this.#nextTaskToStart = 0;
      if (this.delegate?.taskDidEnd) {
        try {
          this.delegate.taskDidEnd(this);
        } catch (e) {
          if (e.stack) console.log(e.stack)
          console.error(e);
        }
      }
    }
  }
}