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
 * Start gesture event
 * @name vs.core.GESTURE_START
 * @type {String}
 * @const
 */ 
core.GESTURE_START;

/** 
 * Move gesture event
 * @name vs.core.GESTURE_CHANGE 
 * @type {String}
 * @const
 */ 
core.GESTURE_CHANGE;

/** 
 * End gesture event
 * @name vs.core.GESTURE_END 
 * @type {String}
 * @const
 */ 
core.GESTURE_END;

var support = {};

var events = [
  'gesturestart',
  'gesturechange',
  'gestureend'
];

var el = document.createElement ('div');

for (var i = 0; i < events.length; i++)
{
  var eventName = events[i];
  eventName = 'on' + eventName;
  var isSupported = (eventName in util.vsTestElem);
  if (!isSupported)
  {
    util.vsTestElem.setAttribute(eventName, 'return;');
    isSupported = typeof util.vsTestElem[eventName] == 'function';
  }
  support [events[i]] = isSupported;
}

support.gestures =
  support.gesturestart && 
  support.gesturechange && 
  support.gestureend;

if ('MSGestureEvent' in window) support.msGestures = true;

// for now force non gesture native events
support.gestures = false;
support.msGestures = false;

/*************************************************************/

/**
 * calculate the distance between two Pointers
 * @param   Pointer  pos1 { x: int, y: int }
 * @param   Pointer  pos2 { x: int, y: int }
 */
function getDistance (pointer1, pointer2)
{
  var x = pointer2.pageX - pointer1.pageX, y = pointer2.pageY - pointer1.pageY;
  return Math.sqrt ((x * x) + (y * y));
};

/**
 * calculate the angle between two points
 * @param   Pointer  pointer1 { x: int, y: int }
 * @param   Pointer  pointer2 { x: int, y: int }
 */
function getAngle (pointer1, pointer2 )
{
  return Math.atan2 (pointer2.pageY - pointer1.pageY, pointer2.pageX - pointer1.pageX) * 180 / Math.PI;
};

function getBarycentre (pointers)
{
  var nb_pointer = pointers.length, index = 0, x = 0, y = 0;
  if (nb_pointer === 0) return {X: 0, y: 0};
  var dec = pointers[0].target.__init_pos;
 
  for (;index < nb_pointer; index++)
  {
    var pointer = pointers [index];
    
    x += pointer.pageX;
    y += pointer.pageY;
  }
  
  return {x: x / nb_pointer - dec.x, y: y / nb_pointer - dec.y};
};

function getTranslate (pos1, pos2)
{
  return [pos1.x - pos2.x, pos1.y - pos2.y];
}

var buildPaylaod = function (event, end)
{
  var barycentre = (end)?undefined:getBarycentre (event.targetPointerList);

  return {
    scale: (end)?undefined:
      getDistance (event.targetPointerList [0], event.targetPointerList [1]) / 
      event.target.__init_distance,
    rotation: (end)?undefined:
      getAngle (event.targetPointerList [0], event.targetPointerList [1]) - 
      event.target.__init_angle,
    translation: (end)?undefined:
      getTranslate (barycentre, event.target.__init_barycentre),
    nbPointers : event.nbPointers,
    pointerList : event.pointerList,
    targetPointerList: event.targetPointerList,
    barycentre : barycentre,
    changedPointerList: event.changedPointerList
  };
};

var _gesture_follow = false;
var gestureStartListener = function (event, listener)
{
  if (event.targetPointerList.length < 2) return;
  if (!_gesture_follow)
  {
    event.target.__init_distance =
      getDistance (event.targetPointerList [0], event.targetPointerList [1]);
    event.target.__init_angle =
      getAngle (event.targetPointerList [0], event.targetPointerList [1]);
    
    var comp = event.targetPointerList[0].target._comp_;
    var init_pos = util.getElementAbsolutePosition (event.targetPointerList[0].target, true);
//    init_pos = init_pos.matrixTransform (comp.getParentCTM ());
    
    event.target.__init_pos = init_pos;
    var init_barycentre = getBarycentre (event.targetPointerList);
    event.target.__init_barycentre = init_barycentre;
       
    document.addEventListener (core.POINTER_MOVE, gestureChangeListener);
    document.addEventListener (core.POINTER_END, gestureEndListener);
    document.addEventListener (core.POINTER_CANCEL, gestureEndListener);
    createCustomEvent (core.GESTURE_START, event.target, buildPaylaod (event));
    _gesture_follow = true;
  }
  else
  {
    createCustomEvent (core.GESTURE_CHANGE, event.target, buildPaylaod (event));
  }
};

