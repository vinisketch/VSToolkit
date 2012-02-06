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
 *  The vs.ui.InputField class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.InputField class implements an input text.
 *  <p/>
 *  The control provides 
 *  a text field (for entering text) and cancel button. The View can be styled
 *  as a text field, a password field style (characters are replaced by dots)
 *  or a search field style.
 *  <p/>
 *  Events:
 *  <ul>
 *    <li /> change: Fired after the user enter a new value
 *  </ul>
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.InputField.
 * @name vs.ui.InputField
 *
 *  @example
 *   var myInput = new vs.ui.InputField ({id:'input'});
 *   myInput.init ();
 *
 *   myInput.placeholder = "Type our password...";
 *   myVideo.type = vs.ui.InputField.PASSWORD;
 *
 * @param {Object} config The configuration structure [mandatory]
*/
function InputField (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = InputField;
}

/**
 * InputField is a text input
 * @name vs.ui.InputField.TEXT
 * @const
 */
InputField.TEXT = 'text';

/**
 * InputField is a passord input, that means the characters are replaced by dots
 * @name vs.ui.InputField.PASSWORD
 * @const
 */
InputField.PASSWORD = 'password';

/**
 * InputField is a search input
 * @name vs.ui.InputField.SEARCH
 * @const
 */
InputField.SEARCH = 'search';

InputField.prototype = {

  /**
   * The text field node
   * @private
   * @type {HTMLElement}
   */
  _text_field: null,
  
  /**
   * @private
   * @type {HTMLElement}
   */
  _clear_button: null,

  /**
   * The current field value
   *
   * @protected
   * @type {string}
   */
  _value: "",
  
  /**
   * @protected
   * @type {string}
   */
  _placeholder: "type ...",
  
  /**
   * The field type (TEST, PASSWORD, SEARCH)
   *
   * @protected
   * @type {int}
   */
  _type: InputField.TEXT,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    this._text_field.removeEventListener ('focus', this);
    this._text_field.removeEventListener ('blur', this);
    this._text_field.removeEventListener ('change', this);
    this._text_field.removeEventListener ('input', this);
    
    if (this._clear_button)
    {    
      this.nodeUnbind (this._clear_button, core.POINTER_START, 'cleanData');  
    }
    delete (this._text_field);

    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
        
    this._text_field = this.view.querySelector ('input');
    this._text_field.name = this.id
    
    this._clear_button = this.view.querySelector ('.clear_button');
    if (this._clear_button)
    {
      this.nodeBind (this._clear_button, core.POINTER_START, 'cleanData');  
    }
    this.type = this._type;
    this.value = this._value;
    this.placeholder = this._placeholder;

    this._text_field.addEventListener ('focus', this);
    this._text_field.addEventListener ('blur', this);
    this._text_field.addEventListener ('change', this);
    this._text_field.addEventListener ('input', this);
  },
    
  /**
   * @protected
   * @function
   */
  cleanData : function (v)
  {
    this._text_field.value = '';
    this._value = '';
    this._activateDelete (false);
    
    this.propertyChange ();
    this.propagate ('continuous_change', this._value);
    this.propagate ('change', this._value);
  },
    
  /**
   * @private
   * @function
   */
  changeData : function ()
  {
    this._value = this._text_field.value;
    if (this._value) { this._activateDelete (true); }
    else { this._activateDelete (false); }
  },
  
  /**
   * @private
   * @function
   */
  _activateDelete : function (v)
  {
    if (!this._clear_button)
    { return; }
    
    if (v) { util.setElementVisibility (this._clear_button, true); }
    else { util.setElementVisibility (this._clear_button, false); }
  },
  
  /**
   * @private
   * @function
   */
  onkeydown : function (event)
  {
    event = fixEvent (event)
    
    var editor = event.target
    if ((event.keyCode === TAB) || (event.keyCode === ENTER))
    {
      editor.blur ();
      return false
    }
  },
  
  /**
   * Set the focus to your input
   * @name vs.ui.InputField#setFocus 
   * @function
   */
  setFocus : function ()
  {
    this._text_field.focus ();
  },

  /**
   * Remove the focus to your input
   * @name vs.ui.InputField#setBlur 
   * @function
   */
  setBlur : function ()
  {
    this._text_field.blur ();
  },
  
  /**
   *  Set pointer events
   *
   * @name vs.ui.InputField#setPointerEvents 
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
   * @private
   * @function
   */
  handleEvent : function (event)
  {
    var self = this;
    function manageBlur (event)
    {
      if (event.target === self.view || event.target === self._text_field)
      { return; }
      
      if (event.target === self._clear_button)
      {
        self.cleanData ();
        event.stopPropagation ();
        event.preventDefault ();
        return;
      }
      
      document.removeEventListener (core.POINTER_START, manageBlur, true);
      self.setBlur ();
    }

    if (event.type === 'change')
    {
      this.changeData ();
      this.propertyChange ();
      this.propagate ('change', this._value);
    }
    else if (event.type === 'input')
    {
      this.changeData ();
      this.propertyChange ();
      this.propagate ('continuous_change', this._value);
    }
    else if (event.type === 'focus')
    {
      this.addClassName ('focus');
      this._value = this._text_field.value;
      if (this._value) { this._activateDelete (true); }
      else { this._activateDelete (false); }
      
      document.addEventListener (core.POINTER_START, manageBlur, true);
    }
    else if (event.type === 'blur')
    {
      this.removeClassName ('focus');
      this._activateDelete (false);
      window.scrollTo (0, 0);
    }
  }
}
util.extendClass (InputField, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (InputField, {
  'value': {
    /**
     * Allows to set the input value
     * @name vs.ui.InputField#value 
     * @type {string}
     */
    set : function (v)
    {
      if (typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; };
        v = v.toString ();
      }
  
      this._value= v;
      if (this._text_field)
      {
        this._text_field.value = this._value;
        if (!this._value || this._value === '')
        {this._activateDelete (false);}
        else {this._activateDelete (true);}
      }
    },
  
    /**
     * @ignore
     * @type {string}
     * @nosideeffects
     */
    get : function ()
    {
      this._value = this._text_field.value;
      return this._value;
    }
  },
  'type': {
    /**
     * Allows to change the input type.
     * you can choose between :
     * <ul>
     *   <li/>vs.ui.InputField.TEXT
     *   <li/>vs.ui.InputField.PASSWORD
     *   <li/>vs.ui.InputField.SEARCH
     * </ul>
     * @name vs.ui.InputField#type 
     * @type {enum}
     */
    set : function (v)
    {
      if (v !== InputField.TEXT &&
        v !== InputField.PASSWORD &&
        v !== InputField.SEARCH) { return; }
  
      if (!this.view) { return; } 
      
      this.removeClassName (this._type);
      this._type = v;
      this.addClassName (this._type);
      
      if (!this._text_field) { return; }
      if (this._type === InputField.PASSWORD)
      {
        this._text_field.setAttribute ('type', 'password');
      }
      else if (this._type === InputField.SEARCH)
      {
        this._text_field.setAttribute ('type', 'search');
      }
      else
      {
        this._text_field.setAttribute ('type', 'text');
      }
    }
  },
  'placeholder': {
    /**
     * Defines a hint to help users fill out the input field.
     * @name vs.ui.InputField#placeholder 
     * @type {enum}
     */
    set : function (v)
    {
      if (typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; };
        v = v.toString ();
      }
  
      this._placeholder = v;
      if (this._text_field)
      {
        this._text_field.setAttribute ('placeholder', this._placeholder);
      }
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.InputField = InputField;
