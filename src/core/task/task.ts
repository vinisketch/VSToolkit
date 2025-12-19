import Component from "../Component";
import { TaskState } from "./taskState";
import TaskDelegate from "./taskDelegate";

export type TaskAndParams = [Task, any[]] | [Task] | Task;

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
   *  var delegate = {};
   *  delegate.taskDidEnd = function () { ... }
   *
   *  // Declare a PAR task including a SEC Task
   *  var task = new Task (...)
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
  override destructor() {
    this.stop ();
    super.destructor();
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
  start(param: any) {}

  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the TaskDelegate.taskDidStop
   *  if it declared.
   *
   * @name core.Task#stop
   * @function
   */
  stop() {}

  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the TaskDelegate.taskDidPause
   *  if it declared.
   *
   * @name core.Task#pause
   * @function
   */
  pause() {}
}
