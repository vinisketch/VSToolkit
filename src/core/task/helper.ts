import Task, { TaskAndParams } from "./task";
import { TaskState } from "./taskState";
import { isArray } from "vs_utils";

export default abstract class BaseTask extends Task {
  constructor(tasksAndParams?: TaskAndParams[]) {
    super();

    this.state = TaskState.STOPPED;

    if (tasksAndParams && tasksAndParams.length) {
      this.setTasks(tasksAndParams);
    }
  }

  /********************************************************************

   ********************************************************************/
  /**
   *  @private
   */
  protected readonly tasksAndParams: [Task, any[] | null][] = [];

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
  setTasks(tasksAndParams: TaskAndParams[]): boolean {
    if (this.state !== TaskState.STOPPED) {
      return false;
    }

    this.tasksAndParams.length = 0;
    for (let taskAndParam of tasksAndParams) {
      if (!taskAndParam) {
        continue;
      }

      let param = null;
      let task = null;

      if (isArray(taskAndParam)) {
        if (taskAndParam.length === 1) {
          task = taskAndParam [0];
        } else if (taskAndParam.length === 2) {
          task = taskAndParam [0];
          param = taskAndParam [1];
        }
      } else {
        task = taskAndParam;
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

      this.tasksAndParams.push([task, param]);
    }
    return true;
  }
}