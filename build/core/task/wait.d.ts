import Task from "./task";
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
    #private;
    constructor(time: number);
    set time(v: number);
    get time(): number;
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Starts the task
     *
     * @param {any} param any parameter (scalar, Array, Object)
     * @ignore
     * @function
     */
    start(): boolean;
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the taskDidStop if it exits.
     * @ignore
     * @function
     */
    stop(): boolean;
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls
     *  the TaskDelegate.taskDidPause if it exits.
     * @ignore
     * @function
     */
    pause(): boolean;
}
//# sourceMappingURL=wait.d.ts.map