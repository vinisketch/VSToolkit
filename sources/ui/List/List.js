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
 * @public
 * @name vs.ui.AbstractListItem
 */
var AbstractListItem = function (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = AbstractListItem;
}

AbstractListItem.prototype = {

  /**
   * @protected
   * @function
   */
  _index: 0,

  /**
   * @protected
   * @function
   */
  _pressed: false,
 
  /**
   * @protected
   * @function
   */
  _visible: true,
  
 /**********************************************************************
                 General method
  *********************************************************************/
  /**
   * This method should be implemented to manage item selection
   *
   * @name vs.ui.AbstractListItem#didSelect 
   * @function
   */
  didSelect : function () {}
};
util.extendClass (AbstractListItem, View);

util.defineClassProperties (AbstractListItem, {

  'pressed': {
    /** 
     * @name vs.ui.AbstractListItem#pressed 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (!this.view) { return; }
      
      if (v)
      {
        this.addClassName ('pressed');
        this._pressed = true;
      }
      else
      {
        this.removeClassName ('pressed');
        this._pressed = false;
      }
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._pressed;
    }
  },
  
  'index': {
    /** 
     * @name vs.ui.AbstractListItem#index 
     *
     * @type {number}
     */ 
    set : function (v)
    {
      this._index = v;
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._index;
    }
  }
});

/**
 * @name vs.ui.DefaultListItem
 * @private
 */
function DefaultListItem ()
{
  this.parent = AbstractListItem;
  this.parent ();
  this.constructor = AbstractListItem;
}

DefaultListItem.prototype = {

  _title: "",
  _label: "",

 /**********************************************************************
                  In/Out properties declarations 
  *********************************************************************/

  /** 
   * @name vs.ui.DefaultListItem#title
   */ 
  set title (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._title = v;
    if (this.view)
    {
      util.setElementInnerText (this.view, this._title);
      this.view.appendChild (this._label_view);
    }
  },

  /** 
   */ 
  set label (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._label = v;
    if (this.view)
    {
      util.setElementInnerText (this._label_view, this._label);
    }
    if (this._label && !this._label_view.parentNode)
      this.view.appendChild (this._label_view);
    if (!this._label && this._label_view.parentNode)
      this.view.removeChild (this._label_view);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    if (!this.__config__) this.__config__ = {};
    this.__config__.id = this.id;

    if (!this.__config__.node)
      this.__config__.node = document.createElement ('li');
      
    AbstractListItem.prototype.initComponent.call (this);

    this._label_view = document.createElement ('span');
  }
};
util.extendClass (DefaultListItem, AbstractListItem);

/**
 * @name vs.ui.SimpleListItem
 * @private
 */
function SimpleListItem (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = SimpleListItem;
}

SimpleListItem.prototype = {

  _title: "",

 /**********************************************************************
                  In/Out properties declarations 
  *********************************************************************/
  /** 
   * @name vs.ui.SimpleListItem#title
   */ 
  set title (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._title = v;
    if (this.view)
    {
      util.setElementInnerText (this.title_view, this._title);
    }
  },

 /**********************************************************************

  *********************************************************************/
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    if (!this.__config__) this.__config__ = {};
    this.__config__.id = this.id;

    if (!this.__config__.node)
    {
      this.__config__.node = document.createElement ('div');
      this.__config__.node.className = 'simplelist_item';
      
      var div = document.createElement ('div');
      div.className = 'title';
      this.__config__.node.appendChild (div);
    }
      
    AbstractListItem.prototype.initComponent.call (this);

    this._label_view = document.createElement ('span');

    this.title_view = this.view.querySelector ('.title');
  }
};
util.extendClass (SimpleListItem, View);

/**********************************************************************
 
           Block List and Tab List section

*********************************************************************/

/**
 * @private
 */
