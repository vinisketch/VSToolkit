import assert from 'assert';
import { mock } from 'node:test';

import '../../dom';

import {
  TapRecognizer, DragRecognizer, PinchRecognizer, RotationRecognizer,
  MOVE_THRESHOLD, MULTI_TAP_DELAY, type RecognizerTarget,
} from '../../../src/ui/Recognizers';

/**
 * A view element in the document, and a target for the recognizers
 */
function makeTarget(): { element: HTMLElement; target: { view: HTMLElement; enable: boolean } } {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return { element, target: { view: element, enable: true } };
}

/**
 * Pointer events: 'down' is dispatched on the element (it bubbles to the
 * document), 'move', 'up' and 'cancel' on the document, as a browser does
 * when the pointer is outside the element.
 */
function pointer(element: HTMLElement, type: 'down' | 'move' | 'up' | 'cancel',
  x: number, y: number, pointerId = 1, isPrimary = pointerId === 1): void {
  const event = new PointerEvent(`pointer${type}`, { pointerId, isPrimary, clientX: x, clientY: y, bubbles: true });
  (type === 'down' ? element : document).dispatchEvent(event);
}

describe('recognizers', function () {
  let originalError: typeof console.error;
  let originalLog: typeof console.log;
  let errors: unknown[];

  beforeEach(function () {
    mock.timers.enable({ apis: ['setTimeout'] });
    errors = [];
    originalError = console.error;
    originalLog = console.log;
    console.error = (...args: unknown[]) => { errors.push(args); };
    console.log = () => {};
  });

  afterEach(function () {
    mock.timers.reset();
    console.error = originalError;
    console.log = originalLog;
    document.body.innerHTML = '';
  });

  describe('TapRecognizer', function () {
    function makeTap(target: RecognizerTarget) {
      const log: string[] = [];
      const recognizer = new TapRecognizer({
        didTouch: (t, element) => log.push(`touch ${t === target} ${element === target.view}`),
        didUntouch: () => log.push('untouch'),
        didTap: (nbTaps, t) => log.push(`tap ${nbTaps} ${t === target}`),
      });
      recognizer.attach(target);
      return { recognizer, log };
    }

    it('should recognize a tap, after the multi tap delay', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      pointer(element, 'down', 10, 10);
      pointer(element, 'up', 10, 10);
      assert.deepStrictEqual(log, ['touch true true', 'untouch']);

      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log, ['touch true true', 'untouch', 'tap 1 true']);
    });

    it('should count the taps of a double tap', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      pointer(element, 'down', 10, 10);
      pointer(element, 'up', 10, 10);
      mock.timers.tick(MULTI_TAP_DELAY / 2);
      pointer(element, 'down', 10, 10);
      pointer(element, 'up', 10, 10);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log.filter(l => l.startsWith('tap')), ['tap 2 true']);
    });

    it('should count separately the taps after the delay', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      for (let i = 0; i < 2; i++) {
        pointer(element, 'down', 10, 10);
        pointer(element, 'up', 10, 10);
        mock.timers.tick(MULTI_TAP_DELAY);
      }
      assert.deepStrictEqual(log.filter(l => l.startsWith('tap')), ['tap 1 true', 'tap 1 true']);
    });

    it('should accept a small move', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      pointer(element, 'down', 10, 10);
      pointer(element, 'move', 10 + MOVE_THRESHOLD - 1, 10);
      pointer(element, 'up', 10, 10);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log.filter(l => l.startsWith('tap')), ['tap 1 true']);
    });

    it('should not recognize a tap when the pointer moved too far', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      pointer(element, 'down', 10, 10);
      pointer(element, 'move', 10 + MOVE_THRESHOLD, 10);
      pointer(element, 'up', 10 + MOVE_THRESHOLD, 10);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log, ['touch true true', 'untouch']);
    });

    it('should not recognize a cancelled tap', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      pointer(element, 'down', 10, 10);
      pointer(element, 'cancel', 10, 10);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log, ['touch true true', 'untouch']);
    });

    it('should ignore a secondary pointer', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      pointer(element, 'down', 10, 10, 2, false);
      pointer(element, 'up', 10, 10, 2, false);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log, []);
    });

    it('should ignore a disabled target', function () {
      const { element, target } = makeTarget();
      const { log } = makeTap(target);

      target.enable = false;
      pointer(element, 'down', 10, 10);
      pointer(element, 'up', 10, 10);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log, []);
    });

    it('should stop listening when detached', function () {
      const { element, target } = makeTarget();
      const { recognizer, log } = makeTap(target);

      recognizer.detach();
      pointer(element, 'down', 10, 10);
      pointer(element, 'up', 10, 10);
      mock.timers.tick(MULTI_TAP_DELAY);
      assert.deepStrictEqual(log, []);
      assert.strictEqual(recognizer.target, undefined);
    });

    it('should log an exception thrown by the delegate', function () {
      const { element, target } = makeTarget();
      new TapRecognizer({ didTouch: () => { throw new Error('delegate failure'); } }).attach(target);

      assert.doesNotThrow(() => pointer(element, 'down', 10, 10));
      assert.strictEqual(errors.length, 1);
    });
  });

  describe('DragRecognizer', function () {
    it('should give the moves relatively to the start', function () {
      const { element, target } = makeTarget();
      const log: string[] = [];
      new DragRecognizer({
        didDragStart: (_e, t) => log.push(`start ${t === target}`),
        didDrag: ({ dx, dy }) => log.push(`drag ${dx},${dy}`),
        didDragEnd: () => log.push('end'),
      }).attach(target);

      pointer(element, 'down', 10, 20);
      pointer(element, 'move', 15, 30);
      pointer(element, 'move', 110, 20);   // outside the view
      pointer(element, 'up', 110, 20);
      pointer(element, 'move', 200, 200);  // after the end
      assert.deepStrictEqual(log, ['start true', 'drag 5,10', 'drag 100,0', 'end']);
    });

    it('should ignore the other pointers', function () {
      const { element, target } = makeTarget();
      const log: string[] = [];
      new DragRecognizer({ didDrag: ({ dx }) => log.push(`drag ${dx}`), didDragEnd: () => log.push('end') }).attach(target);

      pointer(element, 'down', 0, 0);
      pointer(element, 'move', 50, 0, 2, false);
      pointer(element, 'up', 50, 0, 2, false);
      pointer(element, 'move', 5, 0);
      assert.deepStrictEqual(log, ['drag 5']);
    });

    it('should prevent the touch scrolling while attached', function () {
      const { element, target } = makeTarget();
      element.style.touchAction = 'pan-y';
      const recognizer = new DragRecognizer();

      recognizer.attach(target);
      assert.strictEqual(element.style.touchAction, 'none');
      recognizer.detach();
      assert.strictEqual(element.style.touchAction, 'pan-y');
    });
  });

  describe('PinchRecognizer', function () {
    it('should give the scale of two pointers', function () {
      const { element, target } = makeTarget();
      const log: string[] = [];
      new PinchRecognizer({
        didPinchStart: (_e, t) => log.push(`start ${t === target}`),
        didPinchChange: (scale) => log.push(`scale ${scale}`),
        didPinchEnd: () => log.push('end'),
      }).attach(target);

      pointer(element, 'down', 0, 0, 1);
      assert.deepStrictEqual(log, []);   // one pointer: no pinch
      pointer(element, 'down', 10, 0, 2);
      pointer(element, 'move', 20, 0, 2);
      pointer(element, 'move', -10, 0, 1);
      pointer(element, 'up', 20, 0, 2);
      assert.deepStrictEqual(log, ['start true', 'scale 2', 'scale 3', 'end']);
    });
  });

  describe('RotationRecognizer', function () {
    it('should give the rotation of two pointers, in degrees', function () {
      const { element, target } = makeTarget();
      const log: string[] = [];
      new RotationRecognizer({
        didRotationStart: () => log.push('start'),
        didRotationChange: (rotation) => log.push(`rotation ${Math.round(rotation)}`),
        didRotationEnd: () => log.push('end'),
      }).attach(target);

      pointer(element, 'down', 0, 0, 1);
      pointer(element, 'down', 10, 0, 2);
      pointer(element, 'move', 0, 10, 2);   // a quarter turn, clockwise
      pointer(element, 'cancel', 0, 10, 2);
      assert.deepStrictEqual(log, ['start', 'rotation 90', 'end']);
    });
  });
});
