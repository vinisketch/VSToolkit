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
    #private;
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
    /**
     *  Return the task State. <br />
     *  Possible values: {@link core.Task.STARTED},
     *  {@link core.Task.STOPPED},
     *  {@link core.Task.PAUSED}
     */
    get state(): TaskState;
    protected set state(state: TaskState);
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Default task destructor
     *
     * @name core.Task#destructor
     * @function
     */
    destructor(): void;
    /**
     *  Starts the task
     *
     * @name core.Task#start
     * @function
     *
     * @param {any} param any parameter (scalar, Array, Object)
     */
    start(param: any): void;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the TaskDelegate.taskDidStop
     *  if it declared.
     *
     * @name core.Task#stop
     * @function
     */
    stop(): void;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls the TaskDelegate.taskDidPause
     *  if it declared.
     *
     * @name core.Task#pause
     * @function
     */
    pause(): void;
}
//# sourceMappingURL=task.d.ts.map