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
 *  The vs.ext.ui.Accordion class
 *
 *  @extends vs.ui.View
 *  @class
 *  The Accordion class is a subclass of View that allows you to show
 *  a set of panels which can be collapsed or expanded.
 *  <p/>
 *  Events:
 *  <ul>
 *    <li /> panel_select: Fired after a panel is expanded. Data = index
 *           of the panel (zero-indexed number)
 *  </ul>
 *  <p>
 *  @example
 *  var config = {};
 *  var config.id = vs.core.createId ();
 *
 *  var accordion = new vs.ext.ui.Accordion ();
 *  accordion.init ();
 *  accordion.size = [300, 500];
 *  
 *  accordion.add (obj1);
 *  accordion.add (tabList3);
 *  accordion.add (vv);
 *
 *  @author David Thevenin
 *
 * @name vs.ext.ui.Accordion 
 *  @constructor
 *   Creates a new vs.ext.ui.Accordion.
 *
 * @param  {Object} config The configuration structure [mandatory]
*/
var Accordion = function (config)
{
  this.parent = ui.View;
  this.parent (config);
  this.constructor = Accordion;
  
  this.__ab_a_items = [];
}

/** 
 * Widgets keep there size and position
 * @see vs.ext.ui.Accordion#stretch 
 * @name vs.ext.ui.Accordion.STRETCH_NONE 
 * @const
 */
Accordion.STRETCH_NONE = 0;

/** 
 * Widgets size fit the panel view size
 * @see vs.ext.ui.Accordion#stretch 
 * @name vs.ext.ui.Accordion.STRETCH_FILL 
 * @const
 */
Accordion.STRETCH_FILL = 1;


