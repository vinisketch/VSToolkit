/*
  COPYRIGHT NOTICE
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and
  contributors. All rights reserved

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { isNumber, isString } from 'vs_utils';
import { task } from 'vs_toolkit/vs_core';

const { Task, TaskState } = task;

/********************************************************************
                    CSS names (without vendor prefix)
*********************************************************************/

export const ANIMATION_DURATION = 'animation-duration';
export const ANIMATION_DELAY = 'animation-delay';
export const ANIMATION_NAME = 'animation-name';
export const ANIMATION_TIMING_FUNC = 'animation-timing-function';
export const ANIMATION_FILL_MODE = 'animation-fill-mode';
export const ITERATION_COUNT = 'animation-iteration-count';
export const TRANSITION_DURATION = 'transition-duration';
export const TRANSITION_DELAY = 'transition-delay';
export const TRANSITION_TIMING_FUNC = 'transition-timing-function';
export const TRANSITION_PROPERTY = 'transition-property';
export const TRANSFORM_ORIGIN = 'transform-origin';
export const TRANSFORM = 'transform';
export const KEY_FRAMES = 'keyframes';
export const ANIMATION_END = 'animationend';
export const TRANSITION_END = 'transitionend';

/********************************************************************
                    Types
*********************************************************************/

/**
 * What an animation animates: a view
 */
export interface AnimationTarget {
  readonly view: HTMLElement | null;
  /** for the $width and $height variables */
  readonly size?: number[];
  /** for the $x and $y variables */
  readonly position?: number[];
  /** the current transform, for the additive animations */
  getCTM?(): DOMMatrix;
}

/**
 * A property and its value, e.g. ['opacity', '0'] or
 * ['translate', '${x}px,${y}px,0']
 */
export type AnimationProperty = [property: string, value: string];

/**
 * The values of a key frame: one per property (in the same order), or the
 * variables used by the property values
 */
export type KeyFrameValues = (string | null | undefined)[] | Record<string, unknown>;

export interface AnimationOptions {
  /** CSS time ('0.3s', '200ms') or ms */
  duration?: string | number;
  /** CSS timing function ('ease', 'linear'…) */
  timing?: string;
  /** transform origin, in % of the view size */
  origin?: [number, number];
  /** number of iterations, or 'infinite' */
  iterationCount?: number | 'infinite';
  /** delay before the animation starts, in ms */
  delay?: number;
  /** the transforms are applied after the current transform of the view */
  additive?: boolean;
}

/**
 * The transform functions, by animated property
 */
const TRANSFORM_FUNCTIONS: Record<string, string> = {
  rotate: 'rotate', rotateX: 'rotateX', rotateY: 'rotateY',
  skew: 'skew',
  translate: 'translate3d', translateX: 'translateX', translateY: 'translateY',
  scale: 'scale', scaleX: 'scaleX', scaleY: 'scaleY', scaleZ: 'scaleZ',
  perspective: 'perspective',
};

const VARIABLE_REGEXP = /\$\{(\w+)\}/g;

/**
 * Converts a CSS time ('0.3s', '200ms', or ms) into ms
 */
function toMs(time: string | number | undefined, defaultMs: number): number {
  if (isNumber(time)) return time;
  if (!isString(time)) return defaultMs;
  const value = parseFloat(time);
  if (Number.isNaN(value)) return defaultMs;
  return time.trim().endsWith('ms') ? value : value * 1000;
}

/**
 * background-color -> backgroundColor (the Web Animations keyframe names)
 */
function camelize(property: string): string {
  return property.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
}

interface BuiltKeyframes {
  keyframes: Keyframe[];
  /** the final values: [CSS property, value] */
  final: [string, string][];
}

