import { asError } from 'vs_utils';

/**
 * Threshold, in px, of a pointer move cancelling a tap
 */
export const MOVE_THRESHOLD = 20;

/**
 * What a recognizer is attached to: a view
 */
export interface RecognizerTarget {
  readonly view: HTMLElement | null;
  /** a disabled target is ignored */
  readonly enable?: boolean;
}

/**
 *  @class
 *  Base class of the pointer recognizers: a recognizer listens to the
 *  pointer events (native Pointer Events) of a view, recognizes a gesture
 *  (tap, drag, pinch, rotation) and calls its delegate.
 *  <p>
 *  A recognizer listens to 'pointerdown' on the view; while a gesture is in
 *  progress, it follows the pointers on the document (startTracking), so
 *  that the gesture continues outside the view.
 *
 *  @example
 *  view.addPointerRecognizer(new TapRecognizer({ didTap: (nbTaps) => … }));
 */
export abstract class PointerRecognizer<Delegate extends object = object> {
  /**
   * The object called when the gesture is recognized
   */
  delegate: Delegate | undefined;

  #target: RecognizerTarget | undefined;
  #view: HTMLElement | undefined;
  #isTracking = false;

  constructor(delegate?: Delegate) {
    this.delegate = delegate;
  }

  /**
   * The target (view) the recognizer is attached to
   */
  get target(): RecognizerTarget | undefined {
    return this.#target;
  }

  /**
   *  Attaches the recognizer to a target (see View.addPointerRecognizer)
   */
  attach(target: RecognizerTarget): void {
    this.detach();
    if (!target.view) return;

    this.#target = target;
    this.#view = target.view;
    this.#view.addEventListener('pointerdown', this.#onPointerDown);
    this.didAttach(this.#view);
  }

  /**
   *  Detaches the recognizer from its target
   */
  detach(): void {
    if (!this.#view) return;

    this.stopTracking();
    this.#view.removeEventListener('pointerdown', this.#onPointerDown);
    this.willDetach(this.#view);
    this.reset();
    this.#view = undefined;
    this.#target = undefined;
  }

  /*****************************************************************
   *  Subclass hooks
   ****************************************************************/

  /** called once attached to the view */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected didAttach(view: HTMLElement): void {}

  /** called before being detached from the view */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected willDetach(view: HTMLElement): void {}

  /** resets the recognition state */
  // eslint-disable-next-line class-methods-use-this
  protected reset(): void {}

  /** a pointer went down on the view */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected pointerDown(event: PointerEvent): void {}

  /** a pointer moved, while tracking */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected pointerMove(event: PointerEvent): void {}

  /** a pointer went up, while tracking */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected pointerUp(event: PointerEvent): void {}

  /** a pointer was cancelled, while tracking: a pointer up by default */
  protected pointerCancel(event: PointerEvent): void {
    this.pointerUp(event);
  }

  /*****************************************************************
   *  Helpers
   ****************************************************************/

  /**
   *  Follows the pointers on the document (move, up, cancel)
   */
  protected startTracking(): void {
    if (this.#isTracking) return;
    this.#isTracking = true;
    document.addEventListener('pointermove', this.#onPointerMove);
    document.addEventListener('pointerup', this.#onPointerUp);
    document.addEventListener('pointercancel', this.#onPointerCancel);
  }

  /**
   *  Stops following the pointers on the document
   */
  protected stopTracking(): void {
    if (!this.#isTracking) return;
    this.#isTracking = false;
    document.removeEventListener('pointermove', this.#onPointerMove);
    document.removeEventListener('pointerup', this.#onPointerUp);
    document.removeEventListener('pointercancel', this.#onPointerCancel);
  }

  /**
   *  Calls a method of the delegate, if it exists; an exception it throws is
   *  logged
   */
  protected notify(method: keyof Delegate, ...args: unknown[]): void {
    const callback = this.delegate?.[method];
    if (typeof callback !== 'function') return;

    try {
      callback.apply(this.delegate, args);
    } catch (e) {
      const err = asError(e);
      if (err.stack) console.log(err.stack);
      console.error(err);
    }
  }

  readonly #onPointerDown = (event: PointerEvent): void => {
    if (this.#target?.enable === false) return;
    this.pointerDown(event);
  };

  readonly #onPointerMove = (event: PointerEvent): void => { this.pointerMove(event); };

  readonly #onPointerUp = (event: PointerEvent): void => { this.pointerUp(event); };

  readonly #onPointerCancel = (event: PointerEvent): void => { this.pointerCancel(event); };
}

export default PointerRecognizer;
