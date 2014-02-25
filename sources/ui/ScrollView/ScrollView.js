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
 *  The vs.ui.ScrollView class
 *
 *  @extends vs.ui.View
 *  @class
 *  vs.ui.ScrollView defines the basic drawing, event-handling, of an application.
 *  The main different between vs.ui.ScrollView and vs.ui.View classes is vs.ui.ScrollView
 *  manages gesture events and scroll.
 *  <p>
 *  To allow pinch and scroll behavior, you need to set pinch and/or scroll
 *  properties. You can activate separately rotation, scale and scroll.
 *
 *  <p>
 * Delegates:
 *  <ul>
 *    <li/>viewWillStartZooming : function (vs.ui.ScrollView the view)
 *    <li/>viewDidEndZooming : function (vs.ui.ScrollView the view, number scale)
 *  </ul>
 *  <p>
 *  @example
 *  var myView = new vs.ui.ScrollView (config);
 *  myView.minScale = 1;
 *  myView.maxScale = 2;
 *  myView.pinch = vs.ui.ScrollView.SCALE; // activate pinch zoom
 *  myView.scroll = true; //
 *  
 *  @author David Thevenin
 * @name vs.ui.ScrollView
 *
 *  @constructor
 *   Creates a new vs.ui.ScrollView.
 *
 * @param {Object} config the configuration structure [mandatory]
 */
function ScrollView (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ScrollView;
  
  this.__ab_view_t_o = [50, 50];
}

/********************************************************************
                    _scrolling constant
*********************************************************************/

/** 
 * Disable the scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.NO_SCROLL
 * @const
 */
ScrollView.NO_SCROLL = 0;

/** 
 * Activate the only vertical scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.VERTICAL_SCROLL
 * @const
 */
ScrollView.VERTICAL_SCROLL = 1;

/** 
 * Activate the horizontal scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.HORIZONTAL_SCROLL
 * @const
 */
ScrollView.HORIZONTAL_SCROLL = 2;

/** 
 * Activate the scroll
 * @see vs.ui.ScrollView#scroll 
 * @name vs.ui.ScrollView.SCROLL
 * @const
 */
ScrollView.SCROLL = 3;

/********************************************************************
                    Pinch / rotation / scale constant
*********************************************************************/

/** 
 * Disable the pinch
 * @see vs.ui.ScrollView#pinch 
 * @name vs.ui.ScrollView.NO_PINCH
 * @const
 */
ScrollView.NO_PINCH = 0;

/** 
 * Configures pinch rotation
 * @see vs.ui.ScrollView#pinch 
 * @name vs.ui.ScrollView.ROTATION
 * @const
 */
ScrollView.ROTATION = 1;

/** 
 * Configures pinch scale
 * @see ScrollView#pinch 
 * @name vs.ui.ScrollView.SCALE
 * @const
 */
ScrollView.SCALE = 2;

/** 
 * Configures pinch rotation and scale
 * @see vs.ui.ScrollView#pinch 
 * @name vs.ui.ScrollView.ROTATION_AND_SCALE
 * @const
 */
ScrollView.ROTATION_AND_SCALE = 3;

