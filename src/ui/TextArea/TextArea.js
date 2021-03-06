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

import vs_utils from 'vs_utils';
import vs_core from 'vs_core';
import { addPointerListener, removePointerListener, POINTER_START, POINTER_END } from 'vs_gesture';

import View from '../View/View';
import html_template from './TextArea.html';

/**
 * The vs.ui.TextArea component defines a multi-line text input control.
 * A text area can hold an unlimited number of characters, and the text
 * renders in a fixed-width font.
 * 
 * @constructor
 * @name vs.ui.TextArea
 * @extends vs.ui.View
 * @class
 *  The vs.ui.TextArea component defines a multi-line text input control. A text area can hold an unlimited number of characters, and the text renders in a fixed-width font.
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> continuous_change: data [text]; the current text
 *    <li/> change: data [text]: Data is the current text
 *  </ul>
 *  <p>
 */
function TextArea (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = TextArea;
}

TextArea.prototype = {

  html_template: html_template,
  
  /**
   * Translate value on x
   * @private
   * @type {number}
   */
  _ab_view_t_x : 0,

  /**
   * Translate value on y
   * @private
   * @type {number}
   */
  _ab_view_t_y : 0,

  /**
   * The text value
   * @protected
   * @type {string}
   */
  _value: "",

/*****************************************************************
 *
 ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this.view.removeEventListener ('change', this);
    this.view.removeEventListener ('focus', this);
    this.view.removeEventListener ('blur', this);
    this.view.removeEventListener ('textInput', this);

    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    if (!vs_utils.isString (this._value)) {return;}
    
    this.view.value = this._value;

    this.view.addEventListener ('textInput', this);
    this.view.addEventListener ('change', this);
    this.view.addEventListener ('focus', this);
    this.view.addEventListener ('blur', this);
  },
    
  /**
   *  Set the focus to your input
   *
   * @name vs.ui.TextArea#setFocus 
   * @function
   */
  setFocus : function ()
  {
    this.view.focus ();
  },

  /**
   *  Remove the focus to your input
   *
   * @name vs.ui.TextArea#setBlur 
   * @function
   */
  setBlur : function ()
  {
    this.view.blur ();
  },

  /*****************************************************************
   *                Events Management
   ****************************************************************/

  /**
   *  set pointer events
   *  @TODO a documenter un peu
   *
   * @name vs.ui.TextArea#setPointerEvents 
   * @function
   */
  setPointerEvents : function (v)
  {
    if (v)
    { this._text_field.style.pointerEvents = 'none'; }
    else
    { this._text_field.style.pointerEvents = 'auto'; }
  },

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var self = this;
    function manageBlur (event)
    {
      if (event.src === self.view)
      { return; }
      
      removePointerListener (document, POINTER_START, manageBlur, true);
      self.setBlur ();
    }
    
    switch (event.type)
    {
      case 'focus':
        addPointerListener (document, POINTER_START, manageBlur, true);
      break;

      case 'blur':
      break;
      
      case 'change':
        this._value = this.view.value;
        this.outPropertyChange ();
        this.propagate ('change', this._value);
        break;
        
      case  'textInput':
        this._value = this.view.value;
        this.outPropertyChange ();
        this.propagate ('continuous_change', this._value);
        break;
    }
  }
};
vs_utils.extendClass (TextArea, View);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperty (TextArea, "value", {
  /**
   * Set the text value
   * @param {string} v
   */
  set : function (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (vs_utils.isNumber (v)) { v = '' + v; }
    else if (!vs_utils.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    this._value = v;
    
    this.view.value = v;
  },

  /**
   * get the text value
   * @ignore
   * @type {string}
   */
  get : function ()
  {
    return this._value;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default TextArea;
