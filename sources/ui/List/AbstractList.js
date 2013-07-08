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
 *  The vs.ui.AbstractList class
 *
 *  @extends vs.ui.ScrollView
 *  @class
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.AbstractList.
 * @name vs.ui.AbstractList
 *
 *  @example
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function AbstractList (config)
{
  this.parent = ScrollView;
  this.parent (config);
  this.constructor = AbstractList;
}

AbstractList.prototype = {

 /**********************************************************************
                 General data for the list
  *********************************************************************/

   /**
   * @protected
   * @type {boolean}
   */
  _items_selectable : true,
  
   /**
   * @protected
   * @type {boolean}
   */
  _scroll: 0,
  
  /**
   * @private
   * @type {vs.core.Array}
   */
  _model: null,
       
 /**********************************************************************
                  Data Used for managing scroll states
  *********************************************************************/
  
  /**
   *  @private
   */
   __elem : null,
     
  /**
   * @private
   * @type {int}
   */
  __scroll_start: 0,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  add : function () { },
  
  /**
   * @protected
   * @function
   */
  remove : function (child) {},
      
 /**********************************************************************

  *********************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    ScrollView.prototype.destructor.call (this);
    
    this._model.unbindChange (null, this, this._modelChanged);
    if (this._model_allocated) util.free (this._model);
    this._model_allocated = false;
  },
  
  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    ScrollView.prototype.initComponent.call (this);
    
    this._model = new vs.core.Array ();
    this._model.init ();
    this._model_allocated = true;
    this._model.bindChange (null, this, this._modelChanged);
    
    // manage list template without x-hag-hole="item_children"
    if (!this._holes.item_children) {
      this._holes.item_children = this.view.querySelector ('ul');
    }
    
    this._list_items = this._sub_view = this._holes.item_children;

    this.refresh ();
  },
    
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    if (this.__iscroll__) this.__iscroll__.refresh ();
    ScrollView.prototype.refresh.call (this);
  },

  /**
   * @protected
   * @function
   */
  _modelChanged : function ()
  {
    // TODO   on peut mieux faire : au lieu de faire
    // un init skin qui vire tout et reconstruit tout, on pourrait
    // ne gerer que la difference
    this._renderData (this._items_selectable);
    this.refresh ();
  },
    
  /**
   * @protected
   * @function
   */
  propertiesDidChange: function () {this._modelChanged ()},
  
  /**
   * @protected
   * @function
   */
  _renderData : function () {},
    
  /**
   * @protected
   * @function
   */
  _touchItemFeedback : function (item) {},
      
  /**
   * @protected
   * @function
   */
  _untouchItemFeedback : function (item) {},

  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item) {},

  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    var elem = e.currentTarget, self = this, pageY, pageX,
      time, pos, index;
    
    if (e.type === 'click')
    {
      // Cancel default behavior
      e.stopPropagation ();
      e.preventDefault();
      return;
    }
    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }

      this.__touch_start = e.pointerList[0].pageY;
  
      vs.addPointerListener (document, core.POINTER_MOVE, this, false);
      vs.addPointerListener (document, core.POINTER_END, this, false);
      
      if (!this._items_selectable)
      { return false; }
      
      if (elem === this.view)
      {
        this.__elem = null;
        return;
      }
      this.__elem = elem;

      if (this.__list_time_out)
      {
        clearTimeout (this.__list_time_out);
      }
      if (this.__elem_to_unselect)
      {
        this._untouchItemFeedback (this.__elem_to_unselect);
        this.__elem_to_unselect = null;
      }

      this.__list_time_out = setTimeout (function ()
      {
        self._touchItemFeedback (elem);
        self.__list_time_out = 0;
      }, View.SELECT_DELAY);
    }
    else if (e.type === core.POINTER_MOVE)
    {
      pageY = e.pointerList[0].pageY;
      this.__delta = pageY - this.__touch_start;  
            
      // this is a move, not a selection => deactivate the selected element
      // if needs
      if (this.__elem && (Math.abs (this.__delta) > View.MOVE_THRESHOLD))
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);
          this.__list_time_out = 0;
        }
        this._untouchItemFeedback (this.__elem);
        this.__elem = null;
      }            
    }
    else if (e.type === core.POINTER_END)
    {
      // Stop tracking when the last finger is removed from this element
      vs.removePointerListener (document, core.POINTER_MOVE, this);
      vs.removePointerListener (document, core.POINTER_END, this);
      
      if (this.__delta) { this.__scroll_start += this.__delta; }
      
      // a item is selected. propagate the change
      if (this.__elem)
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);
          this._touchItemFeedback (this.__elem);
        }

        this.__elem_to_unselect = this.__elem;
        
        this.__list_time_out = setTimeout (function ()
        {
          self._untouchItemFeedback (self.__elem_to_unselect);
          self.__elem_to_unselect = null;
          self.__list_time_out = 0;
        }, View.UNSELECT_DELAY);

        this._updateSelectItem (this.__elem);
      }

      this.__delta = 0;
      this.__elem = null;
    }
    return false;
  },