ScrollView.prototype = {

 /**********************************************************************
 
 *********************************************************************/
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

   /**
   * @protected
   * @type {boolean}
   */
  _scroll: false,
      
   /**
   * @private
   * @type {boolean}
   */
  __scroll_activated: false,
      
   /**
   * @protected
   * @type {boolean}
   */
  _pinch: ScrollView.NO_PINCH,
  
  /**
   * Translate value on x
   * @private
   * @type {number}
   */
  _ab_view_t_x : 0,

  /**
   * Translate value on y
   * @private
   * @type {number}
   */
  _ab_view_t_y : 0,
  
  /**
   * Scale value of the inter view
   * @private
   * @type {number}
   */
  _ab_view_s : 1,

  /**
   * Rotation value of the inter view
   * @protected
   * @type {number}
   */
  _ab_view_r : 0,

  /*******   transformation member ****************/
  
  /**
   * Animation temporisation (in millisecond)
   * @private
   * @type {number}
   */
  _animation_duration : 0,
    
//   /** 
//    * This property allows you to specify the origin of the 2D transformations. 
//    * Values are pourcentage of the view size.
//    * <p>
//    * The property is set by default to [50, 50], which is the center of
//    * the view.
//    * @name vs.ui.View#transformOrigin 
//    * @type Array.<number>
//    */ 
//   set transformOrigin (v)
//   {
//     if (!util.isArray (v) || v.length !== 2) { return; }
//     if (!util.isNumber (v[0]) || !util.isNumber (v[1])) { return; }
// 
//     this._transform_origin [0] = v [0];
//     this._transform_origin [1] = v [1];
// 
//     var origin_str = this._transform_origin [0] + '% ';
//     origin_str += this._transform_origin [1] + '%';
//     this._sub_view.style ['-webkit-transform-origin'] = origin_str;
//   },
// 
//   /** 
//    * @return {Array}
//    */ 
//   get transformOrigin ()
//   {
//     return this._transform_origin.slice ();
//   },

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    var child, size = this.size, width = size[0], height = size[1], v,
      css = this._getComputedStyle (this.view), dx = 0, dy = 0;
    if (!this._sub_view) { return; }
    
    this._sub_view.style.height = '';
    this._sub_view.style.width = '';
    
    function endRefresh () {
      if (!this.__i__) return; // component was deleted!
      View.prototype.refresh.call (this);
 
      if (css)
      {
        v = css ['border-right-width'];
        dx += v?parseInt (v, 10):0;
        v = css ['border-left-width'];
        dx += v?parseInt (v, 10):0;
        v = css ['border-top-width'];
        dy += v?parseInt (v, 10):0;
        v = css ['borde-bottom-width'];
        dy += v?parseInt (v, 10):0;
      }

      width -= dx;
      height -= dy;
    
      child = this._sub_view.firstElementChild;
      while (child)
      {
        v = child.offsetHeight + child.offsetTop;
        if (v > height) { height = v; }
        v = child.offsetWidth + child.offsetLeft;
        if (v > width) { width = v; }
      
        child = child.nextElementSibling;
      }
    
      if (this._scroll === ScrollView.SCROLL)
      {
        this._sub_view.style.width = width + 'px';
        this._sub_view.style.height = height + 'px';
      }
      if (this._scroll === ScrollView.HORIZONTAL_SCROLL)
      {
        this._sub_view.style.width = width + 'px';
        this._sub_view.style.height = this.size [1] - dx + 'px';
      }
      if (this._scroll === ScrollView.VERTICAL_SCROLL)
      {
        this._sub_view.style.width = this.size [0] - dy + 'px';
        this._sub_view.style.height = height + 'px';
      }
    
      if (this._scroll === ScrollView.NO_SCROLL)
      {
        size = this.size;
        this._sub_view.style.width = size [0] + 'px';
        this._sub_view.style.height = size [1] + 'px'
      }

      if (this.__iscroll__) this.__iscroll__.refresh ();
    }
    
    vs.scheduleAction (endRefresh.bind (this));
  },
    
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this.__iscroll__)
    {
      this.__iscroll__.destroy ();
      this.__iscroll__ = undefined;
    }
    this._scroll = false;
    
    if (this._sub_view && this._sub_view.parentElement)
    {
      this._sub_view.parentElement.removeChild (this._sub_view);
    }
    View.prototype.destructor.call (this);
    delete (this._sub_view);
  },
  
  /**
   * Add the specified child component to this component.
   * <p>
   * The component can be a graphic component (vs.ui.View) or
   * a non graphic component (vs.core.EventSource).
   * In case of vs.ui.View its mandatory to set the extension.
   * <p>
   * The add is a lazy add! The child's view can be already in
   * the HTML DOM. In that case, the add methode do not modify the DOM.
   * <p>
   * @example
   *  var myButton = new Button (conf);
   *  myObject.add (myButton, 'children');
   *
   * @name vs.ui.ScrollView#add
   * @function
   * 
   * @param {vs.core.EventSource} child The component to be added.
   * @param {String} extension [optional] The hole into a vs.ui.View will be insert.
  */
  add : function (child, extension)
  {
    // manage Navigation bar and vs.ui.ToolBar specific positioning
    if (!child) { return; }
    if (child instanceof NavigationBar)
    { extension = 'top_bar'; }
    if (child instanceof ToolBar)
    { extension = 'bottom_bar'; }
    
    View.prototype.add.call (this, child, extension);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this._sub_view = this.view.querySelector ('.content');
    
    this.pinch = this._pinch;
    this.scroll = this._scroll;
    this.layout = this._layout;
    this.animationDuration = this._animation_duration;
   
    this.refresh ();
//    this._applyInsideTransformation2D ();
  },
  
  /*****************************************************************
   *                Events Management
   ****************************************************************/
   
  /**
   * @private
   * @function
   */
