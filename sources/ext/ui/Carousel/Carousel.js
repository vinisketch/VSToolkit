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
 *  The vs.ext.ui.Carousel class
 *
 *  @extends vs.ui.View
 *  @class
 *  Carousel presents a slide carousel. This carousel can be controller
 *  by a swipe on the screen or through methods (goToNextView, ...)
 *  <p>
 *  Carousel is a vs.ui.View. You can set the view size, to defined the bound
 *  inside children's view will be draw. Children are fixed
 *  on top left of the carousel.
 *  <p>
 *  Although carousel views are displayed vertically by default, you can
 *  use the orientation property to have it display horizontally.
 *  <p>
 *  You can set a delegate to be informed when the view will change
 *  (after a swipe or a method call).
 *
 *  <p>
 *  Delegate should implement:
 *  <ul>
 *    <li/>carouselViewWillChange : function (view /*vs.ui.View /)
 *  </ul>
 *  <p>
 *  @example
 *  var carousel = new Carousel (config);
 *  // set child component view (you can add instantiated view or component name
 *  carousel.add (view1);
 *  carousel.add (view2);
 *  carousel.add (view3);
 *  carousel.add (view4);
 *  // change the orientation
 *  carousel.orientation = vs.fx.SlideController.VERTICAL
 *  // set a delegate
 *  var delegate = {};
 *  delegate.carouselViewWillChange = function (view) { ... };
 *  carousel.delegate = delegate;
 *  
 *  @author David Thevenin
 *  @name vs.ext.ui.Carousel
 *
 *  @constructor
 *   Creates a new Carousel.
 *
 *  @param {Object} config the configuration structure [mandatory]
 */
function Carousel (config)
{
  this.parent = vs.ui.View;
  this.parent (config);
  this.constructor = Carousel;
  
  this.__indicators_list = {};
}

/**
 * Horizontal carousel (defaut)
 * @name vs.ext.ui.Carousel.HORIZONTAL
 * @const
 */
Carousel.HORIZONTAL = vs.fx.SlideController.HORIZONTAL;

/**
 * Vertical carousel
 * @name vs.ext.ui.Carousel.VERTICAL
 * @const
 */
Carousel.VERTICAL = vs.fx.SlideController.VERTICAL;

Carousel.prototype = {

 /**********************************************************************
 
 *********************************************************************/

   /**
   * @protected
   * @type {boolean}
   */
  _indicators_visibility : true,
  
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : Carousel.HORIZONTAL,

  /**
   * The vs.fx.SlideController that will manage the carousel slide
   * @private
   * @type {vs.fx.SlideController}
   */
  _slideController : null,
  
  /**
   * The indicators view
   * @private
   * @type {DivHtmlElement}
   */
  __indicators : null,
  
  /**
   * The selected indicator view
   * @private
   * @type {SpanHtmlElement}
   */
  __selected_indicator : null,
  
  /**
   * The list of indicators
   * @private
   * @type {Object.<string>}
   */
  __indicators_list : null,
  
  /**
   * Indicator change timer
   * @private
   * @type {number}
   */
  __indicators_timer : 0,  
  
 /**********************************************************************
                  In/Out properties declarations 
  *********************************************************************/


 /**********************************************************************
 
 *********************************************************************/
  
  /**
   * @protected
   */
  destructor : function ()
  {
    util.free (this._slideController);

    vs.ui.View.prototype.destructor.call (this);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    vs.ui.View.prototype.initComponent.call (this);

    this._slideController = new vs.fx.SlideController (this);
    this._slideController.delegate = this;
    this._slideController.isTactile = true;
        
    this.__indicators = this.view.querySelector ('.vs_ext_ui_carousel >.indicators');
    vs.util.addClassName (this.__indicators, 'horizontal');
  },

  /**
   * @protected
   * @function
   */
  initSkin : function ()
  {
    vs.ui.View.prototype.initSkin.call (this);
    this._slideController.init ();
  },
  
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    if (this._slideController && this._slideController.refresh)
    { this._slideController.refresh (); }

    vs.ui.View.prototype.refresh.call (this);
  },
  
 /**********************************************************************
 
 *********************************************************************/
 
  /**
   * @private
   * @function
   */
  controllerViewWillChange : function (from_comp, to_comp, controller)
  {
    if (this.__indicators_timer)
    {
      clearTimeout (this.__indicators_timer);
      __indicators_timer = 0;
    }
    
    var i_id = to_comp.id, self = this;
    this.__indicators_timer = setTimeout (function ()
    {
      if (self.__selected_indicator)
      {
        vs.util.removeClassName (self.__selected_indicator, 'selected');
      }
      self.__selected_indicator = self.__indicators_list [i_id];
      vs.util.addClassName (self.__selected_indicator, 'selected');
    }, 500);
    
    if (this._delegate && this._delegate.carouselViewWillChange)
    {
      this._delegate.carouselViewWillChange (to_comp);
    }
  },
   
   /**
   *  Add a child component to the carousel
   *  <p>
   *  The component can be a graphic component (vs.ui.View) or
   *  a non graphic component (vs.core.EventSource).
   *  In case of vs.ui.View its mandatory to set the extension.
   *  <p>
   *  @example
   *  var carousel = new Carousel (config);
   *  carousel.init ();
   *  // instanced component
   *  var comp = new AComponent (data);
   *  carousel.add (comp);
   *
   * @name vs.ext.ui.Carousel#add
   * @function
   * @param {vs.ui.View} child The component to add.
   */
  add : function (child)
  {
    vs.ui.View.prototype.add.call (this, child, 'children');
    this.push (child)
  },

   /**
   *  Add a child component to the carousel
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  @example
   *  var carousel = new Carousel (config);
   *  carousel.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.ext.ui.Carousel#push
   * @function
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the 
   *     component.
   */
  push : function (child, config)
  {
    // Test if the component is already added
    if (this.isChild (child))
    {
      if (this._slideController.isStateExit (child.id))
      { return; }
    }
    
    var span, state_id = this._slideController.push (child, config);
    
    span = document.createElement ('span');
    
    this.__indicators.appendChild (span);
    this.__indicators_list [state_id] = span;
  },

  /**
   *  Remove the specified child component from this component.
   * 
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ext.ui.Carousel#remove
   * @function
   * @param {vs.core.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    if (!child || !child.id)
    { return; }
    
    var span = this.__indicators_list [child.id];
    
    this.__indicators.removeChild (span);
    delete (this.__indicators_list [child.id]);

    vs.ui.View.prototype.remove.call (this, child);
  },

  /**
   * Remove all panels
   * @name vs.ext.ui.Carousel#removeAllChildren
   * @function
   */
  removeAllChildren : function ()
  {
    for (var id in this.__indicators_list)
    {
      var comp = vs.core.Object._obs [id];
      this.remove (comp);
    }
  },

 /**********************************************************************
 
 *********************************************************************/
 
  /**
   * Go to the next view
   * @name vs.ext.ui.Carousel#goToNextView
   * @function
   */
  goToNextView : function ()
  {
    this._slideController.goToNextView ();
  },
 
  /**
   * Go to the previous view
   * @name vs.ext.ui.Carousel#goToPreviousView
   * @function
   */
  goToPreviousView : function ()
  {
    this._slideController.goToPreviousView ();
  },

  /**
   *  Go to the view specified by its id
   *
   * @name vs.ext.ui.Carousel#goToView
   * @param {string} id The component id
   * @function
   */
  goToView : function (id)
  {
    this._slideController.goToViewId (id);
  },

  /**
   *  Go to the view specified by its position (index start at 0)
   *
   * @name vs.ext.ui.Carousel#goToViewAt
   * @param {number} index The component index
   * @function
   */
  goToViewAt : function (index)
  {
    this._slideController.goToViewAt (index);
  }
};
util.extendClass (Carousel, vs.ui.View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Carousel, {

  'size': {
    /** 
     * Getter|Setter for size. Gives access to the size of the GUI Object
     * @name vs.ext.ui.Carousel#size 
     * @function.
     * @type {Array.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      
      this._size [0] = v [0];
      this._size [1] = v [1];
      
      if (!this.view) { return; }
      this._updateSize ();
  
      if (this._slideController && this._slideController.refresh)
      { this._slideController.refresh (); }
    },
    
    /**
     * @type {Array.<number>}
     * @ignore
     */
    get : function ()
    {
      var view = this.view;
       if (view && view.parentNode)
      {
        this._size [0] = view.offsetWidth;
        this._size [1] = view.offsetHeight;
      }
      return this._size.slice ();
    }
  },
  'delegate': {

    /** 
     * Set the delegate.
     * It should implements following methods
     *  <ul>
     *    <li/>carouselViewWillChange : function (view /* vs.ui.View /)
     *  </ul>
     * @name vs.ext.ui.Carousel#delegate 
     * @type Object
     */ 
    set : function (v)
    {
      this._delegate = v;
    }
  },
  'indicatorsVisibility': {

    /** 
     * Set indicators visible or not
     * <p>
     * By default its set to true
     * @name vs.ext.ui.Carousel#indicatorsVisibility 
     * @type boolean
     */ 
    set : function (v)
    { 
      if (v)
      {
        this._indicators_visibility = true;
        __setVisible (this.__indicators, true);
      }
      else
      {
        this._indicators_visibility = false
        __setVisible (this.__indicators, false);
      }
    }
  },
  'orientation': {

    /** 
     * Getter|Setter for the tab bar style
     * @name vs.ext.ui.Carousel#orientation 
     * @type String
     */ 
    set : function (v)
    {
      if (v !== Carousel.HORIZONTAL &&
          v !== Carousel.VERTICAL) { return; }
      
      if (this._orientation === v) { return; }
      if (v === Carousel.HORIZONTAL)
      {
        vs.util.removeClassName (this.__indicators, 'vertical');
        vs.util.addClassName (this.__indicators, 'horizontal');
      }
      else
      {
        vs.util.removeClassName (this.__indicators, 'horizontal');
        vs.util.addClassName (this.__indicators, 'vertical');
      }
      this._orientation = v;
      this._slideController.orientation = v;
    },
  
    /** 
     * @return {String}
     * @ignore
     */ 
    get : function ()
    {
      return this._orientation;
      }
    }
  }
);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ext_ui.Carousel = Carousel;
