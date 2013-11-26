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
 *  The vs.fx.SwipeController class <br />
 *  This layer manage a list of children using a horizontal layout.
 *
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the slider is horizontal, but you can change it using the 
 *  property "orientation".
 *  <p />
 *  The following example shows a typical example with panels
 *  (components 1 to 4) that are shows sequentially according user touch slide.
 *
 *  <pre>
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡ˉˉˉˉˉˉ⎤    ⎢ ⎡ˉˉˉˉˉˉ⎤ ⎢   ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟      ⎢    ⎢ ⎢      ⎢ ⎢   ⎟      ⎢   ⎟      ⎢
 *   ⎟  (1) ⎢    ⎢ ⎢  (2) ⎢ ⎢   ⎟  (3) ⎢   ⎟  (4) ⎢
 *   ⎟      ⎢    ⎢ ⎢      ⎢ ⎢   ⎟      ⎢   ⎟      ⎢
 *   ⎣______⎦    ⎢ ⎣______⎦ ⎢   ⎣______⎦   ⎣______⎦
 *                ⎣____________⎦
 *
 *
 *  (*) : device screen
 *  (1, ... ,4) : components managed by the SliderLayer
 *
 *   </pre>
 *
 *  <p>
 *  Delegate:
 *  <ul>
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller),
 *         Called when the view changed
 *    <li/>controllerAnimationDidEnd : function (from vs.ui.View, to vs.ui.View, controller), Called just after 
 *         the animation ended
 *  </ul>
 *  <p>
 *  @example
 *  var layer = new vs.fx.SwipeController (myComp);
 *
 *  layer.push ('APanel', {id: '1', data: {...}});
 *  layer.push ('APanel', {id: '2', data: {...}});
 *  layer.push ('APanel', {id: '3', data: {...}});
 *  layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.SwipeController
 *  @class
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.fx.SwipeController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 */
var SwipeController = vs.core.createClass ({

  parent: vs.fx.StackController,
  
  /********************************************************************
                    protected members declarations
  ********************************************************************/
  /**
   * @protected
   * @function
   */
  _is_circular: false,

  /**
   * @protected
   * @function
   */
  _is_continuous_swipe: false,

  /**
   *
   * @protected
   * @type {number}
   */
  __delta : 0,
  __current_pos : 0,
  
  
  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : 0,

  /********************************************************************
                    Define class properties
  ********************************************************************/

  properties: {
    'orientation': {
      /** 
       * Getter|Setter for page slide orientation. It can take the value
       * vs.fx.SwipeController.HORIZONTAL or vs.fx.SwipeController.VERTICAL.
       * By default the slider is horizontal.
       * @name vs.fx.SwipeController#orientation 
       * @type String
       */ 
      set : function (v)
      {
        var state, state_id, i = 0, pos = 0;
      
        if (v !== SwipeController.HORIZONTAL &&
            v !== SwipeController.VERTICAL) { return; }
      
        this._orientation = v;
        this._updateViewSize ();
      },
  
      /** 
       * @ignore
       * @return {String}
       */ 
      get : function ()
      {
        return this._orientation;
      }
    },

    'isTactile': {
      /** 
       * Getter|Setter for the tab bar style
       * @name vs.fx.StackController#isTactile 
       * @type {boolean}
       */ 
      set : function (v)
      {
        if (v)
        {
          this._is_tactile = true;
          if (!this._owner || !this._owner.view) return;
    
          if (!this._owner_handler_event_extended)
          {
            if (!this.__drag_recognizer)
            {
              this.__drag_recognizer = new ui.DragRecognizer (this);
              this._owner.addPointerRecognizer (this.__drag_recognizer);
            }           
          }
          this._owner_handler_event_extended = true;
        }
        else
        {
          this._is_tactile = false;
          if (!this._owner || !this._owner.view) return;
          
          if (this._owner_handler_event_extended)
          {

            if (this.__drag_recognizer)
            {
              this._owner.removePointerRecognizer (this.__drag_recognizer);
              this.__drag_recognizer = null;
            }
            this._owner_handler_event_extended = false;
          }
        }
      },
    
      /** 
       * @ignore
       * @return {boolean}
       */ 
      get : function ()
      {
        return this._is_tactile;
      }
    },
      
    'isCircular': {
      /** 
       * Getter|Setter for circular swipe
       * @name vs.fx.SwipeController#isCircular 
       * @type {boolean}
       */ 
      set : function (v)
      {
        if (v)
        {
          this._is_circular = true;
        }
        else
        {
          this._is_circular = false;
        }
      },
    
      /** 
       * @ignore
       * @return {boolean}
       */ 
      get : function ()
      {
        return this._is_circular;
      }
    },
    
    'isContinuousSwipe': {
      /** 
       * Getter|Setter Continuous Swipe
       * @name vs.fx.SwipeController#isContinuousSwipe 
       * @type {boolean}
       */ 
      set : function (v)
      {
        if (v)
        {
          this._is_continuous_swipe = true;
        }
        else
        {
          this._is_continuous_swipe = false;
        }
      },
    
      /** 
       * @ignore
       * @return {boolean}
       */ 
      get : function ()
      {
        return this._is_continuous_swipe;
      }
    }
  },

  constructor : function (owner)
  {
    this._super (owner);
    
    this._orientation = SwipeController.HORIZONTAL;

    if (!arguments.length) return;
  
    this.animationDuration = SwipeController.ANIMATION_DURATION;
  },

  /*********************************************************
   *                 behavior update
   *********************************************************/
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {
    var i, state_id, state, delta, size = this._owner.size;
    
    if (this._orientation === SwipeController.HORIZONTAL)
    {
      delta = size [0];
    }
    else if (this._orientation === SwipeController.VERTICAL)
    {
      delta = size [1];
    }

    for (i = 0; i < this._states_array.length; i++)
    {
      state_id = this._states_array [i];
      state = this._fsm._list_of_state [state_id];
      
      if (!state || !state.comp) { continue; }
      
      // define transformation for view after current one
      if (this._orientation === SwipeController.HORIZONTAL)
      {
        state.comp.translate ((delta * i), 0, 0);
      }
      else if (this._orientation === SwipeController.VERTICAL)
      {
        state.comp.translate (0, (delta * i), 0);
      }
    } 
  },
  
  /**
   *  Add a child component to the Slider Manager
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  The component instantiation is a lazy algorithm. The component will
   *  be instantiated and add into the DOM tree only when it has to be show
   *  to the user.
   *  <p>
   *  @example
   *  var myController = new vs.fx.SwipeController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.SwipeController#push
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the component.
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, extension, bindings)
  {
    if (!comp) { return; }
    if (!data) { data = {}; }
    
    var state_id = Controller.prototype.push.call
      (this, comp, data, extension, bindings);
    if (!state_id) { return; }
    
    this._states_array.push (state_id);
    this.__nb_panels ++; 

    // first item
    if (this.__nb_panels === 1)
    {
      this.initialComponent = state_id;
      this._last_comp_id = state_id;

      return state_id;
    }
    
    this.addTransition (this._last_comp_id, state_id, StackController.NEXT);
    this.addTransition (state_id, this._last_comp_id, StackController.PRED);
    this.addTransition 
      (state_id, this._initial_component, StackController.FIRST);

    this._last_state = state_id;
    
    // create the second view 
    state = this._fsm._list_of_state [state_id];
    if (!state)
    {
      console.error ("Unknown error in vs.fx.StackController.push");
      return;
    }
    if (this._last_comp_id === this._initial_component)
    {
      if (!state.comp)
      {
        state.comp = this._owner.createAndAddComponent
          (state.comp_name, state.init_data, extension);
          
        state.comp.configure (state.init_data);
        state.comp.setStyle ('position', 'absolute');
        if (state.comp && state.comp.propertiesDidChange) 
        { 
          state.comp.propertiesDidChange ();
        }
        state.comp.propertyChange ();
      }
      
      state.comp.show ();
      state.comp.setStyle ('z-index', this.__nb_panels);
      this.configureNewComponent (state.comp);
    }
    else
    {
      if (state.comp)
      {
        state.comp.setStyle ('z-index', this.__nb_panels);
        this.configureNewComponent (state.comp);
      }
    }
    
    this._last_comp_id = state_id;
    return state_id;
  },
  
  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
    var size = this._owner.size;
    
    if (this._orientation === SwipeController.HORIZONTAL)
    {
      state.comp.translate (size [0] * (this.__nb_panels - 1), 0, 0);
    }
    else if (this._orientation === SwipeController.VERTICAL)
    {
      state.comp.translate (0, size [1] * (this.__nb_panels - 1), 0);
    }
    
//    comp.hide ();
  },

  /*********************************************************
   *                  Event management
   *********************************************************/
  /**
   * @protected
   * @function
   */   
  didDrag : function (drag_info, event) {
    if (this._orientation === SwipeController.HORIZONTAL)
      this.__delta = drag_info.dx;
    else
      this.__delta = drag_info.dy;
      
    if (this._is_continuous_swipe) {
    
      var carousel_div = this._owner._holes.children;
      carousel_div.style.webkitTransitionDuration = "0ms";
      
      setElementTransform (carousel_div,
        "translate3D(" +
        (this.__delta + this.__current_pos)
        + "px,0,0)");
    }
  },
  
  /**
   * @protected
   * @function
   */   
  didDragEnd : function () {
    var t_ok, previous_state, next_state, self = this;
    
    function cancelDrag () {
      var carousel_div = self._owner._holes.children;
      
      carousel_div.style.webkitTransitionDuration =
        self._animation_duration + "ms";

      if (self._orientation === SwipeController.HORIZONTAL)
        setElementTransform (carousel_div,
          "translate3D(" + self.__current_pos + "px,0,0)");
      else
        setElementTransform (carousel_div,
          "translate3D(0," + self.__current_pos + "px,0)");
    }
    
    if (this.__delta > 50)
    {
      previous_state = this._fsm.getAccessibleStateOn (StackController.PRED);
      if (!previous_state && this._is_circular)
        t_ok = this.goToLastView (null, null, -1);
      else t_ok = this.goToPreviousView ();

      if (!t_ok) cancelDrag ();
    }
    else if (this.__delta < -50)
    {
      next_state = this._fsm.getAccessibleStateOn (StackController.NEXT);
      if (!next_state && this._is_circular)
        t_ok = this.goToFirstView (null, null, 1);
      else t_ok = this.goToNextView ();
      
      if (!t_ok) cancelDrag ();
    }
    else if (this._is_continuous_swipe) {
      cancelDrag ();
    }
  },
   
  /**
   * @protected
   * @function
   */
  refresh: function ()
  {
    StackController.prototype.refresh.call (this);
    this._updateViewSize ();
  },
  
  /**
   *  @protected
   */
  _stackAnimateComponents : function (order, fromComp, toComp, clb, instant)
  {
    var
      size = this._owner.size,
      carousel_div = this._owner._holes.children,
      pos = this._states_array.indexOf (toComp.id);

    carousel_div.style.webkitTransitionDuration = "0ms";

    if (this._orientation === SwipeController.HORIZONTAL)
      this.__current_pos = pos * -size[0];
    else
      this.__current_pos = pos * -size[1];

    var self = this, callback = function ()
    {
//      fromComp.hide ();
      try
      {
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
        if (clb) clb.call (self._owner);
      } catch (e) { console.error (e); }
    };
    
    function runAnimation ()
    {
      try
      {
        toComp.show ();
        toComp.refresh ();
        vs.scheduleAction (function () {
          if (instant) {
            carousel_div.style.webkitTransitionDuration = "0ms";
          }
          else {
            carousel_div.style.webkitTransitionDuration =
              self._animation_duration + "ms";
          }

          if (self._orientation === SwipeController.HORIZONTAL)
            setElementTransform (carousel_div,
              "translate3D(" + self.__current_pos + "px,0,0)");
          else
            setElementTransform (carousel_div,
              "translate3D(0," + self.__current_pos + "px,0)");
        });
      }
      catch (e) { console.error (e); }
    };
    runAnimation ();
  } 
});
util.extend (SwipeController.prototype, ui.RecognizerManager);

/**
 * The duration of the animation between two views
 *
 * @name vs.fx.SwipeController.ANIMATION_DURATION
 */
SwipeController.ANIMATION_DURATION = 300;

/**
 * Horizontal slide (defaut)
 *
 * @name vs.fx.SwipeController.HORIZONTAL
 * @const
 */
SwipeController.HORIZONTAL = 0;

/**
 * Vertical slide
 *
 * @name vs.fx.SwipeController.VERTICAL
 * @const
 */
SwipeController.VERTICAL = 1;

/**
 * Vertical slide
 *
 * @name vs.fx.SwipeController.PIXEL
 * @const
 */
SwipeController.PIXEL = 1;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.SwipeController = SwipeController;