//   handleEvent : function (e)
//   {
//     switch (e.type)
//     {
//       case core.POINTER_START:
//         this.pointerStart (e);
//         break;
//       case core.POINTER_MOVE:
//         this._scroll_pointer_move (e);
//         break;
//       case core.POINTER_CANCEL:
//       case core.POINTER_END:
//         this._scroll_pointer_end (e);
//         break;
//       case 'gesturestart':
//         this.gestureStart (e);
//         break;
//       case 'gesturechange':
//         this.gestureChange (e);
//         break;
//       case 'gestureend':
//       case 'gesturecancel':
//         this.gestureEnd (e);
//         break;
//       case 'webkitTransitionEnd':
//         this._scroll_transition_end ();
//         break;
//       case 'orientationchange':
//       case 'resize':
//         this.refresh ();
//         break;
//       case 'DOMSubtreeModified':
//         this.onDOMModified (e);
//         break;
//      }
//     return false;
//   },

  /**
   * @private
   * @function
   */
//   gestureStart : function (e)
//   {
//     e.preventDefault ();
//     e.stopPropagation ();
//     
//     this.animationDuration = 0;
// 
//     if (this._pinch & ScrollView.SCALE && this._delegate &&
//         this._delegate.viewWillStartZooming)
//     {
//       this._delegate.viewWillStartZooming (this);
//     }
// 
//     document.addEventListener ('gesturechange', this);
//     document.addEventListener ('gestureend', this);
//     document.addEventListener ('gesturecancel', this);
//     this.view.addEventListener ('gestureend', this);
//     this.view.addEventListener ('gesturecancel', this);
//     
//     this.__ab_view_s = this._ab_view_s;
//     this.__ab_view_r = this._ab_view_r;
// 
//     origin_str = '50% 50%';
//     this._sub_view.style ['-webkit-transform-origin'] = origin_str;
//   },

  /**
   * @private
   * @function
   */
//   gestureChange : function (e)
//   {
//     var scale = this.__ab_view_s * e.scale;
//     e.preventDefault ();
//     e.stopPropagation ();
// 
//     if (scale > this._max_scale) { scale = this._max_scale; }
//     if (scale < this._min_scale) { scale = this._min_scale; }
// 
//     if (this._pinch === ScrollView.ROTATION)
//     {
//       this._ab_view_r = this.__ab_view_r + e.rotation;
//     }
//     else if (this._pinch === ScrollView.SCALE)
//     {
//       this._ab_view_s = scale;
//     }
//     else if (this._pinch === ScrollView.ROTATION_AND_SCALE)
//     {
//       this._ab_view_r = this.__ab_view_r + e.rotation;
//       this._ab_view_s = scale;
//     }
//     this._applyInsideTransformation2D ();
//     
//     // refresh scroll views according scale and rotiation
// //    if (this._scroll) { this._scroll_refresh (this._pinch); }
//   },

  /**
   * @private
   * @function
   */
