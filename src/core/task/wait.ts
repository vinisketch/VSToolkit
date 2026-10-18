import Task from "./task";
import { TaskState } from "./taskState";

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
export default class Wait extends Task {
  constructor(time: number) {
    super();
    this.#time = Wait.#checkTime(time);
  }

  /********************************************************************

   ********************************************************************/
  #time =  0;
  #leftTime = 0;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #startTime = 0;

  set time(v: number) {
    if (this.state !== TaskState.STOPPED) {
      throw new Error('Stop the task before changing the time');
    }
    this.#time = Wait.#checkTime(v);
  }

  get time(): number {
    return this.#time;
  }

  static #checkTime(time: number): number {
    if (!Number.isFinite(time) || time < 0) {
      throw new RangeError(`Invalid wait time: ${time}, expected a positive number of milliseconds`);
    }
    return time;
  }

  /********************************************************************

   ********************************************************************/

  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  start(): boolean {
    let time = this.#time;
    if (this.state === TaskState.STARTED) {
      return false;
    }
    if (this.state === TaskState.PAUSED) {
      time = this.#leftTime;
    } else {
      this.#leftTime = time;
    }

    this.state = TaskState.STARTED;

    this.#startTime = Date.now();
    this.#timer = setTimeout(() => {
      this.#timer = null;
      this.state = TaskState.STOPPED;
      this.notify('taskDidEnd');
    }, time);
    this.notify('taskDidStart');

    return true;
  }

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop(): boolean {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.state = TaskState.STOPPED;

    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;

    this.#leftTime = this.#time;
    this.notify('taskDidStop');

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
    // only a running task can be paused
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.state = TaskState.PAUSED;

    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;

    this.#leftTime = this.#leftTime - Date.now() + this.#startTime;
    this.notify('taskDidPause');

    return true;
  }
}