function buildSection (list, title, index, itemsSelectable)
{
  var section = document.createElement ('li'), 
    title_view = document.createElement ('div'), 
    content = document.createElement ('ul'), 
    cells, item, obj, data = list._model;

  while (index < data.length)
  {
    item = data.item (index);
    if (util.isString (item)) { break; }
    
    item = data.item (index);
    if (list.__template_obj)
    {
      listItem = list.__template_obj.clone ();
    }
    else
    {
      listItem = new DefaultListItem ().init ();
    }
    // model update management
    if (item instanceof core.Model)
    {
      listItem.link (item);
    }
    else
    {
      listItem.configure (item)
    }
    listItem.index = index;

    if (itemsSelectable)
    {
      vs.addPointerListener (listItem.view, core.POINTER_START, list);
    }
    content.appendChild (listItem.view);
    list.__item_obs.push (listItem);
    listItem.__parent = list;
    index ++;
  }
  if (title)
  {
    
    var os_device = window.deviceConfiguration.os;
    if (os_device == DeviceConfiguration.OS_MEEGO ||
        os_device == DeviceConfiguration.OS_SYMBIAN)
    {
      title_view.appendChild (document.createElement ('div'));
      var tmp_title = document.createElement ('div');
      tmp_title.appendChild (document.createTextNode (title));
      title_view.appendChild (tmp_title);
    }
    else
    {
      util.setElementInnerText (title_view, title);
    }
    section.appendChild (title_view);
  }
  if (content.childElementCount > 0)
  {
    section.appendChild (content);
  }
  return [section, index];
};

/**
 * @private
 */
function blockListRenderData (itemsSelectable)
{
  if (!this._model) { return; }
     
  var _list_items = this._list_items, index, item, title,
    s, width, titles, i, items;
  if (!_list_items) { return; }
   
// remove all children
  this._freeListItems ();
  
  util.removeAllElementChild (_list_items);

  if (SUPPORT_3D_TRANSFORM)
    setElementTransform (_list_items, 'translate3d(0,0,0)');
  else
    setElementTransform (_list_items, 'translate(0,0)');

  this.view.removeChild (_list_items);
  
  index = 0;
  util.setElementVisibility (_list_items, false);
  
  while (index < this._model.length)
  {
    item = this._model.item (index);
    title = null;
    if (util.isString (item))
    {
      title = item; index ++;
    }

    s = buildSection (this, title, index, itemsSelectable);
    _list_items.appendChild (s[0]);
    index = s[1];
  }
  this.view.appendChild (_list_items);
  {
    _list_items.style.width = 'auto';
  }
  util.setElementVisibility (_list_items, true);
};

/**
 * @private
 */
function tabListRenderData (itemsSelectable)
{
  if (!this._model) { return; }
     
  var _list_items = this._list_items, _direct_access = this._direct_access,
    index, item, title,
    s, width, titles, i, items;
  if (!_list_items) { return; }
   
// remove all children
  this._freeListItems ();
  
  util.removeAllElementChild (_list_items);
  util.removeAllElementChild (_direct_access);

  if (SUPPORT_3D_TRANSFORM)
    util.setElementTransform (_list_items, 'translate3d(0,0,0)');
  else
    util.setElementTransform (_list_items, 'translate(0,0)');

  this.view.removeChild (_list_items);
  this.view.removeChild (_direct_access);
  
  index = 0;
  util.setElementVisibility (_list_items, false);
  var title_index = 0;
  while (index < this._model.length)
  {
    item = this._model.item (index);
    title = null;
    if (util.isString (item))
    {
      title = item; index ++;
      var elem = document.createElement ('div');
      util.setElementInnerText (elem, title [0]);
      elem._index_ = title_index++;
      _direct_access.appendChild (elem);
    }

    s = buildSection (this, title, index, itemsSelectable);
    _list_items.appendChild (s[0]);
    index = s[1];
  }
  this.view.appendChild (_list_items);
  this.view.appendChild (_direct_access);
  _list_items.style.width = 'auto';
  util.setElementVisibility (_list_items, true);
};

/**********************************************************************
        
        
*********************************************************************/

/**
 * @private
 */
