import { MOVE_THRESHOLD, PointerRecognizer, type RecognizerTarget } from './PointerRecognizer';

/**
 * Delay, in ms, to wait for another tap (double tap…)
 */
export const MULTI_TAP_DELAY = 100;

export interface TapDelegate {
  /** a pointer went down on the view */
  didTouch?(target: RecognizerTarget, element: HTMLElement, event: PointerEvent): void;
  /** the pointer went up, or moved too far (no tap) */
  didUntouch?(target: RecognizerTarget, element: HTMLElement, event: PointerEvent): void;
  /** the view was tapped nbTaps times (1, 2 for a double tap…) */
  didTap?(nbTaps: number, target: RecognizerTarget, element: HTMLElement, event: PointerEvent): void;
}

/**
 *  @class
 *  Recognizes taps (single, double…) on a view.
 *  <p>
 *  A tap is a pointer going down then up on the view, without moving more
 *  than MOVE_THRESHOLD px. Taps following each other within
 *  MULTI_TAP_DELAY ms are counted together: didTap is called once, with
 *  their number.
 *
 *  @example
 *  view.addPointerRecognizer(new TapRecognizer({
 *    didTap: (nbTaps) => { if (nbTaps === 2) … },
 *  }));
 */
export default class TapRecognizer extends PointerRecognizer<TapDelegate> {
  #isTouched = false;
  #pointerId = 0;
  #startX = 0;
  #startY = 0;
  #nbTaps = 0;
  #tapTimeout: ReturnType<typeof setTimeout> | undefined;

  protected override reset(): void {
    if (this.#tapTimeout) clearTimeout(this.#tapTimeout);
    this.#tapTimeout = undefined;
    this.#isTouched = false;
    this.#nbTaps = 0;
  }

  protected override pointerDown(event: PointerEvent): void {
    // one pointer only
    if (this.#isTouched || !event.isPrimary) return;

    // another tap of the same series
    if (this.#tapTimeout) {
      clearTimeout(this.#tapTimeout);
      this.#tapTimeout = undefined;
    } else {
      this.#nbTaps = 0;
    }

    this.#isTouched = true;
    this.#pointerId = event.pointerId;
    this.#startX = event.clientX;
    this.#startY = event.clientY;
    this.startTracking();

    this.notify('didTouch', this.target, this.target?.view, event);
  }

  protected override pointerMove(event: PointerEvent): void {
    if (!this.#isTouched || event.pointerId !== this.#pointerId) return;

    const distance = Math.abs(event.clientX - this.#startX) + Math.abs(event.clientY - this.#startY);
    if (distance < MOVE_THRESHOLD) return;

    // moved too far: not a tap
    this.#isTouched = false;
    this.#nbTaps = 0;
    this.stopTracking();
    this.notify('didUntouch', this.target, this.target?.view, event);
  }

  protected override pointerUp(event: PointerEvent): void {
    if (!this.#isTouched || event.pointerId !== this.#pointerId) return;

    this.#isTouched = false;
    this.stopTracking();
    this.notify('didUntouch', this.target, this.target?.view, event);

    this.#nbTaps++;
    if (!this.delegate?.didTap) {
      this.#nbTaps = 0;
      return;
    }

    const target = this.target;
    this.#tapTimeout = setTimeout(() => {
      const nbTaps = this.#nbTaps;
      this.#tapTimeout = undefined;
      this.#nbTaps = 0;
      this.notify('didTap', nbTaps, target, target?.view, event);
    }, MULTI_TAP_DELAY);
  }

  protected override pointerCancel(event: PointerEvent): void {
    if (!this.#isTouched || event.pointerId !== this.#pointerId) return;

    // a cancelled pointer is not a tap
    this.#isTouched = false;
    this.#nbTaps = 0;
    this.stopTracking();
    this.notify('didUntouch', this.target, this.target?.view, event);
  }
}
