import EventSource from './EventTarget';

export default class PointerEventSource extends EventSource {
  protected readonly _pointer_start: Array<Function> = new Array<Function>();
  protected readonly _pointer_move: Array<Function> = new Array<Function>();
  protected readonly _pointer_end: Array<Function> = new Array<Function>();

  constructor(config?: ObjectConfig) {
    super(config);
  }

  /**
   *  The EventTarget.addEventListener() method registers the specified
   *  listener on the EventTarget it's called on. The event target may be any
   *  GL object that supports events
   *
   * @param {string} type the event specification [mandatory]
   * @param {Function} handler the object interested to catch the event [mandatory]
   * @param {boolean} useCapture If true, useCapture indicates that the user
   *          wishes to initiate captured [optional]
   */
  override addEventListener(type: string, handler: Function, useCapture?: boolean): void {
    if (type === POINTER_EVENTS.POINTER_DOWN) {
      this._pointer_start.push(handler);
    } else if (type === POINTER_EVENTS.POINTER_MOVE) {
      this._pointer_move.push(handler);
    } else if (type === POINTER_EVENTS.POINTER_UP) {
      this._pointer_end.push(handler);
    } else {
      super.addEventListener(type, handler, useCapture);
    }
  }

  /**
   *  Removes the event listener previously registered with
   *  EventTarget.addEventListener.
   *
   * @param {string} type the event specification [mandatory]
   * @param {Object} handler the object interested to catch the event [mandatory]
   */
  override removeEventListener(type: string, handler: Function) {
    if (!type || !handler) {
      return;
    }

    if (type === POINTER_EVENTS.POINTER_DOWN) {
      arrayRemove(this._pointer_start, handler);
    } else if (type === POINTER_EVENTS.POINTER_MOVE) {
      arrayRemove(this._pointer_move, handler);
    } else if (type === POINTER_EVENTS.POINTER_UP) {
      arrayRemove(this._pointer_end, handler);
    } else {
      super.removeEventListener(type, handler);
    }
  }
}
