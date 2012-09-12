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
 * A vs.ui.RadioButton.
 *  @class
 *  The vs.ui.RadioButton class creates a vertical radio button list which allow
 *  to select one - and just one - option from a set of alternatives.
 *  <p>
 *  If more options are to be allowed at the same time you should use 
 *  vs.ui.CheckBox instead
 *  <p>
 *  Events:
 *  <ul>
 *    <li />change, fired when a item is selected.
 *          Event Data = {index, item}
 *  <ul>
 *  <p>
 *
 *  @author David Thevenin
 *
 *  @extends vs.ui.AbstractList
 *  @constructor
 *   Creates a new vs.ui.RadioButton.
 *
 * @name vs.ui.RadioButton
 *  @example
 *  var config = {}
 *  config.data = ['item1, 'item2', 'item3'];
 *  config.id = vs.core.createId ();
 *
 *  var object = vs.ui.RadioButton (config);
 *  object.init ();
 */
function RadioButton (config)
{
  this._items = new Array ();

  this.parent = AbstractList;
  this.parent (config);
  this.constructor = RadioButton;
}

RadioButton.prototype = {

  /**
   * @private
   * @type {int}
   */
  _selected_index: -1,

  /**
   * @private
   * @type {Array.<HTMLInputElement>}
   */
  _items: null,
  
  /*****************************************************************
   *
   ****************************************************************/
      
  /**
   * @protected
   * @function
   */
  clean_gui : function ()
  {
    var input;
    
    this.__scroll_start = 0;
  
    // removes all items;
    this._list_items.innerHTML = '';
  
    while (this._items.length)
    {
      input = this._items [0];
      
      input.removeEventListener (core.POINTER_START, this);
      input.removeEventListener ('click', this);
      this._items.remove (0);
    }
  },

  /**
   * @protected
   * @function
   */
  _renderData : function ()
  {
    if (!this._model) { return; }
    
    var i, input, item, l;
    
    if (!this._list_items)
    {
      console.error ('vs.ui.RadioButton uncorrectly initialized.');
      return;
    }

    this.clean_gui ();
    this._selected_index = -1;
    var os_device = window.deviceConfiguration.os;
    
    for (i = 0, l = this._model.length; i < l; i++)
    {
      item = this._model.item (i);
      input = document.createElement ('input');
      input.type = 'radio';
      input.name = this._id;
      input.value = i;
      input.id = this._id + "_l" + i;
      
      this._list_items.appendChild (input);
      this._items [i] = input;
      input.addEventListener (core.POINTER_START, this);
      input.addEventListener ('click', this);
      
      label = document.createElement ('label');
      label.value = i;
      label.for = this._id + "_l" + i;
      label.addEventListener (core.POINTER_START, this);
      label.addEventListener ('click', this);
      util.setElementInnerText (label, item);
      this._list_items.appendChild (label);
    }
    this.refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item)
  {
    util.addClassName (item, 'pressed');
  },
  
  /**
   * @private
   * @function
   */
  _untouchItemFeedback : function (item)
  {
    util.removeClassName (item, 'pressed');
  },
      
  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item)
  {
    var index = parseInt (item.value);
    if (item._comp_ && item._comp_.didSelect) item._comp_.didSelect ();
    
    if (index >= 0 || index < this._items.length) 
    {
      this.selectedIndex = index;
      this.propertyChange ();
      this.propagate ('change',
      {
        index: this._selected_index,
        item: this._model.item (this._selected_index)
      });
    }
  }
};
util.extendClass (RadioButton, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (RadioButton, "selectedIndex", {
  /** 
   * Set the vs.ui.RadioButton selectedIndex
   *
   * @name vs.ui.RadioButton#selectedIndex 
   * @type {int}
   */ 
  set : function (v)
  {
    if (!util.isNumber (v))
    {
      v = parseInt (v);
    }
    
    if (isNaN (v)) { return; }
    if (v < 0 || v > this._items.length - 1) { return; }

    if (this._items [v])
    {
      var item = this._items [v];
      if (item)
      {
        item.checked = true;
      }
      this._selected_index = v;
    }
  },

  /** 
   * @ignore
   * Get the vs.ui.RadioButton selectedIndex
   * @type {int}
   */ 
  get : function ()
  {
    return this._selected_index;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.RadioButton = RadioButton;
