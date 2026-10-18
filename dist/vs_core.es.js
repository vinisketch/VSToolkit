import { isFunction, isString, defined, injectionToken, asError, container, isObject, Mixin, isNotEmpty, applyMixins, SupportMixins, createUniqueId, toJSON, parseJSON, isArray } from 'vs_utils';

var __typeError$9 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$9 = (obj, member, msg) => member.has(obj) || __typeError$9("Cannot " + msg);
var __privateGet$8 = (obj, member, getter) => (__accessCheck$9(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$9 = (obj, member, value) => member.has(obj) ? __typeError$9("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$5 = (obj, member, value, setter) => (__accessCheck$9(obj, member, "write to private field"), member.set(obj, value), value);
var _pool, _funcName, _funcPtr, _obj;
const _Handler = class _Handler {
  constructor() {
    __privateAdd$9(this, _funcName);
    __privateAdd$9(this, _funcPtr);
    __privateAdd$9(this, _obj);
  }
  get func() {
    return __privateGet$8(this, _funcPtr) || __privateGet$8(this, _funcName);
  }
  get obj() {
    return __privateGet$8(this, _obj);
  }
  configure(obj, func) {
    __privateSet$5(this, _obj, obj);
    if (isFunction(func)) {
      __privateSet$5(this, _funcPtr, func);
    } else if (isString(func)) {
      __privateSet$5(this, _funcName, func);
    }
  }
  static retain() {
    if (__privateGet$8(_Handler, _pool).length > 0) {
      return __privateGet$8(_Handler, _pool).pop();
    }
    return new _Handler();
  }
  static release(handler) {
    __privateSet$5(handler, _obj, void 0);
    __privateSet$5(handler, _funcName, void 0);
    __privateSet$5(handler, _funcPtr, void 0);
    __privateGet$8(_Handler, _pool).push(handler);
  }
};
_pool = new WeakMap();
_funcName = new WeakMap();
_funcPtr = new WeakMap();
_obj = new WeakMap();
__privateAdd$9(_Handler, _pool, []);
let Handler = _Handler;

var __defProp$4 = Object.defineProperty;
var __typeError$8 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$8 = (obj, member, msg) => member.has(obj) || __typeError$8("Cannot " + msg);
var __privateGet$7 = (obj, member, getter) => (__accessCheck$8(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$8 = (obj, member, value) => member.has(obj) ? __typeError$8("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$4 = (obj, member, value, setter) => (__accessCheck$8(obj, member, "write to private field"), member.set(obj, value), value);
var _type;
const _Event = class _Event {
  constructor() {
    /**
     * The event spec. For instance 'click' for a mouse click event.
     */
    __privateAdd$8(this, _type);
    /**
     * The optional data associated to the event.
     */
    __publicField$4(this, "data");
    /**
     * The component which produce the event
     */
    __publicField$4(this, "src");
    /**
     * [Deprecated] The component which produce the event. <br>
     * In case of DOM event, the Event is mapped to the DOM event. Then
     * the developer has access to srcTarget (and many other data).
     * @deprecated
     */
    __publicField$4(this, "srcTarget");
  }
  get type() {
    return __privateGet$7(this, _type);
  }
  /**
   * @param {string} type the event type [mandatory]
   * @param {Object} data complementary event data [optional]
   */
  configure(type, data) {
    __privateSet$4(this, _type, type);
    this.data = data;
  }
  static retain() {
    if (this.eventPool.length > 0) {
      return this.eventPool.pop();
    }
    return new _Event();
  }
  static release(event) {
    __privateSet$4(event, _type, void 0);
    event.data = void 0;
    event.src = void 0;
    event.srcTarget = void 0;
    this.eventPool.push(event);
  }
};
_type = new WeakMap();
__publicField$4(_Event, "eventPool", []);
let Event = _Event;

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
const _Action = class _Action {
  constructor() {
    __publicField$3(this, "func");
    __publicField$3(this, "ctx");
    /**
     * Run the action. This method is called with our setImmediate
     * implementation
     */
    __publicField$3(this, "run", () => this.func?.call(this.ctx));
  }
  configure(func, ctx) {
    this.func = func;
    this.ctx = ctx;
  }
  static retain() {
    if (_Action.pool.length > 0) {
      return defined(_Action.pool.pop());
    }
    return new _Action();
  }
  static release(action) {
    action.func = void 0;
    action.ctx = void 0;
    _Action.pool.push(action);
  }
};
__publicField$3(_Action, "pool", []);
let Action = _Action;

const LOGGER = injectionToken("LOGGER");

let mainActionsQueue = [];
let tmpActionsQueue = [];
let scheduleDoActions;
let areActionsScheduled = false;
let _logger$1 = null;
const getLogger$1 = () => {
  _logger$1 = _logger$1 ?? container.get(LOGGER);
  return _logger$1;
};
function queueAction(func, ctx) {
  const action = Action.retain();
  action.configure(func, ctx);
  mainActionsQueue.push(action);
  if (!areActionsScheduled) {
    areActionsScheduled = true;
    scheduleDoActions();
  }
}
function doAllActions() {
  const queue = mainActionsQueue;
  const logger = getLogger$1();
  areActionsScheduled = false;
  if (queue.length) {
    mainActionsQueue = tmpActionsQueue;
    tmpActionsQueue = queue;
    let i = 0;
    const l = queue.length;
    for (; i < l; i++) {
      const action = queue[i];
      try {
        action.run();
      } catch (e) {
        const err = asError(e);
        if (err.stack) logger.error(err.stack);
        else logger.error(e);
      } finally {
        Action.release(action);
      }
    }
    queue.length = 0;
  }
}
function installPostMessageImplementation() {
  const MESSAGE_PREFIX = `_scheduler_${Date.now()}_${Math.random()}`;
  function onGlobalMessage(event) {
    if (event.origin !== globalThis.location.origin) {
      return;
    }
    if (event.data === MESSAGE_PREFIX) {
      doAllActions();
    }
  }
  if (globalThis.addEventListener) {
    globalThis.addEventListener("message", onGlobalMessage, false);
  }
  return () => globalThis.postMessage(MESSAGE_PREFIX, globalThis.location.origin);
}
function initSetImmediatePolyfill() {
  scheduleDoActions = installPostMessageImplementation();
  return queueAction;
}
function runImmediatePolyfill() {
  if (mainActionsQueue.length) scheduleDoActions();
}

let _logger = null;
const getLogger = () => {
  _logger = _logger ?? container.get(LOGGER);
  return _logger;
};
const asyncEventsQueue = [];
let isAsyncEventsPropagating = false;
let isSyncEventsPropagating = false;
let isWaiting = false;
const loopSetImmediate = typeof setImmediate !== "undefined" ? setImmediate : typeof window !== "undefined" && window.setImmediate ? window.setImmediate.bind(window) : initSetImmediatePolyfill();
function doOneEvent(burst, isSynchro) {
  const { handlerList } = burst;
  const len = handlerList.length;
  let l = len;
  const event = burst.event;
  const logger = getLogger();
  isAsyncEventsPropagating = true;
  function endPropagation() {
    l--;
    if (l <= 0) {
      isAsyncEventsPropagating = false;
    }
  }
  function doOneHandler(handler) {
    if (handler) {
      try {
        if (isFunction(handler)) {
          handler(event);
        } else if (isFunction(handler.handleEvent)) {
          handler.handleEvent.call(handler, event);
        }
      } catch (e) {
        if (e.stack) logger.error(e.stack);
        else logger.error(e);
      }
    }
    endPropagation();
  }
  if (len === 0) endPropagation();
  for (let i = 0; i < len; i++) {
    {
      ((handler) => loopSetImmediate(() => doOneHandler(handler)))(handlerList[i]);
    }
  }
}
function doOneAsyncEvent() {
  if (isAsyncEventsPropagating || isSyncEventsPropagating || asyncEventsQueue.length === 0) return;
  doOneEvent(asyncEventsQueue.shift());
}
function serviceLoop() {
  if (isWaiting) return;
  function loop() {
    isWaiting = false;
    serviceLoop();
  }
  if (isAsyncEventsPropagating || isSyncEventsPropagating) {
    loopSetImmediate(loop);
    return;
  }
  runImmediatePolyfill();
  if (asyncEventsQueue.length) doOneAsyncEvent();
}
function queueProcAsyncEvent(event, handlerList) {
  const burst = {
    handlerList,
    event
  };
  asyncEventsQueue.push(burst);
  serviceLoop();
}

var __typeError$7 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$7 = (obj, member, msg) => member.has(obj) || __typeError$7("Cannot " + msg);
var __privateGet$6 = (obj, member, getter) => (__accessCheck$7(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$7 = (obj, member, value) => member.has(obj) ? __typeError$7("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _children;
const childToParent = /* @__PURE__ */ new WeakMap();
class Container {
  constructor() {
    __privateAdd$7(this, _children, []);
  }
  static getParent(comp) {
    return childToParent.get(comp);
  }
  destructor() {
    this.removeAllChildren();
  }
  /**
   *  Return true if the set component is a child of the current component
   *
   * @param {Component} child The component to be removed.
   * @return {boolean}
   */
  isChild(child) {
    return __privateGet$6(this, _children).includes(child);
  }
  /**
   *  Add the specified child component to this component.
   *  <p>
   *  The component can be a graphic component (vs.ui.Group) or
   *  a non graphic component (View).
   *  In case of vs.ui.Group its mandatory to set the extension.
   *  <p>
   *  The add is a lazy add! The child's view can be already in
   *  the HTML DOM. In that case, the add method do not modify the DOM.
   *  <p>
   *  @example
   *  var myButton = new Button (conf);
   *  myObject.add (myButton, 'children');
   *
   */
  add(child) {
    if (childToParent.has(child)) {
      throw new Error("Component is already a child of another Container");
    }
    __privateGet$6(this, _children).push(child);
    childToParent.set(child, this);
  }
  /**
   *  Remove the specified child component from this component.
   *
   *  @example
   *  myObject.remove (myButton);
   *
   *
   * @param {Component} child The component to be removed.
   */
  remove(child) {
    const idx = __privateGet$6(this, _children).indexOf(child);
    if (idx === -1) {
      throw new Error("Not a child of this component");
    }
    __privateGet$6(this, _children).splice(idx, 1);
    childToParent.delete(child);
  }
  /**
   *  Remove all children components from this component
   *
   *  @example
   *  myObject.removeAllChildren ();
   *
   */
  removeAllChildren() {
    __privateGet$6(this, _children).forEach((child) => childToParent.delete(child));
    __privateGet$6(this, _children).length = 0;
  }
}
_children = new WeakMap();
function isContainer(obj) {
  if (obj instanceof Container) return true;
  return isObject(obj) && "add" in obj && "remove" in obj && "isChild" in obj;
}

var __typeError$6 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$6 = (obj, member, msg) => member.has(obj) || __typeError$6("Cannot " + msg);
var __privateGet$5 = (obj, member, getter) => (__accessCheck$6(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$6 = (obj, member, value) => member.has(obj) ? __typeError$6("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _bindings;
function isEventSource(obj) {
  return isObject(obj) && "dispatchEvent" in obj && "bind" in obj && "unbind" in obj && "addEventListener" in obj && "removeEventListener" in obj;
}
class EventSource extends Mixin {
  constructor() {
    super(...arguments);
    __privateAdd$6(this, _bindings, /* @__PURE__ */ new Map());
  }
  initMixin() {
  }
  releaseMixin() {
    super.releaseMixin();
    for (const [spec, handlerList] of __privateGet$5(this, _bindings).entries()) {
      handlerList.forEach((handler) => Handler.release(handler));
      handlerList.length = 0;
      __privateGet$5(this, _bindings).delete(spec);
    }
  }
  bind(spec, obj, func) {
    if (!spec || !obj) return;
    let handlerList = __privateGet$5(this, _bindings).get(spec);
    if (!handlerList) {
      handlerList = [];
      __privateGet$5(this, _bindings).set(spec, handlerList);
    }
    const handler = Handler.retain();
    handler.configure(obj, func);
    handlerList.push(handler);
  }
  /**
   *  The EventSource.addEventListener() method registers the specified
   *  listener on the EventSource it's called on. The event target may be any
   *  GL object that supports events
   *
   * @param {string} type the event specification [mandatory]
   * @param {HandlerFunction} handler the object interested to catch the event [mandatory]
   */
  addEventListener(type, func) {
    let handlerList = __privateGet$5(this, _bindings).get(type);
    if (!handlerList) {
      handlerList = [];
      __privateGet$5(this, _bindings).set(type, handlerList);
    }
    const handler = Handler.retain();
    handler.configure(void 0, func);
    handlerList.push(handler);
  }
  /**
   *  Removes the event listener previously registered with
   *  EventSource.addEventListener.
   *
   * @param {string} type the event specification [mandatory]
   * @param {Object} handler the object interested to catch the event [mandatory]
   * @param {Boolean} useCapture If true, useCapture indicates that the user
   *          wishes to initiate captured [optional]
   */
  removeEventListener(type, func) {
    if (!__privateGet$5(this, _bindings).has(type)) return;
    function unbind(handlerList) {
      const idx = handlerList.findIndex((handler) => handler.func === func);
      if (idx !== -1) {
        const handlers = handlerList.splice(idx, 1);
        handlers.forEach((handle) => Handler.release(handle));
      }
    }
    unbind(__privateGet$5(this, _bindings).get(type));
  }
  /**
   *  The event unbind method
   *  <p>
   *  Should be call when you want stop event listening on this object
   *
   * @name core.EventSource#unbind
   * @function
   *
   * @param {string} spec the event specification [mandatory]
   * @param {core.Object} obj the object you want to unbind [mandatory]
   * @param {string} func the name of a callback. If it's not defined
   *        all binding with <spec, obj> will be removed
   */
  unbind(spec, obj, func) {
    if (!__privateGet$5(this, _bindings).has(spec)) return;
    function unbind(handlerList) {
      const idx = handlerList.findIndex((handler) => handler.func === func && handler.obj === obj);
      if (idx !== -1) {
        const handlers = handlerList.splice(idx, 1);
        handlers.forEach((handle) => Handler.release(handle));
      }
    }
    unbind(__privateGet$5(this, _bindings).get(spec));
  }
  /**
   *  Dispatches an Event at the specified EventSource, invoking the affected
   *  EventListeners in the appropriate order.
   */
  dispatchEvent(event) {
    if (!event.type) return false;
    const handlerList = __privateGet$5(this, _bindings).get(event.type);
    if (isNotEmpty(handlerList)) {
      event.src = this;
      event.srcTarget = this;
      queueProcAsyncEvent(event, handlerList);
    } else {
      if (isContainer(this)) {
        const parent = Container.getParent(this);
        if (isEventSource(parent)) {
          parent.dispatchEvent(event);
        }
      }
    }
    return true;
  }
}
_bindings = new WeakMap();

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Event: Event,
  EventSource: EventSource,
  Handler: Handler
});

var __defProp$2 = Object.defineProperty;
var __typeError$5 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
var __privateGet$4 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), member.get(obj));
var __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$3 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
var _state$1, _deleted, _initFunctions;
const _Component = class _Component extends SupportMixins {
  constructor(id) {
    super();
    __privateAdd$5(this, _state$1, "non-initialized");
    __privateAdd$5(this, _deleted, false);
    __privateAdd$5(this, _initFunctions, /* @__PURE__ */ new Set());
    __publicField$2(this, "id");
    this.id = id ?? createUniqueId();
    _Component.instances[this.id] = this;
  }
  /**
   *  Object default init. <p>
   *
   *  @example
   *  myObject = new core.Object (core.createId ());
   *  myObject.init ();
   *  @return {Object} this
   */
  init() {
    if (__privateGet$4(this, _state$1) !== "non-initialized") {
      throw new Error("impossible to re-initialise a component");
    }
    try {
      this.initComponent();
      __privateGet$4(this, _initFunctions).forEach((func) => func());
      __privateSet$3(this, _state$1, "initialized");
      this.componentDidInitialize();
    } catch (e) {
      throw new Error("Component init failed with the error: " + e, { cause: e });
    }
    return this;
  }
  // eslint-disable-next-line class-methods-use-this
  initComponent() {
  }
  // eslint-disable-next-line class-methods-use-this
  componentDidInitialize() {
  }
  destructor() {
    delete _Component.instances[this.id];
    __privateSet$3(this, _state$1, "deleted");
  }
  isDeleted() {
    return __privateGet$4(this, _state$1) === "deleted";
  }
  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   *
   * @return {Object} the object value for stringify
   */
  toJSON() {
    return toJSON(this.serialize());
  }
  /**
   *  Set objet's properties from JSON stringification.<p/>
   *  This can be used when retrieve data from serialization.
   *
   * @param {String} json The JSON String
   */
  parseJSON(json) {
    try {
      const rawData = parseJSON(json);
      this.deserialize(rawData);
    } catch (e) {
      throw new Error("parseJSON failed with error: " + e);
    }
  }
  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   */
  serialize() {
    return { id: this.id };
  }
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  deserialize(data) {
  }
};
_state$1 = new WeakMap();
_deleted = new WeakMap();
_initFunctions = new WeakMap();
__publicField$2(_Component, "instances", {});
let Component = _Component;
applyMixins(Component, [EventSource]);

var TaskState = /* @__PURE__ */ ((TaskState2) => {
  TaskState2[TaskState2["STARTED"] = 1] = "STARTED";
  TaskState2[TaskState2["STOPPED"] = 0] = "STOPPED";
  TaskState2[TaskState2["PAUSED"] = 2] = "PAUSED";
  return TaskState2;
})(TaskState || {});

var __defProp$1 = Object.defineProperty;
var __typeError$4 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, key + "" , value);
var __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
var __privateGet$3 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$2 = (obj, member, value, setter) => (__accessCheck$4(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$3 = (obj, member, method) => (__accessCheck$4(obj, member, "access private method"), method);
var _signal, _onAbort, _state, _run, _Task_instances, createRun_fn, settleRun_fn;
const taskGroups = /* @__PURE__ */ new WeakMap();
function attachToGroup(task, group) {
  let groups = taskGroups.get(task);
  if (!groups) {
    groups = /* @__PURE__ */ new Set();
    taskGroups.set(task, groups);
  }
  groups.add(group);
}
function detachFromGroup(task, group) {
  taskGroups.get(task)?.delete(group);
}
class Task extends Component {
  constructor({ delegate, signal } = {}) {
    super();
    __privateAdd$4(this, _Task_instances);
    /**
     *  @private
     */
    __privateAdd$4(this, _signal);
    /**
     *  @private
     */
    __privateAdd$4(this, _onAbort, () => {
      this.stop();
    });
    /********************************************************************
    
       ********************************************************************/
    /**
     * TaskDelegate.
     * Methods are called when state changes (stop | pause)
     *
     *  <p>
     *  @example
     *  const delegate = {};
     *  delegate.taskDidEnd = function () { ... }
     *
     *  // Declare a PAR task including a SEC Task
     *  const task = new Task (...)
     *  task.delegate = delegate;
     *  task.start ();
     *
     * @name core.Task#delegate
     *
     * @property {object}
     */
    __publicField$1(this, "delegate");
    /********************************************************************
     States
     ********************************************************************/
    /**
     *	@private
     */
    __privateAdd$4(this, _state, TaskState.STOPPED);
    /**
     *  The current run, from start() until the task ends or is stopped
     *  @private
     */
    __privateAdd$4(this, _run);
    this.delegate = delegate;
    if (signal) {
      __privateSet$2(this, _signal, signal);
      signal.addEventListener("abort", __privateGet$3(this, _onAbort), { once: true });
    }
  }
  /**
   *  Return the task State. <br />
   *  Possible values: {@link core.Task.STARTED},
   *  {@link core.Task.STOPPED},
   *  {@link core.Task.PAUSED}
   */
  get state() {
    return __privateGet$3(this, _state);
  }
  set state(state) {
    __privateSet$2(this, _state, state);
  }
  /********************************************************************
  
     ********************************************************************/
  /**
   *  Default task destructor
   *
   * @name core.Task#destructor
   * @function
   */
  destructor() {
    __privateGet$3(this, _signal)?.removeEventListener("abort", __privateGet$3(this, _onAbort));
    this.stop();
    super.destructor();
  }
  /**
   *  Notifies the task's delegate and groups of a state change.
   *  An exception thrown by a callback is logged and does not propagate.
   *
   * @name core.Task#notify
   * @function
   * @protected
   */
  notify(method) {
    if (method === "taskDidEnd") __privateMethod$3(this, _Task_instances, settleRun_fn).call(this, "ended");
    else if (method === "taskDidStop") __privateMethod$3(this, _Task_instances, settleRun_fn).call(this, "stopped");
    const listeners = [this.delegate, ...taskGroups.get(this) ?? []];
    for (const listener of listeners) {
      const callback = listener?.[method];
      if (!callback) continue;
      try {
        callback.call(listener, this);
      } catch (e) {
        const err = asError(e);
        if (err.stack) console.log(err.stack);
        console.error(err);
      }
    }
  }
  // /**
  //  * @name core.Task#_clone
  //  * @function
  //  * @private
  //  *
  //  * @param {vs.VSObject} obj The cloned object
  //  * @param {Object} map Map of cloned objects
  //  */
  // override _clone (obj, cloned_map)
  // {
  //   super(obj, cloned_map);
  //
  //   obj.#state = this.#state;
  // }
  /**
   *  Starts the task, or resumes it when paused.<br />
   *  Returns a promise resolved when this run finishes, with 'ended' when the
   *  task reached its end or 'stopped' when it was stopped before. It stays
   *  pending while the task is paused.<br />
   *  When the task is already started, it is not restarted (param is
   *  ignored) and the promise of the current run is returned.
   *
   *  When the task abort signal (see TaskOptions) is aborted, the task is
   *  not started and the promise is resolved with 'stopped'.
   *
   *  @example
   *  const result = await seq([fadeOut, new Wait(200), fadeIn]).start(view);
   *
   *  // aborting the signal has the same effect as calling stop()
   *  const controller = new AbortController();
   *  par([rotate, scale], { signal: controller.signal }).start(view);
   *  controller.abort();
   *
   * @name core.Task#start
   * @function
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @return {Promise<TaskResult>}
   */
  start(param) {
    if (__privateGet$3(this, _signal)?.aborted) {
      return Promise.resolve("stopped");
    }
    const run = __privateGet$3(this, _run) ?? __privateMethod$3(this, _Task_instances, createRun_fn).call(this);
    if (this.state !== TaskState.STARTED && !this.doStart(param) && this.state === TaskState.STOPPED) {
      __privateMethod$3(this, _Task_instances, settleRun_fn).call(this, "ended");
    }
    return run.promise;
  }
}
_signal = new WeakMap();
_onAbort = new WeakMap();
_state = new WeakMap();
_run = new WeakMap();
_Task_instances = new WeakSet();
createRun_fn = function() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  __privateSet$2(this, _run, { promise, resolve });
  return __privateGet$3(this, _run);
};
settleRun_fn = function(result) {
  const run = __privateGet$3(this, _run);
  if (!run) return;
  __privateSet$2(this, _run, void 0);
  run.resolve(result);
};

var __defProp = Object.defineProperty;
var __typeError$3 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
var __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
var __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod$2 = (obj, member, method) => (__accessCheck$3(obj, member, "access private method"), method);
var _BaseTask_instances, detachAll_fn;
class BaseTask extends Task {
  constructor(tasksAndParams, options) {
    super(options);
    __privateAdd$3(this, _BaseTask_instances);
    /********************************************************************
    
       ********************************************************************/
    /**
     *  Tasks with their own optional parameter (undefined when none)
     *  @private
     */
    __publicField(this, "tasksAndParams", []);
    if (tasksAndParams && tasksAndParams.length) {
      this.setTasks(tasksAndParams);
    }
  }
  /**
   *  Returns the parameter to start a task with: its own parameter if it
   *  has one, the group parameter otherwise.
   *  @protected
   */
  paramFor([, ownParam], groupParam) {
    return ownParam ?? groupParam;
  }
  /**
   *  Set tasks.
   *  The task has to be stopped
   *
   * @name core.task.BaseTask#setTasks
   * @function
   *
   * @param tasksAndParams list of tasks, each one optionally with its own
   *        parameter: task | [task] | [task, param]
   */
  setTasks(tasksAndParams) {
    if (this.state !== TaskState.STOPPED) {
      return false;
    }
    __privateMethod$2(this, _BaseTask_instances, detachAll_fn).call(this);
    for (let taskAndParam of tasksAndParams) {
      if (!taskAndParam) {
        continue;
      }
      let task;
      let param;
      if (isArray(taskAndParam)) {
        const entry = taskAndParam;
        if (entry.length !== 1 && entry.length !== 2) {
          console.warn(`Invalid task entry: expected [task] or [task, param], got ${entry.length} items`);
          continue;
        }
        [task, param] = taskAndParam;
      } else {
        task = taskAndParam;
      }
      if (!task) {
        console.warn("Undefined task");
        continue;
      }
      if (!task.start || !task.stop || !task.pause) {
        console.warn("Invalid task: " + task.toString());
        continue;
      }
      attachToGroup(task, this);
      this.tasksAndParams.push([task, param]);
    }
    return true;
  }
  /**
   *  Stops the group and releases its tasks
   *  @protected
   */
  destructor() {
    super.destructor();
    __privateMethod$2(this, _BaseTask_instances, detachAll_fn).call(this);
  }
}
_BaseTask_instances = new WeakSet();
detachAll_fn = function() {
  this.tasksAndParams.forEach(([task]) => detachFromGroup(task, this));
  this.tasksAndParams.length = 0;
};

var __typeError$2 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
var __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), member.get(obj));
var __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod$1 = (obj, member, method) => (__accessCheck$2(obj, member, "access private method"), method);
var _currentTask, _startParam, _SEQ_instances, startTask_fn, isCurrent_fn;
const seq = (params, options) => new SEQ(params, options);
class SEQ extends BaseTask {
  constructor() {
    super(...arguments);
    __privateAdd$2(this, _SEQ_instances);
    /********************************************************************
    
       ********************************************************************/
    /**
     *  Index of the running (or paused) task, -1 when the sequence is stopped
     *  @private
     */
    __privateAdd$2(this, _currentTask, -1);
    /**
     *  @private
     */
    __privateAdd$2(this, _startParam);
  }
  /********************************************************************
  
     ********************************************************************/
  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  doStart(param) {
    if (this.state === TaskState.STARTED) {
      return false;
    }
    const index = this.state === TaskState.PAUSED ? __privateGet$2(this, _currentTask) : 0;
    return __privateMethod$1(this, _SEQ_instances, startTask_fn).call(this, index, param);
  }
  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop() {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.state = TaskState.STOPPED;
    const taskAndParams = this.tasksAndParams[__privateGet$2(this, _currentTask)];
    __privateSet$1(this, _currentTask, -1);
    taskAndParams?.[0].stop();
    this.notify("taskDidStop");
    return true;
  }
  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause() {
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.state = TaskState.PAUSED;
    this.tasksAndParams[__privateGet$2(this, _currentTask)]?.[0].pause();
    this.notify("taskDidPause");
    return true;
  }
  /********************************************************************
   delegate methods
   ********************************************************************/
  /**
   *  The running task was stopped by someone else than this sequence
   */
  taskDidStop(task) {
    if (this.state === TaskState.STOPPED || !__privateMethod$1(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
    this.state = TaskState.STOPPED;
    __privateSet$1(this, _currentTask, -1);
    this.notify("taskDidStop");
  }
  /**
   *  The running task was paused by someone else than this sequence
   */
  taskDidPause(task) {
    if (this.state !== TaskState.STARTED || !__privateMethod$1(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
    this.state = TaskState.PAUSED;
    this.notify("taskDidPause");
  }
  /**
   */
  taskDidEnd(task) {
    if (this.state !== TaskState.STARTED || !__privateMethod$1(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
    if (__privateGet$2(this, _currentTask) + 1 < this.tasksAndParams.length) {
      __privateMethod$1(this, _SEQ_instances, startTask_fn).call(this, __privateGet$2(this, _currentTask) + 1, __privateGet$2(this, _startParam));
    } else {
      __privateSet$1(this, _currentTask, -1);
      this.state = TaskState.STOPPED;
      this.notify("taskDidEnd");
    }
  }
}
_currentTask = new WeakMap();
_startParam = new WeakMap();
_SEQ_instances = new WeakSet();
/**
 *  @private
 */
startTask_fn = function(index, param) {
  const taskAndParams = this.tasksAndParams[index];
  if (!taskAndParams) {
    __privateSet$1(this, _currentTask, -1);
    this.state = TaskState.STOPPED;
    return false;
  }
  const isGroupStart = this.state !== TaskState.STARTED;
  __privateSet$1(this, _currentTask, index);
  this.state = TaskState.STARTED;
  __privateSet$1(this, _startParam, param);
  taskAndParams[0].start(this.paramFor(taskAndParams, param));
  if (isGroupStart) this.notify("taskDidStart");
  return true;
};
/**
 *  Callbacks from tasks this sequence is not running are ignored (a task
 *  may belong to several groups)
 *  @private
 */
isCurrent_fn = function(task) {
  return this.tasksAndParams[__privateGet$2(this, _currentTask)]?.[0] === task;
};

var __typeError$1 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _runningTasks;
const par = (params, options) => new PAR(params, options);
class PAR extends BaseTask {
  constructor() {
    super(...arguments);
    /**
     * Tasks started and not yet ended (running or paused)
     *  @private
     */
    __privateAdd$1(this, _runningTasks, /* @__PURE__ */ new Set());
  }
  /**
   *  Starts the task
   *
   * @name task.PAR#start
   * @function
   * @ignore
   * @param {any} param any parameter (scalar, Array, Object)
   */
  doStart(param) {
    if (this.state === TaskState.STARTED) {
      return false;
    }
    if (this.state !== TaskState.PAUSED) {
      __privateGet$1(this, _runningTasks).clear();
      this.tasksAndParams.forEach(([task]) => __privateGet$1(this, _runningTasks).add(task));
    }
    if (__privateGet$1(this, _runningTasks).size === 0) {
      this.state = TaskState.STOPPED;
      return false;
    }
    this.state = TaskState.STARTED;
    for (let taskAndParams of this.tasksAndParams) {
      if (!__privateGet$1(this, _runningTasks).has(taskAndParams[0])) continue;
      taskAndParams[0].start(this.paramFor(taskAndParams, param));
    }
    this.notify("taskDidStart");
    return true;
  }
  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @function
   * @ignore
   */
  stop() {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.state = TaskState.STOPPED;
    const tasks = [...__privateGet$1(this, _runningTasks)];
    __privateGet$1(this, _runningTasks).clear();
    tasks.forEach((task) => task.stop());
    this.notify("taskDidStop");
    return true;
  }
  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls the taskDidPause if it exits.
   *  @ignore
   * @function
   */
  pause() {
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.state = TaskState.PAUSED;
    __privateGet$1(this, _runningTasks).forEach((task) => task.pause());
    this.notify("taskDidPause");
    return true;
  }
  /********************************************************************
   delegate methods
   ********************************************************************/
  /**
   *  A task was stopped by someone else than this group: it will not end,
   *  so the group stops when no other task is running.
   */
  taskDidStop(task) {
    if (this.state === TaskState.STOPPED || !__privateGet$1(this, _runningTasks).has(task)) return;
    __privateGet$1(this, _runningTasks).delete(task);
    if (__privateGet$1(this, _runningTasks).size === 0) {
      this.state = TaskState.STOPPED;
      this.notify("taskDidStop");
    }
  }
  /**
   *  A task was paused by someone else than this group: the group keeps
   *  running and waits for the task to be resumed.
   */
  taskDidPause(_task) {
  }
  /**
   */
  taskDidEnd(task) {
    if (this.state === TaskState.STOPPED || !__privateGet$1(this, _runningTasks).has(task)) return;
    __privateGet$1(this, _runningTasks).delete(task);
    if (this.state === TaskState.STARTED && __privateGet$1(this, _runningTasks).size === 0) {
      this.state = TaskState.STOPPED;
      this.notify("taskDidEnd");
    }
  }
}
_runningTasks = new WeakMap();

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _time, _leftTime, _timer, _startTime, _Wait_static, checkTime_fn;
const _Wait = class _Wait extends Task {
  constructor(time, options) {
    var _a;
    super(options);
    /********************************************************************
    
       ********************************************************************/
    __privateAdd(this, _time, 0);
    __privateAdd(this, _leftTime, 0);
    __privateAdd(this, _timer, null);
    __privateAdd(this, _startTime, 0);
    __privateSet(this, _time, __privateMethod(_a = _Wait, _Wait_static, checkTime_fn).call(_a, time));
  }
  set time(v) {
    var _a;
    if (this.state !== TaskState.STOPPED) {
      throw new Error("Stop the task before changing the time");
    }
    __privateSet(this, _time, __privateMethod(_a = _Wait, _Wait_static, checkTime_fn).call(_a, v));
  }
  get time() {
    return __privateGet(this, _time);
  }
  /********************************************************************
  
     ********************************************************************/
  /**
   *  Starts the task
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @function
   */
  doStart() {
    let time = __privateGet(this, _time);
    if (this.state === TaskState.STARTED) {
      return false;
    }
    if (this.state === TaskState.PAUSED) {
      time = __privateGet(this, _leftTime);
    } else {
      __privateSet(this, _leftTime, time);
    }
    this.state = TaskState.STARTED;
    __privateSet(this, _startTime, Date.now());
    __privateSet(this, _timer, setTimeout(() => {
      __privateSet(this, _timer, null);
      this.state = TaskState.STOPPED;
      this.notify("taskDidEnd");
    }, time));
    this.notify("taskDidStart");
    return true;
  }
  /**
   *  Stops the task.<br />
   *  When the task is stopped, it calls the taskDidStop if it exits.
   * @ignore
   * @function
   */
  stop() {
    if (this.state === TaskState.STOPPED) {
      return false;
    }
    this.state = TaskState.STOPPED;
    if (__privateGet(this, _timer)) clearTimeout(__privateGet(this, _timer));
    __privateSet(this, _timer, null);
    __privateSet(this, _leftTime, __privateGet(this, _time));
    this.notify("taskDidStop");
    return true;
  }
  /**
   *  Pause the task.<br />
   *  When the task is paused, it calls
   *  the TaskDelegate.taskDidPause if it exits.
   * @ignore
   * @function
   */
  pause() {
    if (this.state !== TaskState.STARTED) {
      return false;
    }
    this.state = TaskState.PAUSED;
    if (__privateGet(this, _timer)) clearTimeout(__privateGet(this, _timer));
    __privateSet(this, _timer, null);
    __privateSet(this, _leftTime, __privateGet(this, _leftTime) - Date.now() + __privateGet(this, _startTime));
    this.notify("taskDidPause");
    return true;
  }
};
_time = new WeakMap();
_leftTime = new WeakMap();
_timer = new WeakMap();
_startTime = new WeakMap();
_Wait_static = new WeakSet();
checkTime_fn = function(time) {
  if (!Number.isFinite(time) || time < 0) {
    throw new RangeError(`Invalid wait time: ${time}, expected a positive number of milliseconds`);
  }
  return time;
};
__privateAdd(_Wait, _Wait_static);
let Wait = _Wait;

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  PAR: PAR,
  SEQ: SEQ,
  Task: Task,
  TaskState: TaskState,
  Wait: Wait,
  par: par,
  seq: seq
});

export { LOGGER, index$1 as event, index as task };
//# sourceMappingURL=vs_core.es.js.map