function defaultListRenderData (itemsSelectable)
{
  if (!this._model) { return; }
     
  var _list_items = this._list_items, index, item, title,
    s, width, titles, i, items;
  if (!_list_items) { return; }
   
// remove all children
  this._freeListItems ();
  
  util.removeAllElementChild (_list_items);
  
  if (SUPPORT_3D_TRANSFORM)
    setElementTransform (_list_items, 'translate3d(0,0,0)');
  else
    setElementTransform (_list_items, 'translate(0,0)');

  this.view.removeChild (_list_items);
  
  index = 0;
  util.setElementVisibility (_list_items, false);
        
  while (index < this._model.length)
  {
    item = this._model.item (index);
    if (this.__template_obj)
    {
      listItem = this.__template_obj.clone ();
    }
    else
    {
      listItem = new DefaultListItem ().init ();
    }
    // model update management
    if (item instanceof core.Model)
    {
      listItem.link (item);
    }
    else
    {
      listItem.configure (item);
    }
    listItem.index = index;

    if (itemsSelectable)
    {
      vs.addPointerListener (listItem.view, core.POINTER_START, this);
    }
    _list_items.appendChild (listItem.view);
    this.__item_obs.push (listItem);
    listItem.__parent = this;
    index ++;
  }
  this.view.appendChild (_list_items);
  _list_items.style.width = 'auto';

  util.setElementVisibility (_list_items, true);
};

/**********************************************************************
        
        
*********************************************************************/

/**
 *  The vs.ui.List class
 *
 *  @extends vs.ui.AbstractList
 *  @class
 *  The vs.ui.List class draw a list of ListItem and allows the user to 
 *  select one object from it.
 *  <p>
 *  Events:
 *  <ul>
 *    <li />itemselect, fired when a item is selected.
 *          Event Data = {index, item data}
 *  </ul>
 *  <p>
 *  To reduce performance issues, you can deactivate events handling
 *  for the list, using vs.ui.List#itemsSelectable property.
 *
 * Data can be filtered. The filter he array contains the member to filters
 * and filter:
 * @ex:
 *   list.filters = 
 *      [{property:'title', value:'o', matching:vs.ui.List.FILTER_CONTAINS, strict:true];
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.List.
 * @name vs.ui.List
 *
 *  @example
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function List (config)
{
  this.parent = AbstractList;
  this.parent (config);
  this.constructor = List;

  this.__item_obs = new Array ();
}

/**
 * @const 
 * @name vs.ui.List.FILTER_EXACTS
 */
List.FILTER_EXACTS = 0;

/**
 * @const 
 * @name vs.ui.List.FILTER_CONTAINS
 */
List.FILTER_CONTAINS = 1;

/**
 * @const 
 * @name vs.ui.List.FILTER_STARTS_WITH
 */
List.FILTER_STARTS_WITH = 2;

/**
 * @const 
 * @name vs.ui.List.BLOCK_LIST
 */
List.BLOCK_LIST = 'BlockList';

/**
 * @const 
 * @name vs.ui.List.TAB_LIST
 */
List.TAB_LIST = 'TabList';

/**
 * @const 
 * @name vs.ui.List.DEFAULT_LIST
 */
List.DEFAULT_LIST = 'DefaultList';

