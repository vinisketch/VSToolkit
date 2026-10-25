import { PointerRecognizer } from './PointerRecognizer';

interface Point {
  x: number;
  y: number;
}

/**
 *  @class
 *  Base class of the two pointers gestures (pinch, rotation): the gesture
 *  starts when a second pointer goes down on the view, changes while the
 *  pointers move, and ends when one of them goes up.
 *  <p>
 *  It sets touch-action: none on the view, so that the browser does not
 *  zoom or scroll the page.
 */
export abstract class GestureRecognizer<Delegate extends object = object> extends PointerRecognizer<Delegate> {
  readonly #pointers = new Map<number, Point>();
  #isActive = false;
  #startDistance = 1;
  #startAngle = 0;
  #touchAction = '';

  /** the gesture started */
  protected abstract gestureStart(event: PointerEvent): void;

  /**
   * the gesture changed
   * @param scale the distance between the pointers, relatively to the start
   * @param rotation the rotation of the pointers since the start, in degrees
   */
  protected abstract gestureChange(event: PointerEvent, scale: number, rotation: number): void;

  /** the gesture ended */
  protected abstract gestureEnd(event: PointerEvent): void;

  protected override didAttach(view: HTMLElement): void {
    this.#touchAction = view.style.touchAction;
    view.style.touchAction = 'none';
  }

  protected override willDetach(view: HTMLElement): void {
    view.style.touchAction = this.#touchAction;
  }

  protected override reset(): void {
    this.#pointers.clear();
    this.#isActive = false;
  }

  protected override pointerDown(event: PointerEvent): void {
    this.#pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.startTracking();

    if (!this.#isActive && this.#pointers.size === 2) {
      const [a, b] = this.#twoPointers();
      this.#startDistance = distance(a, b) || 1;
      this.#startAngle = angle(a, b);
      this.#isActive = true;
      this.gestureStart(event);
    }
  }

  protected override pointerMove(event: PointerEvent): void {
    const pointer = this.#pointers.get(event.pointerId);
    if (!pointer) return;

    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (this.#isActive) {
      const [a, b] = this.#twoPointers();
      this.gestureChange(event, distance(a, b) / this.#startDistance, angle(a, b) - this.#startAngle);
    }
  }

  protected override pointerUp(event: PointerEvent): void {
    if (!this.#pointers.delete(event.pointerId)) return;

    if (this.#isActive && this.#pointers.size < 2) {
      this.#isActive = false;
      this.gestureEnd(event);
    }
    if (this.#pointers.size === 0) {
      this.stopTracking();
    }
  }

  /** the two first pointers */
  #twoPointers(): [Point, Point] {
    const [a, b] = this.#pointers.values();
    return [a, b];
  }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** the angle of the segment ab, in degrees */
function angle(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

export default GestureRecognizer;
