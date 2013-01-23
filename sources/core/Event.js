/**
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

/**
 * @name vs.core.FORCE_EVENT_PROPAGATION_DELAY
 */
FORCE_EVENT_PROPAGATION_DELAY = false;

/* touch event messages */
/**
 * @name vs.core.EVENT_SUPPORT_TOUCH
 */
var EVENT_SUPPORT_TOUCH = false;
var hasMSPointer = window.navigator.msPointerEnabled;

if (typeof document != "undefined" && 'createTouch' in document)
  EVENT_SUPPORT_TOUCH = true;
  
else if (hasMSPointer) { EVENT_SUPPORT_TOUCH = true; }
  
else if (typeof document != "undefined" &&
    window.navigator && window.navigator.userAgent)
{
  if (window.navigator.userAgent.indexOf ('Android') !== -1 ||
      window.navigator.userAgent.indexOf ('BlackBerry') !== -1)
  { EVENT_SUPPORT_TOUCH = true; }
}


/** 
 * Start pointer event (mousedown, touchstart, )
 * @name vs.core.POINTER_START
 * @type {String}
 * @const
 */ 
core.POINTER_START;

/** 
 * Move pointer event (mousemove, touchmove, )
 * @name vs.core.POINTER_MOVE 
 * @type {String}
 * @const
 */ 
core.POINTER_MOVE;

/** 
 * End pointer event (mouseup, touchend, )
 * @name vs.core.POINTER_END 
 * @type {String}
 * @const
 */ 
core.POINTER_END;

/** 
 * Cancel pointer event (mouseup, touchcancel, )
 * @name vs.core.POINTER_CANCEL 
 * @type {String}
 * @const
 */ 
core.POINTER_CANCEL;

if (EVENT_SUPPORT_TOUCH)
{
  core.POINTER_START = hasMSPointer ? 'MSPointerDown' : 'touchstart';
  core.POINTER_MOVE = hasMSPointer ? 'MSPointerMove' : 'touchmove';
  core.POINTER_END = hasMSPointer ? 'MSPointerUp' : 'touchend';
  core.POINTER_CANCEL = hasMSPointer ? 'MSPointerCancel' : 'touchcancel';
}
else
{
  core.POINTER_START = 'mousedown';
  core.POINTER_MOVE = 'mousemove';
  core.POINTER_END = 'mouseup';
  core.POINTER_CANCEL = 'mouseup';
}

/**
 *  @class
 *  An vs.core.Event object, or simply an event, contains information about an 
 *  input action such as a button click or a key down. The Event object contains
 *  pertinent information about each event, such as where the cursor was located
 *  or which character was typed.<br>
 *  When an event is catch by an application component, the callback
 *  receives as parameters an instance (or sub instance) of this class.
 *  <p>
 *  It specifies the source of the event (which object has generated the event),
 *  the type of the event and an event data.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 *  @memberOf vs.core
 *
 * @param {vs.core.EventSource} src the source of the event [mandatory]
 * @param {string} type the event type [mandatory]
 * @param {Object} data complemetary event data [optional]
*/
var Event = function (src, type, data)
{
  this.src = src;
  this.srcTarget = src;
  this.type = type;
  this.data = data;
}

Event.prototype =
{
  /**
   * The component which produce the event
   * @type {vs.core.EventSource|HTMLElement}
   * @name vs.core.Event#src
   */
  src: null,
  
  /**
   * [Deprecated] The component which produce the event. <br>
   * In case of DOM event, the Event is mapped to the DOM event. Then
   * the developer has access to srcTarget (and many other data).
   * @type {vs.core.EventSource|HTMLElement}
   * @name vs.core.Event#srcTarget
   * @deprecated
   */
  srcTarget : null,
  
  /**
   * The event spec. For instance 'click' for a mouse click event.
   * @type {String}
   * @name vs.core.Event#type
   */
  type: "",
  
  /**
   * The optional data associate to the event.
   * @type {Object|null}
   * @name vs.core.Event#data
   */
  data: null,
  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    delete (this.src);
    delete (this.srcTarget);
    delete (this.type);
    delete (this.data);
  }
};

