import type Task from './task';

export interface TaskDelegate {
  taskDidEnd?: (task: Task) => void;
  taskDidStart?: (task: Task) => void;
  taskDidStop?: (task: Task) => void;
  taskDidPause?: (task: Task) => void;
}
