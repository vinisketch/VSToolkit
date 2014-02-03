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
 *  A vs.ui.CheckBox.
 *  @class
 *  The vs.ui.CheckBox class creates a vertical checkbox list which allow to 
 *  select one or more options from a set of alternatives.
 *  <p>
 *  If only one option is to be selected at a time you should use vs.ui.RadioButton
 *  instead
 *  <p>
 *  Events:
 *  <ul>
 *    <li />change, fired when a item is selected.
 *          Event Data = index
 *  <ul>
 *  <p>
 *
 *  @author David Thevenin
 * @name vs.ui.CheckBox
 *
 *  @extends vs.ui.AbstractList
 *  @constructor
 *   Creates a new vs.ui.CheckBox.
 *
 *  @example
 *  var config = {}
 *  config.data = ['item1, 'item2', 'item3'];
 *  config.id = vs.core.createId ();
 *
 *  var object = vs.ui.CheckBox (config);
 *  object.init ();
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function CheckBox (config)
{
  this.__inputs = [];
  this.__labels = [];

  this.parent = AbstractList;
  this.parent (config);
  this.constructor = CheckBox;
  
  this._selected_indexes = new Array ();
}

CheckBox.prototype = {

  /**
   * @private
   * @type Array.<int>
   */
  _selected_indexes: null,

  /**
   * @private
   * @type {Array.<HTMLImputElement>}
   */
  __inputs: null,

  /**
   * @private
   * @type {Array.<HTMLLabelElement>}
   */
  __labels: null,

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * This method select on unselect a item
   *
   * @name vs.ui.CheckBox#selectItem
   * @function
   * @param {int} index the item index to select/unselect
   */
  selectItem : function (index)
  {
    if (!util.isNumber (index)) { return; }
    if (index < 0 || index >= this.__inputs.length) { return; }
    
    var item = this.__inputs [index];
    if (!item) { return; }
    
    for (var i = 0; i < this._selected_indexes.length; i++)
    {
      if (this._selected_indexes [i] === index)
      {
        this._selected_indexes.remove (i);
        item.checked = false;
        return;
      }
    }
    
    // the item is not selected. Selected it.
    this._selected_indexes.push (index);
    item.checked = true;
  },
    
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
    util.removeAllElementChild (this._list_items);
  
    while (this.__inputs.length)
    {
      input = this.__inputs [0];
      
      vs.removePointerListener (input, core.POINTER_START, this);
      input.removeEventListener ('click', this);
      this.__inputs.remove (0);
      this.__labels.remove (0);
    }
  },
  
  /**
   * @protected
   * @function
   */
  _renderData : function ()
  {
    if (!this._model) { return; }
    
    var i, l, div, title, button, item, label, input;
    if (!this._list_items)
    {
      console.error ('vs.ui.RadioButton uncorrectly initialized.');
      return;
    }
   
    this._selected_indexes = [];
    this.clean_gui ();
    var os_device = window.deviceConfiguration.os;
    
    for (i = 0, l = this._model.length; i < l; i++)
    {
      item = this._model.item (i);
      input = document.createElement ('input');
      input.type = 'checkbox';
      input.name = this._id;
      input.id = this._id + "_l" + i;
      input.value = i;

      this._list_items.appendChild (input);
      this.__inputs [i] = input;
      
      vs.addPointerListener (input, core.POINTER_START, this);
      input.addEventListener ('click', this);

      label = document.createElement ('label');
      label.value = i;
      label.setAttribute ("for", this._id + "_l" + i);
      vs.addPointerListener (label, core.POINTER_START, this);
      label.addEventListener ('click', this);
      util.setElementInnerText (label, item);
      this._list_items.appendChild (label);
      this.__labels [i] = label;
    }
    
    // select items
    this.selectedItem = this._selected_indexes;
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
    
    if (index >= 0 || index < this.__inputs.length) 
    {
      this.selectItem (index);
      this.outPropertyChange ();
      
      items = new Array ();
      for (i = 0, l = this._selected_indexes.length; i < l; i ++)
      {
        items.push (this._model.item (this._selected_indexes [i]));
      }
      
      this.propagate ('change',
      {
        indexes: this._selected_indexes.slice (),
        items: items
      });
    }
  }
};
util.extendClass (CheckBox, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (CheckBox, "selectedIndexes", {
  /** 
   * Getter|Setter for items. Allow to select or get one or more items
   * @name vs.ui.CheckBox#selectedIndexes
   *
   * @type {Array.<int>}
   */ 
  set : function (v)
  {
    if (!util.isArray (v)) { return; }
    
    var index, len, i, item;
    
    this._selected_indexes = [];
    for (i = 0; i < v.length; i++)
    {
      index = v [i];
      if (!util.isNumber (index)) { continue; }
      
      this._selected_indexes.push (index);
    }
    
    for (i = 0; i < this.__inputs.length; i ++)
    {
      var item = this.__inputs [i];
      if (item)
      {
        item.checked = false;
      }
    }
    
    len = this._selected_indexes.length;
    for (i = 0; i < len; i++)
    {
      var item = this.__inputs [this._selected_indexes[i]];
      if (item)
      {
        item.checked = true;
      }
    }
  },
  
  /**
   * @ignore
   * @type {Array.<int>}
   */
  get : function ()
  {
    return this._selected_indexes.slice ();
  }
});
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.CheckBox = CheckBox;
