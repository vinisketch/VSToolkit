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


function DragRecognizer (obj, delegate) {
  this.parent = PointerRecognizer;
  this.parent (obj, delegate);
  this.constructor = DragRecognizer;     
}

DragRecognizer.prototype = {

  __is_dragged: false,
  
  init : function () {
    this.addPointerListener (this.obj.view, core.POINTER_START, this.obj);
    this.reset ();
  },

  uninit : function () {
    this.removePointerListener (this.obj.view, core.POINTER_START, this.obj);
  },

  pointerStart: function (e) {
    if (this.__is_dragged) { return; }
    // prevent multi touch events
    if (e.nbPointers > 1) { return; }

    this.__start_x = e.pointerList[0].pageX;
    this.__start_y = e.pointerList[0].pageY;
    this.__is_dragged = true;

    this.addPointerListener (document, core.POINTER_END, this.obj);
    this.addPointerListener (document, core.POINTER_MOVE, this.obj);
  
    try {
      if (this.delegate && this.delegate.didDragStart)
        this.delegate.didDragStart (e);
    } catch (e) {
      console.log (e);
    }
    return false;
  },

  pointerMove: function (e) {
    if (!this.__is_dragged) { return; }

    var dx = e.pointerList[0].pageX - this.__start_x;
    var dy = e.pointerList[0].pageY - this.__start_y;
    
    try {
      if (this.delegate && this.delegate.didDrag)
        this.delegate.didDrag ({dx: dx, dy:dy}, e);
    } catch (e) {
      console.log (e);
    }
  },

  pointerEnd: function (e) {
    if (!this.__is_dragged) { return; }
    this.__is_dragged = false;
  
    this.removePointerListener (document, core.POINTER_END, this.obj);
    this.removePointerListener (document, core.POINTER_MOVE, this.obj);

    try {
      if (this.delegate && this.delegate.didDragEnd)
        this.delegate.didDragEnd (e);
    } catch (e) {
      console.log (e);
    }
  },

  pointerCancel: function (e) {
    return this.pointerEnd (e);
  }
};
util.extendClass (DragRecognizer, PointerRecognizer);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.DragRecognizer = DragRecognizer;