var gestureChangeListener = function (event)
{
  pointerMoveHandler (event, function (event)
  {
    createCustomEvent (core.GESTURE_CHANGE, event.target, buildPaylaod (event));
  });
};

var gestureEndListener = function (event)
{
  pointerEndHandler (event, function (event)
  {
    if (event.targetPointerList.length < 2)
    {
      document.removeEventListener (core.POINTER_MOVE, gestureChangeListener);
      document.removeEventListener (core.POINTER_END, gestureEndListener);
      document.removeEventListener (core.POINTER_CANCEL, gestureEndListener);
      _gesture_follow = false;
      createCustomEvent (core.GESTURE_END, event.target, buildPaylaod (event, true));
    }
    else
    {
      createCustomEvent (core.GESTURE_CHANGE, event.target, buildPaylaod (event));
    }
  });
};

function buildGestureList (evt)
{
  evt.barycentre = {x: evt.pageX, y: evt.pageY};
  evt.translation =
      getTranslate (evt.barycentre, event.target.__init_barycentre);
  evt.pointerList = [
    new Pointer (evt, PointerTypes.TOUCH, MOUSE_ID)
  ];
  evt.targetPointerList = evt.pointerList;
  evt.nbPointers = 1;
}

var gestureIOSStartListener = function (event, listener)
{
  event.target.__init_barycentre = {x: event.pageX, y: event.pageY};
  buildGestureList (event);
  listener (event);
};

var gestureIOSChangeListener = function (event, listener)
{
  buildGestureList (event);
  listener (event);
};

var gestureIOSEndListener = function (event, listener)
{
  buildGestureList (event);
  listener (event);
};

if (support.msGestures)
{
  core.GESTURE_START = 'MSGestureStart';
  core.GESTURE_CHANGE = 'MSGestureChange';
  core.GESTURE_END = 'MSGestureEnd';
}
else if (support.gestures)
{
  core.GESTURE_START = 'gesturestart';
  core.GESTURE_CHANGE = 'gesturechange';
  core.GESTURE_END = 'gestureend';
}
else
{
  core.GESTURE_START = '_gesture_start';
  core.GESTURE_CHANGE = '_gesture_change';
  core.GESTURE_END = '_gesture_end';
}

function touchToGestureListenerAdd (node, type, func, binding)
{
  var target_id = (binding.listener)?binding.listener.id:undefined;
  switch (type)
  {
    case core.GESTURE_START:
      binding.gesture_handler =
        function (e) {pointerStartHandler (e, gestureStartListener, target_id)};
      node.addEventListener (core.POINTER_START, binding.gesture_handler);
      binding.handler = func;

      return true;
    break;

    case core.GESTURE_CHANGE:
    case core.GESTURE_END:
      binding.handler = func;
      return true;
    break;
  }

  return false;
}

function gestureEventListenerAdd (node, type, func, binding)
{
  var target_id = (binding.listener)?binding.listener.id:undefined;
  switch (type)
  {
    case core.GESTURE_START:
      binding.handler = function (e) {gestureIOSStartListener (e, func, target_id);};
      return true;
    break;

    case core.GESTURE_CHANGE:
      binding.handler = function (e) {gestureIOSChangeListener (e, func, target_id);};
      return true;
    break;

    case core.GESTURE_END:
      binding.handler = function (e) {gestureIOSEndListener (e, func, target_id);};
      return true;
    break;
  }

  return false;
}

var manageGestureListenerAdd =
  (support.gestures || support.msGestures)?gestureEventListenerAdd:touchToGestureListenerAdd;

function touchToGestureListenerRemove (node, type, binding)
{
  var target_id = (binding.listener)?binding.listener.id:undefined;
  switch (type)
  {
    case core.GESTURE_START:
      node.removeEventListener (core.POINTER_START, binding.gesture_handler, target_id);

      return true;
    break;

    case core.GESTURE_CHANGE:
    case core.GESTURE_END:
      return true;
    break;
  }

  return false;
}

function gestureListenerRemove (node, type, binding)
{
  switch (type)
  {
    case core.GESTURE_START:
    case core.GESTURE_CHANGE:
    case core.GESTURE_END:
      return true;
    break;
  }

  return false;
}

var manageGestureListenerRemove =
  (support.gestures || support.msGestures)?gestureListenerRemove:touchToGestureListenerRemove;
