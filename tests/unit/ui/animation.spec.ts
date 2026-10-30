import assert from 'assert';

import '../../dom';
import '../../di_config';

import { task } from 'vs_toolkit/vs_core';
import {
  Animation, TranslateAnimation, RotateAnimation, RotateXYZAnimation, ScaleAnimation,
  SkewAnimation, OpacityAnimation, type AnimationTarget,
} from '../../../src/ui/Animation';

const { TaskState, seq } = task;

interface FakeAnimation {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  calls: string[];
  onfinish: (() => void) | null;
  finish(): void;
}

/**
 * A view whose element.animate() is a fake, controlled by the test
 */
function makeTarget(extra: Partial<AnimationTarget> = {}) {
  const view = document.createElement('div');
  const animations: FakeAnimation[] = [];
  (view as any).animate = (keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation: FakeAnimation = {
      keyframes, options, calls: [], onfinish: null,
      finish() { this.onfinish?.(); },
    };
    for (const method of ['pause', 'play', 'cancel']) {
      (animation as any)[method] = () => animation.calls.push(method);
    }
    animations.push(animation);
    return animation;
  };
  const target: AnimationTarget = { view, size: [100, 50], position: [10, 20], ...extra };
  return { view, target, animations };
}

async function flush(): Promise<void> {
  await new Promise(resolve => setImmediate(resolve));
}

