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


function PointerRecognizer (obj, delegate) {
  this.constructor = PointerRecognizer;

  this.obj = obj;
  this.delegate = delegate;
}

var POINTER_LISTENERS = [];

PointerRecognizer.prototype = {

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

  init: function () {},

  uninit: function () {},

  reset: function () {},

  pointerStart: function (event) {},

  pointerMove: function (event) {},

  pointerEnd: function (event) {},

  pointerCancel: function (event) {},

  gestureStart: function (event) {},

  gestureChange: function (event) {},

  gestureEnd: function (event) {}
};

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.PointerRecognizer = PointerRecognizer;