//   gestureEnd : function (e)
//   {
//     var self = this;
// 
//     e.preventDefault ();
//     e.stopPropagation ();
// 
//     document.removeEventListener ('gesturechange', this);
//     document.removeEventListener ('gestureend', this);
//     document.removeEventListener ('gesturecancel', this);
//     this.view.removeEventListener ('gestureend', this);
//     this.view.removeEventListener ('gesturecancel', this);
//     
// 		setTimeout(function () {
// 			self.refresh();
// 		}, 0);
// 
//     if (this._pinch & ScrollView.SCALE && this._delegate &&
//         this._delegate.viewDidEndZooming)
//     {
//       this._delegate.viewDidEndZooming (this, this._ab_view_s);
//     }
//   },

  /**
   * @protected
   * @function
   */
//   pointerStart: function (e)
//   {
//     var matrix, len, origin_str, bx = 0, by = 0;
//     
//     // manage multi touche events (pinch, ...)
//     if (e.changedTouches && e.changedTouches.length > 1)
//     {
//       len = e.changedTouches.length;
//       for (i = 0; i < len; i ++)
//       {
//         bx += e.changedTouches [i].pageX;
//         by += e.changedTouches [i].pageY;
//       }
//       bx = (bx / len) - this._pos [0];
//       by = (by / len) - this._pos [1];
//       origin_str = bx + 'px ' + by + 'px';
//       this._sub_view.style ['-webkit-transform-origin'] = origin_str;
//       return;
//     }
// 
// // manage one touch event (touch, slide, ...)
// //     if (!this.enabled || (!this.options.vScrollbar && !this.options.hScrollbar)) {
// //       this._propagateToParent (e);
// //       return;
// //     }
// //     if (!e._fake && e.currentTarget !== this._sub_view) { return; }
// 
//     this._scroll_pointer_start (e);
//   },
  
  /**
   * @protected
   * @function
   */
//   onDOMModified: function (e)
//   {
//     var self = this;
// 
//     // (Hopefully) execute onDOMModified only once
//     if (e.target.parentNode !== this._sub_view) { return; }
// 
// //    setTimeout (function () { self.refresh(); }, 0);
//     this.refresh();
// 
//     if (this.options.topOnDOMChanges && 
//        (this._ab_view_t_x !== 0 || this._ab_view_t_y !== 0))
//     { this.scrollTo (0,0,0); }
//   },

  /**
   * @protected
   * @function
   */
//   onScrollEnd: function ()
//   {},
  
  /*****************************************************************
   *                Transformation methods
   ****************************************************************/
   
  /**
   * Move the content in x, y.
   *
   * @name vs.ui.ScrollView#insideTranslate
   * @function
   * 
   * @param {int} x translation over the x axis
   * @param {int} y translation over the y axis
   * @param {function} clb Function call at the end of the transformation
   */
//   insideTranslate: function (x, y, clb)
//   {
//     if (this._ab_view_t_x === x && this._ab_view_t_y === y) { return; }
//     
//     this._ab_view_t_x = x;
//     this._ab_view_t_y = y;
//     
//     this._applyInsideTransformation2D (clb);
//   },

  /**
   * Rotate the content
   *
   * @name vs.ui.ScrollView#insideRotate
   * @function
   * 
   * @param r {int} rotation
   * @param y {int} translation over the y axis
   * @param {function} clb Function call at the end of the transformation
   */
//   insideRotate: function (r, clb)
//   {
//     if (this._ab_view_r === r) { return; }
//     
//     this._ab_view_r = r;
//     
//     this._applyInsideTransformation2D (clb);
//     
//     // refresh scroll views according scale and rotiation
//     if (this._scroll) { this._scroll_refresh (this._pinch); }
//   },
  
  /**
   * Scale the content
   * <p/>The scale is limited by a max and min scale value.
   * 
   * @name vs.ui.ScrollView#insideScale
   * @function
   * 
   * @param s {float} scale value
   * @param {function} clb Function call at the end of the transformation
   */
