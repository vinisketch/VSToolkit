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
import html_template from './NavigationBar.html';

/**
 *  The vs.ui.NavigationBar class implements a view for controlling navigation
 *  on content views.
 *
 *  @extends vs.ui.View
 *  @class
 *  This bar is displayed at the top of the parent view,
 *  Typically it includes navigation buttons, or a title.
 *  But it can contains any custom widgets.
 *  <p>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.NavigationBar.
 * @name vs.ui.NavigationBar
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function NavigationBar (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = NavigationBar;
  
  this._states = {};
}

/**
 * Blue style tab bar (defaut)
 * @name vs.ui.NavigationBar.DEFAULT_STYLE
 * @const
 */
NavigationBar.DEFAULT_STYLE = 'blue_style';

/**
 * Black translucide style tab bar
 * @name vs.ui.NavigationBar.BLACK_TRANSLUCIDE_STYLE
 * @const
 */
NavigationBar.BLACK_TRANSLUCIDE_STYLE = 'black_translucide_style';

/**
 * Black style tab bar
 * @name vs.ui.NavigationBar.BLACK_STYLE
 * @const
 */
NavigationBar.BLACK_STYLE = 'black_style';

NavigationBar.prototype = {

  html_template: html_template,
  
/********************************************************************
                  protected members declarations
********************************************************************/

  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _hide_animation: null,
  
  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _show_animation: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _style: NavigationBar.DEFAULT_STYLE,

  /**
   * States configuration.
   * For a given state name, give the list of visible widgets in the navigation
   * bar.
   *
   * @protected
   * @type {Object}
   */
  _states : null,

  /**
   * The current state name.
   * @protected
   * @type {string}
   */
  _current_state : null,
  
/********************************************************************
                general initialisation declarations
********************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },
    
  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    View.prototype.initComponent.call (this);

    var os_device = window.deviceConfiguration.os;
    if (os_device == vs_core.DeviceConfiguration.OS_SYMBIAN)
    {
      this._hide_animation = new vs.fx.Animation (['translateY', '-50px']);
    }
    else
    {
      this._hide_animation = new vs.fx.Animation (['translateY', '-44px']);
    }
    this._show_animation = new vs.fx.Animation (['translateY', '0px']);

    this.style = this._style;
  },
  
/********************************************************************
                    States definitions
********************************************************************/
  
  /**
   *  Set a list of visible widgets per a state name.
   *
   *  Widgets view will be automatically added to the navigation bar view
   *  if its need.
   *
   * @name vs.ui.NavigationBar#setStateItems
   * @function
   *
   * @param {String} state The state name  
   * @param {Array} items The list of widget (pointers on widget)  
   */
  setStateItems : function (state, items)
  {
    var i;
    
    if (!state || !vs_utils.isString (state)) { return; }
    if (!items || !vs_utils.isArray (items)) { return; }
    
    this._states [state] = items.slice ();
    
    if (this._current_state === state)
    {
      // hide all children except those have to be shown
      for (key in this.__children)
      {
        children = this.__children [key];
        if (vs_utils.isArray (children))
        {
          for (i = 0; i < children.length; i++)
          {
            obj = children [i];
            if (items.findItem (obj) >= 0) { continue; }
            
            if (obj && obj.hide) { obj.hide (); }
          }
        }
        else
        { if (children.hide) { children.hide (); } }
      }
  
      for (i = 0; i < items.length; i++)
      {
        obj = items [i];
        if (!this.isChild (obj))
        {
          this.add (obj, 'children');
        }
        obj.show ();
      }
    }
    else
    {
      for (i = 0; i < items.length; i++)
      {
        obj = items [i];
        if (!this.isChild (obj))
        {
          this.add (obj, 'children');
        }
      }
    }
  },
  
  /**
   *  Return the list of visible widgets for a state name.
   *  Return undefined if the state is undefined.
   *
   * @name vs.ui.NavigationBar#getStateItems
   * @function
   *
   * @param {String} state The state name  
   * @return {Array} items The list of widget (pointers on widget)  
   */
  getStateItems : function (state, items)
  {
    if (!state || !vs_utils.isString (state)) { return undefined; }
    
    if (this._states [state])
    {
      return this._states [state].slice ();
    }
    else
    {
      return undefined;
    }
  },
  
  /**
   *  Apply a state to the Navigatio Bar.
   *  Only widgets associated to the state will be showed.
   *
   * @name vs.ui.NavigationBar#changeState
   * @function
   *
   * @param {String} state The state name  
   * @param {Object} conf Optional configuration parameters 
   *     Structure have to follow : {comp_id: {prop: value}}
   */
  changeState : function (state, conf)
  {
    if (!state) { return; }
    var i = 0, length, children, objs_to_show, obj, key, data;
    
    this._current_state = state;
    objs_to_show = this._states [this._current_state];
    if (!objs_to_show)
    { objs_to_show = []; }
    length = objs_to_show.length;
    
    // hide all children except those have to be shown
    for (key in this.__children)
    {
      children = this.__children [key];
      if (vs_utils.isArray (children))
      {
        for (i = 0; i < children.length; i++)
        {
          obj = children [i];
          if (objs_to_show.findItem (obj) >= 0) { continue; }
          
          if (obj && obj.hide) { obj.hide (); }
        }
      }
      else
      { if (children.hide) { children.hide (); } }
    }
    
    // show all children associate to this state and configure them if needs
    for (i = 0; i < length; i++)
    {
      obj = objs_to_show [i];
      if (conf && conf [obj.id])
      {
        data = conf [obj.id];
        for (key in data)
        {
          if (key)
          {
            obj [key] = data [key];
          }
        }
      }
      if (obj) { obj.show (); }
    }
  },

/********************************************************************
                  events management
********************************************************************/

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var self = event.currentTarget;
    
    switch (event.type)
    {
      case vs_core.POINTER_START:
        vs_utils.addClassName (self, 'active');
        addPointerListener (event.currentTarget, vs_core.POINTER_END, this, true);
        addPointerListener (event.currentTarget, vs_core.POINTER_MOVE, this, true);
      break;

      case vs_core.POINTER_END:
        removePointerListener (event.currentTarget, vs_core.POINTER_END, this);
        removePointerListener (event.currentTarget, vs_core.POINTER_MOVE, this);        
        
        vs_utils.removeClassName (self, 'active');
        this.propagate ('buttonselect', event.currentTarget.spec);
      break;

      case vs_core.POINTER_MOVE:
        event.preventDefault ();
        vs_utils.removeClassName (self, 'active');
        removePointerListener (event.currentTarget, vs_core.POINTER_END, this);
        removePointerListener (event.currentTarget, vs_core.POINTER_MOVE, this);
      break;
    }
  },
  
