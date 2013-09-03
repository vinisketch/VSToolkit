/*
  Copyright (C) 2009-2013. David Thevenin, ViniSketch (c), and
  IGEL Co., Ltd. All rights reserved

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
 *  The vs.ui.PointerRecognizer class
 *
 *  @class
 *  vs.ui.PointerRecognizer is an abstract class that helps with detecting and
 *  responding to the various UI pointer/gesture events common on devices.<br />
 *  Build on top of PointerEvent API, PointerRecognizer will works with mouse
 *  and/or touche devices.<br />
 *
 *  vs.ui.PointerRecognizer is an abstract class, with the following concrete
 *  subclasses, one for each type of available recognizer:
 *  <ul>
 *    <li /> vs.ui.TapRecognizer
 *    <li /> vs.ui.DragRecognizer
 *    <li /> vs.ui.RotationRecognizer
 *    <li /> vs.ui.PinchRecognizer
 *  </ul>
 *  <p>
 *  Depending on the type of recognizer, there are various behaviors that you
 *  can configure. For instance, with the vs.ui.TapRecognizer, you can specify
 *  the number of taps and number of touches.<br />
 * 
 *  In response to recognized actions, a delegate method call to a delegate
 *  object that you specify within the constructor. Depending on the type of
 *  gesture additional information about the gesture may be available in the
 *  delegate method, for example, the scale factor of a pinch.<br />
 *
 *  @example
 *
 *  @author David Thevenin
 *  @see vs.ui.TapRecognizer
 *  @see vs.ui.DragRecognizer
 *  @see vs.ui.RotationRecognizer
 *  @see vs.ui.PinchRecognizer
 *
 *  @constructor
 *   Creates a new vs.ui.PointerRecognizer.
 *
 * @name vs.ui.PointerRecognizer
 *
 * @param {ReconizerDelegate} delegate the delegate [mandatory]
 */
function PointerRecognizer (delegate) {
  this.constructor = PointerRecognizer;

  this.delegate = delegate;
}

var POINTER_LISTENERS = [];

PointerRecognizer.prototype = {

  /**
   * @name vs.ui.PointerRecognizer#addPointerListener
   * @function
   * @protected
   *
   * @param {HTMLElement} node The node to listen
   * @param {String} type the event to listen
   * @param {Function | Object} listener the listener
   * @param {Boolean} useCapture 
   */
  addPointerListener: function (node, type, listener, useCapture) {
    if (!node || !type || !listener) return false;

    var i = 0, len = POINTER_LISTENERS.length, binding;
    for (; i < len; i++) {
      binding = POINTER_LISTENERS [i];
      if (binding.target === node &&
          binding.type === type &&
          binding.listener === listener) {
        binding.nb ++;
        return true;
      }
    }
    
    binding = {};
    binding.target = node;
    binding.type = type;
    binding.listener = listener;
    binding.nb = 1;
    POINTER_LISTENERS.push (binding);
    vs.addPointerListener (node, type, listener, useCapture);
    return true;
  },

  /**
   * @name vs.ui.PointerRecognizer#removePointerListener
   * @function
   * @protected
   *
   * @param {HTMLElement} node The node to listen
   * @param {String} type the event to listen
   * @param {Function | Object} listener the listener
   * @param {Boolean} useCapture 
   */
  removePointerListener: function (node, type, listener, useCapture) {
    if (!node || !type || !listener) return false;

    var i = 0, len = POINTER_LISTENERS.length, binding;
    for (; i < len; i++) {
      binding = POINTER_LISTENERS [i];
      if (binding.target === node &&
          binding.type === type &&
          binding.listener === listener) {
        binding.nb --;
        if (binding.nb === 0) {
          vs.removePointerListener (node, type, listener, useCapture);
          POINTER_LISTENERS.remove (i);
        }
        return true;
      }
    }
    
    return false;
  },

  /**
   * @name vs.ui.PointerRecognizer#init
   * @function
   * @protected
   *
   * @param {vs.ui.View} obj The view object to listen
   */
  init : function (obj) {
    this.obj = obj;
  },

  /**
   * @name vs.ui.PointerRecognizer#uninit
   * @function
   * @protected
   */
  uninit: function () {},

  /**
   * @name vs.ui.PointerRecognizer#reset
   * @function
   * @protected
   */
  reset: function () {},

  /**
   * @name vs.ui.PointerRecognizer#pointerStart
   * @function
   * @protected
   */
  pointerStart: function (event) {},

  /**
   * @name vs.ui.PointerRecognizer#pointerMove
   * @function
   * @protected
   */
  pointerMove: function (event) {},

  /**
   * @name vs.ui.PointerRecognizer#pointerEnd
   * @function
   * @protected
   */
  pointerEnd: function (event) {},

  /**
   * @name vs.ui.PointerRecognizer#pointerCancel
   * @function
   * @protected
   */
  pointerCancel: function (event) {},

  /**
   * @name vs.ui.PointerRecognizer#gestureStart
   * @function
   * @protected
   */
  gestureStart: function (event) {},

  /**
   * @name vs.ui.PointerRecognizer#gestureChange
   * @function
   * @protected
   */
  gestureChange: function (event) {},

  /**
   * @name vs.ui.PointerRecognizer#gestureEnd
   * @function
   * @protected
   */
  gestureEnd: function (event) {}
};

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.PointerRecognizer = PointerRecognizer;
