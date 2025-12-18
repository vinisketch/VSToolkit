import { Task, TaskAndParams } from "./task";
import { TaskState } from "./task_state";
import { isArray, isNotEmpty } from "vs_utils";

/**
 *  Methods that create a PAR group
 *
 *  <p>
 *  @example
 *
 *  // Declare the task.PAR
 *  var group = vs.par ([rotate, comp1], [scale, comp2]);
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
export class PAR extends Task {
  constructor(tasksAndParams?: TaskAndParams[]) {
    super()
    this.state = TaskState.STOPPED;

    throw new Error('NOT IMPLEMENTED');
    if (isNotEmpty(tasksAndParams)) {
      this.setTasks(tasksAndParams);
    }
  }

  /********************************************************************

   ********************************************************************/
  /**
   *  @private
   */
  readonly #tasksAndParams: [Task, any[] | null][] = [];

  /**
   * taks ended
   *  @private
   */
  #tasksWillEnded = 0;

  /********************************************************************

   ********************************************************************/

  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name core.task.PAR#setTasks
   * @function
   *
   *  parameter
   * @param tasksAndParams
   */
  setTasks(tasksAndParams: TaskAndParams[]): boolean {
    if (this.state !== TaskState.STOPPED) {
      return false;
    }

    this.#tasksAndParams.length = 0;
    for (let i = 0; i < tasksAndParams.length; i++) {
      const taskAndParams = tasksAndParams [i];
      if (!taskAndParams) {
        continue;
      }

      let param = null;
      let task = null;

      if (isArray(taskAndParams)) {
        if (taskAndParams.length === 1) {
          task = taskAndParams [0];
        } else if (taskAndParams.length === 2) {
          task = taskAndParams [0];
          param = taskAndParams [1];
        }
      } else {
        task = taskAndParams;
        param = null;
      }

      if (!task) {
        console.warn('Undefined task');
        continue;
      }

      if (!task.start || !task.stop || !task.pause) {
        console.warn('Invalid task: ' + task.toString());
        continue;
      }

      this.#tasksAndParams.push([task, param]);
    }
  }

  /**
   *  Starts the task
   *
   * @name task.PAR#start
   * @function
   * @ignore
   * @param {any} param any parameter (scalar, Array, Object)
   */
  start(param: any[]): boolean {
    if (this.state === TaskState.STARTED) {
      return false;
    }
    this.#tasksWillEnded = this.#tasksAndParams.length;
    this.state = TaskState.STARTED;

    for (let i = 0; i < this.#tasksAndParams.length; i++) {
      const taskAndParams = this.#tasksAndParams [i];

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

    var taskAndParams, i;
    for (i = 0; i < this.#tasksAndParams.length; i++) {
      taskAndParams = this.#tasksAndParams [i];
      taskAndParams [0].stop();
    }

    return true;
  }

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the taskDidPause if it exits.
   *  @ignore
   * @function
   */
  pause() {
    if (this.state === TaskState.PAUSED) {
      return false;
    }
    this.state = TaskState.PAUSED;

    var taskAndParams, i;
    for (i = 0; i < this.#tasksAndParams.length; i++) {
      taskAndParams = this.#tasksAndParams [i];
      taskAndParams [0].pause();
    }

    return true;
  }

  /********************************************************************
   delegate methods
   ********************************************************************/

  /**
   * @protected
   * @function
   */
  taskDidStop(): void {
    this.state = TaskState.STOPPED;

    this.#tasksWillEnded--;
    if (this.#tasksWillEnded === 0) {
      if (this.delegate && this.delegate.taskDidStop) {
        try {
          this.delegate.taskDidStop(this);
        } catch (e) {
          if (e.stack) console.log(e.stack)
          console.error(e);
        }
      }
    }
  }

  /**
   * @protected
   * @function
   */
  taskDidPause(): void {
    this.state = TaskState.STOPPED;

    this.#tasksWillEnded--;
    if (this.#tasksWillEnded === 0) {
      if (this.delegate && this.delegate.taskDidPause) {
        try {
          this.delegate.taskDidPause(this);
        } catch (e) {
          if (e.stack) console.log(e.stack)
          console.error(e);
        }
      }
    }
  }

  /**
   * @protected
   * @function
   */
  taskDidEnd(): void {
    this.state = TaskState.STOPPED;

    this.#tasksWillEnded--;
    if (this.#tasksWillEnded === 0) {
      if (this.delegate && this.delegate.taskDidEnd) {
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
