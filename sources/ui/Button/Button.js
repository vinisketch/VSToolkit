/*
  COPYRIGHT NOTICE
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
 *  The vs.ui.Button class
 *
 *  @extends vs.ui.View
 *  @class
 *  The Button class is a subclass of vs.ui.View that intercepts pointer-down
 *  events and sends an 'select' event to a target object when it’s clicked
 *  or pressed.
 *
 *  Events:
 *  <ul>
 *    <li /> select: Fired after the button is clicked or pressed.
 *  </ul>
 *  <p>
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'mybutton';
 *  var config.text = 'Hello';
 *
 *  var myButton = Button (config);
 *  myButton.init ();
 *
 *  @example
 *  // Button with our own style
 *  var config = {}
 *  var config.id = 'mybutton';
 *  var config.text = 'Hello';
 *
 *  var myButton = vs.ui.Button (config);
 *  myButton.init ();
 *
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.Button
 *
 *  @constructor
 *   Creates a new vs.ui.Button.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function Button (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Button;
}

/**
 * default button
 * @name vs.ui.Button.DEFAULT_TYPE
 * @const
 */
Button.DEFAULT_TYPE = 'default';

/**
 * default style button
 * @name vs.ui.Button.DEFAULT_STYLE
 * @const
 */
Button.DEFAULT_STYLE = 'white';

/**
 * default style button
 * @name vs.ui.Button.GREEN_STYLE
 * @const
 */
Button.GREEN_STYLE = 'green';

/**
 * default style button
 * @name vs.ui.Button.RED_STYLE
 * @const
 */
Button.RED_STYLE = 'red';

/**
 * default style button
 * @name vs.ui.Button.GREY_STYLE
 * @const
 */
Button.GREY_STYLE = 'grey';

/**
 * Navigation button
 * @name vs.ui.Button.NAVIGATION_TYPE
 * @const
 */
Button.NAVIGATION_TYPE = 'nav';

/**
 * back button
 * @name vs.ui.Button.NAVIGATION_BACK_TYPE
 * @const
 */
Button.NAVIGATION_BACK_TYPE = 'nav_back';

/**
 * forward button
 * @name vs.ui.Button.NAVIGATION_FORWARD_TYPE
 * @const
 */
Button.NAVIGATION_FORWARD_TYPE = 'nav_forward';

/**
 * iPhone/iPad default style button
 * @name vs.ui.Button.BLUE_STYLE
 * @const
 */
Button.BLUE_STYLE = 'blue_style';

/**
 * iPhone/iPad black style button
 * @name vs.ui.Button.BLACK_STYLE
 * @const
 */
Button.BLACK_STYLE = 'black_style';

/**
 * iPhone/iPad silver style button
 * @name vs.ui.Button.SILVER_STYLE
 * @const
 */
Button.SILVER_STYLE = 'silver_style';

Button.prototype = {
  
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
   * @type {number}
   */
  _style: Button.DEFAULT_STYLE,

  /**
   *
   * @protected
   * @type {number}
   */
  _type: Button.DEFAULT_TYPE,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _selected: false,

  /**
   *
   * @protected
   * @type {string}
   */
  _text: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _released_image: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _selected_image: "",

  /**
   *
   * @protected
   * @type {string}
   */
  _disabled_image: "",

  /*****************************************************************
   *               General methods
   ****************************************************************/
    
  /**
   * @protected
   * @function
   */
  _setPressed : function (v)
  {
    if (v)
    {
      this.addClassName ('pressed');
      this._selected = true;
    }
    else
    {
      this.removeClassName ('pressed');
      this._selected = false;
    }
  },
  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__touch_binding)
    {
      this.view.removeEventListener (core.POINTER_START, this);
      this.__touch_binding = false;
    }
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initSkin : function ()
  {
    View.prototype.initSkin.call (this);

    if (!this.__touch_binding)
    {
      this.view.addEventListener (core.POINTER_START, this);
      this.__touch_binding = true;
    }

    if (this._text)
    {
      this.text = this._text;
    }
    else
    {
      this.text = "";
    }
    this.view.name = this.id;
    if (this._style) this.addClassName (this._style);
    if (this._type) this.addClassName (this._type);
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
        if (core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }
        
        // we keep the event
        e.stopPropagation ();
        
        if (this.__button_time_out)
        {
          clearTimeout (this.__button_time_out);
          this.__button_time_out = 0;
        }
        
        this._setPressed (true);
        document.addEventListener (core.POINTER_END, this);
        document.addEventListener (core.POINTER_MOVE, this);
        this.__start_x = core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX;
        this.__start_y = core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY;
        this.__is_touched = true;
        
        return false;
      break;

      case core.POINTER_MOVE:
        if (!this.__is_touched) { return; }

        var dx = 
          (core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX) - this.__start_x;
        var dy =
          (core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY) - this.__start_y;
          
        if (Math.abs (dx) + Math.abs (dy) < View.MOVE_THRESHOLD)
        {
          // we keep the event
          e.stopPropagation ();
          return false;
        }
 
        document.removeEventListener (core.POINTER_END, this);
        document.removeEventListener (core.POINTER_MOVE, this);
        this.__is_touched = false;

        this._setPressed (false);
        
        return false;
      break;

      case core.POINTER_END:
        if (!this.__is_touched) { return; }
        this.__is_touched = false;
        
        // we keep the event
        e.stopPropagation ();

        document.removeEventListener (core.POINTER_END, this);
        document.removeEventListener (core.POINTER_MOVE, this);

        this.__button_time_out = window.setTimeout (function ()
        {
          self._setPressed (false);
          self.__button_time_out = 0;
        }, View.UNSELECT_DELAY);        
  
        this.propagate ('select');
        console.log ('Button .propagate');
        
        return false;
      break;
    }
  }
};
util.extendClass (Button, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Button, {
  'text': {
    /** 
     * Getter|Setter for text. Allow to get or change the text draw
     * by the button
     * @name vs.ui.Button#text 
     * @type String
     */ 
    set : function (v)
    {
      if (typeof (v) === "undefined") { v = ''; }
      else if (util.isNumber (v)) { v = '' + v; }
      else if (!util.isString (v))
      {
        if (!v.toString) { return; }
        v = v.toString ();
      }
  
      this._text = v;
      if (this.view)
      {
        util.setElementInnerText (this.view, this._text);
      }
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._text;
    }
  },
  'style': {
    /** 
     * Getter|Setter for the button style (for instance blue, sliver, ...)
     * @name vs.ui.Button#style 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      // code to remove legacy spec
      v = v.replace ('_ios', '');
      
      if (this._style)
      {
        this.removeClassName (this._style);
      }
      this._style = v;
      this.addClassName (this._style);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._style;
    }
  },
  'type': {
    /** 
     * Getter|Setter for the button type (DEFAULT_TYPE, NAVIGATION_TYPE,…)
     * @name vs.ui.Button#type 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (this._type)
      {
        this.removeClassName (this._type);
      }
      this._type = v;
      this.addClassName (this._type);
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._type;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Button = Button;
