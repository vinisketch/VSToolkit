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
  pointers = [];
  for (var i = 0; i < evt.changedTouches.length; i++)
  {
    var touch = evt.changedTouches[i];
    var pointer = new Pointer (touch, PointerTypes.TOUCH, touch.identifier);
    pointers.push (pointer);
  }
  evt.changedPointerList = pointers;
}

function buildMouseList (evt, remove)
{
  var pointers = [];
  pointers.push (new Pointer (evt, PointerTypes.MOUSE, MOUSE_ID));
  if (!remove)
  {
    evt.nbPointers = 1;
    evt.pointerList = pointers;
    evt.changedPointerList = [];
  }
  else
  {
    evt.nbPointers = 0;
    evt.pointerList = [];
    evt.changedPointerList = pointers;
  }
}

var all_pointers = {};
var removed_pointers = {};

function buildMSPointerList (evt, remove)
{
  // Note: "this" is the element.
  var pointers = [];
  var removePointers = [];
  var id = evt.pointerId, pointer = all_pointers [id];
  
  if (remove)
  {
    if (pointer)
    {
      removed_pointers [id] = pointer;
      delete (all_pointers [id]);
    }
    else
    {
      pointer = removed_pointers [id];
      if (!pointer)
      {
        pointer = new Pointer (evt, evt.pointerType, id);
        removed_pointers [id] = pointer;
      }
    }
    for (id in removed_pointers) { removePointers.push (removed_pointers [id]); }
    removed_pointers = {};
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
  evt.changedPointerList = removePointers;
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
  buildMouseList (event, true);
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
    removed_pointers [pointer.identifier] = pointer;
    delete (all_pointers [pointer.identifier]);
  }
  nbPointerListener --;

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

function managePointerListenerAdd (node, type, func, binding)
{
  switch (type)
  {
    case core.POINTER_START:
      binding.handler = function (e) {pointerStartHandler (e, func);};
      return true;
    break;
  
    case core.POINTER_MOVE:
      binding.handler = function (e) {pointerMoveHandler (e, func);};
      return true;
    break;
  
    case core.POINTER_END:
      binding.handler = function (e) {pointerEndHandler (e, func);};
      return true;
    break;
  
    case core.POINTER_CANCEL:
      binding.handler = function (e) {pointerCancelHandler (e, func);};
      return true;
    break;
  }
  return false;
}

function managePointerListenerRemove (node, type, binding)
{
  switch (type)
  {
    case core.POINTER_START:
    case core.POINTER_MOVE:
    case core.POINTER_END:
    case core.POINTER_CANCEL:
      return true;
    break;
  }
  return false;
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
  
  if (!managePointerListenerAdd (node, type, func, binding))
  {
    if (!manageGestureListenerAdd (node, type, func, binding))
    {
      binding.handler = func;
    }
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

  if (!managePointerListenerRemove (node, type, binding))
  {
    if (!manageGestureListenerRemove (node, type, binding))
    {}
  }
  
  node.removeEventListener (type, binding.handler, useCapture);
  delete (binding);
}

function createCustomEvent (eventName, target, payload)
{
  var event = document.createEvent ('Event');
  event.initEvent (eventName, true, true);
  for (var k in payload) {
    event[k] = payload[k];
  }
  target.dispatchEvent (event);
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.createCustomEvent = createCustomEvent;
vs.removePointerListener = removePointerListener;
vs.addPointerListener = addPointerListener;
vs.PointerTypes = PointerTypes;