// TODO(smus): Come up with a better solution for this. This is bad because
// it might conflict with a touch ID. However, giving negative IDs is also
// bad because of code that makes assumptions about touch identifiers being
// positive integers.
var MOUSE_ID = 31337;

function Pointer (event, type, identifier)
{
  this.configureWithEvent (event)
  this.type = type;
  this.identifier = identifier;
}

Pointer.prototype.configureWithEvent = function (evt)
{
  this.pageX = evt.pageX;
  this.pageY = evt.pageY;
  this.clientX = evt.clientX;
  this.clientY = evt.clientY;
  this.target = evt.target;
  this.currentTarget = evt.currentTarget;
}


var PointerTypes = {
  TOUCH: 2,
  PEN: 3,
  MOUSE: 4
};

function setMouse (mouseEvent)
{
  mouseEvent.target.mouseEvent = mouseEvent;
}

function unsetMouse (mouseEvent)
{
  mouseEvent.target.mouseEvent = null;
}

/**
 * Returns an array of all pointers currently on the screen.
 */
function buildTouchList (evt)
{
  var pointers = [];
  evt.nbPointers = evt.touches.length;
  for (var i = 0; i < evt.nbPointers; i++)
  {
    var touch = evt.touches[i];
    var pointer = new Pointer (touch, PointerTypes.TOUCH, touch.identifier);
    pointers.push (pointer);
  }
  evt.pointerList = pointers;
}

function buildMouseList (evt)
{
  var pointers = [];
  pointers.push (new Pointer (evt, PointerTypes.MOUSE, MOUSE_ID));
  evt.nbPointers = 1;
  evt.pointerList = pointers;
}

var all_pointers = {};

function buildMSPointerList (evt, remove)
{
  // Note: "this" is the element.
  var pointers = [];
  var id = evt.pointerId, pointer = all_pointers [id];
  
  if (remove)
  {
    if (pointer) delete (all_pointers [pointer.identifier]);
  }
  else
  {
    if (pointer) {
      pointer.configureWithEvent (evt);
    }
    else
    {
      pointer = new Pointer (evt, evt.pointerType, id);
      all_pointers [id] = pointer;
    }
  }
  for (id in all_pointers) { pointers.push (all_pointers [id]); }
  evt.nbPointers = pointers.length;
  evt.pointerList = pointers;
}

/*************** Mouse event handlers *****************/

function mouseDownHandler (event, listener)
{
  buildMouseList (event);
  listener (event);
}

function mouseMoveHandler(event, listener)
{
  buildMouseList (event);
  listener (event);
}

function mouseUpHandler (event, listener)
{
  buildMouseList (event);
  listener (event);
}

/*************** Touch event handlers *****************/

function touchStartHandler (event, listener)
{
  buildTouchList (event);
  listener (event);
}

function touchMoveHandler (event, listener)
{
  buildTouchList (event);
  listener (event);
}

function touchEndHandler (event, listener)
{
  buildTouchList (event);
  listener (event);
}

function touchCancelHandler (event, listener)
{
  buildTouchList (event);
  listener (event, listener);
}

/*************** MSIE Pointer event handlers *****************/

// remove the pointer from the list of availables pointer
var nbPointerListener = 0;
var msRemovePointer = function (evt) {
  var id = evt.pointerId, pointer = all_pointers [id];

  if (pointer)
  {
    delete (all_pointers [pointer.identifier]);
    nbPointerListener --;
  }

  if (nbPointerListener === 0)
  {
    document.removeEventListener ('MSPointerUp', msRemovePointer);
    document.removeEventListener ('MSPointerCancel', msRemovePointer);
  }
}


