import Task, { TaskAndParams, TaskOptions, TaskParam, attachToGroup, detachFromGroup } from "./task";
import { TaskState } from "./taskState";
import { TaskDelegate } from "./taskDelegate";
import { isArray } from "vs_utils";

/**
 * Base class of the task groups (SEQ, PAR).
 * A group does not take the delegate of its tasks: it is notified through
 * the task group registry, so a task keeps its own delegate and can belong to
 * several groups.
 */
export default abstract class BaseTask extends Task implements TaskDelegate {
  constructor(tasksAndParams?: TaskAndParams[], options?: TaskOptions) {
    super(options);

    if (tasksAndParams && tasksAndParams.length) {
      this.setTasks(tasksAndParams);
    }
  }

  /********************************************************************

   ********************************************************************/
  /**
   *  Tasks with their own optional parameter (undefined when none)
   *  @private
   */
  protected readonly tasksAndParams: [Task, TaskParam][] = [];

  /**
   *  Returns the parameter to start a task with: its own parameter if it
   *  has one, the group parameter otherwise.
   *  @protected
   */
  protected paramFor([, ownParam]: [Task, TaskParam], groupParam: TaskParam): TaskParam {
    return ownParam ?? groupParam;
  }

  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name core.task.BaseTask#setTasks
   * @function
   *
   * @param tasksAndParams list of tasks, each one optionally with its own
   *        parameter: task | [task] | [task, param]
   */
  setTasks(tasksAndParams: TaskAndParams[]): boolean {
    if (this.state !== TaskState.STOPPED) {
      return false;
    }

    this.#detachAll();
    for (let taskAndParam of tasksAndParams) {
      if (!taskAndParam) {
        continue;
      }

      let task: Task | undefined;
      let param: TaskParam;

      if (isArray(taskAndParam)) {
        const entry = taskAndParam as unknown[];
        if (entry.length !== 1 && entry.length !== 2) {
          console.warn(`Invalid task entry: expected [task] or [task, param], got ${entry.length} items`);
          continue;
        }
        [task, param] = taskAndParam;
      } else {
        task = taskAndParam;
      }

      if (!task) {
        console.warn('Undefined task');
        continue;
      }

      if (!task.start || !task.stop || !task.pause) {
        console.warn('Invalid task: ' + task.toString());
        continue;
      }

      attachToGroup(task, this);
      this.tasksAndParams.push([task, param]);
    }
    return true;
  }

  /********************************************************************
   callbacks from the group tasks
   ********************************************************************/

  abstract taskDidEnd(task: Task): void;
  abstract taskDidStop(task: Task): void;
  abstract taskDidPause(task: Task): void;

  /**
   *  Stops the group and releases its tasks
   *  @protected
   */
  protected override destructor() {
    super.destructor();
    this.#detachAll();
  }

  #detachAll(): void {
    this.tasksAndParams.forEach(([task]) => detachFromGroup(task, this));
    this.tasksAndParams.length = 0;
  }
}