/**
 *  @class
 *  An animation of the CSS properties of a view, as a Task: start(view)
 *  runs it, pause()/resume()/stop() control it, and its promise (or
 *  taskDidEnd, on('end')) tells its end. It uses the Web Animations API
 *  (element.animate); when it is not available, the final values are
 *  applied at once.
 *  <p>
 *  An animation is defined by properties and their values: CSS properties,
 *  or transforms (translate, translateX, translateY, rotate, rotateX,
 *  rotateY, scale, scaleX, scaleY, scaleZ, skew, perspective). The values
 *  may contain variables: ${name} (a field of the animation, or a key frame
 *  variable), $width, $height, $x, $y (the size and position of the view).
 *  <p>
 *  By default it animates from the current values to the given ones; key
 *  frames (addKeyFrame) define other steps.
 *
 *  @example
 *  const fade = new Animation([['opacity', '0']], { duration: '1s' });
 *  await fade.start(view);
 *
 *  const slide = new Animation([['translateX', '0px']]);
 *  slide.addKeyFrame('from', ['$width']);
 *
 *  seq([fade, slide]).start(view);
 *
 * @name vs.fx.Animation
 */
export class Animation extends Task {
  static readonly DEFAULT_DURATION = '0.3s';
  static readonly EASE = 'ease';
  static readonly LINEAR = 'linear';
  static readonly EASE_IN = 'ease-in';
  static readonly EASE_OUT = 'ease-out';
  static readonly EASE_IN_OUT = 'ease-in-out';
  static readonly DEFAULT_TIMING = Animation.EASE;

  /** the animated properties */
  properties: string[] = [];
  /** the final values of the properties */
  values: string[] = [];
  /** the key frames, by position ('0%' … '100%') */
  keyFrames = new Map<string, KeyFrameValues>();

  duration: string | number = Animation.DEFAULT_DURATION;
  timing: string = Animation.DEFAULT_TIMING;
  origin: [number, number] | undefined;
  iterationCount: number | 'infinite' = 1;
  delay = 0;
  additive = true;

  #animation: globalThis.Animation | undefined;
  #run = 0;

  constructor(animations: AnimationProperty[] = [], options: AnimationOptions & task.TaskOptions = {}) {
    super(options);
    this.setAnimations(animations);
    this.setOptions(options);
  }

  /**
   *  Sets the animated properties and their final values
   *
   * @param {Array} animations the [property, value] pairs
   */
  setAnimations(animations: AnimationProperty[]): void {
    this.properties = [];
    this.values = [];
    for (const animation of animations) {
      if (!Array.isArray(animation) || animation.length !== 2 ||
          !isString(animation[0]) || !isString(animation[1])) {
        console.warn(`vs.fx.Animation, invalid animation: ${animation}`);
        continue;
      }
      this.properties.push(animation[0]);
      this.values.push(animation[1]);
    }
  }

  /**
   *  Sets the options (duration, timing, origin, iterationCount, delay,
   *  additive) given
   */
  setOptions(options: AnimationOptions): void {
    if (options.duration !== undefined) this.duration = options.duration;
    if (options.timing !== undefined) this.timing = options.timing;
    if (options.origin !== undefined) this.origin = options.origin;
    if (options.iterationCount !== undefined) this.iterationCount = options.iterationCount;
    if (options.delay !== undefined) this.delay = options.delay;
    if (options.additive !== undefined) this.additive = options.additive;
  }

  /**
   *  Adds a key frame
   *
   * @param {String|number} position 'from' (0%), 'to' (100%), or a %
   * @param {Array|Object} values the values (one per property), or the
   *        variables used by the property values
   */
  addKeyFrame(position: 'from' | 'to' | number, values: KeyFrameValues): void {
    if (!values) return;
    if (position === 'from') position = 0;
    if (position === 'to') position = 100;
    if (!isNumber(position) || position < 0 || position > 100) return;
    this.keyFrames.set(`${position}%`, values);
  }

  /**
   *  Returns a new animation with the same definition, e.g. to run it on
   *  several views at the same time
   */
  clone(): this {
    const Class = this.constructor as new () => this;
    const copy = new Class();
    for (const [key, value] of Object.entries(this)) {
      // the fields of the subclasses (x, y, deg…) and the definition, not
      // the identity (id) nor the delegate of this animation
      if (key === 'id' || key === 'delegate') continue;
      (copy as Record<string, unknown>)[key] = Array.isArray(value) ? value.slice() : value;
    }
    copy.keyFrames = new Map(this.keyFrames);
    copy.origin = this.origin?.slice() as [number, number] | undefined;
    return copy;
  }

