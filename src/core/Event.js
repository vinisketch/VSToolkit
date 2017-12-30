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
core.FORCE_EVENT_PROPAGATION_DELAY = false;

var EVENT_SUPPORT_GESTURE = false;
var hasMSPointer = window.navigator.msPointerEnabled;

/** 
 * Start pointer event (mousedown, touchstart, )
 * @name vs.core.POINTER_START
 * @type {String}
 * @const
 */ 
core.POINTER_START = vs.POINTER_START;

/** 
 * Move pointer event (mousemove, touchmove, )
 * @name vs.core.POINTER_MOVE 
 * @type {String}
 * @const
 */ 
core.POINTER_MOVE = vs.POINTER_MOVE;

/** 
 * End pointer event (mouseup, touchend, )
 * @name vs.core.POINTER_END 
 * @type {String}
 * @const
 */ 
core.POINTER_END = vs.POINTER_END;

/** 
 * Cancel pointer event (mouseup, touchcancel, )
 * @name vs.core.POINTER_CANCEL 
 * @type {String}
 * @const
 */ 
core.POINTER_CANCEL = vs.POINTER_CANCEL;

/** 
 * Start gesture event
 * @name vs.core.GESTURE_START
 * @type {String}
 * @const
 */ 
core.GESTURE_START = vs.GESTURE_START;

/** 
 * Change gesture event
 * @name vs.core.GESTURE_MOVE 
 * @type {String}
 * @const
 */ 
core.GESTURE_CHANGE = vs.GESTURE_CHANGE;

/** 
 * End gesture event
 * @name vs.core.GESTURE_END 
 * @type {String}
 * @const
 */ 
core.GESTURE_END = vs.GESTURE_END;

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
export default Event;

/** touch event messages */
export {
  EVENT_SUPPORT_GESTURE
};
