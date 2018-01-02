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
import { addPointerListener, removePointerListener } from 'vs_gesture';

import View from '../View/View';
import html_template from './RadioButton.html';
import AbstractList from '../List/AbstractList';

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
 *  config.id = vs_core.createId ();
 *
 *  var object = vs.ui.RadioButton (config);
 *  object.init ();
 */
function RadioButton (config)
{
  this.__inputs = [];
  this.__labels = [];

  this.parent = AbstractList;
  this.parent (config);
  this.constructor = RadioButton;
}

RadioButton.prototype = {

  html_template: html_template,

  /**
   * @private
   * @type {int}
   */
  _selected_index: -1,

  /**
   * @private
   * @type {Array.<HTMLInputElement>}
   */
  __inputs: null,
  
  /**
   * @private
   * @type {Array.<HTMLabelElement>}
   */
  __labels: null,
  
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
    vs_utils.removeAllElementChild (this._list_items);
  
    while (this.__inputs.length)
    {
      input = this.__inputs [0];
      
      removePointerListener (input, vs_core.POINTER_START, this);
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
    
    var i, input, item, l, label;
    
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
      this.__inputs [i] = input;
      addPointerListener (input, vs_core.POINTER_START, this);
      input.addEventListener ('click', this);
      
      label = document.createElement ('label');
      label.value = i;
      label.setAttribute ("for", this._id + "_l" + i);
      addPointerListener (label, vs_core.POINTER_START, this);
      label.addEventListener ('click', this);
      vs_utils.setElementInnerText (label, item);
      this._list_items.appendChild (label);
      this.__labels [i] = label;
    }
    this.refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item)
  {
    var
      index = item.value,
      label = this.__inputs [index],
      input = this.__labels [index];
    
    vs_utils.addClassName (label, 'pressed');
    vs_utils.addClassName (input, 'pressed');
  },
  
  /**
   * @private
   * @function
   */
  _untouchItemFeedback : function (item)
  {
    var
      index = item.value,
      label = this.__inputs [index],
      input = this.__labels [index];
    
    vs_utils.removeClassName (label, 'pressed');
    vs_utils.removeClassName (input, 'pressed');
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
      this.selectedIndex = index;
      this.outPropertyChange ();
      this.propagate ('change',
      {
        index: this._selected_index,
        item: this._model.item (this._selected_index)
      });
    }
  }
};
vs_utils.extendClass (RadioButton, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperty (RadioButton, "selectedIndex", {
  /** 
   * Set the vs.ui.RadioButton selectedIndex
   *
   * @name vs.ui.RadioButton#selectedIndex 
   * @type {int}
   */ 
  set : function (v)
  {
    if (!vs_utils.isNumber (v))
    {
      v = parseInt (v);
    }
    
    if (isNaN (v)) { return; }
    if (v < 0 || v > this.__inputs.length - 1) { return; }

    if (this.__inputs [v])
    {
      var item = this.__inputs [v];
      if (item)
      {
        item.checked = true;
      }
      this._selected_index = v;
    }
  },

  /** 
   * Get the vs.ui.RadioButton selectedIndex
   * @ignore
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
export default RadioButton;
