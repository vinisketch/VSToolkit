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

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Event = Event;
core.FORCE_EVENT_PROPAGATION_DELAY = FORCE_EVENT_PROPAGATION_DELAY;
core.EVENT_SUPPORT_TOUCH = EVENT_SUPPORT_TOUCH;
