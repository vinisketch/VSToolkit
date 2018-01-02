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

import vs_core from 'vs_core';
import vs_utils from 'vs_utils';
import { POINTER_START, POINTER_END, POINTER_MOVE } from 'vs_gesture';

import PointerRecognizer from './PointerRecognizer';

/**
 *  The vs.ui.DragRecognizer class
 *
 *  @extends vs.ui.PointerRecognizer
 *
 *  @class
 *  vs.ui.DragRecognizer is a concrete subclass of vs.ui.PointerRecognizer
 *  that looks for drag gestures. When the user moves
 *  the fingers, the underlying view should translate in a corresponding
 *  direction and speed...<br />
 *
 *  The DragRecognizer delegate has to implement following methods:
 *  <ul>
 *    <li /> didDragStart (event, comp). Call when the drag start.
 *    <li /> didDragEnd (event, comp). Call when the drag end.
 *    <li /> didDrag (drag_info, event, comp). Call when the element is dragged.
 *      drag_info = {dx: dx, dy:dy}, the drag delta form the beginning.
 *  </ul>
 *  <p>
 *
 *  @example
 *  var my_view = new vs.ui.View ({id: "my_view"}).init ();
 *  var recognizer = new DragRecognizer ({
 *    didDrag : function (drag_info, event) {
 *      my_view.translation = [drag_info.dx, drag_info.dy];
 *    },
 *    didDragEnd : function (event) {
 *      // save drag translation
 *      my_view.flushTransformStack ();
 *    }
 *  });
 *  my_view.addPointerRecognizer (recognizer);
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.DragRecognizer.
 *
 * @name vs.ui.DragRecognizer
 *
 * @param {ReconizerDelegate} delegate the delegate [mandatory]
 */
function DragRecognizer (delegate) {
  this.parent = PointerRecognizer;
  this.parent (delegate);
  this.constructor = DragRecognizer;     
}

DragRecognizer.prototype = {

  __is_dragged: false,
  
  /**
   * @name vs.ui.DragRecognizer#init
   * @function
   * @protected
   */
  init : function (obj) {
    PointerRecognizer.prototype.init.call (this, obj);
    
    this.addPointerListener (this.obj.view, POINTER_START, this.obj);
    this.reset ();
  },

  /**
   * @name vs.ui.DragRecognizer#uninit
   * @function
   * @protected
   */
  uninit : function () {
    this.removePointerListener (this.obj.view, POINTER_START, this.obj);
  },

  /**
   * @name vs.ui.DragRecognizer#pointerStart
   * @function
   * @protected
   */
  pointerStart: function (e) {
    if (this.__is_dragged) { return; }
    // prevent multi touch events
    if (!e.targetPointerList || e.targetPointerList.length > 1) { return; }

    var pointer = e.targetPointerList [0];

    this.__start_x = pointer.pageX;
    this.__start_y = pointer.pageY;
    this.__pointer_id = pointer.identifier;
    this.__is_dragged = true;

    this.addPointerListener (document, POINTER_END, this.obj);
    this.addPointerListener (document, POINTER_MOVE, this.obj);
  
    try {
      if (this.delegate && this.delegate.didDragStart)
        this.delegate.didDragStart (e, e.targetPointerList[0].currentTarget._comp_);
    } catch (exp) {
      if (exp.stack) console.log (exp.stack);
      console.log (exp);
    }
    return false;
  },

  /**
   * @name vs.ui.DragRecognizer#pointerMove
   * @function
   * @protected
   */
  pointerMove: function (e) {
    if (!this.__is_dragged) { return; }

    var i = 0, l = e.targetPointerList.length, pointer, dx, dy;
    for (; i < l; i++) {
      pointer = e.targetPointerList [i];
      if (pointer.identifier === this.__pointer_id) { break; }
      pointer = null;
    }
    if (!pointer) { return; }

    dx = pointer.pageX - this.__start_x;
    dy = pointer.pageY - this.__start_y;
    
    try {
      if (this.delegate && this.delegate.didDrag)
        this.delegate.didDrag ({dx: dx, dy:dy}, e, e.targetPointerList[0].currentTarget._comp_);
    } catch (exp) {
      if (exp.stack) console.log (exp.stack);
      console.log (exp);
    }
  },

  /**
   * @name vs.ui.DragRecognizer#pointerEnd
   * @function
   * @protected
   */
  pointerEnd: function (e) {
    if (!this.__is_dragged) { return; }

    var i = 0, l = e.changedPointerList.length, pointer, dx, dy;
    for (; i < l; i++) {
      pointer = e.changedPointerList [i];
      if (pointer.identifier === this.__pointer_id) { break; }
      pointer = null;
    }
    if (!pointer) { return; }

    this.__is_dragged = false;
    this.__start_x = undefined;
    this.__start_y = undefined;
    this.__pointer_id = undefined;
  
    this.removePointerListener (document, POINTER_END, this.obj);
    this.removePointerListener (document, POINTER_MOVE, this.obj);

    try {
      if (this.delegate && this.delegate.didDragEnd)
        this.delegate.didDragEnd (e, e.changedPointerList[0].target._comp_);
    } catch (exp) {
      if (exp.stack) console.log (exp.stack);
      console.log (exp);
    }
  },

  /**
   * @name vs.ui.DragRecognizer#pointerCancel
   * @function
   * @protected
   */
  pointerCancel: function (e) {
    return this.pointerEnd (e);
  }
};
vs_utils.extendClass (DragRecognizer, PointerRecognizer);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default DragRecognizer;