List.prototype = {

  _type: List.DEFAULT_LIST,
  
 /**********************************************************************
                 General data for the list
  *********************************************************************/
  
  /**
   * @private
   * @type {number}
   */
  _selected_index: 0,
  
  /**
   * @private
   * @type {number}
   */
  _selected_item: 0,
  
  /**
   * @private
   * @type {Array}
   */
  _filters: null,
  
  /**
   *  @protected
   *  @type {boolean}
   */
  _has_arrow : true,
     
 /**********************************************************************
                  Data Used for managing scroll states
  *********************************************************************/

  /**
   *  @private
   */
   __item_obs : null,
  
  /**
   *  @private
   */
   __elem : null,
     
  /**
   * @private
   * @type {vs.core.Object}
   */
  __template_obj: null,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  add : function (child, extension)
  {
    this.setItemTemplate (child);
  },
  
  /**
   *  Set the template object will be used for list item
   *  <p>
   *  The object will be automatically cloned according list data.
   *  <p>
   *  The template must have the same properties than data. For instance :
   *  @example
   *    data = [{text: "title1", nb: 5}, {text: "title2", nb: 2}];
   *    template objet must have properties named "text" and "nb"
   *
   * @name vs.ui.List#setItemTemplate 
   * @function
   * @param {vs.ui.View | Class} obj the template object;
   */
  setItemTemplate : function (obj)
  {
    if (!obj) return;
    
    if (util.isFunction (obj))
      this.__template_obj = new obj () .init ();
    else if (obj.constructor) 
      this.__template_obj = obj;
  },

  /**
   *  Set the template object will be used for list item
   *  <p>
   *  The object will be automatically cloned according list data.
   *  <p>
   *  The template must have the same properties than data. For instance :
   *  @example
   *    data = [{text: "title1", nb: 5}, {text: "title2", nb: 2}];
   *    template objet must have properties named "text" and "nb"
   *
   * @name vs.ui.List#setItemTemplateName 
   * @function
   * @param {string} name the component name
   * @return {vs.ui.View} the template object or null if an error occured
   */
  setItemTemplateName : function (name)
  {
    return this.createAndAddComponent (name, {}, 'item_children');
  },

  /**
   * @protected
   * @function
   */
  remove : function (child)
  {},
       
 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    this._freeListItems ();
    AbstractList.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    AbstractList.prototype.initComponent.call (this);
    
    this.addClassName (this._type);  
    this.refresh ();
  },
  
  /**
   * Return the list of items in the vs.ui.List
   *
   * @name vs.ui.List#getItems 
   * @function
   * @return {Array} the items
   */
  getItems : function ()
  {
    if (this.__item_obs)
    {
      return this.__item_obs.slice ();
    }
    return [];
  },
  
  
  /**
   * @protected
   * @function
   */
  applyFilters : function ()
  {
    if (!this._filters || !this.__item_obs) { return; }
    
    var i, obj, item;
    
    for (i = 0; i < this.__item_obs.length; i++)
    {
      obj = this.__item_obs [i];
      item = this._model.item (obj.index);
      this.appyFiltersOnObj (obj, item);
    }
  },
  
  /**
   * @protected
   * @function
   */
  appyFiltersOnObj : function  (obj, item)
  {
    if (!this._filters || !obj || !item) { return; }
    
    var i, filter, toHide, vSrc, vTrg, l = this._filters.length;
    
    if (l === 0)
    {
      obj.show ();
      return;
    }
    for (i = 0; i < l; i++)
    {
      filter = this._filters [i];
      if (!filter.property || !filter.value)
      {
        obj.show ();
        continue;
      }
      
      toHide = false;
      vSrc = item[filter.property];
      vTrg = filter.value;
      
      if (filter.strict === false)
      {
        vSrc = vSrc.toLowerCase ();
        vTrg = vTrg.toLowerCase ();
      }
      
      switch (filter.matching)
      {
        case undefined:
        case null:
        case List.FILTER_EXACTS:
          if (vSrc !== vTrg)
          { toHide = true; }
        break;
        
        case List.FILTER_STARTS_WITH:
          if (vSrc.indexOf (vTrg) !== 0)
          { toHide = true; }
        break;
        
        case List.FILTER_CONTAINS:
          if (vSrc.indexOf (vTrg) === -1)
          { toHide = true; }
        break;
      }

      if (toHide)
      { obj.hide (); }
      else
      { obj.show (); }
    }
  },
  
  /**
   * @protected
   * @function
   */
  _freeListItems : function ()
  {
    var i, obj;
    for (i = 0 ; i < this.__item_obs.length; i ++)
    {
      obj = this.__item_obs [i];
      obj.__parent = undefined;
      util.free (obj);
    }
    
    this.__item_obs = [];
  },
  
  /**
   * @protected
   * @function
   */
  _renderData : defaultListRenderData,
  
  /**
   * @protected
   * @function
   */
  _modelChanged : function (event)
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
  _touchItemFeedback : function (item)
  {
    item._comp_.pressed = true;
  },
  
  /**
   * @private
   * @function
   */
  _untouchItemFeedback : function (item)
  {
    item._comp_.pressed = false;
  },
      
  /**
   * @protected
   * @function
   */
  _updateSelectItem : function (item)
  {
    this._selected_index = item._comp_.index;
    this._selected_item = this._model.item (this._selected_index);
    if (item._comp_ && item._comp_.didSelect) item._comp_.didSelect ();
    
    this.propertyChange ();
                
    this.propagate ('itemselect',
    {
      index: this._selected_index,
      item: this._selected_item
    });
  },
  
 /**********************************************************************
      General function for the direct access bar within Tab list
  *********************************************************************/

  init_directAccessBar : function ()
  {
    this._direct_access = document.createElement ('div');
    this._direct_access.className = 'direct_access';
    this.view.appendChild (this._direct_access);
    
    this._acces_index = 0;
    
    var self = this;
    var bar_dim, bar_pos;
    
    var getIndex = function (y) {
      if (!bar_dim || !bar_pos) return 0;
      var dy = y - bar_pos.y;
      if (dy < 0) dy = 0;
      else if (dy > bar_dim.height) dy = bar_dim.height - 1;
      
      var nb_elem = self._direct_access.childElementCount;
      return Math.floor (dy * nb_elem / bar_dim.height);
    };
    
    var accessBarStart = function (e)
    {
      e.stopPropagation ();
      e.preventDefault ();
      
      util.setElementTransform (self._list_items, '');
      self.__max_scroll = self.size [1] - self._list_items.offsetHeight;
      
      vs.addPointerListener (document, core.POINTER_MOVE, accessBarMove, false);
      vs.addPointerListener (document, core.POINTER_END, accessBarEnd, false);
      
      var _acces_index = e.srcElement._index_;
      if (!util.isNumber (_acces_index)) return;
      
      if (self._acces_index === _acces_index) return;
      self._acces_index = _acces_index;
      var newPos = -self.getTitlePosition (_acces_index);
      
      if (newPos < self.__max_scroll) newPos = self.__max_scroll;

      self.__scroll_start = newPos;

      if (SUPPORT_3D_TRANSFORM)
        util.setElementTransform
          (self._list_items, 'translate3d(0,' + newPos + 'px,0)');
      else
        util.setElementTransform
          (self._list_items, 'translate(0,' + newPos + 'px)');

      // animate the scroll
      if (self._scrollbar) self._scrollbar.setPosition (newPos);
      
      bar_dim = util.getElementDimensions (self._direct_access);
      bar_dim.height -= 10;
      bar_pos = util.getElementAbsolutePosition (self._direct_access);
      bar_pos.y += 5;

      if (self._startScrolling) self._startScrolling ();
    };
    
    var accessBarMove = function (e)
    {
      e.stopPropagation ();
      e.preventDefault ();
      
      var _acces_index = getIndex (e.pageY);
      if (!util.isNumber (_acces_index)) return;
      
      if (self._acces_index === _acces_index) return;
      self._acces_index = _acces_index;
      var newPos = -self.getTitlePosition (_acces_index);

      if (newPos < self.__max_scroll) newPos = self.__max_scroll;

      self.__scroll_start = newPos;

      if (SUPPORT_3D_TRANSFORM)
        util.setElementTransform
          (self._list_items, 'translate3d(0,' + newPos + 'px,0)');
      else
        util.setElementTransform
          (self._list_items, 'translate(0,' + newPos + 'px)');

      // animate the scroll
      if (self._scrollbar) self._scrollbar.setPosition (newPos);

      if (self._isScrolling) self._isScrolling ();
    };
    
    var accessBarEnd = function (e)
    {
      vs.removePointerListener (document, core.POINTER_MOVE, accessBarMove);
      vs.removePointerListener (document, core.POINTER_END, accessBarEnd);

      if (self._endScrolling) self._endScrolling ();
    };

    vs.addPointerListener
      (this._direct_access, core.POINTER_START, accessBarStart, false);
  },
  
  getTitlePosition : function (index)
  {
    var titleItems = this.view.querySelectorAll ('ul > li > div');
    var item = titleItems.item (index);
    if (!item) return;
    return item.parentElement.offsetTop;
  }
};
util.extendClass (List, AbstractList);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (List, {
  'itemsSelectable': {
    /** 
     * Allow deactivate the list item selection.
     * <p>
     * This is use full to set this property to false, if you do not listen
     * the event 'itemselect'. It will prevent unnecessary inter event 
     * management
     * which uses processing time.
     * By default its set to true
     * @name vs.ui.List#itemsSelectable 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v && this._items_selectable) { return; }
      if (!v && !this._items_selectable) { return; }
      
      if (v)
      {
        this._items_selectable = true;
        for (i = 0; i < this.__item_obs.length; i++)
        {
          obj = this.__item_obs [i];
          vs.addPointerListener (obj.view, core.POINTER_START, this, true);
        }
      }
      else
      {
        this._items_selectable = false;
        for (i = 0; i < this.__item_obs.length; i++)
        {
          obj = this.__item_obs [i];
          vs.removePointerListener (obj.view, core.POINTER_START, this, true);
        }
      }
    }
  },
  
  'selectedIndex': {
    /** 
     * Getter for selectedIndex.
     * @name vs.ui.List#selectedIndex 
     * @type {number}
     */ 
    get : function ()
    {
      return this._selected_index;
    }
  },
  
  
  'selectedItem': {
    /** 
     * Getter for selectedItem.
     * @name vs.ui.List#selectedItem 
     * @type {Object}
     */ 
    get : function ()
    {
      return this._selected_item;
    }
  },
  
  'type': {
    /** 
     * This properties allow to change the style of the List
     * Possible values ar :
     * <ul>
     *   <li/> vs.ui.List.BLOCK_LIST
     *   <li/> vs.ui.List.TAB_LIST
     *   <li/> vs.ui.List.DEFAULT_LIST
     * </ul>
     * @name vs.ui.List#type 
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (v !== List.BLOCK_LIST &&
          v !== List.TAB_LIST && 
          v !== List.DEFAULT_LIST) { return; }
      
      this.removeClassName (this._type);
      this._type = v;
      this.addClassName (this._type);
      
      if (this._type === List.BLOCK_LIST)
      {
        this._renderData = blockListRenderData;
        if (this._direct_access)
        {
          this.view.removeChild (this._direct_access);
          delete (this._direct_access);
        }
      }
      if (this._type === List.TAB_LIST)
      {
        this._renderData = tabListRenderData
        if (!this._direct_access) this.init_directAccessBar ();
      }
      if (this._type === List.DEFAULT_LIST)
      {
        this._renderData = defaultListRenderData
        if (this._direct_access)
        {
          this.view.removeChild (this._direct_access);
          delete (this._direct_access);
        }
      }
      
      this._renderData (this._items_selectable);
    }
  },
  
  'hasArrow': {
    /** 
     * Show an arrow for each list item or not
     * @name vs.ui.List#hasArrow 
     *
     * @type boolean
     */ 
    set : function (v)
    {
      if (v)
      {
        this._has_arrow = true;
        this.addClassName ('arrow');
      }
      else
      {
        this._has_arrow = false;
        this.removeClassName ('arrow');
      }
    }
  },
  
  'filters': {
    /** 
     * Getter|Setter for filters. Allow to filter item data.
     * @ex:
     *   list.filters = [
     *     {
     *       property:'title',
     *       value:'o',
     *       matching:vs.ui.List.FILTER_CONTAINS,
     *       strict:true
     *     }];
     *
     * @name vs.ui.List#filters 
     *
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v)) { return; }
      this._filters = v;
      
      // TODO   on peut mieux faire : au lieu de faire
      // un init skin qui vire tout et reconstruit tout, on pourrait
      // ne gerer que la difference
      this.applyFilters ();
      this.refresh ();
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._filters;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.List = List;
/** @private */
ui.AbstractListItem = AbstractListItem;
/** @private */
ui.DefaultListItem = DefaultListItem;
/** @private */
ui.SimpleListItem = SimpleListItem;
