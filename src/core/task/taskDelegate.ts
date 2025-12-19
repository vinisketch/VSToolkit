export default interface TaskDelegate {
  taskDidEnd?: Function;
  taskDidStart?: Function;
  taskDidStop?: Function;
  taskDidPause?: Function;
}
