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
  constructor (time: number) {
    super();
    this.#time = time;
    this.state = TaskState.STOPPED;
  }

  /********************************************************************

   ********************************************************************/
  #time=  0;
  #leftTime = 0;
  #timer: NodeJS.Timeout;
  #startTime = 0;

  set time(v: number) {
    if (this.state !== TaskState.STOPPED) {
      throw new Error('Stop the task before changing the time');
    }
    this.#time = v;
  }

  get time(): number {
    return this.#time;
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

    this.#startTime = new Date().getTime();
    this.#timer = setTimeout(() => {
      this.state = TaskState.STOPPED;
      if (this.delegate && this.delegate.taskDidEnd) {
        try {
          this.delegate.taskDidEnd(this);
        } catch (e) {
          if (e.stack) console.log(e.stack)
          console.error(e);
        }
      }
    }, time);

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

    clearTimeout(this.#timer);
    this.#timer = null;

    this.#leftTime = this.#time;

    if (this.delegate && this.delegate.taskDidStop) {
      try {
        this.delegate.taskDidStop(this);
      } catch (e) {
        if (e.stack) console.log(e.stack)
        console.error(e);
      }
    }

    return true;
  };

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

    this.#leftTime = this.#leftTime - new Date().getTime() + this.#startTime;

    if (this.delegate && this.delegate.taskDidPause) {
      try {
        this.delegate.taskDidPause(this);
      } catch (e) {
        if (e.stack) console.log(e.stack)
        console.error(e);
      }
    }
    return true;
  }
}
