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
 *  splitView.createAndAddComponent ('LeftPanel');
 *  splitView.createAndAddComponent ('RightPanel');
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
function SplitView (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = SplitView;
}

SplitView.prototype = {

  /*****************************************************************
   *                Private members
   ****************************************************************/
   
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

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
  destructor : function ()
  {
    View.prototype.destructor.call (this);
  },
    
  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    this._split_views = new Array ();
    this._pop_over = new PopOver ();
 
    View.prototype.initComponent.call (this);
 
    this._pop_over.init ();
    View.prototype.add.call (this, this._pop_over);

    this._pop_over.hide ();
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
  add : function (child)
  {
    var size, orientation;
    if (this._split_views.length === 2)
    {
      console.error ('vs.ui.SplitView is limited to two views');
      return;
    }
    
    orientation = Application.getOrientation ();
    size = this.size;
    if (this._split_views.length === 0)
    {
      child.position = [0,0];
      child.size = [this._fisrt_view_width, size[1]];
      if (orientation === 90 || orientation === -90)
      {
        View.prototype.add.call (this, child);
        this._pop_over.hide ();
       
        if (this._delegate && this._delegate.willShowView)
        {
          this._delegate.willShowView (child, this._pop_over);
        }
      }
      else
      {
        this._pop_over.add (child);
        this._pop_over.size =
          [this._fisrt_view_width + 2 * this._pop_over_border_width, 500];
        
        if (this._delegate && this._delegate.willHideView)
        {
          this._delegate.willHideView (child, this._pop_over);
        }
      }
    }
    else if (this._split_views.length === 1)
    {
      if (orientation === 90 || orientation === -90)
      {
        child.position = [this._fisrt_view_width,0];
        child.size = [size[0] - this._fisrt_view_width, size[1]];
      }
      else
      {
        child.position = [0,0];
        child.size = size;
      }
      
      View.prototype.add.call (this, child);
    }
    
    this._split_views.push (child);
  },
  
  /**
   * Remove the specified child component from this component.
   * 
   * @example
   * myObject.remove (myButton);
   *
   * @name vs.ui.SplitView#remove 
   * @function
   * @param {vs.ui.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    View.prototype.remove.call (this, child);
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
  
    for (key in this.children)
    {
      a = this.children [key];
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
      delete (this.children [key]);
    }
    this.children = {};
  },

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    var size = this.size, child, orientation;
    
    orientation = Application.getOrientation ();
    child = this._split_views [0];
    if (child)
    {
      if (orientation === 90 || orientation === -90)
      {
        child.position = [0,0];
        child.size = [this._fisrt_view_width, size[1]];
      }
    }
    
    child = this._split_views [1];
    if (child)
    {
      if (orientation === 90 || orientation === -90)
      {
        child.position = [this._fisrt_view_width,0];
        child.size = [size[0] - this._fisrt_view_width, size[1]];
      }
      else
      {
        child.position = [0,0];
        child.size = size;
      }
    }

    // propagate to child
    View.prototype.refresh.call (this);
  },
  
  /**
   * @protected
   * @function
   */
  orientationWillChange : function (orientation)
  {
    var size = this.size, child, orientation;
    
    child = this._split_views [0];
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
          View.prototype.add.call (this, child);
        }
        child.position = [0,0];
        child.size = [this._fisrt_view_width, size[1]];
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
    
    child = this._split_views [1];
    if (child)
    {
      if (orientation === 90 || orientation === -90)
      {
        child.position = [this._fisrt_view_width,0];
        child.size = [size[0] - this._fisrt_view_width, size[1]];
      }
      else
      {
        child.position = [0,0];
        child.size = size;
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
  }
};
util.extendClass (SplitView, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (SplitView, "delegate", {
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
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.SplitView = SplitView;