//   insideScale: function (s, clb)
//   {    
//     if (s > this._max_scale) { s = this._max_scale; }
//     if (s < this._min_scale) { s = this._min_scale; }
//     if (this._ab_view_s === s) { return; }
//  
//     this._ab_view_s = s;
//     
//     this._applyInsideTransformation2D (clb);
//     
//     // refresh scroll views according scale and rotiation
// //    if (this._scroll) { this._scroll_refresh (this._pinch); }
//   },
  
  /**
   * @protected
   * @function
   */
//   _applyInsideTransformation2D: function (clb)
//   {
//     var transform = '', callback, self = this;
//     
//     callback = function (event) 
//     {
//       // do nothing if that event just bubbled from our target's sub-tree
//       if (event.currentTarget !== self._sub_view) { return; }
// 
//       self._sub_view.removeEventListener
//         ('webkitTransitionEnd', callback, false);
//       
//       if (clb) { clb.call (self); }
//     }
// 
//     // apply translation, therefor a strange bug appear (flick)
//     if (SUPPORT_3D_TRANSFORM)
//       transform += 
//         "translate3d("+this._ab_view_t_x+"px,"+this._ab_view_t_y+"px,0)";
//     else
//       transform += 
//         "translate("+this._ab_view_t_x+"px,"+this._ab_view_t_y+"px)";
// 
//     if (this._ab_view_r)
//     {
//       transform += " rotate(" + this._ab_view_r + "deg)";
//     }
//     if (this._ab_view_s !== 1)
//     {
//       transform += " scale(" + this._ab_view_s + ")";
//     }
//     
//     if (clb)
//     {
//       this._sub_view.addEventListener ('webkitTransitionEnd', callback, false);
//     }
//     setElementTransform (this._sub_view, transform);
//   },
  
  /**
   * @protected
   * @function
   */
  _updateSize: function ()
  {
    View.prototype._updateSize.call (this);
    this.refresh ();
  },
  
  _setup_iscroll : function () {
    if (this.__iscroll__)
    {
      this.__iscroll__.destroy ();
      this.__iscroll__ = undefined;
    }
  
    if (this.view && this._sub_view)
    {
      var options = {};
      options.bubbling = false;
//      options.fadeScrollbar = true;
//      options.bounce = false;
//      options.momentum = false;
      options.hScroll = false;
      options.vScroll = false;
      if (this._scroll === 1)
      {
        options.vScroll = true;
      }
      else if (this._scroll === 2)
      {
        options.hScroll = true;
      }
      else if (this._scroll === 3)
      {
        options.hScroll = true;
        options.vScroll = true;
      }
      
      // For any case, do not show the scroll bar
       options.hScrollbar = false;
       options.vScrollbar = false;
 
      this.__iscroll__ = new iScroll (this.view, this._sub_view, options);

      this.refresh ();
    }
  }
};
util.extendClass (ScrollView, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ScrollView, {
'delegate': {
  /** 
   * Set the delegate.
   * It should implements following methods
   *  <ul>
   *    <li/>viewWillStartZooming : function (vs.ui.ScrollView the view)
   *    <li/>viewDidEndZooming : function (vs.ui.ScrollView the view, number scale)
   *  </ul>
   * @name vs.ui.ScrollView#delegate 
   * @type {Object}
   */ 
  set : function (v)
  {
    this._delegate = v;
  }
},
'scroll': {
  /** 
   * Allow to scroll the view.
   * By default it not allowed
   * @name vs.ui.ScrollView#scroll 
   * @type {boolean|number}
   */ 
  set : function (v)
  {
    if (v === this._scroll) return;
    if (!v)
    {
      if (this.__iscroll__)
      {
        this.__iscroll__.destroy ();
        this.__iscroll__ = undefined;
      }
      this._scroll = false;
    }
    else if (v === true || v === 1 || v === 2 || v === 3)
    {
      this._scroll = v;
      this._setup_iscroll ();
    }
  },
  
  /** 
   * @ignore
   * @type {boolean}
   */ 
  get : function ()
  {
    return this._scroll;
  }
},
'pinch': {  
  /** 
   * Configures the view pinch.
   * By default it not allowed (vs.ui.ScrollView.NO_PINCH)
   * @name vs.ui.ScrollView#pinch 
   * @type {number}
   * @see vs.ui.ScrollView.NO_PINCH
   * @see vs.ui.ScrollView.SCALE
   * @see vs.ui.ScrollView.ROTATION
   * @see vs.ui.ScrollView.ROTATION_AND_SCALE
   */ 
  set : function (v)
  {
    if (v !== ScrollView.NO_PINCH && v !== ScrollView.ROTATION  &&
        v !== ScrollView.SCALE  && v !== ScrollView.ROTATION_AND_SCALE)
    { return; }
    
    if (!this.view) { return; }

//     if (v === ScrollView.NO_PINCH && this._pinch !== ScrollView.NO_PINCH)
//     {
//       this.view.removeEventListener ('gesturestart', this);
//     }
//     else if (v !== ScrollView.NO_PINCH && this._pinch === ScrollView.NO_PINCH)
//     {
//       this.view.addEventListener ('gesturestart', this);
// //      this.view.addEventListener ('touchstart', this);
//     }
    this._pinch = v;
  }
},
'animationDuration': {
  /** 
   * Set the animation/transition temporisation (in millisecond)
   * @name vs.ui.ScrollView#animationDuration 
   * @type {number}
   */ 
  set : function (time)
  {
    if (!time) { time = 0; }
    if (!util.isNumber (time)) { return };
    
    this._animation_duration = time;
    
    if (!this._sub_view) { return; }
    
    this._sub_view.style.webkitTransitionDuration = time + 'ms';
    
    if (this.hScrollbar || this.vScrollbar)
    {
      this._scroll_transition_time (time);
    }
  }
},
'layout': {
  /** 
   * This property allows you to specify a layout for the children
   * <p>
   * <ul>
   *    <li /> vs.ui.View.DEFAULT_LAYOUT
   *    <li /> vs.ui.View.HORIZONTAL_LAYOUT
   *    <li /> vs.ui.View.VERTICAL_LAYOUT
   *    <li /> vs.ui.View.ABSOLUTE_LAYOUT
   *    <li /> vs.ui.View.FLOW_LAYOUT
   * </ul>
   * @name vs.ui.ScrollView#layout 
   * @type String
   */ 
  set : function (v)
  {
    if (v !== View.HORIZONTAL_LAYOUT &&
        v !== View.DEFAULT_LAYOUT &&
        v !== View.ABSOLUTE_LAYOUT &&
        v !== View.VERTICAL_LAYOUT &&
        v !== View.FLOW_LAYOUT &&
        v !== View.LEGACY_HORIZONTAL_LAYOUT &&
        v !== View.LEGACY_ABSOLUTE_LAYOUT &&
        v !== View.LEGACY_VERTICAL_LAYOUT &&
        v !== View.LEGACY_FLOW_LAYOUT && v)
    {
      console.error ("Unsupported layout '" + v + "'!");
      return;
    }

    if (!this._sub_view)
    { 
      this._layout = v;
      return;
    }

    if (this._layout)
    {
      util.removeClassName (this._sub_view, this._layout);
    }
    this._layout = v;
    if (this._layout)
    {
      util.addClassName (this._sub_view, this._layout);
    }
  }
},

'innerHTML': {

  /**
   * This property allows to define both the HTML code and the text
   * @name vs.ui.ScrollView#innerHTML
   * @type String
   */
  set : function (v)
  {
    if (!this._sub_view) return;

    util.safeInnerHTML (this._sub_view, v);
  },
}
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ScrollView = ScrollView;