  /*****************************************************************
   *  Task implementation
   ****************************************************************/

  /**
   *  Starts the animation on a view (the task parameter).
   *  Throws if the parameter is not a view.
   */
  protected override doStart(param?: unknown): boolean {
    const target = param as AnimationTarget | undefined;
    const view = target?.view;
    if (!view) {
      throw new TypeError('Animation.start: the parameter must be a view (with a DOM node)');
    }

    const { keyframes, final } = this.#buildKeyframes(target!);
    if (this.origin) {
      view.style.setProperty(TRANSFORM_ORIGIN, `${this.origin[0]}% ${this.origin[1]}%`);
    }

    const run = ++this.#run;
    this.state = TaskState.STARTED;

    const duration = toMs(this.duration, 300);
    if (typeof view.animate !== 'function' || (duration === 0 && this.delay === 0)) {
      // no animation: the final values at once, the end asynchronously
      queueMicrotask(() => this.#end(run, view, final));
    } else {
      const animation = view.animate(keyframes, {
        duration,
        delay: this.delay,
        easing: this.timing,
        iterations: this.iterationCount === 'infinite' ? Infinity : this.iterationCount,
        fill: 'forwards',
      });
      animation.onfinish = () => this.#end(run, view, final);
      this.#animation = animation;
    }

    this.notify('taskDidStart');
    return true;
  }

  stop(): boolean {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.#run++;
    this.#animation?.cancel();
    this.#animation = undefined;
    this.state = TaskState.STOPPED;
    this.notify('taskDidStop');
    return true;
  }

  pause(): boolean {
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.#animation?.pause();
    this.state = TaskState.PAUSED;
    this.notify('taskDidPause');
    return true;
  }

  resume(): boolean {
    if (this.state !== TaskState.PAUSED) {
      return false;
    }
    this.#animation?.play();
    this.state = TaskState.STARTED;
    this.notify('taskDidResume');
    return true;
  }

  /**
   * The end of a run: the final values are applied on the view (they stay
   * once the animation is removed)
   */
  #end(run: number, view: HTMLElement, final: [string, string][]): void {
    if (run !== this.#run || this.state === TaskState.STOPPED) return;

    for (const [property, value] of final) {
      view.style.setProperty(property, value);
    }
    this.#animation?.cancel();
    this.#animation = undefined;
    this.state = TaskState.STOPPED;
    this.notify('taskDidEnd');
  }

  /*****************************************************************
   *  Key frames
   ****************************************************************/

  #buildKeyframes(target: AnimationTarget): BuiltKeyframes {
    const steps = new Map(this.keyFrames);
    if (!steps.has('100%')) steps.set('100%', this.values);

    const sorted = [...steps.entries()].sort(([a], [b]) => parseFloat(a) - parseFloat(b));
    const transformPrefix = this.additive && target.getCTM ? `${target.getCTM().toString()} ` : '';

    let final: [string, string][] = [];
    const keyframes = sorted.map(([position, data]) => {
      const values = Array.isArray(data)
        ? data.map(value => (value === null || value === undefined) ? undefined : this.#parseValue(value, target, {}))
        : this.values.map(value => this.#parseValue(value, target, data));

      const keyframe: Keyframe = { offset: parseFloat(position) / 100 };
      const css: [string, string][] = [];
      let transform = '';
      values.forEach((value, i) => {
        const property = this.properties[i];
        if (value === undefined || !property) return;

        const func = TRANSFORM_FUNCTIONS[property];
        if (func) {
          // translate with two values: 2D
          const name = func === 'translate3d' && value.split(',').length < 3 ? 'translate' : func;
          transform += `${name}(${value}) `;
        } else {
          keyframe[camelize(property)] = value;
          css.push([property, value]);
        }
      });
      if (transform) {
        keyframe.transform = (transformPrefix + transform).trim();
        css.push([TRANSFORM, keyframe.transform as string]);
      }
      if (keyframe.offset === 1) final = css;
      return keyframe;
    });

    return { keyframes, final };
  }

  #parseValue(value: string, target: AnimationTarget, variables: Record<string, unknown>): string {
    const size = target.size ?? [0, 0];
    const position = target.position ?? [0, 0];
    return value
      .replace(/\$width/g, `${size[0]}px`)
      .replace(/\$height/g, `${size[1]}px`)
      .replace(/\$x/g, `${position[0]}px`)
      .replace(/\$y/g, `${position[1]}px`)
      .replace(VARIABLE_REGEXP, (tag, name: string) => {
        const variable = name in variables ? variables[name] : (this as unknown as Record<string, unknown>)[name];
        return variable === undefined ? tag : String(variable);
      });
  }

  /*****************************************************************
   *  Predefined animations (to clone, see View.setShowAnimation)
   ****************************************************************/

  static SlideOutRight: Animation;
  static SlideOutLeft: Animation;
  static SlideOutTop: Animation;
  static SlideOutBottom: Animation;
  static SlideInRight: Animation;
  static SlideInLeft: Animation;
  static SlideInTop: Animation;
  static SlideInBottom: Animation;
  static FadeIn: Animation;
  static FadeOut: Animation;
}

/********************************************************************
                    Specific animations
*********************************************************************/

/**
 * Translates the view by (x, y, z) px
 */
export class TranslateAnimation extends Animation {
  constructor(public x = 0, public y = 0, public z = 0, options?: AnimationOptions & task.TaskOptions) {
    super([['translate', '${x}px,${y}px,${z}px']], options);
  }
}

/**
 * Rotates the view by deg degrees
 */
export class RotateAnimation extends Animation {
  constructor(public deg = 0, options?: AnimationOptions & task.TaskOptions) {
    super([['rotate', '${deg}deg']], options);
  }
}

/**
 * Rotates the view around the x, y and z axes, in degrees
 */
export class RotateXYZAnimation extends Animation {
  constructor(public degX = 0, public degY = 0, public degZ = 0, options?: AnimationOptions & task.TaskOptions) {
    super([['rotateX', '${degX}deg'], ['rotateY', '${degY}deg'], ['rotate', '${degZ}deg']], options);
  }
}

/**
 * Scales the view: by sx on both axes, or by (sx, sy, sz)
 */
export class ScaleAnimation extends Animation {
  sx: number;
  sy: number;
  sz: number;

