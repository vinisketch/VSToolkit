define(['exports', 'vs_utils', 'vs_toolkit/vs_core', 'vs_toolkit/vs_ui'], (function (exports, vs_utils, vs_core, vs_ui) { 'use strict';

  var __defProp$7 = Object.defineProperty;
  var __typeError$6 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$6 = (obj, member, msg) => member.has(obj) || __typeError$6("Cannot " + msg);
  var __privateGet$6 = (obj, member, getter) => (__accessCheck$6(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$6 = (obj, member, value) => member.has(obj) ? __typeError$6("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$6 = (obj, member, value, setter) => (__accessCheck$6(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$4 = (obj, member, method) => (__accessCheck$6(obj, member, "access private method"), method);
  var _willGoTo, _states, _transitions, _initialComponent, _instant, _transition, _Controller_instances, bind_fn, unbindState_fn, willGoTo_fn;
  const controllers = /* @__PURE__ */ new WeakMap();
  function runAnimation(animation, view, instant = false) {
    if (!animation) return Promise.resolve();
    const copy = animation.clone();
    if (instant) copy.duration = 0;
    return copy.start(view);
  }
  function assignModel(view, values) {
    const properties = new Set(view.modelProperties);
    const known = {};
    for (const [name, value] of Object.entries(values)) {
      if (properties.has(name)) known[name] = value;
    }
    view.assign(known);
  }
  function callOptional(view, method) {
    const func = view[method];
    if (typeof func === "function") func.call(view);
  }
  class ControllerFsm extends vs_core.Fsm {
    constructor(owner, willGoTo) {
      super(owner);
      __privateAdd$6(this, _willGoTo);
      __privateSet$6(this, _willGoTo, willGoTo);
    }
    goTo(stateId, output, input) {
      if (!this.existState(stateId)) return false;
      __privateGet$6(this, _willGoTo).call(this, this.currentState, stateId, input?.type, input?.data);
      return super.goTo(stateId, output, input);
    }
    /**
     * Goes to a state without crossing a transition (no output)
     */
    jump(stateId, on, data) {
      if (!this.existState(stateId)) return false;
      __privateGet$6(this, _willGoTo).call(this, this.currentState, stateId, on, data);
      return super.goTo(stateId);
    }
  }
  _willGoTo = new WeakMap();
  class Controller extends vs_core.Model {
    constructor(owner, options = {}) {
      super();
      __privateAdd$6(this, _Controller_instances);
      /** the view whose children are controlled */
      __publicField$7(this, "owner");
      /** told when the view changes */
      __publicField$7(this, "delegate");
      /** the states and transitions */
      __publicField$7(this, "fsm");
      __privateAdd$6(this, _states, /* @__PURE__ */ new Map());
      __privateAdd$6(this, _transitions, /* @__PURE__ */ new Map());
      __privateAdd$6(this, _initialComponent, "");
      __privateAdd$6(this, _instant, false);
      __privateAdd$6(this, _transition);
      if (!(owner instanceof vs_ui.View)) {
        throw new TypeError("vs.fx.Controller: the owner must be a view");
      }
      if (controllers.has(owner)) {
        throw new Error(`vs.fx.Controller: the view ${owner.id} already has a controller`);
      }
      controllers.set(owner, this);
      this.owner = owner;
      this.delegate = options.delegate ?? null;
      this.fsm = new ControllerFsm(this, (from, to, on, data) => __privateMethod$4(this, _Controller_instances, willGoTo_fn).call(this, from, to, on, data));
    }
    /**
     *  Returns the controller of a view
     */
    static of(view) {
      return controllers.get(view);
    }
    destructor() {
      const current = __privateGet$6(this, _states).get(this.fsm.currentState);
      if (current) __privateMethod$4(this, _Controller_instances, unbindState_fn).call(this, current);
      if (controllers.get(this.owner) === this) controllers.delete(this.owner);
      this.fsm.destroy();
      __privateGet$6(this, _states).clear();
      __privateGet$6(this, _transitions).clear();
      super.destructor();
    }
    /*****************************************************************
     *  States
     ****************************************************************/
    /**
     *  Returns true if the state exists
     */
    hasState(id) {
      return __privateGet$6(this, _states).has(id);
    }
    /**
     *  Returns the ids of the states, in the order they were pushed
     */
    getStates() {
      return [...__privateGet$6(this, _states).keys()];
    }
    /**
     *  Returns the view of a state, undefined until a component name is
     *  created
     */
    getView(id) {
      return __privateGet$6(this, _states).get(id)?.view;
    }
    /**
     *  The current state, '' before the initial component
     */
    get currentState() {
      return this.fsm.currentState;
    }
    /**
     *  The view of the current state
     */
    get currentView() {
      return this.getView(this.fsm.currentState);
    }
    /**
     *  Pushes a view, or the name of a component created when its state is
     *  first entered. Returns the id of its state, undefined if the state
     *  already exists.
     */
    push(component, options = {}) {
      if (!component) return void 0;
      const isName = vs_utils.isString(component);
      const id = options.id || (isName ? vs_utils.createId() : component.id);
      if (__privateGet$6(this, _states).has(id)) return void 0;
      const state = {
        id,
        componentName: isName ? component : void 0,
        data: { ...options.data },
        extension: options.extension,
        bindings: [],
        unbinds: []
      };
      __privateGet$6(this, _states).set(id, state);
      this.fsm.addState(id);
      for (const [event, listener] of options.bindings ?? []) this.componentBind(id, event, listener);
      if (!isName) {
        state.view = component;
        if (!this.owner.isChild(component)) this.owner.add(component, options.extension);
        this.configureNewComponent(component, id);
      }
      return id;
    }
    /**
     *  Removes the state of a view (or of a state id), and removes its view
     *  from the owner. Returns false for an unknown state.
     */
    remove(component) {
      const id = vs_utils.isString(component) ? component : component?.id;
      const state = id ? __privateGet$6(this, _states).get(id) : void 0;
      if (!state) return false;
      if (this.fsm.currentState === id) __privateMethod$4(this, _Controller_instances, unbindState_fn).call(this, state);
      if (state.view) this.owner.remove(state.view);
      this.fsm.removeState(id);
      __privateGet$6(this, _states).delete(id);
      for (const key of [...__privateGet$6(this, _transitions).keys()]) {
        if (key.startsWith(`${id}\0`)) __privateGet$6(this, _transitions).delete(key);
      }
      if (__privateGet$6(this, _initialComponent) === id) __privateSet$6(this, _initialComponent, "");
      return true;
    }
    /**
     *  Removes all the states
     */
    clear() {
      const current = __privateGet$6(this, _states).get(this.fsm.currentState);
      if (current) __privateMethod$4(this, _Controller_instances, unbindState_fn).call(this, current);
      for (const state of __privateGet$6(this, _states).values()) {
        if (state.view) this.owner.remove(state.view);
      }
      __privateGet$6(this, _states).clear();
      __privateGet$6(this, _transitions).clear();
      __privateSet$6(this, _initialComponent, "");
      this.fsm.clear();
    }
    /**
     *  Binds a listener to an event of the view of a state, while this state
     *  is the current one
     */
    componentBind(id, event, listener) {
      const state = __privateGet$6(this, _states).get(id);
      if (!state) return;
      state.bindings.push([event, listener]);
      if (this.fsm.currentState === id && state.view) {
        state.unbinds.push(__privateMethod$4(this, _Controller_instances, bind_fn).call(this, state.view, event, listener));
      }
    }
    /**
     *  The initial view (its state id): setting it goes to it, without
     *  animation
     */
    set initialComponent(id) {
      if (!id) {
        __privateSet$6(this, _initialComponent, "");
        this.fsm.initialState = "";
        return;
      }
      if (!__privateGet$6(this, _states).has(id)) {
        throw new Error(`vs.fx.Controller: unknown state "${id}"`);
      }
      __privateSet$6(this, _initialComponent, id);
      this.fsm.initialState = id;
      this.fsm.activate();
    }
    get initialComponent() {
      return __privateGet$6(this, _initialComponent);
    }
    /**
     *  Sets the initial state, without going to it
     */
    setInitialState(id) {
      __privateSet$6(this, _initialComponent, id);
      this.fsm.initialState = id;
    }
    /*****************************************************************
     *  Transitions
     ****************************************************************/
    /**
     *  Adds a transition from a state to another, on an input, with the
     *  animation out of the current view and the animation into the new one
     *  [optional]
     */
    addTransition(from, to, on, animationOut, animationIn) {
      for (const state of [from, to]) {
        if (!__privateGet$6(this, _states).has(state)) throw new Error(`vs.fx.Controller: unknown state "${state}"`);
      }
      if (!on) throw new Error("vs.fx.Controller: the input is empty");
      this.fsm.addInput(on);
      this.fsm.addTransition(from, to, on);
      __privateGet$6(this, _transitions).set(`${from}\0${on}`, { out: animationOut ?? void 0, in: animationIn ?? void 0 });
    }
    /**
     *  Removes the transition of a state on an input
     */
    removeTransition(from, on) {
      if (!__privateGet$6(this, _states).has(from) || !this.fsm.existInput(on)) return;
      this.fsm.removeTransitionFrom(from, on);
      __privateGet$6(this, _transitions).delete(`${from}\0${on}`);
    }
    /**
     *  Returns the animations of the transition of a state on an input
     */
    transitionAnimations(from, on) {
      return on === void 0 ? void 0 : __privateGet$6(this, _transitions).get(`${from}\0${on}`);
    }
    /**
     *  Sends an input: crosses the transition of the current state on it, if
     *  any. The data are set to the model of the new view. Resolves true once
     *  the animation ended, false without transition.
     */
    notify(on, data, options = {}) {
      if (!this.fsm.existInput(on)) return Promise.resolve(false);
      return this.navigate(options, () => this.fsm.fsmNotify(on, data));
    }
    /**
     *  Goes to a state, without crossing a transition (on is given to
     *  transitionViews). Resolves true once the animation ended, false for an
     *  unknown state.
     */
    jumpTo(id, on, options = {}, data) {
      return this.navigate(options, () => this.fsm.jump(id, on, data));
    }
    /**
     *  Runs a move of the fsm, and returns the promise of its animation
     */
    navigate(options, move) {
      __privateSet$6(this, _instant, !!options.instant);
      __privateSet$6(this, _transition, void 0);
      try {
        if (!move()) return Promise.resolve(false);
      } finally {
        __privateSet$6(this, _instant, false);
      }
      return __privateGet$6(this, _transition) ?? Promise.resolve(true);
    }
    /**
     *  Returns the view of the state, created from its component name if
     *  needed
     */
    ensureView(id) {
      const state = __privateGet$6(this, _states).get(id);
      if (!state) return void 0;
      if (state.view) return state.view;
      if (!state.componentName) return void 0;
      const view = this.owner.createAndAddComponent(state.componentName, { ...state.data }, state.extension);
      if (!view) {
        throw new Error(`vs.fx.Controller: impossible to create the component "${state.componentName}"`);
      }
      state.view = view;
      this.configureNewComponent(view, id);
      return view;
    }
    /*****************************************************************
     *  Subclass API
     ****************************************************************/
    /**
     *  Called when the current state changes, before the views change
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    willChangeState(_fromId, _toId) {
    }
    /**
     *  Prepares a new view of the controller (pushed, or created from its
     *  component name)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    configureNewComponent(_view, _id) {
    }
    /**
     *  Animates the change of view: shows the new view, and runs the
     *  animations of the transition (in parallel)
     */
    async transitionViews(from, to, context) {
      const animations = this.transitionAnimations(context.fromId, context.on);
      to.show();
      await Promise.all([
        runAnimation(animations?.in, to, context.instant),
        runAnimation(animations?.out, from, context.instant)
      ]);
    }
    /**
     *  Updates the views (e.g. after a size change)
     */
    // eslint-disable-next-line class-methods-use-this
    refresh() {
    }
  }
  _states = new WeakMap();
  _transitions = new WeakMap();
  _initialComponent = new WeakMap();
  _instant = new WeakMap();
  _transition = new WeakMap();
  _Controller_instances = new WeakSet();
  /*****************************************************************
   *  State changes
   ****************************************************************/
  bind_fn = function(view, event, listener) {
    return view.on(event, listener);
  };
  unbindState_fn = function(state) {
    state.unbinds.forEach((unbind) => unbind());
    state.unbinds = [];
  };
  willGoTo_fn = function(fromId, toId, on, data) {
    const from = __privateGet$6(this, _states).get(fromId);
    const to = __privateGet$6(this, _states).get(toId);
    if (from) __privateMethod$4(this, _Controller_instances, unbindState_fn).call(this, from);
    this.willChangeState(fromId, toId);
    const toView = this.ensureView(toId);
    if (data && typeof data === "object") assignModel(toView, data);
    to.unbinds = to.bindings.map(([event, listener]) => __privateMethod$4(this, _Controller_instances, bind_fn).call(this, toView, event, listener));
    const fromView = from?.view ?? null;
    if (fromView && fromView !== toView) callOptional(fromView, "viewWillDisappear");
    callOptional(toView, "viewWillAppear");
    this.delegate?.controllerViewWillChange?.(fromView, toView, this);
    this.emit("viewwillchange", fromView, toView);
    if (!fromView || fromView === toView) {
      toView.show();
      __privateSet$6(this, _transition, Promise.resolve(true));
      return;
    }
    const context = { fromId, toId, on, instant: __privateGet$6(this, _instant) };
    __privateSet$6(this, _transition, this.transitionViews(fromView, toView, context).then(
      () => {
        this.delegate?.controllerAnimationDidEnd?.(fromView, toView, this);
        this.emit("animationend", fromView, toView);
        return true;
      },
      (error) => {
        console.error(`vs.fx.Controller: the transition from "${fromId}" to "${toId}" failed`, error);
        return false;
      }
    ));
  };

  function place(view, transform) {
    if (view.view) view.view.style.transform = transform;
  }
  function animate(view, properties, duration) {
    return new vs_ui.Animation(properties, { duration, additive: false }).start(view);
  }

  var __create$5 = Object.create;
  var __defProp$6 = Object.defineProperty;
  var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
  var __knownSymbol$5 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError$5 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart$5 = (base) => [, , , __create$5(base?.[__knownSymbol$5("metadata")] ?? null)];
  var __decoratorStrings$5 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn$5 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$5("Function expected") : fn;
  var __decoratorContext$5 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$5[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$5("Already initialized") : fns.push(__expectFn$5(fn || null)) });
  var __decoratorMetadata$5 = (array, target) => __defNormalProp$6(target, __knownSymbol$5("metadata"), array[3]);
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
    return desc && __defProp$6(target, name, desc), target;
  };
  var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
  var __privateGet$5 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$5 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$3 = (obj, member, method) => (__accessCheck$5(obj, member, "access private method"), method);
  var _viewSize_dec, _animationDuration_dec$1, _isTactile_dec, _a$5, _stack, _animationDuration$1, _isTactile, _dragRecognizer, _viewSize, _order, _StackController_instances, relink_fn, setTactile_fn, _lastDelta, _init$5;
  const SWIPE_THRESHOLD = 50;
  const _StackController = class _StackController extends (_a$5 = Controller, _isTactile_dec = [vs_core.InOut], _animationDuration_dec$1 = [vs_core.InOut], _viewSize_dec = [vs_core.InOut], _a$5) {
    constructor(owner, options = {}) {
      super(owner, options);
      __runInitializers$5(_init$5, 5, this);
      __privateAdd$5(this, _StackController_instances);
      __privateAdd$5(this, _stack, []);
      __privateAdd$5(this, _animationDuration$1, _StackController.ANIMATION_DURATION);
      __privateAdd$5(this, _isTactile, false);
      __privateAdd$5(this, _dragRecognizer);
      __privateAdd$5(this, _viewSize, null);
      /** the animation direction forced for the next move (circular move) */
      __privateAdd$5(this, _order);
      __privateAdd$5(this, _lastDelta, { dx: 0, dy: 0 });
      for (const input of [_StackController.NEXT, _StackController.PRED, _StackController.FIRST]) {
        this.fsm.addInput(input);
      }
    }
    destructor() {
      __privateMethod$3(this, _StackController_instances, setTactile_fn).call(this, false);
      super.destructor();
    }
    /*****************************************************************
     *  The sequence of views
     ****************************************************************/
    /**
     *  The ids of the states, in their order
     */
    get stack() {
      return __privateGet$5(this, _stack).slice();
    }
    /**
     *  The position of the current view, -1 before the first push
     */
    get currentIndex() {
      return __privateGet$5(this, _stack).indexOf(this.currentState);
    }
    /**
     *  Pushes a view at the end of the sequence; the first one is the
     *  initial view
     */
    push(component, options = {}) {
      const id = super.push(component, options);
      if (!id) return void 0;
      __privateGet$5(this, _stack).push(id);
      __privateMethod$3(this, _StackController_instances, relink_fn).call(this);
      if (__privateGet$5(this, _stack).length === 1) this.initialComponent = id;
      this.updateViewSize();
      return id;
    }
    /**
     *  Removes a view from the sequence; the current one is replaced by its
     *  neighbor
     */
    remove(component) {
      const id = vs_utils.isString(component) ? component : component?.id;
      const index = id ? __privateGet$5(this, _stack).indexOf(id) : -1;
      const wasCurrent = id === this.currentState;
      if (!super.remove(component)) return false;
      if (index === -1) return true;
      __privateGet$5(this, _stack).splice(index, 1);
      __privateMethod$3(this, _StackController_instances, relink_fn).call(this);
      if (index === 0 && __privateGet$5(this, _stack).length) this.setInitialState(__privateGet$5(this, _stack)[0]);
      if (wasCurrent && __privateGet$5(this, _stack).length) {
        this.jumpTo(__privateGet$5(this, _stack)[Math.min(index, __privateGet$5(this, _stack).length - 1)], void 0, { instant: true });
      }
      this.updateViewSize();
      return true;
    }
    clear() {
      super.clear();
      __privateGet$5(this, _stack).length = 0;
      for (const input of [_StackController.NEXT, _StackController.PRED, _StackController.FIRST]) {
        this.fsm.addInput(input);
      }
    }
    /*****************************************************************
     *  Navigation
     ****************************************************************/
    /**
     *  Goes to the view at the position. Resolves true once the animation
     *  ended (also when it is the current view), false for an invalid
     *  position.
     */
    goToViewAt(index, options = {}) {
      return this.moveTo(index, void 0, options);
    }
    /**
     *  Goes to the view of the state
     */
    goToViewId(id, options = {}) {
      return this.goToViewAt(__privateGet$5(this, _stack).indexOf(id), options);
    }
    goToNextView(options = {}) {
      return this.goToViewAt(this.currentIndex + 1, options);
    }
    goToPreviousView(options = {}) {
      return this.goToViewAt(this.currentIndex - 1, options);
    }
    goToFirstView(options = {}) {
      return this.goToViewAt(0, options);
    }
    goToLastView(options = {}) {
      return this.goToViewAt(__privateGet$5(this, _stack).length - 1, options);
    }
    /**
     *  Goes to the view at the position, animated in the order (1: forward,
     *  -1: backward; by default according to the positions)
     */
    moveTo(index, order, options) {
      if (!Number.isInteger(index) || index < 0 || index >= __privateGet$5(this, _stack).length) return Promise.resolve(false);
      const current = this.currentIndex;
      if (index === current) return Promise.resolve(true);
      const id = __privateGet$5(this, _stack)[index];
      __privateSet$5(this, _order, order);
      try {
        for (const on of [_StackController.NEXT, _StackController.PRED, _StackController.FIRST]) {
          if (this.fsm.getAccessibleStateOn(on) === id) return this.notify(on, void 0, options);
        }
        return this.jumpTo(id, _StackController.LAST, options);
      } finally {
        __privateSet$5(this, _order, void 0);
      }
    }
    transitionViews(from, to, context) {
      const order = __privateGet$5(this, _order) ?? (__privateGet$5(this, _stack).indexOf(context.toId) >= __privateGet$5(this, _stack).indexOf(context.fromId) ? 1 : -1);
      return this.stackAnimate(order, from, to, context.instant);
    }
    /*****************************************************************
     *  Views
     ****************************************************************/
    configureNewComponent(view, id) {
      view.setStyle("position", "absolute");
      const index = __privateGet$5(this, _stack).indexOf(id);
      this.layoutView(view, index === -1 ? __privateGet$5(this, _stack).length : index, Math.max(this.currentIndex, 0));
    }
    /**
     *  Places the views according to the current one (after a change of
     *  orientation, of size…)
     */
    updateViewSize() {
      const current = Math.max(this.currentIndex, 0);
      __privateGet$5(this, _stack).forEach((id, index) => {
        const view = this.getView(id);
        if (view) this.layoutView(view, index, current);
      });
    }
    refresh() {
      this.updateViewSize();
    }
    /**
     *  Called when the orientation changes (see Application)
     */
    orientationDidChange() {
      this.updateViewSize();
    }
    /**
     *  Returns the view at the position, created if needed
     */
    viewAt(index) {
      const id = __privateGet$5(this, _stack)[index];
      return id === void 0 ? void 0 : this.ensureView(id);
    }
    /**
     *  The size of a page [width, height]: the viewSize, else the size of the
     *  owner node
     */
    get pageSize() {
      if (__privateGet$5(this, _viewSize)) return [__privateGet$5(this, _viewSize)[0], __privateGet$5(this, _viewSize)[1]];
      const view = this.owner.view;
      if (view?.offsetWidth || view?.offsetHeight) return [view.offsetWidth, view.offsetHeight];
      const [width, height] = this.owner.size;
      return [Math.max(width, 0), Math.max(height, 0)];
    }
    /**
     *  Animates properties of a view, during animationDuration (or at once)
     */
    animateView(view, properties, instant) {
      return animate(view, properties, instant ? 0 : __privateGet$5(this, _animationDuration$1));
    }
    didDragStart() {
      __privateSet$5(this, _lastDelta, { dx: 0, dy: 0 });
      this.dragStart();
    }
    didDrag(delta) {
      __privateSet$5(this, _lastDelta, delta);
      this.dragMove(delta.dx, delta.dy);
    }
    didDragEnd() {
      const { dx, dy } = __privateGet$5(this, _lastDelta);
      this.dragEnd(dx, dy);
    }
    /** the swipe is horizontal (dx), else vertical (dy) */
    get isHorizontal() {
      return true;
    }
    /** the user starts to swipe */
    // eslint-disable-next-line class-methods-use-this
    dragStart() {
    }
    /** the user swipes (since the start) */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    dragMove(_dx, _dy) {
    }
    /**
     *  The user released: a swipe longer than SWIPE_THRESHOLD goes to the
     *  previous view (towards the right / the bottom) or to the next one;
     *  else cancelDrag
     */
    dragEnd(dx, dy) {
      const delta = this.isHorizontal ? dx : dy;
      let move = Promise.resolve(false);
      if (delta > SWIPE_THRESHOLD) move = this.goToPreviousView();
      else if (delta < -SWIPE_THRESHOLD) move = this.goToNextView();
      return move.then((moved) => {
        if (!moved) this.cancelDrag();
        return moved;
      });
    }
    /** the swipe did not change the view: the views go back */
    // eslint-disable-next-line class-methods-use-this
    cancelDrag() {
    }
    set isTactile(v) {
      __privateSet$5(this, _isTactile, !!v);
      __privateMethod$3(this, _StackController_instances, setTactile_fn).call(this, __privateGet$5(this, _isTactile));
    }
    get isTactile() {
      return __privateGet$5(this, _isTactile);
    }
    set animationDuration(v) {
      if (!vs_utils.isNumber(v) || v < 0) return;
      __privateSet$5(this, _animationDuration$1, v);
    }
    get animationDuration() {
      return __privateGet$5(this, _animationDuration$1);
    }
    set viewSize(v) {
      if (v === null) {
        __privateSet$5(this, _viewSize, null);
      } else {
        if (!vs_utils.isArray(v) || v.length !== 2 || !vs_utils.isNumber(v[0]) || !vs_utils.isNumber(v[1])) return;
        __privateSet$5(this, _viewSize, v.slice());
      }
      this.updateViewSize();
    }
    get viewSize() {
      return [...this.pageSize];
    }
  };
  _init$5 = __decoratorStart$5(_a$5);
  _stack = new WeakMap();
  _animationDuration$1 = new WeakMap();
  _isTactile = new WeakMap();
  _dragRecognizer = new WeakMap();
  _viewSize = new WeakMap();
  _order = new WeakMap();
  _StackController_instances = new WeakSet();
  /**
   * The 'next', 'pred' and 'first' transitions of the sequence
   */
  relink_fn = function() {
    const stack = __privateGet$5(this, _stack);
    stack.forEach((id, index) => {
      for (const on of [_StackController.NEXT, _StackController.PRED, _StackController.FIRST]) {
        this.removeTransition(id, on);
      }
      if (index < stack.length - 1) this.addTransition(id, stack[index + 1], _StackController.NEXT);
      if (index > 0) {
        this.addTransition(id, stack[index - 1], _StackController.PRED);
        this.addTransition(id, stack[0], _StackController.FIRST);
      }
    });
  };
  /*****************************************************************
   *  Swipe
   ****************************************************************/
  setTactile_fn = function(v) {
    if (v && !__privateGet$5(this, _dragRecognizer)) {
      __privateSet$5(this, _dragRecognizer, new vs_ui.DragRecognizer(this));
      this.owner.addPointerRecognizer(__privateGet$5(this, _dragRecognizer));
    } else if (!v && __privateGet$5(this, _dragRecognizer)) {
      this.owner.removePointerRecognizer(__privateGet$5(this, _dragRecognizer));
      __privateSet$5(this, _dragRecognizer, void 0);
    }
  };
  _lastDelta = new WeakMap();
  __decorateElement$5(_init$5, 3, "isTactile", _isTactile_dec, _StackController);
  __decorateElement$5(_init$5, 3, "animationDuration", _animationDuration_dec$1, _StackController);
  __decorateElement$5(_init$5, 3, "viewSize", _viewSize_dec, _StackController);
  __decoratorMetadata$5(_init$5, _StackController);
  __publicField$6(_StackController, "NEXT", "next");
  __publicField$6(_StackController, "PRED", "pred");
  __publicField$6(_StackController, "FIRST", "first");
  __publicField$6(_StackController, "LAST", "last");
  /** the duration of the animation between two views, in ms */
  __publicField$6(_StackController, "ANIMATION_DURATION", 350);
  let StackController = _StackController;

  var __create$4 = Object.create;
  var __defProp$5 = Object.defineProperty;
  var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
  var __knownSymbol$4 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError$4 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart$4 = (base) => [, , , __create$4(base?.[__knownSymbol$4("metadata")] ?? null)];
  var __decoratorStrings$4 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn$4 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$4("Function expected") : fn;
  var __decoratorContext$4 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$4[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$4("Already initialized") : fns.push(__expectFn$4(fn || null)) });
  var __decoratorMetadata$4 = (array, target) => __defNormalProp$5(target, __knownSymbol$4("metadata"), array[3]);
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
    return desc && __defProp$5(target, name, desc), target;
  };
  var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
  var __privateGet$4 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$4 = (obj, member, value, setter) => (__accessCheck$4(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$2 = (obj, member, method) => (__accessCheck$4(obj, member, "access private method"), method);
  var _animationMode_dec, _orientation_dec$2, _a$4, _orientation$2, _animationMode, _SlideController_instances, translation_fn$2, _init$4;
  const _SlideController = class _SlideController extends (_a$4 = StackController, _orientation_dec$2 = [vs_core.InOut], _animationMode_dec = [vs_core.InOut], _a$4) {
    constructor(owner, options = {}) {
      super(owner, options);
      __runInitializers$4(_init$4, 5, this);
      __privateAdd$4(this, _SlideController_instances);
      __privateAdd$4(this, _orientation$2, _SlideController.HORIZONTAL);
      __privateAdd$4(this, _animationMode, _SlideController.PERCENTAGE);
      this.animationDuration = _SlideController.ANIMATION_DURATION;
    }
    get isHorizontal() {
      return __privateGet$4(this, _orientation$2) === _SlideController.HORIZONTAL;
    }
    layoutView(view, index, currentIndex) {
      place(view, `translate3d(${__privateMethod$2(this, _SlideController_instances, translation_fn$2).call(this, Math.sign(index - currentIndex))})`);
      if (index === currentIndex) view.show();
      else view.hide();
    }
    async stackAnimate(order, from, to, instant) {
      place(to, `translate3d(${__privateMethod$2(this, _SlideController_instances, translation_fn$2).call(this, order)})`);
      to.show();
      await Promise.all([
        this.animateView(to, [["translate", __privateMethod$2(this, _SlideController_instances, translation_fn$2).call(this, 0)]], instant),
        this.animateView(from, [["translate", __privateMethod$2(this, _SlideController_instances, translation_fn$2).call(this, -order)]], instant)
      ]);
      from.hide();
    }
    set orientation(v) {
      if (v !== _SlideController.HORIZONTAL && v !== _SlideController.VERTICAL) return;
      __privateSet$4(this, _orientation$2, v);
      this.updateViewSize();
    }
    get orientation() {
      return __privateGet$4(this, _orientation$2);
    }
    set animationMode(v) {
      if (v !== _SlideController.PERCENTAGE && v !== _SlideController.PIXEL) return;
      __privateSet$4(this, _animationMode, v);
      this.updateViewSize();
    }
    get animationMode() {
      return __privateGet$4(this, _animationMode);
    }
  };
  _init$4 = __decoratorStart$4(_a$4);
  _orientation$2 = new WeakMap();
  _animationMode = new WeakMap();
  _SlideController_instances = new WeakSet();
  /**
   * The translation of a view k pages away: 'x,y,0'
   */
  translation_fn$2 = function(k) {
    let offset;
    if (__privateGet$4(this, _animationMode) === _SlideController.PIXEL) {
      const [width, height] = this.pageSize;
      offset = `${k * (this.isHorizontal ? width : height)}px`;
    } else {
      offset = `${k * 100}%`;
    }
    return this.isHorizontal ? `${offset},0,0` : `0,${offset},0`;
  };
  __decorateElement$4(_init$4, 3, "orientation", _orientation_dec$2, _SlideController);
  __decorateElement$4(_init$4, 3, "animationMode", _animationMode_dec, _SlideController);
  __decoratorMetadata$4(_init$4, _SlideController);
  __publicField$5(_SlideController, "ANIMATION_DURATION", 300);
  __publicField$5(_SlideController, "HORIZONTAL", 0);
  __publicField$5(_SlideController, "VERTICAL", 1);
  /** the views slide by 100% of their size */
  __publicField$5(_SlideController, "PERCENTAGE", 0);
  /** @deprecated use PERCENTAGE */
  __publicField$5(_SlideController, "POURCENTAGE", 0);
  /** the views slide by the size of a page (viewSize), in px */
  __publicField$5(_SlideController, "PIXEL", 1);
  let SlideController = _SlideController;

  var __create$3 = Object.create;
  var __defProp$4 = Object.defineProperty;
  var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
  var __knownSymbol$3 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError$3 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart$3 = (base) => [, , , __create$3(base?.[__knownSymbol$3("metadata")] ?? null)];
  var __decoratorStrings$3 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn$3 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$3("Function expected") : fn;
  var __decoratorContext$3 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$3[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$3("Already initialized") : fns.push(__expectFn$3(fn || null)) });
  var __decoratorMetadata$3 = (array, target) => __defNormalProp$4(target, __knownSymbol$3("metadata"), array[3]);
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
    return desc && __defProp$4(target, name, desc), target;
  };
  var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
  var __privateGet$3 = (obj, member, getter) => (__accessCheck$3(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$3 = (obj, member, value, setter) => (__accessCheck$3(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$1 = (obj, member, method) => (__accessCheck$3(obj, member, "access private method"), method);
  var _direction_dec, _a$3, _direction, _dragged, _CardController_instances, outSign_get, translation_fn$1, _init$3;
  const _CardController = class _CardController extends (_a$3 = StackController, _direction_dec = [vs_core.InOut], _a$3) {
    constructor(owner, options = {}) {
      super(owner, options);
      __runInitializers$3(_init$3, 5, this);
      __privateAdd$3(this, _CardController_instances);
      __privateAdd$3(this, _direction, _CardController.RIGHT_OUT);
      /** the card which follows the pointer, and where it goes back */
      __privateAdd$3(this, _dragged);
      this.animationDuration = _CardController.ANIMATION_DURATION;
    }
    get isHorizontal() {
      return __privateGet$3(this, _direction) === _CardController.LEFT_OUT || __privateGet$3(this, _direction) === _CardController.RIGHT_OUT;
    }
    layoutView(view, index, currentIndex) {
      view.setStyle("z-index", index + 1);
      place(view, `translate3d(${__privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, index > currentIndex)})`);
      if (index === currentIndex) view.show();
      else view.hide();
    }
    async stackAnimate(order, from, to, instant) {
      to.show();
      if (order > 0) {
        if (!__privateGet$3(this, _dragged)) place(to, `translate3d(${__privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, true)})`);
        await this.animateView(to, [["translate", __privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, false)]], instant);
      } else {
        place(to, `translate3d(${__privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, false)})`);
        await this.animateView(from, [["translate", __privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, true)]], instant);
      }
      from.hide();
    }
    /*****************************************************************
     *  Swipe: the cards follow the pointer
     ****************************************************************/
    dragStart() {
      __privateSet$3(this, _dragged, void 0);
    }
    dragMove(dx, dy) {
      const delta = this.isHorizontal ? dx : dy;
      const index = this.currentIndex;
      if (delta * __privateGet$3(this, _CardController_instances, outSign_get) > 0) {
        const current = this.currentView, previous = this.viewAt(index - 1);
        if (!current || !previous) return;
        previous.show();
        place(current, `translate3d(${__privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, false, delta)})`);
        __privateSet$3(this, _dragged, { view: current, isNext: false });
      } else {
        const next = this.viewAt(index + 1);
        if (!next) return;
        next.show();
        place(next, `translate3d(${__privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, true, delta)})`);
        __privateSet$3(this, _dragged, { view: next, isNext: true });
      }
    }
    dragEnd(dx, dy) {
      const delta = (this.isHorizontal ? dx : dy) * __privateGet$3(this, _CardController_instances, outSign_get);
      let move = Promise.resolve(false);
      if (delta > SWIPE_THRESHOLD) move = this.goToPreviousView();
      else if (delta < -SWIPE_THRESHOLD) move = this.goToNextView();
      return move.then((moved) => {
        if (!moved) this.cancelDrag();
        __privateSet$3(this, _dragged, void 0);
        return moved;
      });
    }
    cancelDrag() {
      const dragged = __privateGet$3(this, _dragged);
      if (!dragged) return;
      const { view, isNext } = dragged;
      this.animateView(view, [["translate", __privateMethod$1(this, _CardController_instances, translation_fn$1).call(this, isNext)]], false).then(() => {
        if (isNext) view.hide();
        else this.viewAt(this.currentIndex - 1)?.hide();
      });
    }
    set direction(v) {
      if (v !== _CardController.LEFT_OUT && v !== _CardController.RIGHT_OUT && v !== _CardController.TOP_OUT && v !== _CardController.BOTTOM_OUT) return;
      __privateSet$3(this, _direction, v);
      this.updateViewSize();
    }
    get direction() {
      return __privateGet$3(this, _direction);
    }
  };
  _init$3 = __decoratorStart$3(_a$3);
  _direction = new WeakMap();
  _dragged = new WeakMap();
  _CardController_instances = new WeakSet();
  outSign_get = function() {
    return __privateGet$3(this, _direction) === _CardController.RIGHT_OUT || __privateGet$3(this, _direction) === _CardController.BOTTOM_OUT ? 1 : -1;
  };
  /**
   * The translation of a card: out of the owner, plus px pixels
   */
  translation_fn$1 = function(out, px = 0) {
    const offset = out ? px ? `calc(${__privateGet$3(this, _CardController_instances, outSign_get) * 100}% + ${px}px)` : `${__privateGet$3(this, _CardController_instances, outSign_get) * 100}%` : `${px}px`;
    return this.isHorizontal ? `${offset},0,0` : `0,${offset},0`;
  };
  __decorateElement$3(_init$3, 3, "direction", _direction_dec, _CardController);
  __decoratorMetadata$3(_init$3, _CardController);
  __publicField$4(_CardController, "ANIMATION_DURATION", 300);
  /** the cards leave to the left (and come from the left) */
  __publicField$4(_CardController, "LEFT_OUT", 0);
  __publicField$4(_CardController, "RIGHT_OUT", 1);
  __publicField$4(_CardController, "TOP_OUT", 2);
  __publicField$4(_CardController, "BOTTOM_OUT", 3);
  let CardController = _CardController;

  var __create$2 = Object.create;
  var __defProp$3 = Object.defineProperty;
  var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
  var __knownSymbol$2 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError$2 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart$2 = (base) => [, , , __create$2(base?.[__knownSymbol$2("metadata")] ?? null)];
  var __decoratorStrings$2 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn$2 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$2("Function expected") : fn;
  var __decoratorContext$2 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$2[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$2("Already initialized") : fns.push(__expectFn$2(fn || null)) });
  var __decoratorMetadata$2 = (array, target) => __defNormalProp$3(target, __knownSymbol$2("metadata"), array[3]);
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
    return desc && __defProp$3(target, name, desc), target;
  };
  var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
  var __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$2 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
  var _orientation_dec$1, _a$2, _orientation$1, _CubicController_instances, rotation_get, _init$2;
  const _CubicController = class _CubicController extends (_a$2 = StackController, _orientation_dec$1 = [vs_core.InOut], _a$2) {
    constructor(owner, options = {}) {
      super(owner, options);
      __runInitializers$2(_init$2, 5, this);
      __privateAdd$2(this, _CubicController_instances);
      __privateAdd$2(this, _orientation$1, _CubicController.HORIZONTAL);
      this.animationDuration = _CubicController.ANIMATION_DURATION;
      this.owner.setStyle("perspective", "1000px");
    }
    get isHorizontal() {
      return __privateGet$2(this, _orientation$1) === _CubicController.HORIZONTAL;
    }
    layoutView(view, index, currentIndex) {
      place(view, "");
      view.setStyle("transform-origin");
      if (index === currentIndex) view.show();
      else view.hide();
    }
    async stackAnimate(order, from, to, instant) {
      const [width, height] = this.pageSize;
      const origin = `50% 50% -${(this.isHorizontal ? width : height) / 2}px`;
      const angle = this.isHorizontal ? 90 * order : -90 * order;
      for (const view of [from, to]) view.setStyle("transform-origin", origin);
      place(to, `${__privateGet$2(this, _CubicController_instances, rotation_get)}(${angle}deg)`);
      to.show();
      await Promise.all([
        this.animateView(to, [[__privateGet$2(this, _CubicController_instances, rotation_get), "0deg"]], instant),
        this.animateView(from, [[__privateGet$2(this, _CubicController_instances, rotation_get), `${-angle}deg`]], instant)
      ]);
      from.hide();
      this.layoutView(from, 1, 0);
      this.layoutView(to, 0, 0);
    }
    set orientation(v) {
      if (v !== _CubicController.HORIZONTAL && v !== _CubicController.VERTICAL) return;
      __privateSet$2(this, _orientation$1, v);
    }
    get orientation() {
      return __privateGet$2(this, _orientation$1);
    }
  };
  _init$2 = __decoratorStart$2(_a$2);
  _orientation$1 = new WeakMap();
  _CubicController_instances = new WeakSet();
  rotation_get = function() {
    return this.isHorizontal ? "rotateY" : "rotateX";
  };
  __decorateElement$2(_init$2, 3, "orientation", _orientation_dec$1, _CubicController);
  __decoratorMetadata$2(_init$2, _CubicController);
  __publicField$3(_CubicController, "ANIMATION_DURATION", 500);
  __publicField$3(_CubicController, "HORIZONTAL", 0);
  __publicField$3(_CubicController, "VERTICAL", 1);
  let CubicController = _CubicController;

  var __defProp$2 = Object.defineProperty;
  var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, key + "" , value);
  const _OpacityController = class _OpacityController extends StackController {
    constructor(owner, options = {}) {
      super(owner, options);
      this.animationDuration = _OpacityController.ANIMATION_DURATION;
    }
    layoutView(view, index, currentIndex) {
      view.setStyle("opacity", 1);
      if (index === currentIndex) view.show();
      else view.hide();
    }
    async stackAnimate(_order, from, to, instant) {
      to.setStyle("opacity", 0);
      to.show();
      await Promise.all([
        this.animateView(to, [["opacity", "1"]], instant),
        this.animateView(from, [["opacity", "0"]], instant)
      ]);
      from.hide();
      from.setStyle("opacity", 1);
    }
  };
  __publicField$2(_OpacityController, "ANIMATION_DURATION", 500);
  let OpacityController = _OpacityController;

  var __create$1 = Object.create;
  var __defProp$1 = Object.defineProperty;
  var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
  var __knownSymbol$1 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError$1 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart$1 = (base) => [, , , __create$1(base?.[__knownSymbol$1("metadata")] ?? null)];
  var __decoratorStrings$1 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn$1 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$1("Function expected") : fn;
  var __decoratorContext$1 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$1[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$1("Already initialized") : fns.push(__expectFn$1(fn || null)) });
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
  var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
  var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck$1(obj, member, "access private method"), method);
  var _isContinuousSwipe_dec, _isCircular_dec, _orientation_dec, _a$1, _orientation, _isCircular, _isContinuousSwipe, _SwipeController_instances, page_get, translation_fn, neighbors_fn, _init$1;
  const _SwipeController = class _SwipeController extends (_a$1 = StackController, _orientation_dec = [vs_core.InOut], _isCircular_dec = [vs_core.InOut], _isContinuousSwipe_dec = [vs_core.InOut], _a$1) {
    constructor(owner, options = {}) {
      super(owner, options);
      __runInitializers$1(_init$1, 5, this);
      __privateAdd$1(this, _SwipeController_instances);
      __privateAdd$1(this, _orientation, _SwipeController.HORIZONTAL);
      __privateAdd$1(this, _isCircular, false);
      __privateAdd$1(this, _isContinuousSwipe, false);
      /*****************************************************************
       *  Swipe: the views follow the pointer (isContinuousSwipe)
       ****************************************************************/
      /** the views follow the pointer */
      __publicField$1(this, "isDragging", false);
      this.animationDuration = _SwipeController.ANIMATION_DURATION;
    }
    get isHorizontal() {
      return __privateGet$1(this, _orientation) === _SwipeController.HORIZONTAL;
    }
    layoutView(view, index, currentIndex) {
      place(view, `translate3d(${__privateMethod(this, _SwipeController_instances, translation_fn).call(this, (index - currentIndex) * __privateGet$1(this, _SwipeController_instances, page_get))})`);
      view.show();
    }
    async stackAnimate(order, from, to, instant) {
      const page = __privateGet$1(this, _SwipeController_instances, page_get);
      if (!this.isDragging) place(to, `translate3d(${__privateMethod(this, _SwipeController_instances, translation_fn).call(this, order * page)})`);
      to.show();
      await Promise.all([
        this.animateView(to, [["translate", __privateMethod(this, _SwipeController_instances, translation_fn).call(this, 0)]], instant),
        this.animateView(from, [["translate", __privateMethod(this, _SwipeController_instances, translation_fn).call(this, -order * page)]], instant)
      ]);
      this.updateViewSize();
    }
    goToNextView(options = {}) {
      if (__privateGet$1(this, _isCircular) && this.currentIndex === this.stack.length - 1) return this.moveTo(0, 1, options);
      return super.goToNextView(options);
    }
    goToPreviousView(options = {}) {
      if (__privateGet$1(this, _isCircular) && this.currentIndex === 0) return this.moveTo(this.stack.length - 1, -1, options);
      return super.goToPreviousView(options);
    }
    dragStart() {
      this.isDragging = false;
    }
    dragMove(dx, dy) {
      if (!__privateGet$1(this, _isContinuousSwipe)) return;
      this.isDragging = true;
      const delta = this.isHorizontal ? dx : dy, page = __privateGet$1(this, _SwipeController_instances, page_get);
      const [previous, next] = __privateMethod(this, _SwipeController_instances, neighbors_fn).call(this);
      const current = this.currentView;
      if (current) place(current, `translate3d(${__privateMethod(this, _SwipeController_instances, translation_fn).call(this, delta)})`);
      for (const [index, offset] of [[previous, -page], [next, page]]) {
        const view = this.viewAt(index);
        if (!view) continue;
        view.show();
        place(view, `translate3d(${__privateMethod(this, _SwipeController_instances, translation_fn).call(this, offset + delta)})`);
      }
    }
    dragEnd(dx, dy) {
      const delta = this.isHorizontal ? dx : dy;
      let move = Promise.resolve(false);
      if (delta > SWIPE_THRESHOLD) move = this.goToPreviousView();
      else if (delta < -SWIPE_THRESHOLD) move = this.goToNextView();
      return move.then((moved) => {
        if (!moved) this.cancelDrag();
        this.isDragging = false;
        return moved;
      });
    }
    cancelDrag() {
      if (!this.isDragging) return;
      const page = __privateGet$1(this, _SwipeController_instances, page_get);
      const [previous, next] = __privateMethod(this, _SwipeController_instances, neighbors_fn).call(this);
      const moves = [
        [this.currentView, 0],
        [this.viewAt(previous), -page],
        [this.viewAt(next), page]
      ];
      for (const [view, offset] of moves) {
        if (view) this.animateView(view, [["translate", __privateMethod(this, _SwipeController_instances, translation_fn).call(this, offset)]], false);
      }
    }
    set orientation(v) {
      if (v !== _SwipeController.HORIZONTAL && v !== _SwipeController.VERTICAL) return;
      __privateSet$1(this, _orientation, v);
      this.updateViewSize();
    }
    get orientation() {
      return __privateGet$1(this, _orientation);
    }
    set isCircular(v) {
      __privateSet$1(this, _isCircular, !!v);
    }
    get isCircular() {
      return __privateGet$1(this, _isCircular);
    }
    set isContinuousSwipe(v) {
      __privateSet$1(this, _isContinuousSwipe, !!v);
    }
    get isContinuousSwipe() {
      return __privateGet$1(this, _isContinuousSwipe);
    }
  };
  _init$1 = __decoratorStart$1(_a$1);
  _orientation = new WeakMap();
  _isCircular = new WeakMap();
  _isContinuousSwipe = new WeakMap();
  _SwipeController_instances = new WeakSet();
  page_get = function() {
    const [width, height] = this.pageSize;
    return this.isHorizontal ? width : height;
  };
  /** the translation of a view at the distance px: 'x,y,0' */
  translation_fn = function(px) {
    return this.isHorizontal ? `${px}px,0,0` : `0,${px}px,0`;
  };
  /** the neighbors of the current view: [previous, next], circular */
  neighbors_fn = function() {
    const index = this.currentIndex, count = this.stack.length;
    let previous = index - 1, next = index + 1;
    if (__privateGet$1(this, _isCircular) && count > 2) {
      previous = (index - 1 + count) % count;
      next = (index + 1) % count;
    }
    return [previous, next];
  };
  __decorateElement$1(_init$1, 3, "orientation", _orientation_dec, _SwipeController);
  __decorateElement$1(_init$1, 3, "isCircular", _isCircular_dec, _SwipeController);
  __decorateElement$1(_init$1, 3, "isContinuousSwipe", _isContinuousSwipe_dec, _SwipeController);
  __decoratorMetadata$1(_init$1, _SwipeController);
  __publicField$1(_SwipeController, "ANIMATION_DURATION", 300);
  __publicField$1(_SwipeController, "HORIZONTAL", 0);
  __publicField$1(_SwipeController, "VERTICAL", 1);
  let SwipeController = _SwipeController;

  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
  var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
  var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
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
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var _animationDuration_dec, _animationType_dec, _a, _navigationBar, _animationType, _animationDuration, _barStates, _init;
  const _NavigationController = class _NavigationController extends (_a = Controller, _animationType_dec = [vs_core.InOut], _animationDuration_dec = [vs_core.InOut], _a) {
    constructor(owner, options = {}) {
      super(owner, options);
      __runInitializers(_init, 5, this);
      __privateAdd(this, _navigationBar, null);
      __privateAdd(this, _animationType, _NavigationController.DEFAULT_ANIMATION);
      __privateAdd(this, _animationDuration, _NavigationController.ANIMATION_DURATION);
      /** the components of the navigation bar for each view, and their properties */
      __privateAdd(this, _barStates, /* @__PURE__ */ new Map());
      this.fsm.addInput(_NavigationController.BACK);
      this.navigationBar = options.navigationBar ?? null;
      if (options.animationType !== void 0) this.animationType = options.animationType;
    }
    /**
     *  Sets the components shown in the navigation bar for a view, and their
     *  properties
     */
    configureNavigationBarState(id, items) {
      if (!this.hasState(id) || !items) return;
      const components = [];
      const configuration = {};
      for (const item of items) {
        const comp = vs_utils.isString(item?.comp) ? vs_core.Component.instances.get(item.comp) : item?.comp;
        if (!(comp instanceof vs_ui.View)) continue;
        components.push(comp);
        if (item.properties) configuration[comp.id] = item.properties;
      }
      __privateGet(this, _barStates).set(id, { components, configuration });
      const bar = __privateGet(this, _navigationBar);
      if (!bar) return;
      bar.setStateItems(id, components);
      const current = this.currentState;
      if (current) bar.changeState(current, __privateGet(this, _barStates).get(current)?.configuration);
    }
    /**
     *  Adds the transition from a view to another on an input, and the
     *  transition back (NavigationController.BACK)
     */
    configureTransition(from, to, on) {
      this.addTransition(from, to, on);
      this.addTransition(to, from, _NavigationController.BACK);
    }
    willChangeState(_fromId, toId) {
      __privateGet(this, _navigationBar)?.changeState(toId, __privateGet(this, _barStates).get(toId)?.configuration);
    }
    /**
     * A new view waits on the right
     */
    configureNewComponent(view) {
      if (view === this.currentView) return;
      place(view, "translate3d(100%,0,0)");
      view.hide();
    }
    /**
     * The initial view, in place
     */
    set initialComponent(id) {
      super.initialComponent = id;
      const view = id ? this.getView(id) : void 0;
      if (view) place(view, "translate3d(0,0,0)");
    }
    get initialComponent() {
      return super.initialComponent;
    }
    /**
     * The animations: going forward, the new view comes from the right (and
     * the current view leaves to the left, SLIDE_ANIMATION); going back, the
     * current view leaves to the right
     */
    async transitionViews(from, to, context) {
      const back = context.on === _NavigationController.BACK;
      const slide = __privateGet(this, _animationType) === _NavigationController.SLIDE_ANIMATION;
      const duration = context.instant || __privateGet(this, _animationType) === _NavigationController.NO_ANIMATION ? 0 : __privateGet(this, _animationDuration);
      const move = (view, translation) => new vs_ui.Animation([["translate", translation]], { duration, additive: false }).start(view);
      if (back) {
        place(to, `translate3d(${slide ? "-100%" : "0"},0,0)`);
        to.show();
        await Promise.all([move(from, "100%,0,0"), slide ? move(to, "0,0,0") : void 0]);
      } else {
        place(to, "translate3d(100%,0,0)");
        to.show();
        await Promise.all([move(to, "0,0,0"), slide ? move(from, "-100%,0,0") : void 0]);
      }
      from.hide();
    }
    /**
     * The navigation bar configured for each view
     */
    set navigationBar(bar) {
      if (bar !== null && !(bar instanceof vs_ui.NavigationBar)) return;
      __privateSet(this, _navigationBar, bar);
      if (!bar) return;
      for (const [id, { components }] of __privateGet(this, _barStates)) bar.setStateItems(id, components);
      if (this.currentState) bar.changeState(this.currentState, __privateGet(this, _barStates).get(this.currentState)?.configuration);
    }
    get navigationBar() {
      return __privateGet(this, _navigationBar);
    }
    set animationType(v) {
      if (v !== _NavigationController.NO_ANIMATION && v !== _NavigationController.CARD_ANIMATION && v !== _NavigationController.SLIDE_ANIMATION) return;
      __privateSet(this, _animationType, v);
    }
    get animationType() {
      return __privateGet(this, _animationType);
    }
    set animationDuration(v) {
      if (!vs_utils.isNumber(v) || v < 0) return;
      __privateSet(this, _animationDuration, v);
    }
    get animationDuration() {
      return __privateGet(this, _animationDuration);
    }
  };
  _init = __decoratorStart(_a);
  _navigationBar = new WeakMap();
  _animationType = new WeakMap();
  _animationDuration = new WeakMap();
  _barStates = new WeakMap();
  __decorateElement(_init, 3, "animationType", _animationType_dec, _NavigationController);
  __decorateElement(_init, 3, "animationDuration", _animationDuration_dec, _NavigationController);
  __decoratorMetadata(_init, _NavigationController);
  /** no animation between the views */
  __publicField(_NavigationController, "NO_ANIMATION", 0);
  /** the new view comes over the current one */
  __publicField(_NavigationController, "CARD_ANIMATION", 1);
  /** the views slide (default) */
  __publicField(_NavigationController, "SLIDE_ANIMATION", 2);
  __publicField(_NavigationController, "DEFAULT_ANIMATION", _NavigationController.SLIDE_ANIMATION);
  /** the input going back to the previous view */
  __publicField(_NavigationController, "BACK", "back");
  __publicField(_NavigationController, "ANIMATION_DURATION", 300);
  let NavigationController = _NavigationController;

  exports.CardController = CardController;
  exports.Controller = Controller;
  exports.CubicController = CubicController;
  exports.NavigationController = NavigationController;
  exports.OpacityController = OpacityController;
  exports.SWIPE_THRESHOLD = SWIPE_THRESHOLD;
  exports.SlideController = SlideController;
  exports.StackController = StackController;
  exports.SwipeController = SwipeController;
  exports.runAnimation = runAnimation;

}));
//# sourceMappingURL=vs_fx.amd.js.map
