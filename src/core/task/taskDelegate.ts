export interface TaskDelegate {
  taskDidEnd?: (task: any) => void;
  taskDidStart?: (task: any) => void;
  taskDidStop?: (task: any) => void;
  taskDidPause?: (task: any) => void;
}