function msPointerDownHandler (event, listener)
{
  buildMSPointerList (event);
  listener (event);
  
  if (nbPointerListener === 0)
  {
    document.addEventListener ('MSPointerUp', msRemovePointer);
    document.addEventListener ('MSPointerCancel', msRemovePointer);
  }
  nbPointerListener ++;
}

function msPointerMoveHandler (event, listener)
{
  buildMSPointerList (event);
  listener (event);
}

function msPointerUpHandler (event, listener)
{
  buildMSPointerList (event, true);
  listener (event);
}

function msPointerCancelHandler (event, listener)
{
  buildMSPointerList (event, true);
  listener (event);
}

/*************************************************************/

var pointerStartHandler, pointerMoveHandler, pointerEndHandle, pointerCancelHandler;

if (EVENT_SUPPORT_TOUCH)
{
  if (hasMSPointer)
  {
    pointerStartHandler = msPointerDownHandler;
    pointerMoveHandler = msPointerMoveHandler;
    pointerEndHandler = msPointerUpHandler;
    pointerCancelHandler = msPointerCancelHandler;
  }
  else
  {
    pointerStartHandler = touchStartHandler;
    pointerMoveHandler = touchMoveHandler;
    pointerEndHandler = touchEndHandler;
    pointerCancelHandler = touchCancelHandler;
  }
}
else
{
  pointerStartHandler = mouseDownHandler;
  pointerMoveHandler = mouseMoveHandler;
  pointerEndHandler = mouseUpHandler;
  pointerCancelHandler = mouseUpHandler;
}

function getBindingIndex (target, type, listener)
{
  if (!type || !listener || !listener.__event_listeners) return -1;
  for (var i = 0; i < listener.__event_listeners.length; i++)
  {
    var binding = listener.__event_listeners [i];
    if (binding.target === target && binding.type === type && binding.listener === listener)
      return i;
  }
  return -1;
}

/**
 * Option 2: Replace addEventListener with a custom version.
 */
function addPointerListener (node, type, listener, useCapture)
{
  if (!listener) {
    console.error ("addPointerListener no listener");
    return;
  }
  var func = listener;
  if (!util.isFunction (listener))
  {
    func = listener.handleEvent;
    if (util.isFunction (func)) func = func.bind (listener);
  }
  
  if (getBindingIndex (node, type, listener) !== -1)
  {
    console.error ("addPointerListener binding already existing");
    return;
  }
  
  if (!listener.__event_listeners) listener.__event_listeners = [];

  var binding = {
    target: node,
    type: type,
    listener: listener
  };
  listener.__event_listeners.push (binding);

  switch (type)
  {
    case core.POINTER_START:
      binding.handler = function (e) {pointerStartHandler (e, func);};
    break;
  
    case core.POINTER_MOVE:
      binding.handler = function (e) {pointerMoveHandler (e, func);};
    break;
  
    case core.POINTER_END:
      binding.handler = function (e) {pointerEndHandler (e, func);};
    break;
  
    case core.POINTER_CANCEL:
      binding.handler = function (e) {pointerCancelHandler (e, func);};
    break;
  
    default:
      binding.handler = listener;
    break;
  }

  node.addEventListener (type, binding.handler, useCapture);
}

function removePointerListener (node, type, listener, useCapture)
{
  if (!listener) {
    console.error ("removePointerListener no listener");
    return;
  }
  
  var index = getBindingIndex (node, type, listener);
  if (index === -1)
  {
    console.error ("removePointerListener no binding");
    return;
  }
  var binding = listener.__event_listeners [index];
  listener.__event_listeners.remove (index);

  node.removeEventListener (type, binding.handler, useCapture);
  delete (binding);
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Event = Event;
core.FORCE_EVENT_PROPAGATION_DELAY = FORCE_EVENT_PROPAGATION_DELAY;
core.EVENT_SUPPORT_TOUCH = EVENT_SUPPORT_TOUCH;

vs.removePointerListener = removePointerListener;
vs.addPointerListener = addPointerListener;
vs.PointerTypes = PointerTypes;
