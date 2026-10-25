import { GestureRecognizer } from './GestureRecognizer';

export interface RotationDelegate {
  /** a second pointer went down on the view: the rotation starts */
  didRotationStart?(event: PointerEvent): void;
  /** the pointers turned by rotation degrees since the start */
  didRotationChange?(rotation: number, event: PointerEvent): void;
  /** a pointer went up: the rotation ends */
  didRotationEnd?(event: PointerEvent): void;
}

/**
 *  @class
 *  Recognizes a rotation on a view: two pointers turning around each other.
 *  The rotation is in degrees, clockwise.
 *
 *  @example
 *  view.addPointerRecognizer(new RotationRecognizer({
 *    didRotationChange: (rotation) => view.rotate(rotation),
 *  }));
 */
export default class RotationRecognizer extends GestureRecognizer<RotationDelegate> {
  protected override gestureStart(event: PointerEvent): void {
    this.notify('didRotationStart', event);
  }

  protected override gestureChange(event: PointerEvent, _scale: number, rotation: number): void {
    this.notify('didRotationChange', rotation, event);
  }

  protected override gestureEnd(event: PointerEvent): void {
    this.notify('didRotationEnd', event);
  }
}
