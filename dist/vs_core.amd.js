define(['exports', 'vs_utils'], (function (exports, vs_utils) { 'use strict';

  var __typeError$b = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$b = (obj, member, msg) => member.has(obj) || __typeError$b("Cannot " + msg);
  var __privateGet$a = (obj, member, getter) => (__accessCheck$b(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$b = (obj, member, value) => member.has(obj) ? __typeError$b("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$8 = (obj, member, value, setter) => (__accessCheck$b(obj, member, "write to private field"), member.set(obj, value), value);
  var _pool, _funcName, _funcPtr, _obj, _isPooled$1;
  const _Handler = class _Handler {
    constructor() {
      __privateAdd$b(this, _funcName);
      __privateAdd$b(this, _funcPtr);
      __privateAdd$b(this, _obj);
      __privateAdd$b(this, _isPooled$1, false);
    }
    get func() {
      return __privateGet$a(this, _funcPtr) || __privateGet$a(this, _funcName);
    }
    get obj() {
      return __privateGet$a(this, _obj);
    }
    configure(obj, func) {
      __privateSet$8(this, _obj, obj);
      __privateSet$8(this, _funcPtr, vs_utils.isFunction(func) ? func : void 0);
      __privateSet$8(this, _funcName, vs_utils.isString(func) ? func : void 0);
    }
    /**
     * Returns a function calling the handler callback with the event, as it
     * is now: later changes of the handler (release, reuse) do not affect it.
     * A callback given by name is looked up on the object when called.
     * Nothing is called when the object was deleted meanwhile (the event
     * is delivered asynchronously).
     */
    toListener() {
      const obj = __privateGet$a(this, _obj);
      const funcPtr = __privateGet$a(this, _funcPtr);
      const funcName = __privateGet$a(this, _funcName);
      return (event) => {
        if (obj?.isDeleted?.()) return;
        const func = funcPtr ?? (obj && funcName ? obj[funcName] : void 0);
        if (vs_utils.isFunction(func)) {
          func.call(obj, event);
        }
      };
    }
    static retain() {
      const handler = __privateGet$a(_Handler, _pool).pop() ?? new _Handler();
      __privateSet$8(handler, _isPooled$1, false);
      return handler;
    }
    static release(handler) {
      if (__privateGet$a(handler, _isPooled$1)) return;
      __privateSet$8(handler, _isPooled$1, true);
      __privateSet$8(handler, _obj, void 0);
      __privateSet$8(handler, _funcName, void 0);
      __privateSet$8(handler, _funcPtr, void 0);
      __privateGet$a(_Handler, _pool).push(handler);
    }
  };
  _pool = new WeakMap();
  _funcName = new WeakMap();
  _funcPtr = new WeakMap();
  _obj = new WeakMap();
  _isPooled$1 = new WeakMap();
  __privateAdd$b(_Handler, _pool, []);
  let Handler = _Handler;

  var __defProp$9 = Object.defineProperty;
  var __typeError$a = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$9 = (obj, key, value) => __defNormalProp$9(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$a = (obj, member, msg) => member.has(obj) || __typeError$a("Cannot " + msg);
  var __privateGet$9 = (obj, member, getter) => (__accessCheck$a(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$a = (obj, member, value) => member.has(obj) ? __typeError$a("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$7 = (obj, member, value, setter) => (__accessCheck$a(obj, member, "write to private field"), member.set(obj, value), value);
  var _type, _data, _isPooled;
  const _Event = class _Event {
    constructor() {
      /**
       * The event spec. For instance 'click' for a mouse click event.
       */
      __privateAdd$a(this, _type);
      /**
       * The optional data associated to the event (read only, see configure).
       */
      __privateAdd$a(this, _data);
      /**
       * The component which produce the event
       */
      __publicField$9(this, "src");
      /**
       * [Deprecated] The component which produce the event. <br>
       * In case of DOM event, the Event is mapped to the DOM event. Then
       * the developer has access to srcTarget (and many other data).
       * @deprecated
       */
      __publicField$9(this, "srcTarget");
      __privateAdd$a(this, _isPooled, false);
    }
    get type() {
      return __privateGet$9(this, _type);
    }
    get data() {
      return __privateGet$9(this, _data);
    }
    /**
     * @param {string} type the event type [mandatory]
     * @param {Object} data complementary event data [optional]
     */
    configure(type, data) {
      __privateSet$7(this, _type, type);
      __privateSet$7(this, _data, data);
    }
    static retain() {
      const event = _Event.eventPool.pop() ?? new _Event();
      __privateSet$7(event, _isPooled, false);
      return event;
    }
    static release(event) {
      if (__privateGet$9(event, _isPooled)) return;
      __privateSet$7(event, _isPooled, true);
      __privateSet$7(event, _type, void 0);
      __privateSet$7(event, _data, void 0);
      event.src = void 0;
      event.srcTarget = void 0;
      _Event.eventPool.push(event);
    }
  };
  _type = new WeakMap();
  _data = new WeakMap();
  _isPooled = new WeakMap();
  __publicField$9(_Event, "eventPool", []);
  let Event = _Event;

  var __defProp$8 = Object.defineProperty;
  var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$8 = (obj, key, value) => __defNormalProp$8(obj, typeof key !== "symbol" ? key + "" : key, value);
  const _Action = class _Action {
    constructor() {
      __publicField$8(this, "func");
      __publicField$8(this, "ctx");
      /**
       * Run the action. This method is called with our setImmediate
       * implementation
       */
      __publicField$8(this, "run", () => this.func?.call(this.ctx));
    }
    configure(func, ctx) {
      this.func = func;
      this.ctx = ctx;
    }
    static retain() {
      if (_Action.pool.length > 0) {
        return vs_utils.defined(_Action.pool.pop());
      }
      return new _Action();
    }
    static release(action) {
      action.func = void 0;
      action.ctx = void 0;
      _Action.pool.push(action);
    }
  };
  __publicField$8(_Action, "pool", []);
  let Action = _Action;

  const LOGGER = vs_utils.injectionToken("LOGGER");
  const consoleLogger = {
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.info(...args),
    debug: (...args) => console.debug(...args),
    verbose: (...args) => console.debug(...args)
  };

  let mainActionsQueue = [];
  let tmpActionsQueue = [];
  let scheduleDoActions;
  let areActionsScheduled = false;
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
    const logger = vs_utils.container.get(LOGGER);
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
          const err = vs_utils.asError(e);
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
    const logger = vs_utils.container.get(LOGGER);
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

  var __typeError$9 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$9 = (obj, member, msg) => member.has(obj) || __typeError$9("Cannot " + msg);
  var __privateGet$8 = (obj, member, getter) => (__accessCheck$9(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$9 = (obj, member, value) => member.has(obj) ? __typeError$9("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var _children;
  const childToParent = /* @__PURE__ */ new WeakMap();
  class Container {
    constructor() {
      __privateAdd$9(this, _children, []);
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
      return __privateGet$8(this, _children).includes(child);
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
      __privateGet$8(this, _children).push(child);
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
      const idx = __privateGet$8(this, _children).indexOf(child);
      if (idx === -1) {
        throw new Error("Not a child of this component");
      }
      __privateGet$8(this, _children).splice(idx, 1);
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
      __privateGet$8(this, _children).forEach((child) => childToParent.delete(child));
      __privateGet$8(this, _children).length = 0;
    }
  }
  _children = new WeakMap();

  function isEventSource(obj) {
    return (
      // any object: vs_utils isObject() only accepts plain objects
      typeof obj === "object" && obj !== null && "dispatchEvent" in obj && "bind" in obj && "unbind" in obj && "addEventListener" in obj && "removeEventListener" in obj
    );
  }
  const sourceBindings = /* @__PURE__ */ new WeakMap();
  function bindingsOf(source) {
    let bindings = sourceBindings.get(source);
    if (!bindings) {
      bindings = /* @__PURE__ */ new Map();
      sourceBindings.set(source, bindings);
    }
    return bindings;
  }
  const observerSources = /* @__PURE__ */ new WeakMap();
  function trackObserver(source, observer) {
    let sources = observerSources.get(observer);
    if (!sources) {
      sources = /* @__PURE__ */ new Set();
      observerSources.set(observer, sources);
    }
    sources.add(source);
  }
  function untrackObserver(source, observer) {
    const bindings = sourceBindings.get(source);
    for (const handlerList of bindings?.values() ?? []) {
      if (handlerList.some((handler) => handler.obj === observer)) return;
    }
    observerSources.get(observer)?.delete(source);
  }
  function unbindObserver(observer) {
    for (const source of observerSources.get(observer) ?? []) {
      for (const handlerList of sourceBindings.get(source)?.values() ?? []) {
        for (let i = handlerList.length - 1; i >= 0; i--) {
          if (handlerList[i].obj === observer) {
            Handler.release(handlerList.splice(i, 1)[0]);
          }
        }
      }
    }
    observerSources.delete(observer);
  }
  class EventSource extends vs_utils.Mixin {
    initMixin() {
    }
    /**
     *  Releases the bindings of this object: the ones of its events (as
     *  source), and the ones on the events of other sources (as observer).
     */
    releaseMixin() {
      super.releaseMixin();
      unbindObserver(this);
      const bindings = sourceBindings.get(this);
      if (!bindings) return;
      for (const handlerList of bindings.values()) {
        handlerList.forEach((handler) => {
          if (handler.obj) observerSources.get(handler.obj)?.delete(this);
          Handler.release(handler);
        });
        handlerList.length = 0;
      }
      sourceBindings.delete(this);
    }
    /**
     *  Binds a callback of an object to an event of this source.
     *
     * @name core.EventSource#bind
     * @function
     *
     * @param {string} spec the event specification [mandatory]
     * @param {core.Object} obj the object interested to catch the event [mandatory]
     * @param {Function|string} func the callback, or the name of a method of obj,
     *        called with obj as this [mandatory]
     */
    bind(spec, obj, func) {
      if (!spec || !obj || !func) return;
      const bindings = bindingsOf(this);
      let handlerList = bindings.get(spec);
      if (!handlerList) {
        handlerList = [];
        bindings.set(spec, handlerList);
      }
      const handler = Handler.retain();
      handler.configure(obj, func);
      handlerList.push(handler);
      trackObserver(this, obj);
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
      if (!type || !func) return;
      const bindings = bindingsOf(this);
      let handlerList = bindings.get(type);
      if (!handlerList) {
        handlerList = [];
        bindings.set(type, handlerList);
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
      const handlerList = sourceBindings.get(this)?.get(type);
      if (!handlerList) return;
      const idx = handlerList.findIndex((handler) => !handler.obj && handler.func === func);
      if (idx !== -1) {
        Handler.release(handlerList.splice(idx, 1)[0]);
      }
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
      const handlerList = sourceBindings.get(this)?.get(spec);
      if (!handlerList) return;
      if (func) {
        const idx = handlerList.findIndex((handler) => handler.obj === obj && handler.func === func);
        if (idx !== -1) {
          Handler.release(handlerList.splice(idx, 1)[0]);
        }
      } else {
        for (let i = handlerList.length - 1; i >= 0; i--) {
          if (handlerList[i].obj === obj) {
            Handler.release(handlerList.splice(i, 1)[0]);
          }
        }
      }
      untrackObserver(this, obj);
    }
    /**
     *  Dispatches an Event at the specified EventSource, invoking the affected
     *  EventListeners in the appropriate order.
     *  <p>
     *  When this source has no handler for the event, the event bubbles up to
     *  its parent Container (if it is an EventSource), and so on. The event src
     *  stays this source.
     */
    dispatchEvent(event) {
      if (!event.type) return false;
      event.src = this;
      event.srcTarget = this;
      deliver(this, event);
      return true;
    }
  }
  function deliver(source, event) {
    const handlerList = sourceBindings.get(source)?.get(event.type);
    if (vs_utils.isNotEmpty(handlerList)) {
      queueProcAsyncEvent(event, handlerList.map((handler) => handler.toListener()));
      return;
    }
    const parent = Container.getParent(source);
    if (isEventSource(parent)) {
      deliver(parent, event);
    }
  }

  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Event: Event,
    EventSource: EventSource,
    Handler: Handler
  });

  const DEFAULT_DATAFLOW = vs_utils.injectionToken("DEFAULT_DATAFLOW");

  var __defProp$7 = Object.defineProperty;
  var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
  class Connector {
    constructor(objId, pOut) {
      __publicField$7(this, "objId", objId);
      __publicField$7(this, "pOut", pOut);
      __publicField$7(this, "intermediateObjId");
    }
    /**
     * Connects the out property of the connector to an in property of the
     * object (see DataFlow.connect).
     *
     * @param {Component} object the target component
     * @param {String} pIn the in property of the target
     * @param {Function} func the function mapping the value [optional]
     * @return {Connector} this connector
     */
    to(object, pIn, func) {
      const df = vs_utils.container.get(DEFAULT_DATAFLOW);
      df.connect(this.objId, this.pOut, object.id, pIn, func);
      this.intermediateObjId = object.id;
      return this;
    }
    /**
     * Not supported yet: chaining connections will be reworked.
     *
     * @param {String} pIn an out property
     * @return {Connector} a new connector
     */
    connect(pIn) {
      const objId = this.intermediateObjId || this.objId;
      return new Connector(objId, pIn);
    }
  }

  class DataflowNodeMixin extends vs_utils.Mixin {
    // eslint-disable-next-line class-methods-use-this
    propertiesDidChange() {
      return false;
    }
    getPropertyDescriptor(propName) {
      for (let obj = this; obj; obj = Object.getPrototypeOf(obj)) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, propName);
        if (descriptor) return descriptor;
      }
      return void 0;
    }
    // eslint-disable-next-line class-methods-use-this
    getModelProperties() {
      return [];
    }
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    getPropertyDirection(propName) {
      return void 0;
    }
    connect(propertyName) {
      return new Connector(this.id, propertyName);
    }
  }

  var __defProp$6 = Object.defineProperty;
  var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
  class PropertyRef {
    constructor(node, name) {
      __publicField$6(this, "node", node);
      __publicField$6(this, "name", name);
    }
    /**
     * Connects this property, on the default dataflow: same as
     * connect(this).to(…)
     */
    to(...targets) {
      return connect(this).to(...targets);
    }
    /**
     * Same as connect(this).map(func)
     */
    map(func) {
      return connect(this).map(func);
    }
    /**
     * Same as connect(this).mapAll(func)
     */
    mapAll(func) {
      return connect(this).mapAll(func);
    }
    toString() {
      return `${this.node.id}.${this.name}`;
    }
  }
  function propertyRefs(node) {
    return new Proxy({}, {
      get(_target, name) {
        if (typeof name !== "string") return void 0;
        return new PropertyRef(node, name);
      }
    });
  }
  class Pipe {
    /**
     * @private use connect() or DataFlow.from()
     */
    constructor(dataflow, sources, transform, edges) {
      __publicField$6(this, "dataflow", dataflow);
      __publicField$6(this, "sources", sources);
      __publicField$6(this, "transform", transform);
      __publicField$6(this, "edges", edges);
      if (sources.length === 0) {
        throw new Error("connect: at least one property is needed");
      }
      checkSameNode(sources, "the properties to connect from");
    }
    /**
     *  Maps the values to one value
     *
     * @param {Function} func called with the values, returns the new value
     */
    map(func) {
      const transform = this.transform;
      const mapped = (...values) => [func(...transform ? transform(...values) : values)];
      return new Pipe(this.dataflow, this.sources, mapped, this.edges);
    }
    /**
     *  Maps the values to several values
     *
     * @param {Function} func called with the values, returns the new values
     */
    mapAll(func) {
      const transform = this.transform;
      const mapped = (...values) => func(...transform ? transform(...values) : values);
      return new Pipe(this.dataflow, this.sources, mapped, this.edges);
    }
    /**
     *  Connects the values to properties of a node, one value per property,
     *  and returns a pipe from these properties, to chain the connections.
     *  Throws if the properties are not of the same node, or for any reason
     *  DataFlow.connect throws (e.g. an unknown property, or different numbers
     *  of values and properties without map).
     *
     * @param {PropertyRef} targets the properties to connect to
     * @return {Pipe} a pipe from the target properties
     */
    to(...targets) {
      if (targets.length === 0) {
        throw new Error("connect.to: at least one property is needed");
      }
      checkSameNode(targets, "the properties to connect to");
      const source = this.sources[0].node;
      const target = targets[0].node;
      const edge = this.dataflow.connect(
        source,
        this.sources.map((ref) => ref.name),
        target,
        targets.map((ref) => ref.name),
        this.transform
      );
      this.edges.push(edge);
      return new Pipe(this.dataflow, targets, void 0, this.edges);
    }
    /**
     *  Removes all the connections of the chain (the ones created by its
     *  to() calls).
     */
    disconnect() {
      for (const edge of this.edges) {
        this.dataflow.disconnect(edge);
      }
      this.edges.length = 0;
    }
  }
  function checkSameNode(refs, what) {
    for (const ref of refs) {
      if (!(ref instanceof PropertyRef)) {
        throw new TypeError(`connect: ${what} must be property references (component.$.property)`);
      }
    }
    const node = refs[0].node;
    if (refs.some((ref) => ref.node !== node)) {
      throw new Error(`connect: ${what} must be properties of the same component (${refs.join(", ")})`);
    }
  }
  function createPipe(dataflow, sources) {
    return new Pipe(dataflow, sources, void 0, []);
  }
  function connect(...sources) {
    return createPipe(vs_utils.container.get(DEFAULT_DATAFLOW), sources);
  }

  var __defProp$5 = Object.defineProperty;
  var __typeError$8 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, key + "" , value);
  var __accessCheck$8 = (obj, member, msg) => member.has(obj) || __typeError$8("Cannot " + msg);
  var __privateGet$7 = (obj, member, getter) => (__accessCheck$8(obj, member, "read from private field"), member.get(obj));
  var __privateAdd$8 = (obj, member, value) => member.has(obj) ? __typeError$8("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$6 = (obj, member, value, setter) => (__accessCheck$8(obj, member, "write to private field"), member.set(obj, value), value);
  var _state$1, _deleted, _initFunctions;
  const registry = /* @__PURE__ */ new Map();
  const finalization = new FinalizationRegistry((id) => {
    if (registry.get(id)?.deref() === void 0) registry.delete(id);
  });
  function livingComponent(id) {
    return registry.get(id)?.deref();
  }
  function livingComponents() {
    const living = /* @__PURE__ */ new Map();
    for (const [id, ref] of registry) {
      const component = ref.deref();
      if (component) living.set(id, component);
    }
    return living;
  }
  const instancesView = {
    get: (id) => livingComponent(id),
    has: (id) => livingComponent(id) !== void 0,
    get size() {
      return livingComponents().size;
    },
    forEach(callback, thisArg) {
      livingComponents().forEach((component, id) => callback.call(thisArg, component, id, instancesView));
    },
    entries: () => livingComponents().entries(),
    keys: () => livingComponents().keys(),
    values: () => livingComponents().values(),
    [Symbol.iterator]: () => livingComponents().entries()
  };
  class Component extends vs_utils.SupportMixins {
    constructor(id) {
      super();
      __privateAdd$8(this, _state$1, "non-initialized");
      __privateAdd$8(this, _deleted, false);
      __privateAdd$8(this, _initFunctions, /* @__PURE__ */ new Set());
      __publicField$5(this, "id");
      this.id = id || vs_utils.createUniqueId();
      if (livingComponent(this.id)) {
        throw new Error(`A component with the id "${this.id}" already exists`);
      }
      registry.set(this.id, new WeakRef(this));
      finalization.register(this, this.id, this);
    }
    /**
     * The living components, by id (read only).
     * A component leaves it when it is destroyed, or garbage collected.
     */
    static get instances() {
      return instancesView;
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
      if (__privateGet$7(this, _state$1) !== "non-initialized") {
        throw new Error("impossible to re-initialise a component");
      }
      try {
        this.initComponent();
        __privateGet$7(this, _initFunctions).forEach((func) => func());
      } catch (e) {
        throw new Error("Component init failed with the error: " + e, { cause: e });
      }
      __privateSet$6(this, _state$1, "initialized");
      try {
        this.componentDidInitialize();
      } catch (e) {
        throw new Error(
          `Component ${this.id} is initialized, but componentDidInitialize failed with the error: ${e}`,
          { cause: e }
        );
      }
      return this;
    }
    /**
     *  Returns true once init() has initialized the component (even if
     *  componentDidInitialize() then failed), until it is deleted.
     */
    isInitialized() {
      return __privateGet$7(this, _state$1) === "initialized";
    }
    // eslint-disable-next-line class-methods-use-this
    initComponent() {
    }
    // eslint-disable-next-line class-methods-use-this
    componentDidInitialize() {
    }
    /**
     *  Destroys the component: releases its resources (e.g. its event
     *  bindings, as source and as observer) and frees its id.
     *  Calling it again does nothing.
     *  <p>
     *  Subclasses release their own resources by overriding destructor().
     */
    destroy() {
      if (this.isDeleted()) return;
      this.destructor();
    }
    /**
     *  Releases the component resources. Called once, by destroy().
     *  When overriding it, call super.destructor().
     */
    destructor() {
      this.release();
      if (livingComponent(this.id) === this) registry.delete(this.id);
      finalization.unregister(this);
      __privateSet$6(this, _state$1, "deleted");
    }
    /**
     *  The references to the properties of the component, to connect them in
     *  the dataflow (see connect()).
     *
     *  @example
     *  connect(slider.$.value).to(view.$.rotation);
     */
    get $() {
      return propertyRefs(this);
    }
    isDeleted() {
      return __privateGet$7(this, _state$1) === "deleted";
    }
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  Called by JSON.stringify(), so that a component (alone or nested in
     *  other data) is serialized as the object returned by serialize().
     *
     * @return {Object} the object value for stringify
     */
    toJSON() {
      return this.serialize();
    }
    /**
     *  Returns the JSON string of the component.<p/>
     *  This can be used for persistence; the reverse operation is parseJSON().
     *
     * @return {String} the JSON string
     */
    stringify() {
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
        if (!json) throw new SyntaxError("empty JSON string");
        const rawData = vs_utils.parseJSON(json);
        this.deserialize(rawData);
      } catch (e) {
        throw new Error("parseJSON failed with error: " + e, { cause: e });
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
  }
  _state$1 = new WeakMap();
  _deleted = new WeakMap();
  _initFunctions = new WeakMap();
  vs_utils.applyMixins(Component, [EventSource, DataflowNodeMixin]);

  var TaskState = /* @__PURE__ */ ((TaskState2) => {
    TaskState2[TaskState2["STARTED"] = 1] = "STARTED";
    TaskState2[TaskState2["STOPPED"] = 0] = "STOPPED";
    TaskState2[TaskState2["PAUSED"] = 2] = "PAUSED";
    return TaskState2;
  })(TaskState || {});

  var __defProp$4 = Object.defineProperty;
  var __typeError$7 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, key + "" , value);
  var __accessCheck$7 = (obj, member, msg) => member.has(obj) || __typeError$7("Cannot " + msg);
  var __privateGet$6 = (obj, member, getter) => (__accessCheck$7(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$7 = (obj, member, value) => member.has(obj) ? __typeError$7("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$5 = (obj, member, value, setter) => (__accessCheck$7(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$6 = (obj, member, method) => (__accessCheck$7(obj, member, "access private method"), method);
  var _signal, _onAbort, _state, _Task_instances, safeCall_fn, _listeners$1, addListener_fn$1, emit_fn$1, _run, createRun_fn, settleRun_fn;
  const EVENT_OF = {
    taskDidStart: "start",
    taskDidPause: "pause",
    taskDidResume: "resume",
    taskDidStop: "stop",
    taskDidEnd: "end"
  };
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
      __privateAdd$7(this, _Task_instances);
      /**
       *  @private
       */
      __privateAdd$7(this, _signal);
      /**
       *  @private
       */
      __privateAdd$7(this, _onAbort, () => {
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
      __publicField$4(this, "delegate");
      /********************************************************************
       States
       ********************************************************************/
      /**
       *	@private
       */
      __privateAdd$7(this, _state, TaskState.STOPPED);
      /********************************************************************
       Events
       ********************************************************************/
      /**
       *  @private
       */
      __privateAdd$7(this, _listeners$1, /* @__PURE__ */ new Map());
      /**
       *  The current run, from start() until the task ends or is stopped
       *  @private
       */
      __privateAdd$7(this, _run);
      this.delegate = delegate;
      if (signal) {
        __privateSet$5(this, _signal, signal);
        signal.addEventListener("abort", __privateGet$6(this, _onAbort), { once: true });
      }
    }
    /**
     *  Return the task State. <br />
     *  Possible values: {@link core.Task.STARTED},
     *  {@link core.Task.STOPPED},
     *  {@link core.Task.PAUSED}
     */
    get state() {
      return __privateGet$6(this, _state);
    }
    set state(state) {
      __privateSet$5(this, _state, state);
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
      __privateGet$6(this, _signal)?.removeEventListener("abort", __privateGet$6(this, _onAbort));
      this.stop();
      __privateGet$6(this, _listeners$1).clear();
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
      if (method === "taskDidEnd") __privateMethod$6(this, _Task_instances, settleRun_fn).call(this, "ended");
      else if (method === "taskDidStop") __privateMethod$6(this, _Task_instances, settleRun_fn).call(this, "stopped");
      const delegateCallback = this.delegate?.[method];
      if (delegateCallback) __privateMethod$6(this, _Task_instances, safeCall_fn).call(this, delegateCallback, this.delegate);
      __privateMethod$6(this, _Task_instances, emit_fn$1).call(this, EVENT_OF[method]);
      for (const group of taskGroups.get(this) ?? []) {
        const callback = group[method];
        if (callback) __privateMethod$6(this, _Task_instances, safeCall_fn).call(this, callback, group);
      }
    }
    /**
     *  Adds a listener called (synchronously) each time the task emits the
     *  event, right after its delegate. A listener is added only once per
     *  event.
     *
     *  @example
     *  const unsubscribe = task.on('end', () => console.log('done'));
     *  unsubscribe();
     *
     * @name core.Task#on
     * @function
     *
     * @param {TaskEvent} event 'start' | 'pause' | 'resume' | 'stop' | 'end'
     * @param {TaskListener} listener called with the task
     * @return {Function} a function removing the listener
     */
    on(event, listener) {
      return __privateMethod$6(this, _Task_instances, addListener_fn$1).call(this, event, listener, false);
    }
    /**
     *  Same as on(), but the listener is removed after its first call.
     *
     * @name core.Task#once
     * @function
     *
     * @param {TaskEvent} event 'start' | 'pause' | 'resume' | 'stop' | 'end'
     * @param {TaskListener} listener called with the task
     * @return {Function} a function removing the listener
     */
    once(event, listener) {
      return __privateMethod$6(this, _Task_instances, addListener_fn$1).call(this, event, listener, true);
    }
    /**
     *  Removes a listener added with on() or once().
     *  Without listener, removes all the listeners of the event.
     *
     * @name core.Task#off
     * @function
     *
     * @param {TaskEvent} event 'start' | 'pause' | 'resume' | 'stop' | 'end'
     * @param {TaskListener} listener the listener to remove [optional]
     */
    off(event, listener) {
      if (!listener) {
        __privateGet$6(this, _listeners$1).delete(event);
        return;
      }
      const entries = __privateGet$6(this, _listeners$1).get(event);
      const index = entries?.findIndex((entry) => entry.listener === listener) ?? -1;
      if (index !== -1) entries.splice(index, 1);
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
     *  Starts the task from its beginning.<br />
     *  The task must be stopped: never started, ended or stopped. Starting a
     *  started or paused task throws an Error (use resume() for a paused
     *  task).<br />
     *  Returns a promise resolved when this run finishes, with 'ended' when the
     *  task reached its end or 'stopped' when it was stopped before. It stays
     *  pending while the task is paused.
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
      if (this.state === TaskState.STARTED) {
        throw new Error(`Task ${this.id} is already started`);
      }
      if (this.state === TaskState.PAUSED) {
        throw new Error(`Task ${this.id} is paused, call resume() to resume it`);
      }
      if (__privateGet$6(this, _signal)?.aborted) {
        return Promise.resolve("stopped");
      }
      const run = __privateMethod$6(this, _Task_instances, createRun_fn).call(this);
      if (!this.doStart(param) && this.state === TaskState.STOPPED) {
        __privateMethod$6(this, _Task_instances, settleRun_fn).call(this, "ended");
      }
      return run.promise;
    }
  }
  _signal = new WeakMap();
  _onAbort = new WeakMap();
  _state = new WeakMap();
  _Task_instances = new WeakSet();
  /**
   *  Calls a listener, logging an exception instead of propagating it
   *  @private
   */
  safeCall_fn = function(callback, thisArg) {
    try {
      callback.call(thisArg, this);
    } catch (e) {
      const err = vs_utils.asError(e);
      if (err.stack) console.log(err.stack);
      console.error(err);
    }
  };
  _listeners$1 = new WeakMap();
  addListener_fn$1 = function(event, listener, once) {
    let entries = __privateGet$6(this, _listeners$1).get(event);
    if (!entries) {
      entries = [];
      __privateGet$6(this, _listeners$1).set(event, entries);
    }
    if (!entries.some((entry) => entry.listener === listener)) {
      entries.push({ listener, once });
    }
    return () => this.off(event, listener);
  };
  emit_fn$1 = function(event) {
    const entries = __privateGet$6(this, _listeners$1).get(event);
    if (!entries?.length) return;
    for (const entry of [...entries]) {
      if (entry.once) this.off(event, entry.listener);
      __privateMethod$6(this, _Task_instances, safeCall_fn).call(this, entry.listener, void 0);
    }
  };
  _run = new WeakMap();
  createRun_fn = function() {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    __privateSet$5(this, _run, { promise, resolve });
    return __privateGet$6(this, _run);
  };
  settleRun_fn = function(result) {
    const run = __privateGet$6(this, _run);
    if (!run) return;
    __privateSet$5(this, _run, void 0);
    run.resolve(result);
  };

  var __defProp$3 = Object.defineProperty;
  var __typeError$6 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, key + "" , value);
  var __accessCheck$6 = (obj, member, msg) => member.has(obj) || __typeError$6("Cannot " + msg);
  var __privateAdd$6 = (obj, member, value) => member.has(obj) ? __typeError$6("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod$5 = (obj, member, method) => (__accessCheck$6(obj, member, "access private method"), method);
  var _BaseTask_instances, detachAll_fn;
  class BaseTask extends Task {
    constructor(tasksAndParams, options) {
      super(options);
      __privateAdd$6(this, _BaseTask_instances);
      /********************************************************************
      
         ********************************************************************/
      /**
       *  Tasks with their own optional parameter (undefined when none)
       *  @private
       */
      __publicField$3(this, "tasksAndParams", []);
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
      __privateMethod$5(this, _BaseTask_instances, detachAll_fn).call(this);
      for (let taskAndParam of tasksAndParams) {
        if (!taskAndParam) {
          continue;
        }
        let task;
        let param;
        if (vs_utils.isArray(taskAndParam)) {
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
     *  Throws if one of the group tasks is running, since it could not be
     *  started by the group.
     *  @protected
     */
    checkTasksStopped() {
      const running = this.tasksAndParams.find(([task]) => task.state !== TaskState.STOPPED);
      if (running) {
        throw new Error(`Cannot start the group ${this.id}: its task ${running[0].id} is already running`);
      }
    }
    /**
     *  Stops the group and releases its tasks
     *  @protected
     */
    destructor() {
      super.destructor();
      __privateMethod$5(this, _BaseTask_instances, detachAll_fn).call(this);
    }
  }
  _BaseTask_instances = new WeakSet();
  detachAll_fn = function() {
    this.tasksAndParams.forEach(([task]) => detachFromGroup(task, this));
    this.tasksAndParams.length = 0;
  };

  var __typeError$5 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
  var __privateGet$5 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$4 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$4 = (obj, member, method) => (__accessCheck$5(obj, member, "access private method"), method);
  var _currentTask, _startParam, _SEQ_instances, startTask_fn, isCurrent_fn;
  const seq = (params, options) => new SEQ(params, options);
  class SEQ extends BaseTask {
    constructor() {
      super(...arguments);
      __privateAdd$5(this, _SEQ_instances);
      /********************************************************************
      
         ********************************************************************/
      /**
       *  Index of the running (or paused) task, -1 when the sequence is stopped
       *  @private
       */
      __privateAdd$5(this, _currentTask, -1);
      /**
       *  @private
       */
      __privateAdd$5(this, _startParam);
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
      this.checkTasksStopped();
      if (!__privateMethod$4(this, _SEQ_instances, startTask_fn).call(this, 0, param)) return false;
      this.notify("taskDidStart");
      return true;
    }
    /**
     *  Resumes the paused task of the sequence
     */
    resume() {
      if (this.state !== TaskState.PAUSED) {
        return false;
      }
      this.state = TaskState.STARTED;
      this.tasksAndParams[__privateGet$5(this, _currentTask)]?.[0].resume();
      this.notify("taskDidResume");
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
      const taskAndParams = this.tasksAndParams[__privateGet$5(this, _currentTask)];
      __privateSet$4(this, _currentTask, -1);
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
      this.tasksAndParams[__privateGet$5(this, _currentTask)]?.[0].pause();
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
      if (this.state === TaskState.STOPPED || !__privateMethod$4(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
      this.state = TaskState.STOPPED;
      __privateSet$4(this, _currentTask, -1);
      this.notify("taskDidStop");
    }
    /**
     *  The running task was paused by someone else than this sequence
     */
    taskDidPause(task) {
      if (this.state !== TaskState.STARTED || !__privateMethod$4(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
      this.state = TaskState.PAUSED;
      this.notify("taskDidPause");
    }
    /**
     *  The paused task was resumed by someone else than this sequence
     */
    taskDidResume(task) {
      if (this.state !== TaskState.PAUSED || !__privateMethod$4(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
      this.state = TaskState.STARTED;
      this.notify("taskDidResume");
    }
    /**
     */
    taskDidEnd(task) {
      if (this.state !== TaskState.STARTED || !__privateMethod$4(this, _SEQ_instances, isCurrent_fn).call(this, task)) return;
      if (__privateGet$5(this, _currentTask) + 1 < this.tasksAndParams.length) {
        __privateMethod$4(this, _SEQ_instances, startTask_fn).call(this, __privateGet$5(this, _currentTask) + 1, __privateGet$5(this, _startParam));
      } else {
        __privateSet$4(this, _currentTask, -1);
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
      __privateSet$4(this, _currentTask, -1);
      this.state = TaskState.STOPPED;
      return false;
    }
    __privateSet$4(this, _currentTask, index);
    this.state = TaskState.STARTED;
    __privateSet$4(this, _startParam, param);
    taskAndParams[0].start(this.paramFor(taskAndParams, param));
    return true;
  };
  /**
   *  Callbacks from tasks this sequence is not running are ignored (a task
   *  may belong to several groups)
   *  @private
   */
  isCurrent_fn = function(task) {
    return this.tasksAndParams[__privateGet$5(this, _currentTask)]?.[0] === task;
  };

  var __typeError$4 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
  var __privateGet$4 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var _runningTasks;
  const par = (params, options) => new PAR(params, options);
  class PAR extends BaseTask {
    constructor() {
      super(...arguments);
      /**
       * Tasks started and not yet ended (running or paused)
       *  @private
       */
      __privateAdd$4(this, _runningTasks, /* @__PURE__ */ new Set());
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
      this.checkTasksStopped();
      __privateGet$4(this, _runningTasks).clear();
      this.tasksAndParams.forEach(([task]) => __privateGet$4(this, _runningTasks).add(task));
      if (__privateGet$4(this, _runningTasks).size === 0) {
        return false;
      }
      this.state = TaskState.STARTED;
      for (let taskAndParams of this.tasksAndParams) {
        taskAndParams[0].start(this.paramFor(taskAndParams, param));
      }
      this.notify("taskDidStart");
      return true;
    }
    /**
     *  Resumes the tasks which have not ended yet
     */
    resume() {
      if (this.state !== TaskState.PAUSED) {
        return false;
      }
      this.state = TaskState.STARTED;
      __privateGet$4(this, _runningTasks).forEach((task) => task.resume());
      this.notify("taskDidResume");
      if (__privateGet$4(this, _runningTasks).size === 0) {
        this.state = TaskState.STOPPED;
        this.notify("taskDidEnd");
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
      const tasks = [...__privateGet$4(this, _runningTasks)];
      __privateGet$4(this, _runningTasks).clear();
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
      __privateGet$4(this, _runningTasks).forEach((task) => task.pause());
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
      if (this.state === TaskState.STOPPED || !__privateGet$4(this, _runningTasks).has(task)) return;
      __privateGet$4(this, _runningTasks).delete(task);
      if (__privateGet$4(this, _runningTasks).size === 0) {
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
     *  A task was resumed by someone else than this group: nothing to do,
     *  the group only tracks the end of its tasks.
     */
    taskDidResume(_task) {
    }
    /**
     */
    taskDidEnd(task) {
      if (this.state === TaskState.STOPPED || !__privateGet$4(this, _runningTasks).has(task)) return;
      __privateGet$4(this, _runningTasks).delete(task);
      if (this.state === TaskState.STARTED && __privateGet$4(this, _runningTasks).size === 0) {
        this.state = TaskState.STOPPED;
        this.notify("taskDidEnd");
      }
    }
  }
  _runningTasks = new WeakMap();

  var __typeError$3 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
  var __privateGet$3 = (obj, member, getter) => (__accessCheck$3(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$3 = (obj, member, value, setter) => (__accessCheck$3(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$3 = (obj, member, method) => (__accessCheck$3(obj, member, "access private method"), method);
  var _time, _leftTime, _timer, _startTime, _Wait_static, checkTime_fn, _Wait_instances, schedule_fn;
  const _Wait = class _Wait extends Task {
    constructor(time, options) {
      var _a;
      super(options);
      __privateAdd$3(this, _Wait_instances);
      /********************************************************************
      
         ********************************************************************/
      __privateAdd$3(this, _time, 0);
      __privateAdd$3(this, _leftTime, 0);
      __privateAdd$3(this, _timer, null);
      __privateAdd$3(this, _startTime, 0);
      __privateSet$3(this, _time, __privateMethod$3(_a = _Wait, _Wait_static, checkTime_fn).call(_a, time));
    }
    set time(v) {
      var _a;
      if (this.state !== TaskState.STOPPED) {
        throw new Error("Stop the task before changing the time");
      }
      __privateSet$3(this, _time, __privateMethod$3(_a = _Wait, _Wait_static, checkTime_fn).call(_a, v));
    }
    get time() {
      return __privateGet$3(this, _time);
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
      __privateSet$3(this, _leftTime, __privateGet$3(this, _time));
      __privateMethod$3(this, _Wait_instances, schedule_fn).call(this);
      this.notify("taskDidStart");
      return true;
    }
    /**
     *  Resumes the task for the time left
     */
    resume() {
      if (this.state !== TaskState.PAUSED) {
        return false;
      }
      __privateMethod$3(this, _Wait_instances, schedule_fn).call(this);
      this.notify("taskDidResume");
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
      if (__privateGet$3(this, _timer)) clearTimeout(__privateGet$3(this, _timer));
      __privateSet$3(this, _timer, null);
      __privateSet$3(this, _leftTime, __privateGet$3(this, _time));
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
      if (__privateGet$3(this, _timer)) clearTimeout(__privateGet$3(this, _timer));
      __privateSet$3(this, _timer, null);
      __privateSet$3(this, _leftTime, __privateGet$3(this, _leftTime) - Date.now() + __privateGet$3(this, _startTime));
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
  _Wait_instances = new WeakSet();
  schedule_fn = function() {
    this.state = TaskState.STARTED;
    __privateSet$3(this, _startTime, Date.now());
    __privateSet$3(this, _timer, setTimeout(() => {
      __privateSet$3(this, _timer, null);
      this.state = TaskState.STOPPED;
      this.notify("taskDidEnd");
    }, __privateGet$3(this, _leftTime)));
  };
  __privateAdd$3(_Wait, _Wait_static);
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

  var __defProp$2 = Object.defineProperty;
  var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  const _DataflowState = class _DataflowState {
    constructor(comp, df) {
      __publicField$2(this, "comp", comp);
      /**
       * The dataflows the node takes part in
       */
      __publicField$2(this, "dataflows", /* @__PURE__ */ new Set());
      /**
       * Set when the dataflow changed in properties of the node, until the
       * propagation reaches it
       */
      __publicField$2(this, "inputPropertyDidChange", false);
      _DataflowState.states.set(comp.id, this);
    }
    /**
     * Adds the node to a dataflow (the default dataflow by default), and
     * returns its state
     */
    static add(comp, df = vs_utils.container.get(DEFAULT_DATAFLOW)) {
      const state = _DataflowState.states.get(comp.id) ?? new _DataflowState(comp, df);
      state.dataflows.add(df);
      return state;
    }
    /**
     * The state of a node, undefined if it takes part in no dataflow
     */
    static get(id) {
      return _DataflowState.states.get(id);
    }
    /**
     * Propagates from the node, in each of its dataflows
     */
    propagate() {
      this.dataflows.forEach((df) => df.propagate(this.comp));
    }
    /**
     * Tells that in properties of the node changed: calls its
     * propertiesDidChange(), then propagates from the node.
     */
    inPropertyDidChange() {
      this.inputPropertyDidChange = true;
      this.comp.propertiesDidChange();
      this.propagate();
    }
    /**
     * Tells that out properties of the node changed: propagates from the node
     * (in each of its dataflows).
     */
    outPropertyChange() {
      this.inputPropertyDidChange = true;
      this.propagate();
    }
    /**
     * Alias of inPropertyDidChange()
     */
    propertyChange() {
      this.inPropertyDidChange();
    }
    /**
     * Pauses the propagation of the dataflows of the node
     */
    pausePropagation() {
      this.dataflows.forEach((df) => df.pausePropagation());
    }
    /**
     * Ends a pause of the dataflows of the node
     */
    restartPropagation() {
      this.dataflows.forEach((df) => df.restartPropagation());
    }
  };
  __publicField$2(_DataflowState, "states", /* @__PURE__ */ new Map());
  let DataflowState = _DataflowState;

  var __defProp$1 = Object.defineProperty;
  var __typeError$2 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, key + "" , value);
  var __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
  var __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$2 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$2 = (obj, member, method) => (__accessCheck$2(obj, member, "access private method"), method);
  var __privateWrapper$1 = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet$2(obj, member, value);
    },
    get _() {
      return __privateGet$2(obj, member, getter);
    }
  });
  var _logger, _isPropagating, _needsBuild, _optimizedEdges, _nodes, _edgesFrom, _listNode, _shouldNotPropagate, _dataflowNodes, _isSorted, _isCyclic, _DataFlow_instances, propagateFrom_fn, forgetMissingNodes_fn;
  function nodeOf(id) {
    return Component.instances.get(id);
  }
  let edgeIdCount = 1;
  function buildConnectParameters(src, outDesc, trg, inDesc) {
    const srcObj = vs_utils.isString(src) ? nodeOf(src) : src;
    if (!srcObj) {
      throw new Error(`Unknown component or not data flow compatible, with id ${src}`);
    }
    const trgObj = vs_utils.isString(trg) ? nodeOf(trg) : trg;
    if (!trgObj) {
      throw new Error(`Unknown component or not data flow compatible, with id ${trg}`);
    }
    const propertiesOut = vs_utils.isString(outDesc) ? [outDesc] : outDesc;
    const propertiesIn = vs_utils.isString(inDesc) ? [inDesc] : inDesc;
    return [srcObj, propertiesOut, trgObj, propertiesIn];
  }
  function arrayMin(indegrees) {
    const count = indegrees.length;
    if (count === 0) return -1;
    if (count === 1) return 0;
    let minIndex = 0;
    let min = indegrees[minIndex];
    for (let i = 1; i < indegrees.length; i++) {
      if (indegrees[i] < min) {
        min = indegrees[i];
        minIndex = i;
      }
    }
    return minIndex;
  }
  function generateGetters(obj, properties) {
    return properties.map((pName) => {
      const getter = obj.getPropertyDescriptor(pName)?.get;
      if (!getter) {
        throw new Error(`DataFlow: unknown out property "${pName}" of the node ${obj.id}`);
      }
      return getter;
    });
  }
  function generateSetters(obj, properties) {
    return properties.map((pName) => {
      const setter = obj.getPropertyDescriptor(pName)?.set;
      if (!setter) {
        throw new Error(`DataFlow: unknown in property "${pName}" of the node ${obj.id}`);
      }
      return setter;
    });
  }
  const _DataFlow = class _DataFlow {
    constructor() {
      __privateAdd$2(this, _DataFlow_instances);
      __privateAdd$2(this, _logger);
      __privateAdd$2(this, _isPropagating, false);
      // connections changed since the last build
      __privateAdd$2(this, _needsBuild, false);
      // edges from components Object[component.id] => Array[3] <Object, , properties>
      __privateAdd$2(this, _optimizedEdges, /* @__PURE__ */ new Map());
      // ordered node list Array<Object>
      __privateAdd$2(this, _nodes, []);
      __privateAdd$2(this, _edgesFrom, /* @__PURE__ */ new Map());
      __privateAdd$2(this, _listNode, []);
      __privateAdd$2(this, _shouldNotPropagate, 0);
      __privateAdd$2(this, _dataflowNodes, []);
      __privateAdd$2(this, _isSorted, false);
      __privateAdd$2(this, _isCyclic, false);
    }
    // resolved when first needed, console when no LOGGER is registered
    get logger() {
      if (!__privateGet$2(this, _logger)) {
        try {
          __privateSet$2(this, _logger, vs_utils.container.get(LOGGER));
        } catch {
          __privateSet$2(this, _logger, consoleLogger);
        }
      }
      return __privateGet$2(this, _logger);
    }
    propagateValues(objSrc) {
      const cConnections = __privateGet$2(this, _optimizedEdges).get(objSrc.id);
      if (!cConnections) {
        return;
      }
      for (let cConnection of cConnections) {
        const objTrg = cConnection.obj;
        for (let edge of cConnection.cEdges) {
          let params = [];
          for (let getter of edge.getters) {
            params.push(getter.call(objSrc));
          }
          if (vs_utils.isFunction(edge.func)) {
            params = edge.func.apply(void 0, params);
            if (!vs_utils.isArray(params)) {
              params = [params];
            }
          }
          if (params.length !== edge.setters.length) {
            this.logger.error("Dataflow, invalid parameters");
            continue;
          }
          for (let l = 0; l < edge.setters.length; l++) {
            edge.setters[l].call(objTrg, params[l]);
          }
          cConnection.state.inputPropertyDidChange = true;
        }
      }
    }
    /**
     *  Propagates the values from a node along the connections, then from each
     *  reached node, in the sorted order: each reached node gets its
     *  propertiesDidChange() called, before its values are propagated (unless
     *  it returns true).<br />
     *  Does nothing while paused, or when called during a propagation (a node
     *  setting a property during the propagation).
     *
     * @param {DataflowNode} obj the node whose properties changed
     * @param {Boolean} outputPropagation true when only the out properties of
     *        the node changed: its propertiesDidChange() is not called first.
     *        False by default: its in properties changed.
     */
    propagate(obj, outputPropagation = false) {
      if (__privateGet$2(this, _isPropagating) || __privateGet$2(this, _shouldNotPropagate)) {
        return;
      }
      if (__privateGet$2(this, _needsBuild)) {
        this.build();
      }
      __privateSet$2(this, _isPropagating, true);
      _DataFlow.propagationCount++;
      try {
        __privateMethod$2(this, _DataFlow_instances, propagateFrom_fn).call(this, obj, outputPropagation);
      } finally {
        _DataFlow.propagationCount--;
        __privateSet$2(this, _isPropagating, false);
      }
    }
    /**
     *  Connects out properties of the source to in properties of the target.
     *  The nodes take part in this dataflow (see DataflowState).<br />
     *  Without function, the values are copied one by one: there must be as
     *  many out as in properties. With a function, it is called with the out
     *  values and returns the in values: an array, or a single value for one
     *  in property; the numbers of properties may differ.<br />
     *  Throws for an unknown node or property, an in property of the source
     *  or an out property of the target (see Model), or different numbers of
     *  properties without function.<br />
     *  Call build() once the connections are done, before propagating.
     *
     *  @example
     *  df.connect(a, 'value', b, 'value');
     *  df.connect(a, ['x', 'y'], b, 'distance', (x, y) => Math.hypot(x, y));
     *
     * @param {ObjectId|DataflowNode} src the source node, or its id
     * @param {String|Array} outDesc the out property(ies) of the source
     * @param {ObjectId|DataflowNode} trg the target node, or its id
     * @param {String|Array} inDesc the in property(ies) of the target
     * @param {Function} func maps the out values to the in values [optional]
     * @return {number} the id of the connection (see disconnect)
     */
    connect(src, outDesc, trg, inDesc, func) {
      const [srcObj, propertiesOut, trgObj, propertiesIn] = buildConnectParameters(src, outDesc, trg, inDesc);
      if (!func && propertiesIn.length !== propertiesOut.length) {
        throw new Error("DataFlow.connect, parameter error: as many out as in properties are needed without function");
      }
      generateGetters(srcObj, propertiesOut);
      generateSetters(trgObj, propertiesIn);
      for (const property of propertiesOut) {
        if (srcObj.getPropertyDirection(property) === "in") {
          throw new Error(`DataFlow.connect: "${property}" of ${srcObj.id} is an in property, it can not be connected from`);
        }
      }
      for (const property of propertiesIn) {
        if (trgObj.getPropertyDirection(property) === "out") {
          throw new Error(`DataFlow.connect: "${property}" of ${trgObj.id} is an out property, it can not be connected to`);
        }
      }
      DataflowState.add(srcObj, this);
      DataflowState.add(trgObj, this);
      if (!__privateGet$2(this, _listNode).includes(srcObj.id)) __privateGet$2(this, _listNode).push(srcObj.id);
      if (!__privateGet$2(this, _listNode).includes(trgObj.id)) __privateGet$2(this, _listNode).push(trgObj.id);
      let connections = __privateGet$2(this, _edgesFrom).get(srcObj.id);
      if (!connections) {
        connections = [];
        __privateGet$2(this, _edgesFrom).set(srcObj.id, connections);
      }
      let edges = connections.find((connection) => connection[0] === trgObj.id)?.[2];
      if (!edges) {
        edges = [];
        connections.push([trgObj.id, 1, edges]);
      }
      const edgeId = edgeIdCount++;
      edges.push({
        id: edgeId,
        out: propertiesOut.slice(),
        in: propertiesIn.slice(),
        func
      });
      __privateSet$2(this, _needsBuild, true);
      return edgeId;
    }
    disconnect(src, outDesc, trg, inDesc) {
      __privateSet$2(this, _needsBuild, true);
      if (vs_utils.isNumber(src)) {
        this.disconnectById(src);
      } else {
        const [srcObj, propertiesOut, trgObj, propertiesIn] = buildConnectParameters(src, outDesc, trg, inDesc);
        this.disconnectByParams(srcObj, propertiesOut, trgObj, propertiesIn);
      }
    }
    /**
     * Removes connections by their nodes and properties (see disconnect)
     *
     * @protected
     * @param {DataflowNode} srcObj the source node
     * @param {Array} propertiesOut the out properties of the source
     * @param {DataflowNode} trgObj the target node
     * @param {Array} propertiesIn the in properties of the target
     */
    disconnectByParams(srcObj, propertiesOut, trgObj, propertiesIn) {
      const connections = __privateGet$2(this, _edgesFrom).get(srcObj.id);
      if (!connections) {
        return;
      }
      function removeProperties(sources, list) {
        list.forEach((data) => {
          const index = sources.indexOf(data);
          if (index !== -1) sources.splice(index, 1);
        });
      }
      for (let i = 0; i < connections.length; ) {
        const connection = connections[i];
        if (connection[0] === trgObj.id) {
          const edges = connection[2];
          for (let j = 0; j < edges.length; ) {
            const edge = edges[j];
            removeProperties(edge.out, propertiesOut);
            removeProperties(edge.in, propertiesIn);
            if (edge.out.length === 0 || edge.in.length === 0) {
              edges.splice(j, 1);
            } else j++;
          }
          if (edges.length === 0) {
            connections.splice(i, 1);
          } else i++;
        } else i++;
      }
    }
    /**
     * Removes a connection by its id (see disconnect)
     *
     * @protected
     * @param {Number} edgeId the id returned by connect
     */
    disconnectById(edgeId) {
      __privateGet$2(this, _edgesFrom).forEach((connections, cid) => {
        if (connections) {
          for (let i = 0; i < connections.length; i++) {
            const connection = connections[i];
            const edges = connection[2];
            for (let j = 0; j < edges.length; j++) {
              const edge = edges[j];
              if (edge.id === edgeId) {
                edges.splice(j, 1);
                if (edges.length === 0) {
                  connections.splice(i, 1);
                  if (connections.length === 0) {
                    __privateGet$2(this, _edgesFrom).delete(cid);
                  }
                }
                return;
              }
            }
          }
        }
      });
    }
    /**
     * Sorts the nodes topologically, for the propagation order (see build).<p>
     * Returns true if the graph is acyclic, false otherwise. When the graph is
     * cyclic, the nodes are partially ordered, and a warning is logged.
     *
     * @protected
     * @return {boolean} true if the graph is acyclic
     */
    sort() {
      const indegrees = new Array(__privateGet$2(this, _listNode).length).fill(0);
      __privateGet$2(this, _edgesFrom).forEach((connections) => {
        for (let connection of connections) {
          const cid = connection[0];
          const index = __privateGet$2(this, _listNode).indexOf(cid);
          if (index === -1) {
            throw new Error("Sort, unknown id");
          }
          indegrees[index]++;
        }
      });
      const pending = __privateGet$2(this, _listNode).slice();
      const sorted = [];
      let violationCount = 0;
      while (pending.length !== 0) {
        const minI = arrayMin(indegrees);
        const indegree = indegrees[minI];
        indegrees.splice(minI, 1);
        const nId = pending[minI];
        pending.splice(minI, 1);
        if (indegree > 0) {
          violationCount++;
        }
        sorted.push(nId);
        const connections = __privateGet$2(this, _edgesFrom).get(nId);
        if (connections !== void 0) {
          for (let connection of connections) {
            const mi = pending.indexOf(connection[0]);
            if (mi !== -1) {
              indegrees[mi]--;
            }
          }
        }
      }
      __privateSet$2(this, _listNode, sorted);
      __privateSet$2(this, _isSorted, true);
      __privateSet$2(this, _isCyclic, violationCount > 0);
      if (violationCount > 0) {
        const edgeCount = __privateGet$2(this, _edgesFrom).size;
        this.logger.warn(
          "WARNING: Cycles detected during topological sort.%d dependencies out of %d have been violated.\n",
          violationCount,
          edgeCount
        );
      }
      return !__privateGet$2(this, _isCyclic);
    }
    /**
     *  Starts a chain of connections from properties of a component, on this
     *  dataflow (see connect() for the default dataflow).
     *
     *  @example
     *  df.from(slider.$.value).map(v => `${v}°`).to(label.$.text);
     *
     * @param {PropertyRef} sources the properties to connect from
     * @return {Pipe} the pipe from these properties
     */
    from(...sources) {
      return createPipe(this, sources);
    }
    /**
     *  Compiles the dataflow: sorts the nodes and compiles the connections.
     *  It is done automatically by the next propagation after connecting or
     *  disconnecting; calling it explicitly compiles the dataflow at once.
     *  The destroyed components and their connections are forgotten.
     */
    build() {
      __privateMethod$2(this, _DataFlow_instances, forgetMissingNodes_fn).call(this);
      __privateSet$2(this, _needsBuild, false);
      this.sort();
      this.optimize(__privateGet$2(this, _edgesFrom), __privateGet$2(this, _listNode));
    }
    /**
     *  Pauses the propagation: propagate() does nothing until
     *  restartPropagation() is called as many times.
     */
    pausePropagation() {
      __privateWrapper$1(this, _shouldNotPropagate)._++;
    }
    /**
     *  Ends a pause (see pausePropagation). It does not propagate the changes
     *  made during the pause: call propagate() for that.
     */
    restartPropagation() {
      __privateWrapper$1(this, _shouldNotPropagate)._--;
      if (__privateGet$2(this, _shouldNotPropagate) < 0) {
        __privateSet$2(this, _shouldNotPropagate, 0);
      }
    }
    /**
     * Compiles the connections: resolves the nodes, and the getters and
     * setters of the connected properties
     */
    optimize(edgeRefs, nodeList) {
      __privateGet$2(this, _dataflowNodes).length = 0;
      for (let id of nodeList) {
        const obj = nodeOf(id);
        if (obj) {
          __privateGet$2(this, _dataflowNodes).push(obj);
        }
      }
      __privateGet$2(this, _optimizedEdges).clear();
      for (const [id, data] of edgeRefs.entries()) {
        const objSrc = vs_utils.defined(nodeOf(id));
        const compiledConnections = [];
        __privateGet$2(this, _optimizedEdges).set(id, compiledConnections);
        for (let connections of data) {
          const cid = connections[0];
          const objTrg = vs_utils.defined(nodeOf(cid));
          const compiledConnection = {
            obj: objTrg,
            other: connections[1],
            cEdges: [],
            state: DataflowState.get(objTrg.id)
          };
          compiledConnections.push(compiledConnection);
          const edges = connections[2];
          for (let edge of edges) {
            const compiledEdge = {
              id: edge.id,
              getters: [],
              setters: [],
              func: edge.func
            };
            compiledConnection.cEdges.push(compiledEdge);
            compiledEdge.getters = generateGetters(objSrc, edge.out);
            compiledEdge.setters = generateSetters(objTrg, edge.in);
          }
        }
      }
    }
  };
  _logger = new WeakMap();
  _isPropagating = new WeakMap();
  _needsBuild = new WeakMap();
  _optimizedEdges = new WeakMap();
  _nodes = new WeakMap();
  _edgesFrom = new WeakMap();
  _listNode = new WeakMap();
  _shouldNotPropagate = new WeakMap();
  _dataflowNodes = new WeakMap();
  _isSorted = new WeakMap();
  _isCyclic = new WeakMap();
  _DataFlow_instances = new WeakSet();
  propagateFrom_fn = function(obj, outputPropagation) {
    let i = 0;
    const l = __privateGet$2(this, _dataflowNodes).length;
    if (obj) {
      while (i < l && __privateGet$2(this, _dataflowNodes)[i] !== obj) {
        i++;
      }
      if (i < l) {
        if (!outputPropagation && obj.propertiesDidChange()) {
          return;
        }
        this.propagateValues(obj);
        i++;
      } else {
        i = 0;
      }
    }
    for (; i < l; i++) {
      const nextObj = __privateGet$2(this, _dataflowNodes)[i];
      const state = DataflowState.get(nextObj.id);
      if (state?.inputPropertyDidChange) {
        state.inputPropertyDidChange = false;
        if (nextObj.propertiesDidChange?.() !== true) {
          this.propagateValues(nextObj);
        }
      }
    }
  };
  /**
   * Forgets the nodes which do not exist anymore (destroyed components),
   * and their connections
   */
  forgetMissingNodes_fn = function() {
    for (const id of [...__privateGet$2(this, _edgesFrom).keys()]) {
      if (!nodeOf(id)) __privateGet$2(this, _edgesFrom).delete(id);
    }
    for (const connections of __privateGet$2(this, _edgesFrom).values()) {
      for (let i = connections.length - 1; i >= 0; i--) {
        if (!nodeOf(connections[i][0])) connections.splice(i, 1);
      }
    }
    __privateSet$2(this, _listNode, __privateGet$2(this, _listNode).filter((id) => nodeOf(id)));
  };
  __publicField$1(_DataFlow, "propagationCount", 0);
  let DataFlow = _DataFlow;
  vs_utils.container.registerFactory(DEFAULT_DATAFLOW, () => new DataFlow());

  var __typeError$1 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
  var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod$1 = (obj, member, method) => (__accessCheck$1(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet$1(obj, member, value);
    },
    get _() {
      return __privateGet$1(obj, member, getter);
    }
  });
  var _listeners, _batchDepth, _pendingChanges, _Model_instances, flushChanges_fn, addListener_fn, emit_fn;
  const declaredProperties = /* @__PURE__ */ new WeakMap();
  function declareProperty(model, name, direction) {
    let properties = declaredProperties.get(model);
    if (!properties) {
      properties = /* @__PURE__ */ new Map();
      declaredProperties.set(model, properties);
    }
    properties.set(name, direction);
  }
  function sameValue(a, b) {
    if (Object.is(a, b)) return true;
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
  }
  function getterOf(obj, name) {
    for (let o = obj; o; o = Object.getPrototypeOf(o)) {
      const descriptor = Object.getOwnPropertyDescriptor(o, name);
      if (descriptor) return descriptor.get;
    }
    return void 0;
  }
  function propertyDecorator(direction, decoratorName) {
    return function(target, context) {
      if (context.static || context.private) {
        throw new Error(`@${decoratorName}: a model property must be a public instance accessor or setter`);
      }
      const name = String(context.name);
      context.addInitializer(function() {
        declareProperty(this, name, direction);
      });
      if (context.kind === "accessor") {
        const accessor = target;
        return {
          set(value) {
            const previous = accessor.get.call(this);
            accessor.set.call(this, value);
            if (!Object.is(previous, value)) {
              this.propertyChange(name);
            }
          }
        };
      }
      const setter = target;
      return function(value) {
        const getter = getterOf(this, name);
        const previous = getter?.call(this);
        setter.call(this, value);
        if (!getter || !sameValue(previous, getter.call(this))) {
          this.propertyChange(name);
        }
      };
    };
  }
  const In = propertyDecorator("in", "In");
  const Out = propertyDecorator("out", "Out");
  const InOut = propertyDecorator("inout", "InOut");
  class Model extends Component {
    constructor() {
      super(...arguments);
      __privateAdd$1(this, _Model_instances);
      __privateAdd$1(this, _listeners, /* @__PURE__ */ new Map());
      __privateAdd$1(this, _batchDepth, 0);
      __privateAdd$1(this, _pendingChanges, /* @__PURE__ */ new Set());
    }
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The names of the declared model properties, in declaration order
     */
    get modelProperties() {
      return [...declaredProperties.get(this)?.keys() ?? []];
    }
    /**
     * @see modelProperties (used by the dataflow)
     */
    getModelProperties() {
      return this.modelProperties;
    }
    /**
     * The direction of a declared model property, undefined for another one
     */
    getPropertyDirection(propName) {
      return declaredProperties.get(this)?.get(propName);
    }
    /**
     *  Sets several model properties, with one notification (see batch).
     *  Throws, without changing the model, for a name which is not a model
     *  property.
     *
     * @param {Object} values the values, by property name
     */
    assign(values) {
      const properties = declaredProperties.get(this);
      for (const name of Object.keys(values)) {
        if (!properties?.has(name)) {
          throw new Error(`Model.assign: "${name}" is not a model property of ${this.id}`);
        }
      }
      this.batch(() => {
        for (const [name, value] of Object.entries(values)) {
          this[name] = value;
        }
      });
    }
    /*****************************************************************
     *  Change notification
     ****************************************************************/
    /**
     *  Notifies the change of a property: the model properties do it when
     *  they are set to a different value. Call it after changing a value in
     *  place (e.g. adding an item to an array property).
     *
     * @param {string} property the name of the changed property
     */
    propertyChange(property) {
      __privateGet$1(this, _pendingChanges).add(property);
      if (__privateGet$1(this, _batchDepth) === 0) {
        __privateMethod$1(this, _Model_instances, flushChanges_fn).call(this);
      }
    }
    /**
     *  Runs the function, and notifies the properties it changed once it
     *  returns (or throws): each 'change:<property>' event once, then one
     *  'change' event, then the dataflow propagation. Batches can be nested.
     *
     * @param {Function} func the function changing the model
     * @return the result of the function
     */
    batch(func) {
      __privateWrapper(this, _batchDepth)._++;
      try {
        return func();
      } finally {
        __privateWrapper(this, _batchDepth)._--;
        if (__privateGet$1(this, _batchDepth) === 0) {
          __privateMethod$1(this, _Model_instances, flushChanges_fn).call(this);
        }
      }
    }
    on(event, listener) {
      return __privateMethod$1(this, _Model_instances, addListener_fn).call(this, event, listener, false);
    }
    once(event, listener) {
      return __privateMethod$1(this, _Model_instances, addListener_fn).call(this, event, listener, true);
    }
    /**
     *  Removes a listener added with on() or once(). Without listener,
     *  removes all the listeners of the event.
     */
    off(event, listener) {
      if (!listener) {
        __privateGet$1(this, _listeners).delete(event);
        return;
      }
      const entries = __privateGet$1(this, _listeners).get(event);
      const index = entries?.findIndex((entry) => entry.listener === listener) ?? -1;
      if (index !== -1) entries.splice(index, 1);
    }
    /**
     *  Emits an event of the subclass to its listeners (see on), synchronously.
     *  An exception thrown by a listener is logged.
     *
     * @param {string} event the event
     * @param {...any} args the arguments given to the listeners, after the model
     */
    emit(event, ...args) {
      __privateMethod$1(this, _Model_instances, emit_fn).call(this, event, args);
    }
    /*****************************************************************
     *  Life cycle and serialization
     ****************************************************************/
    destructor() {
      __privateGet$1(this, _listeners).clear();
      super.destructor();
    }
    /**
     *  Serializes the id and the model properties
     */
    serialize() {
      const data = super.serialize();
      for (const name of this.modelProperties) {
        data[name] = this[name];
      }
      return data;
    }
    /**
     *  Sets the model properties present in the data (see assign); the other
     *  data (e.g. the id) is ignored.
     */
    deserialize(data) {
      const properties = declaredProperties.get(this);
      const values = {};
      for (const [name, value] of Object.entries(data ?? {})) {
        if (properties?.has(name)) values[name] = value;
      }
      this.assign(values);
    }
  }
  _listeners = new WeakMap();
  _batchDepth = new WeakMap();
  _pendingChanges = new WeakMap();
  _Model_instances = new WeakSet();
  flushChanges_fn = function() {
    if (__privateGet$1(this, _pendingChanges).size === 0) return;
    const properties = [...__privateGet$1(this, _pendingChanges)];
    __privateGet$1(this, _pendingChanges).clear();
    for (const property of properties) {
      __privateMethod$1(this, _Model_instances, emit_fn).call(this, `change:${property}`, [property]);
    }
    __privateMethod$1(this, _Model_instances, emit_fn).call(this, "change", [properties]);
    const state = DataflowState.get(this.id);
    if (state) {
      const outputPropagation = properties.every((property) => this.getPropertyDirection(property) === "out");
      state.dataflows.forEach((dataflow) => dataflow.propagate(this, outputPropagation));
    }
  };
  addListener_fn = function(event, listener, once) {
    let entries = __privateGet$1(this, _listeners).get(event);
    if (!entries) {
      entries = [];
      __privateGet$1(this, _listeners).set(event, entries);
    }
    if (!entries.some((entry) => entry.listener === listener)) {
      entries.push({ listener, once });
    }
    return () => this.off(event, listener);
  };
  emit_fn = function(event, args) {
    const entries = __privateGet$1(this, _listeners).get(event);
    if (!entries?.length) return;
    for (const entry of [...entries]) {
      if (entry.once) this.off(event, entry.listener);
      try {
        entry.listener(this, ...args);
      } catch (e) {
        const err = vs_utils.asError(e);
        if (err.stack) console.log(err.stack);
        console.error(err);
      }
    }
  };

  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var _listOfState, _listInput, _listOutput, _initialState, _currentState, _inputs, _outputAction, _Fsm_instances, checkState_fn, checkInput_fn, checkOutput_fn;
  class State {
    constructor() {
      __publicField(this, "transitionEvents", /* @__PURE__ */ new Map());
    }
  }
  class Fsm extends Component {
    constructor(owner) {
      super();
      __publicField(this, "owner", owner);
      __privateAdd(this, _Fsm_instances);
      __privateAdd(this, _listOfState, /* @__PURE__ */ new Map());
      ///< List of fsm state : Q
      __privateAdd(this, _listInput, /* @__PURE__ */ new Set());
      ///< List of input lexeme (alphabet) : I
      __privateAdd(this, _listOutput, /* @__PURE__ */ new Set());
      ///< List of output lexeme (alphabet) : O
      __privateAdd(this, _initialState, "");
      ///< initial state name
      __privateAdd(this, _currentState, "");
      ///< current state name
      __privateAdd(this, _inputs, /* @__PURE__ */ new Map());
      __privateAdd(this, _outputAction, /* @__PURE__ */ new Map());
      /**
       *  Receives the events bound by setInput(), and notifies their inputs
       *  @private
       *
       * @param {Event} event the event
       */
      __publicField(this, "handleEvent", (event) => {
        const a = event.src && __privateGet(this, _inputs).get(event.src);
        if (!a) {
          return;
        }
        for (let [spec, on] of a) {
          if (event.type !== spec) continue;
          if (!__privateGet(this, _listOfState).has(__privateGet(this, _currentState))) {
            continue;
          }
          this.fsmNotify(on, event.data);
        }
      });
    }
    /**
     *  The initial state, used by activate(); '' for none.
     *  Setting an unknown state throws.
     *
     *  @name core.Fsm#initialState
     *  @param {string} stateId the state
     */
    set initialState(stateId) {
      if (!stateId) {
        __privateSet(this, _initialState, "");
        return;
      }
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, stateId);
      __privateSet(this, _initialState, stateId);
    }
    /**
     * @ignore
     */
    get initialState() {
      return __privateGet(this, _initialState);
    }
    /**
     *  The current state (read only): '' until the fsm is activated, or when
     *  the current state is removed or the fsm is cleared.
     *
     *  @name core.Fsm#currentState
     */
    get currentState() {
      return __privateGet(this, _currentState);
    }
    /**
     *  Declares the states, inputs, outputs and transitions of the fsm.
     *  Throws, without changing the fsm, if:
     *  <ul>
     *    <li />a list is missing;
     *    <li />a state is empty, listed twice or already declared;
     *    <li />an input or an output is empty;
     *    <li />a transition uses a state, an input or an output which is
     *      neither declared nor listed.
     *  </ul>
     *  Inputs and outputs already declared, or listed twice, are accepted.
     *
     *  @example
     *  // 1 -a/x-> 2 -b-> 1
     *  fsm.initWithData(['1', '2'], ['a', 'b'], ['x'], [
     *    { from: '1', to: '2', on: 'a', output: 'x' },
     *    { from: '2', to: '1', on: 'b', output: '' },
     *  ]);
     *
     * @param {Array<string>} states the states
     * @param {Array<string>} inputs the inputs
     * @param {Array<string>} outputs the outputs
     * @param {Array<Transition>} transitions the transitions {from, to, on, output}
     */
    initWithData(states, inputs, outputs, transitions) {
      if (!states || !inputs || !outputs || !transitions) {
        throw new TypeError("Fsm.initWithData: states, inputs, outputs and transitions are mandatory");
      }
      const listed = /* @__PURE__ */ new Set();
      for (const state of states) {
        if (!state) {
          throw new Error("Fsm.initWithData: a state is empty");
        }
        if (listed.has(state) || this.existState(state)) {
          throw new Error(`Fsm.initWithData: duplicate state "${state}"`);
        }
        listed.add(state);
      }
      if (inputs.some((input) => !input)) {
        throw new Error("Fsm.initWithData: an input is empty");
      }
      if (outputs.some((output) => !output)) {
        throw new Error("Fsm.initWithData: an output is empty");
      }
      const allStates = /* @__PURE__ */ new Set([...__privateGet(this, _listOfState).keys(), ...states]);
      const allInputs = /* @__PURE__ */ new Set([...__privateGet(this, _listInput), ...inputs]);
      const allOutputs = /* @__PURE__ */ new Set([...__privateGet(this, _listOutput), ...outputs]);
      for (const { from, to, on, output } of transitions) {
        for (const state of [from, to]) {
          if (!allStates.has(state)) throw new Error(`Fsm.initWithData: unknown state "${state}"`);
        }
        if (!allInputs.has(on)) throw new Error(`Fsm.initWithData: unknown input "${on}"`);
        if (output && !allOutputs.has(output)) throw new Error(`Fsm.initWithData: unknown output "${output}"`);
      }
      states.forEach((state) => this.addState(state));
      inputs.forEach((input) => this.addInput(input));
      outputs.forEach((output) => this.addOutput(output));
      transitions.forEach((transition) => this.addTransition(
        transition.from,
        transition.to,
        transition.on,
        transition.output
      ));
    }
    /**
     *  Declares the fsm from a state x state matrix:
     *  <ul>
     *    <li />the first row lists the "to" states, and declares them;
     *    <li />the first column lists the "from" states, which must be in the
     *      first row;
     *    <li />each other cell is empty (no transition), or the transition from
     *      the state of its row to the state of its column, as "input",
     *      "input/" or "input/output". Its input and output are declared.
     *  </ul>
     *  Throws, without changing the fsm, if the first row is missing, if a
     *  cell has no input (e.g. "/o"), if a state is twice in the first row or
     *  the first column, or for any reason initWithData() throws (e.g. a row's
     *  state which is not in the first row).
     *
     *  @example
     *  // 1 -a-> 2 -b/x-> 3 -c-> 1
     *  fsm.initWithMatrix([
     *    ['',  '1',  '2',  '3'  ],
     *    ['1', '',   'a',  ''   ],
     *    ['2', '',   '',   'b/x'],
     *    ['3', 'c/', '',   ''   ],
     *  ]);
     *
     * @param {Array<Array<string>>} matrix
     */
    initWithMatrix(matrix) {
      if (!matrix?.[0]) {
        throw new TypeError("Fsm.initWithMatrix: the matrix needs a first row listing the states");
      }
      const states = matrix[0].slice(1);
      const inputs = /* @__PURE__ */ new Set();
      const outputs = /* @__PURE__ */ new Set();
      const transitions = [];
      const rowStates = /* @__PURE__ */ new Set();
      for (let i = 1; i < matrix.length; i++) {
        const from = matrix[i][0];
        if (rowStates.has(from)) {
          throw new Error(`Fsm.initWithMatrix: the state "${from}" has two rows`);
        }
        rowStates.add(from);
        for (let j = 1; j < matrix[0].length; j++) {
          const to = matrix[0][j];
          const i_o = matrix[i][j];
          if (!i_o) continue;
          const [on, output] = i_o.split("/");
          if (!on) {
            throw new Error(`Fsm.initWithMatrix: the transition "${i_o}" from "${from}" to "${to}" has no input`);
          }
          inputs.add(on);
          if (output) outputs.add(output);
          transitions.push({ from, to, on, output: output ?? "" });
        }
      }
      this.initWithData(states, [...inputs], [...outputs], transitions);
    }
    /*******************************************
     Managing inputs
     *******************************************/
    /**
     *  Declares an input (a word of the input alphabet).
     *  Declaring it again does nothing; an empty input throws.
     *
     * @param {string} input the input
     */
    addInput(input) {
      if (!input) {
        throw new Error("Fsm.addInput: the input is empty");
      }
      if (this.existInput(input)) {
        return;
      }
      __privateGet(this, _listInput).add(input);
    }
    /**
     *  Returns the declared inputs
     *
     * @return {Iterator<string>} the inputs
     */
    getInputs() {
      return __privateGet(this, _listInput).values();
    }
    /**
     *  Tests if an input is declared
     *
     * @param {string} input the input
     * @return {boolean} true if it is declared
     */
    existInput(input) {
      return __privateGet(this, _listInput).has(input);
    }
    /*******************************************
     Managing outputs
     *******************************************/
    /**
     *  Declares an output (a word of the output alphabet).
     *  Declaring it again does nothing; an empty output throws.
     *
     * @param {string} output the output
     */
    addOutput(output) {
      if (!output) {
        throw new Error("Fsm.addOutput: the output is empty");
      }
      if (this.existOutput(output)) {
        return;
      }
      __privateGet(this, _listOutput).add(output);
    }
    /**
     *  Returns the declared outputs
     *
     * @return {Iterator<string>} the outputs
     */
    getOutputs() {
      return __privateGet(this, _listOutput).values();
    }
    /**
     *  Tests if an output is declared
     *
     * @param {string} output the output
     * @return {boolean} true if it is declared
     */
    existOutput(output) {
      return __privateGet(this, _listOutput).has(output);
    }
    /*******************************************
     Managing States
     *******************************************/
    /**
     *  Declares a state
     *
     * @param {string} name the state name
     * @return {boolean} false if the name is empty or the state already exists
     */
    addState(name) {
      if (!name || this.existState(name)) {
        return false;
      }
      const state = new State();
      __privateGet(this, _listOfState).set(name, state);
      return true;
    }
    /**
     *  Removes a state, and the transitions to it.
     *  The initial and current states become '' if they were the removed state.
     *
     * @param {string} name the state name
     * @return {boolean} false if the state does not exist
     */
    removeState(name) {
      if (!name || !this.existState(name)) {
        return false;
      }
      __privateGet(this, _listOfState).delete(name);
      for (const state of __privateGet(this, _listOfState).values()) {
        for (const [on, arc] of state.transitionEvents) {
          if (arc.to === name) state.transitionEvents.delete(on);
        }
      }
      if (__privateGet(this, _initialState) === name) __privateSet(this, _initialState, "");
      if (__privateGet(this, _currentState) === name) __privateSet(this, _currentState, "");
      return true;
    }
    /**
     *  Renames a state. The transitions to it, and the initial and current
     *  states, follow.
     *
     * @param {string} oldName the old state name
     * @param {string} newName the new state name
     * @return {boolean} false if the old state does not exist or the new one
     *         already exists
     */
    renameState(oldName, newName) {
      if (!oldName || !this.existState(oldName) || !newName || this.existState(newName)) {
        return false;
      }
      __privateGet(this, _listOfState).set(newName, __privateGet(this, _listOfState).get(oldName));
      __privateGet(this, _listOfState).delete(oldName);
      if (__privateGet(this, _initialState) === oldName) {
        __privateSet(this, _initialState, newName);
      }
      if (__privateGet(this, _currentState) === oldName) {
        __privateSet(this, _currentState, newName);
      }
      for (const state of __privateGet(this, _listOfState).values()) {
        for (const t of state?.transitionEvents.values() ?? []) {
          if (t.to === oldName) {
            t.to = newName;
          }
        }
      }
      return true;
    }
    /**
     *  Returns the names of the states
     *
     * @return {Iterator<string>} the states
     */
    getListState() {
      return __privateGet(this, _listOfState).keys();
    }
    /**
     *  Tests if a state is declared
     *
     * @param {string} state the state
     * @return {boolean} true if it is declared
     */
    existState(state) {
      return __privateGet(this, _listOfState).has(state);
    }
    /**
     *  Adds the transition from the state "from" to the state "to", on the
     *  input "on". It replaces the transition of "from" on "on", if any.
     *  The states, the input and the output (if any) must be declared,
     *  otherwise it throws.
     *
     * @param {string} from the state the transition starts from
     * @param {string} to the state the transition goes to
     * @param {string} on the input crossing the transition
     * @param {string} output the output produced when crossing it [optional]
     */
    addTransition(from, to, on, output) {
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, from);
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, to);
      __privateMethod(this, _Fsm_instances, checkInput_fn).call(this, on);
      if (output) __privateMethod(this, _Fsm_instances, checkOutput_fn).call(this, output);
      const arc = {
        on,
        to,
        output: output ?? ""
      };
      __privateGet(this, _listOfState).get(from).transitionEvents.set(on, arc);
    }
    /**
     *  Removes the transition of the state "from" on the input "on" (nothing
     *  happens if there is none). Throws for an unknown state or input.
     *
     * @param {string} from the state the transition starts from
     * @param {string} on the input of the transition
     */
    removeTransitionFrom(from, on) {
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, from);
      __privateMethod(this, _Fsm_instances, checkInput_fn).call(this, on);
      __privateGet(this, _listOfState).get(from).transitionEvents.delete(on);
    }
    /**
     *  Removes the transitions to the state "to" on the input "on", from every
     *  state (nothing happens if there is none). Throws for an unknown state
     *  or input.
     *
     * @param {string} to the state the transitions go to
     * @param {string} on the input of the transitions
     */
    removeTransitionTo(to, on) {
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, to);
      __privateMethod(this, _Fsm_instances, checkInput_fn).call(this, on);
      for (const state of __privateGet(this, _listOfState).values()) {
        const t = state.transitionEvents.get(on);
        if (t?.to !== to) {
          continue;
        }
        state.transitionEvents.delete(on);
      }
    }
    /**
     *  Returns the transitions to a state (copies), [] for an unknown state
     *
     * @param {string} to the state
     * @return {Array<Transition>} the transitions
     */
    getTransitionsToState(to) {
      if (!this.existState(to)) {
        return [];
      }
      const result = [];
      for (const [stateId, state] of __privateGet(this, _listOfState).entries()) {
        for (const t of state?.transitionEvents.values() ?? []) {
          if (t.to !== to) {
            continue;
          }
          const tt = {
            ...t,
            from: stateId
          };
          result.push(tt);
        }
      }
      return result;
    }
    /**
     *  Returns the transitions from a state (copies), [] for an unknown state
     *
     * @param {string} from the state
     * @return {Array<Transition>} the transitions
     */
    getTransitionsFromState(from) {
      const state = __privateGet(this, _listOfState).get(from);
      if (!state) {
        return [];
      }
      const result = [];
      for (const t of state.transitionEvents.values()) {
        const tt = {
          ...t,
          from
        };
        result.push(tt);
      }
      return result;
    }
    /**
     *  Switches the names of two states: each state keeps its transitions, and
     *  the transitions to the two states, the initial and the current states
     *  follow. Throws for an unknown state; does nothing for the same state.
     *
     * @param {string} stateId1 a state
     * @param {string} stateId2 another state
     */
    switchStates(stateId1, stateId2) {
      if (stateId1 === stateId2) {
        return;
      }
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, stateId1);
      __privateMethod(this, _Fsm_instances, checkState_fn).call(this, stateId2);
      const state1 = __privateGet(this, _listOfState).get(stateId1);
      const state2 = __privateGet(this, _listOfState).get(stateId2);
      __privateGet(this, _listOfState).set(stateId1, state2);
      __privateGet(this, _listOfState).set(stateId2, state1);
      const switchName = (name) => name === stateId1 ? stateId2 : name === stateId2 ? stateId1 : name;
      for (const state of __privateGet(this, _listOfState).values()) {
        for (const arc of state.transitionEvents.values()) {
          arc.to = switchName(arc.to);
        }
      }
      __privateSet(this, _initialState, switchName(__privateGet(this, _initialState)));
      __privateSet(this, _currentState, switchName(__privateGet(this, _currentState)));
    }
    /*******************************************
     Inputs and outputs binding
     *******************************************/
    /**
     *  Associates an event of a source to an input: each time the source
     *  dispatches the event, the fsm receives the input (see fsmNotify), with
     *  the event data.<br />
     *  Several inputs can be associated to the same event: they are received
     *  in the order of association. Associating the same input and event again
     *  does nothing.<br />
     *  Throws for an unknown input, a source which is not an EventSource or an
     *  empty event specification.
     *
     * @param {string} on the input
     * @param {core.EventSource} src the source of the event
     * @param {string} eventSpec the event specification, e.g. 'select'
     */
    setInput(on, src, eventSpec) {
      __privateMethod(this, _Fsm_instances, checkInput_fn).call(this, on);
      if (!src?.bind) {
        throw new TypeError("Fsm.setInput: the source must be an EventSource");
      }
      if (!eventSpec) {
        throw new Error("Fsm.setInput: the event specification is empty");
      }
      let a = __privateGet(this, _inputs).get(src);
      if (a?.some(([spec, input]) => spec === eventSpec && input === on)) {
        return;
      }
      if (!a?.some(([spec]) => spec === eventSpec)) {
        src.bind(eventSpec, this, this.handleEvent);
      }
      if (!a) {
        a = [];
        __privateGet(this, _inputs).set(src, a);
      }
      a.push([eventSpec, on, src]);
    }
    /**
     *  Associates an action to an output: it is called each time the fsm
     *  crosses a transition producing this output, with the fsm owner as this
     *  and the input event (type: the input, src: the fsm) as parameter.
     *  The action may keep the event.<br />
     *  It replaces the previous action of the output. Throws for an unknown
     *  output, or an action which is not a function or a method name.
     *
     * @param {string} output the output
     * @param {Function|string} action a function, or the name of a method of
     *        the fsm owner
     */
    setOutput(output, action) {
      __privateMethod(this, _Fsm_instances, checkOutput_fn).call(this, output);
      if (!vs_utils.isFunction(action) && !(vs_utils.isString(action) && action)) {
        throw new TypeError("Fsm.setOutput: the action must be a function or a method name");
      }
      __privateGet(this, _outputAction).set(output, action);
    }
    /**
     *  Removes the association of an event of a source to an input (see
     *  setInput); the source event is unbound once no input uses it.
     *  Nothing happens if there is no such association. Throws for an unknown
     *  input.
     *
     * @param {string} on the input
     * @param {core.EventSource} src the source of the event
     * @param {string} eventSpec the event specification
     */
    unsetInput(on, src, eventSpec) {
      __privateMethod(this, _Fsm_instances, checkInput_fn).call(this, on);
      const a = __privateGet(this, _inputs).get(src);
      const index = a?.findIndex(([spec, input]) => spec === eventSpec && input === on) ?? -1;
      if (index === -1) {
        return;
      }
      a.splice(index, 1);
      if (!a.some(([spec]) => spec === eventSpec)) {
        src.unbind(eventSpec, this, this.handleEvent);
      }
      if (a.length === 0) {
        __privateGet(this, _inputs).delete(src);
      }
    }
    /**
     *  Removes the action of an output (see setOutput); the output event is
     *  still dispatched. Nothing happens if the output has no action. Throws
     *  for an unknown output.
     *
     * @param {string} output the output
     */
    unsetOutput(output) {
      __privateMethod(this, _Fsm_instances, checkOutput_fn).call(this, output);
      __privateGet(this, _outputAction).delete(output);
    }
    /*******************************************
     Running
     *******************************************/
    /**
     *  Activates the fsm: its current state becomes the initial state (also
     *  when it is already activated). No output is produced.
     *
     * @return {boolean} false if there is no initial state
     */
    activate() {
      if (!__privateGet(this, _initialState) || !__privateGet(this, _listOfState).has(__privateGet(this, _initialState))) {
        return false;
      }
      this.goTo(__privateGet(this, _initialState));
      return true;
    }
    /**
     *  Goes to a state, and produces the output: calls its action, then
     *  dispatches the output event.<br />
     *  Used by the fsm to cross a transition (and by activate()).
     *  @protected
     *
     * @param {string} stateId the state to go to
     * @param {string} output the output to produce [optional]
     * @param {Event} event the input event, given to the action [optional]
     * @return {boolean} false if the state does not exist
     */
    goTo(stateId, output, event) {
      if (!this.existState(stateId)) {
        return false;
      }
      __privateSet(this, _currentState, stateId);
      if (!output) {
        return true;
      }
      const clb = __privateGet(this, _outputAction).get(output);
      if (vs_utils.isFunction(clb)) {
        clb.call(this.owner, event);
      } else if (vs_utils.isString(clb)) {
        const func = this.owner[clb];
        if (vs_utils.isFunction(func)) {
          func.call(this.owner, event);
        }
      }
      const outputEvent = Event.retain();
      outputEvent.configure(output, event?.data);
      this.dispatchEvent(outputEvent);
      return true;
    }
    /**
     *  Clears the fsm: removes the states, inputs, outputs, transitions, the
     *  initial and current states, the output actions and the input bindings
     *  (the sources events are unbound).
     */
    clear() {
      __privateGet(this, _listOfState).clear();
      __privateGet(this, _listInput).clear();
      __privateGet(this, _listOutput).clear();
      __privateSet(this, _initialState, "");
      for (const [src, a] of __privateGet(this, _inputs).entries()) {
        for (const eventSpec of new Set(a.map(([spec]) => spec))) {
          src.unbind(eventSpec, this, this.handleEvent);
        }
      }
      __privateGet(this, _inputs).clear();
      __privateGet(this, _outputAction).clear();
      __privateSet(this, _currentState, "");
    }
    /**
     *  Returns the name of the state the fsm would go to on the input, from
     *  its current state; undefined if there is no such transition or the fsm
     *  is not activated.
     *
     * @param {string} on the input
     * @return {string} the state
     */
    getAccessibleStateOn(on) {
      return __privateGet(this, _listOfState).get(__privateGet(this, _currentState))?.transitionEvents.get(on)?.to;
    }
    /**
     *  Sends an input to the fsm: crosses the transition of the current state
     *  on this input, if any, and produces its output (see setOutput).
     *
     * @param {string} on the input
     * @param {any} data the data of the input, given to the output action
     *        (in the event) and to the output event
     * @return {boolean} true if a transition was crossed
     */
    fsmNotify(on, data) {
      if (!__privateGet(this, _listOfState).has(__privateGet(this, _currentState))) {
        return false;
      }
      const transition = __privateGet(this, _listOfState).get(__privateGet(this, _currentState))?.transitionEvents.get(on);
      if (!transition) {
        return false;
      }
      const event = Event.retain();
      event.configure(on, data);
      event.src = this;
      event.srcTarget = this;
      return this.goTo(transition.to, transition.output, event);
    }
  }
  _listOfState = new WeakMap();
  _listInput = new WeakMap();
  _listOutput = new WeakMap();
  _initialState = new WeakMap();
  _currentState = new WeakMap();
  _inputs = new WeakMap();
  _outputAction = new WeakMap();
  _Fsm_instances = new WeakSet();
  /*******************************************
   Validation: throw on an unknown name
   *******************************************/
  checkState_fn = function(name) {
    if (!name || !this.existState(name)) {
      throw new Error(`Fsm: unknown state "${name}"`);
    }
  };
  checkInput_fn = function(input) {
    if (!input || !this.existInput(input)) {
      throw new Error(`Fsm: unknown input "${input}"`);
    }
  };
  checkOutput_fn = function(output) {
    if (!output || !this.existOutput(output)) {
      throw new Error(`Fsm: unknown output "${output}"`);
    }
  };

  exports.Component = Component;
  exports.Connector = Connector;
  exports.DEFAULT_DATAFLOW = DEFAULT_DATAFLOW;
  exports.DataFlow = DataFlow;
  exports.Fsm = Fsm;
  exports.In = In;
  exports.InOut = InOut;
  exports.LOGGER = LOGGER;
  exports.Model = Model;
  exports.Out = Out;
  exports.Pipe = Pipe;
  exports.PropertyRef = PropertyRef;
  exports.connect = connect;
  exports.consoleLogger = consoleLogger;
  exports.event = index$1;
  exports.task = index;

}));
//# sourceMappingURL=vs_core.amd.js.map