Accordion.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/

  /**
   * @protected
   */
  _stretch: Accordion.STRETCH_NONE,
  
  /**
   * @private
   */
  __ab_a_items: undefined,
  
  /**
   * @private
   */
  __ab_a_current_index: undefined,
    
  /**
   * @private
   */
  __ab_a_head_height: 33,
    
  /*****************************************************************
   *                 
   ****************************************************************/
  
  /**
   *  Add the child component to the accordion and set the panel title.
   *  <p>
   *  Call push is similar to call add followed by setPanelTitle.
   *  <p>
   *
   * @name vs.ext.ui.Accordion#push 
   * @function
   * @param {vs.ui.View} child The component to be added.
   * @param {String} title the new panel title
   */
  push : function (child, title)
  {
    if (!child) { return; }
    this.add (child);
    var index = this._getIndexForChild (child)
    this.setPanelTitle (index, title);
  },
  
  /**
   *  Add the specified child component to this component.
   *  <p>
   *  The add is a lazy add! The child's view can be already in
   *  the HTML DOM. In that case, the add methode do not modify the DOM.
   *  <p>
   *
   * @name vs.ext.ui.Accordion#add
   * @function
   * @param  {vs.ui.View} child The component to be added.
   */
  add : function (child)
  {
    if (!child) { return; }
    var view, index, result;
    
    if (!child.id) { child.id = vs.core.createId (); }
    
    index = this.__ab_a_items.length;
    
    result = this._createView (child, 'Section ' + (index + 1), index);
    this.view.appendChild (result.dt);
    ui.View.prototype.add.call (this, child, 'children', result.dd);
    
    this.__ab_a_items.push (result);
    this._updateSizePanel ();
  },
  
  /**
   *  Remove the specified child component from this component.
   * 
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ext.ui.Accordion#remove 
   * @function
   * @param  {vs.core.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    var index = this._getIndexForChild (child), panel;
    if (index === -1)
    { return; }
    
    ui.View.prototype.remove.call (this, child);
    panel = this.__ab_a_items [index];
    panel.dd.removeChild (child.view);
    this.view.removeChild (panel.dt);
    panel.dt.removeEventListener (core.POINTER_START, this);
    delete (panel.dt);
    delete (panel.dd);
    delete (panel);
    
    this.__ab_a_items.remove (index);

    if (index === this.__ab_a_current_index)
    // Show the first panel
    {
      this.__ab_a_current_index = null;
      this.expandPanel (0);
    }
    else
    // update widget size (and children) to fit with the new available space
    { this._updateSizePanel (); }
  },
  
  /**
   * @private
   */
  _getIndexForChild : function (child)
  {
    if (!child) { return -1; }
    
    var index, panel;
    
    for (index = 0; index < this.__ab_a_items.length; index++)
    {
      panel = this.__ab_a_items [index];
      if (!panel || !panel.dd)
      { continue; }
      if (panel.dd.__child === child)
      { return index; }
    }
    return -1;
  },
  
  /**
   * @private
   */
  _createView : function (child, title, index)
  {
    var panel = {}, mode;
    
    panel.dt = document.createElement ('dt');
    util.setElementInnerText (panel.dt, title);
    panel.title = title;

    panel.dd = document.createElement ('dd');      
    if (this._stretch === Accordion.STRETCH_FILL)
    {
      child.position = [0, 0];
    }
    panel.dd.appendChild (child.view);
    
    mode = (index)?'collapsed':'expanded'

    panel.dd.setAttribute ("class", mode);
    panel.dt.setAttribute ("class", mode);
    panel.dd.__child = child
    panel.child = child;

    if (mode === 'collapsed')
    {
      panel.dd.style.width = '100%';
      panel.dd.style.height = '0px';
    }
    else
    {
      panel.dd.style.width = '100%';
      panel.dd.style.height = child._size [1] + 'px';
      this.__ab_a_current_index = index;
    }
        
    if (this._stretch === Accordion.STRETCH_FILL)
    {
      child.size = [this._size[0] - 2, this._size[1]];
    }
    panel.dt.__dd = panel.dd;
    panel.dt.__index = index;
    panel.dt.addEventListener (core.POINTER_START, this);
    return panel;
  },
  
  /**
   *  Expand a part of the accordion.
   *  <p>
   *  The index can be zero-indexed number to match the position or the title of 
   *  the panel you want to open.
   *  <p>
   *  @example
   *  var accordion = new vs.ext.ui.Accordion (conf);
   *  ....
   *  accordion.expandPanel (2);
   *  accordion.expandPanel ('Section 2');
   *
   * @name vs.ext.ui.Accordion#expandPanel 
   * @function
   * @param  {number | String} index position or title of the panel to open
   */
  expandPanel: function (index)
  {
    var panel, i;
    
    if (util.isNumber (index) && index >= 0 && 
        index < this.__ab_a_items.length)
    {
      if (index === this.__ab_a_current_index)
      {
        return;
      }
      
      panel = this.__ab_a_items [this.__ab_a_current_index];
      if (panel)
      {
        util.removeClassName (panel.dt, 'expanded');
        util.addClassName (panel.dt, 'collapsed');
        util.removeClassName (panel.dd, 'expanded');
        util.addClassName (panel.dd, 'collapsed');
        panel.dd.style.height = '0px';
      }
  
      panel = this.__ab_a_items [index];
      util.removeClassName (panel.dt, 'collapsed');
      util.addClassName (panel.dt, 'expanded');
      util.removeClassName (panel.dd, 'collapsed');
      util.addClassName (panel.dd, 'expanded');
  
      this.__ab_a_current_index = index;
      this._updateSizePanel ();
      this.propagate ('panel_select', index);
      return;
    }
    if (util.isString (index))
    {
      for (i = 0; i < this.__ab_a_items.length; i++)
      {
        panel = this.__ab_a_items [i];
        if (panel.title === index)
        {
          this.expandPanel (i);
          return;
        }
      }
    }
  },
  
  /**
   *  Set a title for a give panel
   *  <p>
   *  The index can be zero-indexed number to match the position or the title of 
   *  the panel you want to open.
   *  <p>
   *  @example
   *  var accordion = new vs.ext.ui.Accordion (conf);
   *  ....
   *  accordion.setPanelTitle (2, 'info 2');
   *  accordion.setPanelTitle ('Section 1', 'info 1');
   *
   * @name vs.ext.ui.Accordion#setPanelTitle 
   * @function
   * @param  {number | String} index position or title of the panel to open
   * @param  {String} title the new panel title
   */
  setPanelTitle: function (index, title)
  {
    var panel, i;
    
    if (util.isNumber (index) && index >= 0 && 
        index < this.__ab_a_items.length)
    {
      panel = this.__ab_a_items [index];
      panel.title = title;
      util.setElementInnerText (panel.dt, title);
      
      return;
    }
    if (util.isString (index))
    {
      for (i = 0; i < this.__ab_a_items.length; i++)
      {
        panel = this.__ab_a_items [i];
        if (panel.title === index)
        {
          this.setPanelTitle (i, title);
          return;
        }
      }
    }
  },
  
  /********************************************************************
                    GUI Utilities
  ********************************************************************/

  /**
   * @ignore
   */
  show: function ()
  {
    vs.ui.View.prototype.show.call (this);
    
    this._updateSizePanel ();
  },
  
  /**
   * @ignore
   */
  refresh: function ()
  {
    vs.ui.View.prototype.refresh.call (this);
    
    this._updateSizePanel ();
  },
  
  /**
   * @private
   */
  _updateSize: function ()
  {
    vs.ui.View.prototype._updateSize.call (this);
    
    this._updateSizePanel ();
  },
  
  /**
   * @private
   */
  _updateSizePanel: function ()
  {
    var height, panel, i;
    panel = this.__ab_a_items [this.__ab_a_current_index];
    if (panel)
    {
      height = this._size [1];
      this.__ab_a_head_height = panel.dt.offsetHeight;
      height -= this.__ab_a_items.length * this.__ab_a_head_height + 2;
      panel.dd.style.height = height + 'px';
      if (this._stretch === Accordion.STRETCH_FILL)
      {
        panel.child.size = [this._size[0] - 2, height];
      }
    }
  },
  
  /*****************************************************************
   *               Events management
   ****************************************************************/

  /**
   * @private
   */
  handleEvent : function (e)
  {
    var elem = e.target, self = this, pageY, pageX, delta;
    
    if (elem.nodeType !== 1)
    {
      elem = elem.parentElement;
    }
    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }
      
      e.stopPropagation ();
      e.preventDefault ();
      
      if (util.hasClassName (elem, 'expanded'))
      { return false; }

      document.addEventListener (core.POINTER_MOVE, this, false);
      document.addEventListener (core.POINTER_END, this, false);
      
      this.__touch_start_x =
        core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY;
      this.__touch_start_y =
        core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY;

      this.__elem = elem;

      if (this.__elem_to_unselect)
      {
        util.removeClassName (this.__elem_to_unselect, 'selected');
        this.__elem_to_unselect = null;
      }
      this.__list_time_out = setTimeout (function ()
      {
        util.addClassName (self.__elem, 'selected');
        self.__list_time_out = 0;
      }, 0); //ui.View.SELECT_DELAY);
    }
    else if (e.type === core.POINTER_MOVE)
    {
      e.stopPropagation ();
      e.preventDefault ();

      pageX = core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX;
      pageY = core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageY : e.pageY;
      delta = 
        Math.abs (pageY - this.__touch_start_y) + 
        Math.abs (pageX - this.__touch_start_x);  
                
      // this is a move, not a selection => deactivate the selected element
      // if needs
      if (this.__elem && (delta > ui.View.MOVE_THRESHOLD * 2))
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);
          this.__list_time_out = 0;
        }
        else
        {
          util.removeClassName (this.__elem, 'selected');
        }
        this.__elem = null;
      }            
    }
    else if (e.type === core.POINTER_END)
    {
      e.stopPropagation ();
      e.preventDefault ();

      // Stop tracking when the last finger is removed from this element
      document.removeEventListener (core.POINTER_MOVE, this);
      document.removeEventListener (core.POINTER_END, this);
                  
      // a item is selected. propagate the change
      if (this.__elem)
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);

          util.addClassName (self.__elem, 'selected');
        }

        this.__elem_to_unselect = this.__elem;
        this.__list_time_out = setTimeout (function ()
        {
          util.removeClassName (self.__elem_to_unselect, 'selected');
          self.__elem_to_unselect = null;
          self.__list_time_out = 0;
        }, ui.View.UNSELECT_DELAY);
        
        if (util.isNumber (elem.__index))
        {
          this.expandPanel (elem.__index);
        }
      }

      this.__elem = null;
    }
          
    return false;
  }
}
util.extendClass (Accordion, vs.ui.View);

util.defineClassProperty (Accordion, 'stretch',
{
  /**
   * Configure widgets to fit the view or to keep its original size.
   * <p>The property can take four values : 
   * <ul>
   *   <li/>vs.ext.ui.Accordion.STRETCH_NONE;
   *   <li/>vs.ext.ui.Accordion.STRETCH_FILL;
   * </ul>
   * @name vs.ext.ui.Accordion#stretch 
   * @type {number}
   */
  set : function (v)
  {
    if (!util.isNumber (v)) { return; }
    if (v !== Accordion.STRETCH_FILL &&
        v !== Accordion.STRETCH_NONE)
    { return; }
    
    this._stretch = v;
    
    if (this._stretch === Accordion.STRETCH_FILL)
    {
      util.addClassName (this.view, 'fill');
    }
    else
    {
      util.removeClassName (this.view, 'fill');
    }
    this._updateSizePanel ();
  },

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * Get the image stretch mode (vs.ext.ui.Accordion.STRETCH_FILL or 
   * vs.ext.ui.Accordion.STRETCH_NONE)
   * @return {number}
   */
  get : function ()
  {
    return this._stretch;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ext_ui.Accordion = Accordion;