//   /**
//    * @protected
//    * @function
//    */
//   _scrollToElement: function (el, delta)
//   {
//     if (!el) { return; }
//     var pos;
//     
//     var pos_el = util.getElementAbsolutePosition (el);
//     var pos_list = util.getElementAbsolutePosition (this.view);
//     this.__max_scroll = this.size [1] - this._list_items.offsetHeight;
//     
//     if (!delta) { delta = 0; }
//     
//     var scroll = this.__scroll_start + (pos_list.y - pos_el.y) + delta
//     scroll = scroll > 0 ? 0 : scroll < this.__max_scroll ? this.__max_scroll : scroll;
// 
//     // animate the list
//     this._list_items.style.webkitTransition = '0.3s ease-out';
//     
//     this.__scroll_start = scroll;
//     
//     if (SUPPORT_3D_TRANSFORM)
//       setElementTransform
//         (this._list_items, 'translate3d(0,' + scroll + 'px,0)');
//     else
//       setElementTransform
//         (this._list_items, 'translate(0,' + scroll + 'px)');    
//     
//     // animate the scroll
//     if (this._scrollbar) this._scrollbar.setPosition (scroll);
//   }  
};
util.extendClass (AbstractList, ScrollView);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (AbstractList, {

  'scroll': {
    /** 
     * Allow to scroll the list items.
     * By default it not allowed
     * @name vs.ui.CheckBox#scroll 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      {
        this._scroll = ScrollView.VERTICAL_SCROLL;
        this._setup_iscroll ();
      }
      else
      {
        if (this.__iscroll__)
        {
          this.__iscroll__.destroy ();
          this.__iscroll__ = undefined;
        }
        this._scroll = false;
      }
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._scroll?true:false;
    }
  },
  
  'model': {
    /** 
     * Getter|Setter for data. Allow to get or change the vertical list
     * @name vs.ui.AbstractList#model 
     *
     * @type vs.core.Array
     */ 
    set : function (v)
    {
      if (!v) return;
      
      if (util.isArray (v))
      {
        this._model.removeAll ();
        this._model.add.apply (this._model, v);
      }
      else if (v.toJSON && v.propertyChange)
      {
        if (this._model_allocated)
        {
          this._model.unbindChange (null, this, this._modelChanged);
          util.free (this._model);
        }
        this._model_allocated = false;
        this._model = v;
        this._model.bindChange (null, this, this._modelChanged);
      }
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._model;
    }
  },
  
  'data': {
    /** 
     * Getter|Setter for data. Allow to get or change the vertical list
     * @name vs.ui.AbstractList#data 
     *
     * @deprecated
     * @see vs.ui.AbstractList#model 
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v)) return;
      
      if (!this._model_allocated)
      {
        this._model = new vs.core.Array ();
        this._model.init ();
        this._model_allocated = true;
        this._model.bindChange (null, this, this._modelChanged);
      }
      else
      {
        this._model.removeAll ();
      }
      this._model.add.apply (this._model, v);

      this._modelChanged ();
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._model._data.slice ();
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.AbstractList = AbstractList;
