import { GestureRecognizer } from './GestureRecognizer';
import type { RecognizerTarget } from './PointerRecognizer';

export interface PinchDelegate {
  /** a second pointer went down on the view: the pinch starts */
  didPinchStart?(event: PointerEvent, target: RecognizerTarget): void;
  /** the pointers moved: scale is their distance relatively to the start */
  didPinchChange?(scale: number, event: PointerEvent, target: RecognizerTarget): void;
  /** a pointer went up: the pinch ends */
  didPinchEnd?(event: PointerEvent, target: RecognizerTarget): void;
}

/**
 *  @class
 *  Recognizes a pinch on a view: two pointers moving apart or together.
 *
 *  @example
 *  view.addPointerRecognizer(new PinchRecognizer({
 *    didPinchChange: (scale) => view.scale(scale),
 *  }));
 */
export default class PinchRecognizer extends GestureRecognizer<PinchDelegate> {
  protected override gestureStart(event: PointerEvent): void {
    this.notify('didPinchStart', event, this.target);
  }

  protected override gestureChange(event: PointerEvent, scale: number): void {
    this.notify('didPinchChange', scale, event, this.target);
  }

  protected override gestureEnd(event: PointerEvent): void {
    this.notify('didPinchEnd', event, this.target);
  }
}
