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
 *  The vs.ui.SplitView class
 *
 *  @extends vs.ui.View
 *  @class
 *  vs.ui.SplitView presents two views. According the screen orientation
 *  the two views are renders vertically (landscape mode) or the views
 *  are splited to optimize screen size. In Portrait mode, the first view
 *  his hidden from the splitview and draws on a PopOver View.
 *
 *  <p>
 *  Delegates:
 *  <ul>
 *    <li/>willHideView : function (vs.ui.View the view, vs.ui.PopOver popOver)
 *    <li/>willShowView : function (vs.ui.View the view, vs.ui.PopOver popOver)
 *  </ul>
 *  <p>
 *  <p>
 *  @example
 *  var splitView = new vs.ui.SplitView ();
 *  splitView.init ();
 *
 *  splitView.delegate = this;
 *  splitView.createAndAddComponent ('ManuPanel');
 *  splitView.createAndAddComponent ('MainPanel');
 *
 *  ...
 *
 *  willShowView : function (view, popOver)
 *  {
 *    this._popOver = null;
 *    ...
 *  },
 *  
 *  willHideView : function (view, popOver)
 *  {
 *    this._popOver = popOver;
 *    ...
 *  }
 *  
 *  @author David Thevenin
 * @name vs.ui.SplitView
 *
 *  @constructor
 *   Creates a new vs.ui.SplitView.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
