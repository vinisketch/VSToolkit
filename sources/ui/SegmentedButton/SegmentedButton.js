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
 *  The vs.ui.SegmentedButton class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.SegmentedButton class is a subclass of vs.ui.View that intercepts
 *  pointer-down events and sends an 'select' event to a target object when
 *  it’s clicked or pressed.
 *  <br />
 *  The widget displays horizontally a set of button. Only one button can be
 *  selected.
 *  <br />
 *  Events:
 *  <ul>
 *    <li /> select: Fired after a button is pressed. {index, item}
 *  </ul>
 *  <p>
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *
 *  var segButton = vs.ui.SegmentedButton ({
 *    items : ['test1', 'test2', 'test3'],
 *    size : [280, 30],
 *    style : vs.ui.SegmentedButton.BAR_STYLE
 *  }).init ();
 * <p>
 *
 *  @author David Thevenin
 * @name vs.ui.SegmentedButton
 *
 *  @constructor
 *   Creates a new vs.ui.SegmentedButton.
 * @name s.ui.SegmentedButton
 *
 * @param {Object} config the configuration structure
*/
function SegmentedButton (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = SegmentedButton;
}

/**
 * default type
 * @name vs.ui.SegmentedButton.DEFAULT_TYPE
 * @const
 */
SegmentedButton.DEFAULT_TYPE = 'default';;

/**
 * bar type
 * @name vs.ui.SegmentedButton.BAR_TYPE
 * @const
 */
SegmentedButton.BAR_TYPE = 'bar';;

SegmentedButton.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @protected
   * @type {number}
   */
  _type: SegmentedButton.DEFAULT_TYPE,

  /**
   *
   * @protected
   * @type {number}
   */
  _is_toggle_buttons: true,

  /**
   *
   * @protected
   * @type {array.<string>}
   */
  _items: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _selected_index: -1,

  /**
   *
   * @private
   * @type {array.<HtmlDivElement>}
   */
  _div_list: null,

  /*****************************************************************
   *               General methods
   ****************************************************************/
    
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this._cleanButtons ();
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  _cleanButtons : function (v)
  {
    if (!this.view) { return; }
    
    this.view.innerHTML = "";
    
    while (this._div_list.length)
    {
      var div = this._div_list [0];
      div.removeEventListener (core.POINTER_START, this);
      
      this._div_list.remove (0);
    }
  },
  
  /**
   * @protected
   * @function
   */
  _renderButtons : function (v)
  {
    if (!this.view) { return; }
    
    this._cleanButtons ();
    var width = "";
    var os_device = window.deviceConfiguration.os;
    if (this._items.length && os_device == DeviceConfiguration.OS_WP7)
      width = Math.floor (100 / this._items.length);
      
    var subView = document.createElement ('div');
    this.view.appendChild (subView)
    
    for (var i = 0, l = this._items.length; i < l; i++)
    {
      var div = document.createElement ('div');
      div._index = i;
      div.innerHTML = this._items [i];
      
      // WP7 does not manage box model (then use inline-block instead of)
      if (width) util.setElementStyle (div, {"width": width + '%'});

      div.addEventListener (core.POINTER_START, this);
      
      this._div_list.push (div);
      subView.appendChild (div);
    }
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    this._items = new Array ();
    this._div_list = new Array ();

    this._renderButtons ();
    this.selectedIndex = this._selected_index;
    this.type = this._type;
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent: function (e)
  {
    var target;
    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }
      
      // hack to retrieve the correct source (the bug occurs on iOS)
      target = e.target;
      if (!target.tagName)
      {
        target = target.parentElement;
      }
      if (this._selected_index === target._index)
      { return false; }
      
      e.stopPropagation ();
      e.preventDefault ();

      this.selectedIndex = target._index;
      this.propagate ('select', {
        index: this._selected_index,
        item: this._items [this._selected_index]
      });
      
      this.propertyChange ();
      
      return false;
    }
  }
};
util.extendClass (SegmentedButton, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (SegmentedButton, {
  'items': {
    /** 
     * Getter|Setter for text. Allow to get or change the text draw
     * by the button
     * @name vs.ui.SegmentedButton#text 
     * @type String
     */ 
    set : function (v)
    {
      var i, l;
      if (!util.isArray (v) || !v.length) { return; }
      
      this._items.removeAll ();
      for (var i = 0, l = v.length; i < l; i++)
      {
        if (!v [i]) { continue; }
        
        this._items.push (v [i].toString ());
      }
      
      this._renderButtons ();
      if (this._is_toggle_buttons) this.selectedIndex = this._selected_index;
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
  'selectedIndex': {
    /** 
     * Getter|Setter for select one of button
     * @name vs.ui.SegmentedButton#selectedIndex 
     * @type number
     */ 
    set : function (v)
    {
      if (!util.isNumber (v)) { return; }
      if (v < 0 || v >= this._div_list.length) { return; }
          
      var div = this._div_list [this._selected_index];
      if (div)
      {
        util.removeClassName (div, 'selected'); 
      }
      
      this._selected_index = v;
      var div = this._div_list [this._selected_index];
      if (div)
      {
        util.addClassName (div, 'selected'); 
      }
      if (!this._is_toggle_buttons)
      {
        var self = this;
        this.__button_time_out = setTimeout (function ()
        {
          util.removeClassName (div, 'selected');
          self.__button_time_out = 0;
          self._selected_index = -1;
        }, View.UNSELECT_DELAY);
      }
    },
  
    /** 
     * @ignore
     * @return {number}
     */ 
    get : function ()
    {
      return this._selected_index;
    }
  },
  'type': {
    /** 
     * Getter|Setter for the widget type (for instance default, bar, ...)
     * @name vs.ui.SegmentedButton#type 
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
  },
  'isToggleButtons': {
    /** 
     * Getter|Setter to configure the buttons as toggle buttons or not.
     * By default SegmentedButton are toggle buttons
     * @name vs.ui.SegmentedButton#isToggleButton 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v) this._is_toggle_buttons = true;
      else this._is_toggle_buttons = false;
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._is_toggle_buttons;
    }
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.SegmentedButton = SegmentedButton;
