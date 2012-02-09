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
 *  @extends vs.ui.View
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
  this.parent = View;
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
    View.prototype.destructor.call (this);
    
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
    View.prototype.initComponent.call (this);
    
    this._model = new vs.core.Array ();
    this._model.init ();
    this._model_allocated = true;
    this._model.bindChange (null, this, this._modelChanged);

    this._list_items = this._sub_view = this._holes.item_children;
    if (SUPPORT_3D_TRANSFORM)
      setElementTransform (this._list_items, 'translate3d(0,0,0)');
    else
      setElementTransform (this._list_items, 'translate(0,0)');

    this._renderData (this._items_selectable);
    this.refresh ();
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
    this._clearScroll ();
  },
    
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
      newPos, time, pos, index;
    
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
      if (core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }
      e.stopPropagation ();
      e.preventDefault();

      this.__touch_start = core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY;
      if (this._scroll)
      {
        this.__max_scroll = this.size [1] - this._list_items.offsetHeight;

        if (this.__max_scroll < 0 && this._scrollbar)
        {
          this._scrollbar.init (this.size [1], this._list_items.offsetHeight);
        }
        this._list_items.style.webkitTransition = '';
      }

      this.__scroll_start_time = e.timeStamp;
  
      document.addEventListener (core.POINTER_MOVE, this, false);
      document.addEventListener (core.POINTER_END, this, false);
      
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
      e.stopPropagation ();
      e.preventDefault ();

      pageY = core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY;
      this.__delta = pageY - this.__touch_start;  

      newPos = this.__scroll_start + this.__delta;
    
      if (this._scroll)
      {
        if (this.__max_scroll < 0 && this._scrollbar)
        {
          this._scrollbar.show ();
        }

        if (SUPPORT_3D_TRANSFORM)
          setElementTransform
            (this._list_items, 'translate3d(0,' + newPos + 'px,0)');
        else
          setElementTransform
            (this._list_items, 'translate(0,' + newPos + 'px)');

        if (this.__max_scroll < 0 && this._scrollbar)
        {
          this._scrollbar.setPosition (newPos);
        }
      }
            
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
      e.stopPropagation ();
      e.preventDefault();

      // Stop tracking when the last finger is removed from this element
      document.removeEventListener (core.POINTER_MOVE, this);
      document.removeEventListener (core.POINTER_END, this);
      
     if (this.__delta) { this.__scroll_start += this.__delta; }
      
      if (this._scroll)
      {
        if (this._scrollbar) this._scrollbar.hide ();
        if (this.__max_scroll >= 0)
        {
          this._list_items.style.webkitTransition = '0.2s ease-out';
          if (SUPPORT_3D_TRANSFORM)
            setElementTransform (this._list_items, 'translate3d(0,0,0)');
          else
            setElementTransform (this._list_items, 'translate(0,0)');
          this.__scroll_start = 0;
        }
        else if (this.__scroll_start > 0)
        {
          this._list_items.style.webkitTransition = '0.2s ease-out';
          if (SUPPORT_3D_TRANSFORM)
            setElementTransform (this._list_items, 'translate3d(0,0,0)');
          else
            setElementTransform (this._list_items, 'translate(0,0)');
          this.__scroll_start = 0;
        }
        else if (this.__scroll_start < this.__max_scroll)
        {
          this._list_items.style.webkitTransition = '0.2s ease-out';
          
          if (SUPPORT_3D_TRANSFORM)
            setElementTransform (this._list_items, 
              'translate3d(0,' + this.__max_scroll + 'px,0)');
          else
            setElementTransform (this._list_items, 
              'translate(0,' + this.__max_scroll + 'px)');
          
          this.__scroll_start = this.__max_scroll;
        }
        else
        {
          time = e.timeStamp - this.__scroll_start_time;
          if (time < 250)
          {
            ///  this._momentum * 2;
            if (this.__delta)
            { pos = this.__scroll_start + this.__delta * 4; }
            else
            { pos = this.__scroll_start; }
            
            if ( pos > 0) // min position
            {
              pos = 0;
            }
            else if ( pos < this.__max_scroll) // maximum position
            {
              pos = this.__max_scroll;
            }
            
            this.__scroll_start = pos;
            
            // animate the list
            this._list_items.style.webkitTransition = '0.3s ease-out';
            
            if (SUPPORT_3D_TRANSFORM)
              setElementTransform
                (this._list_items, 'translate3d(0,' + pos + 'px,0)');
            else
              setElementTransform
                (this._list_items, 'translate(0,' + pos + 'px)');
            
            // animate the scroll
            if (this._scrollbar) this._scrollbar.setPosition (pos);
          }
        }
      }
      
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
  
  /**
   * @private
   * @function
   */
  _clearScroll : function ()
  {
    this.__scroll_start = 0;
    
    if (this._list_items)
    {
      if (SUPPORT_3D_TRANSFORM)
        setElementTransform (this._list_items, 'translate3d(0,0,0)');
      else
        setElementTransform (this._list_items, 'translate(0,0)');
    }
    // animate the scroll
    if (this._scrollbar)
    { this._scrollbar.setPosition (0); }
  },
  
  /**
   * @protected
   * @function
   */
  _scrollToElement: function (el, delta)
  {
    if (!el) { return; }
    var pos;
    
    var pos_el = util.getElementAbsolutePosition (el);
    var pos_list = util.getElementAbsolutePosition (this.view);
    this.__max_scroll = this.size [1] - this._list_items.offsetHeight;
    
    if (!delta) { delta = 0; }
    
    var scroll = this.__scroll_start + (pos_list.y - pos_el.y) + delta
    scroll = scroll > 0 ? 0 : scroll < this.__max_scroll ? this.__max_scroll : scroll;

    // animate the list
    this._list_items.style.webkitTransition = '0.3s ease-out';
    
    this.__scroll_start = scroll;
    
    if (SUPPORT_3D_TRANSFORM)
      setElementTransform
        (this._list_items, 'translate3d(0,' + scroll + 'px,0)');
    else
      setElementTransform
        (this._list_items, 'translate(0,' + scroll + 'px)');    
    
    // animate the scroll
    if (this._scrollbar) this._scrollbar.setPosition (scroll);
  }  
};
util.extendClass (AbstractList, View);

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
        var os_device = window.deviceConfiguration.os;
        if (!this._scrollbar && os_device !== DeviceConfiguration.OS_WP7)
        {
          this._scrollbar = new Scrollbar ('vertical', this.view, true, true);
        }
        this.view.addEventListener (core.POINTER_START, this, false);
      }
      else
      {
        this._scroll = 0;
        if (this._scrollbar)
        {
          this._scrollbar.remove ();
          delete (this._scrollbar);
        }
        this.view.removeEventListener (core.POINTER_START, this);
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
      else return;

      this._modelChanged ();
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
