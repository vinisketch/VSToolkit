import Task, { TaskAndParams } from "./task";
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
export declare const seq: (params: TaskAndParams[]) => SEQ | undefined;
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
export default class SEQ extends Task {
    #private;
    constructor(tasksAndParams?: TaskAndParams[]);
    /********************************************************************
  
     ********************************************************************/
    /**
     *  Set tasks.
     *  The task has to be stopped
     *
     * @name core.task.SEQ#setTasks
     * @function
     *
     *  parameter
     * @param tasksAndParams
     */
    setTasks(tasksAndParams: TaskAndParams[]): boolean;
    /**
     *  Starts the task
     *
     * @param {any} param any parameter (scalar, Array, Object)
     * @ignore
     * @function
     */
    start(param: any[]): boolean;
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
    /********************************************************************
     delegate methodes
     ********************************************************************/
    /**
     * @protected
     * @function
     */
    taskDidStop(): void;
    /**
     * @protected
     * @function
     */
    taskDidPause(): void;
    /**
     * @protected
     * @function
     */
    taskDidEnd(): void;
}
//# sourceMappingURL=SEQ.d.ts.map