describe('Animation', function () {
  describe('key frames', function () {
    it('should animate to the values, with the default options', function () {
      const { target, animations } = makeTarget();
      new Animation([['opacity', '0']]).start(target);

      assert.deepStrictEqual(animations[0].keyframes, [{ offset: 1, opacity: '0' }]);
      assert.deepStrictEqual(animations[0].options,
        { duration: 300, delay: 0, easing: 'ease', iterations: 1, fill: 'forwards' });
    });

    it('should combine the transforms', function () {
      const { target, animations } = makeTarget();
      new Animation([['translate', '1px,2px,3px'], ['rotate', '10deg'], ['scale', '2']]).start(target);
      assert.strictEqual(animations[0].keyframes[0].transform, 'translate3d(1px,2px,3px) rotate(10deg) scale(2)');
    });

    it('should use a 2D translate for two values', function () {
      const { target, animations } = makeTarget();
      new Animation([['translate', '1px,2px']]).start(target);
      assert.strictEqual(animations[0].keyframes[0].transform, 'translate(1px,2px)');
    });

    it('should camelize the CSS properties', function () {
      const { target, animations } = makeTarget();
      new Animation([['background-color', 'red']]).start(target);
      assert.deepStrictEqual(animations[0].keyframes[0], { offset: 1, backgroundColor: 'red' });
    });

    it('should replace the size and position variables', function () {
      const { target, animations } = makeTarget();
      new Animation([['translate', '$width,$height,0'], ['left', '$x'], ['top', '$y']]).start(target);
      assert.strictEqual(animations[0].keyframes[0].transform, 'translate3d(100px,50px,0)');
      assert.strictEqual(animations[0].keyframes[0].left, '10px');
      assert.strictEqual(animations[0].keyframes[0].top, '20px');
    });

    it('should replace the variables with the animation fields', function () {
      const { target, animations } = makeTarget();
      new TranslateAnimation(10, 20, 30).start(target);
      assert.strictEqual(animations[0].keyframes[0].transform, 'translate3d(10px,20px,30px)');
    });

    it('should add the key frames, sorted', function () {
      const { target, animations } = makeTarget();
      const animation = new Animation([['opacity', '1']]);
      animation.addKeyFrame(50, ['0.2']);
      animation.addKeyFrame('from', ['0']);
      animation.start(target);
      assert.deepStrictEqual(animations[0].keyframes.map(k => [k.offset, k.opacity]),
        [[0, '0'], [0.5, '0.2'], [1, '1']]);
    });

    it('should accept the variables of a key frame', function () {
      const { target, animations } = makeTarget();
      const animation = new Animation([['opacity', '${level}']]);
      (animation as any).level = 1;
      animation.addKeyFrame('from', { level: 0 });
      animation.start(target);
      assert.deepStrictEqual(animations[0].keyframes.map(k => k.opacity), ['0', '1']);
    });

    it('should prefix the transforms with the current transform when additive', function () {
      const { target, animations } = makeTarget({ getCTM: () => new DOMMatrix().translate(5, 0) });
      new RotateAnimation(45).start(target);
      assert.match(String(animations[0].keyframes[0].transform), /^matrix.*\) rotate\(45deg\)$/);
    });

    it('should not prefix the transforms when not additive', function () {
      const { target, animations } = makeTarget({ getCTM: () => new DOMMatrix().translate(5, 0) });
      new RotateAnimation(45, { additive: false }).start(target);
      assert.strictEqual(animations[0].keyframes[0].transform, 'rotate(45deg)');
    });
  });

  describe('options', function () {
    it('should convert the durations, and set the options', function () {
      const { target, animations } = makeTarget();
      new Animation([['opacity', '0']], { duration: '1.5s', timing: 'linear', delay: 100, iterationCount: 3 }).start(target);
      assert.deepStrictEqual(animations[0].options,
        { duration: 1500, delay: 100, easing: 'linear', iterations: 3, fill: 'forwards' });

      const { target: other, animations: others } = makeTarget();
      new Animation([['opacity', '0']], { duration: '200ms', iterationCount: 'infinite' }).start(other);
      assert.strictEqual(others[0].options.duration, 200);
      assert.strictEqual(others[0].options.iterations, Infinity);
    });

    it('should set the transform origin', function () {
      const { view, target } = makeTarget();
      new Animation([['scale', '2']], { origin: [25, 75] }).start(target);
      assert.strictEqual(view.style.transformOrigin, '25% 75%');
    });
  });

  describe('task', function () {
    it('should end when the animation finishes, and keep the final values', async function () {
      const { view, target, animations } = makeTarget();
      const animation = new Animation([['opacity', '0'], ['translateX', '10px']], { additive: false });
      const log: string[] = [];
      animation.on('start', () => log.push('start'));
      animation.on('end', () => log.push('end'));

      const run = animation.start(target);
      assert.strictEqual(animation.state, TaskState.STARTED);
      animations[0].finish();

      assert.strictEqual(await run, 'ended');
      assert.strictEqual(animation.state, TaskState.STOPPED);
      assert.strictEqual(view.style.opacity, '0');
      assert.strictEqual(view.style.transform, 'translateX(10px)');
      assert.deepStrictEqual(animations[0].calls, ['cancel']);
      assert.deepStrictEqual(log, ['start', 'end']);
    });

    it('should stop the animation, without the final values', async function () {
      const { view, target, animations } = makeTarget();
      const animation = new OpacityAnimation(0);
      const run = animation.start(target);

      assert.strictEqual(animation.stop(), true);
      assert.strictEqual(await run, 'stopped');
      assert.deepStrictEqual(animations[0].calls, ['cancel']);

      animations[0].finish();   // a late finish is ignored
      assert.strictEqual(view.style.opacity, '');
      assert.strictEqual(animation.state, TaskState.STOPPED);
    });

    it('should pause and resume the animation', function () {
      const { target, animations } = makeTarget();
      const animation = new OpacityAnimation(0);
      animation.start(target);

      assert.strictEqual(animation.pause(), true);
      assert.strictEqual(animation.state, TaskState.PAUSED);
      assert.strictEqual(animation.resume(), true);
      assert.strictEqual(animation.state, TaskState.STARTED);
      assert.deepStrictEqual(animations[0].calls, ['pause', 'play']);
    });

    it('should apply the final values at once without Web Animations', async function () {
      const view = document.createElement('div');
      (view as any).animate = undefined;
      const animation = new OpacityAnimation(0.5);

      const run = animation.start({ view });
      assert.strictEqual(animation.state, TaskState.STARTED);
      assert.strictEqual(await run, 'ended');
      assert.strictEqual(view.style.opacity, '0.5');
    });

    it('should end at once with a 0 duration', async function () {
      const { view, target, animations } = makeTarget();
      const run = new OpacityAnimation(0, { duration: 0 }).start(target);
      assert.strictEqual(await run, 'ended');
      assert.strictEqual(animations.length, 0);
      assert.strictEqual(view.style.opacity, '0');
    });

    it('should not end a new run with the end of a stopped one', async function () {
      const { target, animations } = makeTarget();
      const animation = new OpacityAnimation(0);
      animation.start(target);
      animation.stop();
      const run = animation.start(target);

      animations[0].finish();   // the first, stopped, animation
      await flush();
      assert.strictEqual(animation.state, TaskState.STARTED);
      animations[1].finish();
      assert.strictEqual(await run, 'ended');
    });

    it('should throw without view', function () {
      assert.throws(() => new OpacityAnimation(0).start({ view: null }), TypeError);
      assert.throws(() => new OpacityAnimation(0).start(), TypeError);
    });

    it('should run in a sequence', async function () {
      const { view, target, animations } = makeTarget();
      const run = seq([new OpacityAnimation(0), new OpacityAnimation(1)]).start(target);

      animations[0].finish();
      await flush();
      assert.strictEqual(view.style.opacity, '0');
      animations[1].finish();
      assert.strictEqual(await run, 'ended');
      assert.strictEqual(view.style.opacity, '1');
    });

    it('should run with the Web Animations of the DOM', async function () {
      const view = document.createElement('div');
      document.body.appendChild(view);
      const run = new OpacityAnimation(0.25, { duration: 20 }).start({ view });

      assert.strictEqual(await run, 'ended');
      assert.strictEqual(view.style.opacity, '0.25');
      view.remove();
    });
  });

  describe('clone', function () {
    it('should copy the definition, with a new identity', function () {
      const animation = new TranslateAnimation(1, 2, 3, { duration: '1s' });
      animation.addKeyFrame('from', ['0px,0px,0px']);
      animation.delegate = {};
      const copy = animation.clone();

      assert.ok(copy instanceof TranslateAnimation);
      assert.notStrictEqual(copy.id, animation.id);
      assert.strictEqual(copy.delegate, undefined);
      assert.deepStrictEqual([copy.x, copy.y, copy.z, copy.duration], [1, 2, 3, '1s']);
      assert.deepStrictEqual([...copy.keyFrames], [...animation.keyFrames]);

      copy.properties.push('opacity');
      assert.deepStrictEqual(animation.properties, ['translate']);
    });

    it('should run independently', function () {
      const { target: first, animations: firstAnimations } = makeTarget();
      const { target: second } = makeTarget();
      const animation = Animation.FadeIn;
      const copy = animation.clone();

      animation.start(first);
      copy.start(second);
      assert.strictEqual(copy.state, TaskState.STARTED);
      animation.stop();
      assert.strictEqual(copy.state, TaskState.STARTED);
      assert.deepStrictEqual(firstAnimations[0].keyframes.map(k => k.opacity), ['0', '1']);
    });
  });

  describe('specific animations', function () {
    function transformOf(animation: Animation): unknown {
      const { target, animations } = makeTarget();
      animation.start(target);
      return animations[0].keyframes[0].transform;
    }

    it('should build their transforms', function () {
      assert.strictEqual(transformOf(new RotateAnimation(30)), 'rotate(30deg)');
      assert.strictEqual(transformOf(new RotateXYZAnimation(1, 2, 3)), 'rotateX(1deg) rotateY(2deg) rotate(3deg)');
      assert.strictEqual(transformOf(new ScaleAnimation(2)), 'scale(2)');
      assert.strictEqual(transformOf(new ScaleAnimation(2, 3)), 'scaleX(2) scaleY(3) scaleZ(1)');
      assert.strictEqual(transformOf(new SkewAnimation(10, 20)), 'skew(10deg,20deg)');
    });

    it('should build the opacity', function () {
      const { target, animations } = makeTarget();
      new OpacityAnimation(0.5).start(target);
      assert.strictEqual(animations[0].keyframes[0].opacity, '0.5');
    });

    it('should provide the predefined slides and fades', function () {
      const { target, animations } = makeTarget();
      Animation.SlideInRight.clone().start(target);
      assert.deepStrictEqual(animations[0].keyframes.map(k => k.transform),
        ['translateX(100px)', 'translateX(0px)']);
    });
  });
});
