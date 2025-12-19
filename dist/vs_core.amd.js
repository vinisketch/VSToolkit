define(['exports', 'vs_utils'], (function (exports, vs_utils) { 'use strict';

  var __defProp$6 = Object.defineProperty;
  var __typeError$6 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$6 = (obj, member, msg) => member.has(obj) || __typeError$6("Cannot " + msg);
  var __privateGet$6 = (obj, member, getter) => (__accessCheck$6(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$6 = (obj, member, value) => member.has(obj) ? __typeError$6("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$4 = (obj, member, value, setter) => (__accessCheck$6(obj, member, "write to private field"), member.set(obj, value), value);
  var _type;
  const _Event = class _Event {
    /**
     * @param {string} type the event type [mandatory]
     * @param {Object} data complementary event data [optional]
     */
    constructor(type, data) {
      /**
       * The event spec. For instance 'click' for a mouse click event.
       */
      __privateAdd$6(this, _type);
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
      if (type) this.configure(type, data);
    }
    get type() {
      return __privateGet$6(this, _type);
    }
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
      this.eventPool.push(event);
    }
  };
  _type = new WeakMap();
  __publicField$6(_Event, "eventPool", []);
  let Event = _Event;

  var __typeError$5 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
  var __privateGet$5 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$3 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
  var _pool, _funcName, _funcPtr, _obj;
  const _Handler = class _Handler {
    constructor() {
      __privateAdd$5(this, _funcName);
      __privateAdd$5(this, _funcPtr);
      __privateAdd$5(this, _obj);
      __privateGet$5(_Handler, _pool).push(this);
    }
    get func() {
      return __privateGet$5(this, _funcPtr) || __privateGet$5(this, _funcName);
    }
    get obj() {
      return __privateGet$5(this, _obj);
    }
    configure(obj, func) {
      __privateSet$3(this, _obj, obj);
      if (vs_utils.isFunction(func)) {
        __privateSet$3(this, _funcPtr, func);
      } else if (vs_utils.isString(func)) {
        __privateSet$3(this, _funcName, func);
      }
    }
    release() {
      __privateGet$5(_Handler, _pool).push(this);
    }
    static retain() {
      if (__privateGet$5(_Handler, _pool).length > 0) {
        return __privateGet$5(_Handler, _pool).pop();
      }
      return new _Handler();
    }
    static release(handler) {
      __privateGet$5(_Handler, _pool).push(handler);
    }
  };
  _pool = new WeakMap();
  _funcName = new WeakMap();
  _funcPtr = new WeakMap();
  _obj = new WeakMap();
  __privateAdd$5(_Handler, _pool, []);
  let Handler = _Handler;

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
      _Action.pool.push(action);
    }
  };
  __publicField$5(_Action, "pool", []);
  let Action = _Action;

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
    var queue = mainActionsQueue;
    areActionsScheduled = false;
    if (queue.length) {
      mainActionsQueue = tmpActionsQueue;
      tmpActionsQueue = queue;
      try {
        var i = 0, l = queue.length, func;
        for (; i < l; i++) {
          func = queue[i];
          func.run();
        }
      } catch (e) {
        if (e.stack) console.error(e.stack);
        else console.error(e);
      }
      queue.length = 0;
    }
  }
  function installPostMessageImplementation() {
    const MESSAGE_PREFIX = `_scheduler_${Date.now()}_${Math.random()}`;
    function onGlobalMessage(event) {
      if (event.data === MESSAGE_PREFIX) {
        doAllActions();
      }
    }
    if (window.addEventListener) {
      window.addEventListener("message", onGlobalMessage, false);
    }
    return () => window.postMessage(MESSAGE_PREFIX, "*");
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

  const asyncEventsQueue = [];
  let isAsyncEventsPropagating = false;
  let isSyncEventsPropagating = false;
  let isWaiting = false;
  const loopSetImmediate = typeof setImmediate !== "undefined" ? setImmediate : typeof window !== "undefined" && window.setImmediate ? window.setImmediate.bind(window) : initSetImmediatePolyfill();
  function doOneEvent(burst, isSynchron) {
    const { handlerList } = burst;
    const len = handlerList.length;
    let l = len;
    const event = burst.event;
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
    if (isAsyncEventsPropagating || isSyncEventsPropagating) return;
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

  var __typeError$4 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
  var __privateGet$4 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var _children;
  const childToParent = /* @__PURE__ */ new WeakMap();
  class Container {
    constructor() {
      __privateAdd$4(this, _children, []);
    }
    static getParent(comp) {
      return childToParent.get(comp);
    }
    destructor() {
      this.removeAllChildren();
    }
    /**
     *  Return true if the set component is a child o the current component
     *
     * @param {Component} child The component to be removed.
     * @return {boolean}
     */
    isChild(child) {
      return __privateGet$4(this, _children).indexOf(child) !== -1;
    }
    /**
     *  Add the specified child component to this component.
     *  <p>
     *  The component can be a graphic component (vs.ui.Group) or
     *  a non graphic component (View).
     *  In case of vs.ui.Group its mandatory to set the extension.
     *  <p>
     *  The add is a lazy add! The child's view can be already in
     *  the HTML DOM. In that case, the add methode do not modify the DOM.
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
      __privateGet$4(this, _children).push(child);
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
      if (!this.isChild(child)) {
        return;
      }
      const idx = __privateGet$4(this, _children).indexOf(child);
      if (idx === -1) {
        throw new Error("Not a child of this component");
      }
      __privateGet$4(this, _children).splice(idx, 1);
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
      __privateGet$4(this, _children).forEach((child) => childToParent.delete(child));
      __privateGet$4(this, _children).length = 0;
    }
  }
  _children = new WeakMap();
  function isContainer(obj) {
    if (obj instanceof Container) return true;
    return vs_utils.isObject(obj) && "add" in obj && "remove" in obj;
  }

  var __typeError$3 = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
  var __privateGet$3 = (obj, member, getter) => (__accessCheck$3(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var _bindings;
  function isEventSource(obj) {
    return vs_utils.isObject(obj) && "dispatchEvent" in obj && "bind" in obj && "unbind" in obj && "addEventListener" in obj && "removeEventListener" in obj;
  }
  class EventSource extends vs_utils.Mixin {
    constructor() {
      super(...arguments);
      __privateAdd$3(this, _bindings, /* @__PURE__ */ new Map());
    }
    initMixin() {
    }
    releaseMixin() {
      super.releaseMixin();
      for (const [spec, handlerList] of __privateGet$3(this, _bindings).entries()) {
        handlerList.forEach((handler) => handler.release());
        handlerList.length = 0;
        __privateGet$3(this, _bindings).delete(spec);
      }
    }
    bind(spec, obj, func) {
      if (!spec || !obj) return;
      let handlerList = __privateGet$3(this, _bindings).get(spec);
      if (!handlerList) {
        handlerList = [];
        __privateGet$3(this, _bindings).set(spec, handlerList);
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
      let handlerList = __privateGet$3(this, _bindings).get(type);
      if (!handlerList) {
        handlerList = [];
        __privateGet$3(this, _bindings).set(type, handlerList);
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
      if (!__privateGet$3(this, _bindings).has(type)) return;
      function unbind(handlerList) {
        const idx = handlerList.findIndex((handler) => handler.func === func);
        if (idx !== -1) {
          const handlers = handlerList.splice(idx, 1);
          handlers.forEach((handle) => handle.release());
        }
      }
      unbind(__privateGet$3(this, _bindings).get(type));
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
      if (!__privateGet$3(this, _bindings).has(spec)) return;
      function unbind(handlerList) {
        const idx = handlerList.findIndex((handler) => handler.func === func && handler.obj === obj);
        if (idx !== -1) {
          const handlers = handlerList.splice(idx, 1);
          handlers.forEach((handle) => handle.release());
        }
      }
      unbind(__privateGet$3(this, _bindings).get(spec));
    }
    /**
     *  Dispatches an Event at the specified EventSource, invoking the affected
     *  EventListeners in the appropriate order.
     */
    dispatchEvent(event) {
      if (!event.type) return false;
      const handlerList = __privateGet$3(this, _bindings).get(event.type);
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
    Handler: Handler,
    isEventSource: isEventSource
  });

  var TaskState = /* @__PURE__ */ ((TaskState2) => {
    TaskState2[TaskState2["STARTED"] = 1] = "STARTED";
    TaskState2[TaskState2["STOPPED"] = 0] = "STOPPED";
    TaskState2[TaskState2["PAUSED"] = 2] = "PAUSED";
    return TaskState2;
  })(TaskState || {});

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TaskState: TaskState
  });

  let idIndex = 1;
  const createUniqueId = () => `vs_id_${idIndex++}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

  var __defProp$4 = Object.defineProperty;
  var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
  const _DataflowState = class _DataflowState {
    constructor(comp, df) {
      this.comp = comp;
      __publicField$4(this, "df", /* @__PURE__ */ new Set());
      __publicField$4(this, "inputPropertyDidChange", false);
      this.df.add(df);
    }
    static add(comp, df = vs_utils.container.get(DEFAULT_DATAFLOW)) {
      const state = new _DataflowState(comp, df);
      _DataflowState.states.set(comp.id, state);
      return state;
    }
    static get(id) {
      return _DataflowState.states.get(id);
    }
    propagate() {
      this.df.forEach((df) => df.propagate(this.comp));
    }
    /**
     * Manually tel an input property change.
     * <br/>
     * It will generate a call to propertiesDidChange.
     * @name core.Object#inPropertyDidChange
     * @function
     *
     */
    inPropertyDidChange() {
      this.inputPropertyDidChange = true;
      this.comp.propertiesDidChange();
      this.propagate();
    }
    /**
     * Manually force out properties change propagation.
     * <br/>
     * If no property name is specified, the system will assume all component's
     * properties have been modified.
     *
     * @name core.Object#outPropertyChange
     * @function
     *
     * @param {String} property the name of the modified property.[optional]
     */
    outPropertyChange() {
      this.inputPropertyDidChange = true;
      this.propagate();
    }
    /**
     * Manually force properties change propagation.
     * <br/>
     * If no property name is specified, the system will assume all component's
     * properties have been modified.
     *
     * alias for inPropertyDidChange
     */
    propertyChange() {
      this.inPropertyDidChange();
    }
    pausePropagation() {
      this.df.forEach((df) => df.pausePropagation());
    }
    restartPropagation() {
      this.df.forEach((df) => df.restartPropagation());
    }
  };
  __publicField$4(_DataflowState, "states", /* @__PURE__ */ new Map());
  let DataflowState = _DataflowState;

  const LOGGER = vs_utils.injectionToken("LOGGER");

  var __defProp$3 = Object.defineProperty;
  var __typeError$2 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
  var __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$2 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet$2(obj, member, value);
    },
    get _() {
      return __privateGet$2(obj, member, getter);
    }
  });
  var _isPropagating, _optimizedEdges, _nodes$1, _edgesFrom, _listNode, _shouldNotPropagate, _dataflowNodes, _isSorted, _isCyclic;
  let edgeIdCount = 1;
  function buildConnectParameters(src, outDesc, trg, inDesc) {
    const srcObj = vs_utils.isString(src) ? DataflowNode.get(src) : src;
    if (!srcObj || !DataflowState.get(srcObj.id)) {
      throw new Error(`Unknown component or not data flow compatible, with id ${src}`);
    }
    const trgObj = vs_utils.isString(trg) ? DataflowNode.get(trg) : trg;
    if (!trgObj || !DataflowState.get(trgObj.id)) {
      throw new Error(`Unknown component or not data flow compatible, with id ${trg}`);
    }
    const propertiesOut = vs_utils.isString(outDesc) ? [outDesc] : outDesc;
    const propertiesIn = vs_utils.isString(inDesc) ? [inDesc] : inDesc;
    if (propertiesIn.length !== propertiesOut.length) {
      throw new Error("DataFlow.[dis]connect, parameter error");
    }
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
      const descriptor = obj.getPropertyDescriptor(pName);
      return descriptor?.get;
    }).filter(vs_utils.isNotEmpty);
  }
  function generateSetters(obj, properties) {
    return properties.map((pName) => {
      const descriptor = obj.getPropertyDescriptor(pName);
      return descriptor?.set;
    }).filter(vs_utils.isNotEmpty);
  }
  const _DataFlow = class _DataFlow {
    constructor() {
      __publicField$3(this, "logger", vs_utils.container.get(LOGGER));
      __privateAdd$2(this, _isPropagating, false);
      // edges from components Object[component.id] => Array[3] <Object, , properties>
      __privateAdd$2(this, _optimizedEdges, /* @__PURE__ */ new Map());
      // ordered node list Array<Object>
      __privateAdd$2(this, _nodes$1, []);
      __privateAdd$2(this, _edgesFrom, /* @__PURE__ */ new Map());
      __privateAdd$2(this, _listNode, []);
      __privateAdd$2(this, _shouldNotPropagate, 0);
      __privateAdd$2(this, _dataflowNodes, []);
      __privateAdd$2(this, _isSorted, false);
      __privateAdd$2(this, _isCyclic, false);
    }
    // constructor() {
    //   //  this._node_link = {};
    // }
    propagateValues(objSrc) {
      const cConnections = __privateGet$2(this, _optimizedEdges).get(objSrc.id);
      if (!cConnections) {
        return;
      }
      for (let i = 0; i < cConnections.length; i++) {
        const cConnection = cConnections[i];
        const objTrg = cConnection.obj;
        for (let j = 0; j < cConnection.cEdges.length; j++) {
          const edge = cConnection.cEdges[j];
          let params = [];
          for (let l = 0; l < edge.getters.length; l++) {
            params.push(edge.getters[l].call(objSrc));
          }
          if (vs_utils.isFunction(edge.func)) {
            params = edge.func.apply(void 0, params);
            if (!vs_utils.isArray(params)) {
              params = [params];
            }
          }
          if (params.length !== edge.setters.length) {
            this.logger.error("Dataflow, invalid parameters");
            return;
          }
          for (let l = 0; l < edge.setters.length; l++) {
            edge.setters[l].call(objTrg, params[l]);
          }
          cConnection.state.inputPropertyDidChange = true;
        }
      }
    }
    /**
     * Propagates values along the dataflow graph
     *
     * @protected
     *
     *                 propagation
     * @param obj
     * @param {Boolean} outputPropagation, do a propagation, starting from
     *         output property instead of input property (default configuration)
     */
    propagate(obj, outputPropagation = false) {
      if (__privateGet$2(this, _isPropagating) || __privateGet$2(this, _shouldNotPropagate)) {
        return;
      }
      __privateSet$2(this, _isPropagating, true);
      _DataFlow.propagationCount++;
      let i = 0;
      const l = __privateGet$2(this, _dataflowNodes).length;
      if (obj) {
        while (i < l && __privateGet$2(this, _dataflowNodes)[i] !== obj) {
          i++;
        }
        if (i < l - 1) {
          if (!outputPropagation && obj.propertiesDidChange()) {
            _DataFlow.propagationCount--;
            __privateSet$2(this, _isPropagating, false);
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
      _DataFlow.propagationCount--;
      __privateSet$2(this, _isPropagating, false);
    }
    /**
     * Connect two components within the dataflow.
     * After a connection, you have to call build method to compile the dataflow.
     * Build can (should) be call when all connection are done (to avoid
     * un-necessary calculation)
     *
     * @function
     * @public
     * @param src
     * @param outDesc
     * @param trg
     * @param inDesc
     * @param func
     */
    connect(src, outDesc, trg, inDesc, func) {
      const [srcObj, propertiesOut, trgObj, propertiesIn] = buildConnectParameters(src, outDesc, trg, inDesc);
      const state = DataflowState.get(srcObj.id);
      if (!state) {
        throw new Error(`Src component is not a Dataflow component: ${src.toString()}`);
      }
      state.df.add(this);
      if (!func) {
        throw new Error("DataFlow.connect, parameter error");
      }
      if (__privateGet$2(this, _listNode).indexOf(srcObj.id) !== -1) __privateGet$2(this, _listNode).push(srcObj.id);
      if (__privateGet$2(this, _listNode).indexOf(trgObj.id) !== -1) __privateGet$2(this, _listNode).push(trgObj.id);
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
      return edgeId;
    }
    disconnect(src, outDesc, trg, inDesc) {
      if (vs_utils.isNumber(src)) {
        this.disconnectById(src);
      } else {
        const [srcObj, propertiesOut, trgObj, propertiesIn] = buildConnectParameters(src, outDesc, trg, inDesc);
        this.disconnectByParams(srcObj, propertiesOut, trgObj, propertiesIn);
      }
    }
    /**
     * Remove a dataflow connection using a edge parameters
     *
     * @private
     * @param {String|Object} obj_src the DataflowNode (or Id) source.
     * @param {String|Array} property_out one or an array of output property name(s)
     * @param {String|Object} obj_trg the DataflowNode (or Id) target.
     * @param {String|Array} property_in one or an array of input property name(s)
     */
    disconnectByParams(srcObj, propertiesOut, trgObj, propertiesIn) {
      const connections = __privateGet$2(this, _edgesFrom).get(srcObj.id);
      if (!connections) {
        return;
      }
      function removeProperties(sources, list) {
        list.forEach((data) => {
          const index = sources.indexOf(data);
          if (index !== -1) sources.slice(index, 1);
        });
      }
      for (let i = 0; i < connections.length; i++) {
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
     * Remove a dataflow connection using a edge ids
     *
     * @param {Number} edgeId the id of the edge to remove
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
     * Performs a topological sort on this DAG, so that getNodes returns the
     * ordered list of nodes.<p>
     * Returns true if the graph is acyclic, false otherwise. When the graph is
     * cyclic, the algorithm does at it best to partially order it and issues a
     * warning.
     *
     * @private
     * @return {boolean}
     */
    sort() {
      const indegrees = new Array(__privateGet$2(this, _listNode).length).fill(0);
      __privateGet$2(this, _edgesFrom).forEach((connections) => {
        for (let j = 0; j < connections.length; j++) {
          const cid = connections[j][0];
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
        indegrees.splice(minI, 0);
        const nId = pending[minI];
        pending.splice(minI, 1);
        if (indegree > 0) {
          violationCount++;
        }
        sorted.push(nId);
        const connections = __privateGet$2(this, _edgesFrom).get(nId);
        if (connections !== void 0) {
          for (let j = 0; j < connections.length; j++) {
            const mi = pending.indexOf(connections[j][0]);
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
        const edgecount = __privateGet$2(this, _edgesFrom).size;
        this.logger.warn(
          "WARNING: Cycles detected during topological sort.%d dependencies out of %d have been violated.\n",
          violationCount,
          edgecount
        );
      }
      return !__privateGet$2(this, _isCyclic);
    }
    build() {
      this.sort();
      this.optimize(__privateGet$2(this, _edgesFrom), __privateGet$2(this, _listNode));
    }
    /**
     * @private
     */
    pausePropagation() {
      __privateWrapper(this, _shouldNotPropagate)._++;
    }
    /**
     * @private
     */
    restartPropagation() {
      __privateWrapper(this, _shouldNotPropagate)._--;
      if (__privateGet$2(this, _shouldNotPropagate) < 0) {
        __privateSet$2(this, _shouldNotPropagate, 0);
      }
    }
    /**
     */
    optimize(edgeRefs, nodeList) {
      __privateGet$2(this, _dataflowNodes).length = 0;
      for (let i = 0; i < nodeList.length; i++) {
        const id = nodeList[i];
        const obj = DataflowNode.get(id);
        if (obj) {
          __privateGet$2(this, _dataflowNodes).push(obj);
        }
      }
      __privateGet$2(this, _optimizedEdges).clear();
      for (const [id, data] of edgeRefs.entries()) {
        const objSrc = DataflowNode.get(id);
        const compiledConnections = [];
        __privateGet$2(this, _optimizedEdges).set(id, compiledConnections);
        for (let i = 0; i < data.length; i++) {
          const connections = data[i];
          const cid = connections[0];
          const objTrg = DataflowNode.get(cid);
          const compiledConnection = {
            obj: objTrg,
            other: connections[1],
            cEdges: [],
            state: DataflowState.get(objTrg.id)
          };
          compiledConnections.push(compiledConnection);
          const edges = connections[2];
          for (let j = 0; j < edges.length; j++) {
            const edge = edges[j];
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
  _isPropagating = new WeakMap();
  _optimizedEdges = new WeakMap();
  _nodes$1 = new WeakMap();
  _edgesFrom = new WeakMap();
  _listNode = new WeakMap();
  _shouldNotPropagate = new WeakMap();
  _dataflowNodes = new WeakMap();
  _isSorted = new WeakMap();
  _isCyclic = new WeakMap();
  __publicField$3(_DataFlow, "propagationCount", 0);
  let DataFlow = _DataFlow;
  const DEFAULT_DATAFLOW = vs_utils.injectionToken("DEFAULT_DATAFLOW");
  vs_utils.container.registerFactory(DEFAULT_DATAFLOW, () => new DataFlow());

  var __defProp$2 = Object.defineProperty;
  var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, key + "" , value);
  class Connector {
    constructor(objId, pOut) {
      this.objId = objId;
      this.pOut = pOut;
      __publicField$2(this, "intermediateObjId");
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

  var __defProp$1 = Object.defineProperty;
  var __typeError$1 = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, key + "" , value);
  var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
  var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
  var _configParams, _nodes;
  const nodesBis = /* @__PURE__ */ new Map();
  function Input(value, { name, addInitializer, ...rest }) {
    console.log(addInitializer);
    console.log(rest);
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
      __privateAdd$1(this, _configParams);
      __publicField$1(this, "id");
      this.id = vs_utils.isString(id) ? id : createUniqueId();
      __privateGet$1(_DataflowNode, _nodes).set(this.id, this);
      if (__privateGet$1(this, _configParams)) {
        this.configure(__privateGet$1(this, _configParams));
        __privateSet$1(this, _configParams, void 0);
      }
    }
    static get(id) {
      return __privateGet$1(_DataflowNode, _nodes).get(id);
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
    configure(config) {
    }
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
  _configParams = new WeakMap();
  _nodes = new WeakMap();
  __privateAdd$1(_DataflowNode, _nodes, /* @__PURE__ */ new Map());
  let DataflowNode = _DataflowNode;

  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var _initialised, _initFunctions;
  const _Component = class _Component extends vs_utils.SupportMixins {
    constructor(id) {
      super();
      __privateAdd(this, _initialised, false);
      __privateAdd(this, _initFunctions, /* @__PURE__ */ new Set());
      __publicField(this, "id");
      this.id = vs_utils.isString(id) ? id : createUniqueId();
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
      if (__privateGet(this, _initialised)) {
        throw new Error("impossible to re-initialise a component");
      }
      try {
        this.initComponent();
        __privateGet(this, _initFunctions).forEach((func) => func());
        __privateSet(this, _initialised, true);
        this.componentDidInitialize();
      } catch (e) {
        throw new Error("Component init failed with the error: " + e);
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
      __privateSet(this, _initialised, false);
    }
    isDeleted() {
      return !__privateGet(this, _initialised);
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
  _initialised = new WeakMap();
  _initFunctions = new WeakMap();
  __publicField(_Component, "instances", {});
  let Component = _Component;
  vs_utils.applyMixins(Component, [EventSource]);

  exports.Input = Input;
  exports.LOGGER = LOGGER;
  exports.event = index$1;
  exports.task = index;

}));
//# sourceMappingURL=vs_core.amd.js.map