var SplitView = vs.core.createClass ({

  parent: vs.ui.View,

  properties: {
    "delegate": {
      /** 
       * Set the delegate.
       * It should implements following methods
       *  <ul>
       *    <li/>viewWillStartZooming : function (vs.ui.ScrollView the view)
       *    <li/>viewDidEndZooming : function (vs.ui.ScrollView the view, number scale)
       *  </ul>
       * @name vs.ui.SplitView#delegate 
       * @type {Object}
       */ 
      set : function (v)
      {
        this._delegate = v;
      }
    },
  
    "mode": {
      /** 
       * Set the split view mode (MOBILE, TABLET)
       * @name vs.ui.SplitView#mode 
       * @type {String}
       */ 
      set : function (v)
      {
        if (v !== SplitView.TABLET_MODE && v !== SplitView.MOBILE_MODE)
          return;
      
        this.removeClassName (this._mode);
        this._mode = v;
        this.addClassName (this._mode);
      }
    },
  
    "secondPanelPosition": {
      /** 
       * Set the navigation panel position (LEFT, RIGHT, TOP, BOTTOM)
       * @name vs.ui.SplitView#secondPanelPosition 
       * @type {String}
       */ 
      set : function (v)
      {
        if (v !== SplitView.LEFT && v !== SplitView.RIGHT &&
            v !== SplitView.TOP && v !== SplitView.BOTTOM)
          return;
      
        this.removeClassName (this._second_panel_position);
        this._second_panel_position = v;
        this.addClassName (this._second_panel_position);
      }
    },
  
    "orientation": {
      /** 
       * Set/get the split view mode (MOBILE, TABLET)
       * @name vs.ui.SplitView#mode 
       * @type {String}
       */ 
      set : function (v)
      {
        if (v !== SplitView.VERTICAL && v !== SplitView.HORIZONTAL)
          return;
      
        this.removeClassName (this._orientation);
        this._orientation = v;
        this.addClassName (this._orientation);
        if (v === SplitView.VERTICAL) this._set_orientation (0);
        else this._set_orientation (90);
      },
      
      /**
      */
      get : function (v)
      {
        return this._orientation;
      }
    },
  },

  /*****************************************************************
   *                Private members
   ****************************************************************/
   
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

   /**
   * @protected
   * @type {String}
   */
  _mode: '',

   /**
   * @protected
   * @type {String}
   */
  _second_panel_position: '',

   /**
   * @protected
   * @type {String}
   */
  _orientation: '',

   /**
   * @private
   * @type {Array}
   */
  _split_views: null,
  
   /**
   * @private
   * @type {number}
   */
  _fisrt_view_width: 320,

   /**
   * @private
   * @type {number}
   */
  _pop_over_border_width: 8,
  
   /**
   * @private
   * @type {vs.ui.PopOver}
   */
  _pop_over: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  constructor: function (config)
  {
    this._super (config);

    this._left_views = new Array ();
    this._pop_over = new PopOver ();
  },

  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    this._super ();
    this._pop_over.init ();

    this._pop_over.hide ();
    document.body.appendChild (this._pop_over.view);

    if (this._mode) this.mode = this._mode;
    else this.mode = SplitView.TABLET_MODE;
    
    if (this._orientation) this.orientation = this._orientation;
    else this.orientation = SplitView.HORIZONTAL;
    
    if (this._second_panel_position) this.secondPanelPosition = this._second_panel_position;
    else this.secondPanelPosition = SplitView.LEFT;
  },

  /**
   * Add the child view to this component.
   * <p>
   * Only two views can be added.
   *
   * @name vs.ui.SplitView#add 
   * @function
   * @param {vs.ui.EventSource} child The component to be added.
   */
  add : function (child, hole)
  {
    if (hole === 'second_panel') this._left_views.push (child);
    else
    {
      this._super (child, 'main_panel');
      return;
    }
    
    if (this._orientation === SplitView.HORIZONTAL)
    {
      this._super (child, 'second_panel');
    }
    else
    {
      this._pop_over.add (child);
    }
  },
    
  /**
   * Remove all children components from this component and free them.
   * 
   * @name vs.ui.SplitView#removeAllChildren 
   * @function
   * @example
   * myObject.removeAllChildren ();
   */
  removeAllChildren : function ()
  {
    var key, a, child;
  
    for (key in this._children)
    {
      a = this._children [key];
      if (!a) { continue; }
      
      if (a instanceof Array)
      {
        while (a.length)
        {
          child = a [0];
          this.remove (child);
          util.free (child);
        }
      }
      else
      {
        this.remove (a);
        util.free (a);
      }
      delete (this._children [key]);
    }
    this._children = {};
  },

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    this._super ();
    if (this._pop_over.visible) this._pop_over.refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  orientationWillChange : function (orientation)
  {
    if (orientation === 90 || orientation === -90)
      this.orientation = SplitView.HORIZONTAL;
    else
      this.orientation = SplitView.VERICAL; 
  },
  
  /**
   * @protected
   * @function
   */
  _set_orientation : function (orientation)
  {
    var size = this.size, child, orientation;
    
    child = this._left_views [0];
    if (child)
    {
      if (orientation === 90 || orientation === -90)
      {
        this._pop_over.hide ();
        if (this._pop_over.isChild (child))
        {
          this._pop_over.remove (child);
        }
        
        if (!this.isChild (child))
        {
          View.prototype.add.call (this, child, 'second_panel');
        }
        child.show (child.refresh);
        
        if (this._delegate && this._delegate.willShowView)
        {
          this._delegate.willShowView (child, this._pop_over);
        }
      }
      else
      {
        if (this.isChild (child))
        {
          View.prototype.remove.call (this, child);
        }
        if (!this._pop_over.isChild (child))
        {
          this._pop_over.add (child);
        }
        child.show ();
        this._pop_over.size =
          [this._fisrt_view_width + 2 * this._pop_over_border_width, 500];
        
        if (this._delegate && this._delegate.willShowView)
        {
          this._delegate.willHideView (child, this._pop_over);
        }
      }
    }
  },
  
  /**
   * @protected
   * @function
   */
  orientationDidChange : function (orientation)
  {
    this.refresh ();
  },
  
  /**
   * @function
   */
  showPopOver : function (pos, direction)
  {
    if (this._mode !== SplitView.TABLET_MODE ||
        this._orientation !== SplitView.VERTICAL) return;

    this._pop_over.show (pos, direction);
    this._pop_over.refresh ();
  },
  
  /**
   * @function
   */
  hidePopOver : function ()
  {
    this._pop_over.hide ();
  },
  
  /**
   * @function
   */
  showMainView : function ()
  {
    if (this._mode !== SplitView.MOBILE_MODE) return;

    this.addClassName ('main_view_visible');
  },
  
  /**
   * @function
   */
  hideMainView : function ()
  {
    if (this._mode !== SplitView.MOBILE_MODE) return;

    this.removeClassName ('main_view_visible');
  }
});

/********************************************************************
                  Define class properties
********************************************************************/

SplitView.TABLET_MODE = 'tablet';
SplitView.MOBILE_MODE = 'mobile';
SplitView.VERTICAL = 'vertical';
SplitView.HORIZONTAL = 'horizontal';

SplitView.RIGHT = 'right';
SplitView.LEFT = 'left';
SplitView.BOTTOM = 'bottom';
SplitView.TOP = 'top';

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.SplitView = SplitView;
