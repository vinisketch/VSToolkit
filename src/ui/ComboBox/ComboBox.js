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
 *  The vs.ui.ComboBox class
 *
 *  @extends vs.ui.View
 *  @class
 *  An implementation of a combo box. The user can select a value from the
 *  drop-down list.
 *
 *  <p>
 *  @example
 *  var config = {}
 *  config.data = ['item1, 'item2', 'item3'];
 *  config.id = vs.core.createId ();
 *
 *  var object = vs.ui.ComboBox (config);
 *  object.init ();
 *
 *  @author David Thevenin
 * @name vs.ui.ComboBox
 *
 *  @constructor
 *   Creates a new vs.ui.ComboBox.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ComboBox (config)
{
  this._data = new Array ();
  this._items = {};

  this.parent = View;
  this.parent (config);
  this.constructor = ComboBox;
}

/** @private */
ComboBox.NORMAL_MODE = 1;
ComboBox.NATIVE_MODE = 2;

ComboBox.prototype = {
    
  /**
   * @private
   * @type {Array.<string>}
   */
  _mode: ComboBox.NORMAL_MODE,

  /**
   * @private
   * @type {Array.<string>}
   */
  _data: null,

  /**
   * @private
   * @type {string}
   */
  _selected_item: null,

  /**
   * @private
   * @type {Object.<string, HTMLOptionElement>}
   */
  _items: null,

  /*****************************************************************
   *      Init
   ****************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    if (this._mode === ComboBox.NATIVE_MODE)
    {
      vs.removePointerListener (this.view, core.POINTER_START, this);
      vs.removePointerListener (this.view, core.POINTER_END, this);
    }
    else
    {
      this.nodeUnbind (this._select, 'change');
      this.nodeUnbind (this._select, 'blur');
    }

    View.prototype.destructor.call (this);
  },

  /**
   * @private
   * @function
   */
  update_gui_combo_box : function ()
  {
    if (!util.isArray (this._data)) { return; }
    
    if (this._mode === ComboBox.NORMAL_MODE)
    {
      util.removeAllElementChild (this._select);
        
      this._items = {};
  
      var i, option;
      
      for (i = 0; i < this._data.length; i++)
      {
        option = document.createElement ('option');
  
        option.appendChild (document.createTextNode (this._data [i]));
        this._items [this._data [i]] = option;
        
        this._select.appendChild (option);
      }
  
      if (this._selected_item)
      {
        this._select.value = this._selected_item;
      }
      else
      {
        this._select.selectedIndex = 0;
      }
    }
    else
    {
      util.setElementInnerText (this._select, this._selected_item);
    }
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    // PG Native GUI
    if (window.cordova && (
          window.deviceConfiguration.os === DeviceConfiguration.OS_IOS ||
          window.deviceConfiguration.os === DeviceConfiguration.OS_ANDROID)
        && window.plugins.combo_picker)
    {
      this._mode = ComboBox.NATIVE_MODE;

      this._select = document.createElement ('div');
      this.view.appendChild (this._select);

      vs.addPointerListener (this.view, core.POINTER_START, this);
      vs.addPointerListener (this.view, core.POINTER_END, this);
    }
    // Normal GUI
    else
    {
      this._mode = ComboBox.NORMAL_MODE;

      this._select = document.createElement ('select');
      this.view.appendChild (this._select);

      this.nodeBind (this._select, 'change');
      this.nodeBind (this._select, 'blur');
    }

    this.update_gui_combo_box ();
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    e.preventDefault ();
    e.stopPropagation ();
    if (e.type === core.POINTER_START)
    {
      this.setFocus ();
      window.plugins.combo_picker.show (this, this._data, this._selected_item);
    }
  },
  
  /**
   * Set the focus to your input
   * @name vs.ui.ComboBox#setFocus 
   * @function
   */
  setFocus : function ()
  {
    if (this._mode === ComboBox.NATIVE_MODE)
    {
      this.addClassName ('focus');
    }
    else
    {
      this._select.focus ();
    }
  },
  
  /**
   * Remove the focus to your input
   * @name vs.ui.ComboBox#setBlur 
   * @function
   */
  setBlur : function ()
  {
    if (this._mode === ComboBox.NATIVE_MODE)
    {
      this.removeClassName ('focus');
    }
    else
    {
      this._select.blur ();
    }
  },
  
  /**
   * @protected
   * @function
   */
  notify : function (event)
  {
    if (event.type === 'change')
    {
      this._selected_item = this._select.value;
      this.outPropertyChange ();
      this.propagate ('change', this._selected_item);
    }
    else if (event.type === 'blur')
    {
      window.scrollTo (0, 0);
    }
  }
};
util.extendClass (ComboBox, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ComboBox, {
  'selectedItem': {
    /** 
     * Getter|Setter for an item. Allow to select or get one item
     * @name vs.ui.ComboBox#selectedItem 
     *
     * @type {String}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      this._selected_item = v;
      
      if (this._mode === ComboBox.NORMAL_MODE)
      {
        if (this._selected_item)
        {
          this._select.value = this._selected_item;
        }
        else
        {
          this._select.selectedIndex = 0;
        }
      }
      else
      {
        util.setElementInnerText (this._select, this._selected_item);
      }
    },
  
    /** 
     * @ignore
     * @type {String}
     */ 
    get : function ()
    {
      return this._selected_item;
    }
  },
  'data': {
    /** 
     * Getter|Setter for data. Allow to get or change the combo box items
     * @name vs.ui.ComboBox#data 
     *
     * @type {Array.<string>}
     */ 
    set : function (v)
    {
      if (!util.isArray (v)) { return; }
  
      this._data = v.slice ();
      
      this.update_gui_combo_box ();
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ComboBox = ComboBox;
