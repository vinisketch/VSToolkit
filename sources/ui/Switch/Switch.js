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
  __touch_binding: false,
  __is_touched: false,
    
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
  _setSelected : function (v)
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
    if (v)
    {
      this._toggled = true;
      this.addClassName ('on');
    }
    else
    {
      this._toggled = false;
      this.removeClassName ('on');
    }
    this.propertyChange ();
  },

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__touch_binding)
    {
      vs.removePointerListener (this.view, core.POINTER_START, this);
      this.__touch_binding = false;
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

    if (!this.__touch_binding)
    {
      vs.addPointerListener (this.view, core.POINTER_START, this);
      this.__touch_binding = true;
    }

    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_IOS)
    {
      this._mode = Switch.MODE_IOS;
    }
    else if (os_device == DeviceConfiguration.OS_ANDROID)
    {
      this._mode = Switch.MODE_ANDROID;
    }
    else if (os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      this._mode = Switch.MODE_SYMBIAN;
    }
    else if (os_device == DeviceConfiguration.OS_MEEGO)
    {
      this._mode = Switch.MODE_MEEGO;
    }
    else if (os_device == DeviceConfiguration.OS_WP7)
    {
      this._mode = Switch.MODE_WP7;
    }
    else if (os_device == DeviceConfiguration.OS_BLACK_BERRY)
    {
      this._mode = Switch.MODE_BLACKBERRY;
    }

    if (this._text_on)
    {
      this.textOn = this._text_on;
    }
    else
    {
      this.textOn = "ON";
    }
    if (this._text_off)
    {
      this.textOff = this._text_off;
    }
    else
    {
      this.textOff = "OFF";
    }

    this.toggled = this._toggled;
  },
  
  refresh : function ()
  {
    View.prototype.refresh.call (this);

    switch (this._mode)
    {
      case Switch.MODE_IOS:
        this.__width_switch = 28;
      break;
    
      case Switch.MODE_WP7:
        this.__width_switch = 23;
      break;

      case Switch.MODE_BLACKBERRY:
        this.__width_switch = 20;
      break;

      default:
      // this method could not work if the view his not displaied
      this.__width_switch = this.__switch_view.offsetWidth;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    var pos = this._pos, size = this._size, width
      aH = this._autosizing [0], aV = this._autosizing [1], sPosR = 'auto';
    
    if (this.view.parentNode)
    {
      pWidth = this.view.parentNode.offsetWidth;
    }
    
    if (aH === 4 || aH === 1) { width = size[0] + 'px'; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0)
    {
      if (pWidth)
      {
        width = Math.round (size[0] / pWidth * 100) + '%';
      }
      else { width = size[0] + 'px'; } 
    }
    
    else { width = '100%'; }

    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (pos[0] + size [0]) + 'px';
    }
    
    this.view.style.width = width;
    this.view.style.right = sPosR;
    this.view.style.bottom = 'auto';
    this.view.style.removeProperty ('height');
  },
  
  /**
   * @protected
   * @function
   */
  _updatePos : function ()
  {
    var pos = this._pos, size = this._size, pWidth = 0, pHeight = 0,
      sPosL = 'auto', sPosT = 'auto', sPosR = 'auto',
      aH = this._autosizing [0], aV = this._autosizing [1];
      
    if (this.view.parentNode)
    {
      pWidth = this.view.parentNode.offsetWidth;
      pHeight = this.view.parentNode.offsetHeight;
    }
    
    if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || (aH === 2 && !pWidth))
    { sPosL = pos[0] + 'px'; }
    else if ((aH === 2 || aH === 0) && pWidth)
    { sPosL = Math.round (pos[0] / pWidth * 100) + '%'; }
    
    if (aH === 1 || aH === 3 || aH === 5 || aH === 7)
    {
      sPosR = pWidth - (pos[0] + size [0]) + 'px';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight))
    { sPosT = pos[1] + 'px'; }
    else if ((aV === 2 || aV === 0) && pHeight)
    { sPosT = Math.round (pos[1]  / pHeight * 100) + '%'; }

    this.view.style.left = sPosL;
    this.view.style.top = sPosT;
    this.view.style.right = sPosR;
    this.view.style.bottom = 'auto';
  },
  
  /*****************************************************************
   *               Pointer events management
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    if (!this._enable) { return; }
    var self = this;
        
    // by default cancel any default behavior to avoid scroll
    e.preventDefault ();

    switch (e.type)
    {
      case core.POINTER_START:
        if (this.__is_touched) { return; }
        // prevent multi touch events
        if (e.nbPointers > 1) { return; }

        // we keep the event
        e.stopPropagation ();
                
        this._setSelected (true);
        vs.addPointerListener (document, core.POINTER_END, this);
        vs.addPointerListener (document, core.POINTER_MOVE, this);
        this.__start_x = e.pointerList[0].pageX;
        this.__start_y = e.pointerList[0].pageY;
        this.__is_touched = true;
        
        return false;
      break;

      case core.POINTER_MOVE:
        if (!this.__is_touched) { return; }

        var dx = e.pointerList[0].pageX - this.__start_x;
        var dy = e.pointerList[0].pageY - this.__start_y;
        
        // manage swipe and selection
        if (this._mode === Switch.MODE_IOS)
        {
          if (Math.abs (dy) < View.MOVE_THRESHOLD && 
            ((this._toggled && dx < 0 && dx > -this._size[0]) ||
             (!this._toggled && dx > 0 && dx < this._size[0])))
          {
            // we keep the event
            e.stopPropagation ();
            return false;
          }
        }
        else
        {
          if ((Math.abs (dy) + Math.abs (dy)) < View.MOVE_THRESHOLD)
          {
            // we keep the event
            e.stopPropagation ();
            return false;
          }
        }

        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);
        this.__is_touched = false;

        this._setSelected (false);
        
        return false;
      break;

      case core.POINTER_END:
        if (!this.__is_touched) { return; }
        this.__is_touched = false;

        // we keep the event
        e.stopPropagation ();

        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);

        this._setSelected (false);

        this._setToggle (!this._toggled);
        this.propagate ('change', this._toggled);
        
        return false;
      break;
    }
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