/********************************************************************
                  add / remove buttons
********************************************************************/

  /**
   *  Remove the specified child component from this component.
   * 
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ui.NavigationBar#remove
   * @function
   *
   * @param {vs.ui.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    var state, items;
    
    View.prototype.remove.call (this, child);
    
    for (state in this._states)
    {
      items = this._states [state];
      if (items.indexOf (child) !== -1)
      {
        items.remove (child);
      }
    }
  }
};
vs_utils.extendClass (NavigationBar, View);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (NavigationBar, {
  'style': {
    /** 
     * Getter|Setter for the tab bar style
     * @name vs.ui.NavigationBar#style 
     * @type String
     */ 
    set : function (v)
    {
      if (!vs_utils.isString (v)) { return; }
      if (this._style)
      {
        this.removeClassName (this._style);
      }
      this._style = v;
      this.addClassName (this._style);
    },
  
    /** 
     * @ignore
     * @return {String}
     */ 
    get : function ()
    {
      return this._style;
    }
  },
  
  'position': {
    /**
     * @ignore
     * @private
     */
    set : function (v) {},
    
    /**
     * @ignore
     * @private
     */
    get : function ()
    {
      return [this.view.offsetLeft, this.view.offsetTop];
    }
  },
  
  'size': {
    /**
     * @ignore
     * @private
     */
    set : function (v) {},
  
    /**
     * @ignore
     * @private
     */
    get : function ()
    {
      return [this.view.offsetWidth, this.view.offsetHeight];
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default NavigationBar;
