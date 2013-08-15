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


function PinchRecognizer (obj, delegate) {
  this.parent = PointerRecognizer;
  this.parent (obj, delegate);
  this.constructor = PinchRecognizer;
}

PinchRecognizer.prototype = {

  init : function () {
    this.addPointerListener (this.obj.view, core.GESTURE_START, this.obj);
    this.reset ();
  },

  uninit : function () {
    this.removePointerListener (this.obj.view, core.GESTURE_START, this.obj);
  },

  gestureStart: function (e) {
    this.addPointerListener (document, core.GESTURE_CHANGE, this.obj);
    this.addPointerListener (document, core.GESTURE_END, this.obj);

    return false;
  },

  gestureChange: function (event) {
    try {
      if (this.delegate && this.delegate.didPinchChange)
        this.delegate.didPinchChange (event.scale, event);
    } catch (e) {
      console.log (e);
    }
  },

  gestureEnd: function (e) {
    this.removePointerListener (document, core.GESTURE_CHANGE, this.obj);
    this.removePointerListener (document, core.GESTURE_END, this.obj);
  },

  pointerCancel: function (e) {
    return this.pointerEnd (e);
  }
};
util.extendClass (PinchRecognizer, PointerRecognizer);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.PinchRecognizer = PinchRecognizer;