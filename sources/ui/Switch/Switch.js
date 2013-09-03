/*
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
 *  The vs.ui.Switch class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.Switch display an element showing the boolean state value.
 *  User is able to tap the control to change the value.
 *  <p>
 *  Events:
 *  <ul>
 *    <li /> change: Fired after the switch is tap. Event.data = true if button is toggled.
 *  </ul>
 *  <p>
 *  @example
 *  var toggle = new vs.ui.Switch ();
 *  toggle.init ();
 *  toggle.position = [100, 250];
 *
 *  toggle.textOn = 'I'
 *  toggle.textOff = 'O'
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.Switch 
 *
 *  @constructor
 *   Creates a new vs.ui.Switch.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function Switch (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Switch;
}

/**
 * @private
 * @const
 */
Switch.MODE_DEFAULT = 0;

/**
 * @private
 * @const
 */
Switch.MODE_IOS = 1;
/**
 * @private
 * @const
 */
Switch.MODE_ANDROID = 2;

/**
 * @private
 * @const
 */
Switch.MODE_MEEGO = 3;

/**
 * @private
 * @const
 */
Switch.MODE_WP7 = 4;

/**
 * @private
 * @const
 */
Switch.MODE_SYMBIAN = 5;

/**
 * @private
 * @const
 */
Switch.MODE_BLACKBERRY = 6;

Switch.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @private
   * @type {boolean}
   */
  __tap_recognizer: null,
  __switch_translate: 0,
    
  /**
   *
   * @protected
   * @type {boolean}
   */
  _selected: false,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _toggled: true,

  /**
   * @private
   * @type {Number}
   */
  _mode: Switch.MODE_DEFAULT,

  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __toggle_on_view: null,

  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __toggle_off_view: null,

  /**
   *
   * @private
   * @type {HTMLDivElement}
   */
  __switch_view: null,
  
  /**
   *
   * @protected
   * @type {string}
   */
  _text_on: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _text_off: "",
  
  /*****************************************************************
   *    
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  setPressed : function (v)
  {
    if (v)
    {
      this.addClassName ('selected');
      this._selected = true;
    }
    else
    {
      this.removeClassName ('selected');
      this._selected = false;
    }
  },

  /*****************************************************************
   *               General methods
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  _setToggle: function (v)
  {
  	this._initWidthSwitch ();
  	
    if (v)
    {
      this._toggled = true;
      this.addClassName ('on');
      if (this._mode === Switch.MODE_IOS)
      {
      	util.setElementTransform (this.__switch_view,
      		"translate3d(" + this.__switch_translate + "px,0,0)");
      }
    }
    else
    {
      this._toggled = false;
      this.removeClassName ('on');
      if (this._mode === Switch.MODE_IOS)
      {
	      util.setElementTransform (this.__switch_view, "translate3d(0,0,0)");
	    }
    }
    this.outPropertyChange ();
  },

  didTap : function ()
  {
    this._setToggle (!this._toggled);
    this.propagate ('change', this._toggled);
  },

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__tap_recognizer)
    {
      this.removePointerRecognizer (this.__tap_recognizer);
      this.__tap_recognizer = null;
    }
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);

    this.__toggle_on_view =
      this.view.querySelector ('.vs_ui_switch .toggle_on');
    this.__toggle_off_view =
      this.view.querySelector ('.vs_ui_switch .toggle_off');
    this.__switch_view =
      this.view.querySelector ('.vs_ui_switch .switch');

    if (!this.__tap_recognizer)
    {
      this.__tap_recognizer = new TapRecognizer (this);
      this.addPointerRecognizer (this.__tap_recognizer);
    }

    var os_device =  vs.ui.View.getDeviceCSSCode (); //window.deviceConfiguration.os;

    if (os_device == DeviceConfiguration.OS_IOS)
    {
      this._mode = Switch.MODE_IOS;
    }
    
    if (this._text_on)
    {
      this.textOn = this._text_on;
    }
//     else
//     {
//       this.textOn = "";//"ON";
//     }
    if (this._text_off)
    {
      this.textOff = this._text_off;
    }
//     else
//     {
//       this.textOff = "";//"OFF";
//     }

    this.toggled = this._toggled;
  },
  
  _initWidthSwitch : function ()
  {
		this.__switch_translate = this.view.offsetWidth - this.__switch_view.offsetWidth;
  },
  
  /**
   * @protected
   * @function
   */
  _updateSizeAndPos: function ()
  {
    var
      w = this._size [0], h = this._size [1],
 	    x = this._pos [0], y = this._pos [1], width,
      pWidth = 0, pHeight = 0,
      sPosL = 'auto', sPosT = 'auto', sPosR = 'auto',
      aH = this._autosizing [0], aV = this._autosizing [1];
    
    if (this.view.parentNode)
    {
      pWidth = this.view.parentNode.offsetWidth;
      pHeight = this.view.parentNode.offsetHeight;
    }
    
    if (aH === 4 || aH === 1) { width = w + 'px'; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0)
    {
      if (pWidth)
      {
        width = Math.round (w / pWidth * 100) + '%';
      }
      else { width = w + 'px'; } 
    }
    
    else { width = '100%'; }
    
    
    if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || (aH === 2 && !pWidth))
    { sPosL = x + 'px'; }
    else if ((aH === 2 || aH === 0) && pWidth)
    { sPosL = Math.round (x / pWidth * 100) + '%'; }
    
    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (x + w) + 'px';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight))
    { sPosT = y + 'px'; }
    else if ((aV === 2 || aV === 0) && pHeight)
    { sPosT = Math.round (y  / pHeight * 100) + '%'; }

    this.view.style.width = width;
    this.view.style.removeProperty ('height');

    this.view.style.left = sPosL;
    this.view.style.top = sPosT;
    this.view.style.right = sPosR;
    this.view.style.bottom = 'auto';
  }
};
util.extendClass (Switch, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Switch, {

  'textOn': {
    /** 
     * Getter|Setter for the text switch. Allow to get or change the text draw
     * by the switch when its on.
     * @name vs.ui.Switch#textOn 
     * @type String
     */ 
    set : function (v)
    {
      if (!this.__toggle_on_view)
      {
        console.warn ("vs.ui.Switch.textOff, none initialized comp: " + this.id);
        return;
      }
  
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; }
        v = v.toString ();
      }
  
      this._text_on = v;
      util.setElementInnerText (this.__toggle_on_view, this._text_on);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text_on;
    }
  },
  'textOff': {
    /** 
     *  Getter|Setter for the text switch. Allow to get or change the text draw
     *  by the switch when its off.
     * @name vs.ui.Switch#textOff 
     *  @type String
     */ 
    set : function (v)
    {
      if (!this.__toggle_off_view)
      {
        console.warn ("vs.ui.Switch.textOff, none initialized comp: " + this.id);
        return;
      }
  
      if (v === null || typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; }
        v = v.toString ();
      }
  
      this._text_off = v;
      util.setElementInnerText (this.__toggle_off_view, this._text_off);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text_off;
    }
  },
  'toggled': {
  
    /** 
     * Getter|Setter the toggled state.
     * @name vs.ui.Switch#toggled 
     * @type boolean
     */ 
    set : function (v)
    {
      var self = this;
      vs.scheduleAction (function () { self._setToggle (v); });
    },
  
    /** 
     * @ignore
     * @return {boolean}
     */ 
    get : function ()
    {
      return this._toggled;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Switch = Switch;
