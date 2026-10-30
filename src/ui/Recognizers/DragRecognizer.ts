import { PointerRecognizer, type RecognizerTarget } from './PointerRecognizer';

export interface DragDelegate {
  /** a pointer went down on the view: the drag starts */
  didDragStart?(event: PointerEvent, target: RecognizerTarget): void;
  /** the pointer moved by (dx, dy) px since the drag start */
  didDrag?(delta: { dx: number; dy: number }, event: PointerEvent, target: RecognizerTarget): void;
  /** the pointer went up (or was cancelled): the drag ends */
  didDragEnd?(event: PointerEvent, target: RecognizerTarget): void;
}

/**
 *  @class
 *  Recognizes a drag of a view: one pointer going down on the view, moving,
 *  then going up. The moves are given relatively to the drag start.
 *  <p>
 *  It sets touch-action: none on the view, so that a touch drag does not
 *  scroll the page.
 *
 *  @example
 *  view.addPointerRecognizer(new DragRecognizer({
 *    didDrag: ({ dx, dy }) => view.translate(dx, dy),
 *  }));
 */
export default class DragRecognizer extends PointerRecognizer<DragDelegate> {
  #isDragged = false;
  #pointerId = 0;
  #startX = 0;
  #startY = 0;
  #touchAction = '';

  protected override didAttach(view: HTMLElement): void {
    this.#touchAction = view.style.touchAction;
    view.style.touchAction = 'none';
  }

  protected override willDetach(view: HTMLElement): void {
    view.style.touchAction = this.#touchAction;
  }

  protected override reset(): void {
    this.#isDragged = false;
  }

  protected override pointerDown(event: PointerEvent): void {
    // one pointer only
    if (this.#isDragged || !event.isPrimary) return;

    this.#isDragged = true;
    this.#pointerId = event.pointerId;
    this.#startX = event.clientX;
    this.#startY = event.clientY;
    this.startTracking();

    this.notify('didDragStart', event, this.target);
  }

  protected override pointerMove(event: PointerEvent): void {
    if (!this.#isDragged || event.pointerId !== this.#pointerId) return;

    const delta = { dx: event.clientX - this.#startX, dy: event.clientY - this.#startY };
    this.notify('didDrag', delta, event, this.target);
  }

  protected override pointerUp(event: PointerEvent): void {
    if (!this.#isDragged || event.pointerId !== this.#pointerId) return;

    this.#isDragged = false;
    this.stopTracking();
    this.notify('didDragEnd', event, this.target);
  }
}
