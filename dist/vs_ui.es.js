import { isString, isNumber, asError, isFunction, isArray, createId } from 'vs_utils';
import { getElementAbsolutePosition, setElementStyle, addCssRules, addCssRule, setElementVisibility, setElementTransform } from 'vs_ui_utils';
import { task, Model, Component, InOut, In, Out } from 'vs_toolkit/vs_core';

var __defProp$q = Object.defineProperty;
var __typeError$t = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$q = (obj, key, value) => key in obj ? __defProp$q(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$q = (obj, key, value) => __defNormalProp$q(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$t = (obj, member, msg) => member.has(obj) || __typeError$t("Cannot " + msg);
var __privateGet$s = (obj, member, getter) => (__accessCheck$t(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$t = (obj, member, value) => member.has(obj) ? __typeError$t("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$s = (obj, member, value, setter) => (__accessCheck$t(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$l = (obj, member, method) => (__accessCheck$t(obj, member, "access private method"), method);
var __privateWrapper$1 = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet$s(obj, member, value);
  },
  get _() {
    return __privateGet$s(obj, member, getter);
  }
});
var _animation, _run, _Animation_instances, end_fn, buildKeyframes_fn, parseValue_fn;
const { Task, TaskState } = task;
const ANIMATION_DURATION = "animation-duration";
const ANIMATION_DELAY = "animation-delay";
const ANIMATION_NAME = "animation-name";
const ANIMATION_TIMING_FUNC = "animation-timing-function";
const ANIMATION_FILL_MODE = "animation-fill-mode";
const ITERATION_COUNT = "animation-iteration-count";
const TRANSITION_DURATION = "transition-duration";
const TRANSITION_DELAY = "transition-delay";
const TRANSITION_TIMING_FUNC = "transition-timing-function";
const TRANSITION_PROPERTY = "transition-property";
const TRANSFORM_ORIGIN = "transform-origin";
const TRANSFORM = "transform";
const KEY_FRAMES = "keyframes";
const ANIMATION_END = "animationend";
const TRANSITION_END = "transitionend";
const TRANSFORM_FUNCTIONS = {
  rotate: "rotate",
  rotateX: "rotateX",
  rotateY: "rotateY",
  skew: "skew",
  translate: "translate3d",
  translateX: "translateX",
  translateY: "translateY",
  scale: "scale",
  scaleX: "scaleX",
  scaleY: "scaleY",
  scaleZ: "scaleZ",
  perspective: "perspective"
};
const VARIABLE_REGEXP = /\$\{(\w+)\}/g;
function toMs(time, defaultMs) {
  if (isNumber(time)) return time;
  if (!isString(time)) return defaultMs;
  const value = parseFloat(time);
  if (Number.isNaN(value)) return defaultMs;
  return time.trim().endsWith("ms") ? value : value * 1e3;
}
function camelize(property) {
  return property.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
}
const _Animation = class _Animation extends Task {
  constructor(animations = [], options = {}) {
    super(options);
    __privateAdd$t(this, _Animation_instances);
    /** the animated properties */
    __publicField$q(this, "properties", []);
    /** the final values of the properties */
    __publicField$q(this, "values", []);
    /** the key frames, by position ('0%' … '100%') */
    __publicField$q(this, "keyFrames", /* @__PURE__ */ new Map());
    __publicField$q(this, "duration", _Animation.DEFAULT_DURATION);
    __publicField$q(this, "timing", _Animation.DEFAULT_TIMING);
    __publicField$q(this, "origin");
    __publicField$q(this, "iterationCount", 1);
    __publicField$q(this, "delay", 0);
    __publicField$q(this, "additive", true);
    __privateAdd$t(this, _animation);
    __privateAdd$t(this, _run, 0);
    this.setAnimations(animations);
    this.setOptions(options);
  }
  /**
   *  Sets the animated properties and their final values
   *
   * @param {Array} animations the [property, value] pairs
   */
  setAnimations(animations) {
    this.properties = [];
    this.values = [];
    for (const animation of animations) {
      if (!Array.isArray(animation) || animation.length !== 2 || !isString(animation[0]) || !isString(animation[1])) {
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
  setOptions(options) {
    if (options.duration !== void 0) this.duration = options.duration;
    if (options.timing !== void 0) this.timing = options.timing;
    if (options.origin !== void 0) this.origin = options.origin;
    if (options.iterationCount !== void 0) this.iterationCount = options.iterationCount;
    if (options.delay !== void 0) this.delay = options.delay;
    if (options.additive !== void 0) this.additive = options.additive;
  }
  /**
   *  Adds a key frame
   *
   * @param {String|number} position 'from' (0%), 'to' (100%), or a %
   * @param {Array|Object} values the values (one per property), or the
   *        variables used by the property values
   */
  addKeyFrame(position, values) {
    if (!values) return;
    if (position === "from") position = 0;
    if (position === "to") position = 100;
    if (!isNumber(position) || position < 0 || position > 100) return;
    this.keyFrames.set(`${position}%`, values);
  }
  /**
   *  Returns a new animation with the same definition, e.g. to run it on
   *  several views at the same time
   */
  clone() {
    const Class = this.constructor;
    const copy = new Class();
    for (const [key, value] of Object.entries(this)) {
      if (key === "id" || key === "delegate") continue;
      copy[key] = Array.isArray(value) ? value.slice() : value;
    }
    copy.keyFrames = new Map(this.keyFrames);
    copy.origin = this.origin?.slice();
    return copy;
  }
  /*****************************************************************
   *  Task implementation
   ****************************************************************/
  /**
   *  Starts the animation on a view (the task parameter).
   *  Throws if the parameter is not a view.
   */
  doStart(param) {
    const target = param;
    const view = target?.view;
    if (!view) {
      throw new TypeError("Animation.start: the parameter must be a view (with a DOM node)");
    }
    const { keyframes, final } = __privateMethod$l(this, _Animation_instances, buildKeyframes_fn).call(this, target);
    if (this.origin) {
      view.style.setProperty(TRANSFORM_ORIGIN, `${this.origin[0]}% ${this.origin[1]}%`);
    }
    const run = ++__privateWrapper$1(this, _run)._;
    this.state = TaskState.STARTED;
    const duration = toMs(this.duration, 300);
    if (typeof view.animate !== "function" || duration === 0 && this.delay === 0) {
      queueMicrotask(() => __privateMethod$l(this, _Animation_instances, end_fn).call(this, run, view, final));
    } else {
      const animation = view.animate(keyframes, {
        duration,
        delay: this.delay,
        easing: this.timing,
        iterations: this.iterationCount === "infinite" ? Infinity : this.iterationCount,
        fill: "forwards"
      });
      animation.onfinish = () => __privateMethod$l(this, _Animation_instances, end_fn).call(this, run, view, final);
      __privateSet$s(this, _animation, animation);
    }
    this.notify("taskDidStart");
    return true;
  }
  stop() {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    __privateWrapper$1(this, _run)._++;
    __privateGet$s(this, _animation)?.cancel();
    __privateSet$s(this, _animation, void 0);
    this.state = TaskState.STOPPED;
    this.notify("taskDidStop");
    return true;
  }
  pause() {
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    __privateGet$s(this, _animation)?.pause();
    this.state = TaskState.PAUSED;
    this.notify("taskDidPause");
    return true;
  }
  resume() {
    if (this.state !== TaskState.PAUSED) {
      return false;
    }
    __privateGet$s(this, _animation)?.play();
    this.state = TaskState.STARTED;
    this.notify("taskDidResume");
    return true;
  }
};
_animation = new WeakMap();
_run = new WeakMap();
_Animation_instances = new WeakSet();
/**
 * The end of a run: the final values are applied on the view (they stay
 * once the animation is removed)
 */
end_fn = function(run, view, final) {
  if (run !== __privateGet$s(this, _run) || this.state === TaskState.STOPPED) return;
  for (const [property, value] of final) {
    view.style.setProperty(property, value);
  }
  __privateGet$s(this, _animation)?.cancel();
  __privateSet$s(this, _animation, void 0);
  this.state = TaskState.STOPPED;
  this.notify("taskDidEnd");
};
/*****************************************************************
 *  Key frames
 ****************************************************************/
buildKeyframes_fn = function(target) {
  const steps = new Map(this.keyFrames);
  if (!steps.has("100%")) steps.set("100%", this.values);
  const sorted = [...steps.entries()].sort(([a], [b]) => parseFloat(a) - parseFloat(b));
  const transformPrefix = this.additive && target.getCTM ? `${target.getCTM().toString()} ` : "";
  let final = [];
  const keyframes = sorted.map(([position, data]) => {
    const values = Array.isArray(data) ? data.map((value) => value === null || value === void 0 ? void 0 : __privateMethod$l(this, _Animation_instances, parseValue_fn).call(this, value, target, {})) : this.values.map((value) => __privateMethod$l(this, _Animation_instances, parseValue_fn).call(this, value, target, data));
    const keyframe = { offset: parseFloat(position) / 100 };
    const css = [];
    let transform = "";
    values.forEach((value, i) => {
      const property = this.properties[i];
      if (value === void 0 || !property) return;
      const func = TRANSFORM_FUNCTIONS[property];
      if (func) {
        const name = func === "translate3d" && value.split(",").length < 3 ? "translate" : func;
        transform += `${name}(${value}) `;
      } else {
        keyframe[camelize(property)] = value;
        css.push([property, value]);
      }
    });
    if (transform) {
      keyframe.transform = (transformPrefix + transform).trim();
      css.push([TRANSFORM, keyframe.transform]);
    }
    if (keyframe.offset === 1) final = css;
    return keyframe;
  });
  return { keyframes, final };
};
parseValue_fn = function(value, target, variables) {
  const size = target.size ?? [0, 0];
  const position = target.position ?? [0, 0];
  return value.replace(/\$width/g, `${size[0]}px`).replace(/\$height/g, `${size[1]}px`).replace(/\$x/g, `${position[0]}px`).replace(/\$y/g, `${position[1]}px`).replace(VARIABLE_REGEXP, (tag, name) => {
    const variable = name in variables ? variables[name] : this[name];
    return variable === void 0 ? tag : String(variable);
  });
};
__publicField$q(_Animation, "DEFAULT_DURATION", "0.3s");
__publicField$q(_Animation, "EASE", "ease");
__publicField$q(_Animation, "LINEAR", "linear");
__publicField$q(_Animation, "EASE_IN", "ease-in");
__publicField$q(_Animation, "EASE_OUT", "ease-out");
__publicField$q(_Animation, "EASE_IN_OUT", "ease-in-out");
__publicField$q(_Animation, "DEFAULT_TIMING", _Animation.EASE);
/*****************************************************************
 *  Predefined animations (to clone, see View.setShowAnimation)
 ****************************************************************/
__publicField$q(_Animation, "SlideOutRight");
__publicField$q(_Animation, "SlideOutLeft");
__publicField$q(_Animation, "SlideOutTop");
__publicField$q(_Animation, "SlideOutBottom");
__publicField$q(_Animation, "SlideInRight");
__publicField$q(_Animation, "SlideInLeft");
__publicField$q(_Animation, "SlideInTop");
__publicField$q(_Animation, "SlideInBottom");
__publicField$q(_Animation, "FadeIn");
__publicField$q(_Animation, "FadeOut");
let Animation = _Animation;
class TranslateAnimation extends Animation {
  constructor(x = 0, y = 0, z = 0, options) {
    super([["translate", "${x}px,${y}px,${z}px"]], options);
    __publicField$q(this, "x", x);
    __publicField$q(this, "y", y);
    __publicField$q(this, "z", z);
  }
}
class RotateAnimation extends Animation {
  constructor(deg = 0, options) {
    super([["rotate", "${deg}deg"]], options);
    __publicField$q(this, "deg", deg);
  }
}
class RotateXYZAnimation extends Animation {
  constructor(degX = 0, degY = 0, degZ = 0, options) {
    super([["rotateX", "${degX}deg"], ["rotateY", "${degY}deg"], ["rotate", "${degZ}deg"]], options);
    __publicField$q(this, "degX", degX);
    __publicField$q(this, "degY", degY);
    __publicField$q(this, "degZ", degZ);
  }
}
class ScaleAnimation extends Animation {
  constructor(sx = 1, sy, sz, options) {
    super(sy === void 0 && sz === void 0 ? [["scale", "${sx}"]] : [["scaleX", "${sx}"], ["scaleY", "${sy}"], ["scaleZ", "${sz}"]], options);
    __publicField$q(this, "sx");
    __publicField$q(this, "sy");
    __publicField$q(this, "sz");
    this.sx = sx;
    this.sy = sy ?? sx;
    this.sz = sz ?? 1;
  }
}
class SkewAnimation extends Animation {
  constructor(ax = 0, ay = 0, options) {
    super([["skew", "${ax}deg,${ay}deg"]], options);
    __publicField$q(this, "ax", ax);
    __publicField$q(this, "ay", ay);
  }
}
class OpacityAnimation extends Animation {
  constructor(value = 1, options) {
    super([["opacity", "${value}"]], options);
    __publicField$q(this, "value", value);
  }
}
function predefined(property, to, from) {
  const animation = new Animation([[property, to]]);
  animation.addKeyFrame("from", [from]);
  return animation;
}
Animation.SlideOutRight = predefined("translateX", "$width", "0px");
Animation.SlideOutLeft = predefined("translateX", "-$width", "0px");
Animation.SlideOutTop = predefined("translateY", "-$height", "0px");
Animation.SlideOutBottom = predefined("translateY", "$height", "0px");
Animation.SlideInRight = predefined("translateX", "0px", "$width");
Animation.SlideInLeft = predefined("translateX", "0px", "-$width");
Animation.SlideInTop = predefined("translateY", "0px", "-$height");
Animation.SlideInBottom = predefined("translateY", "0px", "$height");
Animation.FadeIn = predefined("opacity", "1", "0");
Animation.FadeOut = predefined("opacity", "0", "1");

var __defProp$p = Object.defineProperty;
var __typeError$s = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$p = (obj, key, value) => key in obj ? __defProp$p(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$p = (obj, key, value) => __defNormalProp$p(obj, key + "" , value);
var __accessCheck$s = (obj, member, msg) => member.has(obj) || __typeError$s("Cannot " + msg);
var __privateGet$r = (obj, member, getter) => (__accessCheck$s(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$s = (obj, member, value) => member.has(obj) ? __typeError$s("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$r = (obj, member, value, setter) => (__accessCheck$s(obj, member, "write to private field"), member.set(obj, value), value);
var _target, _view, _isTracking, _onPointerDown, _onPointerMove, _onPointerUp, _onPointerCancel;
const MOVE_THRESHOLD = 20;
class PointerRecognizer {
  constructor(delegate) {
    /**
     * The object called when the gesture is recognized
     */
    __publicField$p(this, "delegate");
    __privateAdd$s(this, _target);
    __privateAdd$s(this, _view);
    __privateAdd$s(this, _isTracking, false);
    __privateAdd$s(this, _onPointerDown, (event) => {
      if (__privateGet$r(this, _target)?.enable === false) return;
      this.pointerDown(event);
    });
    __privateAdd$s(this, _onPointerMove, (event) => {
      this.pointerMove(event);
    });
    __privateAdd$s(this, _onPointerUp, (event) => {
      this.pointerUp(event);
    });
    __privateAdd$s(this, _onPointerCancel, (event) => {
      this.pointerCancel(event);
    });
    this.delegate = delegate;
  }
  /**
   * The target (view) the recognizer is attached to
   */
  get target() {
    return __privateGet$r(this, _target);
  }
  /**
   *  Attaches the recognizer to a target (see View.addPointerRecognizer)
   */
  attach(target) {
    this.detach();
    if (!target.view) return;
    __privateSet$r(this, _target, target);
    __privateSet$r(this, _view, target.view);
    __privateGet$r(this, _view).addEventListener("pointerdown", __privateGet$r(this, _onPointerDown));
    this.didAttach(__privateGet$r(this, _view));
  }
  /**
   *  Detaches the recognizer from its target
   */
  detach() {
    if (!__privateGet$r(this, _view)) return;
    this.stopTracking();
    __privateGet$r(this, _view).removeEventListener("pointerdown", __privateGet$r(this, _onPointerDown));
    this.willDetach(__privateGet$r(this, _view));
    this.reset();
    __privateSet$r(this, _view, void 0);
    __privateSet$r(this, _target, void 0);
  }
  /*****************************************************************
   *  Subclass hooks
   ****************************************************************/
  /** called once attached to the view */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  didAttach(view) {
  }
  /** called before being detached from the view */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  willDetach(view) {
  }
  /** resets the recognition state */
  // eslint-disable-next-line class-methods-use-this
  reset() {
  }
  /** a pointer went down on the view */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  pointerDown(event) {
  }
  /** a pointer moved, while tracking */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  pointerMove(event) {
  }
  /** a pointer went up, while tracking */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  pointerUp(event) {
  }
  /** a pointer was cancelled, while tracking: a pointer up by default */
  pointerCancel(event) {
    this.pointerUp(event);
  }
  /*****************************************************************
   *  Helpers
   ****************************************************************/
  /**
   *  Follows the pointers on the document (move, up, cancel)
   */
  startTracking() {
    if (__privateGet$r(this, _isTracking)) return;
    __privateSet$r(this, _isTracking, true);
    document.addEventListener("pointermove", __privateGet$r(this, _onPointerMove));
    document.addEventListener("pointerup", __privateGet$r(this, _onPointerUp));
    document.addEventListener("pointercancel", __privateGet$r(this, _onPointerCancel));
  }
  /**
   *  Stops following the pointers on the document
   */
  stopTracking() {
    if (!__privateGet$r(this, _isTracking)) return;
    __privateSet$r(this, _isTracking, false);
    document.removeEventListener("pointermove", __privateGet$r(this, _onPointerMove));
    document.removeEventListener("pointerup", __privateGet$r(this, _onPointerUp));
    document.removeEventListener("pointercancel", __privateGet$r(this, _onPointerCancel));
  }
  /**
   *  Calls a method of the delegate, if it exists; an exception it throws is
   *  logged
   */
  notify(method, ...args) {
    const callback = this.delegate?.[method];
    if (typeof callback !== "function") return;
    try {
      callback.apply(this.delegate, args);
    } catch (e) {
      const err = asError(e);
      if (err.stack) console.log(err.stack);
      console.error(err);
    }
  }
}
_target = new WeakMap();
_view = new WeakMap();
_isTracking = new WeakMap();
_onPointerDown = new WeakMap();
_onPointerMove = new WeakMap();
_onPointerUp = new WeakMap();
_onPointerCancel = new WeakMap();

var __defProp$o = Object.defineProperty;
var __defNormalProp$o = (obj, key, value) => key in obj ? __defProp$o(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$o = (obj, key, value) => __defNormalProp$o(obj, key + "" , value);
const TEMPLATE_TAG = /\$\{([\w-]+(?:\.[\w.]+)?)\}/g;
class Template {
  constructor(html) {
    __publicField$o(this, "html", html);
  }
  /**
   * The HTML string of the template
   */
  toString() {
    return this.html;
  }
  /**
   *  Returns the HTML string of the template, with its tags replaced by the
   *  values ('' for a missing value).
   *
   * @param {Object} values the values, by tag name
   * @return {String} the HTML string
   */
  apply(values) {
    if (!values) return this.html;
    return this.html.replace(TEMPLATE_TAG, (_tag, path) => {
      let value = values;
      for (const key of path.split(".")) {
        value = value?.[key];
      }
      return value === void 0 || value === null ? "" : String(value);
    });
  }
  /**
   *  Parses the template into a new DOM node (see parseHTML).
   *
   * @return {HTMLElement} the node, undefined if the template has no element
   */
  node() {
    return Template.parseHTML(this.html);
  }
  /**
   *  Parses an HTML string into a DOM node: its first element, detached.
   *
   * @param {String} html the HTML string
   * @return {HTMLElement} the node, undefined if the HTML has no element
   */
  static parseHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html.trim();
    const node = div.firstElementChild;
    node?.remove();
    return node ?? void 0;
  }
}

var html_template$m = "<div class=\"vs_ui_view\" x-hag-hole=\"children\"></div>";

var __create$m = Object.create;
var __defProp$n = Object.defineProperty;
var __getOwnPropDesc$m = Object.getOwnPropertyDescriptor;
var __knownSymbol$m = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$r = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$n = (obj, key, value) => key in obj ? __defProp$n(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$m = (base) => [, , , __create$m(base?.[__knownSymbol$m("metadata")] ?? null)];
var __decoratorStrings$m = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$m = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$r("Function expected") : fn;
var __decoratorContext$m = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$m[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$r("Already initialized") : fns.push(__expectFn$m(fn || null)) });
var __decoratorMetadata$m = (array, target) => __defNormalProp$n(target, __knownSymbol$m("metadata"), array[3]);
var __runInitializers$m = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$m = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$m[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$m(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$m(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$m(it) && (desc[key] = it );
  }
  return desc && __defProp$n(target, name, desc), target;
};
var __publicField$n = (obj, key, value) => __defNormalProp$n(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$r = (obj, member, msg) => member.has(obj) || __typeError$r("Cannot " + msg);
var __privateGet$q = (obj, member, getter) => (__accessCheck$r(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$r = (obj, member, value) => member.has(obj) ? __typeError$r("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$q = (obj, member, value, setter) => (__accessCheck$r(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$k = (obj, member, method) => (__accessCheck$r(obj, member, "access private method"), method);
var _transformOrigin_dec, _maxScale_dec, _minScale_dec, _scaling_dec, _rotation_dec, _translation_dec, _bubbling_dec, _opacity_dec, _enable_dec, _hideAnimation_dec, _showAnimation_dec, _visible_dec, _innerHTML_dec, _layout_dec, _magnet_dec, _autosizing_dec, _position_dec, _size_dec, _a$m, _registry, _options, _pos, _size, _autosizing, _magnet, _layout$1, _translation, _rotation, _transformOrigin, _scaling, _minScale, _maxScale, _transformsStack, _visible, _enable, _opacity, _bubbling, _showAnimation, _showCallback, _hideAnimation, _hideCallback, _isShowing, _isHiding, _isSettingVisible, _viewDisplay, _parent, _holes, _children, _initChildren, _isInitializing, _recognizers, _pointerHandlers, _View_instances, getNode_fn, findNode_fn, parseHoles_fn, nodeOptions_fn, _init$m, updateSizeAndPos_fn, showObject_fn, hideObject_fn, makeAnimation_fn, applyTransformation_fn;
const NODE_OPTIONS = /* @__PURE__ */ new Set(["id", "node", "nodeId", "nodeRef", "rootRef", "templateRef", "template"]);
function nodeOfChild(child) {
  return child.view ?? void 0;
}
const POINTER_EVENT_TYPES = /* @__PURE__ */ new Set(["pointerdown", "pointermove", "pointerup", "pointercancel"]);
const componentOfNode = /* @__PURE__ */ new WeakMap();
let applicationTemplates;
const loadedTemplates = /* @__PURE__ */ new Map();
function later(func) {
  setTimeout(func, 0);
}
function findNodeRef(node, ref) {
  if (!node?.getAttribute) return void 0;
  if (node.getAttribute("x-hag-ref") === ref || node.getAttribute("x-hag-comp") === ref) return node;
  for (let child = node.firstElementChild; child; child = child.nextElementSibling) {
    const result = findNodeRef(child, ref);
    if (result) return result;
  }
  return void 0;
}
function copyAnimationOptions(animation, options) {
  if (!options) return;
  animation.setOptions(options);
}
const _View = class _View extends (_a$m = Model, _size_dec = [InOut], _position_dec = [InOut], _autosizing_dec = [InOut], _magnet_dec = [InOut], _layout_dec = [InOut], _innerHTML_dec = [In], _visible_dec = [InOut], _showAnimation_dec = [InOut], _hideAnimation_dec = [InOut], _enable_dec = [InOut], _opacity_dec = [InOut], _bubbling_dec = [InOut], _translation_dec = [InOut], _rotation_dec = [InOut], _scaling_dec = [InOut], _minScale_dec = [InOut], _maxScale_dec = [InOut], _transformOrigin_dec = [InOut], _a$m) {
  constructor(options = {}) {
    super(options.id);
    __runInitializers$m(_init$m, 5, this);
    __privateAdd$r(this, _View_instances);
    /********************************************************************
                      Fields
    *********************************************************************/
    /** the DOM node of the view, once initialized */
    __publicField$n(this, "view", null);
    /** the HTML template of the view, used without node in the options */
    __publicField$n(this, "htmlTemplate", html_template$m);
    __privateAdd$r(this, _options);
    __privateAdd$r(this, _pos, [-1, -1]);
    __privateAdd$r(this, _size, [-1, -1]);
    __privateAdd$r(this, _autosizing, [4, 4]);
    __privateAdd$r(this, _magnet, _View.MAGNET_NONE);
    __privateAdd$r(this, _layout$1, null);
    __privateAdd$r(this, _translation, [0, 0, 0]);
    __privateAdd$r(this, _rotation, [0, 0, 0]);
    __privateAdd$r(this, _transformOrigin, [0, 0]);
    __privateAdd$r(this, _scaling, 1);
    __privateAdd$r(this, _minScale, 0.5);
    __privateAdd$r(this, _maxScale, 3);
    __privateAdd$r(this, _transformsStack);
    __privateAdd$r(this, _visible, true);
    __privateAdd$r(this, _enable, true);
    __privateAdd$r(this, _opacity, 1);
    __privateAdd$r(this, _bubbling, false);
    __privateAdd$r(this, _showAnimation);
    __privateAdd$r(this, _showCallback);
    __privateAdd$r(this, _hideAnimation);
    __privateAdd$r(this, _hideCallback);
    __privateAdd$r(this, _isShowing, false);
    __privateAdd$r(this, _isHiding, false);
    /** set by the visible setter, which notifies the change itself */
    __privateAdd$r(this, _isSettingVisible, false);
    __privateAdd$r(this, _viewDisplay);
    __privateAdd$r(this, _parent);
    __privateAdd$r(this, _holes, /* @__PURE__ */ new Map());
    __privateAdd$r(this, _children, /* @__PURE__ */ new Map());
    /** the children added during the initialization (see clone) */
    __privateAdd$r(this, _initChildren, /* @__PURE__ */ new Set());
    __privateAdd$r(this, _isInitializing, false);
    __privateAdd$r(this, _recognizers, []);
    __privateAdd$r(this, _pointerHandlers, /* @__PURE__ */ new Map());
    __privateSet$q(this, _options, options);
  }
  /**
   *  Registers a component class, for createAndAddComponent
   */
  static registerComponent(name, Class) {
    __privateGet$q(_View, _registry).set(name, Class);
  }
  /**
   *  The view (component) of a view node
   */
  static componentOf(node) {
    return node ? componentOfNode.get(node) : void 0;
  }
  /********************************************************************
                    Life cycle
  *********************************************************************/
  /**
   *  Builds the DOM node of the view (see ViewOptions), finds its holes and
   *  attaches its recognizers.
   */
  initComponent() {
    super.initComponent();
    __privateSet$q(this, _isInitializing, true);
    const node = __privateMethod$k(this, _View_instances, getNode_fn).call(this, __privateGet$q(this, _options));
    if (!node) {
      throw new Error(`vs.ui.View ${this.id}: no view node`);
    }
    this.view = node;
    node.id = this.id;
    node.setAttribute("x-hag-comp", this.id);
    componentOfNode.set(node, this);
    __privateMethod$k(this, _View_instances, parseHoles_fn).call(this, node);
    __privateGet$q(this, _recognizers).forEach((recognizer) => recognizer.attach(this));
  }
  /**
   *  Applies the magnet, then assigns the initial values of the options
   *  (once the subclasses are initialized)
   */
  componentDidInitialize() {
    super.componentDidInitialize();
    __privateSet$q(this, _isInitializing, false);
    if (__privateGet$q(this, _magnet)) {
      this.view?.style.setProperty("position", "absolute");
    }
    if (__privateGet$q(this, _magnet) === _View.MAGNET_CENTER) {
      __privateMethod$k(this, _View_instances, updateSizeAndPos_fn).call(this);
      __privateMethod$k(this, _View_instances, applyTransformation_fn).call(this);
    }
    const values = {};
    for (const [key, value] of Object.entries(__privateGet$q(this, _options))) {
      if (!NODE_OPTIONS.has(key)) values[key] = value;
    }
    this.assign(values);
  }
  destructor() {
    __privateGet$q(this, _parent)?.remove(this);
    for (const children of __privateGet$q(this, _children).values()) {
      for (const child of children) {
        if (child instanceof _View && __privateGet$q(child, _parent) === this) __privateSet$q(child, _parent, void 0);
        child.destroy();
      }
    }
    __privateGet$q(this, _children).clear();
    __privateGet$q(this, _recognizers).forEach((recognizer) => recognizer.detach());
    __privateGet$q(this, _recognizers).length = 0;
    if (this.view) {
      for (const [key, handler] of __privateGet$q(this, _pointerHandlers)) {
        this.view.removeEventListener(key.slice(key.lastIndexOf(":") + 1), handler);
      }
      componentOfNode.delete(this.view);
    }
    __privateGet$q(this, _pointerHandlers).clear();
    this.view = null;
    this.clearTransformStack();
    super.destructor();
  }
  /**
   *  Updates the size and position from the DOM, and refreshes the children
   */
  refresh() {
    const view = this.view;
    if (view?.parentElement) {
      __privateGet$q(this, _size)[0] = view.offsetWidth;
      __privateGet$q(this, _size)[1] = view.offsetHeight;
      __privateGet$q(this, _pos)[0] = view.offsetLeft;
      __privateGet$q(this, _pos)[1] = view.offsetTop;
    }
    for (const children of __privateGet$q(this, _children).values()) {
      for (const child of children) {
        child.refresh?.();
      }
    }
  }
  /**
   *  Notifies that the view node was added to the DOM. Override it to
   *  perform tasks when the view is presented; call the parent method.
   */
  viewDidAdd() {
    const view = this.view;
    if (!view?.parentElement) return;
    later(() => {
      __privateGet$q(this, _size)[0] = view.offsetWidth;
      __privateGet$q(this, _size)[1] = view.offsetHeight;
      __privateGet$q(this, _pos)[0] = view.offsetLeft;
      __privateGet$q(this, _pos)[1] = view.offsetTop;
    });
  }
  /**
   *  Returns a copy of a template of the application: the node of class ref
   *  in the .application_templates node (removed from the document once
   *  read)
   */
  static templateNode(ref) {
    if (applicationTemplates === void 0 || !applicationTemplates?.isConnected) {
      applicationTemplates = document.querySelector(".application_templates");
      applicationTemplates?.remove();
    }
    const node = applicationTemplates?.querySelector(`.${ref}`);
    return node ? document.importNode(node, true) : void 0;
  }
  /**
   *  Returns the node of the view with the x-hag-ref (or x-hag-comp)
   *  attribute ref
   */
  findNodeRef(ref) {
    return findNodeRef(this.view, ref);
  }
  /********************************************************************
                    Children
  *********************************************************************/
  /**
   * The parent view, once added (see add)
   */
  get parent() {
    return __privateGet$q(this, _parent);
  }
  /**
   *  Creates a component from its class name (see registerComponent, or a
   *  global class), initializes it and adds it to this view.
   *  Its node is found with the options (see ViewOptions), else in the
   *  application templates, the template of its class, or loaded from
   *  '<name>.xhtml'; else it uses its html template.
   *
   * @param {String} name the class name
   * @param {Object} options the options of the component
   * @param {String} extension the hole to add it to
   * @return {View} the component, undefined if it could not be created
   */
  createAndAddComponent(name, options = {}, extension) {
    const Class = __privateGet$q(_View, _registry).get(name) ?? globalThis[name];
    if (!isFunction(Class)) {
      console.error(`Impossible to find component '${name}'.`);
      return void 0;
    }
    const config = { ...options };
    let node = __privateMethod$k(this, _View_instances, findNode_fn).call(this, config) ?? _View.templateNode(name);
    if (!node) {
      const template = Class.template ?? Class.prototype.template;
      if (template) node = Template.parseHTML(template);
    }
    if (!node) {
      const path = `${name}.xhtml`;
      let data = loadedTemplates.get(path);
      if (data === void 0) {
        const request = new XMLHttpRequest();
        request.open("GET", path, false);
        request.send(null);
        data = request.status === 200 || request.status === 0 ? request.responseText : "";
        loadedTemplates.set(path, data);
      }
      if (data) node = Template.parseHTML(data);
    }
    if (node) config.node = node;
    let component;
    try {
      component = new Class(config);
      component.init();
    } catch (e) {
      console.error(`Impossible to instantiate the component ${name}`, e);
      return void 0;
    }
    this.add(component, extension);
    component.refresh();
    return component;
  }
  /**
   *  Returns true if the component is a child of this view
   */
  isChild(child) {
    if (!child) return false;
    for (const children of __privateGet$q(this, _children).values()) {
      if (children.includes(child)) return true;
    }
    return false;
  }
  /**
   *  Returns the children of a hole (all the children without hole)
   */
  getChildren(extension) {
    if (extension) return [...__privateGet$q(this, _children).get(extension) ?? []];
    return [...__privateGet$q(this, _children).values()].flat();
  }
  /**
   *  Adds a child: a view (its node is added to the hole extension, the
   *  'children' hole by default) or a non graphical component.
   *  The add is lazy: a view node already in the hole is not moved.
   *
   *  @example
   *  view.add(button, 'children');
   *
   * @param {Component} child the child
   * @param {String} extension the hole [optional]
   * @param {HTMLElement} view the node of the child, if not child.view
   *        [optional]
   */
  add(child, extension, view) {
    if (!child || this.isChild(child)) return;
    const node = view ?? nodeOfChild(child);
    const key = !node ? _View.NON_G_OBJECT : extension || _View.ANY_PLACE;
    let children = __privateGet$q(this, _children).get(key);
    if (!children) {
      children = [];
      __privateGet$q(this, _children).set(key, children);
    }
    children.push(child);
    if (__privateGet$q(this, _isInitializing)) __privateGet$q(this, _initChildren).add(child);
    const hole = __privateGet$q(this, _holes).get(key);
    if (!node || !hole) return;
    if (node.parentElement !== hole) {
      node.remove();
      hole.appendChild(node);
    }
    if (child instanceof _View) {
      __privateSet$q(child, _parent, this);
      child.viewDidAdd();
    }
  }
  /**
   *  Removes a child: its node is removed from the DOM
   */
  remove(child) {
    if (!child) return;
    for (const [key, children] of __privateGet$q(this, _children)) {
      const index = children.indexOf(child);
      if (index === -1) continue;
      children.splice(index, 1);
      if (children.length === 0) __privateGet$q(this, _children).delete(key);
      __privateGet$q(this, _initChildren).delete(child);
      nodeOfChild(child)?.remove();
      if (child instanceof _View && __privateGet$q(child, _parent) === this) __privateSet$q(child, _parent, void 0);
      return;
    }
  }
  /**
   *  Removes all the children (of a hole), and destroys them or returns
   *  them
   *
   * @param {Boolean} shouldDestroy destroy the removed children
   * @param {String} extension the hole [optional]
   * @return {Array} the removed children, if not destroyed
   */
  removeAllChildren(shouldDestroy = false, extension) {
    const removed = this.getChildren(extension);
    removed.forEach((child) => {
      this.remove(child);
      if (shouldDestroy) child.destroy();
    });
    return shouldDestroy ? void 0 : removed;
  }
  /**
   *  Returns a new view of the same class: its model properties, show and
   *  hide animations are copied, and its children (except the ones it
   *  created while initializing, created again by the clone) are cloned in
   *  the same holes. The clone is initialized.
   *
   * @param {ViewOptions} options the options of the clone [optional]
   * @return {View} the clone
   */
  clone(options = {}) {
    const Class = this.constructor;
    const copy = new Class({ ...__privateMethod$k(this, _View_instances, nodeOptions_fn).call(this), ...options });
    copy.init();
    const values = {};
    for (const name of this.modelProperties) {
      if (name in options) continue;
      const descriptor = this.getPropertyDescriptor(name);
      if (!descriptor?.get) continue;
      const value = this[name];
      if (value !== void 0) values[name] = value;
    }
    copy.assign(values);
    if (__privateGet$q(this, _showAnimation)) copy.setShowAnimation(__privateGet$q(this, _showAnimation), void 0, __privateGet$q(this, _showCallback));
    if (__privateGet$q(this, _hideAnimation)) copy.setHideAnimation(__privateGet$q(this, _hideAnimation), void 0, __privateGet$q(this, _hideCallback));
    for (const [key, children] of __privateGet$q(this, _children)) {
      for (const child of children) {
        if (__privateGet$q(this, _initChildren).has(child)) continue;
        if (!(child instanceof _View)) continue;
        copy.add(child.clone(), key === _View.ANY_PLACE ? void 0 : key);
      }
    }
    return copy;
  }
  /********************************************************************
                    Events
  *********************************************************************/
  /**
   *  Binds an event: a pointer event of the view node ('pointerdown',
   *  'pointermove', 'pointerup', 'pointercancel'), or a component event
   *  (see EventSource.bind).
   *  The pointer events are given to func (a function, or the name of a
   *  method of obj; 'notify' by default), with obj as this.
   */
  bind(spec, obj, func = "notify") {
    if (!POINTER_EVENT_TYPES.has(spec)) {
      super.bind(spec, obj, func);
      return;
    }
    if (!this.view) return;
    const callback = isFunction(func) ? func : obj[func];
    if (!isFunction(callback)) {
      throw new Error(`Invalid bind arguments. Unknown func: ${String(func)}`);
    }
    const handler = (event) => {
      callback.call(obj, event);
    };
    const key = `${obj.id}:${spec}`;
    const previous = __privateGet$q(this, _pointerHandlers).get(key);
    if (previous) this.view.removeEventListener(spec, previous);
    __privateGet$q(this, _pointerHandlers).set(key, handler);
    this.view.addEventListener(spec, handler);
  }
  /**
   *  Unbinds an event (see bind)
   */
  unbind(spec, obj, func) {
    if (!POINTER_EVENT_TYPES.has(spec)) {
      super.unbind(spec, obj, func);
      return;
    }
    const key = `${obj.id}:${spec}`;
    const handler = __privateGet$q(this, _pointerHandlers).get(key);
    if (!handler) return;
    this.view?.removeEventListener(spec, handler);
    __privateGet$q(this, _pointerHandlers).delete(key);
  }
  /**
   *  Default handler of the bound pointer events (see bind)
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  notify(event) {
  }
  /**
   *  Receives the events of the children (see notifyToParent): forwards
   *  them to the parent when bubbling is set
   */
  handleEvent(event) {
    if (__privateGet$q(this, _bubbling)) __privateGet$q(this, _parent)?.handleEvent(event);
  }
  /**
   *  Gives an event to the parent: to its handleEvent, else to its notify
   */
  notifyToParent(event) {
    const parent = __privateGet$q(this, _parent);
    if (!parent) return;
    if (isFunction(parent.handleEvent)) parent.handleEvent(event);
    else if (isFunction(parent.notify)) parent.notify(event);
  }
  /**
   *  Gets an event's pointer position relatively to the view
   */
  getPointerPosition(event) {
    const rect = this.view ? getElementAbsolutePosition(this.view) : { x: 0, y: 0 };
    return { x: event.pageX - rect.x, y: event.pageY - rect.y };
  }
  /********************************************************************
                    Pointer recognizers
  *********************************************************************/
  /**
   *  Adds a pointer recognizer (tap, drag, pinch, rotation…); it is attached
   *  to the view node once it exists
   */
  addPointerRecognizer(recognizer) {
    if (__privateGet$q(this, _recognizers).includes(recognizer)) return;
    __privateGet$q(this, _recognizers).push(recognizer);
    if (this.view) recognizer.attach(this);
  }
  /**
   *  Removes a pointer recognizer
   */
  removePointerRecognizer(recognizer) {
    const index = __privateGet$q(this, _recognizers).indexOf(recognizer);
    if (index === -1) return;
    __privateGet$q(this, _recognizers).splice(index, 1);
    recognizer.detach();
  }
  set size(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    __privateGet$q(this, _size)[0] = v[0];
    __privateGet$q(this, _size)[1] = v[1];
    __privateMethod$k(this, _View_instances, updateSizeAndPos_fn).call(this);
  }
  get size() {
    return __privateGet$q(this, _size).slice();
  }
  set position(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    __privateGet$q(this, _pos)[0] = v[0];
    __privateGet$q(this, _pos)[1] = v[1];
    __privateMethod$k(this, _View_instances, updateSizeAndPos_fn).call(this);
  }
  get position() {
    return __privateGet$q(this, _pos).slice();
  }
  set autosizing(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    if (__privateGet$q(this, _autosizing)[0] === v[0] && __privateGet$q(this, _autosizing)[1] === v[1]) return;
    __privateGet$q(this, _autosizing)[0] = v[0];
    __privateGet$q(this, _autosizing)[1] = v[1];
    __privateMethod$k(this, _View_instances, updateSizeAndPos_fn).call(this);
  }
  get autosizing() {
    return __privateGet$q(this, _autosizing).slice();
  }
  set magnet(code) {
    if (__privateGet$q(this, _magnet) === code) return;
    if (!isNumber(code) || code < 0 || code > 5) return;
    __privateSet$q(this, _magnet, code);
    if (!this.view) return;
    if (code) this.view.style.setProperty("position", "absolute");
    else this.view.style.removeProperty("position");
    __privateMethod$k(this, _View_instances, updateSizeAndPos_fn).call(this);
    __privateMethod$k(this, _View_instances, applyTransformation_fn).call(this);
  }
  get magnet() {
    return __privateGet$q(this, _magnet);
  }
  set layout(v) {
    const layouts = [
      _View.HORIZONTAL_LAYOUT,
      _View.DEFAULT_LAYOUT,
      _View.ABSOLUTE_LAYOUT,
      _View.VERTICAL_LAYOUT,
      _View.FLOW_LAYOUT,
      _View.LEGACY_HORIZONTAL_LAYOUT,
      _View.LEGACY_ABSOLUTE_LAYOUT,
      _View.LEGACY_VERTICAL_LAYOUT,
      _View.LEGACY_FLOW_LAYOUT
    ];
    if (v && !layouts.includes(v)) {
      console.error(`Unsupported layout '${v}'!`);
      return;
    }
    if (__privateGet$q(this, _layout$1)) this.removeClassName(__privateGet$q(this, _layout$1));
    __privateSet$q(this, _layout$1, !v || v.includes("_layout") ? v : `${v}_layout`);
    if (__privateGet$q(this, _layout$1)) this.addClassName(__privateGet$q(this, _layout$1));
  }
  get layout() {
    return __privateGet$q(this, _layout$1);
  }
  /**
   *  Called once the node style is updated from the size, position,
   *  autosizing and magnet: a subclass can adjust it
   */
  // eslint-disable-next-line class-methods-use-this
  didUpdateSizeAndPosition() {
  }
  /********************************************************************
                    CSS
  *********************************************************************/
  /**
   *  Returns the inline value of a CSS property (undefined for 'auto'); a
   *  number for the opacity (1 by default)
   */
  getStyle(property) {
    if (!this.view) return void 0;
    const value = this.view.style.getPropertyValue(property);
    if (property === "opacity") return value ? parseFloat(value) : 1;
    return value === "auto" ? void 0 : value;
  }
  /**
   *  Returns the computed value of a CSS property (undefined for 'auto'); a
   *  number for the opacity
   */
  getComputedStyle(property) {
    if (!this.view) return void 0;
    const view = this.view.ownerDocument?.defaultView ?? window;
    const value = view.getComputedStyle(this.view).getPropertyValue(property);
    if (property === "opacity") return value ? parseFloat(value) : 1;
    return value === "auto" ? void 0 : value;
  }
  /**
   *  Sets an inline CSS property; undefined removes it
   */
  setStyle(property, value) {
    if (!property || !this.view) return;
    if (value === void 0) this.view.style.removeProperty(property);
    else this.view.style.setProperty(property, String(value));
  }
  /**
   *  Sets inline CSS properties (camelized names)
   */
  setStyles(style) {
    if (!style || !this.view) return;
    setElementStyle(this.view, style);
  }
  /**
   *  Adds CSS rules for the elements of this view:
   *  addCssRules('.name', ['color: red']) <=> '#<id> .name { color: red }'
   */
  addCssRules(selector, rules) {
    addCssRules(`#${this.id} ${selector}`, rules);
  }
  /**
   *  Adds a CSS rule for the elements of this view (see addCssRules)
   */
  addCssRule(selector, rule) {
    addCssRule(`#${this.id} ${selector}`, rule);
  }
  hasClassName(className) {
    return this.view?.classList.contains(className) ?? false;
  }
  addClassName(...classNames) {
    this.view?.classList.add(...classNames);
  }
  removeClassName(...classNames) {
    this.view?.classList.remove(...classNames);
  }
  toggleClassName(className) {
    this.view?.classList.toggle(className);
  }
  /**
   *  Sets the CSS visibility of the view node (see also show and hide)
   */
  setVisible(visibility) {
    if (this.view) setElementVisibility(this.view, visibility);
  }
  /**
   *  Forces the browser to render the view again, then calls clb
   */
  redraw(clb) {
    if (!this.view) return;
    const node = this.view;
    const display = node.style.display;
    node.style.display = "none";
    later(() => {
      if (display) node.style.display = display;
      else node.style.removeProperty("display");
      later(() => {
        this.refresh();
        if (isFunction(clb)) clb.call(this);
      });
    });
  }
  set innerHTML(v) {
    if (this.view) this.view.innerHTML = v;
  }
  set visible(v) {
    __privateSet$q(this, _isSettingVisible, true);
    try {
      if (v) this.show();
      else this.hide();
    } finally {
      __privateSet$q(this, _isSettingVisible, false);
    }
  }
  get visible() {
    return __privateGet$q(this, _visible);
  }
  /**
   *  Displays the view, with its show animation; clb is called at the end
   */
  show(clb) {
    if (!this.view || __privateGet$q(this, _visible)) return;
    if (!isFunction(clb)) clb = void 0;
    if (__privateGet$q(this, _viewDisplay)) this.view.style.display = __privateGet$q(this, _viewDisplay);
    else this.view.style.removeProperty("display");
    __privateSet$q(this, _viewDisplay, void 0);
    __privateSet$q(this, _isHiding, false);
    __privateSet$q(this, _isShowing, true);
    if (__privateGet$q(this, _hideAnimation) && __privateGet$q(this, _hideAnimation).state !== 0) __privateGet$q(this, _hideAnimation).stop();
    if (__privateGet$q(this, _showAnimation)) {
      const animation = __privateGet$q(this, _showAnimation);
      if (animation.state !== 0) animation.stop();
      animation.start(this).then((result) => {
        if (result === "ended") __privateMethod$k(this, _View_instances, showObject_fn).call(this, clb);
      });
    } else {
      __privateMethod$k(this, _View_instances, showObject_fn).call(this, clb);
    }
  }
  /**
   *  Hides the view, with its hide animation; clb is called at the end
   */
  hide(clb) {
    if (!this.view) return;
    if (!__privateGet$q(this, _visible) && !__privateGet$q(this, _isShowing)) return;
    if (!isFunction(clb)) clb = void 0;
    __privateSet$q(this, _visible, false);
    __privateSet$q(this, _isShowing, false);
    __privateSet$q(this, _isHiding, true);
    if (!__privateGet$q(this, _isSettingVisible)) this.propertyChange("visible");
    if (__privateGet$q(this, _showAnimation) && __privateGet$q(this, _showAnimation).state !== 0) __privateGet$q(this, _showAnimation).stop();
    if (__privateGet$q(this, _hideAnimation)) {
      const animation = __privateGet$q(this, _hideAnimation);
      if (animation.state !== 0) animation.stop();
      animation.start(this).then((result) => {
        if (result === "ended") __privateMethod$k(this, _View_instances, hideObject_fn).call(this, clb);
      });
    } else {
      __privateMethod$k(this, _View_instances, hideObject_fn).call(this, clb);
    }
  }
  /**
   *  Sets the animation used to show the view: an Animation (cloned), or
   *  [property, value] pairs; null removes it.
   *
   *  @example
   *  view.setShowAnimation([['translate', '0,0,0'], ['opacity', '1']]);
   *  view.setShowAnimation(Animation.FadeIn, { duration: '1s' });
   */
  setShowAnimation(animations, options, clb) {
    __privateSet$q(this, _showAnimation, __privateMethod$k(this, _View_instances, makeAnimation_fn).call(this, animations, options, "setShowAnimation") ?? void 0);
    __privateSet$q(this, _showCallback, isFunction(clb) ? clb : void 0);
  }
  /**
   *  Sets the animation used to hide the view (see setShowAnimation)
   */
  setHideAnimation(animations, options, clb) {
    __privateSet$q(this, _hideAnimation, __privateMethod$k(this, _View_instances, makeAnimation_fn).call(this, animations, options, "setHideAnimation") ?? void 0);
    __privateSet$q(this, _hideCallback, isFunction(clb) ? clb : void 0);
  }
  set showAnimation(v) {
    this.setShowAnimation(v);
  }
  get showAnimation() {
    return __privateGet$q(this, _showAnimation);
  }
  set hideAnimation(v) {
    this.setHideAnimation(v);
  }
  get hideAnimation() {
    return __privateGet$q(this, _hideAnimation);
  }
  /**
   *  Animates the view, with an Animation or [property, value] pairs.
   *
   *  @example
   *  await view.animate([['translate', '100px,0,0'], ['opacity', '0']]);
   *
   * @return {Promise} the result of the animation ('ended' or 'stopped')
   */
  animate(animations, options, clb) {
    let animation;
    if (animations instanceof Animation) {
      animation = animations;
    } else if (isArray(animations)) {
      animation = new Animation(animations);
    } else {
      console.warn("vs.ui.View.animate invalid parameters!");
      return void 0;
    }
    copyAnimationOptions(animation, options);
    const run = animation.start(this);
    if (isFunction(clb)) {
      run.then((result) => {
        if (result === "ended") clb.call(this);
      });
    }
    return run;
  }
  set enable(v) {
    if (v && !__privateGet$q(this, _enable)) {
      __privateSet$q(this, _enable, true);
      this.removeClassName("disabled");
      this.didEnable();
    } else if (!v && __privateGet$q(this, _enable)) {
      __privateSet$q(this, _enable, false);
      this.addClassName("disabled");
      this.didEnable();
    }
  }
  get enable() {
    return __privateGet$q(this, _enable);
  }
  /**
   *  Called when the view is enabled or disabled
   */
  // eslint-disable-next-line class-methods-use-this
  didEnable() {
  }
  set opacity(v) {
    if (!isNumber(v) || v < 0 || v > 1) return;
    if (this.view) this.view.style.opacity = String(v);
    __privateSet$q(this, _opacity, v);
  }
  get opacity() {
    return __privateGet$q(this, _opacity);
  }
  set bubbling(v) {
    __privateSet$q(this, _bubbling, !!v);
  }
  get bubbling() {
    return __privateGet$q(this, _bubbling);
  }
  /********************************************************************
                    Transformations
  *********************************************************************/
  /**
   *  Moves the view by (x, y, z) px
   */
  translate(x, y, z = 0) {
    if (!isNumber(x) || !isNumber(y)) return;
    if (!isNumber(z)) z = 0;
    __privateSet$q(this, _translation, [x, y, z]);
    __privateMethod$k(this, _View_instances, applyTransformation_fn).call(this);
  }
  /**
   *  Rotates the view, in degrees: around the z axis, or around the x, y
   *  and z axes
   */
  rotate(r) {
    if (isNumber(r)) {
      __privateSet$q(this, _rotation, [0, 0, r]);
    } else if (isArray(r)) {
      __privateSet$q(this, _rotation, [0, 1, 2].map((i) => isNumber(r[i]) ? r[i] : 0));
    }
    __privateMethod$k(this, _View_instances, applyTransformation_fn).call(this);
  }
  /**
   *  Scales the view, within [minScale, maxScale]
   */
  scale(s) {
    if (!isNumber(s)) return;
    s = Math.min(Math.max(s, __privateGet$q(this, _minScale)), __privateGet$q(this, _maxScale));
    if (__privateGet$q(this, _scaling) === s) return;
    __privateSet$q(this, _scaling, s);
    __privateMethod$k(this, _View_instances, applyTransformation_fn).call(this);
  }
  /**
   *  Starts a new transformation space, with a new origin: the current
   *  transformation goes into the transformation stack
   */
  setNewTransformOrigin(origin) {
    if (!origin || !isNumber(origin.x) || !isNumber(origin.y)) return;
    this.flushTransformStack();
    __privateSet$q(this, _transformOrigin, [origin.x, origin.y]);
  }
  /**
   *  Moves the current transformation into the transformation stack
   */
  flushTransformStack() {
    const [ox, oy] = __privateGet$q(this, _transformOrigin);
    const matrix = new DOMMatrix().translate(ox, oy, 0).translate(__privateGet$q(this, _translation)[0], __privateGet$q(this, _translation)[1], __privateGet$q(this, _translation)[2]).rotate(__privateGet$q(this, _rotation)[0], __privateGet$q(this, _rotation)[1], __privateGet$q(this, _rotation)[2]).scale(__privateGet$q(this, _scaling), __privateGet$q(this, _scaling), 1).translate(-ox, -oy, 0);
    __privateSet$q(this, _transformsStack, __privateGet$q(this, _transformsStack) ? matrix.multiply(__privateGet$q(this, _transformsStack)) : matrix);
    __privateSet$q(this, _translation, [0, 0, 0]);
    __privateSet$q(this, _rotation, [0, 0, 0]);
    __privateSet$q(this, _scaling, 1);
    __privateSet$q(this, _transformOrigin, [0, 0]);
  }
  /**
   *  Adds a matrix to the transformation stack
   */
  pushNewTransform(matrix) {
    if (!matrix) return;
    __privateSet$q(this, _transformsStack, __privateGet$q(this, _transformsStack) ? matrix.multiply(__privateGet$q(this, _transformsStack)) : matrix);
  }
  /**
   *  Removes the previous transformations (the transformation stack)
   */
  clearTransformStack() {
    __privateSet$q(this, _transformsStack, void 0);
  }
  /**
   *  The current transformation matrix of the view
   */
  getCTM() {
    const [ox, oy] = __privateGet$q(this, _transformOrigin);
    const matrix = new DOMMatrix().translate(ox + __privateGet$q(this, _translation)[0], oy + __privateGet$q(this, _translation)[1], __privateGet$q(this, _translation)[2]).multiply(new DOMMatrix().rotate(__privateGet$q(this, _rotation)[0], __privateGet$q(this, _rotation)[1], __privateGet$q(this, _rotation)[2])).scale(__privateGet$q(this, _scaling), __privateGet$q(this, _scaling), 1).translate(-ox, -oy, 0);
    return __privateGet$q(this, _transformsStack) ? matrix.multiply(__privateGet$q(this, _transformsStack)) : matrix;
  }
  /**
   *  The combined transformation matrix of the parents (identity without
   *  parent)
   */
  getParentCTM() {
    const parent = __privateGet$q(this, _parent);
    return parent ? parent.getParentCTM().multiply(parent.getCTM()) : new DOMMatrix();
  }
  set translation(v) {
    if (!isArray(v)) return;
    this.translate(v[0], v[1], v[2]);
  }
  get translation() {
    return __privateGet$q(this, _translation).slice();
  }
  set rotation(v) {
    this.rotate(v);
  }
  get rotation() {
    return __privateGet$q(this, _rotation).slice();
  }
  set scaling(v) {
    this.scale(v);
  }
  get scaling() {
    return __privateGet$q(this, _scaling);
  }
  set minScale(v) {
    if (!isNumber(v)) return;
    __privateSet$q(this, _minScale, v);
    if (__privateGet$q(this, _scaling) < v) this.scale(v);
  }
  get minScale() {
    return __privateGet$q(this, _minScale);
  }
  set maxScale(v) {
    if (!isNumber(v)) return;
    __privateSet$q(this, _maxScale, v);
    if (__privateGet$q(this, _scaling) > v) this.scale(v);
  }
  get maxScale() {
    return __privateGet$q(this, _maxScale);
  }
  set transformOrigin(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    __privateSet$q(this, _transformOrigin, [v[0], v[1]]);
  }
  get transformOrigin() {
    return __privateGet$q(this, _transformOrigin).slice();
  }
};
_init$m = __decoratorStart$m(_a$m);
_registry = new WeakMap();
_options = new WeakMap();
_pos = new WeakMap();
_size = new WeakMap();
_autosizing = new WeakMap();
_magnet = new WeakMap();
_layout$1 = new WeakMap();
_translation = new WeakMap();
_rotation = new WeakMap();
_transformOrigin = new WeakMap();
_scaling = new WeakMap();
_minScale = new WeakMap();
_maxScale = new WeakMap();
_transformsStack = new WeakMap();
_visible = new WeakMap();
_enable = new WeakMap();
_opacity = new WeakMap();
_bubbling = new WeakMap();
_showAnimation = new WeakMap();
_showCallback = new WeakMap();
_hideAnimation = new WeakMap();
_hideCallback = new WeakMap();
_isShowing = new WeakMap();
_isHiding = new WeakMap();
_isSettingVisible = new WeakMap();
_viewDisplay = new WeakMap();
_parent = new WeakMap();
_holes = new WeakMap();
_children = new WeakMap();
_initChildren = new WeakMap();
_isInitializing = new WeakMap();
_recognizers = new WeakMap();
_pointerHandlers = new WeakMap();
_View_instances = new WeakSet();
/********************************************************************
                  View node
*********************************************************************/
getNode_fn = function(options) {
  const node = __privateMethod$k(this, _View_instances, findNode_fn).call(this, options);
  if (node) return node;
  if (options.template) {
    const templateNode = Template.parseHTML(options.template);
    if (templateNode) return templateNode;
  }
  if (this.htmlTemplate) {
    const templateNode = Template.parseHTML(this.htmlTemplate);
    if (templateNode) return templateNode;
  }
  console.warn(`Impossible to instance view of component '${this.constructor.name}', id [${this.id}]. A default one is created`);
  return document.createElement("div");
};
/**
 * An existing node: options.node, nodeId, nodeRef, templateRef, or the
 * DOM node with the component id
 */
findNode_fn = function(options) {
  if (options.node) return options.node;
  if (options.nodeId) {
    const node = document.getElementById(options.nodeId);
    if (node) return node;
  }
  if (options.nodeRef) {
    let ref = options.nodeRef;
    let rootId = options.rootRef;
    const match = /(\w+)#(\w+)/.exec(ref);
    if (match) {
      [, rootId, ref] = match;
    }
    if (rootId) {
      const root = Component.instances.get(rootId)?.view ?? document.getElementById(rootId);
      const node = findNodeRef(root, ref);
      if (node) return node;
    }
  }
  if (options.templateRef) {
    const node = _View.templateNode(options.templateRef);
    if (node) return node;
  }
  if (options.id) {
    const node = document.getElementById(options.id);
    if (node) return node;
  }
  return void 0;
};
parseHoles_fn = function(node) {
  const hole = node.getAttribute?.("x-hag-hole");
  if (hole) {
    __privateGet$q(this, _holes).set(hole, node);
    return;
  }
  for (let child = node.firstElementChild; child; child = child.nextElementSibling) {
    __privateMethod$k(this, _View_instances, parseHoles_fn).call(this, child);
  }
};
/** the options giving the node (a template), for a clone */
nodeOptions_fn = function() {
  const { template } = __privateGet$q(this, _options);
  return template ? { template } : {};
};
/**
 * The CPU costly update of the node style from size, position,
 * autosizing and magnet
 */
updateSizeAndPos_fn = function() {
  const view = this.view;
  if (!view) return;
  let x = __privateGet$q(this, _pos)[0], y = __privateGet$q(this, _pos)[1];
  const w = __privateGet$q(this, _size)[0], h = __privateGet$q(this, _size)[1];
  const [aH, aV] = __privateGet$q(this, _autosizing);
  let width, height;
  let left = "auto", top = "auto", right = "auto", bottom = "auto";
  const parent = view.parentElement;
  const pWidth = parent ? parent.offsetWidth : 0;
  const pHeight = parent ? parent.offsetHeight : 0;
  if (__privateGet$q(this, _magnet) === _View.MAGNET_LEFT) x = 0;
  if (__privateGet$q(this, _magnet) === _View.MAGNET_TOP) y = 0;
  if (w < 0) {
    width = "";
  } else if (aH === 5 || aH === 7) {
    width = "auto";
  } else if (aH === 4 || aH === 1) {
    width = `${w}px`;
  } else if (aH === 2 || aH === 3 || aH === 6 || aH === 0) {
    width = pWidth ? `${w / pWidth * 100}%` : `${w}px`;
  } else {
    width = "100%";
  }
  if (h < 0) {
    height = "";
  } else if (aV === 5 || aV === 7) {
    height = "auto";
  } else if (aV === 4 || aV === 1) {
    height = `${h}px`;
  } else if (aV === 2 || aV === 3 || aV === 6 || aV === 0) {
    height = pHeight ? `${h / pHeight * 100}%` : `${h}px`;
  } else {
    height = "100%";
  }
  if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || aH === 2 && !pWidth) {
    left = `${x}px`;
  } else if ((aH === 2 || aH === 0) && pWidth) {
    left = `${x / pWidth * 100}%`;
  }
  if (w >= 0 && (aH === 1 || aH === 3 || aH === 5 || aH === 7)) {
    const r = pWidth - (x + w);
    right = r >= 0 ? `${r}px` : "0";
  }
  if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || aV === 2 && !pHeight) {
    top = `${y}px`;
  } else if ((aV === 2 || aV === 0) && pHeight) {
    top = `${y / pHeight * 100}%`;
  }
  if (h >= 0 && (aV === 1 || aV === 3 || aV === 5 || aV === 7)) {
    const b = pHeight - (y + h);
    bottom = b >= 0 ? `${b}px` : "0";
  }
  if (__privateGet$q(this, _magnet) === _View.MAGNET_BOTTOM) {
    top = "auto";
    bottom = "0px";
  }
  if (__privateGet$q(this, _magnet) === _View.MAGNET_RIGHT) {
    left = "auto";
    right = "0px";
  }
  if (__privateGet$q(this, _magnet) === _View.MAGNET_CENTER) {
    top = "50%";
    bottom = "auto";
    left = "50%";
    right = "auto";
  }
  Object.assign(view.style, { left, right, top, bottom, width, height });
  this.didUpdateSizeAndPosition();
};
showObject_fn = function(clb) {
  if (!this.view || !__privateGet$q(this, _isShowing)) return;
  __privateSet$q(this, _isShowing, false);
  __privateSet$q(this, _visible, true);
  if (!__privateGet$q(this, _isSettingVisible)) this.propertyChange("visible");
  for (const callback of [__privateGet$q(this, _showCallback), clb]) {
    if (!callback) continue;
    if (__privateGet$q(this, _showAnimation)) callback.call(this);
    else later(() => callback.call(this));
  }
};
hideObject_fn = function(clb) {
  if (!this.view || __privateGet$q(this, _visible) || !__privateGet$q(this, _isHiding)) return;
  __privateSet$q(this, _isHiding, false);
  const display = this.view.style.display;
  __privateSet$q(this, _viewDisplay, display && display !== "none" ? display : void 0);
  this.view.style.display = "none";
  for (const callback of [__privateGet$q(this, _hideCallback), clb]) {
    if (!callback) continue;
    if (__privateGet$q(this, _hideAnimation)) callback.call(this);
    else later(() => callback.call(this));
  }
};
makeAnimation_fn = function(animations, options, method) {
  if (animations === void 0 || animations === null) return null;
  let animation;
  if (animations instanceof Animation) {
    animation = animations.clone();
  } else if (isArray(animations)) {
    animation = new Animation(animations);
  } else {
    console.warn(`vs.ui.View.${method} invalid parameters!`);
    return null;
  }
  copyAnimationOptions(animation, options);
  return animation;
};
applyTransformation_fn = function() {
  if (!this.view) return;
  let transform = this.getCTM().toString();
  if (__privateGet$q(this, _magnet) === _View.MAGNET_CENTER) transform += " translate(-50%,-50%)";
  setElementTransform(this.view, transform);
};
__decorateElement$m(_init$m, 3, "size", _size_dec, _View);
__decorateElement$m(_init$m, 3, "position", _position_dec, _View);
__decorateElement$m(_init$m, 3, "autosizing", _autosizing_dec, _View);
__decorateElement$m(_init$m, 3, "magnet", _magnet_dec, _View);
__decorateElement$m(_init$m, 3, "layout", _layout_dec, _View);
__decorateElement$m(_init$m, 3, "innerHTML", _innerHTML_dec, _View);
__decorateElement$m(_init$m, 3, "visible", _visible_dec, _View);
__decorateElement$m(_init$m, 3, "showAnimation", _showAnimation_dec, _View);
__decorateElement$m(_init$m, 3, "hideAnimation", _hideAnimation_dec, _View);
__decorateElement$m(_init$m, 3, "enable", _enable_dec, _View);
__decorateElement$m(_init$m, 3, "opacity", _opacity_dec, _View);
__decorateElement$m(_init$m, 3, "bubbling", _bubbling_dec, _View);
__decorateElement$m(_init$m, 3, "translation", _translation_dec, _View);
__decorateElement$m(_init$m, 3, "rotation", _rotation_dec, _View);
__decorateElement$m(_init$m, 3, "scaling", _scaling_dec, _View);
__decorateElement$m(_init$m, 3, "minScale", _minScale_dec, _View);
__decorateElement$m(_init$m, 3, "maxScale", _maxScale_dec, _View);
__decorateElement$m(_init$m, 3, "transformOrigin", _transformOrigin_dec, _View);
__decoratorMetadata$m(_init$m, _View);
/********************************************************************
                  Constants
*********************************************************************/
__publicField$n(_View, "DEFAULT_LAYOUT", null);
__publicField$n(_View, "HORIZONTAL_LAYOUT", "horizontal");
__publicField$n(_View, "LEGACY_HORIZONTAL_LAYOUT", "horizontal_layout");
__publicField$n(_View, "VERTICAL_LAYOUT", "vertical");
__publicField$n(_View, "LEGACY_VERTICAL_LAYOUT", "vertical_layout");
__publicField$n(_View, "ABSOLUTE_LAYOUT", "absolute");
__publicField$n(_View, "LEGACY_ABSOLUTE_LAYOUT", "absolute_layout");
__publicField$n(_View, "FLOW_LAYOUT", "flow");
__publicField$n(_View, "LEGACY_FLOW_LAYOUT", "flow_layout");
/** threshold, in px, of a pointer move unselecting an item */
__publicField$n(_View, "MOVE_THRESHOLD", MOVE_THRESHOLD);
__publicField$n(_View, "MAGNET_NONE", 0);
__publicField$n(_View, "MAGNET_TOP", 1);
__publicField$n(_View, "MAGNET_BOTTOM", 2);
__publicField$n(_View, "MAGNET_LEFT", 3);
__publicField$n(_View, "MAGNET_RIGHT", 4);
__publicField$n(_View, "MAGNET_CENTER", 5);
/** the hole of the non graphical children */
__publicField$n(_View, "NON_G_OBJECT", "_non_g_object");
/** the default hole */
__publicField$n(_View, "ANY_PLACE", "children");
__privateAdd$r(_View, _registry, /* @__PURE__ */ new Map());
let View = _View;

var __typeError$q = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$q = (obj, member, msg) => member.has(obj) || __typeError$q("Cannot " + msg);
var __privateGet$p = (obj, member, getter) => (__accessCheck$q(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$q = (obj, member, value) => member.has(obj) ? __typeError$q("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$p = (obj, member, value, setter) => (__accessCheck$q(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$j = (obj, member, method) => (__accessCheck$q(obj, member, "access private method"), method);
var _pointers, _isActive, _startDistance, _startAngle, _touchAction$1, _GestureRecognizer_instances, twoPointers_fn;
class GestureRecognizer extends PointerRecognizer {
  constructor() {
    super(...arguments);
    __privateAdd$q(this, _GestureRecognizer_instances);
    __privateAdd$q(this, _pointers, /* @__PURE__ */ new Map());
    __privateAdd$q(this, _isActive, false);
    __privateAdd$q(this, _startDistance, 1);
    __privateAdd$q(this, _startAngle, 0);
    __privateAdd$q(this, _touchAction$1, "");
  }
  didAttach(view) {
    __privateSet$p(this, _touchAction$1, view.style.touchAction);
    view.style.touchAction = "none";
  }
  willDetach(view) {
    view.style.touchAction = __privateGet$p(this, _touchAction$1);
  }
  reset() {
    __privateGet$p(this, _pointers).clear();
    __privateSet$p(this, _isActive, false);
  }
  pointerDown(event) {
    __privateGet$p(this, _pointers).set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.startTracking();
    if (!__privateGet$p(this, _isActive) && __privateGet$p(this, _pointers).size === 2) {
      const [a, b] = __privateMethod$j(this, _GestureRecognizer_instances, twoPointers_fn).call(this);
      __privateSet$p(this, _startDistance, distance(a, b) || 1);
      __privateSet$p(this, _startAngle, angle(a, b));
      __privateSet$p(this, _isActive, true);
      this.gestureStart(event);
    }
  }
  pointerMove(event) {
    const pointer = __privateGet$p(this, _pointers).get(event.pointerId);
    if (!pointer) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (__privateGet$p(this, _isActive)) {
      const [a, b] = __privateMethod$j(this, _GestureRecognizer_instances, twoPointers_fn).call(this);
      this.gestureChange(event, distance(a, b) / __privateGet$p(this, _startDistance), angle(a, b) - __privateGet$p(this, _startAngle));
    }
  }
  pointerUp(event) {
    if (!__privateGet$p(this, _pointers).delete(event.pointerId)) return;
    if (__privateGet$p(this, _isActive) && __privateGet$p(this, _pointers).size < 2) {
      __privateSet$p(this, _isActive, false);
      this.gestureEnd(event);
    }
    if (__privateGet$p(this, _pointers).size === 0) {
      this.stopTracking();
    }
  }
}
_pointers = new WeakMap();
_isActive = new WeakMap();
_startDistance = new WeakMap();
_startAngle = new WeakMap();
_touchAction$1 = new WeakMap();
_GestureRecognizer_instances = new WeakSet();
/** the two first pointers */
twoPointers_fn = function() {
  const [a, b] = __privateGet$p(this, _pointers).values();
  return [a, b];
};
function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
function angle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

var __typeError$p = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$p = (obj, member, msg) => member.has(obj) || __typeError$p("Cannot " + msg);
var __privateGet$o = (obj, member, getter) => (__accessCheck$p(obj, member, "read from private field"), member.get(obj));
var __privateAdd$p = (obj, member, value) => member.has(obj) ? __typeError$p("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$o = (obj, member, value, setter) => (__accessCheck$p(obj, member, "write to private field"), member.set(obj, value), value);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet$o(obj, member, value);
  },
  get _() {
    return __privateGet$o(obj, member);
  }
});
var _isTouched, _pointerId$2, _startX$1, _startY$2, _nbTaps, _tapTimeout;
const MULTI_TAP_DELAY = 100;
class TapRecognizer extends PointerRecognizer {
  constructor() {
    super(...arguments);
    __privateAdd$p(this, _isTouched, false);
    __privateAdd$p(this, _pointerId$2, 0);
    __privateAdd$p(this, _startX$1, 0);
    __privateAdd$p(this, _startY$2, 0);
    __privateAdd$p(this, _nbTaps, 0);
    __privateAdd$p(this, _tapTimeout);
  }
  reset() {
    if (__privateGet$o(this, _tapTimeout)) clearTimeout(__privateGet$o(this, _tapTimeout));
    __privateSet$o(this, _tapTimeout, void 0);
    __privateSet$o(this, _isTouched, false);
    __privateSet$o(this, _nbTaps, 0);
  }
  pointerDown(event) {
    if (__privateGet$o(this, _isTouched) || !event.isPrimary) return;
    if (__privateGet$o(this, _tapTimeout)) {
      clearTimeout(__privateGet$o(this, _tapTimeout));
      __privateSet$o(this, _tapTimeout, void 0);
    } else {
      __privateSet$o(this, _nbTaps, 0);
    }
    __privateSet$o(this, _isTouched, true);
    __privateSet$o(this, _pointerId$2, event.pointerId);
    __privateSet$o(this, _startX$1, event.clientX);
    __privateSet$o(this, _startY$2, event.clientY);
    this.startTracking();
    this.notify("didTouch", this.target, this.target?.view, event);
  }
  pointerMove(event) {
    if (!__privateGet$o(this, _isTouched) || event.pointerId !== __privateGet$o(this, _pointerId$2)) return;
    const distance = Math.abs(event.clientX - __privateGet$o(this, _startX$1)) + Math.abs(event.clientY - __privateGet$o(this, _startY$2));
    if (distance < MOVE_THRESHOLD) return;
    __privateSet$o(this, _isTouched, false);
    __privateSet$o(this, _nbTaps, 0);
    this.stopTracking();
    this.notify("didUntouch", this.target, this.target?.view, event);
  }
  pointerUp(event) {
    if (!__privateGet$o(this, _isTouched) || event.pointerId !== __privateGet$o(this, _pointerId$2)) return;
    __privateSet$o(this, _isTouched, false);
    this.stopTracking();
    this.notify("didUntouch", this.target, this.target?.view, event);
    __privateWrapper(this, _nbTaps)._++;
    if (!this.delegate?.didTap) {
      __privateSet$o(this, _nbTaps, 0);
      return;
    }
    const target = this.target;
    __privateSet$o(this, _tapTimeout, setTimeout(() => {
      const nbTaps = __privateGet$o(this, _nbTaps);
      __privateSet$o(this, _tapTimeout, void 0);
      __privateSet$o(this, _nbTaps, 0);
      this.notify("didTap", nbTaps, target, target?.view, event);
    }, MULTI_TAP_DELAY));
  }
  pointerCancel(event) {
    if (!__privateGet$o(this, _isTouched) || event.pointerId !== __privateGet$o(this, _pointerId$2)) return;
    __privateSet$o(this, _isTouched, false);
    __privateSet$o(this, _nbTaps, 0);
    this.stopTracking();
    this.notify("didUntouch", this.target, this.target?.view, event);
  }
}
_isTouched = new WeakMap();
_pointerId$2 = new WeakMap();
_startX$1 = new WeakMap();
_startY$2 = new WeakMap();
_nbTaps = new WeakMap();
_tapTimeout = new WeakMap();

var __typeError$o = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$o = (obj, member, msg) => member.has(obj) || __typeError$o("Cannot " + msg);
var __privateGet$n = (obj, member, getter) => (__accessCheck$o(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$o = (obj, member, value) => member.has(obj) ? __typeError$o("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$n = (obj, member, value, setter) => (__accessCheck$o(obj, member, "write to private field"), member.set(obj, value), value);
var _isDragged, _pointerId$1, _startX, _startY$1, _touchAction;
class DragRecognizer extends PointerRecognizer {
  constructor() {
    super(...arguments);
    __privateAdd$o(this, _isDragged, false);
    __privateAdd$o(this, _pointerId$1, 0);
    __privateAdd$o(this, _startX, 0);
    __privateAdd$o(this, _startY$1, 0);
    __privateAdd$o(this, _touchAction, "");
  }
  didAttach(view) {
    __privateSet$n(this, _touchAction, view.style.touchAction);
    view.style.touchAction = "none";
  }
  willDetach(view) {
    view.style.touchAction = __privateGet$n(this, _touchAction);
  }
  reset() {
    __privateSet$n(this, _isDragged, false);
  }
  pointerDown(event) {
    if (__privateGet$n(this, _isDragged) || !event.isPrimary) return;
    __privateSet$n(this, _isDragged, true);
    __privateSet$n(this, _pointerId$1, event.pointerId);
    __privateSet$n(this, _startX, event.clientX);
    __privateSet$n(this, _startY$1, event.clientY);
    this.startTracking();
    this.notify("didDragStart", event, this.target);
  }
  pointerMove(event) {
    if (!__privateGet$n(this, _isDragged) || event.pointerId !== __privateGet$n(this, _pointerId$1)) return;
    const delta = { dx: event.clientX - __privateGet$n(this, _startX), dy: event.clientY - __privateGet$n(this, _startY$1) };
    this.notify("didDrag", delta, event, this.target);
  }
  pointerUp(event) {
    if (!__privateGet$n(this, _isDragged) || event.pointerId !== __privateGet$n(this, _pointerId$1)) return;
    __privateSet$n(this, _isDragged, false);
    this.stopTracking();
    this.notify("didDragEnd", event, this.target);
  }
}
_isDragged = new WeakMap();
_pointerId$1 = new WeakMap();
_startX = new WeakMap();
_startY$1 = new WeakMap();
_touchAction = new WeakMap();

class PinchRecognizer extends GestureRecognizer {
  gestureStart(event) {
    this.notify("didPinchStart", event, this.target);
  }
  gestureChange(event, scale) {
    this.notify("didPinchChange", scale, event, this.target);
  }
  gestureEnd(event) {
    this.notify("didPinchEnd", event, this.target);
  }
}

class RotationRecognizer extends GestureRecognizer {
  gestureStart(event) {
    this.notify("didRotationStart", event);
  }
  gestureChange(event, _scale, rotation) {
    this.notify("didRotationChange", rotation, event);
  }
  gestureEnd(event) {
    this.notify("didRotationEnd", event);
  }
}

const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
function toText(value) {
  if (value === null || value === void 0) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = value.toString?.();
  return typeof text === "string" ? text : void 0;
}
function onPointerDownOutside(node, callback) {
  const listener = (event) => {
    if (event.target instanceof Node && node.contains(event.target)) return;
    callback(event);
  };
  document.addEventListener("pointerdown", listener, true);
  return () => document.removeEventListener("pointerdown", listener, true);
}

const CSS_DEFAULT = 0;
const CSS_IOS = 5;
const CSS_WP7 = 6;
const CSS_BLACKBERRY = 7;
const CSS_SYMBIAN = 8;
const CSS_ANDROID = 9;
const CSS_MEEGO = 10;
const CSS_PURE = 100;
const CSS_FLAT = 101;
const CSS_HOLO = 102;
const CSS_IOS7 = 103;
function getDeviceCSSCode() {
  const element = document.createElement("div");
  element.className = "device_test";
  document.body.appendChild(element);
  const value = getComputedStyle(element).getPropertyValue("margin-top");
  element.remove();
  return parseInt(value || "0", 10) || CSS_DEFAULT;
}

var html_template$l = "<div class=\"vs_ui_textlabel\"></div>\n\n";

var __create$l = Object.create;
var __defProp$m = Object.defineProperty;
var __getOwnPropDesc$l = Object.getOwnPropertyDescriptor;
var __knownSymbol$l = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$n = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$m = (obj, key, value) => key in obj ? __defProp$m(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$l = (base) => [, , , __create$l(base?.[__knownSymbol$l("metadata")] ?? null)];
var __decoratorStrings$l = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$l = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$n("Function expected") : fn;
var __decoratorContext$l = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$l[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$n("Already initialized") : fns.push(__expectFn$l(fn || null)) });
var __decoratorMetadata$l = (array, target) => __defNormalProp$m(target, __knownSymbol$l("metadata"), array[3]);
var __runInitializers$l = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$l = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$l[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$l(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$l(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$l(it) && (desc[key] = it );
  }
  return desc && __defProp$m(target, name, desc), target;
};
var __publicField$m = (obj, key, value) => __defNormalProp$m(obj, key + "" , value);
var __accessCheck$n = (obj, member, msg) => member.has(obj) || __typeError$n("Cannot " + msg);
var __privateGet$m = (obj, member, getter) => (__accessCheck$n(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$n = (obj, member, value) => member.has(obj) ? __typeError$n("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$m = (obj, member, value, setter) => (__accessCheck$n(obj, member, "write to private field"), member.set(obj, value), value);
var _text_dec$2, _a$l, _text$2, _init$l;
class TextLabel extends (_a$l = View, _text_dec$2 = [InOut], _a$l) {
  constructor() {
    super(...arguments);
    __runInitializers$l(_init$l, 5, this);
    __publicField$m(this, "htmlTemplate", html_template$l);
    __privateAdd$n(this, _text$2, "");
  }
  initComponent() {
    super.initComponent();
    if (__privateGet$m(this, _text$2) && this.view) this.view.textContent = __privateGet$m(this, _text$2);
  }
  set text(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$m(this, _text$2, text);
    if (this.view) this.view.textContent = text;
  }
  get text() {
    return __privateGet$m(this, _text$2);
  }
}
_init$l = __decoratorStart$l(_a$l);
_text$2 = new WeakMap();
__decorateElement$l(_init$l, 3, "text", _text_dec$2, TextLabel);
__decoratorMetadata$l(_init$l, TextLabel);

var html_template$k = "<img class=\"vs_ui_imageview\"></img>";

var __create$k = Object.create;
var __defProp$l = Object.defineProperty;
var __getOwnPropDesc$k = Object.getOwnPropertyDescriptor;
var __knownSymbol$k = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$m = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$l = (obj, key, value) => key in obj ? __defProp$l(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$k = (base) => [, , , __create$k(base?.[__knownSymbol$k("metadata")] ?? null)];
var __decoratorStrings$k = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$k = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$m("Function expected") : fn;
var __decoratorContext$k = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$k[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$m("Already initialized") : fns.push(__expectFn$k(fn || null)) });
var __decoratorMetadata$k = (array, target) => __defNormalProp$l(target, __knownSymbol$k("metadata"), array[3]);
var __runInitializers$k = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$k = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$k[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$k(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$k(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$k(it) && (desc[key] = it );
  }
  return desc && __defProp$l(target, name, desc), target;
};
var __publicField$l = (obj, key, value) => __defNormalProp$l(obj, key + "" , value);
var __accessCheck$m = (obj, member, msg) => member.has(obj) || __typeError$m("Cannot " + msg);
var __privateGet$l = (obj, member, getter) => (__accessCheck$m(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$m = (obj, member, value) => member.has(obj) ? __typeError$m("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$l = (obj, member, value, setter) => (__accessCheck$m(obj, member, "write to private field"), member.set(obj, value), value);
var _src_dec$1, _a$k, _src$1, _init$k;
class ImageView extends (_a$k = View, _src_dec$1 = [InOut], _a$k) {
  constructor() {
    super(...arguments);
    __runInitializers$k(_init$k, 5, this);
    __publicField$l(this, "htmlTemplate", html_template$k);
    __privateAdd$m(this, _src$1, null);
  }
  initComponent() {
    super.initComponent();
    const image = this.view;
    image.ondragstart = (event) => {
      event.preventDefault();
      return false;
    };
    if (image.getAttribute("src")) __privateSet$l(this, _src$1, image.getAttribute("src"));
    else if (__privateGet$l(this, _src$1)) image.src = __privateGet$l(this, _src$1);
    image.setAttribute("width", "100%");
    image.setAttribute("height", "100%");
  }
  destructor() {
    if (this.view) this.view.src = BLANK_IMAGE;
    super.destructor();
  }
  set src(v) {
    if (!isString(v)) return;
    __privateSet$l(this, _src$1, v);
    if (this.view) this.view.src = v;
  }
  get src() {
    return __privateGet$l(this, _src$1);
  }
  /**
   * The size of the image [width, height], in px; once displayed, the
   * actual size of the node
   */
  set size(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    this.view?.setAttribute("width", String(v[0]));
    this.view?.setAttribute("height", String(v[1]));
    super.size = v;
  }
  get size() {
    if (this.view?.parentNode) {
      return [this.view.offsetWidth, this.view.offsetHeight];
    }
    return super.size;
  }
}
_init$k = __decoratorStart$k(_a$k);
_src$1 = new WeakMap();
__decorateElement$k(_init$k, 3, "src", _src_dec$1, ImageView);
__decoratorMetadata$k(_init$k, ImageView);

var html_template$j = "<div class=\"vs_ui_button\"><div></div></div>";

var __create$j = Object.create;
var __defProp$k = Object.defineProperty;
var __getOwnPropDesc$j = Object.getOwnPropertyDescriptor;
var __knownSymbol$j = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$l = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$k = (obj, key, value) => key in obj ? __defProp$k(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$j = (base) => [, , , __create$j(base?.[__knownSymbol$j("metadata")] ?? null)];
var __decoratorStrings$j = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$j = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$l("Function expected") : fn;
var __decoratorContext$j = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$j[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$l("Already initialized") : fns.push(__expectFn$j(fn || null)) });
var __decoratorMetadata$j = (array, target) => __defNormalProp$k(target, __knownSymbol$j("metadata"), array[3]);
var __runInitializers$j = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$j = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$j[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$j(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$j(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$j(it) && (desc[key] = it );
  }
  return desc && __defProp$k(target, name, desc), target;
};
var __publicField$k = (obj, key, value) => __defNormalProp$k(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$l = (obj, member, msg) => member.has(obj) || __typeError$l("Cannot " + msg);
var __privateGet$k = (obj, member, getter) => (__accessCheck$l(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$l = (obj, member, value) => member.has(obj) ? __typeError$l("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$k = (obj, member, value, setter) => (__accessCheck$l(obj, member, "write to private field"), member.set(obj, value), value);
var _type_dec$3, _style_dec$2, _text_dec$1, _a$j, _tapRecognizer$3, _text$1, _style$2, _type$3, _selected$1, _init$j;
const _Button = class _Button extends (_a$j = View, _text_dec$1 = [InOut], _style_dec$2 = [InOut], _type_dec$3 = [InOut], _a$j) {
  constructor() {
    super(...arguments);
    __runInitializers$j(_init$j, 5, this);
    __publicField$k(this, "htmlTemplate", html_template$j);
    /** the node of the text */
    __publicField$k(this, "textView", null);
    __privateAdd$l(this, _tapRecognizer$3);
    __privateAdd$l(this, _text$1, "");
    __privateAdd$l(this, _style$2, _Button.DEFAULT_STYLE);
    __privateAdd$l(this, _type$3, _Button.DEFAULT_TYPE);
    __privateAdd$l(this, _selected$1, false);
  }
  initComponent() {
    super.initComponent();
    this.textView = this.view.firstElementChild;
    __privateSet$k(this, _tapRecognizer$3, new TapRecognizer(this));
    this.addPointerRecognizer(__privateGet$k(this, _tapRecognizer$3));
    if (this.textView) this.textView.textContent = __privateGet$k(this, _text$1);
    this.view.setAttribute("name", this.id);
    if (__privateGet$k(this, _style$2)) this.addClassName(__privateGet$k(this, _style$2));
    if (__privateGet$k(this, _type$3)) this.addClassName(__privateGet$k(this, _type$3));
  }
  destructor() {
    if (__privateGet$k(this, _tapRecognizer$3)) {
      this.removePointerRecognizer(__privateGet$k(this, _tapRecognizer$3));
      __privateSet$k(this, _tapRecognizer$3, void 0);
    }
    super.destructor();
  }
  /**
   * True while the button is pressed
   */
  get selected() {
    return __privateGet$k(this, _selected$1);
  }
  /*****************************************************************
   *  Tap delegate
   ****************************************************************/
  didTouch() {
    this.addClassName("pressed");
    __privateSet$k(this, _selected$1, true);
  }
  didUntouch() {
    this.removeClassName("pressed");
    __privateSet$k(this, _selected$1, false);
  }
  didTap() {
    this.emit("select");
  }
  set text(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$k(this, _text$1, text);
    if (this.textView) this.textView.textContent = text;
  }
  get text() {
    return __privateGet$k(this, _text$1);
  }
  set style(v) {
    if (!isString(v)) return;
    v = v.replace("_ios", "");
    if (__privateGet$k(this, _style$2)) this.removeClassName(__privateGet$k(this, _style$2));
    __privateSet$k(this, _style$2, v);
    this.addClassName(v);
  }
  get style() {
    return __privateGet$k(this, _style$2);
  }
  set type(v) {
    if (!isString(v)) return;
    if (__privateGet$k(this, _type$3)) this.removeClassName(__privateGet$k(this, _type$3));
    __privateSet$k(this, _type$3, v);
    this.addClassName(v);
  }
  get type() {
    return __privateGet$k(this, _type$3);
  }
};
_init$j = __decoratorStart$j(_a$j);
_tapRecognizer$3 = new WeakMap();
_text$1 = new WeakMap();
_style$2 = new WeakMap();
_type$3 = new WeakMap();
_selected$1 = new WeakMap();
__decorateElement$j(_init$j, 3, "text", _text_dec$1, _Button);
__decorateElement$j(_init$j, 3, "style", _style_dec$2, _Button);
__decorateElement$j(_init$j, 3, "type", _type_dec$3, _Button);
__decoratorMetadata$j(_init$j, _Button);
__publicField$k(_Button, "DEFAULT_TYPE", "default");
__publicField$k(_Button, "NAVIGATION_TYPE", "nav");
__publicField$k(_Button, "NAVIGATION_BACK_TYPE", "nav_back");
__publicField$k(_Button, "NAVIGATION_FORWARD_TYPE", "nav_forward");
__publicField$k(_Button, "DEFAULT_STYLE", "default_style");
__publicField$k(_Button, "GREEN_STYLE", "green");
__publicField$k(_Button, "RED_STYLE", "red");
__publicField$k(_Button, "GREY_STYLE", "grey");
__publicField$k(_Button, "BLUE_STYLE", "blue_style");
__publicField$k(_Button, "BLACK_STYLE", "black_style");
__publicField$k(_Button, "SILVER_STYLE", "silver_style");
let Button = _Button;

var html_template$i = "<div class=\"vs_ui_progressbar\"><div></div></div>";

var __create$i = Object.create;
var __defProp$j = Object.defineProperty;
var __getOwnPropDesc$i = Object.getOwnPropertyDescriptor;
var __knownSymbol$i = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$k = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$j = (obj, key, value) => key in obj ? __defProp$j(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$i = (base) => [, , , __create$i(base?.[__knownSymbol$i("metadata")] ?? null)];
var __decoratorStrings$i = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$i = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$k("Function expected") : fn;
var __decoratorContext$i = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$i[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$k("Already initialized") : fns.push(__expectFn$i(fn || null)) });
var __decoratorMetadata$i = (array, target) => __defNormalProp$j(target, __knownSymbol$i("metadata"), array[3]);
var __runInitializers$i = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$i = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$i[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$i(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$i(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$i(it) && (desc[key] = it );
  }
  return desc && __defProp$j(target, name, desc), target;
};
var __publicField$j = (obj, key, value) => __defNormalProp$j(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$k = (obj, member, msg) => member.has(obj) || __typeError$k("Cannot " + msg);
var __privateGet$j = (obj, member, getter) => (__accessCheck$k(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$k = (obj, member, value) => member.has(obj) ? __typeError$k("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$j = (obj, member, value, setter) => (__accessCheck$k(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$i = (obj, member, method) => (__accessCheck$k(obj, member, "access private method"), method);
var _indeterminate_dec, _range_dec$1, _index_dec, _a$i, _index, _range$1, _indeterminate, _ProgressBar_instances, updateBar_fn, _init$i;
class ProgressBar extends (_a$i = View, _index_dec = [InOut], _range_dec$1 = [InOut], _indeterminate_dec = [InOut], _a$i) {
  constructor() {
    super(...arguments);
    __runInitializers$i(_init$i, 5, this);
    __privateAdd$k(this, _ProgressBar_instances);
    __publicField$j(this, "htmlTemplate", html_template$i);
    /** the node of the bar */
    __publicField$j(this, "innerView", null);
    __privateAdd$k(this, _index, 0);
    __privateAdd$k(this, _range$1, [0, 100]);
    __privateAdd$k(this, _indeterminate, false);
  }
  initComponent() {
    super.initComponent();
    this.innerView = this.view.firstElementChild;
    this.view.classList.toggle("indeterminate", __privateGet$j(this, _indeterminate));
    __privateMethod$i(this, _ProgressBar_instances, updateBar_fn).call(this);
  }
  destructor() {
    this.innerView = null;
    super.destructor();
  }
  set index(v) {
    if (!isNumber(v)) return;
    __privateSet$j(this, _index, v);
    __privateMethod$i(this, _ProgressBar_instances, updateBar_fn).call(this);
  }
  get index() {
    return __privateGet$j(this, _index);
  }
  set range(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    if (v[0] >= v[1]) return;
    __privateGet$j(this, _range$1)[0] = v[0];
    __privateGet$j(this, _range$1)[1] = v[1];
    __privateMethod$i(this, _ProgressBar_instances, updateBar_fn).call(this);
  }
  get range() {
    return __privateGet$j(this, _range$1).slice();
  }
  set indeterminate(v) {
    __privateSet$j(this, _indeterminate, !!v);
    this.view?.classList.toggle("indeterminate", __privateGet$j(this, _indeterminate));
  }
  get indeterminate() {
    return __privateGet$j(this, _indeterminate);
  }
}
_init$i = __decoratorStart$i(_a$i);
_index = new WeakMap();
_range$1 = new WeakMap();
_indeterminate = new WeakMap();
_ProgressBar_instances = new WeakSet();
/**
 * The width of the bar, in percent of the view (the borders of the
 * themes do not depend on the size)
 */
updateBar_fn = function() {
  if (!this.innerView) return;
  const [min, max] = __privateGet$j(this, _range$1);
  const ratio = Math.min(Math.max((__privateGet$j(this, _index) - min) / (max - min), 0), 1);
  this.innerView.style.width = `${ratio * 100}%`;
};
__decorateElement$i(_init$i, 3, "index", _index_dec, ProgressBar);
__decorateElement$i(_init$i, 3, "range", _range_dec$1, ProgressBar);
__decorateElement$i(_init$i, 3, "indeterminate", _indeterminate_dec, ProgressBar);
__decoratorMetadata$i(_init$i, ProgressBar);

var html_template$h = "<textarea class=\"vs_ui_textarea\"></textarea>";

var __create$h = Object.create;
var __defProp$i = Object.defineProperty;
var __getOwnPropDesc$h = Object.getOwnPropertyDescriptor;
var __knownSymbol$h = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$j = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$i = (obj, key, value) => key in obj ? __defProp$i(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$h = (base) => [, , , __create$h(base?.[__knownSymbol$h("metadata")] ?? null)];
var __decoratorStrings$h = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$h = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$j("Function expected") : fn;
var __decoratorContext$h = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$h[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$j("Already initialized") : fns.push(__expectFn$h(fn || null)) });
var __decoratorMetadata$h = (array, target) => __defNormalProp$i(target, __knownSymbol$h("metadata"), array[3]);
var __runInitializers$h = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$h = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$h[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$h(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$h(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$h(it) && (desc[key] = it );
  }
  return desc && __defProp$i(target, name, desc), target;
};
var __publicField$i = (obj, key, value) => __defNormalProp$i(obj, key + "" , value);
var __accessCheck$j = (obj, member, msg) => member.has(obj) || __typeError$j("Cannot " + msg);
var __privateGet$i = (obj, member, getter) => (__accessCheck$j(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$j = (obj, member, value) => member.has(obj) ? __typeError$j("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$i = (obj, member, value, setter) => (__accessCheck$j(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$h = (obj, member, method) => (__accessCheck$j(obj, member, "access private method"), method);
var _value_dec$2, _a$h, _value$2, _stopWatchingPointer$2, _fieldListener$1, _TextArea_instances, handleFieldEvent_fn$1, _init$h;
const FIELD_EVENTS$1 = ["input", "change", "focus", "blur"];
class TextArea extends (_a$h = View, _value_dec$2 = [InOut], _a$h) {
  constructor() {
    super(...arguments);
    __runInitializers$h(_init$h, 5, this);
    __privateAdd$j(this, _TextArea_instances);
    __publicField$i(this, "htmlTemplate", html_template$h);
    __privateAdd$j(this, _value$2, "");
    __privateAdd$j(this, _stopWatchingPointer$2);
    __privateAdd$j(this, _fieldListener$1, (event) => __privateMethod$h(this, _TextArea_instances, handleFieldEvent_fn$1).call(this, event));
  }
  initComponent() {
    super.initComponent();
    const view = this.view;
    view.value = __privateGet$i(this, _value$2);
    view.disabled = !this.enable;
    for (const type of FIELD_EVENTS$1) view.addEventListener(type, __privateGet$i(this, _fieldListener$1));
  }
  destructor() {
    var _a2;
    (_a2 = __privateGet$i(this, _stopWatchingPointer$2)) == null ? void 0 : _a2.call(this);
    __privateSet$i(this, _stopWatchingPointer$2, void 0);
    for (const type of FIELD_EVENTS$1) this.view?.removeEventListener(type, __privateGet$i(this, _fieldListener$1));
    super.destructor();
  }
  didEnable() {
    if (this.view) this.view.disabled = !this.enable;
  }
  /**
   * Gives the focus to the text area
   */
  setFocus() {
    this.view?.focus();
  }
  /**
   * Removes the focus from the text area
   */
  setBlur() {
    this.view?.blur();
  }
  set value(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$i(this, _value$2, text);
    if (this.view) this.view.value = text;
  }
  get value() {
    return __privateGet$i(this, _value$2);
  }
}
_init$h = __decoratorStart$h(_a$h);
_value$2 = new WeakMap();
_stopWatchingPointer$2 = new WeakMap();
_fieldListener$1 = new WeakMap();
_TextArea_instances = new WeakSet();
handleFieldEvent_fn$1 = function(event) {
  var _a2, _b;
  const view = this.view;
  switch (event.type) {
    case "focus":
      (_a2 = __privateGet$i(this, _stopWatchingPointer$2)) == null ? void 0 : _a2.call(this);
      __privateSet$i(this, _stopWatchingPointer$2, onPointerDownOutside(view, () => this.setBlur()));
      this.emit("focus");
      break;
    case "blur":
      (_b = __privateGet$i(this, _stopWatchingPointer$2)) == null ? void 0 : _b.call(this);
      __privateSet$i(this, _stopWatchingPointer$2, void 0);
      this.emit("blur");
      break;
    case "input":
      __privateSet$i(this, _value$2, view.value);
      this.propertyChange("value");
      this.emit("input", __privateGet$i(this, _value$2));
      break;
    case "change":
      if (__privateGet$i(this, _value$2) !== view.value) {
        __privateSet$i(this, _value$2, view.value);
        this.propertyChange("value");
      }
      this.emit("commit", __privateGet$i(this, _value$2));
      break;
  }
};
__decorateElement$h(_init$h, 3, "value", _value_dec$2, TextArea);
__decoratorMetadata$h(_init$h, TextArea);

var html_template$g = "<div class=\"vs_ui_inputfield\"><input type=\"text\" value=\"\" placeholder=\"type ...\" incremental=\"incremental\"/><div class='clear_button'/>\n</div>";

var __create$g = Object.create;
var __defProp$h = Object.defineProperty;
var __getOwnPropDesc$g = Object.getOwnPropertyDescriptor;
var __knownSymbol$g = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$i = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$h = (obj, key, value) => key in obj ? __defProp$h(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$g = (base) => [, , , __create$g(base?.[__knownSymbol$g("metadata")] ?? null)];
var __decoratorStrings$g = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$g = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$i("Function expected") : fn;
var __decoratorContext$g = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$g[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$i("Already initialized") : fns.push(__expectFn$g(fn || null)) });
var __decoratorMetadata$g = (array, target) => __defNormalProp$h(target, __knownSymbol$g("metadata"), array[3]);
var __runInitializers$g = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$g = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$g[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$g(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$g(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$g(it) && (desc[key] = it );
  }
  return desc && __defProp$h(target, name, desc), target;
};
var __publicField$h = (obj, key, value) => __defNormalProp$h(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$i = (obj, member, msg) => member.has(obj) || __typeError$i("Cannot " + msg);
var __privateGet$h = (obj, member, getter) => (__accessCheck$i(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$i = (obj, member, value) => member.has(obj) ? __typeError$i("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$h = (obj, member, value, setter) => (__accessCheck$i(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$g = (obj, member, method) => (__accessCheck$i(obj, member, "access private method"), method);
var _placeholder_dec, _type_dec$2, _value_dec$1, _a$g, _value$1, _placeholder, _type$2, _stopWatchingPointer$1, _fieldListener, _clearListener, _InputField_instances, updateClearButton_fn, applyType_fn, handleFieldEvent_fn, _init$g;
const FIELD_EVENTS = ["input", "change", "focus", "blur"];
const _InputField = class _InputField extends (_a$g = View, _value_dec$1 = [InOut], _type_dec$2 = [InOut], _placeholder_dec = [InOut], _a$g) {
  constructor() {
    super(...arguments);
    __runInitializers$g(_init$g, 5, this);
    __privateAdd$i(this, _InputField_instances);
    __publicField$h(this, "htmlTemplate", html_template$g);
    /** the input node */
    __publicField$h(this, "textField", null);
    /** the clear button node */
    __publicField$h(this, "clearButton", null);
    __privateAdd$i(this, _value$1, "");
    __privateAdd$i(this, _placeholder, "type ...");
    __privateAdd$i(this, _type$2, _InputField.TEXT);
    __privateAdd$i(this, _stopWatchingPointer$1);
    __privateAdd$i(this, _fieldListener, (event) => __privateMethod$g(this, _InputField_instances, handleFieldEvent_fn).call(this, event));
    __privateAdd$i(this, _clearListener, (event) => {
      event.preventDefault();
      this.clear();
    });
  }
  initComponent() {
    super.initComponent();
    const textField = this.view.querySelector("input");
    if (!textField) {
      throw new Error(`vs.ui.InputField ${this.id}: no input node`);
    }
    this.textField = textField;
    textField.name = this.id;
    textField.value = __privateGet$h(this, _value$1);
    textField.setAttribute("placeholder", __privateGet$h(this, _placeholder));
    textField.disabled = !this.enable;
    for (const type of FIELD_EVENTS) textField.addEventListener(type, __privateGet$h(this, _fieldListener));
    this.clearButton = this.view.querySelector(".clear_button");
    this.clearButton?.addEventListener("pointerdown", __privateGet$h(this, _clearListener));
    __privateMethod$g(this, _InputField_instances, applyType_fn).call(this);
    __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
  }
  destructor() {
    var _a2;
    (_a2 = __privateGet$h(this, _stopWatchingPointer$1)) == null ? void 0 : _a2.call(this);
    __privateSet$h(this, _stopWatchingPointer$1, void 0);
    for (const type of FIELD_EVENTS) this.textField?.removeEventListener(type, __privateGet$h(this, _fieldListener));
    this.clearButton?.removeEventListener("pointerdown", __privateGet$h(this, _clearListener));
    this.textField = null;
    this.clearButton = null;
    super.destructor();
  }
  didEnable() {
    if (this.textField) this.textField.disabled = !this.enable;
  }
  /**
   * Gives the focus to the input
   */
  setFocus() {
    this.textField?.focus();
  }
  /**
   * Removes the focus from the input
   */
  setBlur() {
    this.textField?.blur();
  }
  /**
   * Clears the text, as the user did (with the clear button): notifies the
   * value and emits the 'input' and 'commit' events.
   */
  clear() {
    if (this.textField) this.textField.value = "";
    __privateSet$h(this, _value$1, "");
    __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
    this.propertyChange("value");
    this.emit("input", "");
    this.emit("commit", "");
  }
  set value(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$h(this, _value$1, text);
    if (this.textField) this.textField.value = text;
    __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
  }
  get value() {
    return __privateGet$h(this, _value$1);
  }
  set type(v) {
    if (v !== _InputField.TEXT && v !== _InputField.PASSWORD && v !== _InputField.SEARCH) return;
    __privateSet$h(this, _type$2, v);
    __privateMethod$g(this, _InputField_instances, applyType_fn).call(this);
  }
  get type() {
    return __privateGet$h(this, _type$2);
  }
  set placeholder(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$h(this, _placeholder, text);
    this.textField?.setAttribute("placeholder", text);
  }
  get placeholder() {
    return __privateGet$h(this, _placeholder);
  }
};
_init$g = __decoratorStart$g(_a$g);
_value$1 = new WeakMap();
_placeholder = new WeakMap();
_type$2 = new WeakMap();
_stopWatchingPointer$1 = new WeakMap();
_fieldListener = new WeakMap();
_clearListener = new WeakMap();
_InputField_instances = new WeakSet();
/**
 * The clear button is visible while the input has the focus and a text
 */
updateClearButton_fn = function() {
  if (!this.clearButton) return;
  const visible = this.hasClassName("focus") && !!__privateGet$h(this, _value$1);
  this.clearButton.style.visibility = visible ? "visible" : "hidden";
};
applyType_fn = function() {
  if (!this.view) return;
  for (const type of [_InputField.TEXT, _InputField.PASSWORD, _InputField.SEARCH]) {
    this.view.classList.toggle(type, type === __privateGet$h(this, _type$2));
  }
  this.textField?.setAttribute("type", __privateGet$h(this, _type$2));
};
handleFieldEvent_fn = function(event) {
  var _a2, _b;
  const textField = this.textField;
  switch (event.type) {
    case "focus":
      this.addClassName("focus");
      __privateSet$h(this, _value$1, textField.value);
      __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
      (_a2 = __privateGet$h(this, _stopWatchingPointer$1)) == null ? void 0 : _a2.call(this);
      __privateSet$h(this, _stopWatchingPointer$1, onPointerDownOutside(this.view, () => this.setBlur()));
      this.emit("focus");
      break;
    case "blur":
      this.removeClassName("focus");
      __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
      (_b = __privateGet$h(this, _stopWatchingPointer$1)) == null ? void 0 : _b.call(this);
      __privateSet$h(this, _stopWatchingPointer$1, void 0);
      this.emit("blur");
      break;
    case "input":
      __privateSet$h(this, _value$1, textField.value);
      __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
      this.propertyChange("value");
      this.emit("input", __privateGet$h(this, _value$1));
      break;
    case "change":
      if (__privateGet$h(this, _value$1) !== textField.value) {
        __privateSet$h(this, _value$1, textField.value);
        __privateMethod$g(this, _InputField_instances, updateClearButton_fn).call(this);
        this.propertyChange("value");
      }
      this.emit("commit", __privateGet$h(this, _value$1));
      break;
  }
};
__decorateElement$g(_init$g, 3, "value", _value_dec$1, _InputField);
__decorateElement$g(_init$g, 3, "type", _type_dec$2, _InputField);
__decorateElement$g(_init$g, 3, "placeholder", _placeholder_dec, _InputField);
__decoratorMetadata$g(_init$g, _InputField);
/** a text input */
__publicField$h(_InputField, "TEXT", "text");
/** a password input: the characters are replaced by dots */
__publicField$h(_InputField, "PASSWORD", "password");
/** a search input */
__publicField$h(_InputField, "SEARCH", "search");
let InputField = _InputField;

var html_template$f = "<div class=\"vs_ui_svgview\"></div>\n";

var __create$f = Object.create;
var __defProp$g = Object.defineProperty;
var __getOwnPropDesc$f = Object.getOwnPropertyDescriptor;
var __knownSymbol$f = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$h = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$g = (obj, key, value) => key in obj ? __defProp$g(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$f = (base) => [, , , __create$f(base?.[__knownSymbol$f("metadata")] ?? null)];
var __decoratorStrings$f = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$f = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$h("Function expected") : fn;
var __decoratorContext$f = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$f[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$h("Already initialized") : fns.push(__expectFn$f(fn || null)) });
var __decoratorMetadata$f = (array, target) => __defNormalProp$g(target, __knownSymbol$f("metadata"), array[3]);
var __runInitializers$f = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$f = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$f[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$f(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$f(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$f(it) && (desc[key] = it );
  }
  return desc && __defProp$g(target, name, desc), target;
};
var __publicField$g = (obj, key, value) => __defNormalProp$g(obj, key + "" , value);
var __accessCheck$h = (obj, member, msg) => member.has(obj) || __typeError$h("Cannot " + msg);
var __privateGet$g = (obj, member, getter) => (__accessCheck$h(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$h = (obj, member, value) => member.has(obj) ? __typeError$h("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$g = (obj, member, value, setter) => (__accessCheck$h(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$f = (obj, member, method) => (__accessCheck$h(obj, member, "access private method"), method);
var _viewBox_dec, _contentData_dec, _href_dec, _a$f, _href, _contentData, _viewBox, _SVGView_instances, load_fn$1, setDocument_fn, applyViewBox_fn, _init$f;
const SVG_NS = "http://www.w3.org/2000/svg";
const documents = /* @__PURE__ */ new Map();
let defs = null;
function svgDefs() {
  if (!defs?.isConnected) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    document.body.appendChild(svg);
    defs = document.createElementNS(SVG_NS, "defs");
    svg.appendChild(defs);
  }
  return defs;
}
function loadDocument(path) {
  let promise = documents.get(path);
  if (promise) return promise;
  promise = fetch(path).then((response) => {
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  }).then((text) => {
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg?.nodeName !== "svg" || doc.querySelector("parsererror")) {
      throw new Error("not a svg document");
    }
    return document.importNode(svg, true);
  }).catch((error) => {
    console.error(`vs.ui.SVGView: impossible to load '${path}'`, error);
    documents.delete(path);
    return void 0;
  });
  documents.set(path, promise);
  return promise;
}
function createUse(id) {
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#${id}`);
  return use;
}
class SVGView extends (_a$f = View, _href_dec = [InOut], _contentData_dec = [InOut], _viewBox_dec = [InOut], _a$f) {
  constructor() {
    super(...arguments);
    __runInitializers$f(_init$f, 5, this);
    __privateAdd$h(this, _SVGView_instances);
    __publicField$g(this, "htmlTemplate", html_template$f);
    __privateAdd$h(this, _href, null);
    __privateAdd$h(this, _contentData, null);
    __privateAdd$h(this, _viewBox, null);
  }
  initComponent() {
    super.initComponent();
    if (__privateGet$g(this, _href)) __privateMethod$f(this, _SVGView_instances, load_fn$1).call(this, __privateGet$g(this, _href));
    else if (__privateGet$g(this, _contentData)) this.view.innerHTML = __privateGet$g(this, _contentData);
  }
  set href(v) {
    if (!isString(v)) return;
    __privateSet$g(this, _href, v);
    __privateSet$g(this, _contentData, null);
    if (this.view) __privateMethod$f(this, _SVGView_instances, load_fn$1).call(this, v);
  }
  get href() {
    return __privateGet$g(this, _href);
  }
  set contentData(v) {
    if (!isString(v)) return;
    __privateSet$g(this, _contentData, v);
    __privateSet$g(this, _href, null);
    if (!this.view) return;
    this.view.innerHTML = v;
    __privateMethod$f(this, _SVGView_instances, applyViewBox_fn).call(this);
  }
  get contentData() {
    return __privateGet$g(this, _contentData);
  }
  set viewBox(v) {
    if (!isArray(v) || v.length !== 4 || !v.every((value) => isNumber(value))) return;
    __privateSet$g(this, _viewBox, v.slice());
    __privateMethod$f(this, _SVGView_instances, applyViewBox_fn).call(this);
  }
  get viewBox() {
    return __privateGet$g(this, _viewBox)?.slice() ?? null;
  }
}
_init$f = __decoratorStart$f(_a$f);
_href = new WeakMap();
_contentData = new WeakMap();
_viewBox = new WeakMap();
_SVGView_instances = new WeakSet();
load_fn$1 = function(href) {
  const index = href.indexOf("#");
  const path = index === -1 ? href : href.slice(0, index);
  const id = index === -1 ? void 0 : href.slice(index + 1);
  loadDocument(path).then((svgDocument) => {
    if (svgDocument && this.view && __privateGet$g(this, _href) === href) __privateMethod$f(this, _SVGView_instances, setDocument_fn).call(this, svgDocument, id);
  });
};
/**
 * Displays the element of the document, or all its elements
 */
setDocument_fn = function(svgDocument, id) {
  if (!svgDocument.isConnected) svgDefs().appendChild(svgDocument);
  const svg = document.createElementNS(SVG_NS, "svg");
  this.view.replaceChildren(svg);
  __privateMethod$f(this, _SVGView_instances, applyViewBox_fn).call(this);
  if (id) {
    svg.appendChild(createUse(id));
    return;
  }
  for (const node of svgDocument.children) {
    if (node.nodeName === "defs") continue;
    if (!node.id) node.id = createId();
    svg.appendChild(createUse(node.id));
  }
};
applyViewBox_fn = function() {
  const svg = this.view?.querySelector("svg");
  if (!svg || !__privateGet$g(this, _viewBox)) return;
  const [, , width, height] = __privateGet$g(this, _viewBox);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", __privateGet$g(this, _viewBox).join(" "));
};
__decorateElement$f(_init$f, 3, "href", _href_dec, SVGView);
__decorateElement$f(_init$f, 3, "contentData", _contentData_dec, SVGView);
__decorateElement$f(_init$f, 3, "viewBox", _viewBox_dec, SVGView);
__decoratorMetadata$f(_init$f, SVGView);

var html_template$e = "<div class=\"vs_ui_combobox\"></div>";

var __create$e = Object.create;
var __defProp$f = Object.defineProperty;
var __getOwnPropDesc$e = Object.getOwnPropertyDescriptor;
var __knownSymbol$e = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$g = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$f = (obj, key, value) => key in obj ? __defProp$f(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$e = (base) => [, , , __create$e(base?.[__knownSymbol$e("metadata")] ?? null)];
var __decoratorStrings$e = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$e = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$g("Function expected") : fn;
var __decoratorContext$e = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$e[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$g("Already initialized") : fns.push(__expectFn$e(fn || null)) });
var __decoratorMetadata$e = (array, target) => __defNormalProp$f(target, __knownSymbol$e("metadata"), array[3]);
var __runInitializers$e = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$e = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$e[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$e(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$e(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$e(it) && (desc[key] = it );
  }
  return desc && __defProp$f(target, name, desc), target;
};
var __publicField$f = (obj, key, value) => __defNormalProp$f(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$g = (obj, member, msg) => member.has(obj) || __typeError$g("Cannot " + msg);
var __privateGet$f = (obj, member, getter) => (__accessCheck$g(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$g = (obj, member, value) => member.has(obj) ? __typeError$g("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$f = (obj, member, value, setter) => (__accessCheck$g(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$e = (obj, member, method) => (__accessCheck$g(obj, member, "access private method"), method);
var _data_dec$2, _selectedItem_dec$1, _a$e, _data$1, _selectedItem$1, _changeListener$2, _ComboBox_instances, updateOptions_fn, updateSelection_fn$1, _init$e;
class ComboBox extends (_a$e = View, _selectedItem_dec$1 = [InOut], _data_dec$2 = [InOut], _a$e) {
  constructor() {
    super(...arguments);
    __runInitializers$e(_init$e, 5, this);
    __privateAdd$g(this, _ComboBox_instances);
    __publicField$f(this, "htmlTemplate", html_template$e);
    /** the select node */
    __publicField$f(this, "select", null);
    __privateAdd$g(this, _data$1, []);
    __privateAdd$g(this, _selectedItem$1, null);
    __privateAdd$g(this, _changeListener$2, () => {
      const select = this.select;
      __privateSet$f(this, _selectedItem$1, select.value);
      this.propertyChange("selectedItem");
      this.emit("select", select.value);
    });
  }
  initComponent() {
    super.initComponent();
    const select = document.createElement("select");
    select.name = this.id;
    select.disabled = !this.enable;
    select.addEventListener("change", __privateGet$f(this, _changeListener$2));
    this.view.appendChild(select);
    this.select = select;
    __privateMethod$e(this, _ComboBox_instances, updateOptions_fn).call(this);
  }
  destructor() {
    this.select?.removeEventListener("change", __privateGet$f(this, _changeListener$2));
    this.select = null;
    super.destructor();
  }
  didEnable() {
    if (this.select) this.select.disabled = !this.enable;
  }
  /**
   * Gives the focus to the combo box
   */
  setFocus() {
    this.select?.focus();
  }
  /**
   * Removes the focus from the combo box
   */
  setBlur() {
    this.select?.blur();
  }
  set selectedItem(v) {
    if (!isString(v)) return;
    __privateSet$f(this, _selectedItem$1, v);
    __privateMethod$e(this, _ComboBox_instances, updateSelection_fn$1).call(this);
  }
  get selectedItem() {
    return __privateGet$f(this, _selectedItem$1);
  }
  set data(v) {
    if (!isArray(v)) return;
    __privateSet$f(this, _data$1, v.map((item) => toText(item) ?? ""));
    __privateMethod$e(this, _ComboBox_instances, updateOptions_fn).call(this);
  }
  get data() {
    return __privateGet$f(this, _data$1).slice();
  }
}
_init$e = __decoratorStart$e(_a$e);
_data$1 = new WeakMap();
_selectedItem$1 = new WeakMap();
_changeListener$2 = new WeakMap();
_ComboBox_instances = new WeakSet();
updateOptions_fn = function() {
  const select = this.select;
  if (!select) return;
  select.replaceChildren(...__privateGet$f(this, _data$1).map((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    return option;
  }));
  __privateMethod$e(this, _ComboBox_instances, updateSelection_fn$1).call(this);
};
updateSelection_fn$1 = function() {
  const select = this.select;
  if (!select) return;
  if (__privateGet$f(this, _selectedItem$1) !== null && __privateGet$f(this, _data$1).includes(__privateGet$f(this, _selectedItem$1))) {
    select.value = __privateGet$f(this, _selectedItem$1);
  } else {
    select.selectedIndex = __privateGet$f(this, _data$1).length ? 0 : -1;
  }
};
__decorateElement$e(_init$e, 3, "selectedItem", _selectedItem_dec$1, ComboBox);
__decorateElement$e(_init$e, 3, "data", _data_dec$2, ComboBox);
__decoratorMetadata$e(_init$e, ComboBox);

var html_template$d = "<div class=\"vs_ui_segmentedbutton\"></div>";

var __create$d = Object.create;
var __defProp$e = Object.defineProperty;
var __getOwnPropDesc$d = Object.getOwnPropertyDescriptor;
var __knownSymbol$d = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$f = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$e = (obj, key, value) => key in obj ? __defProp$e(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$d = (base) => [, , , __create$d(base?.[__knownSymbol$d("metadata")] ?? null)];
var __decoratorStrings$d = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$d = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$f("Function expected") : fn;
var __decoratorContext$d = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$d[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$f("Already initialized") : fns.push(__expectFn$d(fn || null)) });
var __decoratorMetadata$d = (array, target) => __defNormalProp$e(target, __knownSymbol$d("metadata"), array[3]);
var __runInitializers$d = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$d = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$d[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$d(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$d(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$d(it) && (desc[key] = it );
  }
  return desc && __defProp$e(target, name, desc), target;
};
var __publicField$e = (obj, key, value) => __defNormalProp$e(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$f = (obj, member, msg) => member.has(obj) || __typeError$f("Cannot " + msg);
var __privateGet$e = (obj, member, getter) => (__accessCheck$f(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$f = (obj, member, value) => member.has(obj) ? __typeError$f("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$e = (obj, member, value, setter) => (__accessCheck$f(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$d = (obj, member, method) => (__accessCheck$f(obj, member, "access private method"), method);
var _orientation_dec$2, _isToggleButtons_dec$1, _type_dec$1, _selectedIndex_dec$2, _items_dec, _a$d, _items$1, _buttons$1, _selectedIndex$2, _type$1, _isToggleButtons$1, _orientation$3, _momentaryTimer, _pointerListener, _SegmentedButton_instances, renderButtons_fn, updateSelection_fn, applyOrientation_fn$1, didPointerDown_fn, _init$d;
const MOMENTARY_DELAY = 300;
const _SegmentedButton = class _SegmentedButton extends (_a$d = View, _items_dec = [InOut], _selectedIndex_dec$2 = [InOut], _type_dec$1 = [InOut], _isToggleButtons_dec$1 = [InOut], _orientation_dec$2 = [InOut], _a$d) {
  constructor() {
    super(...arguments);
    __runInitializers$d(_init$d, 5, this);
    __privateAdd$f(this, _SegmentedButton_instances);
    __publicField$e(this, "htmlTemplate", html_template$d);
    __privateAdd$f(this, _items$1, []);
    __privateAdd$f(this, _buttons$1, []);
    __privateAdd$f(this, _selectedIndex$2, -1);
    __privateAdd$f(this, _type$1, _SegmentedButton.DEFAULT_TYPE);
    __privateAdd$f(this, _isToggleButtons$1, true);
    __privateAdd$f(this, _orientation$3, _SegmentedButton.HORIZONTAL);
    __privateAdd$f(this, _momentaryTimer);
    __privateAdd$f(this, _pointerListener, (event) => __privateMethod$d(this, _SegmentedButton_instances, didPointerDown_fn).call(this, event));
  }
  initComponent() {
    super.initComponent();
    this.view.addEventListener("pointerdown", __privateGet$e(this, _pointerListener));
    __privateMethod$d(this, _SegmentedButton_instances, renderButtons_fn).call(this);
    this.addClassName(__privateGet$e(this, _type$1));
    __privateMethod$d(this, _SegmentedButton_instances, applyOrientation_fn$1).call(this);
  }
  destructor() {
    clearTimeout(__privateGet$e(this, _momentaryTimer));
    this.view?.removeEventListener("pointerdown", __privateGet$e(this, _pointerListener));
    __privateSet$e(this, _buttons$1, []);
    super.destructor();
  }
  set items(v) {
    if (!isArray(v)) return;
    __privateSet$e(this, _items$1, v.map((item) => toText(item) ?? "").filter((item) => item !== ""));
    if (__privateGet$e(this, _selectedIndex$2) >= __privateGet$e(this, _items$1).length) __privateSet$e(this, _selectedIndex$2, -1);
    __privateMethod$d(this, _SegmentedButton_instances, renderButtons_fn).call(this);
  }
  get items() {
    return __privateGet$e(this, _items$1).slice();
  }
  set selectedIndex(v) {
    if (!Number.isInteger(v) || v < -1) return;
    if (__privateGet$e(this, _items$1).length && v >= __privateGet$e(this, _items$1).length) return;
    clearTimeout(__privateGet$e(this, _momentaryTimer));
    __privateSet$e(this, _selectedIndex$2, v);
    __privateMethod$d(this, _SegmentedButton_instances, updateSelection_fn).call(this);
    if (!__privateGet$e(this, _isToggleButtons$1) && v !== -1) {
      __privateSet$e(this, _momentaryTimer, setTimeout(() => {
        __privateSet$e(this, _momentaryTimer, void 0);
        __privateSet$e(this, _selectedIndex$2, -1);
        __privateMethod$d(this, _SegmentedButton_instances, updateSelection_fn).call(this);
        this.propertyChange("selectedIndex");
      }, MOMENTARY_DELAY));
    }
  }
  get selectedIndex() {
    return __privateGet$e(this, _selectedIndex$2);
  }
  set type(v) {
    if (!isString(v)) return;
    if (__privateGet$e(this, _type$1)) this.removeClassName(__privateGet$e(this, _type$1));
    __privateSet$e(this, _type$1, v);
    this.addClassName(v);
  }
  get type() {
    return __privateGet$e(this, _type$1);
  }
  set isToggleButtons(v) {
    __privateSet$e(this, _isToggleButtons$1, !!v);
  }
  get isToggleButtons() {
    return __privateGet$e(this, _isToggleButtons$1);
  }
  set orientation(v) {
    if (v !== _SegmentedButton.HORIZONTAL && v !== _SegmentedButton.VERTICAL) return;
    __privateSet$e(this, _orientation$3, v);
    __privateMethod$d(this, _SegmentedButton_instances, applyOrientation_fn$1).call(this);
  }
  get orientation() {
    return __privateGet$e(this, _orientation$3);
  }
};
_init$d = __decoratorStart$d(_a$d);
_items$1 = new WeakMap();
_buttons$1 = new WeakMap();
_selectedIndex$2 = new WeakMap();
_type$1 = new WeakMap();
_isToggleButtons$1 = new WeakMap();
_orientation$3 = new WeakMap();
_momentaryTimer = new WeakMap();
_pointerListener = new WeakMap();
_SegmentedButton_instances = new WeakSet();
renderButtons_fn = function() {
  const view = this.view;
  if (!view) return;
  const container = document.createElement("div");
  __privateSet$e(this, _buttons$1, __privateGet$e(this, _items$1).map((item) => {
    const button = document.createElement("div");
    button.textContent = item;
    container.appendChild(button);
    return button;
  }));
  view.replaceChildren(container);
  __privateMethod$d(this, _SegmentedButton_instances, updateSelection_fn).call(this);
};
updateSelection_fn = function() {
  __privateGet$e(this, _buttons$1).forEach((button, index) => {
    button.classList.toggle("selected", index === __privateGet$e(this, _selectedIndex$2));
  });
};
applyOrientation_fn$1 = function() {
  const vertical = __privateGet$e(this, _orientation$3) === _SegmentedButton.VERTICAL;
  this.view?.classList.toggle("vertical", vertical);
  this.view?.classList.toggle("horizontal", !vertical);
};
didPointerDown_fn = function(event) {
  if (!event.isPrimary || !this.enable) return;
  const target = event.target;
  const index = __privateGet$e(this, _buttons$1).findIndex((button) => !!target && button.contains(target));
  if (index === -1 || index === __privateGet$e(this, _selectedIndex$2)) return;
  event.stopPropagation();
  event.preventDefault();
  this.selectedIndex = index;
  this.emit("select", index, __privateGet$e(this, _items$1)[index]);
};
__decorateElement$d(_init$d, 3, "items", _items_dec, _SegmentedButton);
__decorateElement$d(_init$d, 3, "selectedIndex", _selectedIndex_dec$2, _SegmentedButton);
__decorateElement$d(_init$d, 3, "type", _type_dec$1, _SegmentedButton);
__decorateElement$d(_init$d, 3, "isToggleButtons", _isToggleButtons_dec$1, _SegmentedButton);
__decorateElement$d(_init$d, 3, "orientation", _orientation_dec$2, _SegmentedButton);
__decoratorMetadata$d(_init$d, _SegmentedButton);
__publicField$e(_SegmentedButton, "DEFAULT_TYPE", "default");
__publicField$e(_SegmentedButton, "BAR_TYPE", "bar");
__publicField$e(_SegmentedButton, "HORIZONTAL", 0);
__publicField$e(_SegmentedButton, "VERTICAL", 1);
let SegmentedButton = _SegmentedButton;

var html_template$c = "<div class=\"vs_ui_canvas\"><canvas class=\"canvas_inner\"></canvas></div>";

var __defProp$d = Object.defineProperty;
var __getProtoOf$1 = Object.getPrototypeOf;
var __reflectGet$1 = Reflect.get;
var __typeError$e = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$d = (obj, key, value) => key in obj ? __defProp$d(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$d = (obj, key, value) => __defNormalProp$d(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$e = (obj, member, msg) => member.has(obj) || __typeError$e("Cannot " + msg);
var __privateAdd$e = (obj, member, value) => member.has(obj) ? __typeError$e("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod$c = (obj, member, method) => (__accessCheck$e(obj, member, "access private method"), method);
var __superGet$1 = (cls, obj, key) => __reflectGet$1(__getProtoOf$1(cls), key, obj);
var _Canvas_instances, resize_fn;
const _Canvas = class _Canvas extends View {
  constructor() {
    super(...arguments);
    __privateAdd$e(this, _Canvas_instances);
    __publicField$d(this, "htmlTemplate", html_template$c);
    /** the canvas node */
    __publicField$d(this, "canvasNode", null);
    /** the 2d context of the canvas */
    __publicField$d(this, "context", null);
  }
  initComponent() {
    super.initComponent();
    this.canvasNode = this.view.querySelector("canvas");
    if (!this.canvasNode) {
      throw new Error(`vs.ui.Canvas ${this.id}: no canvas node`);
    }
    this.context = this.canvasNode.getContext("2d");
    __privateMethod$c(this, _Canvas_instances, resize_fn).call(this);
  }
  destructor() {
    this.canvasNode = null;
    this.context = null;
    super.destructor();
  }
  /**
   * Returns the 2d context of the canvas
   */
  getContext() {
    return this.context;
  }
  /**
   * The size of the view and of the canvas [width, height], in px; the
   * canvas is drawn again
   */
  set size(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    super.size = v;
    __privateMethod$c(this, _Canvas_instances, resize_fn).call(this);
  }
  get size() {
    return super.size;
  }
  /**
   * Draws the content of the rectangle (all the canvas by default). Clears
   * it by default: override it.
   */
  draw(x = 0, y = 0, width = this.size[0], height = this.size[1]) {
    this.context?.clearRect(x, y, width, height);
  }
  /**
   * Strokes a rectangle, with rounded corners (radius) and rotated
   * (rotation, in radians) [optional]
   */
  drawRect(x, y, w, h, radius = 0, rotation = 0) {
    if (!radius && !rotation) {
      if (this.context) {
        this.context.beginPath();
        this.context.rect(x, y, w, h);
        this.context.stroke();
      }
      return this;
    }
    const points = [x, y];
    for (const [px, py] of [[w, 0], [w, h], [0, h]]) {
      const [rx, ry] = this.rotatePoint(px, py, rotation);
      points.push(x + rx, y + ry);
    }
    if (radius) points.push(radius);
    return this.polygon(...points);
  }
  /**
   * Returns the point rotated around the origin (angle in radians)
   */
  rotatePoint(x, y, angle) {
    return [
      x * Math.cos(angle) - y * Math.sin(angle),
      y * Math.cos(angle) + x * Math.sin(angle)
    ];
  }
  /**
   * Strokes a polygon: x1, y1, x2, y2, x3, y3… With an odd number of
   * arguments, the last one is the radius of the rounded corners.
   */
  polygon(...args) {
    if (args.length < 6) throw new Error("vs.ui.Canvas.polygon: not enough arguments");
    const context = this.context;
    if (!context) return this;
    context.beginPath();
    if (args.length % 2 === 0) {
      context.moveTo(args[0], args[1]);
      for (let i = 2; i < args.length; i += 2) context.lineTo(args[i], args[i + 1]);
    } else {
      const radius = args[args.length - 1];
      const n = (args.length - 1) / 2;
      context.moveTo((args[n * 2 - 2] + args[0]) / 2, (args[n * 2 - 1] + args[1]) / 2);
      for (let i = 0; i < n - 1; i++) {
        context.arcTo(args[i * 2], args[i * 2 + 1], args[i * 2 + 2], args[i * 2 + 3], radius);
      }
      context.arcTo(args[n * 2 - 2], args[n * 2 - 1], args[0], args[1], radius);
    }
    context.closePath();
    context.moveTo(args[0], args[1]);
    context.stroke();
    return this;
  }
  /**
   * Strokes an ellipse (or an arc of ellipse); the angles in radians
   */
  ellipse(cx, cy, rx, ry, rotation = 0, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = false) {
    const context = this.context;
    if (!context) return this;
    context.beginPath();
    context.ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle, anticlockwise);
    context.stroke();
    return this;
  }
};
_Canvas_instances = new WeakSet();
resize_fn = function() {
  const [width, height] = __superGet$1(_Canvas.prototype, this, "size");
  if (!this.canvasNode || width < 0 || height < 0) return;
  this.canvasNode.width = width;
  this.canvasNode.height = height;
  this.draw(0, 0, width, height);
};
let Canvas = _Canvas;

var html_template$b = "<div class=\"vs_ui_popover\">\n  <div class=\"header\" x-hag-hole=\"header\"></div>\n  <div class=\"center\" x-hag-hole=\"children\"></div>\n  <div class=\"footer\" x-hag-hole=\"footer\"></div>\n  <div class=\"arrow\"></div>\n</div>";

var __create$c = Object.create;
var __defProp$c = Object.defineProperty;
var __getOwnPropDesc$c = Object.getOwnPropertyDescriptor;
var __knownSymbol$c = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$d = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$c = (obj, key, value) => key in obj ? __defProp$c(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$c = (base) => [, , , __create$c(base?.[__knownSymbol$c("metadata")] ?? null)];
var __decoratorStrings$c = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$c = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$d("Function expected") : fn;
var __decoratorContext$c = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$c[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$d("Already initialized") : fns.push(__expectFn$c(fn || null)) });
var __decoratorMetadata$c = (array, target) => __defNormalProp$c(target, __knownSymbol$c("metadata"), array[3]);
var __runInitializers$c = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$c = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$c[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$c(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$c(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$c(it) && (desc[key] = it );
  }
  return desc && __defProp$c(target, name, desc), target;
};
var __publicField$c = (obj, key, value) => __defNormalProp$c(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$d = (obj, member, msg) => member.has(obj) || __typeError$d("Cannot " + msg);
var __privateGet$d = (obj, member, getter) => (__accessCheck$d(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$d = (obj, member, value) => member.has(obj) ? __typeError$d("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$d = (obj, member, value, setter) => (__accessCheck$d(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$b = (obj, member, method) => (__accessCheck$d(obj, member, "access private method"), method);
var _hasFooter_dec, _hasHeader_dec, _a$c, _point, _direction, _hasHeader, _hasFooter, _stopWatchingPointer, _PopOver_instances, autoDirection_fn, layout_fn, _init$c;
const ARROW_SIZE = 15;
const MARGIN = 5;
const _PopOver = class _PopOver extends (_a$c = View, _hasHeader_dec = [InOut], _hasFooter_dec = [InOut], _a$c) {
  constructor() {
    super(...arguments);
    __runInitializers$c(_init$c, 5, this);
    __privateAdd$d(this, _PopOver_instances);
    __publicField$c(this, "htmlTemplate", html_template$b);
    /** the arrow node */
    __publicField$c(this, "arrow", null);
    __privateAdd$d(this, _point, null);
    __privateAdd$d(this, _direction);
    __privateAdd$d(this, _hasHeader, false);
    __privateAdd$d(this, _hasFooter, false);
    __privateAdd$d(this, _stopWatchingPointer);
  }
  initComponent() {
    super.initComponent();
    this.arrow = this.view.querySelector(":scope > .arrow");
    this.view.classList.toggle("withHeader", __privateGet$d(this, _hasHeader));
    this.view.classList.toggle("withFooter", __privateGet$d(this, _hasFooter));
  }
  /**
   * A popover is hidden until shown (unless the visible option is true)
   */
  componentDidInitialize() {
    this.hide();
    super.componentDidInitialize();
  }
  destructor() {
    var _a2;
    (_a2 = __privateGet$d(this, _stopWatchingPointer)) == null ? void 0 : _a2.call(this);
    __privateSet$d(this, _stopWatchingPointer, void 0);
    this.arrow = null;
    super.destructor();
  }
  show(point, direction, clb) {
    var _a2;
    if (isFunction(point)) {
      clb = point;
      point = void 0;
    }
    if (!this.view || this.visible) return;
    const isPoint = isArray(point) && point.length === 2 && isNumber(point[0]) && isNumber(point[1]);
    __privateSet$d(this, _point, isPoint ? point.slice() : null);
    __privateSet$d(this, _direction, direction);
    super.show(clb);
    __privateMethod$b(this, _PopOver_instances, layout_fn).call(this);
    (_a2 = __privateGet$d(this, _stopWatchingPointer)) == null ? void 0 : _a2.call(this);
    __privateSet$d(this, _stopWatchingPointer, onPointerDownOutside(this.view, (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
    }));
  }
  hide(clb) {
    var _a2;
    (_a2 = __privateGet$d(this, _stopWatchingPointer)) == null ? void 0 : _a2.call(this);
    __privateSet$d(this, _stopWatchingPointer, void 0);
    super.hide(clb);
  }
  set hasHeader(v) {
    __privateSet$d(this, _hasHeader, !!v);
    this.view?.classList.toggle("withHeader", __privateGet$d(this, _hasHeader));
  }
  get hasHeader() {
    return __privateGet$d(this, _hasHeader);
  }
  set hasFooter(v) {
    __privateSet$d(this, _hasFooter, !!v);
    this.view?.classList.toggle("withFooter", __privateGet$d(this, _hasFooter));
  }
  get hasFooter() {
    return __privateGet$d(this, _hasFooter);
  }
};
_init$c = __decoratorStart$c(_a$c);
_point = new WeakMap();
_direction = new WeakMap();
_hasHeader = new WeakMap();
_hasFooter = new WeakMap();
_stopWatchingPointer = new WeakMap();
_PopOver_instances = new WeakSet();
/**
 * The direction according to the space around the point
 */
autoDirection_fn = function(point, height) {
  const direction = point[0] > window.innerWidth / 2 ? _PopOver.RIGHT : _PopOver.LEFT;
  if (point[1] + height + 2 * ARROW_SIZE < window.innerHeight) return _PopOver.BELOW;
  if (point[1] - height - 2 * ARROW_SIZE > 0) return _PopOver.ABOVE;
  return direction;
};
/**
 * Positions the popover and its arrow at the point
 */
layout_fn = function() {
  const view = this.view;
  const point = __privateGet$d(this, _point);
  if (!view || !point) return;
  const width = view.offsetWidth || Math.max(this.size[0], 0);
  const height = view.offsetHeight || Math.max(this.size[1], 0);
  const maxX = window.innerWidth, maxY = window.innerHeight;
  let x = point[0] - width / 2;
  let y = point[1] - height / 2;
  const directions = [_PopOver.BELOW, _PopOver.ABOVE, _PopOver.LEFT, _PopOver.RIGHT];
  const direction = directions.includes(__privateGet$d(this, _direction)) ? __privateGet$d(this, _direction) : __privateMethod$b(this, _PopOver_instances, autoDirection_fn).call(this, point, height);
  let arrowClass, maskPosition;
  let arrowLeft = `${MARGIN}px`, arrowRight = `${MARGIN}px`;
  if (direction === _PopOver.BELOW || direction === _PopOver.ABOVE) {
    y += direction === _PopOver.BELOW ? height / 2 + ARROW_SIZE : -height / 2 - ARROW_SIZE;
    x = Math.min(Math.max(x, MARGIN), maxX - width - MARGIN);
    arrowClass = direction === _PopOver.BELOW ? "top" : "bottom";
    maskPosition = `${point[0] - x - ARROW_SIZE - 8}px 0px`;
  } else {
    x += direction === _PopOver.LEFT ? width / 2 + ARROW_SIZE : -width / 2 - ARROW_SIZE;
    y = Math.min(Math.max(y, MARGIN), maxY - height - 20);
    if (direction === _PopOver.LEFT) {
      arrowClass = "left";
      arrowLeft = "-13px";
      arrowRight = "auto";
      maskPosition = `0px ${point[1] - y - ARROW_SIZE - 2}px`;
    } else {
      arrowClass = "right";
      arrowLeft = "auto";
      arrowRight = "-13px";
      maskPosition = `0px ${height - (point[1] - y + ARROW_SIZE) - 2}px`;
    }
  }
  if (this.arrow) {
    this.arrow.className = `arrow ${arrowClass}`;
    this.arrow.style.left = arrowLeft;
    this.arrow.style.right = arrowRight;
    this.arrow.style.setProperty("-webkit-mask-position", maskPosition);
    this.arrow.style.setProperty("mask-position", maskPosition);
  }
  const parent = view.parentElement?.getBoundingClientRect();
  this.position = [x - (parent?.left ?? 0), y - (parent?.top ?? 0)];
};
__decorateElement$c(_init$c, 3, "hasHeader", _hasHeader_dec, _PopOver);
__decorateElement$c(_init$c, 3, "hasFooter", _hasFooter_dec, _PopOver);
__decoratorMetadata$c(_init$c, _PopOver);
__publicField$c(_PopOver, "BELOW", 0);
__publicField$c(_PopOver, "ABOVE", 1);
__publicField$c(_PopOver, "LEFT", 2);
__publicField$c(_PopOver, "RIGHT", 3);
let PopOver = _PopOver;

var html_template$a = "<div class=\"vs_ui_splitview\">\n  <div x-hag-hole=\"second_panel\"></div>\n  <div x-hag-hole=\"main_panel\"></div>\n</div>";

var __create$b = Object.create;
var __defProp$b = Object.defineProperty;
var __getOwnPropDesc$b = Object.getOwnPropertyDescriptor;
var __getProtoOf = Object.getPrototypeOf;
var __reflectGet = Reflect.get;
var __knownSymbol$b = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$c = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$b = (base) => [, , , __create$b(base?.[__knownSymbol$b("metadata")] ?? null)];
var __decoratorStrings$b = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$b = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$c("Function expected") : fn;
var __decoratorContext$b = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$b[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$c("Already initialized") : fns.push(__expectFn$b(fn || null)) });
var __decoratorMetadata$b = (array, target) => __defNormalProp$b(target, __knownSymbol$b("metadata"), array[3]);
var __runInitializers$b = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$b = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$b[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$b(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$b(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$b(it) && (desc[key] = it );
  }
  return desc && __defProp$b(target, name, desc), target;
};
var __publicField$b = (obj, key, value) => __defNormalProp$b(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$c = (obj, member, msg) => member.has(obj) || __typeError$c("Cannot " + msg);
var __privateGet$c = (obj, member, getter) => (__accessCheck$c(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$c = (obj, member, value) => member.has(obj) ? __typeError$c("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$c = (obj, member, value, setter) => (__accessCheck$c(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$a = (obj, member, method) => (__accessCheck$c(obj, member, "access private method"), method);
var __superGet = (cls, obj, key) => __reflectGet(__getProtoOf(cls), key, obj);
var _secondPanelPosition_dec, _orientation_dec$1, _mode_dec, _a$b, _secondViews, _mode$1, _orientation$2, _secondPanelPosition, _hideMainPanelButton, _showPopOverButton, _unbindHideMainPanelButton, _unbindShowPopOverButton, _SplitView_instances, isSecondPanelVisible_fn, placeSecondView_fn, _init$b;
const SECOND_VIEW_WIDTH = 320;
const POP_OVER_BORDER_WIDTH = 8;
const POP_OVER_HEIGHT = 500;
const _SplitView = class _SplitView extends (_a$b = View, _mode_dec = [InOut], _orientation_dec$1 = [InOut], _secondPanelPosition_dec = [InOut], _a$b) {
  constructor() {
    super(...arguments);
    __runInitializers$b(_init$b, 5, this);
    __privateAdd$c(this, _SplitView_instances);
    __publicField$b(this, "htmlTemplate", html_template$a);
    /** notified when the second view moves */
    __publicField$b(this, "delegate", null);
    /** the popover of the second view, in the tablet vertical orientation */
    __publicField$b(this, "popOver", new PopOver());
    __privateAdd$c(this, _secondViews, []);
    __privateAdd$c(this, _mode$1, _SplitView.TABLET_MODE);
    __privateAdd$c(this, _orientation$2, "");
    __privateAdd$c(this, _secondPanelPosition, _SplitView.LEFT);
    __privateAdd$c(this, _hideMainPanelButton, null);
    __privateAdd$c(this, _showPopOverButton, null);
    __privateAdd$c(this, _unbindHideMainPanelButton);
    __privateAdd$c(this, _unbindShowPopOverButton);
  }
  initComponent() {
    super.initComponent();
    this.popOver.init();
    this.popOver.hide();
    document.body.appendChild(this.popOver.view);
    if (!__privateGet$c(this, _orientation$2)) {
      const portrait = window.matchMedia?.("(orientation: portrait)").matches ?? window.innerHeight >= window.innerWidth;
      __privateSet$c(this, _orientation$2, portrait ? _SplitView.VERTICAL : _SplitView.HORIZONTAL);
    }
    this.addClassName(__privateGet$c(this, _mode$1), __privateGet$c(this, _orientation$2), __privateGet$c(this, _secondPanelPosition));
    __privateMethod$a(this, _SplitView_instances, placeSecondView_fn).call(this);
  }
  destructor() {
    var _a2, _b;
    (_a2 = __privateGet$c(this, _unbindHideMainPanelButton)) == null ? void 0 : _a2.call(this);
    (_b = __privateGet$c(this, _unbindShowPopOverButton)) == null ? void 0 : _b.call(this);
    __privateSet$c(this, _unbindHideMainPanelButton, __privateSet$c(this, _unbindShowPopOverButton, void 0));
    __privateSet$c(this, _hideMainPanelButton, __privateSet$c(this, _showPopOverButton, null));
    const popOverNode = this.popOver.view;
    this.popOver.destroy();
    popOverNode?.remove();
    __privateSet$c(this, _secondViews, []);
    super.destructor();
  }
  /**
   *  Adds a child: to the second panel (the 'second_panel' hole, or the
   *  popover), else to the main panel
   */
  add(child, extension, view) {
    if (extension !== "second_panel") {
      super.add(child, "main_panel", view);
      return;
    }
    if (!__privateGet$c(this, _secondViews).includes(child)) __privateGet$c(this, _secondViews).push(child);
    if (__privateMethod$a(this, _SplitView_instances, isSecondPanelVisible_fn).call(this)) super.add(child, "second_panel", view);
    else this.popOver.add(child);
  }
  remove(child) {
    const index = __privateGet$c(this, _secondViews).indexOf(child);
    if (index !== -1) {
      __privateGet$c(this, _secondViews).splice(index, 1);
      if (this.popOver.isChild(child)) this.popOver.remove(child);
    }
    super.remove(child);
  }
  removeAllChildren(shouldDestroy = false, extension) {
    const inPopOver = !extension || extension === "second_panel" ? __privateGet$c(this, _secondViews).filter((child) => this.popOver.isChild(child)) : [];
    inPopOver.forEach((child) => {
      this.remove(child);
      if (shouldDestroy) child.destroy();
    });
    const removed = super.removeAllChildren(shouldDestroy, extension);
    return shouldDestroy ? void 0 : [...inPopOver, ...removed ?? []];
  }
  refresh() {
    super.refresh();
    if (this.popOver.visible) this.popOver.refresh();
  }
  /**
   *  Changes the orientation (an angle: -90 or 90 for the horizontal
   *  orientation), called when the device orientation changes
   */
  orientationWillChange(orientation) {
    this.orientation = orientation === 90 || orientation === -90 ? _SplitView.HORIZONTAL : _SplitView.VERTICAL;
  }
  orientationDidChange() {
    this.refresh();
  }
  /**
   *  Displays the popover of the second view (in the tablet vertical
   *  orientation), see PopOver.show
   */
  showPopOver(point, direction) {
    if (__privateGet$c(this, _mode$1) !== _SplitView.TABLET_MODE || __privateGet$c(this, _orientation$2) !== _SplitView.VERTICAL) return;
    this.popOver.show(point, direction);
    this.popOver.refresh();
  }
  /**
   *  Hides the popover of the second view
   */
  hidePopOver() {
    this.popOver.hide();
  }
  /**
   *  Displays the main view over the second view (in mobile mode)
   */
  showMainView() {
    if (__privateGet$c(this, _mode$1) !== _SplitView.MOBILE_MODE) return;
    __privateGet$c(this, _hideMainPanelButton)?.show();
    this.addClassName("main_view_visible");
  }
  /**
   *  Hides the main view (in mobile mode)
   */
  hideMainView() {
    if (__privateGet$c(this, _mode$1) !== _SplitView.MOBILE_MODE) return;
    __privateGet$c(this, _hideMainPanelButton)?.hide();
    this.removeClassName("main_view_visible");
  }
  /**
   * The button which hides the main view (in mobile mode)
   */
  set hideMainPanelButton(button) {
    var _a2;
    (_a2 = __privateGet$c(this, _unbindHideMainPanelButton)) == null ? void 0 : _a2.call(this);
    __privateSet$c(this, _unbindHideMainPanelButton, void 0);
    __privateSet$c(this, _hideMainPanelButton, button);
    if (!button) return;
    if (__privateGet$c(this, _mode$1) === _SplitView.TABLET_MODE) button.hide();
    __privateSet$c(this, _unbindHideMainPanelButton, button.on("select", () => this.hideMainView()));
  }
  get hideMainPanelButton() {
    return __privateGet$c(this, _hideMainPanelButton);
  }
  /**
   * The button which displays the popover (in tablet mode)
   */
  set showPopOverButton(button) {
    var _a2;
    (_a2 = __privateGet$c(this, _unbindShowPopOverButton)) == null ? void 0 : _a2.call(this);
    __privateSet$c(this, _unbindShowPopOverButton, void 0);
    __privateSet$c(this, _showPopOverButton, button);
    if (!button) return;
    if (__privateMethod$a(this, _SplitView_instances, isSecondPanelVisible_fn).call(this)) button.hide();
    __privateSet$c(this, _unbindShowPopOverButton, button.on("select", () => this.showPopOver([20, 20])));
  }
  get showPopOverButton() {
    return __privateGet$c(this, _showPopOverButton);
  }
  set mode(v) {
    if (v !== _SplitView.TABLET_MODE && v !== _SplitView.MOBILE_MODE) return;
    this.removeClassName(__privateGet$c(this, _mode$1));
    __privateSet$c(this, _mode$1, v);
    this.addClassName(v);
    __privateMethod$a(this, _SplitView_instances, placeSecondView_fn).call(this);
  }
  get mode() {
    return __privateGet$c(this, _mode$1);
  }
  set orientation(v) {
    if (v !== _SplitView.VERTICAL && v !== _SplitView.HORIZONTAL) return;
    if (__privateGet$c(this, _orientation$2)) this.removeClassName(__privateGet$c(this, _orientation$2));
    __privateSet$c(this, _orientation$2, v);
    this.addClassName(v);
    __privateMethod$a(this, _SplitView_instances, placeSecondView_fn).call(this);
  }
  get orientation() {
    return __privateGet$c(this, _orientation$2);
  }
  set secondPanelPosition(v) {
    if (v !== _SplitView.LEFT && v !== _SplitView.RIGHT && v !== _SplitView.TOP && v !== _SplitView.BOTTOM) return;
    this.removeClassName(__privateGet$c(this, _secondPanelPosition));
    __privateSet$c(this, _secondPanelPosition, v);
    this.addClassName(v);
  }
  get secondPanelPosition() {
    return __privateGet$c(this, _secondPanelPosition);
  }
};
_init$b = __decoratorStart$b(_a$b);
_secondViews = new WeakMap();
_mode$1 = new WeakMap();
_orientation$2 = new WeakMap();
_secondPanelPosition = new WeakMap();
_hideMainPanelButton = new WeakMap();
_showPopOverButton = new WeakMap();
_unbindHideMainPanelButton = new WeakMap();
_unbindShowPopOverButton = new WeakMap();
_SplitView_instances = new WeakSet();
isSecondPanelVisible_fn = function() {
  return __privateGet$c(this, _mode$1) === _SplitView.MOBILE_MODE || __privateGet$c(this, _orientation$2) === _SplitView.HORIZONTAL;
};
/**
 * Moves the first second view into its panel or into the popover
 */
placeSecondView_fn = function() {
  if (!this.view) return;
  const child = __privateGet$c(this, _secondViews)[0];
  if (!child) return;
  if (__privateMethod$a(this, _SplitView_instances, isSecondPanelVisible_fn).call(this)) {
    this.popOver.hide();
    if (this.popOver.isChild(child)) this.popOver.remove(child);
    if (!this.isChild(child)) __superGet(_SplitView.prototype, this, "add").call(this, child, "second_panel");
    if (child instanceof View) child.show(() => child.refresh());
    __privateGet$c(this, _showPopOverButton)?.hide();
    this.delegate?.willShowView?.(child, this.popOver);
  } else {
    if (this.isChild(child)) __superGet(_SplitView.prototype, this, "remove").call(this, child);
    if (!this.popOver.isChild(child)) this.popOver.add(child);
    if (child instanceof View) child.show();
    this.popOver.size = [SECOND_VIEW_WIDTH + 2 * POP_OVER_BORDER_WIDTH, POP_OVER_HEIGHT];
    __privateGet$c(this, _showPopOverButton)?.show();
    this.delegate?.willHideView?.(child, this.popOver);
  }
};
__decorateElement$b(_init$b, 3, "mode", _mode_dec, _SplitView);
__decorateElement$b(_init$b, 3, "orientation", _orientation_dec$1, _SplitView);
__decorateElement$b(_init$b, 3, "secondPanelPosition", _secondPanelPosition_dec, _SplitView);
__decoratorMetadata$b(_init$b, _SplitView);
__publicField$b(_SplitView, "TABLET_MODE", "tablet");
__publicField$b(_SplitView, "MOBILE_MODE", "mobile");
__publicField$b(_SplitView, "VERTICAL", "vertical");
__publicField$b(_SplitView, "HORIZONTAL", "horizontal");
__publicField$b(_SplitView, "RIGHT", "right");
__publicField$b(_SplitView, "LEFT", "left");
__publicField$b(_SplitView, "BOTTOM", "bottom");
__publicField$b(_SplitView, "TOP", "top");
let SplitView = _SplitView;

var html_template$9 = "<div class=\"vs_ui_switch\">\n  <div>\n    <div class='toggle_on'></div>\n    <div class='toggle_off'></div> \n    <div class='switch'></div> \n  </div>\n</div>";

var __create$a = Object.create;
var __defProp$a = Object.defineProperty;
var __getOwnPropDesc$a = Object.getOwnPropertyDescriptor;
var __knownSymbol$a = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$b = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$a = (base) => [, , , __create$a(base?.[__knownSymbol$a("metadata")] ?? null)];
var __decoratorStrings$a = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$a = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$b("Function expected") : fn;
var __decoratorContext$a = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$a[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$b("Already initialized") : fns.push(__expectFn$a(fn || null)) });
var __decoratorMetadata$a = (array, target) => __defNormalProp$a(target, __knownSymbol$a("metadata"), array[3]);
var __runInitializers$a = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$a = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$a[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$a(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$a(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$a(it) && (desc[key] = it );
  }
  return desc && __defProp$a(target, name, desc), target;
};
var __publicField$a = (obj, key, value) => __defNormalProp$a(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$b = (obj, member, msg) => member.has(obj) || __typeError$b("Cannot " + msg);
var __privateGet$b = (obj, member, getter) => (__accessCheck$b(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$b = (obj, member, value) => member.has(obj) ? __typeError$b("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$b = (obj, member, value, setter) => (__accessCheck$b(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$9 = (obj, member, method) => (__accessCheck$b(obj, member, "access private method"), method);
var _toggled_dec, _textOff_dec, _textOn_dec, _a$a, _tapRecognizer$2, _toggleOnView, _toggleOffView, _switchView, _toggled, _selected, _textOn, _textOff, _Switch_instances, updateSwitch_fn, _init$a;
class Switch extends (_a$a = View, _textOn_dec = [InOut], _textOff_dec = [InOut], _toggled_dec = [InOut], _a$a) {
  constructor() {
    super(...arguments);
    __runInitializers$a(_init$a, 5, this);
    __privateAdd$b(this, _Switch_instances);
    __publicField$a(this, "htmlTemplate", html_template$9);
    /** the theme (see theme.ts) */
    __publicField$a(this, "mode", CSS_DEFAULT);
    __privateAdd$b(this, _tapRecognizer$2);
    __privateAdd$b(this, _toggleOnView, null);
    __privateAdd$b(this, _toggleOffView, null);
    __privateAdd$b(this, _switchView, null);
    __privateAdd$b(this, _toggled, true);
    __privateAdd$b(this, _selected, false);
    __privateAdd$b(this, _textOn, "");
    __privateAdd$b(this, _textOff, "");
  }
  initComponent() {
    super.initComponent();
    const view = this.view;
    __privateSet$b(this, _toggleOnView, view.querySelector(".toggle_on"));
    __privateSet$b(this, _toggleOffView, view.querySelector(".toggle_off"));
    __privateSet$b(this, _switchView, view.querySelector(".switch"));
    __privateSet$b(this, _tapRecognizer$2, new TapRecognizer(this));
    this.addPointerRecognizer(__privateGet$b(this, _tapRecognizer$2));
    this.mode = getDeviceCSSCode();
    if (__privateGet$b(this, _toggleOnView)) __privateGet$b(this, _toggleOnView).textContent = __privateGet$b(this, _textOn);
    if (__privateGet$b(this, _toggleOffView)) __privateGet$b(this, _toggleOffView).textContent = __privateGet$b(this, _textOff);
    __privateMethod$9(this, _Switch_instances, updateSwitch_fn).call(this);
  }
  destructor() {
    if (__privateGet$b(this, _tapRecognizer$2)) {
      this.removePointerRecognizer(__privateGet$b(this, _tapRecognizer$2));
      __privateSet$b(this, _tapRecognizer$2, void 0);
    }
    __privateSet$b(this, _toggleOnView, __privateSet$b(this, _toggleOffView, __privateSet$b(this, _switchView, null)));
    super.destructor();
  }
  viewDidAdd() {
    super.viewDidAdd();
    setTimeout(() => __privateMethod$9(this, _Switch_instances, updateSwitch_fn).call(this), 0);
  }
  refresh() {
    super.refresh();
    this.mode = getDeviceCSSCode();
    __privateMethod$9(this, _Switch_instances, updateSwitch_fn).call(this);
  }
  /**
   * The height of a switch is given by its theme
   */
  didUpdateSizeAndPosition() {
    this.view?.style.removeProperty("height");
    if (this.view) this.view.style.bottom = "auto";
  }
  /**
   * True while the switch is pressed
   */
  get selected() {
    return __privateGet$b(this, _selected);
  }
  /*****************************************************************
   *  Tap delegate
   ****************************************************************/
  didTouch() {
    this.addClassName("pressed");
    __privateSet$b(this, _selected, true);
  }
  didUntouch() {
    this.removeClassName("pressed");
    __privateSet$b(this, _selected, false);
  }
  didTap() {
    this.toggled = !__privateGet$b(this, _toggled);
    this.emit("toggle", __privateGet$b(this, _toggled));
  }
  set textOn(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$b(this, _textOn, text);
    if (__privateGet$b(this, _toggleOnView)) __privateGet$b(this, _toggleOnView).textContent = text;
  }
  get textOn() {
    return __privateGet$b(this, _textOn);
  }
  set textOff(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$b(this, _textOff, text);
    if (__privateGet$b(this, _toggleOffView)) __privateGet$b(this, _toggleOffView).textContent = text;
  }
  get textOff() {
    return __privateGet$b(this, _textOff);
  }
  set toggled(v) {
    __privateSet$b(this, _toggled, !!v);
    __privateMethod$9(this, _Switch_instances, updateSwitch_fn).call(this);
  }
  get toggled() {
    return __privateGet$b(this, _toggled);
  }
}
_init$a = __decoratorStart$a(_a$a);
_tapRecognizer$2 = new WeakMap();
_toggleOnView = new WeakMap();
_toggleOffView = new WeakMap();
_switchView = new WeakMap();
_toggled = new WeakMap();
_selected = new WeakMap();
_textOn = new WeakMap();
_textOff = new WeakMap();
_Switch_instances = new WeakSet();
/**
 * The 'on' class name, and the position of the switch
 */
updateSwitch_fn = function() {
  const view = this.view, switchView = __privateGet$b(this, _switchView);
  if (!view) return;
  view.classList.toggle("on", __privateGet$b(this, _toggled));
  if (!switchView) return;
  let x = 0;
  if (__privateGet$b(this, _toggled) && this.mode === CSS_PURE) {
    x = -15;
  } else if (__privateGet$b(this, _toggled) && this.mode !== CSS_ANDROID) {
    const style = getComputedStyle(view);
    const border = (parseInt(style.borderLeftWidth, 10) || 0) + (parseInt(style.borderRightWidth, 10) || 0);
    x = view.offsetWidth - (switchView.offsetWidth + 2 * switchView.offsetLeft) - border;
  }
  switchView.style.transform = `translate3d(${x}px,0,0)`;
};
__decorateElement$a(_init$a, 3, "textOn", _textOn_dec, Switch);
__decorateElement$a(_init$a, 3, "textOff", _textOff_dec, Switch);
__decorateElement$a(_init$a, 3, "toggled", _toggled_dec, Switch);
__decoratorMetadata$a(_init$a, Switch);

var html_template$8 = "<div class=\"vs_ui_slider\"><div class=\"handle\"></div></div>";

var __create$9 = Object.create;
var __defProp$9 = Object.defineProperty;
var __getOwnPropDesc$9 = Object.getOwnPropertyDescriptor;
var __knownSymbol$9 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$a = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$9 = (base) => [, , , __create$9(base?.[__knownSymbol$9("metadata")] ?? null)];
var __decoratorStrings$9 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$9 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$a("Function expected") : fn;
var __decoratorContext$9 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$9[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$a("Already initialized") : fns.push(__expectFn$9(fn || null)) });
var __decoratorMetadata$9 = (array, target) => __defNormalProp$9(target, __knownSymbol$9("metadata"), array[3]);
var __runInitializers$9 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$9 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$9[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$9(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$9(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$9(it) && (desc[key] = it );
  }
  return desc && __defProp$9(target, name, desc), target;
};
var __publicField$9 = (obj, key, value) => __defNormalProp$9(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$a = (obj, member, msg) => member.has(obj) || __typeError$a("Cannot " + msg);
var __privateGet$a = (obj, member, getter) => (__accessCheck$a(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$a = (obj, member, value) => member.has(obj) ? __typeError$a("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$a = (obj, member, value, setter) => (__accessCheck$a(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$8 = (obj, member, method) => (__accessCheck$a(obj, member, "access private method"), method);
var _orientation_dec, _range_dec, _value_dec, _a$9, _dragRecognizer, _mode, _handleWidth, _handleHeight, _handleDelta, _orientation$1, _value, _range, _Slider_instances, setValueAt_fn, applyOrientation_fn, render_fn$1, _init$9;
const HANDLE_WIDTHS = /* @__PURE__ */ new Map([[CSS_IOS, 28], [CSS_WP7, 30], [CSS_ANDROID, 34], [CSS_BLACKBERRY, 35]]);
const DEFAULT_HANDLE_WIDTH = 23;
const _Slider = class _Slider extends (_a$9 = View, _value_dec = [InOut], _range_dec = [InOut], _orientation_dec = [InOut], _a$9) {
  constructor() {
    super(...arguments);
    __runInitializers$9(_init$9, 5, this);
    __privateAdd$a(this, _Slider_instances);
    __publicField$9(this, "htmlTemplate", html_template$8);
    /** the handle node */
    __publicField$9(this, "handle", null);
    __privateAdd$a(this, _dragRecognizer);
    __privateAdd$a(this, _mode, 0);
    __privateAdd$a(this, _handleWidth, DEFAULT_HANDLE_WIDTH);
    __privateAdd$a(this, _handleHeight, 0);
    __privateAdd$a(this, _handleDelta, 10);
    __privateAdd$a(this, _orientation$1, _Slider.HORIZONTAL);
    __privateAdd$a(this, _value, 0);
    __privateAdd$a(this, _range, [0, 100]);
  }
  initComponent() {
    super.initComponent();
    __privateSet$a(this, _mode, getDeviceCSSCode());
    __privateSet$a(this, _handleWidth, HANDLE_WIDTHS.get(__privateGet$a(this, _mode)) ?? DEFAULT_HANDLE_WIDTH);
    if (__privateGet$a(this, _mode) === CSS_BLACKBERRY) {
      __privateSet$a(this, _handleHeight, 12);
      __privateSet$a(this, _handleDelta, 3);
    }
    this.handle = this.view.querySelector(".handle");
    __privateSet$a(this, _dragRecognizer, new DragRecognizer(this));
    this.addPointerRecognizer(__privateGet$a(this, _dragRecognizer));
    __privateMethod$8(this, _Slider_instances, applyOrientation_fn).call(this);
    __privateMethod$8(this, _Slider_instances, render_fn$1).call(this);
  }
  destructor() {
    if (__privateGet$a(this, _dragRecognizer)) {
      this.removePointerRecognizer(__privateGet$a(this, _dragRecognizer));
      __privateSet$a(this, _dragRecognizer, void 0);
    }
    this.handle = null;
    super.destructor();
  }
  refresh() {
    const view = this.view;
    if (view && this.handle) {
      if (this.handle.offsetWidth) __privateSet$a(this, _handleWidth, this.handle.offsetWidth);
      const delta = __privateGet$a(this, _orientation$1) === _Slider.HORIZONTAL ? view.offsetHeight : view.offsetWidth;
      if (delta) __privateSet$a(this, _handleDelta, delta);
    }
    __privateMethod$8(this, _Slider_instances, render_fn$1).call(this);
    super.refresh();
  }
  /*****************************************************************
   *  Drag delegate
   ****************************************************************/
  didDragStart(event) {
    if (this.handle?.offsetWidth) __privateSet$a(this, _handleWidth, this.handle.offsetWidth);
    __privateMethod$8(this, _Slider_instances, setValueAt_fn).call(this, event);
  }
  didDrag(_delta, event) {
    __privateMethod$8(this, _Slider_instances, setValueAt_fn).call(this, event);
  }
  didDragEnd() {
    this.emit("commit", __privateGet$a(this, _value));
  }
  /**
   * The size of the slider [width, height], in px
   */
  set size(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    super.size = v;
    __privateMethod$8(this, _Slider_instances, render_fn$1).call(this);
  }
  get size() {
    return super.size;
  }
  set value(v) {
    if (!isNumber(v) || Number.isNaN(v)) return;
    const [min, max] = __privateGet$a(this, _range);
    __privateSet$a(this, _value, Math.min(Math.max(v, min), max));
    __privateMethod$8(this, _Slider_instances, render_fn$1).call(this);
  }
  get value() {
    return __privateGet$a(this, _value);
  }
  set range(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    if (v[0] >= v[1]) return;
    __privateSet$a(this, _range, [v[0], v[1]]);
    this.value = __privateGet$a(this, _value);
  }
  get range() {
    return __privateGet$a(this, _range).slice();
  }
  set orientation(v) {
    if (v !== _Slider.HORIZONTAL && v !== _Slider.VERTICAL) return;
    __privateSet$a(this, _orientation$1, v);
    __privateMethod$8(this, _Slider_instances, applyOrientation_fn).call(this);
    __privateMethod$8(this, _Slider_instances, render_fn$1).call(this);
  }
  get orientation() {
    return __privateGet$a(this, _orientation$1);
  }
};
_init$9 = __decoratorStart$9(_a$9);
_dragRecognizer = new WeakMap();
_mode = new WeakMap();
_handleWidth = new WeakMap();
_handleHeight = new WeakMap();
_handleDelta = new WeakMap();
_orientation$1 = new WeakMap();
_value = new WeakMap();
_range = new WeakMap();
_Slider_instances = new WeakSet();
/**
 * The value at the pointer position
 */
setValueAt_fn = function(event) {
  const view = this.view;
  if (!view) return;
  const rect = view.getBoundingClientRect();
  const [min, max] = __privateGet$a(this, _range);
  const ratio = __privateGet$a(this, _orientation$1) === _Slider.HORIZONTAL ? (event.clientX - rect.left) / view.offsetWidth : (event.clientY - rect.top) / view.offsetHeight;
  if (!Number.isFinite(ratio)) return;
  this.value = min + (max - min) * ratio;
  this.emit("input", __privateGet$a(this, _value));
};
applyOrientation_fn = function() {
  const vertical = __privateGet$a(this, _orientation$1) === _Slider.VERTICAL;
  this.view?.classList.toggle("vertical", vertical);
  this.view?.classList.toggle("horizontal", !vertical);
};
/**
 * The position of the handle, and the size of the track background
 */
render_fn$1 = function() {
  const view = this.view, handle = this.handle;
  if (!view || !handle) return;
  const [min, max] = __privateGet$a(this, _range);
  const d1 = __privateGet$a(this, _handleWidth) / 2;
  const d2 = __privateGet$a(this, _mode) === CSS_BLACKBERRY ? (__privateGet$a(this, _handleHeight) - __privateGet$a(this, _handleDelta)) / 2 : (__privateGet$a(this, _handleWidth) - __privateGet$a(this, _handleDelta)) / 2;
  if (__privateGet$a(this, _orientation$1) === _Slider.HORIZONTAL) {
    const x = Math.floor((__privateGet$a(this, _value) - min) * view.offsetWidth / (max - min)) - d1;
    handle.style.transform = `translate3d(${x}px,${-d2}px,0)`;
    view.style.backgroundSize = `${x + d1}px 10px`;
  } else {
    const y = Math.floor((__privateGet$a(this, _value) - min) * view.offsetHeight / (max - min)) - d1;
    handle.style.transform = `translate3d(${-d2}px,${y}px,0)`;
    view.style.backgroundSize = `10px ${y + d1}px`;
  }
};
__decorateElement$9(_init$9, 3, "value", _value_dec, _Slider);
__decorateElement$9(_init$9, 3, "range", _range_dec, _Slider);
__decorateElement$9(_init$9, 3, "orientation", _orientation_dec, _Slider);
__decoratorMetadata$9(_init$9, _Slider);
__publicField$9(_Slider, "HORIZONTAL", 0);
__publicField$9(_Slider, "VERTICAL", 1);
let Slider = _Slider;

var html_template$7 = "<div class=\"vs_ui_picker\">\n  <div class=\"slots\"></div>\n  <div class=\"frame\"></div>\n</div>";

var __create$8 = Object.create;
var __defProp$8 = Object.defineProperty;
var __getOwnPropDesc$8 = Object.getOwnPropertyDescriptor;
var __knownSymbol$8 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$9 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$8 = (base) => [, , , __create$8(base?.[__knownSymbol$8("metadata")] ?? null)];
var __decoratorStrings$8 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$8 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$9("Function expected") : fn;
var __decoratorContext$8 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$8[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$9("Already initialized") : fns.push(__expectFn$8(fn || null)) });
var __decoratorMetadata$8 = (array, target) => __defNormalProp$8(target, __knownSymbol$8("metadata"), array[3]);
var __runInitializers$8 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$8 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$8[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$8(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$8(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$8(it) && (desc[key] = it );
  }
  return desc && __defProp$8(target, name, desc), target;
};
var __publicField$8 = (obj, key, value) => __defNormalProp$8(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$9 = (obj, member, msg) => member.has(obj) || __typeError$9("Cannot " + msg);
var __privateGet$9 = (obj, member, getter) => (__accessCheck$9(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$9 = (obj, member, value) => member.has(obj) ? __typeError$9("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$9 = (obj, member, value, setter) => (__accessCheck$9(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$7 = (obj, member, method) => (__accessCheck$9(obj, member, "access private method"), method);
var _selectedKeys_dec, _data_dec$1, _a$8, _slots, _slotsView, _frameView, _selection, _activeSlot, _pointerId, _startY, _scrollStartY, _scrollStartTime, _hideTimer, _slotToHide, _pointerDownListener, _pointerMoveListener, _pointerUpListener, _buttonListener, _transitionEndListener, _Picker_instances, renderSlot_fn, createButton_fn, maxScroll_fn, isOutside_fn, setPosition_fn, stopAnimation_fn, scrollTo_fn, backWithinBoundaries_fn, didSelect_fn, computeSelection_fn, slotAt_fn, stopTracking_fn, scrollStart_fn, scrollMove_fn, scrollEnd_fn, buttonEvent_fn, _init$8;
const BACK_DURATION = 150;
class Picker extends (_a$8 = View, _data_dec$1 = [InOut], _selectedKeys_dec = [InOut], _a$8) {
  constructor() {
    super(...arguments);
    __runInitializers$8(_init$8, 5, this);
    __privateAdd$9(this, _Picker_instances);
    __publicField$8(this, "htmlTemplate", html_template$7);
    /** notified when the user selects a row */
    __publicField$8(this, "delegate", null);
    /** the theme (see theme.ts) */
    __publicField$8(this, "mode", CSS_DEFAULT);
    /** the height of a row, in px */
    __publicField$8(this, "cellHeight", 44);
    /** the deceleration of a thrown slot */
    __publicField$8(this, "friction", 3e-3);
    __privateAdd$9(this, _slots, []);
    __privateAdd$9(this, _slotsView, null);
    __privateAdd$9(this, _frameView, null);
    __privateAdd$9(this, _selection);
    __privateAdd$9(this, _activeSlot);
    __privateAdd$9(this, _pointerId, 0);
    __privateAdd$9(this, _startY, 0);
    __privateAdd$9(this, _scrollStartY, 0);
    __privateAdd$9(this, _scrollStartTime, 0);
    __privateAdd$9(this, _hideTimer);
    __privateAdd$9(this, _slotToHide);
    __privateAdd$9(this, _pointerDownListener, (event) => __privateMethod$7(this, _Picker_instances, scrollStart_fn).call(this, event));
    __privateAdd$9(this, _pointerMoveListener, (event) => __privateMethod$7(this, _Picker_instances, scrollMove_fn).call(this, event));
    __privateAdd$9(this, _pointerUpListener, (event) => __privateMethod$7(this, _Picker_instances, scrollEnd_fn).call(this, event));
    __privateAdd$9(this, _buttonListener, (event) => __privateMethod$7(this, _Picker_instances, buttonEvent_fn).call(this, event));
    __privateAdd$9(this, _transitionEndListener, (event) => __privateMethod$7(this, _Picker_instances, backWithinBoundaries_fn).call(this, event));
  }
  initComponent() {
    super.initComponent();
    const view = this.view;
    this.mode = getDeviceCSSCode();
    __privateSet$9(this, _slotsView, view.querySelector(".slots"));
    __privateSet$9(this, _frameView, view.querySelector(".frame"));
    if (this.mode === CSS_BLACKBERRY) this.cellHeight = 50;
    if (this.mode === CSS_WP7) this.cellHeight = 83;
    if (this.mode === CSS_ANDROID || this.mode === CSS_WP7) {
      __privateGet$9(this, _frameView)?.remove();
      __privateSet$9(this, _frameView, null);
    }
    if (this.mode === CSS_ANDROID) {
      for (const type of ["pointerdown", "pointerup", "pointercancel"]) {
        view.addEventListener(type, __privateGet$9(this, _buttonListener));
      }
    } else {
      view.style.touchAction = "none";
      view.addEventListener("pointerdown", __privateGet$9(this, _pointerDownListener));
    }
    __privateGet$9(this, _slots).forEach((slot, index) => __privateMethod$7(this, _Picker_instances, renderSlot_fn).call(this, slot, index));
  }
  destructor() {
    const view = this.view;
    view?.removeEventListener("pointerdown", __privateGet$9(this, _pointerDownListener));
    for (const type of ["pointerdown", "pointerup", "pointercancel"]) {
      view?.removeEventListener(type, __privateGet$9(this, _buttonListener));
    }
    __privateMethod$7(this, _Picker_instances, stopTracking_fn).call(this);
    clearTimeout(__privateGet$9(this, _hideTimer));
    __privateGet$9(this, _slots).forEach((slot) => slot.list?.removeEventListener("transitionend", __privateGet$9(this, _transitionEndListener)));
    __privateSet$9(this, _slots, []);
    __privateSet$9(this, _slotsView, __privateSet$9(this, _frameView, null));
    super.destructor();
  }
  /*****************************************************************
   *  Slots
   ****************************************************************/
  /**
   * Adds a slot: its values (key → displayed value), its class names
   * ('right', 'shrink', 'readonly'…) and its key selected by default
   */
  addSlot(values, style = "", defaultValue) {
    const data = { values, style, defaultValue };
    const slot = {
      data,
      entries: Object.entries(values),
      readonly: /\breadonly\b/.test(style),
      list: null,
      position: 0
    };
    __privateGet$9(this, _slots).push(slot);
    __privateSet$9(this, _selection, void 0);
    __privateMethod$7(this, _Picker_instances, renderSlot_fn).call(this, slot, __privateGet$9(this, _slots).length - 1);
  }
  /**
   * Removes all the slots
   */
  removeAllSlots() {
    __privateGet$9(this, _slots).forEach((slot) => slot.list?.removeEventListener("transitionend", __privateGet$9(this, _transitionEndListener)));
    __privateSet$9(this, _slots, []);
    __privateSet$9(this, _selection, void 0);
    __privateSet$9(this, _activeSlot, void 0);
    __privateGet$9(this, _slotsView)?.replaceChildren();
  }
  /**
   * The lowest position of the slot (its last row selected)
   */
  getSlotMaxScroll(slot) {
    const entries = __privateGet$9(this, _slots)[slot]?.entries.length ?? 0;
    return -Math.max(entries - 1, 0) * this.cellHeight;
  }
  /**
   * Selects the row of the key in the slot, without animation. Returns
   * false for an unknown slot or key.
   */
  scrollToValue(slot, key) {
    const target = __privateGet$9(this, _slots)[slot];
    if (!target) return false;
    const index = target.entries.findIndex(([entryKey]) => entryKey === String(key));
    if (index === -1) return false;
    __privateMethod$7(this, _Picker_instances, stopAnimation_fn).call(this, target);
    __privateMethod$7(this, _Picker_instances, setPosition_fn).call(this, target, -index * this.cellHeight);
    return true;
  }
  /**
   * Returns the selected keys and values. The animations are stopped, and
   * the slots put back within their boundaries.
   */
  getSelectedValues() {
    for (const slot of __privateGet$9(this, _slots)) {
      __privateMethod$7(this, _Picker_instances, stopAnimation_fn).call(this, slot);
      const maxScroll = __privateMethod$7(this, _Picker_instances, maxScroll_fn).call(this, slot);
      if (slot.position > 0) __privateMethod$7(this, _Picker_instances, setPosition_fn).call(this, slot, 0);
      else if (slot.position < maxScroll) __privateMethod$7(this, _Picker_instances, setPosition_fn).call(this, slot, maxScroll);
    }
    return __privateMethod$7(this, _Picker_instances, computeSelection_fn).call(this);
  }
  set data(v) {
    if (!isArray(v)) return;
    this.removeAllSlots();
    for (const slot of v) {
      if (!slot?.values) continue;
      this.addSlot(slot.values, slot.style, slot.defaultValue);
    }
  }
  get data() {
    return __privateGet$9(this, _slots).map((slot) => ({ ...slot.data }));
  }
  set selectedKeys(v) {
    if (!isArray(v)) return;
    v.forEach((key, slot) => {
      if (key !== void 0 && key !== null) this.scrollToValue(slot, key);
    });
  }
  get selectedKeys() {
    return __privateMethod$7(this, _Picker_instances, computeSelection_fn).call(this).keys.slice();
  }
  /**
   * The selected value of each slot
   */
  get selectedValues() {
    return __privateMethod$7(this, _Picker_instances, computeSelection_fn).call(this).values.slice();
  }
}
_init$8 = __decoratorStart$8(_a$8);
_slots = new WeakMap();
_slotsView = new WeakMap();
_frameView = new WeakMap();
_selection = new WeakMap();
_activeSlot = new WeakMap();
_pointerId = new WeakMap();
_startY = new WeakMap();
_scrollStartY = new WeakMap();
_scrollStartTime = new WeakMap();
_hideTimer = new WeakMap();
_slotToHide = new WeakMap();
_pointerDownListener = new WeakMap();
_pointerMoveListener = new WeakMap();
_pointerUpListener = new WeakMap();
_buttonListener = new WeakMap();
_transitionEndListener = new WeakMap();
_Picker_instances = new WeakSet();
renderSlot_fn = function(slot, index) {
  const slotsView = __privateGet$9(this, _slotsView);
  if (!slotsView) return;
  const list = document.createElement("ul");
  for (const [, value] of slot.entries) {
    const item = document.createElement("li");
    item.textContent = String(value);
    list.appendChild(item);
  }
  list.style.transitionTimingFunction = "cubic-bezier(0, 0, 0.2, 1)";
  list.style.transform = "translate3d(0,0,0)";
  slot.list = list;
  slot.position = 0;
  const container = document.createElement("div");
  if (this.mode === CSS_ANDROID) {
    const wheel = document.createElement("div");
    wheel.className = slot.data.style ?? "";
    wheel.appendChild(list);
    container.append(__privateMethod$7(this, _Picker_instances, createButton_fn).call(this, "button_incr", "+", slot), wheel, __privateMethod$7(this, _Picker_instances, createButton_fn).call(this, "button_decr", "-", slot));
  } else {
    container.className = slot.data.style ?? "";
    container.appendChild(list);
  }
  slotsView.appendChild(container);
  if (slot.data.defaultValue !== void 0) this.scrollToValue(index, slot.data.defaultValue);
};
createButton_fn = function(className, text, slot) {
  const button = document.createElement("div");
  button.className = slot.readonly ? `${className} readonly` : className;
  if (!slot.readonly) button.textContent = text;
  return button;
};
maxScroll_fn = function(slot) {
  return this.getSlotMaxScroll(__privateGet$9(this, _slots).indexOf(slot));
};
isOutside_fn = function(slot) {
  return slot.position > 0 || slot.position < __privateMethod$7(this, _Picker_instances, maxScroll_fn).call(this, slot);
};
setPosition_fn = function(slot, position) {
  __privateSet$9(this, _selection, void 0);
  slot.position = position;
  if (slot.list) slot.list.style.transform = `translate3d(0,${position}px,0)`;
};
stopAnimation_fn = function(slot) {
  slot.list?.removeEventListener("transitionend", __privateGet$9(this, _transitionEndListener));
  slot.list?.style.setProperty("transition-duration", "0ms");
};
/**
 * Scrolls the slot to the position; out of the boundaries, it goes back
 * within them at the end of the transition
 */
scrollTo_fn = function(slot, position, duration = 100) {
  slot.list?.style.setProperty("transition-duration", `${duration}ms`);
  __privateMethod$7(this, _Picker_instances, setPosition_fn).call(this, slot, position || 0);
  if (__privateMethod$7(this, _Picker_instances, isOutside_fn).call(this, slot)) {
    slot.list?.addEventListener("transitionend", __privateGet$9(this, _transitionEndListener));
  } else {
    __privateMethod$7(this, _Picker_instances, didSelect_fn).call(this);
  }
};
backWithinBoundaries_fn = function(event) {
  const slot = __privateGet$9(this, _slots).find((slot2) => slot2.list === event.target);
  if (!slot) return;
  slot.list.removeEventListener("transitionend", __privateGet$9(this, _transitionEndListener));
  __privateMethod$7(this, _Picker_instances, scrollTo_fn).call(this, slot, slot.position > 0 ? 0 : __privateMethod$7(this, _Picker_instances, maxScroll_fn).call(this, slot), BACK_DURATION);
};
didSelect_fn = function() {
  this.delegate?.pickerViewSelectRow?.(this);
  this.propertyChange("selectedKeys");
  this.emit("select", __privateMethod$7(this, _Picker_instances, computeSelection_fn).call(this));
};
computeSelection_fn = function() {
  if (__privateGet$9(this, _selection)) return __privateGet$9(this, _selection);
  const keys = [], values = [];
  for (const slot of __privateGet$9(this, _slots)) {
    if (!slot.entries.length) continue;
    const index = Math.min(Math.max(-Math.round(slot.position / this.cellHeight), 0), slot.entries.length - 1);
    const [key, value] = slot.entries[index];
    keys.push(key);
    values.push(value);
  }
  __privateSet$9(this, _selection, { keys, values });
  return __privateGet$9(this, _selection);
};
/*****************************************************************
 *  Pointer events
 ****************************************************************/
/**
 * The slot under the pointer
 */
slotAt_fn = function(event) {
  const target = event.target;
  const list = target?.closest?.("ul");
  const slot = list && __privateGet$9(this, _slots).find((slot2) => slot2.list === list);
  if (slot) return slot;
  if (!target || target !== __privateGet$9(this, _frameView) || !__privateGet$9(this, _slotsView)) return void 0;
  const border = parseInt(getComputedStyle(__privateGet$9(this, _frameView)).borderLeftWidth, 10) || 0;
  const delta = this.mode === CSS_BLACKBERRY ? 8 : 0;
  const x = event.clientX - __privateGet$9(this, _slotsView).getBoundingClientRect().left - border - delta;
  let right = 0;
  return __privateGet$9(this, _slots).find((slot2) => {
    right += slot2.list?.offsetWidth ?? 0;
    return x < right;
  });
};
stopTracking_fn = function() {
  document.removeEventListener("pointermove", __privateGet$9(this, _pointerMoveListener), true);
  document.removeEventListener("pointerup", __privateGet$9(this, _pointerUpListener), true);
  document.removeEventListener("pointercancel", __privateGet$9(this, _pointerUpListener), true);
};
scrollStart_fn = function(event) {
  if (!event.isPrimary || !this.enable) return;
  const slot = __privateMethod$7(this, _Picker_instances, slotAt_fn).call(this, event);
  if (!slot || slot.readonly || !slot.list) return;
  event.preventDefault();
  event.stopPropagation();
  __privateSet$9(this, _activeSlot, slot);
  __privateSet$9(this, _pointerId, event.pointerId);
  __privateMethod$7(this, _Picker_instances, stopAnimation_fn).call(this, slot);
  const transform = getComputedStyle(slot.list).transform;
  if (transform && transform !== "none") {
    try {
      const y = new DOMMatrix(transform).m42;
      if (y !== slot.position) __privateMethod$7(this, _Picker_instances, setPosition_fn).call(this, slot, y);
    } catch {
    }
  }
  __privateSet$9(this, _startY, event.clientY);
  __privateSet$9(this, _scrollStartY, slot.position);
  __privateSet$9(this, _scrollStartTime, event.timeStamp);
  document.addEventListener("pointermove", __privateGet$9(this, _pointerMoveListener), true);
  document.addEventListener("pointerup", __privateGet$9(this, _pointerUpListener), true);
  document.addEventListener("pointercancel", __privateGet$9(this, _pointerUpListener), true);
  if (this.mode === CSS_WP7 || this.mode === CSS_BLACKBERRY) {
    clearTimeout(__privateGet$9(this, _hideTimer));
    if (__privateGet$9(this, _slotToHide) && __privateGet$9(this, _slotToHide) !== slot) {
      __privateGet$9(this, _slotToHide).list?.parentElement?.classList.remove("visible");
      __privateSet$9(this, _slotToHide, void 0);
    }
    slot.list.parentElement?.classList.add("visible");
    if (this.mode === CSS_WP7) this.addClassName("dragging");
  }
};
scrollMove_fn = function(event) {
  const slot = __privateGet$9(this, _activeSlot);
  if (!slot || event.pointerId !== __privateGet$9(this, _pointerId)) return;
  event.preventDefault();
  event.stopPropagation();
  let delta = event.clientY - __privateGet$9(this, _startY);
  if (__privateMethod$7(this, _Picker_instances, isOutside_fn).call(this, slot)) delta /= 2;
  __privateMethod$7(this, _Picker_instances, setPosition_fn).call(this, slot, slot.position + delta);
  __privateSet$9(this, _startY, event.clientY);
  if (event.timeStamp - __privateGet$9(this, _scrollStartTime) > 80) {
    __privateSet$9(this, _scrollStartY, slot.position);
    __privateSet$9(this, _scrollStartTime, event.timeStamp);
  }
};
scrollEnd_fn = function(event) {
  const slot = __privateGet$9(this, _activeSlot);
  if (!slot || event.pointerId !== __privateGet$9(this, _pointerId)) return;
  __privateMethod$7(this, _Picker_instances, stopTracking_fn).call(this);
  __privateSet$9(this, _activeSlot, void 0);
  if (this.mode === CSS_WP7 || this.mode === CSS_BLACKBERRY) {
    __privateSet$9(this, _slotToHide, slot);
    __privateSet$9(this, _hideTimer, setTimeout(() => {
      __privateGet$9(this, _slotToHide)?.list?.parentElement?.classList.remove("visible");
      __privateSet$9(this, _slotToHide, void 0);
      this.removeClassName("dragging");
    }, 1e3));
  }
  const maxScroll = __privateMethod$7(this, _Picker_instances, maxScroll_fn).call(this, slot);
  if (__privateMethod$7(this, _Picker_instances, isOutside_fn).call(this, slot)) {
    __privateMethod$7(this, _Picker_instances, scrollTo_fn).call(this, slot, slot.position > 0 ? 0 : maxScroll);
    return;
  }
  let distance = slot.position - __privateGet$9(this, _scrollStartY);
  if (Math.abs(distance) < this.cellHeight / 1.5) {
    if (slot.position % this.cellHeight) {
      __privateMethod$7(this, _Picker_instances, scrollTo_fn).call(this, slot, Math.round(slot.position / this.cellHeight) * this.cellHeight, 100);
    } else {
      __privateMethod$7(this, _Picker_instances, didSelect_fn).call(this);
    }
    return;
  }
  const duration = Math.max(event.timeStamp - __privateGet$9(this, _scrollStartTime), 1);
  let newDuration = 2 * distance / duration / this.friction;
  distance = this.friction / 2 * (newDuration * newDuration);
  if (newDuration < 0) {
    newDuration = -newDuration;
    distance = -distance;
  }
  const quarter = (this.view?.clientHeight ?? 0) / 4;
  let position = slot.position + distance;
  if (position > 0) {
    position = Math.min(position / 2, quarter);
    newDuration /= 3;
  } else if (position < maxScroll) {
    position = Math.max((position - maxScroll) / 2 + maxScroll, maxScroll - quarter);
    newDuration /= 3;
  } else {
    position = Math.round(position / this.cellHeight) * this.cellHeight;
  }
  __privateMethod$7(this, _Picker_instances, scrollTo_fn).call(this, slot, Math.round(position), Math.round(newDuration));
};
/**
 * The + and - buttons of the Android theme
 */
buttonEvent_fn = function(event) {
  const button = event.target?.closest?.(".button_incr, .button_decr");
  if (!button || button.classList.contains("readonly")) return;
  if (event.type === "pointerdown") {
    if (this.enable) button.classList.add("active");
    return;
  }
  const wasActive = button.classList.contains("active");
  button.classList.remove("active");
  if (event.type !== "pointerup" || !wasActive) return;
  const slot = __privateGet$9(this, _slots).find((slot2) => slot2.list?.parentElement?.parentElement === button.parentElement);
  if (!slot) return;
  const position = button.classList.contains("button_decr") ? Math.min(slot.position + this.cellHeight, 0) : Math.max(slot.position - this.cellHeight, __privateMethod$7(this, _Picker_instances, maxScroll_fn).call(this, slot));
  __privateMethod$7(this, _Picker_instances, scrollTo_fn).call(this, slot, position);
};
__decorateElement$8(_init$8, 3, "data", _data_dec$1, Picker);
__decorateElement$8(_init$8, 3, "selectedKeys", _selectedKeys_dec, Picker);
__decoratorMetadata$8(_init$8, Picker);
__publicField$8(Picker, "NUMBERS", { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 });

var __create$7 = Object.create;
var __defProp$7 = Object.defineProperty;
var __getOwnPropDesc$7 = Object.getOwnPropertyDescriptor;
var __knownSymbol$7 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$8 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$7 = (base) => [, , , __create$7(base?.[__knownSymbol$7("metadata")] ?? null)];
var __decoratorStrings$7 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$7 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$8("Function expected") : fn;
var __decoratorContext$7 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$7[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$8("Already initialized") : fns.push(__expectFn$7(fn || null)) });
var __decoratorMetadata$7 = (array, target) => __defNormalProp$7(target, __knownSymbol$7("metadata"), array[3]);
var __runInitializers$7 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$7 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$7[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$7(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$7(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$7(it) && (desc[key] = it );
  }
  return desc && __defProp$7(target, name, desc), target;
};
var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, key + "" , value);
var __accessCheck$8 = (obj, member, msg) => member.has(obj) || __typeError$8("Cannot " + msg);
var __privateGet$8 = (obj, member, getter) => (__accessCheck$8(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$8 = (obj, member, value) => member.has(obj) ? __typeError$8("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$8 = (obj, member, value, setter) => (__accessCheck$8(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$6 = (obj, member, method) => (__accessCheck$8(obj, member, "access private method"), method);
var _itemsSelectable_dec, _scroll_dec$1, _data_dec, _a$7, _data, _scroll$1, _itemsSelectable, _tapRecognizer$1, _touchedIndex, _AbstractList_instances, untouchItem_fn, applyScroll_fn$1, _init$7;
class AbstractList extends (_a$7 = View, _data_dec = [InOut], _scroll_dec$1 = [InOut], _itemsSelectable_dec = [InOut], _a$7) {
  constructor() {
    super(...arguments);
    __runInitializers$7(_init$7, 5, this);
    __privateAdd$8(this, _AbstractList_instances);
    /** the node of the items */
    __publicField$7(this, "itemsView", null);
    __privateAdd$8(this, _data, []);
    __privateAdd$8(this, _scroll$1, false);
    __privateAdd$8(this, _itemsSelectable, true);
    __privateAdd$8(this, _tapRecognizer$1);
    __privateAdd$8(this, _touchedIndex, -1);
  }
  initComponent() {
    super.initComponent();
    const view = this.view;
    this.itemsView = view.querySelector('[x-hag-hole="item_children"]') ?? view.querySelector("ul") ?? view;
    __privateSet$8(this, _tapRecognizer$1, new TapRecognizer(this));
    this.addPointerRecognizer(__privateGet$8(this, _tapRecognizer$1));
    __privateMethod$6(this, _AbstractList_instances, applyScroll_fn$1).call(this);
    this.renderData();
  }
  destructor() {
    if (__privateGet$8(this, _tapRecognizer$1)) {
      this.removePointerRecognizer(__privateGet$8(this, _tapRecognizer$1));
      __privateSet$8(this, _tapRecognizer$1, void 0);
    }
    this.itemsView = null;
    super.destructor();
  }
  /** gives the feedback of a touched item */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  touchItemFeedback(_index) {
  }
  /** removes the feedback of a touched item */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  untouchItemFeedback(_index) {
  }
  /** the user tapped the item */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  didSelectItem(_index) {
  }
  /*****************************************************************
   *  Tap delegate
   ****************************************************************/
  didTouch(_target, _element, event) {
    __privateMethod$6(this, _AbstractList_instances, untouchItem_fn).call(this);
    if (!__privateGet$8(this, _itemsSelectable)) return;
    const index = this.itemIndexOf(event.target);
    if (index === -1) return;
    __privateSet$8(this, _touchedIndex, index);
    this.touchItemFeedback(index);
  }
  didUntouch() {
    const index = __privateGet$8(this, _touchedIndex);
    if (index !== -1) this.untouchItemFeedback(index);
  }
  didTap() {
    const index = __privateGet$8(this, _touchedIndex);
    __privateSet$8(this, _touchedIndex, -1);
    if (index !== -1 && __privateGet$8(this, _itemsSelectable)) this.didSelectItem(index);
  }
  /**
   * Scrolls to the item at the index, animated during time ms (200 by
   * default, 0 for no animation)
   */
  scrollToElementAt(index, time = 200) {
    const container = this.itemsView, node = this.itemNodeAt(index);
    if (!__privateGet$8(this, _scroll$1) || !container || !node) return;
    const top = container.scrollTop + node.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({ top, behavior: isNumber(time) && time > 0 ? "smooth" : "auto" });
  }
  set data(v) {
    if (!isArray(v)) return;
    __privateSet$8(this, _data, v.slice());
    __privateSet$8(this, _touchedIndex, -1);
    if (this.view) this.renderData();
  }
  get data() {
    return __privateGet$8(this, _data).slice();
  }
  /**
   * The items, without copy (for the subclasses)
   */
  get items() {
    return __privateGet$8(this, _data);
  }
  set scroll(v) {
    __privateSet$8(this, _scroll$1, !!v);
    __privateMethod$6(this, _AbstractList_instances, applyScroll_fn$1).call(this);
  }
  get scroll() {
    return __privateGet$8(this, _scroll$1);
  }
  set itemsSelectable(v) {
    __privateSet$8(this, _itemsSelectable, !!v);
    if (!__privateGet$8(this, _itemsSelectable)) __privateMethod$6(this, _AbstractList_instances, untouchItem_fn).call(this);
  }
  get itemsSelectable() {
    return __privateGet$8(this, _itemsSelectable);
  }
}
_init$7 = __decoratorStart$7(_a$7);
_data = new WeakMap();
_scroll$1 = new WeakMap();
_itemsSelectable = new WeakMap();
_tapRecognizer$1 = new WeakMap();
_touchedIndex = new WeakMap();
_AbstractList_instances = new WeakSet();
untouchItem_fn = function() {
  if (__privateGet$8(this, _touchedIndex) !== -1) this.untouchItemFeedback(__privateGet$8(this, _touchedIndex));
  __privateSet$8(this, _touchedIndex, -1);
};
/*****************************************************************
 *  Scroll
 ****************************************************************/
applyScroll_fn$1 = function() {
  const style = this.itemsView?.style;
  if (!style) return;
  if (__privateGet$8(this, _scroll$1)) {
    style.overflowY = "auto";
    style.height = "100%";
    style.boxSizing = "border-box";
    style.overscrollBehavior = "contain";
  } else {
    for (const property of ["overflow-y", "height", "box-sizing", "overscroll-behavior"]) {
      style.removeProperty(property);
    }
  }
};
__decorateElement$7(_init$7, 3, "data", _data_dec, AbstractList);
__decorateElement$7(_init$7, 3, "scroll", _scroll_dec$1, AbstractList);
__decorateElement$7(_init$7, 3, "itemsSelectable", _itemsSelectable_dec, AbstractList);
__decoratorMetadata$7(_init$7, AbstractList);

var html_template$6 = "<div class=\"vs_ui_list\"><ul x-hag-hole=\"item_children\"/></div>";

var __create$6 = Object.create;
var __defProp$6 = Object.defineProperty;
var __getOwnPropDesc$6 = Object.getOwnPropertyDescriptor;
var __knownSymbol$6 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$7 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$6 = (base) => [, , , __create$6(base?.[__knownSymbol$6("metadata")] ?? null)];
var __decoratorStrings$6 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$6 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$7("Function expected") : fn;
var __decoratorContext$6 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$6[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$7("Already initialized") : fns.push(__expectFn$6(fn || null)) });
var __decoratorMetadata$6 = (array, target) => __defNormalProp$6(target, __knownSymbol$6("metadata"), array[3]);
var __runInitializers$6 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$6 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$6[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$6(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$6(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$6(it) && (desc[key] = it );
  }
  return desc && __defProp$6(target, name, desc), target;
};
var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$7 = (obj, member, msg) => member.has(obj) || __typeError$7("Cannot " + msg);
var __privateGet$7 = (obj, member, getter) => (__accessCheck$7(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$7 = (obj, member, value) => member.has(obj) ? __typeError$7("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$7 = (obj, member, value, setter) => (__accessCheck$7(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$5 = (obj, member, method) => (__accessCheck$7(obj, member, "access private method"), method);
var _pressed, _label_dec$1, _title_dec, _a$6, _title, _label$1, _labelView, _DefaultListItem_instances, render_fn, _init$6, _title_dec2, _b$1, _title2, _titleView, _init2$1, _filters_dec, _hasArrow_dec, _type_dec, _selectedItem_dec, _selectedIndex_dec$1, _c$1, _type, _listItems, _unbindItems, _template, _selectedIndex$1, _selectedItem, _filters, _hasArrow, _directAccess, _directAccessValue, _letters, _accessIndex, _accessStartListener, _accessMoveListener, _accessEndListener, _List_instances, freeListItems_fn, configureItem_fn, createItem_fn, buildSection_fn, listItemOf_fn, _List_static, matches_fn, renderDirectAccessBar_fn, removeDirectAccessBar_fn, letterIndexAt_fn, accessStart_fn, accessMove_fn, accessEnd_fn, scrollToTitle_fn, _init3$1;
class AbstractListItem extends View {
  constructor() {
    super(...arguments);
    __privateAdd$7(this, _pressed, false);
    /** the index of the item in the list data */
    __publicField$6(this, "index", 0);
  }
  /**
   * The item is touched (the 'pressed' class name)
   */
  set pressed(v) {
    __privateSet$7(this, _pressed, !!v);
    this.view?.classList.toggle("pressed", __privateGet$7(this, _pressed));
  }
  get pressed() {
    return __privateGet$7(this, _pressed);
  }
  /**
   * Called when the user selects the item
   */
  // eslint-disable-next-line class-methods-use-this
  didSelect() {
  }
}
_pressed = new WeakMap();
class DefaultListItem extends (_a$6 = AbstractListItem, _title_dec = [InOut], _label_dec$1 = [InOut], _a$6) {
  constructor() {
    super(...arguments);
    __runInitializers$6(_init$6, 5, this);
    __privateAdd$7(this, _DefaultListItem_instances);
    __publicField$6(this, "htmlTemplate", "<li></li>");
    __privateAdd$7(this, _title, "");
    __privateAdd$7(this, _label$1, "");
    __privateAdd$7(this, _labelView, null);
  }
  initComponent() {
    super.initComponent();
    __privateSet$7(this, _labelView, document.createElement("span"));
    __privateMethod$5(this, _DefaultListItem_instances, render_fn).call(this);
  }
  set title(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$7(this, _title, text);
    __privateMethod$5(this, _DefaultListItem_instances, render_fn).call(this);
  }
  get title() {
    return __privateGet$7(this, _title);
  }
  set label(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$7(this, _label$1, text);
    __privateMethod$5(this, _DefaultListItem_instances, render_fn).call(this);
  }
  get label() {
    return __privateGet$7(this, _label$1);
  }
}
_init$6 = __decoratorStart$6(_a$6);
_title = new WeakMap();
_label$1 = new WeakMap();
_labelView = new WeakMap();
_DefaultListItem_instances = new WeakSet();
render_fn = function() {
  const view = this.view;
  if (!view || !__privateGet$7(this, _labelView)) return;
  __privateGet$7(this, _labelView).textContent = __privateGet$7(this, _label$1);
  view.replaceChildren(__privateGet$7(this, _title), ...__privateGet$7(this, _label$1) ? [__privateGet$7(this, _labelView)] : []);
};
__decorateElement$6(_init$6, 3, "title", _title_dec, DefaultListItem);
__decorateElement$6(_init$6, 3, "label", _label_dec$1, DefaultListItem);
__decoratorMetadata$6(_init$6, DefaultListItem);
class SimpleListItem extends (_b$1 = AbstractListItem, _title_dec2 = [InOut], _b$1) {
  constructor() {
    super(...arguments);
    __runInitializers$6(_init2$1, 5, this);
    __publicField$6(this, "htmlTemplate", '<div class="simplelist_item"><div class="title"></div></div>');
    __privateAdd$7(this, _title2, "");
    __privateAdd$7(this, _titleView, null);
  }
  initComponent() {
    super.initComponent();
    __privateSet$7(this, _titleView, this.view.querySelector(".title"));
    if (__privateGet$7(this, _titleView)) __privateGet$7(this, _titleView).textContent = __privateGet$7(this, _title2);
  }
  set title(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$7(this, _title2, text);
    if (__privateGet$7(this, _titleView)) __privateGet$7(this, _titleView).textContent = text;
  }
  get title() {
    return __privateGet$7(this, _title2);
  }
}
_init2$1 = __decoratorStart$6(_b$1);
_title2 = new WeakMap();
_titleView = new WeakMap();
__decorateElement$6(_init2$1, 3, "title", _title_dec2, SimpleListItem);
__decoratorMetadata$6(_init2$1, SimpleListItem);
const _List = class _List extends (_c$1 = AbstractList, _selectedIndex_dec$1 = [Out], _selectedItem_dec = [Out], _type_dec = [InOut], _hasArrow_dec = [InOut], _filters_dec = [InOut], _c$1) {
  constructor() {
    super(...arguments);
    __runInitializers$6(_init3$1, 5, this);
    __privateAdd$7(this, _List_instances);
    __publicField$6(this, "htmlTemplate", html_template$6);
    __privateAdd$7(this, _type, _List.DEFAULT_LIST);
    __privateAdd$7(this, _listItems, []);
    __privateAdd$7(this, _unbindItems, []);
    __privateAdd$7(this, _template);
    __privateAdd$7(this, _selectedIndex$1, -1);
    __privateAdd$7(this, _selectedItem);
    __privateAdd$7(this, _filters, null);
    __privateAdd$7(this, _hasArrow, false);
    __privateAdd$7(this, _directAccess, null);
    __privateAdd$7(this, _directAccessValue, null);
    __privateAdd$7(this, _letters, []);
    __privateAdd$7(this, _accessIndex, -1);
    __privateAdd$7(this, _accessStartListener, (event) => __privateMethod$5(this, _List_instances, accessStart_fn).call(this, event));
    __privateAdd$7(this, _accessMoveListener, (event) => __privateMethod$5(this, _List_instances, accessMove_fn).call(this, event));
    __privateAdd$7(this, _accessEndListener, () => __privateMethod$5(this, _List_instances, accessEnd_fn).call(this));
  }
  initComponent() {
    super.initComponent();
    this.addClassName(__privateGet$7(this, _type));
    this.view.classList.toggle("arrow", __privateGet$7(this, _hasArrow));
  }
  destructor() {
    __privateMethod$5(this, _List_instances, freeListItems_fn).call(this);
    __privateMethod$5(this, _List_instances, removeDirectAccessBar_fn).call(this);
    if (__privateGet$7(this, _template) instanceof View) __privateGet$7(this, _template).destroy();
    __privateSet$7(this, _template, void 0);
    super.destructor();
  }
  /**
   *  Sets the template of the items (see setItemTemplate)
   */
  add(child) {
    if (child instanceof AbstractListItem) this.setItemTemplate(child);
  }
  /**
   *  Sets the template of the items: a class of item, or an item which is
   *  cloned (destroyed with the list)
   */
  setItemTemplate(template) {
    if (!template) return;
    if (!isFunction(template) && !(template instanceof AbstractListItem)) return;
    if (__privateGet$7(this, _template) instanceof View && __privateGet$7(this, _template) !== template) __privateGet$7(this, _template).destroy();
    __privateSet$7(this, _template, template);
    if (this.view) this.renderData();
  }
  /**
   *  Sets the template of the items from a registered component (see
   *  View.createAndAddComponent)
   */
  setItemTemplateName(name) {
    return this.createAndAddComponent(name, {}, "item_children");
  }
  /**
   * Returns the items
   */
  getItems() {
    return __privateGet$7(this, _listItems).slice();
  }
  renderData() {
    const itemsView = this.itemsView;
    if (!itemsView) return;
    __privateMethod$5(this, _List_instances, freeListItems_fn).call(this);
    itemsView.scrollTop = 0;
    const items = this.items;
    const nodes = [];
    if (__privateGet$7(this, _type) === _List.DEFAULT_LIST) {
      items.forEach((_item, index) => nodes.push(__privateMethod$5(this, _List_instances, createItem_fn).call(this, index).view));
    } else {
      __privateSet$7(this, _letters, []);
      let index = 0;
      while (index < items.length) {
        let title = null;
        if (isString(items[index])) {
          title = items[index];
          __privateGet$7(this, _letters).push(title[0] ?? "");
          index++;
        }
        const [section, next] = __privateMethod$5(this, _List_instances, buildSection_fn).call(this, title, index);
        nodes.push(section);
        index = next;
      }
    }
    itemsView.replaceChildren(...nodes);
    __privateMethod$5(this, _List_instances, renderDirectAccessBar_fn).call(this);
    this.applyFilters();
    if (__privateGet$7(this, _selectedIndex$1) !== -1) {
      this.batch(() => {
        __privateSet$7(this, _selectedIndex$1, -1);
        __privateSet$7(this, _selectedItem, void 0);
        this.propertyChange("selectedIndex");
        this.propertyChange("selectedItem");
      });
    }
  }
  itemIndexOf(node) {
    return __privateMethod$5(this, _List_instances, listItemOf_fn).call(this, node)?.index ?? -1;
  }
  itemNodeAt(index) {
    return __privateGet$7(this, _listItems).find((item) => item.index === index)?.view ?? void 0;
  }
  touchItemFeedback(index) {
    const item = __privateGet$7(this, _listItems).find((item2) => item2.index === index);
    if (item) item.pressed = true;
  }
  untouchItemFeedback(index) {
    const item = __privateGet$7(this, _listItems).find((item2) => item2.index === index);
    if (item) item.pressed = false;
  }
  didSelectItem(index) {
    __privateGet$7(this, _listItems).find((item) => item.index === index)?.didSelect();
    this.batch(() => {
      this.selectedIndex = index;
    });
    this.emit("itemselect", index, __privateGet$7(this, _selectedItem));
  }
  /**
   * Hides the items which do not match all the filters
   */
  applyFilters() {
    const filters = __privateGet$7(this, _filters) ?? [];
    for (const listItem of __privateGet$7(this, _listItems)) {
      const item = this.items[listItem.index];
      if (filters.every((filter) => {
        var _a2;
        return __privateMethod$5(_a2 = _List, _List_static, matches_fn).call(_a2, filter, item);
      })) listItem.show();
      else listItem.hide();
    }
  }
  /**
   * Returns the section of the title at the index (BLOCK_LIST, TAB_LIST)
   */
  getTitleItem(index) {
    const titles = this.itemsView?.querySelectorAll(":scope > li > div") ?? [];
    return titles[index]?.parentElement ?? void 0;
  }
  /**
   * Returns the position of the section of the title at the index
   */
  getTitlePosition(index) {
    return this.getTitleItem(index)?.offsetTop ?? 0;
  }
  set selectedIndex(v) {
    if (!Number.isInteger(v) || v < -1 || v >= this.items.length) return;
    const previous = __privateGet$7(this, _selectedItem);
    __privateSet$7(this, _selectedIndex$1, v);
    __privateSet$7(this, _selectedItem, v === -1 ? void 0 : this.items[v]);
    if (!Object.is(previous, __privateGet$7(this, _selectedItem))) this.propertyChange("selectedItem");
  }
  get selectedIndex() {
    return __privateGet$7(this, _selectedIndex$1);
  }
  set selectedItem(v) {
    this.batch(() => {
      this.selectedIndex = this.items.indexOf(v);
    });
  }
  get selectedItem() {
    return __privateGet$7(this, _selectedItem);
  }
  set type(v) {
    if (v !== _List.BLOCK_LIST && v !== _List.TAB_LIST && v !== _List.DEFAULT_LIST) return;
    this.removeClassName(__privateGet$7(this, _type));
    __privateSet$7(this, _type, v);
    this.addClassName(v);
    if (this.view) this.renderData();
  }
  get type() {
    return __privateGet$7(this, _type);
  }
  set hasArrow(v) {
    __privateSet$7(this, _hasArrow, !!v);
    this.view?.classList.toggle("arrow", __privateGet$7(this, _hasArrow));
  }
  get hasArrow() {
    return __privateGet$7(this, _hasArrow);
  }
  set filters(v) {
    if (v !== null && !isArray(v)) return;
    __privateSet$7(this, _filters, v ? v.slice() : null);
    this.applyFilters();
  }
  get filters() {
    return __privateGet$7(this, _filters)?.slice() ?? null;
  }
};
_init3$1 = __decoratorStart$6(_c$1);
_type = new WeakMap();
_listItems = new WeakMap();
_unbindItems = new WeakMap();
_template = new WeakMap();
_selectedIndex$1 = new WeakMap();
_selectedItem = new WeakMap();
_filters = new WeakMap();
_hasArrow = new WeakMap();
_directAccess = new WeakMap();
_directAccessValue = new WeakMap();
_letters = new WeakMap();
_accessIndex = new WeakMap();
_accessStartListener = new WeakMap();
_accessMoveListener = new WeakMap();
_accessEndListener = new WeakMap();
_List_instances = new WeakSet();
/*****************************************************************
 *  Rendering
 ****************************************************************/
freeListItems_fn = function() {
  __privateGet$7(this, _unbindItems).forEach((unbind) => unbind());
  __privateSet$7(this, _unbindItems, []);
  __privateGet$7(this, _listItems).forEach((item) => item.destroy());
  __privateSet$7(this, _listItems, []);
};
/**
 * Sets the model properties of the list item from the data item
 */
configureItem_fn = function(listItem, item) {
  const properties = new Set(listItem.modelProperties);
  const copy = (source, names) => {
    const values = {};
    for (const name of names) {
      if (properties.has(name)) values[name] = source[name];
    }
    listItem.assign(values);
  };
  if (item instanceof Model) {
    copy(item, item.modelProperties);
    __privateGet$7(this, _unbindItems).push(item.on("change", (_model, names) => copy(item, names)));
  } else if (isString(item) || typeof item === "number") {
    if (properties.has("title")) listItem.assign({ title: String(item) });
  } else if (item && typeof item === "object") {
    copy(item, Object.keys(item));
  }
};
createItem_fn = function(index) {
  const template = __privateGet$7(this, _template);
  let listItem;
  if (template instanceof AbstractListItem) {
    listItem = template.clone();
  } else {
    listItem = template ? new template() : new DefaultListItem();
    listItem.init();
  }
  __privateMethod$5(this, _List_instances, configureItem_fn).call(this, listItem, this.items[index]);
  listItem.index = index;
  __privateGet$7(this, _listItems).push(listItem);
  return listItem;
};
/**
 * A section: its title (if any), and the items until the next title
 */
buildSection_fn = function(title, index) {
  const section = document.createElement("li");
  const content = document.createElement("ul");
  const items = this.items;
  for (; index < items.length && !isString(items[index]); index++) {
    content.appendChild(__privateMethod$5(this, _List_instances, createItem_fn).call(this, index).view);
  }
  if (title !== null) {
    const titleView = document.createElement("div");
    const mode = getDeviceCSSCode();
    if (mode === CSS_MEEGO || mode === CSS_SYMBIAN) {
      const text = document.createElement("div");
      text.textContent = title;
      titleView.append(document.createElement("div"), text);
    } else {
      titleView.textContent = title;
    }
    section.appendChild(titleView);
  }
  if (content.childElementCount) section.appendChild(content);
  return [section, index];
};
/*****************************************************************
 *  Selection
 ****************************************************************/
listItemOf_fn = function(node) {
  for (let n = node; n && n !== this.itemsView; n = n.parentNode) {
    const component = n instanceof Element ? View.componentOf(n) : void 0;
    if (component instanceof AbstractListItem && __privateGet$7(this, _listItems).includes(component)) return component;
  }
  return void 0;
};
_List_static = new WeakSet();
matches_fn = function(filter, item) {
  if (!filter.property || !filter.value) return true;
  let source = toText(item?.[filter.property]) ?? "";
  let value = String(filter.value);
  if (filter.strict === false) {
    source = source.toLowerCase();
    value = value.toLowerCase();
  }
  switch (filter.matching) {
    case _List.FILTER_STARTS_WITH:
      return source.startsWith(value);
    case _List.FILTER_CONTAINS:
      return source.includes(value);
    default:
      return source === value;
  }
};
/*****************************************************************
 *  Direct access bar (TAB_LIST)
 ****************************************************************/
renderDirectAccessBar_fn = function() {
  if (__privateGet$7(this, _type) !== _List.TAB_LIST) {
    __privateMethod$5(this, _List_instances, removeDirectAccessBar_fn).call(this);
    return;
  }
  if (!__privateGet$7(this, _directAccess)) {
    __privateSet$7(this, _directAccess, document.createElement("div"));
    __privateGet$7(this, _directAccess).className = "direct_access";
    __privateGet$7(this, _directAccess).style.touchAction = "none";
    __privateGet$7(this, _directAccess).addEventListener("pointerdown", __privateGet$7(this, _accessStartListener));
    __privateSet$7(this, _directAccessValue, document.createElement("div"));
    __privateGet$7(this, _directAccessValue).className = "direct_access_value";
    this.view.append(__privateGet$7(this, _directAccess), __privateGet$7(this, _directAccessValue));
  }
  __privateGet$7(this, _directAccess).replaceChildren(...__privateGet$7(this, _letters).map((letter) => {
    const element = document.createElement("div");
    element.textContent = letter;
    return element;
  }));
};
removeDirectAccessBar_fn = function() {
  __privateMethod$5(this, _List_instances, accessEnd_fn).call(this);
  __privateGet$7(this, _directAccess)?.removeEventListener("pointerdown", __privateGet$7(this, _accessStartListener));
  __privateGet$7(this, _directAccess)?.remove();
  __privateGet$7(this, _directAccessValue)?.remove();
  __privateSet$7(this, _directAccess, __privateSet$7(this, _directAccessValue, null));
};
/**
 * The index of the letter at the y position of the bar
 */
letterIndexAt_fn = function(y) {
  const rect = __privateGet$7(this, _directAccess).getBoundingClientRect();
  const top = rect.top + 5, height = rect.height - 10;
  const count = __privateGet$7(this, _letters).length;
  if (height <= 0 || !count) return 0;
  const dy = Math.min(Math.max(y - top, 0), height - 1);
  return Math.floor(dy * count / height);
};
accessStart_fn = function(event) {
  if (!event.isPrimary || !__privateGet$7(this, _directAccess)) return;
  event.stopPropagation();
  event.preventDefault();
  document.addEventListener("pointermove", __privateGet$7(this, _accessMoveListener), true);
  document.addEventListener("pointerup", __privateGet$7(this, _accessEndListener), true);
  document.addEventListener("pointercancel", __privateGet$7(this, _accessEndListener), true);
  const letter = [...__privateGet$7(this, _directAccess).children].indexOf(event.target);
  __privateSet$7(this, _accessIndex, -1);
  __privateMethod$5(this, _List_instances, scrollToTitle_fn).call(this, letter !== -1 ? letter : __privateMethod$5(this, _List_instances, letterIndexAt_fn).call(this, event.clientY));
  if (__privateGet$7(this, _directAccessValue)) __privateGet$7(this, _directAccessValue).style.opacity = "1";
};
accessMove_fn = function(event) {
  event.stopPropagation();
  event.preventDefault();
  __privateMethod$5(this, _List_instances, scrollToTitle_fn).call(this, __privateMethod$5(this, _List_instances, letterIndexAt_fn).call(this, event.clientY));
};
accessEnd_fn = function() {
  document.removeEventListener("pointermove", __privateGet$7(this, _accessMoveListener), true);
  document.removeEventListener("pointerup", __privateGet$7(this, _accessEndListener), true);
  document.removeEventListener("pointercancel", __privateGet$7(this, _accessEndListener), true);
  if (__privateGet$7(this, _directAccessValue)) __privateGet$7(this, _directAccessValue).style.opacity = "0";
};
scrollToTitle_fn = function(index) {
  if (index === __privateGet$7(this, _accessIndex)) return;
  const title = this.getTitleItem(index), container = this.itemsView;
  if (!title || !container) return;
  __privateSet$7(this, _accessIndex, index);
  container.scrollTop += title.getBoundingClientRect().top - container.getBoundingClientRect().top;
  if (__privateGet$7(this, _directAccessValue)) __privateGet$7(this, _directAccessValue).textContent = __privateGet$7(this, _letters)[index] ?? "";
};
__decorateElement$6(_init3$1, 3, "selectedIndex", _selectedIndex_dec$1, _List);
__decorateElement$6(_init3$1, 3, "selectedItem", _selectedItem_dec, _List);
__decorateElement$6(_init3$1, 3, "type", _type_dec, _List);
__decorateElement$6(_init3$1, 3, "hasArrow", _hasArrow_dec, _List);
__decorateElement$6(_init3$1, 3, "filters", _filters_dec, _List);
__privateAdd$7(_List, _List_static);
__decoratorMetadata$6(_init3$1, _List);
__publicField$6(_List, "FILTER_EXACTS", 0);
__publicField$6(_List, "FILTER_CONTAINS", 1);
__publicField$6(_List, "FILTER_STARTS_WITH", 2);
__publicField$6(_List, "BLOCK_LIST", "BlockList");
__publicField$6(_List, "TAB_LIST", "TabList");
__publicField$6(_List, "DEFAULT_LIST", "DefaultList");
let List = _List;

var html_template$5 = "<div class=\"vs_ui_checkbox\"><fieldset x-hag-hole=\"item_children\" /></div>";

var __create$5 = Object.create;
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __knownSymbol$5 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$6 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$5 = (base) => [, , , __create$5(base?.[__knownSymbol$5("metadata")] ?? null)];
var __decoratorStrings$5 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$5 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$6("Function expected") : fn;
var __decoratorContext$5 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$5[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$6("Already initialized") : fns.push(__expectFn$5(fn || null)) });
var __decoratorMetadata$5 = (array, target) => __defNormalProp$5(target, __knownSymbol$5("metadata"), array[3]);
var __runInitializers$5 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$5 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$5[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$5(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$5(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$5(it) && (desc[key] = it );
  }
  return desc && __defProp$5(target, name, desc), target;
};
var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, key + "" , value);
var __accessCheck$6 = (obj, member, msg) => member.has(obj) || __typeError$6("Cannot " + msg);
var __privateGet$6 = (obj, member, getter) => (__accessCheck$6(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$6 = (obj, member, value) => member.has(obj) ? __typeError$6("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$6 = (obj, member, value, setter) => (__accessCheck$6(obj, member, "write to private field"), member.set(obj, value), value);
var _selectedIndexes_dec, _a$5, _inputs$1, _labels$1, _selectedIndexes, _changeListener$1, _init$5;
class CheckBox extends (_a$5 = AbstractList, _selectedIndexes_dec = [InOut], _a$5) {
  constructor() {
    super(...arguments);
    __runInitializers$5(_init$5, 5, this);
    __publicField$5(this, "htmlTemplate", html_template$5);
    __privateAdd$6(this, _inputs$1, []);
    __privateAdd$6(this, _labels$1, []);
    __privateAdd$6(this, _selectedIndexes, []);
    __privateAdd$6(this, _changeListener$1, (event) => {
      const index = __privateGet$6(this, _inputs$1).indexOf(event.target);
      if (index === -1) return;
      __privateSet$6(this, _selectedIndexes, __privateGet$6(this, _inputs$1).flatMap((input, i) => input.checked ? [i] : []));
      this.propertyChange("selectedIndexes");
      this.emit("select", this.selectedIndexes, __privateGet$6(this, _selectedIndexes).map((i) => this.items[i]));
    });
  }
  initComponent() {
    super.initComponent();
    this.itemsView.addEventListener("change", __privateGet$6(this, _changeListener$1));
  }
  destructor() {
    this.itemsView?.removeEventListener("change", __privateGet$6(this, _changeListener$1));
    __privateSet$6(this, _inputs$1, []);
    __privateSet$6(this, _labels$1, []);
    super.destructor();
  }
  didEnable() {
    __privateGet$6(this, _inputs$1).forEach((input) => {
      input.disabled = !this.enable;
    });
  }
  renderData() {
    const itemsView = this.itemsView;
    if (!itemsView) return;
    __privateSet$6(this, _inputs$1, []);
    __privateSet$6(this, _labels$1, []);
    const nodes = [];
    this.items.forEach((item, index) => {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = this.id;
      input.id = `${this.id}_l${index}`;
      input.value = String(index);
      input.disabled = !this.enable;
      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = toText(item) ?? "";
      __privateGet$6(this, _inputs$1).push(input);
      __privateGet$6(this, _labels$1).push(label);
      nodes.push(input, label);
    });
    itemsView.replaceChildren(...nodes);
    const selected = __privateGet$6(this, _selectedIndexes).filter((index) => index < __privateGet$6(this, _inputs$1).length);
    selected.forEach((index) => {
      __privateGet$6(this, _inputs$1)[index].checked = true;
    });
    if (selected.length !== __privateGet$6(this, _selectedIndexes).length) {
      __privateSet$6(this, _selectedIndexes, selected);
      this.propertyChange("selectedIndexes");
    }
  }
  itemIndexOf(node) {
    for (let index = 0; index < __privateGet$6(this, _inputs$1).length; index++) {
      if (node === __privateGet$6(this, _inputs$1)[index] || node && __privateGet$6(this, _labels$1)[index].contains(node)) return index;
    }
    return -1;
  }
  itemNodeAt(index) {
    return __privateGet$6(this, _inputs$1)[index];
  }
  touchItemFeedback(index) {
    __privateGet$6(this, _inputs$1)[index]?.classList.add("pressed");
    __privateGet$6(this, _labels$1)[index]?.classList.add("pressed");
  }
  untouchItemFeedback(index) {
    __privateGet$6(this, _inputs$1)[index]?.classList.remove("pressed");
    __privateGet$6(this, _labels$1)[index]?.classList.remove("pressed");
  }
  /**
   * Checks the item at the index, or unchecks it if it is checked
   */
  selectItem(index) {
    const input = __privateGet$6(this, _inputs$1)[index];
    if (!input) return;
    const selected = __privateGet$6(this, _selectedIndexes).includes(index);
    this.selectedIndexes = selected ? __privateGet$6(this, _selectedIndexes).filter((i) => i !== index) : [...__privateGet$6(this, _selectedIndexes), index];
  }
  set selectedIndexes(v) {
    if (!isArray(v)) return;
    const count = this.items.length;
    const indexes = v.filter((index) => Number.isInteger(index) && index >= 0 && (!count || index < count));
    __privateSet$6(this, _selectedIndexes, [...new Set(indexes)].sort((a, b) => a - b));
    __privateGet$6(this, _inputs$1).forEach((input, index) => {
      input.checked = __privateGet$6(this, _selectedIndexes).includes(index);
    });
  }
  get selectedIndexes() {
    return __privateGet$6(this, _selectedIndexes).slice();
  }
}
_init$5 = __decoratorStart$5(_a$5);
_inputs$1 = new WeakMap();
_labels$1 = new WeakMap();
_selectedIndexes = new WeakMap();
_changeListener$1 = new WeakMap();
__decorateElement$5(_init$5, 3, "selectedIndexes", _selectedIndexes_dec, CheckBox);
__decoratorMetadata$5(_init$5, CheckBox);

var html_template$4 = "<div class=\"vs_ui_radiobutton\"><fieldset x-hag-hole=\"item_children\" /></div>";

var __create$4 = Object.create;
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __knownSymbol$4 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$5 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$4 = (base) => [, , , __create$4(base?.[__knownSymbol$4("metadata")] ?? null)];
var __decoratorStrings$4 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$4 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$5("Function expected") : fn;
var __decoratorContext$4 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$4[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$5("Already initialized") : fns.push(__expectFn$4(fn || null)) });
var __decoratorMetadata$4 = (array, target) => __defNormalProp$4(target, __knownSymbol$4("metadata"), array[3]);
var __runInitializers$4 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$4 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$4[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$4(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$4(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$4(it) && (desc[key] = it );
  }
  return desc && __defProp$4(target, name, desc), target;
};
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, key + "" , value);
var __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
var __privateGet$5 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$5 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
var _selectedIndex_dec, _a$4, _inputs, _labels, _selectedIndex, _changeListener, _init$4;
class RadioButton extends (_a$4 = AbstractList, _selectedIndex_dec = [InOut], _a$4) {
  constructor() {
    super(...arguments);
    __runInitializers$4(_init$4, 5, this);
    __publicField$4(this, "htmlTemplate", html_template$4);
    __privateAdd$5(this, _inputs, []);
    __privateAdd$5(this, _labels, []);
    __privateAdd$5(this, _selectedIndex, -1);
    __privateAdd$5(this, _changeListener, (event) => {
      const index = __privateGet$5(this, _inputs).indexOf(event.target);
      if (index === -1 || !__privateGet$5(this, _inputs)[index].checked) return;
      __privateSet$5(this, _selectedIndex, index);
      this.propertyChange("selectedIndex");
      this.emit("select", index, this.items[index]);
    });
  }
  initComponent() {
    super.initComponent();
    this.itemsView.addEventListener("change", __privateGet$5(this, _changeListener));
  }
  destructor() {
    this.itemsView?.removeEventListener("change", __privateGet$5(this, _changeListener));
    __privateSet$5(this, _inputs, []);
    __privateSet$5(this, _labels, []);
    super.destructor();
  }
  didEnable() {
    __privateGet$5(this, _inputs).forEach((input) => {
      input.disabled = !this.enable;
    });
  }
  renderData() {
    const itemsView = this.itemsView;
    if (!itemsView) return;
    __privateSet$5(this, _inputs, []);
    __privateSet$5(this, _labels, []);
    const nodes = [];
    this.items.forEach((item, index) => {
      const input = document.createElement("input");
      input.type = "radio";
      input.name = this.id;
      input.id = `${this.id}_l${index}`;
      input.value = String(index);
      input.disabled = !this.enable;
      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = toText(item) ?? "";
      __privateGet$5(this, _inputs).push(input);
      __privateGet$5(this, _labels).push(label);
      nodes.push(input, label);
    });
    itemsView.replaceChildren(...nodes);
    if (__privateGet$5(this, _selectedIndex) >= __privateGet$5(this, _inputs).length) {
      __privateSet$5(this, _selectedIndex, -1);
      this.propertyChange("selectedIndex");
    } else if (__privateGet$5(this, _selectedIndex) !== -1) {
      __privateGet$5(this, _inputs)[__privateGet$5(this, _selectedIndex)].checked = true;
    }
  }
  itemIndexOf(node) {
    for (let index = 0; index < __privateGet$5(this, _inputs).length; index++) {
      if (node === __privateGet$5(this, _inputs)[index] || node && __privateGet$5(this, _labels)[index].contains(node)) return index;
    }
    return -1;
  }
  itemNodeAt(index) {
    return __privateGet$5(this, _inputs)[index];
  }
  touchItemFeedback(index) {
    __privateGet$5(this, _inputs)[index]?.classList.add("pressed");
    __privateGet$5(this, _labels)[index]?.classList.add("pressed");
  }
  untouchItemFeedback(index) {
    __privateGet$5(this, _inputs)[index]?.classList.remove("pressed");
    __privateGet$5(this, _labels)[index]?.classList.remove("pressed");
  }
  set selectedIndex(v) {
    const index = isNumber(v) ? v : parseInt(String(v), 10);
    const count = this.items.length;
    if (!Number.isInteger(index) || index < -1 || count && index >= count) return;
    __privateSet$5(this, _selectedIndex, index);
    __privateGet$5(this, _inputs).forEach((input, i) => {
      input.checked = i === index;
    });
  }
  get selectedIndex() {
    return __privateGet$5(this, _selectedIndex);
  }
}
_init$4 = __decoratorStart$4(_a$4);
_inputs = new WeakMap();
_labels = new WeakMap();
_selectedIndex = new WeakMap();
_changeListener = new WeakMap();
__decorateElement$4(_init$4, 3, "selectedIndex", _selectedIndex_dec, RadioButton);
__decoratorMetadata$4(_init$4, RadioButton);

var html_template$3 = "<div class=\"vs_ui_scrollview\">\n  <div x-hag-hole=\"top_bar\"></div>\n  <div class=\"content\" x-hag-hole=\"children\"></div>\n  <div x-hag-hole=\"bottom_bar\"></div>\n</div>";

var __create$3 = Object.create;
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __knownSymbol$3 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$4 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$3 = (base) => [, , , __create$3(base?.[__knownSymbol$3("metadata")] ?? null)];
var __decoratorStrings$3 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$3 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$4("Function expected") : fn;
var __decoratorContext$3 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$3[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$4("Already initialized") : fns.push(__expectFn$3(fn || null)) });
var __decoratorMetadata$3 = (array, target) => __defNormalProp$3(target, __knownSymbol$3("metadata"), array[3]);
var __runInitializers$3 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$3 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$3[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$3(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$3(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$3(it) && (desc[key] = it );
  }
  return desc && __defProp$3(target, name, desc), target;
};
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
var __privateGet$4 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$4 = (obj, member, value, setter) => (__accessCheck$4(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$4 = (obj, member, method) => (__accessCheck$4(obj, member, "access private method"), method);
var _scroll_dec, _a$3, _scroll, _layout, _ScrollView_instances, applyScroll_fn, _init$3;
const LAYOUTS = [
  View.HORIZONTAL_LAYOUT,
  View.DEFAULT_LAYOUT,
  View.ABSOLUTE_LAYOUT,
  View.VERTICAL_LAYOUT,
  View.FLOW_LAYOUT,
  View.LEGACY_HORIZONTAL_LAYOUT,
  View.LEGACY_ABSOLUTE_LAYOUT,
  View.LEGACY_VERTICAL_LAYOUT,
  View.LEGACY_FLOW_LAYOUT
];
const VIEW_STYLES = ["display", "flex-direction"];
const CONTENT_STYLES = ["flex", "min-width", "min-height", "overflow-x", "overflow-y", "overscroll-behavior"];
const _ScrollView = class _ScrollView extends (_a$3 = View, _scroll_dec = [InOut], _a$3) {
  constructor() {
    super(...arguments);
    __runInitializers$3(_init$3, 5, this);
    __privateAdd$4(this, _ScrollView_instances);
    __publicField$3(this, "htmlTemplate", html_template$3);
    /** the node of the content, which scrolls */
    __publicField$3(this, "contentView", null);
    __privateAdd$4(this, _scroll, _ScrollView.NO_SCROLL);
    __privateAdd$4(this, _layout, null);
  }
  initComponent() {
    super.initComponent();
    this.contentView = this.view.querySelector(":scope > .content") ?? this.view;
    if (__privateGet$4(this, _layout)) this.contentView.classList.add(__privateGet$4(this, _layout));
    __privateMethod$4(this, _ScrollView_instances, applyScroll_fn).call(this);
  }
  destructor() {
    this.contentView = null;
    super.destructor();
  }
  /**
   *  Adds a child; a child class with a static scrollViewHole is added to
   *  that hole (a NavigationBar to the top bar, a ToolBar to the bottom
   *  bar)
   */
  add(child, extension, view) {
    const hole = child?.constructor?.scrollViewHole;
    super.add(child, hole ?? extension, view);
  }
  /**
   *  The node which scrolls: the content node (between the bars) by
   *  default
   */
  scrollContainer() {
    return this.contentView;
  }
  /**
   * Scrolls the content to (x, y), animated during time ms (0, no
   * animation, by default)
   */
  scrollTo(x, y, time = 0) {
    this.scrollContainer()?.scrollTo({ left: x, top: y, behavior: time > 0 ? "smooth" : "auto" });
  }
  /**
   * The scroll position of the content [x, y]
   */
  get scrollPosition() {
    const container = this.scrollContainer();
    return container ? [container.scrollLeft, container.scrollTop] : [0, 0];
  }
  set scroll(v) {
    if (v === true) v = _ScrollView.SCROLL;
    if (v === false || v === null || v === void 0) v = _ScrollView.NO_SCROLL;
    if (v !== _ScrollView.NO_SCROLL && v !== _ScrollView.VERTICAL_SCROLL && v !== _ScrollView.HORIZONTAL_SCROLL && v !== _ScrollView.SCROLL) return;
    __privateSet$4(this, _scroll, v);
    __privateMethod$4(this, _ScrollView_instances, applyScroll_fn).call(this);
  }
  get scroll() {
    return __privateGet$4(this, _scroll);
  }
  /**
   * The layout of the content (see View.layout)
   */
  set layout(v) {
    if (v && !LAYOUTS.includes(v)) {
      console.error(`Unsupported layout '${v}'!`);
      return;
    }
    const layout = !v || v.includes("_layout") ? v : `${v}_layout`;
    if (layout === __privateGet$4(this, _layout)) return;
    if (__privateGet$4(this, _layout)) this.contentView?.classList.remove(__privateGet$4(this, _layout));
    __privateSet$4(this, _layout, layout);
    if (layout) this.contentView?.classList.add(layout);
    this.propertyChange("layout");
  }
  get layout() {
    return __privateGet$4(this, _layout);
  }
  /**
   * The HTML content of the content node
   */
  set innerHTML(v) {
    if (this.contentView) this.contentView.innerHTML = v;
    this.propertyChange("innerHTML");
  }
};
_init$3 = __decoratorStart$3(_a$3);
_scroll = new WeakMap();
_layout = new WeakMap();
_ScrollView_instances = new WeakSet();
applyScroll_fn = function() {
  const view = this.view, container = this.scrollContainer();
  if (!view || !container) return;
  if (__privateGet$4(this, _scroll) === _ScrollView.NO_SCROLL) {
    if (container !== view) VIEW_STYLES.forEach((property) => view.style.removeProperty(property));
    CONTENT_STYLES.forEach((property) => container.style.removeProperty(property));
    return;
  }
  if (container !== view) {
    view.style.display = "flex";
    view.style.flexDirection = "column";
    container.style.flex = "1 1 auto";
    container.style.minWidth = "0";
    container.style.minHeight = "0";
  }
  const horizontal = __privateGet$4(this, _scroll) === _ScrollView.HORIZONTAL_SCROLL || __privateGet$4(this, _scroll) === _ScrollView.SCROLL;
  const vertical = __privateGet$4(this, _scroll) === _ScrollView.VERTICAL_SCROLL || __privateGet$4(this, _scroll) === _ScrollView.SCROLL;
  container.style.overflowX = horizontal ? "auto" : "hidden";
  container.style.overflowY = vertical ? "auto" : "hidden";
  container.style.overscrollBehavior = "contain";
};
__decorateElement$3(_init$3, 3, "scroll", _scroll_dec, _ScrollView);
__decoratorMetadata$3(_init$3, _ScrollView);
__publicField$3(_ScrollView, "NO_SCROLL", 0);
__publicField$3(_ScrollView, "VERTICAL_SCROLL", 1);
__publicField$3(_ScrollView, "HORIZONTAL_SCROLL", 2);
__publicField$3(_ScrollView, "SCROLL", 3);
let ScrollView = _ScrollView;

var html_template$2 = "<div class=\"vs_ui_scrollimageview\"><img class=\"content\"/></div>\n";

var __create$2 = Object.create;
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __knownSymbol$2 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$3 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$2 = (base) => [, , , __create$2(base?.[__knownSymbol$2("metadata")] ?? null)];
var __decoratorStrings$2 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$2 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$3("Function expected") : fn;
var __decoratorContext$2 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$2[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$3("Already initialized") : fns.push(__expectFn$2(fn || null)) });
var __decoratorMetadata$2 = (array, target) => __defNormalProp$2(target, __knownSymbol$2("metadata"), array[3]);
var __runInitializers$2 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$2 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$2[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$2(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$2(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$2(it) && (desc[key] = it );
  }
  return desc && __defProp$2(target, name, desc), target;
};
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
var __privateGet$3 = (obj, member, getter) => (__accessCheck$3(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$3 = (obj, member, value, setter) => (__accessCheck$3(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$3 = (obj, member, method) => (__accessCheck$3(obj, member, "access private method"), method);
var _stretch_dec, _src_dec, _a$2, _src, _stretch, _isLoaded, _loadListener, _ScrollImageView_instances, didLoad_fn, applyStretch_fn, _init$2;
const _ScrollImageView = class _ScrollImageView extends (_a$2 = ScrollView, _src_dec = [InOut], _stretch_dec = [InOut], _a$2) {
  constructor() {
    super(...arguments);
    __runInitializers$2(_init$2, 5, this);
    __privateAdd$3(this, _ScrollImageView_instances);
    __publicField$2(this, "htmlTemplate", html_template$2);
    __privateAdd$3(this, _src, null);
    __privateAdd$3(this, _stretch, _ScrollImageView.STRETCH_FILL);
    __privateAdd$3(this, _isLoaded, false);
    __privateAdd$3(this, _loadListener, () => __privateMethod$3(this, _ScrollImageView_instances, didLoad_fn).call(this));
  }
  /** the image node */
  get image() {
    return this.contentView instanceof HTMLImageElement ? this.contentView : null;
  }
  initComponent() {
    super.initComponent();
    const image = this.image;
    if (!image) {
      throw new Error(`vs.ui.ScrollImageView ${this.id}: no image node`);
    }
    image.ondragstart = (event) => {
      event.preventDefault();
      return false;
    };
    image.addEventListener("load", __privateGet$3(this, _loadListener));
    const src = image.getAttribute("src");
    if (src) {
      __privateSet$3(this, _src, src);
      if (image.complete && image.naturalWidth) __privateMethod$3(this, _ScrollImageView_instances, didLoad_fn).call(this);
    } else if (__privateGet$3(this, _src)) {
      image.src = __privateGet$3(this, _src);
    }
    __privateMethod$3(this, _ScrollImageView_instances, applyStretch_fn).call(this);
  }
  destructor() {
    const image = this.image;
    if (image) {
      image.removeEventListener("load", __privateGet$3(this, _loadListener));
      image.src = BLANK_IMAGE;
    }
    __privateSet$3(this, _isLoaded, false);
    super.destructor();
  }
  /**
   * The view scrolls the image
   */
  scrollContainer() {
    return this.view;
  }
  refresh() {
    super.refresh();
    __privateMethod$3(this, _ScrollImageView_instances, applyStretch_fn).call(this);
  }
  show(clb) {
    super.show(clb);
    __privateMethod$3(this, _ScrollImageView_instances, applyStretch_fn).call(this);
  }
  /**
   * The size of the view [width, height], in px; the image is stretched
   * again
   */
  set size(v) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    super.size = v;
    __privateMethod$3(this, _ScrollImageView_instances, applyStretch_fn).call(this);
  }
  get size() {
    return super.size;
  }
  set src(v) {
    if (!isString(v)) return;
    __privateSet$3(this, _src, v);
    __privateSet$3(this, _isLoaded, false);
    if (this.image) this.image.src = v;
  }
  get src() {
    return __privateGet$3(this, _src);
  }
  set stretch(v) {
    if (v !== _ScrollImageView.STRETCH_NONE && v !== _ScrollImageView.STRETCH_FILL && v !== _ScrollImageView.STRETCH_UNIFORM && v !== _ScrollImageView.STRETCH_UNIFORM_FILL) return;
    __privateSet$3(this, _stretch, v);
    __privateMethod$3(this, _ScrollImageView_instances, applyStretch_fn).call(this);
  }
  get stretch() {
    return __privateGet$3(this, _stretch);
  }
  /**
   * True once the image is loaded
   */
  get isLoaded() {
    return __privateGet$3(this, _isLoaded);
  }
};
_init$2 = __decoratorStart$2(_a$2);
_src = new WeakMap();
_stretch = new WeakMap();
_isLoaded = new WeakMap();
_loadListener = new WeakMap();
_ScrollImageView_instances = new WeakSet();
didLoad_fn = function() {
  const image = this.image;
  if (!image || image.src === BLANK_IMAGE) return;
  __privateSet$3(this, _isLoaded, true);
  __privateMethod$3(this, _ScrollImageView_instances, applyStretch_fn).call(this);
  this.emit("load");
};
/**
 * The image size according to the stretch mode
 */
applyStretch_fn = function() {
  const view = this.view, image = this.image;
  if (!view || !image) return;
  const style = image.style;
  style.removeProperty("object-fit");
  switch (__privateGet$3(this, _stretch)) {
    case _ScrollImageView.STRETCH_NONE:
      style.width = style.height = "";
      break;
    case _ScrollImageView.STRETCH_FILL:
    case _ScrollImageView.STRETCH_UNIFORM:
      style.width = style.height = "100%";
      style.objectFit = __privateGet$3(this, _stretch) === _ScrollImageView.STRETCH_FILL ? "fill" : "contain";
      break;
    case _ScrollImageView.STRETCH_UNIFORM_FILL: {
      const [width, height] = view.clientWidth && view.clientHeight ? [view.clientWidth, view.clientHeight] : this.size;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      if (!__privateGet$3(this, _isLoaded) || !(width > 0 && height > 0) || !Number.isFinite(imageRatio)) {
        style.width = "100%";
        style.height = "";
      } else if (width / height > imageRatio) {
        style.width = "100%";
        style.height = "";
      } else {
        style.width = "";
        style.height = "100%";
      }
      break;
    }
  }
};
__decorateElement$2(_init$2, 3, "src", _src_dec, _ScrollImageView);
__decorateElement$2(_init$2, 3, "stretch", _stretch_dec, _ScrollImageView);
__decoratorMetadata$2(_init$2, _ScrollImageView);
__publicField$2(_ScrollImageView, "STRETCH_NONE", 0);
__publicField$2(_ScrollImageView, "STRETCH_FILL", 1);
__publicField$2(_ScrollImageView, "STRETCH_UNIFORM", 2);
__publicField$2(_ScrollImageView, "STRETCH_UNIFORM_FILL", 3);
let ScrollImageView = _ScrollImageView;

var html_template$1 = "<div class=\"vs_ui_navigationbar\" x-hag-hole=\"children\"></div>";

var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __knownSymbol$1 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$2 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart$1 = (base) => [, , , __create$1(base?.[__knownSymbol$1("metadata")] ?? null)];
var __decoratorStrings$1 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$1 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$2("Function expected") : fn;
var __decoratorContext$1 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$1[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$2("Already initialized") : fns.push(__expectFn$1(fn || null)) });
var __decoratorMetadata$1 = (array, target) => __defNormalProp$1(target, __knownSymbol$1("metadata"), array[3]);
var __runInitializers$1 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement$1 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings$1[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc$1(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$1(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn$1(it) && (desc[key] = it );
  }
  return desc && __defProp$1(target, name, desc), target;
};
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
var __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$2 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$2 = (obj, member, method) => (__accessCheck$2(obj, member, "access private method"), method);
var _style_dec$1, _a$1, _style$1, _states, _currentState, _NavigationBar_instances, showStateItems_fn, _init$1;
const _NavigationBar = class _NavigationBar extends (_a$1 = View, _style_dec$1 = [InOut], _a$1) {
  constructor() {
    super(...arguments);
    __runInitializers$1(_init$1, 5, this);
    __privateAdd$2(this, _NavigationBar_instances);
    __publicField$1(this, "htmlTemplate", html_template$1);
    __privateAdd$2(this, _style$1, _NavigationBar.DEFAULT_STYLE);
    __privateAdd$2(this, _states, /* @__PURE__ */ new Map());
    __privateAdd$2(this, _currentState, null);
  }
  initComponent() {
    super.initComponent();
    const height = getDeviceCSSCode() === CSS_SYMBIAN ? 50 : 44;
    this.setHideAnimation([["translateY", `-${height}px`]]);
    this.setShowAnimation([["translateY", "0px"]]);
    if (__privateGet$2(this, _style$1)) this.addClassName(__privateGet$2(this, _style$1));
  }
  /*****************************************************************
   *  States
   ****************************************************************/
  /**
   *  Sets the children of a state (added to the bar if needed)
   */
  setStateItems(state, items) {
    if (!isString(state) || !state || !isArray(items)) return;
    __privateGet$2(this, _states).set(state, items.slice());
    for (const item of items) {
      if (!this.isChild(item)) this.add(item, "children");
    }
    if (__privateGet$2(this, _currentState) === state) __privateMethod$2(this, _NavigationBar_instances, showStateItems_fn).call(this, items);
  }
  /**
   *  Returns the children of a state
   */
  getStateItems(state) {
    return __privateGet$2(this, _states).get(state)?.slice();
  }
  /**
   *  Shows the children of the state, and hides the others. The children
   *  can be configured: { [child id]: { property: value } }
   */
  changeState(state, configuration) {
    if (!state) return;
    __privateSet$2(this, _currentState, state);
    const items = __privateGet$2(this, _states).get(state) ?? [];
    for (const item of items) {
      const values = configuration?.[item.id];
      if (values) Object.assign(item, values);
    }
    __privateMethod$2(this, _NavigationBar_instances, showStateItems_fn).call(this, items);
  }
  /**
   *  The current state
   */
  get currentState() {
    return __privateGet$2(this, _currentState);
  }
  /**
   *  Removes a child, also from the states
   */
  remove(child) {
    super.remove(child);
    for (const items of __privateGet$2(this, _states).values()) {
      const index = items.indexOf(child);
      if (index !== -1) items.splice(index, 1);
    }
  }
  set style(v) {
    if (!isString(v)) return;
    if (__privateGet$2(this, _style$1)) this.removeClassName(__privateGet$2(this, _style$1));
    __privateSet$2(this, _style$1, v);
    this.addClassName(v);
  }
  get style() {
    return __privateGet$2(this, _style$1);
  }
  /**
   * The size of the bar is given by its theme: the size of the node
   */
  set size(_v) {
  }
  get size() {
    return this.view ? [this.view.offsetWidth, this.view.offsetHeight] : super.size;
  }
  /**
   * The position of the bar is given by its parent: the position of the
   * node
   */
  set position(_v) {
  }
  get position() {
    return this.view ? [this.view.offsetLeft, this.view.offsetTop] : super.position;
  }
};
_init$1 = __decoratorStart$1(_a$1);
_style$1 = new WeakMap();
_states = new WeakMap();
_currentState = new WeakMap();
_NavigationBar_instances = new WeakSet();
showStateItems_fn = function(items) {
  for (const child of this.getChildren()) {
    if (child instanceof View && !items.includes(child)) child.hide();
  }
  for (const item of items) {
    if (item instanceof View) item.show();
  }
};
__decorateElement$1(_init$1, 3, "style", _style_dec$1, _NavigationBar);
__decoratorMetadata$1(_init$1, _NavigationBar);
__publicField$1(_NavigationBar, "DEFAULT_STYLE", "blue_style");
__publicField$1(_NavigationBar, "BLACK_TRANSLUCIDE_STYLE", "black_translucide_style");
__publicField$1(_NavigationBar, "BLACK_STYLE", "black_style");
/** added to the top bar of a ScrollView */
__publicField$1(_NavigationBar, "scrollViewHole", "top_bar");
let NavigationBar = _NavigationBar;

var html_template = "<div class=\"vs_ui_toolbar\">\n  <div x-hag-hole=\"children\"></div>\n</div>";

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$1 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$1("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$1("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, access, k = flags & 7, s = false, p = false;
  var j = 2 , key = __decoratorStrings[k + 5];
  var extraInitializers = array[j] || (array[j] = []);
  var desc = ((target = target.prototype), __getOwnPropDesc(target , name));
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: (x) => name in x };
      access.set = (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(desc[key]  , ctx), done._ = 1;
    __expectFn(it) && (desc[key] = it );
  }
  return desc && __defProp(target, name, desc), target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$1 = (obj, member, method) => (__accessCheck$1(obj, member, "access private method"), method);
var _text_dec, _a, _text, _textView, _init, _label_dec, _name_dec, _b, _name, _label, _ToolBarButton_instances, renderLabel_fn, _init2, _selectedId_dec, _isToggleButtons_dec, _configuration_dec, _style_dec, _c, _style, _items, _buttons, _isToggleButtons, _selectedId, _activeItem, _tapRecognizer, _ToolBar_instances, itemOf_fn, _init3;
class ToolBarText extends (_a = View, _text_dec = [InOut], _a) {
  constructor() {
    super(...arguments);
    __runInitializers(_init, 5, this);
    __publicField(this, "htmlTemplate", '<div class="vs_ui_toolbar_text"><div class="text_view"></div></div>');
    __privateAdd$1(this, _text, "");
    __privateAdd$1(this, _textView, null);
  }
  initComponent() {
    super.initComponent();
    __privateSet$1(this, _textView, this.view.querySelector(".text_view"));
    if (__privateGet$1(this, _textView)) __privateGet$1(this, _textView).textContent = __privateGet$1(this, _text);
  }
  set text(v) {
    const text = toText(v);
    if (text === void 0) return;
    __privateSet$1(this, _text, text);
    if (__privateGet$1(this, _textView)) __privateGet$1(this, _textView).textContent = text;
  }
  get text() {
    return __privateGet$1(this, _text);
  }
}
_init = __decoratorStart(_a);
_text = new WeakMap();
_textView = new WeakMap();
__decorateElement(_init, 3, "text", _text_dec, ToolBarText);
__decoratorMetadata(_init, ToolBarText);
class ToolBarButton extends (_b = View, _name_dec = [InOut], _label_dec = [InOut], _b) {
  constructor() {
    super(...arguments);
    __runInitializers(_init2, 5, this);
    __privateAdd$1(this, _ToolBarButton_instances);
    __publicField(this, "htmlTemplate", '<div class="vs_ui_toolbar_button"></div>');
    __privateAdd$1(this, _name, "");
    __privateAdd$1(this, _label, "");
  }
  initComponent() {
    super.initComponent();
    if (__privateGet$1(this, _name)) this.addClassName(__privateGet$1(this, _name));
    __privateMethod$1(this, _ToolBarButton_instances, renderLabel_fn).call(this);
  }
  /**
   * Sets the icon image of the button
   */
  setImage(path) {
    if (this.view) this.view.style.backgroundImage = `url(${path})`;
  }
  set name(v) {
    if (!isString(v)) return;
    if (__privateGet$1(this, _name)) this.removeClassName(__privateGet$1(this, _name));
    __privateSet$1(this, _name, v);
    if (v) this.addClassName(v);
  }
  get name() {
    return __privateGet$1(this, _name);
  }
  set label(v) {
    if (!isString(v)) return;
    __privateSet$1(this, _label, v);
    __privateMethod$1(this, _ToolBarButton_instances, renderLabel_fn).call(this);
  }
  get label() {
    return __privateGet$1(this, _label);
  }
}
_init2 = __decoratorStart(_b);
_name = new WeakMap();
_label = new WeakMap();
_ToolBarButton_instances = new WeakSet();
renderLabel_fn = function() {
  if (!this.view) return;
  this.view.textContent = __privateGet$1(this, _label);
  this.setStyle("background-position", __privateGet$1(this, _label) ? "center 0px" : "center");
};
__decorateElement(_init2, 3, "name", _name_dec, ToolBarButton);
__decorateElement(_init2, 3, "label", _label_dec, ToolBarButton);
__decoratorMetadata(_init2, ToolBarButton);
const _ToolBar = class _ToolBar extends (_c = View, _style_dec = [InOut], _configuration_dec = [InOut], _isToggleButtons_dec = [InOut], _selectedId_dec = [InOut], _c) {
  constructor() {
    super(...arguments);
    __runInitializers(_init3, 5, this);
    __privateAdd$1(this, _ToolBar_instances);
    __publicField(this, "htmlTemplate", html_template);
    __privateAdd$1(this, _style, _ToolBar.DEFAULT_STYLE);
    __privateAdd$1(this, _items, /* @__PURE__ */ new Map());
    /** the buttons created by addButton */
    __privateAdd$1(this, _buttons, /* @__PURE__ */ new Set());
    __privateAdd$1(this, _isToggleButtons, true);
    __privateAdd$1(this, _selectedId, null);
    __privateAdd$1(this, _activeItem);
    __privateAdd$1(this, _tapRecognizer);
  }
  initComponent() {
    super.initComponent();
    this.setHideAnimation([["translateY", "44px"]]);
    this.setShowAnimation([["translateY", "0px"]]);
    if (__privateGet$1(this, _style)) this.addClassName(__privateGet$1(this, _style));
    __privateSet$1(this, _tapRecognizer, new TapRecognizer(this));
    this.addPointerRecognizer(__privateGet$1(this, _tapRecognizer));
  }
  destructor() {
    if (__privateGet$1(this, _tapRecognizer)) {
      this.removePointerRecognizer(__privateGet$1(this, _tapRecognizer));
      __privateSet$1(this, _tapRecognizer, void 0);
    }
    __privateGet$1(this, _items).clear();
    __privateGet$1(this, _buttons).clear();
    super.destructor();
  }
  /*****************************************************************
   *  Items
   ****************************************************************/
  /**
   *  Creates and adds a button: its id, its icon name (ToolBar.BUTTON_ADD…)
   *  and its label. Returns undefined if an item has the id.
   */
  addButton(id, name, label) {
    if (__privateGet$1(this, _items).has(id)) return void 0;
    const button = new ToolBarButton({ id });
    button.init();
    button.name = name;
    if (label) button.label = label;
    __privateGet$1(this, _buttons).add(button);
    this.addItem(button);
    return button;
  }
  /**
   *  Adds an item (a ToolBarButton, a ToolBarText or any view)
   */
  addItem(item) {
    if (!item || __privateGet$1(this, _items).has(item.id)) return;
    this.add(item, "children");
    __privateGet$1(this, _items).set(item.id, item);
  }
  /**
   *  Removes the item (a button created by addButton is destroyed)
   */
  removeItem(id) {
    const item = __privateGet$1(this, _items).get(id);
    if (!item) return;
    this.remove(item);
    if (__privateGet$1(this, _buttons).delete(item)) item.destroy();
  }
  /**
   *  Returns the item of the id
   */
  getItem(id) {
    return __privateGet$1(this, _items).get(id);
  }
  remove(child) {
    super.remove(child);
    for (const [id, item] of __privateGet$1(this, _items)) {
      if (item !== child) continue;
      __privateGet$1(this, _items).delete(id);
      if (__privateGet$1(this, _selectedId) === id) __privateSet$1(this, _selectedId, null);
    }
  }
  didTouch(_target, _element, event) {
    __privateGet$1(this, _activeItem)?.removeClassName("active");
    const item = __privateMethod$1(this, _ToolBar_instances, itemOf_fn).call(this, event.target);
    if (!item || __privateGet$1(this, _isToggleButtons) && item.id === __privateGet$1(this, _selectedId)) {
      __privateSet$1(this, _activeItem, void 0);
      return;
    }
    __privateSet$1(this, _activeItem, item);
    item.addClassName("active");
  }
  didUntouch() {
    __privateGet$1(this, _activeItem)?.removeClassName("active");
  }
  didTap() {
    const item = __privateGet$1(this, _activeItem);
    __privateSet$1(this, _activeItem, void 0);
    if (!item) return;
    this.selectedId = item.id;
    this.emit("itemselect", item.id);
  }
  set style(v) {
    if (!isString(v)) return;
    if (__privateGet$1(this, _style)) this.removeClassName(__privateGet$1(this, _style));
    __privateSet$1(this, _style, v);
    this.addClassName(v);
  }
  get style() {
    return __privateGet$1(this, _style);
  }
  set configuration(v) {
    if (!isArray(v)) return;
    for (const id of [...__privateGet$1(this, _items).keys()]) this.removeItem(id);
    for (const [id, name, label] of v) this.addButton(id, name, label);
  }
  get configuration() {
    return [...__privateGet$1(this, _items).values()].filter((item) => item instanceof ToolBarButton).map((button) => button.label ? [button.id, button.name, button.label] : [button.id, button.name]);
  }
  set isToggleButtons(v) {
    __privateSet$1(this, _isToggleButtons, !!v);
    if (!__privateGet$1(this, _isToggleButtons) && __privateGet$1(this, _selectedId)) {
      __privateGet$1(this, _items).get(__privateGet$1(this, _selectedId))?.removeClassName("select");
    }
  }
  get isToggleButtons() {
    return __privateGet$1(this, _isToggleButtons);
  }
  set selectedId(v) {
    const item = v === null ? void 0 : __privateGet$1(this, _items).get(v);
    if (v !== null && !item) return;
    if (__privateGet$1(this, _selectedId)) __privateGet$1(this, _items).get(__privateGet$1(this, _selectedId))?.removeClassName("select");
    __privateSet$1(this, _selectedId, v);
    if (item && __privateGet$1(this, _isToggleButtons)) item.addClassName("select");
  }
  get selectedId() {
    return __privateGet$1(this, _selectedId);
  }
};
_init3 = __decoratorStart(_c);
_style = new WeakMap();
_items = new WeakMap();
_buttons = new WeakMap();
_isToggleButtons = new WeakMap();
_selectedId = new WeakMap();
_activeItem = new WeakMap();
_tapRecognizer = new WeakMap();
_ToolBar_instances = new WeakSet();
/*****************************************************************
 *  Tap delegate
 ****************************************************************/
itemOf_fn = function(node) {
  for (let n = node; n && n !== this.view; n = n.parentNode) {
    const component = n instanceof Element ? View.componentOf(n) : void 0;
    if (component && __privateGet$1(this, _items).get(component.id) === component) return component;
  }
  return void 0;
};
__decorateElement(_init3, 3, "style", _style_dec, _ToolBar);
__decorateElement(_init3, 3, "configuration", _configuration_dec, _ToolBar);
__decorateElement(_init3, 3, "isToggleButtons", _isToggleButtons_dec, _ToolBar);
__decorateElement(_init3, 3, "selectedId", _selectedId_dec, _ToolBar);
__decoratorMetadata(_init3, _ToolBar);
__publicField(_ToolBar, "DEFAULT_STYLE", "black_style");
__publicField(_ToolBar, "BLACK_TRANSLUCIDE_STYLE", "black_translucide_style");
__publicField(_ToolBar, "BLUE_STYLE", "blue_style");
__publicField(_ToolBar, "Text", ToolBarText);
__publicField(_ToolBar, "Button", ToolBarButton);
/** added to the bottom bar of a ScrollView */
__publicField(_ToolBar, "scrollViewHole", "bottom_bar");
/*****************************************************************
 *  The button icons (class names of the themes)
 ****************************************************************/
__publicField(_ToolBar, "BUTTON_ADD", "add");
__publicField(_ToolBar, "BUTTON_ARROW_DOWN", "arrow_down");
__publicField(_ToolBar, "BUTTON_ARROW_LEFT", "arrow_left");
__publicField(_ToolBar, "BUTTON_ARROW_RIGHT", "arrow_right");
__publicField(_ToolBar, "BUTTON_ARROW_UP", "arrow_up");
__publicField(_ToolBar, "BUTTON_ATTACH", "attach");
__publicField(_ToolBar, "BUTTON_AUCTION", "auction");
__publicField(_ToolBar, "BUTTON_BELL_OFF", "bell_off");
__publicField(_ToolBar, "BUTTON_BELL", "bell");
__publicField(_ToolBar, "BUTTON_BLOG", "blog");
__publicField(_ToolBar, "BUTTON_BOOK_MARKED", "book_marked");
__publicField(_ToolBar, "BUTTON_BOOK", "book");
__publicField(_ToolBar, "BUTTON_BOOKMARK_ADD", "bookmark_add");
__publicField(_ToolBar, "BUTTON_BOOKMARK", "bookmark");
__publicField(_ToolBar, "BUTTON_BOX_FULL", "box_full");
__publicField(_ToolBar, "BUTTON_BOX_MAIL", "box_mail");
__publicField(_ToolBar, "BUTTON_BOX", "box");
__publicField(_ToolBar, "BUTTON_BRIGHTNESS", "brightness");
__publicField(_ToolBar, "BUTTON_BRUSH", "brush");
__publicField(_ToolBar, "BUTTON_BULB_OFF", "bulb_off");
__publicField(_ToolBar, "BUTTON_BULB_ON", "bulb_on");
__publicField(_ToolBar, "BUTTON_BUZZER", "buzzer");
__publicField(_ToolBar, "BUTTON_CALCULATOR", "calculator");
__publicField(_ToolBar, "BUTTON_CALENDAR", "calendar");
__publicField(_ToolBar, "BUTTON_CALL", "call");
__publicField(_ToolBar, "BUTTON_CANCEL", "cancel");
__publicField(_ToolBar, "BUTTON_CASE", "case");
__publicField(_ToolBar, "BUTTON_CHECKMARK", "checkmark");
__publicField(_ToolBar, "BUTTON_CIRCLE_ARROW_LEFT", "circle_arrow_left");
__publicField(_ToolBar, "BUTTON_CIRCLE_ARROW_RIGHT", "circle_arrow_right");
__publicField(_ToolBar, "BUTTON_COMMAND_LINE", "command_line");
__publicField(_ToolBar, "BUTTON_COMMENT_ADD", "command_add");
__publicField(_ToolBar, "BUTTON_COMMENT_DELETE", "command_delete");
__publicField(_ToolBar, "BUTTON_COMMENT_OK", "command_ok");
__publicField(_ToolBar, "BUTTON_COMPUTER_OFF", "computer_off");
__publicField(_ToolBar, "BUTTON_COMPUTER_ON", "computer_on");
__publicField(_ToolBar, "BUTTON_CONTRAST", "contrast");
__publicField(_ToolBar, "BUTTON_CONTROL_1", "controls_1");
__publicField(_ToolBar, "BUTTON_CONTROL_2", "controls_2");
__publicField(_ToolBar, "BUTTON_CONTROL_3", "controls_3");
__publicField(_ToolBar, "BUTTON_CONTROL_4", "controls_4");
__publicField(_ToolBar, "BUTTON_CONTROL_5", "controls_5");
__publicField(_ToolBar, "BUTTON_CONTROL_6", "controls_6");
__publicField(_ToolBar, "BUTTON_CONTROL_7", "controls_7");
__publicField(_ToolBar, "BUTTON_CONTROL_8", "controls_8");
__publicField(_ToolBar, "BUTTON_COPY", "copy");
__publicField(_ToolBar, "BUTTON_COURT", "court");
__publicField(_ToolBar, "BUTTON_CREDIT_CARD", "credit_card");
__publicField(_ToolBar, "BUTTON_CUT", "cut");
__publicField(_ToolBar, "BUTTON_DANGER", "danger");
__publicField(_ToolBar, "BUTTON_DELETE", "delete");
__publicField(_ToolBar, "BUTTON_DISK", "disk");
__publicField(_ToolBar, "BUTTON_DOCUMENT_BLANK", "document_blank");
__publicField(_ToolBar, "BUTTON_DOCUMENT", "document");
__publicField(_ToolBar, "BUTTON_DOLLAR", "dollar");
__publicField(_ToolBar, "BUTTON_DOWNLOAD", "download");
__publicField(_ToolBar, "BUTTON_ERROR", "error");
__publicField(_ToolBar, "BUTTON_FAVORITIES_ADD", "favorities_add");
__publicField(_ToolBar, "BUTTON_FAVORITIES_REMOVE", "favorities_remove");
__publicField(_ToolBar, "BUTTON_FAVORITIES", "favorities");
__publicField(_ToolBar, "BUTTON_FILM", "film");
__publicField(_ToolBar, "BUTTON_FILMING", "filming");
__publicField(_ToolBar, "BUTTON_FIRST_AID", "first_aid");
__publicField(_ToolBar, "BUTTON_FLAG_BIS", "flag_1");
__publicField(_ToolBar, "BUTTON_FLAG", "flag");
__publicField(_ToolBar, "BUTTON_FLASH_ARROW", "flash_arrow");
__publicField(_ToolBar, "BUTTON_FLASH", "flash");
__publicField(_ToolBar, "BUTTON_FOLDER_BOOKMARK", "folder_bookmark");
__publicField(_ToolBar, "BUTTON_FOLDER_GOTO", "folder_goto");
__publicField(_ToolBar, "BUTTON_FOLDER", "folder");
__publicField(_ToolBar, "BUTTON_FONT_CAPITAL", "font_capital");
__publicField(_ToolBar, "BUTTON_FONT_ITALIC", "font_italic");
__publicField(_ToolBar, "BUTTON_FONT_REGULAR", "font_regular");
__publicField(_ToolBar, "BUTTON_FONT_UNDERLINE", "font_undeline");
__publicField(_ToolBar, "BUTTON_FONT", "font");
__publicField(_ToolBar, "BUTTON_FONTS", "fonts");
__publicField(_ToolBar, "BUTTON_FORUM", "forum");
__publicField(_ToolBar, "BUTTON_FRAME", "frame");
__publicField(_ToolBar, "BUTTON_GRAPH_AREAS", "graph_areas");
__publicField(_ToolBar, "BUTTON_GRAPH_BARS_DOWN", "graph_bars_down");
__publicField(_ToolBar, "BUTTON_GRAPH_BARS_UP", "graph_bars_up");
__publicField(_ToolBar, "BUTTON_GRAPH_BARS", "graph_bars");
__publicField(_ToolBar, "BUTTON_GRAPH_DOWN", "graph_down");
__publicField(_ToolBar, "BUTTON_GRAPH_LINES", "graph_lines");
__publicField(_ToolBar, "BUTTON_GRAPH_UP", "graph_up");
__publicField(_ToolBar, "BUTTON_HAT", "hat");
__publicField(_ToolBar, "BUTTON_HELP", "help");
__publicField(_ToolBar, "BUTTON_HOME", "home");
__publicField(_ToolBar, "BUTTON_INFORMATION", "information");
__publicField(_ToolBar, "BUTTON_KEY", "key");
__publicField(_ToolBar, "BUTTON_KEYBOARD", "keyboard");
__publicField(_ToolBar, "BUTTON_LAPTOP", "laptop");
__publicField(_ToolBar, "BUTTON_LINK", "links");
__publicField(_ToolBar, "BUTTON_LIST_BULLETS", "bullets");
__publicField(_ToolBar, "BUTTON_LIST_NUMBERS", "list_numbers");
__publicField(_ToolBar, "BUTTON_LOCK", "lock");
__publicField(_ToolBar, "BUTTON_MAGNIFY_GLASS", "magnify_glass");
__publicField(_ToolBar, "BUTTON_MAIL", "mail");
__publicField(_ToolBar, "BUTTON_MANAGE", "manage");
__publicField(_ToolBar, "BUTTON_MEASURE", "measure");
__publicField(_ToolBar, "BUTTON_MEASURES", "measures");
__publicField(_ToolBar, "BUTTON_MIC_BIS", "mic_bis");
__publicField(_ToolBar, "BUTTON_MIC", "mic");
__publicField(_ToolBar, "BUTTON_MINUS", "minus");
__publicField(_ToolBar, "BUTTON_MUTE", "mute");
__publicField(_ToolBar, "BUTTON_PAINT", "pain");
__publicField(_ToolBar, "BUTTON_PAPER_PLANE", "paper_plane");
__publicField(_ToolBar, "BUTTON_PAPER_TRASH", "paper_trash");
__publicField(_ToolBar, "BUTTON_PAPERCLIO", "paperclio");
__publicField(_ToolBar, "BUTTON_PARAGRAPH", "paragraph");
__publicField(_ToolBar, "BUTTON_PENCIL", "pencil");
__publicField(_ToolBar, "BUTTON_PHOTO", "photo");
__publicField(_ToolBar, "BUTTON_PIECHART", "113");
__publicField(_ToolBar, "BUTTON_POST", "post");
__publicField(_ToolBar, "BUTTON_PROFILE", "profile");
__publicField(_ToolBar, "BUTTON_REFRESH", "refresh");
__publicField(_ToolBar, "BUTTON_RESIZE", "resize");
__publicField(_ToolBar, "BUTTON_RSS", "rss");
__publicField(_ToolBar, "BUTTON_SAD_FACE", "sade_face");
__publicField(_ToolBar, "BUTTON_SAFE", "safe");
__publicField(_ToolBar, "BUTTON_SAVE", "save");
__publicField(_ToolBar, "BUTTON_SETTINGS", "settings");
__publicField(_ToolBar, "BUTTON_SHOPPING_BAG", "shopping_bag");
__publicField(_ToolBar, "BUTTON_SHOPPING_CART", "shopping_cart");
__publicField(_ToolBar, "BUTTON_SHOPPING_HEAVY", "shopping_heavy");
__publicField(_ToolBar, "BUTTON_SIM", "sim");
__publicField(_ToolBar, "BUTTON_SMILE_FACE", "smile_face");
__publicField(_ToolBar, "BUTTON_SORT_AZ", "sort_az");
__publicField(_ToolBar, "BUTTON_SORT_ZA", "sort_za");
__publicField(_ToolBar, "BUTTON_STAR", "star");
__publicField(_ToolBar, "BUTTON_STORAGE", "storage");
__publicField(_ToolBar, "BUTTON_SWITCH", "switch");
__publicField(_ToolBar, "BUTTON_TAG_ADD", "tag_add");
__publicField(_ToolBar, "BUTTON_TAG_CANCEL", "tag_cancel");
__publicField(_ToolBar, "BUTTON_TAG_DELETE", "tag_delete");
__publicField(_ToolBar, "BUTTON_TAG", "tag");
__publicField(_ToolBar, "BUTTON_TEXT_ALIGN_CENTER", "text_align_center");
__publicField(_ToolBar, "BUTTON_TEXT_ALIGN_JUSTIFY", "text_align_justify");
__publicField(_ToolBar, "BUTTON_TEXT_ALIGN_LEFT", "text_align_left");
__publicField(_ToolBar, "BUTTON_TEXT_ALIGN_RIGHT", "text_align_right");
__publicField(_ToolBar, "BUTTON_TIME", "time");
__publicField(_ToolBar, "BUTTON_TIMER", "timer");
__publicField(_ToolBar, "BUTTON_TRASH", "trash");
__publicField(_ToolBar, "BUTTON_TWG", "twg");
__publicField(_ToolBar, "BUTTON_UNLOCK", "unlock");
__publicField(_ToolBar, "BUTTON_UPLOAD", "upload");
__publicField(_ToolBar, "BUTTON_USER", "user");
__publicField(_ToolBar, "BUTTON_USERS", "users");
__publicField(_ToolBar, "BUTTON_VOLUME_DOWN", "volume_down");
__publicField(_ToolBar, "BUTTON_VOLUME_UP", "volume_up");
__publicField(_ToolBar, "BUTTON_VOLUME", "volume");
__publicField(_ToolBar, "BUTTON_WALLET", "wallet");
__publicField(_ToolBar, "BUTTON_WARNING", "warning");
__publicField(_ToolBar, "BUTTON_WIFI", "wifi");
__publicField(_ToolBar, "BUTTON_WINDOW_ERROR", "window_error");
__publicField(_ToolBar, "BUTTON_WINDOW_GLOBE", "window_globe");
__publicField(_ToolBar, "BUTTON_WINDOW_LOCK", "window_lock");
__publicField(_ToolBar, "BUTTON_WINDOW", "window");
__publicField(_ToolBar, "BUTTON_ZOOM_IN", "zoom_in");
__publicField(_ToolBar, "BUTTON_ZOOM_OUT", "zoom_out");
let ToolBar = _ToolBar;

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _orientation, _orientationListener, _Application_instances, didChangeOrientation_fn, load_fn;
const applications = /* @__PURE__ */ new Map();
function windowOrientation() {
  const angle = globalThis.screen?.orientation?.angle;
  if (typeof angle === "number" && angle !== 0) return angle > 180 ? angle - 360 : angle;
  return window.innerWidth > window.innerHeight ? 90 : 0;
}
function hasNodeOption(options) {
  return ["node", "nodeId", "nodeRef", "rootRef", "templateRef", "template"].some((key) => options[key] !== void 0);
}
class Application extends View {
  constructor(options = {}) {
    let node = options.node;
    if (!hasNodeOption(options)) node = document.body;
    if (node instanceof HTMLHtmlElement) node = node.querySelector("body") ?? void 0;
    super(node ? { ...options, node } : options);
    __privateAdd(this, _Application_instances);
    __privateAdd(this, _orientation, 0);
    __privateAdd(this, _orientationListener, () => __privateMethod(this, _Application_instances, didChangeOrientation_fn).call(this));
  }
  initComponent() {
    super.initComponent();
    applications.set(this.id, this);
    this.view.setAttribute("x-hag-ref", this.id);
    __privateSet(this, _orientation, windowOrientation());
    window.addEventListener("orientationchange", __privateGet(this, _orientationListener));
    window.addEventListener("resize", __privateGet(this, _orientationListener));
  }
  destructor() {
    window.removeEventListener("orientationchange", __privateGet(this, _orientationListener));
    window.removeEventListener("resize", __privateGet(this, _orientationListener));
    applications.delete(this.id);
    super.destructor();
  }
  /**
   *  Called once, when the applications start (see Application.start)
   */
  // eslint-disable-next-line class-methods-use-this
  applicationStarted() {
  }
  /**
   *  Called before the views follow the new orientation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  orientationWillChange(_orientation2) {
  }
  /**
   *  Called once the views follow the new orientation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  orientationDidChange(_orientation2) {
  }
  /**
   * The current orientation (0: portrait, 90 or -90: landscape)
   */
  get orientation() {
    return __privateGet(this, _orientation);
  }
  /**
   * The position and size of an application are in px
   */
  didUpdateSizeAndPosition() {
    const view = this.view;
    if (!view) return;
    const [width, height] = this.size, [x, y] = this.position;
    if (width >= 0) view.style.width = `${width}px`;
    if (height >= 0) view.style.height = `${height}px`;
    if (x >= 0) view.style.left = `${x}px`;
    if (y >= 0) view.style.top = `${y}px`;
    view.style.right = view.style.bottom = "auto";
  }
  /*****************************************************************
   *  Loading
   ****************************************************************/
  /**
   *  Loads a script; the 'scriptloaded' event is emitted once loaded
   */
  loadScript(path) {
    const script = document.createElement("script");
    script.src = path;
    return __privateMethod(this, _Application_instances, load_fn).call(this, script, path, "scriptloaded");
  }
  /**
   *  Loads a style sheet; the 'cssloaded' event is emitted once loaded
   */
  loadCSS(path) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = path;
    return __privateMethod(this, _Application_instances, load_fn).call(this, link, path, "cssloaded");
  }
  /*****************************************************************
   *  Applications
   ****************************************************************/
  /**
   *  Returns the initialized applications
   */
  static getApplications() {
    return [...applications.values()];
  }
  /**
   *  Starts the applications: applicationStarted is called, then they are
   *  refreshed
   */
  static start() {
    for (const application of applications.values()) {
      application.applicationStarted();
      setTimeout(() => application.refresh(), 0);
    }
  }
  /**
   *  Destroys the applications
   */
  static stop() {
    for (const application of [...applications.values()]) application.destroy();
    applications.clear();
  }
  /**
   *  Closes the window
   */
  static exit() {
    window.close?.();
  }
  /**
   *  Returns the orientation of the window (0: portrait, 90 or -90:
   *  landscape)
   */
  static getOrientation() {
    return windowOrientation();
  }
  /**
   *  Preloads images (in the browser cache)
   */
  static preloadImages(paths) {
    for (const path of paths) new Image().src = path;
  }
}
_orientation = new WeakMap();
_orientationListener = new WeakMap();
_Application_instances = new WeakSet();
didChangeOrientation_fn = function() {
  const orientation = windowOrientation();
  if (orientation === __privateGet(this, _orientation)) return;
  __privateSet(this, _orientation, orientation);
  const views = [];
  const collect = (child) => {
    views.push(child);
    if (child instanceof View) child.getChildren().forEach(collect);
  };
  this.getChildren().forEach(collect);
  this.orientationWillChange(orientation);
  views.forEach((view) => view.orientationWillChange?.(orientation));
  this.refresh();
  views.forEach((view) => view.orientationDidChange?.(orientation));
  this.orientationDidChange(orientation);
  this.emit("orientationchange", orientation);
};
load_fn = function(element, path, event) {
  return new Promise((resolve, reject) => {
    element.addEventListener("load", () => {
      this.emit(event, path);
      resolve();
    }, { once: true });
    element.addEventListener("error", () => reject(new Error(`vs.ui.Application: impossible to load '${path}'`)), { once: true });
    document.head.appendChild(element);
  });
};

export { ANIMATION_DELAY, ANIMATION_DURATION, ANIMATION_END, ANIMATION_FILL_MODE, ANIMATION_NAME, ANIMATION_TIMING_FUNC, AbstractList, AbstractListItem, Animation, Application, BLANK_IMAGE, Button, CSS_ANDROID, CSS_BLACKBERRY, CSS_DEFAULT, CSS_FLAT, CSS_HOLO, CSS_IOS, CSS_IOS7, CSS_MEEGO, CSS_PURE, CSS_SYMBIAN, CSS_WP7, Canvas, CheckBox, ComboBox, DefaultListItem, DragRecognizer, GestureRecognizer, ITERATION_COUNT, ImageView, InputField, KEY_FRAMES, List, MOVE_THRESHOLD, MULTI_TAP_DELAY, NavigationBar, OpacityAnimation, Picker, PinchRecognizer, PointerRecognizer, PopOver, ProgressBar, RadioButton, RotateAnimation, RotateXYZAnimation, RotationRecognizer, SVGView, ScaleAnimation, ScrollImageView, ScrollView, SegmentedButton, SimpleListItem, SkewAnimation, Slider, SplitView, Switch, TRANSFORM, TRANSFORM_ORIGIN, TRANSITION_DELAY, TRANSITION_DURATION, TRANSITION_END, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNC, TapRecognizer, Template, TextArea, TextLabel, ToolBar, ToolBarButton, ToolBarText, TranslateAnimation, View, getDeviceCSSCode, toText };
//# sourceMappingURL=vs_ui.es.js.map
