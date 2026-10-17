define(['exports', 'vs_utils'], (function (exports, vs_utils) { 'use strict';

  var __typeError$9 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$9 = (obj, member, msg) => member.has(obj) || __typeError$9("Cannot " + msg);
  var __privateGet$9 = (obj, member, getter) => (__accessCheck$9(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$9 = (obj, member, value) => member.has(obj) ? __typeError$9("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$6 = (obj, member, value, setter) => (__accessCheck$9(obj, member, "write to private field"), member.set(obj, value), value);
  var _pool, _funcName, _funcPtr, _obj;
  const _Handler = class _Handler {
    constructor() {
      __privateAdd$9(this, _funcName);
      __privateAdd$9(this, _funcPtr);
      __privateAdd$9(this, _obj);
    }
    get func() {
      return __privateGet$9(this, _funcPtr) || __privateGet$9(this, _funcName);
    }
    get obj() {
      return __privateGet$9(this, _obj);
    }
    configure(obj, func) {
      __privateSet$6(this, _obj, obj);
      if (vs_utils.isFunction(func)) {
        __privateSet$6(this, _funcPtr, func);
      } else if (vs_utils.isString(func)) {
        __privateSet$6(this, _funcName, func);
      }
    }
    static retain() {
      if (__privateGet$9(_Handler, _pool).length > 0) {
        return __privateGet$9(_Handler, _pool).pop();
      }
      return new _Handler();
    }
    static release(handler) {
      __privateSet$6(handler, _obj, void 0);
      __privateSet$6(handler, _funcName, void 0);
      __privateSet$6(handler, _funcPtr, void 0);
      __privateGet$9(_Handler, _pool).push(handler);
    }
  };
  _pool = new WeakMap();
  _funcName = new WeakMap();
  _funcPtr = new WeakMap();
  _obj = new WeakMap();
  __privateAdd$9(_Handler, _pool, []);
  let Handler = _Handler;

  var __defProp$6 = Object.defineProperty;
  var __typeError$8 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$8 = (obj, member, msg) => member.has(obj) || __typeError$8("Cannot " + msg);
  var __privateGet$8 = (obj, member, getter) => (__accessCheck$8(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$8 = (obj, member, value) => member.has(obj) ? __typeError$8("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$5 = (obj, member, value, setter) => (__accessCheck$8(obj, member, "write to private field"), member.set(obj, value), value);
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
      __publicField$6(this, "data");
      /**
       * The component which produce the event
       */
      __publicField$6(this, "src");
      /**
       * [Deprecated] The component which produce the event. <br>
       * In case of DOM event, the Event is mapped to the DOM event. Then
       * the developer has access to srcTarget (and many other data).
       * @deprecated
       */
      __publicField$6(this, "srcTarget");
    }
    get type() {
      return __privateGet$8(this, _type);
    }
    /**
     * @param {string} type the event type [mandatory]
     * @param {Object} data complementary event data [optional]
     */
    configure(type, data) {
      __privateSet$5(this, _type, type);
      this.data = data;
    }
    static retain() {
      if (this.eventPool.length > 0) {
        return this.eventPool.pop();
      }
      return new _Event();
    }
    static release(event) {
      __privateSet$5(event, _type, void 0);
      event.data = void 0;
      event.src = void 0;
      event.srcTarget = void 0;
      this.eventPool.push(event);
    }
  };
  _type = new WeakMap();
  __publicField$6(_Event, "eventPool", []);
  let Event = _Event;

  var __defProp$5 = Object.defineProperty;
  var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
  const _Action = class _Action {
    constructor() {
      __publicField$5(this, "func");
      __publicField$5(this, "ctx");
      /**
       * Run the action. This method is called with our setImmediate
       * implementation
       */
      __publicField$5(this, "run", () => this.func?.call(this.ctx));
    }
    configure(func, ctx) {
      this.func = func;
      this.ctx = ctx;
    }
    static retain() {
      if (_Action.pool.length > 0) {
        return _Action.pool.pop();
      }
      return new _Action();
    }
    static release(action) {
      action.func = void 0;
      action.ctx = void 0;
      _Action.pool.push(action);
    }
  };
  __publicField$5(_Action, "pool", []);
  let Action = _Action;

  const LOGGER = vs_utils.injectionToken("LOGGER");

  let mainActionsQueue = [];
  let tmpActionsQueue = [];
  let scheduleDoActions;
  let areActionsScheduled = false;
  let _logger$1 = null;
  const getLogger$1 = () => {
    _logger$1 = _logger$1 ?? vs_utils.container.get(LOGGER);
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
          if (e.stack) logger.error(e.stack);
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
    scheduleDoActions = window.postMessage ? installPostMessageImplementation() : function() {
      setTimeout(doAllActions, 0);
    };
    return queueAction;
  }
  function runImmediatePolyfill() {
    if (mainActionsQueue.length) scheduleDoActions();
  }

  let _logger = null;
  const getLogger = () => {
    _logger = _logger ?? vs_utils.container.get(LOGGER);
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
          if (vs_utils.isFunction(handler)) {
            handler(event);
          } else if (vs_utils.isFunction(handler.handleEvent)) {
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
  var __privateGet$7 = (obj, member, getter) => (__accessCheck$7(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
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
      return __privateGet$7(this, _children).includes(child);
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
      __privateGet$7(this, _children).push(child);
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
      const idx = __privateGet$7(this, _children).indexOf(child);
      if (idx === -1) {
        throw new Error("Not a child of this component");
      }
      __privateGet$7(this, _children).splice(idx, 1);
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
      __privateGet$7(this, _children).forEach((child) => childToParent.delete(child));
      __privateGet$7(this, _children).length = 0;
    }
  }
  _children = new WeakMap();
  function isContainer(obj) {
    if (obj instanceof Container) return true;
    return vs_utils.isObject(obj) && "add" in obj && "remove" in obj && "isChild" in obj;
  }

  var __typeError$6 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$6 = (obj, member, msg) => member.has(obj) || __typeError$6("Cannot " + msg);
  var __privateGet$6 = (obj, member, getter) => (__accessCheck$6(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$6 = (obj, member, value) => member.has(obj) ? __typeError$6("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var _bindings;
  function isEventSource(obj) {
    return vs_utils.isObject(obj) && "dispatchEvent" in obj && "bind" in obj && "unbind" in obj && "addEventListener" in obj && "removeEventListener" in obj;
  }
  class EventSource extends vs_utils.Mixin {
    constructor() {
      super(...arguments);
      __privateAdd$6(this, _bindings, /* @__PURE__ */ new Map());
    }
    initMixin() {
    }
    releaseMixin() {
      super.releaseMixin();
      for (const [spec, handlerList] of __privateGet$6(this, _bindings).entries()) {
        handlerList.forEach((handler) => Handler.release(handler));
        handlerList.length = 0;
        __privateGet$6(this, _bindings).delete(spec);
      }
    }
    bind(spec, obj, func) {
      if (!spec || !obj) return;
      let handlerList = __privateGet$6(this, _bindings).get(spec);
      if (!handlerList) {
        handlerList = [];
        __privateGet$6(this, _bindings).set(spec, handlerList);
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
      let handlerList = __privateGet$6(this, _bindings).get(type);
      if (!handlerList) {
        handlerList = [];
        __privateGet$6(this, _bindings).set(type, handlerList);
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
      if (!__privateGet$6(this, _bindings).has(type)) return;
      function unbind(handlerList) {
        const idx = handlerList.findIndex((handler) => handler.func === func);
        if (idx !== -1) {
          const handlers = handlerList.splice(idx, 1);
          handlers.forEach((handle) => Handler.release(handle));
        }
      }
      unbind(__privateGet$6(this, _bindings).get(type));
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
      if (!__privateGet$6(this, _bindings).has(spec)) return;
      function unbind(handlerList) {
        const idx = handlerList.findIndex((handler) => handler.func === func && handler.obj === obj);
        if (idx !== -1) {
          const handlers = handlerList.splice(idx, 1);
          handlers.forEach((handle) => Handler.release(handle));
        }
      }
      unbind(__privateGet$6(this, _bindings).get(spec));
    }
    /**
     *  Dispatches an Event at the specified EventSource, invoking the affected
     *  EventListeners in the appropriate order.
     */
    dispatchEvent(event) {
      if (!event.type) return false;
      const handlerList = __privateGet$6(this, _bindings).get(event.type);
      if (vs_utils.isEmpty(handlerList)) {
        if (isContainer(this)) {
          const parent = Container.getParent(this);
          if (isEventSource(parent)) {
            parent.dispatchEvent(event);
          }
        }
        return true;
      }
      event.src = this;
      event.srcTarget = this;
      queueProcAsyncEvent(event, handlerList);
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

  var __defProp$4 = Object.defineProperty;
  var __typeError$5 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
  var __privateGet$5 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), member.get(obj));
  var __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$4 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
  var _state$1, _deleted, _initFunctions;
  const _Component = class _Component extends vs_utils.SupportMixins {
    constructor(id) {
      super();
      __privateAdd$5(this, _state$1, "non-initialized");
      __privateAdd$5(this, _deleted, false);
      __privateAdd$5(this, _initFunctions, /* @__PURE__ */ new Set());
      __publicField$4(this, "id");
      this.id = id ?? vs_utils.createUniqueId();
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
      if (__privateGet$5(this, _state$1) !== "non-initialized") {
        throw new Error("impossible to re-initialise a component");
      }
      try {
        this.initComponent();
        __privateGet$5(this, _initFunctions).forEach((func) => func());
        __privateSet$4(this, _state$1, "initialized");
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
      _Component.instances[this.id] = void 0;
      __privateSet$4(this, _state$1, "deleted");
    }
    isDeleted() {
      return __privateGet$5(this, _state$1) === "deleted";
    }
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     *
     * @return {Object} the object value for stringify
     */
    toJSON() {
      return vs_utils.toJSON(this.serialize());
    }
    /**
     *  Set objet's properties from JSON stringification.<p/>
     *  This can be used when retrieve data from serialization.
     *
     * @param {String} json The JSON String
     */
    parseJSON(json) {
      try {
        const rawData = vs_utils.parseJSON(json);
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
  __publicField$4(_Component, "instances", {});
  let Component = _Component;
  vs_utils.applyMixins(Component, [EventSource]);

  var TaskState = /* @__PURE__ */ ((TaskState2) => {
    TaskState2[TaskState2["STARTED"] = 1] = "STARTED";
    TaskState2[TaskState2["STOPPED"] = 0] = "STOPPED";
    TaskState2[TaskState2["PAUSED"] = 2] = "PAUSED";
    return TaskState2;
  })(TaskState || {});

  var __defProp$3 = Object.defineProperty;
  var __typeError$4 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, key + "" , value);
  var __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
  var __privateGet$4 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$3 = (obj, member, value, setter) => (__accessCheck$4(obj, member, "write to private field"), member.set(obj, value), value);
  var _state;
  class Task extends Component {
    constructor() {
      super(...arguments);
      /********************************************************************
      
         ********************************************************************/
      /**
       * TaskDelegate.
       * Methods are called when state changes (stop | pause)
       *
       *  <p>
       *  @example
       *  var delegate = {};
       *  delegate.taskDidEnd = function () { ... }
       *
       *  // Declare a PAR task including a SEC Task
       *  var task = new Task (...)
       *  task.delegate = delegate;
       *  task.start ();
       *
       * @name core.Task#delegate
       *
       * @property {object}
       */
      __publicField$3(this, "delegate");
      /********************************************************************
       States
       ********************************************************************/
      /**
       *	@private
       */
      __privateAdd$4(this, _state, TaskState.STOPPED);
    }
    /**
     *  Return the task State. <br />
     *  Possible values: {@link core.Task.STARTED},
     *  {@link core.Task.STOPPED},
     *  {@link core.Task.PAUSED}
     */
    get state() {
      return __privateGet$4(this, _state);
    }
    set state(state) {
      __privateSet$3(this, _state, state);
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
      this.stop();
      super.destructor();
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
     *  Starts the task
     *
     * @name core.Task#start
     * @function
     *
     * @param {any} param any parameter (scalar, Array, Object)
     */
    start(param) {
    }
    /**
     *  Stops the task.<br />
     *  When the task is stopped, it calls the TaskDelegate.taskDidStop
     *  if it declared.
     *
     * @name core.Task#stop
     * @function
     */
    stop() {
    }
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls the TaskDelegate.taskDidPause
     *  if it declared.
     *
     * @name core.Task#pause
     * @function
     */
    pause() {
    }
  }
  _state = new WeakMap();

  var __defProp$2 = Object.defineProperty;
  var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, key + "" , value);
  class BaseTask extends Task {
    constructor(tasksAndParams) {
      super();
      /********************************************************************
      
         ********************************************************************/
      /**
       *  @private
       */
      __publicField$2(this, "tasksAndParams", []);
      this.state = TaskState.STOPPED;
      if (tasksAndParams && tasksAndParams.length) {
        this.setTasks(tasksAndParams);
      }
      throw new Error("NOT IMPLEMENTED");
    }
    /**
     *  Set tasks.
     *  The task has to be stopped
     *
     * @name core.task.SEQ#setTasks
     * @function
     *
     *  parameter
     * @param tasksAndParams
     */
    setTasks(tasksAndParams) {
      if (this.state !== TaskState.STOPPED) {
        return false;
      }
      this.tasksAndParams.length = 0;
      for (let taskAndParam of tasksAndParams) {
        if (!taskAndParam) {
          continue;
        }
        let param = null;
        let task = null;
        if (vs_utils.isArray(taskAndParam)) {
          if (taskAndParam.length === 1) {
            task = taskAndParam[0];
          } else if (taskAndParam.length === 2) {
            task = taskAndParam[0];
            param = taskAndParam[1];
          }
        } else {
          task = taskAndParam;
          param = null;
        }
        if (!task) {
          console.warn("Undefined task");
          continue;
        }
        if (!task.start || !task.stop || !task.pause) {
          console.warn("Invalid task: " + task.toString());
          continue;
        }
        this.tasksAndParams.push([task, param]);
      }
      return true;
    }
  }

  var __typeError$3 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
  var __privateGet$3 = (obj, member, getter) => (__accessCheck$3(obj, member, "read from private field"), member.get(obj));
  var __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$2 = (obj, member, value, setter) => (__accessCheck$3(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateWrapper$1 = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet$2(obj, member, value);
    },
    get _() {
      return __privateGet$3(obj, member);
    }
  });
  var _nextTaskToStart, _startParam;
  class SEQ extends BaseTask {
    constructor() {
      super(...arguments);
      /********************************************************************
      
         ********************************************************************/
      /**
       *  @private
       */
      __privateAdd$3(this, _nextTaskToStart, 0);
      /**
       *  @private
       */
      __privateAdd$3(this, _startParam, null);
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
    start(param) {
      if (this.state === TaskState.STARTED) {
        return false;
      }
      const taskAndParams = this.tasksAndParams[__privateGet$3(this, _nextTaskToStart)];
      __privateWrapper$1(this, _nextTaskToStart)._++;
      if (!taskAndParams) {
        __privateSet$2(this, _nextTaskToStart, 0);
        this.state = TaskState.STOPPED;
        return false;
      }
      this.state = TaskState.STARTED;
      __privateSet$2(this, _startParam, param);
      taskAndParams[0].delegate = this;
      taskAndParams[0].start(taskAndParams[1] ? taskAndParams[1] : param);
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
      const taskAndParams = this.tasksAndParams[__privateGet$3(this, _nextTaskToStart) - 1];
      __privateSet$2(this, _nextTaskToStart, 0);
      if (!taskAndParams) {
        return false;
      }
      taskAndParams[0].stop();
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
      if (this.state === TaskState.PAUSED) {
        return false;
      }
      this.state = TaskState.PAUSED;
      const taskAndParams = this.tasksAndParams[__privateGet$3(this, _nextTaskToStart) - 1];
      if (!taskAndParams) {
        return false;
      }
      taskAndParams[0].pause();
      return true;
    }
    /********************************************************************
     delegate methodes
     ********************************************************************/
    /**
     */
    taskDidStop() {
      this.state = TaskState.STOPPED;
      __privateSet$2(this, _nextTaskToStart, 0);
      if (this.delegate?.taskDidStop) {
        try {
          this.delegate.taskDidStop(this);
        } catch (e) {
          if (e.stack) console.log(e.stack);
          console.error(e);
        }
      }
    }
    /**
     */
    taskDidPause() {
      this.state = TaskState.PAUSED;
      __privateSet$2(this, _nextTaskToStart, __privateGet$3(this, _nextTaskToStart) - 1);
      if (this.delegate?.taskDidPause) {
        try {
          this.delegate.taskDidPause(this);
        } catch (e) {
          if (e.stack) console.log(e.stack);
          console.error(e);
        }
      }
    }
    /**
     */
    taskDidEnd() {
      this.state = TaskState.STOPPED;
      if (__privateGet$3(this, _nextTaskToStart) < this.tasksAndParams.length) {
        this.start(__privateGet$3(this, _startParam));
      } else {
        __privateSet$2(this, _nextTaskToStart, 0);
        if (this.delegate?.taskDidEnd) {
          try {
            this.delegate.taskDidEnd(this);
          } catch (e) {
            if (e.stack) console.log(e.stack);
            console.error(e);
          }
        }
      }
    }
  }
  _nextTaskToStart = new WeakMap();
  _startParam = new WeakMap();

  var __typeError$2 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
  var __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet$1(obj, member, value);
    },
    get _() {
      return __privateGet$2(obj, member, getter);
    }
  });
  var _tasksWillEnded;
  class PAR extends BaseTask {
    constructor() {
      super(...arguments);
      /**
       * task ended
       *  @private
       */
      __privateAdd$2(this, _tasksWillEnded, 0);
    }
    /**
     *  Starts the task
     *
     * @name task.PAR#start
     * @function
     * @ignore
     * @param {any} param any parameter (scalar, Array, Object)
     */
    start(param) {
      if (this.state === TaskState.STARTED) {
        return false;
      }
      __privateSet$1(this, _tasksWillEnded, this.tasksAndParams.length);
      this.state = TaskState.STARTED;
      for (let taskAndParams of this.tasksAndParams) {
        taskAndParams[0].delegate = this;
        taskAndParams[0].start(taskAndParams[1] ? taskAndParams[1] : param);
      }
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
      for (let taskAndParams of this.tasksAndParams) {
        taskAndParams[0].stop();
      }
      return true;
    }
    /**
     *  Pause the task.<br />
     *  When the task is paused, it calls the taskDidPause if it exits.
     *  @ignore
     * @function
     */
    pause() {
      if (this.state === TaskState.PAUSED) {
        return false;
      }
      this.state = TaskState.PAUSED;
      for (let taskAndParams of this.tasksAndParams) {
        taskAndParams[0].pause();
      }
      return true;
    }
    /********************************************************************
     delegate methods
     ********************************************************************/
    /**
     */
    taskDidStop() {
      __privateWrapper(this, _tasksWillEnded)._--;
      if (__privateGet$2(this, _tasksWillEnded) === 0) {
        this.state = TaskState.STOPPED;
        if (this.delegate?.taskDidStop) {
          try {
            this.delegate.taskDidStop(this);
          } catch (e) {
            if (e.stack) console.log(e.stack);
            console.error(e);
          }
        }
      }
    }
    /**
     */
    taskDidPause() {
      __privateWrapper(this, _tasksWillEnded)._--;
      if (__privateGet$2(this, _tasksWillEnded) === 0) {
        this.state = TaskState.PAUSED;
        if (this.delegate?.taskDidPause) {
          try {
            this.delegate.taskDidPause(this);
          } catch (e) {
            if (e.stack) console.log(e.stack);
            console.error(e);
          }
        }
      }
    }
    /**
     */
    taskDidEnd() {
      __privateWrapper(this, _tasksWillEnded)._--;
      if (__privateGet$2(this, _tasksWillEnded) === 0) {
        this.state = TaskState.STOPPED;
        if (this.delegate?.taskDidEnd) {
          try {
            this.delegate.taskDidEnd(this);
          } catch (e) {
            if (e.stack) console.log(e.stack);
            console.error(e);
          }
        }
      }
    }
  }
  _tasksWillEnded = new WeakMap();

  var __typeError$1 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
  var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
  var _time, _leftTime, _timer, _startTime;
  class Wait extends Task {
    constructor(time) {
      super();
      /********************************************************************
      
         ********************************************************************/
      __privateAdd$1(this, _time, 0);
      __privateAdd$1(this, _leftTime, 0);
      __privateAdd$1(this, _timer, null);
      __privateAdd$1(this, _startTime, 0);
      __privateSet(this, _time, time);
      this.state = TaskState.STOPPED;
    }
    set time(v) {
      if (this.state !== TaskState.STOPPED) {
        throw new Error("Stop the task before changing the time");
      }
      __privateSet(this, _time, v);
    }
    get time() {
      return __privateGet$1(this, _time);
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
    start() {
      let time = __privateGet$1(this, _time);
      if (this.state === TaskState.STARTED) {
        return false;
      }
      if (this.state === TaskState.PAUSED) {
        time = __privateGet$1(this, _leftTime);
      } else {
        __privateSet(this, _leftTime, time);
      }
      this.state = TaskState.STARTED;
      __privateSet(this, _startTime, (/* @__PURE__ */ new Date()).getTime());
      __privateSet(this, _timer, setTimeout(() => {
        this.state = TaskState.STOPPED;
        if (this.delegate?.taskDidEnd) {
          try {
            this.delegate.taskDidEnd(this);
          } catch (e) {
            if (e.stack) console.log(e.stack);
            console.error(e);
          }
        }
      }, time));
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
      clearTimeout(__privateGet$1(this, _timer));
      __privateSet(this, _timer, null);
      __privateSet(this, _leftTime, __privateGet$1(this, _time));
      if (this.delegate?.taskDidStop) {
        try {
          this.delegate.taskDidStop(this);
        } catch (e) {
          if (e.stack) console.log(e.stack);
          console.error(e);
        }
      }
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
      if (this.state === TaskState.PAUSED) {
        return false;
      }
      this.state = TaskState.PAUSED;
      clearTimeout(__privateGet$1(this, _timer));
      __privateSet(this, _timer, null);
      __privateSet(this, _leftTime, __privateGet$1(this, _leftTime) - (/* @__PURE__ */ new Date()).getTime() + __privateGet$1(this, _startTime));
      if (this.delegate?.taskDidPause) {
        try {
          this.delegate.taskDidPause(this);
        } catch (e) {
          if (e.stack) console.log(e.stack);
          console.error(e);
        }
      }
      return true;
    }
  }
  _time = new WeakMap();
  _leftTime = new WeakMap();
  _timer = new WeakMap();
  _startTime = new WeakMap();

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    PAR: PAR,
    SEQ: SEQ,
    Task: Task,
    TaskState: TaskState,
    Wait: Wait
  });

  const DEFAULT_DATAFLOW = vs_utils.injectionToken("DEFAULT_DATAFLOW");

  var __defProp$1 = Object.defineProperty;
  var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, key + "" , value);
  class Connector {
    constructor(objId, pOut) {
      this.objId = objId;
      this.pOut = pOut;
      __publicField$1(this, "intermediateObjId");
    }
    /**
     * @param {Component} objId the Component the connector will be connected
     *        to
     * @param {String} pIn the Component in property name to connect
     *        to
     */
    to(object, pIn, func) {
      const df = vs_utils.container.get(DEFAULT_DATAFLOW);
      df.connect(this.objId, this.pOut, object.id, pIn, func);
      this.intermediateObjId = object.id;
      return this;
    }
    /**
     * @param {String} property_name the Component out property name to connect
     *        from
     */
    connect(pIn) {
      const objId = this.intermediateObjId || this.objId;
      return new Connector(objId, pIn);
    }
  }

  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var _nodes;
  const nodesBis = /* @__PURE__ */ new Map();
  function Input(value, { name, addInitializer, ...rest }) {
    addInitializer(function() {
      let node = nodesBis.get(this);
      if (!node) {
        node = new DataflowNode(this.id);
        nodesBis.set(this, node);
      }
    });
  }
  const _DataflowNode = class _DataflowNode extends vs_utils.SupportMixins {
    constructor(id) {
      super();
      // readonly #configParams: ObjectConfig | undefined;
      __publicField(this, "id");
      this.id = vs_utils.isString(id) ? id : vs_utils.createUniqueId();
      __privateGet(_DataflowNode, _nodes).set(this.id, this);
    }
    static get(id) {
      return __privateGet(_DataflowNode, _nodes).get(id);
    }
    /**
     *  Object configuration method. <p>
     *  Call this method to adjust some properties of the internal components
     *  using one call. <br/>
     *  It takes as parameters, an associated array <propertyName, value>.
     *  <br/><br/>
     *  Ex:
     *  @example
     *  var myObject = new core.Object ({id: 'myobject'});
     *  myObject.init ();
     *
     *  myObject.configure ({prop1: "1", prop2: 'hello', ..});
     *  <=>
     *  myObject.prop1 = "1";
     *  myObject.prop2 = "hello";
     *  ...
     *
     * @name core.Object#configure
     * @function
     *
     * @param {Object} config the associated array used for configuring the
     *        object.
     */
    // protected configure(config: Exclude<ObjectConfig, 'id'>) {
    // let shouldPropagate = false;
    // // let props; let key; let i; ; let
    // //   desc;
    // const state = DataflowState.get(this.id)!;
    // state.pausePropagation();
    //
    // // Manage model
    // // if (config instanceof Model) {
    // //   desc = this.getPropertyDescriptor ('model');
    // //   if (desc && desc.set) {
    // //     // model property assignation
    // //     this.model = config;
    // //     shouldPropagate = true;
    // //   }
    // //   else {
    // //     // one by one property copy
    // //     props = config.getModelProperties ();
    // //     for (i = 0; i < props.length; i += 1)
    // //     {
    // //       key = props [i];
    // //       if (key === 'id') continue;
    // //       this [key] = config [key];
    // //       shouldPropagate = true;
    // //     }
    // //   }
    // // }
    // // else {
    // if (config) {
    //   const properties = this.getModelProperties();
    //   properties.forEach(key => {
    //     // @ts-ignore
    //     this[key] = config[key];
    //     shouldPropagate = true;
    //   });
    // }
    // // }
    //
    // state.restartPropagation();
    // if (shouldPropagate) {
    //   this.propertiesDidChange();
    //   state.propagate();
    // }
    // }
    /**
     *  This method is called by the dataflow algorithm when input properties have
     *  been changed.
     *  You should reimplement this method if you want make specific calculation
     *  on properties changed, and/or modifying output properties.
     *  If you have modifying an output property (and want to continue the
     *  dataflow propagation) you have to return 'false' or nothing.
     *  Otherwise return 'true' to and the propagation will terminate.
     *
     * @return {boolean} true if you want stop de propagation, false otherwise
     */
    // eslint-disable-next-line class-methods-use-this
    propertiesDidChange() {
      return false;
    }
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     */
    // protected override serialize(): any {
    //   const base = super.serialize();
    //   const properties = this.getModelProperties();
    //
    //   if (properties) {
    //     properties.forEach(propName => {
    //       // @ts-ignore TODO a fixer
    //       const value = this[`_${underscore(propName)}`];
    //       if (value === undefined) {
    //         return;
    //       }
    //       let result;
    //       if (isDate(value)) {
    //         result = value;
    //       } else if (isFunction(value.serialize)) {
    //         logger.warn('THIS CASE IS NOT PROPERLY MANAGED, (especially deserialization)');
    //         result = value.serialize();
    //       } else {
    //         result = value;
    //       }
    //       base[propName] = result;
    //     });
    //   }
    //   return base;
    // }
    //
    // /**
    //  * @protected
    //  */
    // protected override deserialize(data: any): void {
    //   this.configure(data);
    // }
    /**
     * Returns a property descriptor for a property (along the object's
     * prototype chain) of a given object.
     *
     * @param {String} propName The name of the property whose description is to
     *   be retrieved
     * @return {Object} The property descriptor or null
     */
    getPropertyDescriptor(propName) {
      const desc = Object.getOwnPropertyDescriptor(this, propName);
      if (desc) return desc;
      function getOwnPropertyDescriptor(obj) {
        if (!obj) return void 0;
        const proto = Object.getPrototypeOf(obj);
        if (!proto) return void 0;
        const subCompDesc = Object.getOwnPropertyDescriptor(proto, propName);
        if (subCompDesc) return subCompDesc;
        return getOwnPropertyDescriptor(proto);
      }
      return getOwnPropertyDescriptor(this);
    }
    // eslint-disable-next-line class-methods-use-this
    getModelProperties() {
      return [];
    }
    /**
     * Connect two components within the dataflow.
     * This method return a Connector that will allow you to declare your
     * dataflow with a simple chaining API.
     *
     * @example
     * /// First example: the slide will rotate the view1 and view2
     * var slider = new vs.ui.Slider ({}).init ();
     * var view1 = new vs.ui.View ({}).init ();
     * var view2 = new vs.ui.View ({}).init ();
     *
     * slider
     *   .connect ("value") // out property
     *   .to (view1, "rotation"); // in property
     *   .to (view2, "rotation"); // in property
     *
     * /// Seconde example: the slide will rotate the view1 and view2
     * var slider = new vs.ui.Slider ({range: [1, 10]}).init ();
     * var list = new core.Array({data: ["item1", ..., "item10"]}).init ();
     * var label = new vs.ui.TextLabel ({}).init ();
     *
     * slider
     *   .connect ("value") // out property
     *   .to (list, "index") // in property
     *     .connect ("value") // in property
     *     .to (label, "text"); // in property
     *
     *
     * @name core.Object#connect
     * @function
     * @public
     * @param {String} property_name the Component out property name to connect
     *                 from
     * @return {Connector} returns the connector object that allow the chaining
     */
    connect(propertyName) {
      return new Connector(this.id, propertyName);
    }
    // /**
    //  * The method allows to link a model to another object (a view for
    //  * instance).<br />
    //  * This is a simple way to create a MVC architecture; each model
    //  * modification will be propagated to the view.<br/><br/>
    //  * Linking is quite different than dataflow.<br/>
    //  * You can use linking to connect 2 objects with the same properties name.
    //  * <br/>
    //  * With dataflow its possible to connect a set of object, and define precisely
    //  * witch properties are connected together.<br/>
    //  * <br/>
    //  * Please notice that dataflow propagation is more optimized than linking
    //  * propagation.
    //  *
    //  * @example
    //  *  var myModel = new MyModel ().init ();
    //  *  var myView = new MyView ().init ();
    //  *
    //  *  myView.link (myModel);
    //  *
    //  *  myModel.prop = "value"; // the myView.prop will be automatically updated.
    //  *  ...
    //  *  myModel.stopPropagation ();
    //  *  myModel.prop = "value";
    //  *  myModel.propBis = "valueBis";
    //  *  myModel.change (); // the view is updated
    //  *
    //  * @name core.Object#link
    //  * @function
    //  * @param {core.Model} model The model to link with
    //  */
    // link(model) {
    //   // model update management
    //   if (model instanceof core.Model) {
    //     if (this.__model) this.__model.unlinkTo(this);
    //     this.__model = model;
    //     this.__model.linkTo(this);
    //
    //     // first configuration
    //     this.configure(this.__model);
    //   } else throw 'core.Object.link; parameter is not a core.Model';
    // }
    //
    // /**
    //  * Unlink the model which was linked with this object
    //  * @see core.Object#link
    //  *
    //  * @name core.Object#unlink
    //  * @function
    //  */
    // unlink() {
    //   // model update management
    //   if (this.__model) {
    //     if (this.__model) {
    //       this.__model.unlinkTo(this);
    //       const
    //         props = this.__model.getModelProperties();
    //       let l = props.length;
    //       const config = {};
    //
    //       while (l--) {
    //         config[props[l]] = null;
    //       }
    //       this.configure(config);
    //     }
    //     this.__model = undefined;
    //   }
    // }
  };
  _nodes = new WeakMap();
  __privateAdd(_DataflowNode, _nodes, /* @__PURE__ */ new Map());
  let DataflowNode = _DataflowNode;

  exports.Input = Input;
  exports.LOGGER = LOGGER;
  exports.event = index$1;
  exports.task = index;

}));
//# sourceMappingURL=vs_core.amd.js.map