  constructor(sx = 1, sy?: number, sz?: number, options?: AnimationOptions & task.TaskOptions) {
    super(sy === undefined && sz === undefined
      ? [['scale', '${sx}']]
      : [['scaleX', '${sx}'], ['scaleY', '${sy}'], ['scaleZ', '${sz}']], options);
    this.sx = sx;
    this.sy = sy ?? sx;
    this.sz = sz ?? 1;
  }
}

/**
 * Skews the view by (ax, ay) degrees
 */
export class SkewAnimation extends Animation {
  constructor(public ax = 0, public ay = 0, options?: AnimationOptions & task.TaskOptions) {
    super([['skew', '${ax}deg,${ay}deg']], options);
  }
}

/**
 * Changes the opacity of the view
 */
export class OpacityAnimation extends Animation {
  constructor(public value = 1, options?: AnimationOptions & task.TaskOptions) {
    super([['opacity', '${value}']], options);
  }
}

function predefined(property: string, to: string, from: string): Animation {
  const animation = new Animation([[property, to]]);
  animation.addKeyFrame('from', [from]);
  return animation;
}

Animation.SlideOutRight = predefined('translateX', '$width', '0px');
Animation.SlideOutLeft = predefined('translateX', '-$width', '0px');
Animation.SlideOutTop = predefined('translateY', '-$height', '0px');
Animation.SlideOutBottom = predefined('translateY', '$height', '0px');
Animation.SlideInRight = predefined('translateX', '0px', '$width');
Animation.SlideInLeft = predefined('translateX', '0px', '-$width');
Animation.SlideInTop = predefined('translateY', '0px', '-$height');
Animation.SlideInBottom = predefined('translateY', '0px', '$height');
Animation.FadeIn = predefined('opacity', '1', '0');
Animation.FadeOut = predefined('opacity', '0', '1');

export default Animation;
