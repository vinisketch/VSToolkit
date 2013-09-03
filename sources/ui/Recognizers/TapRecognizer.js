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


function TapRecognizer (delegate) {
  this.parent = PointerRecognizer;
  this.parent (delegate);
  this.constructor = TapRecognizer;
}

var MULTI_TAP_DELAY = 100;

TapRecognizer.prototype = {

  __is_touched: false,
  __unselect_time_out: 0,
  __did_tap_time_out: 0,
  __tap_mode: 0,

  init : function (obj) {
    PointerRecognizer.prototype.init.call (this, obj);
    
    this.addPointerListener (this.obj.view, core.POINTER_START, this.obj);
    this.reset ();
  },

  uninit : function () {
    this.removePointerListener (this.obj.view, core.POINTER_START, this.obj);
  },

  pointerStart: function (e) {
    if (this.__is_touched) { return; }
    // prevent multi touch events
    if (e.nbPointers > 1) { return; }
    
    if (this.__tap_mode === 0) {
      this.__tap_mode = 1;
    }
    
    if (this.__unselect_time_out) {
      clearTimeout (this.__unselect_time_out);
      this.__unselect_time_out = 0;
    }
    else {
      try {
        if (this.delegate && this.delegate.setPressed)
          this.delegate.setPressed (true, e);
      } catch (e) {
        console.log (e);
      }
    }

    if (this.__did_tap_time_out) {
      this.__tap_mode ++;
      clearTimeout (this.__did_tap_time_out);
      this.__did_tap_time_out = 0;
    }
  
    this.addPointerListener (document, core.POINTER_END, this.obj);
    this.addPointerListener (document, core.POINTER_MOVE, this.obj);
  
    this.__start_x = e.pointerList[0].pageX;
    this.__start_y = e.pointerList[0].pageY;
    this.__is_touched = true;
  
    return false;
  },

  pointerMove: function (e) {
    if (!this.__is_touched) { return; }

    var dx = e.pointerList[0].pageX - this.__start_x;
    var dy = e.pointerList[0].pageY - this.__start_y;
    
    if (Math.abs (dx) + Math.abs (dy) < View.MOVE_THRESHOLD) {
      // we still in selection mode
      return false;
    }

    // cancel the selection mode
    this.removePointerListener (document, core.POINTER_END, this.obj);
    this.removePointerListener (document, core.POINTER_MOVE, this.obj);
    this.__is_touched = false;

    try {
      if (this.delegate && this.delegate.setPressed)
        this.delegate.setPressed (false, e);
    } catch (e) {
      console.log (e);
    }
  },

  pointerEnd: function (e) {
    if (!this.__is_touched) { return; }
    this.__is_touched = false;
    var self = this;
  
    this.removePointerListener (document, core.POINTER_END, this.obj);
    this.removePointerListener (document, core.POINTER_MOVE, this.obj);

    if (this.delegate && this.delegate.setPressed) {
      this.__unselect_time_out = setTimeout (function () {
        try {
          self.delegate.setPressed (false, e);
        } catch (e) {
          console.log (e);
        }
        self.__unselect_time_out = 0;
      }, View.UNSELECT_DELAY);        
    }
    
    if (this.delegate && this.delegate.setPressed) {
      this.__did_tap_time_out = setTimeout (function () {
        try {
          self.delegate.didTap (self.__tap_mode, e);
        } catch (e) {
          console.log (e);
        }
        self.__tap_mode = 0;
        self.__did_tap_time_out = 0;
      }, MULTI_TAP_DELAY);
    } else {
      self.__tap_mode = 0;
    }
  },

  pointerCancel: function (e) {
    return this.pointerEnd (e);
  }
};
util.extendClass (TapRecognizer, PointerRecognizer);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.TapRecognizer = TapRecognizer;
