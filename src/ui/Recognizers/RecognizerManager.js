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
import PointerRecognizer from './PointerRecognizer';
import {
  POINTER_START, POINTER_END, POINTER_MOVE,
  GESTURE_START, GESTURE_CHANGE, GESTURE_END
} from 'vs_gesture';
/**
 * @protected
 */
var RecognizerManager = {
  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    if (this.__pointer_recognizers.length) {
      
      if (!this._enable) { return; }
     
      switch (e.type) {
        case POINTER_START:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.pointerStart (e);
          });
        break;

        case POINTER_MOVE:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.pointerMove (e);
          });
        break;

        case POINTER_END:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.pointerEnd (e);
          });
        break;

        case POINTER_CANCEL:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.pointerCancel (e);
          });
        break;

        case GESTURE_START:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.gestureStart (e);
          });
          break;
        
        case GESTURE_CHANGE:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.gestureChange (e);
          });
          break;
        
        case GESTURE_END:
          this.__pointer_recognizers.forEach (function (recognizer) {
            recognizer.gestureEnd (e);
          });
          break;
      }
    }
    else if (this._propagateToParent) this._propagateToParent (e);
  },
  
  __pointer_recognizers: null,
  
  addPointerRecognizer: function (recognizer)
  {
    if (!recognizer instanceof PointerRecognizer) return;
    
    if (this.__pointer_recognizers.indexOf (recognizer) !== -1) return;
    
    this.__pointer_recognizers.push (recognizer);
    recognizer.init (this);
  },

  removePointerRecognizer: function (recognizer)
  {
    if (!recognizer instanceof PointerRecognizer) return;
    
    this.__pointer_recognizers.remove (recognizer);
    recognizer.uninit ();
  }
};

export default RecognizerManager;
