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
 *  The vs.ui.TapRecognizer class
 *
 *  @extends vs.ui.PointerRecognizer
 *
 *  @class
 *  vs.ui.TapRecognizer is a concrete subclass of vs.ui.PointerRecognizer that
 *  looks for single or multiple taps/clicks.<br />
 *
 *  The TapRecognizer delegate has to implement following methods:
 *  <ul>
 *    <li /> didTouch (event). Call when the element is touched; It useful to
 *      implement this method to implement a feedback on the event (for instance
 *      add a pressed class)
 *    <li /> didUntouch (event). Call when the element is untouched; It useful to
 *      implement this method to implement a feedback on the event (for instance
 *      remove a pressed class)
 *    <li /> didTap (nb_tap, event). Call when the element si tap/click. nb_tap
 *      is the number of tap/click.
 *  </ul>
 *  <p>
 *
 *  @example
 *  var my_view = new vs.ui.View ({id: "my_view"}).init ();
 *  var recognizer = new TapRecognizer ({
 *    didTouch : function (event) {
 *      my_view.addClassName ("pressed");
 *    },
 *    didUntouch : function (event) {
 *      my_view.removeClassName ("pressed");
 *    },
 *    didTap : function (nb_tap, event) {
 *      my_view.hide ();
 *    }
 *  });
 *  my_view.addPointerRecognizer (recognizer);
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.TapRecognizer.
 *
 * @name vs.ui.TapRecognizer
 *
 * @param {ReconizerDelegate} delegate the delegate [mandatory]
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

  /**
   * @name vs.ui.TapRecognizer#init
   * @function
   * @protected
   */
  init : function (obj) {
    PointerRecognizer.prototype.init.call (this, obj);
    
    this.addPointerListener (this.obj.view, core.POINTER_START, this.obj);
    this.reset ();
  },

  /**
   * @name vs.ui.TapRecognizer#uninit
   * @function
   * @protected
   */
  uninit : function () {
    this.removePointerListener (this.obj.view, core.POINTER_START, this.obj);
  },

  /**
   * @name vs.ui.TapRecognizer#pointerStart
   * @function
   * @protected
   */
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
        if (this.delegate && this.delegate.didTouch)
          this.delegate.didTouch (e);
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

  /**
   * @name vs.ui.TapRecognizer#pointerMove
   * @function
   * @protected
   */
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
      if (this.delegate && this.delegate.didTouch)
        this.delegate.didUntouch (e);
    } catch (e) {
      console.log (e);
    }
  },

  /**
   * @name vs.ui.TapRecognizer#init
   * @function
   * @protected
   */
  pointerEnd: function (e) {
    if (!this.__is_touched) { return; }
    this.__is_touched = false;
    var self = this;
  
    this.removePointerListener (document, core.POINTER_END, this.obj);
    this.removePointerListener (document, core.POINTER_MOVE, this.obj);

    if (this.delegate && this.delegate.didUntouch) {
      this.__unselect_time_out = setTimeout (function () {
        try {
          self.delegate.didUntouch (e);
        } catch (e) {
          console.log (e);
        }
        self.__unselect_time_out = 0;
      }, View.UNSELECT_DELAY);        
    }
    
    if (this.delegate && this.delegate.didTap) {
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

  /**
   * @name vs.ui.TapRecognizer#pointerCancel
   * @function
   * @protected
   */
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
