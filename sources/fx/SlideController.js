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
 *  The vs.fx.SlideController class <br />
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
 *  var layer = new vs.fx.SlideController (myComp);
 *
 *  layer.push ('APanel', {id: '1', data: {...}});
 *  layer.push ('APanel', {id: '2', data: {...}});
 *  layer.push ('APanel', {id: '3', data: {...}});
 *  layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.SlideController
 *  @class
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.fx.SlideController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 */
var SlideController = vs.core.createClass ({

  parent: vs.fx.StackController,
  
  /********************************************************************
                    protected members declarations
  ********************************************************************/
  /**
   *
   * @protected
   * @type {number}
   */
  _delta : 0,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : 0,
    
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_out_left : null,
  
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_out_right : null,
    
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_in : null,

  /**
   *
   * @protected
   * @type {number}
   */
  _animation_mode : 0,

  /********************************************************************
                    Define class properties
  ********************************************************************/

  properties: {
    'orientation': {
      /** 
       * Getter|Setter for page slide orientation. It can take the value
       * vs.fx.SlideController.HORIZONTAL or vs.fx.SlideController.VERTICAL.
       * By default the slider is horizontal.
       * @name vs.fx.SlideController#orientation 
       * @type String
       */ 
      set : function (v)
      {
        var state, state_id, i = 0, pos = 0;
      
        if (v !== SlideController.HORIZONTAL &&
            v !== SlideController.VERTICAL) { return; }
      
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
    
    'animationDuration': {
      /** 
       * Set the animation/transition temporisation (in millisecond)
       * @name vs.fx.SlideController#animationDuration 
       * @type {number}
       */ 
      set : function (v)
      {
        if (!v) { v = 0; }
        if (!util.isNumber (v)) { return };
      
        this._animation_duration = v;
        this._transition_out_left.duration = this._animation_duration + 'ms';
        this._transition_out_right.duration = this._animation_duration + 'ms';
        this._transition_in.duration = this._animation_duration + 'ms';
      }
    },
    
    'animationMode': {
      /** 
       * Set XXX
       * @name vs.fx.SlideController#animationMode 
       * @type {number}
       */ 
      set : function (v)
      {
        if (!v) { v = 0; }
        if (v !== SlideController.POURCENTAGE &&
            v !== SlideController.PIXEL) return;
        if (this._animation_mode === v) return;
        
        this._animation_mode = v;
        
        util.free (this._transition_out_right);
        util.free (this._transition_out_left);
        
        this._setUpAnimations ();
        this._updateViewSize ();
      }
    }
  },

  constructor : function (owner)
  {
    this._super (owner);
    
    this._orientation = SlideController.HORIZONTAL;

    if (!arguments.length) return;
  
    this._setUpAnimations ();
    this._transition_in = new Animation (['translate', '0,0,0']);
 
    this.animationDuration = SlideController.ANIMATION_DURATION;
  },

  /*********************************************************
   *                 behavior update
   *********************************************************/
  /**
   * @protected
   * @function
   */
  _setUpAnimations : function ()
  {
    switch (this._animation_mode)
    {
      case SlideController.POURCENTAGE:
        this._transition_out_left = new Animation (['translate', '${x}%,${y}%,0']);
        this._transition_out_right = new Animation (['translate', '${x}%,${y}%,0']);
      break;

      case SlideController.PIXEL:
        this._transition_out_left = new Animation (['translate', '${x}px,${y}px,0']);
        this._transition_out_right = new Animation (['translate', '${x}px,${y}px,0']);
      break;
    }

    this._transition_out_left.x = 0;
    this._transition_out_left.y = 0;
    this._transition_out_left.duration = this._animation_duration + 'ms';
    this._transition_out_right.duration = this._animation_duration + 'ms';
  },
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {
    var i, state_id, state, transform, delta, size;
    switch (this._animation_mode)
    {
      case SlideController.POURCENTAGE:
        delta = 100;
        delta_str = delta + "%";
      break;

      case SlideController.PIXEL:
        size = this._owner.size;
        
        if (this._orientation === SlideController.HORIZONTAL)
        {
          delta = size [0];
        }
        else if (this._orientation === SlideController.VERTICAL)
        {
          delta = size [1];
        }
        delta_str = delta + "px";
      break;
    }

    if (this._orientation === SlideController.HORIZONTAL)
    {
      this._transition_out_left.x = -delta;
      this._transition_out_left.y = 0;
      this._transition_out_right.x = delta;
      this._transition_out_right.y = 0;
    }
    else if (this._orientation === SlideController.VERTICAL)
    {
      this._transition_out_left.x = 0;
      this._transition_out_left.y = -delta;
      this._transition_out_right.x = 0;
      this._transition_out_right.y = delta;
    }
    
    // define transformation for view before current one
    if (this._orientation === SlideController.HORIZONTAL)
    {
      transform = "translate3D(-" + delta_str + ",0,0)";
    }
    else if (this._orientation === SlideController.VERTICAL)
    {
      transform = "translate3D(0,-" + delta_str + ",0)";
    }
    
    for (i = 0; i < this._states_array.length; i++)
    {
      state_id = this._states_array [i];
      state = this._fsm._list_of_state [state_id];
      
      if (!state || !state.comp) { continue; }
      
      if (this._fsm._current_state === state_id)
      {
        // define transformation for view after current one
        if (this._orientation === SlideController.HORIZONTAL)
        {
          transform = "translate3D(" + delta_str + ",0,0)";
        }
        else if (this._orientation === SlideController.VERTICAL)
        {
          transform = "translate3D(0," + delta_str + ",0)";
        }
        
        // set no transformation for the current one
        state.comp.view.style.webkitTransitionDuration = '0';
        setElementTransform (state.comp.view, "translate3D(0,0,0)");
        continue;
      }
      
      state.comp.view.style.webkitTransitionDuration = '0';
      setElementTransform (state.comp.view, transform);
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
   *  var myController = new vs.fx.SlideController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.SlideController#push
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
    var transform, delta_str, size;
          
    switch (this._animation_mode)
    {
      case SlideController.POURCENTAGE:
        delta_str = "100%";
      break;

      case SlideController.PIXEL:
        size = this._owner.size;
        
        if (this._orientation === SlideController.HORIZONTAL)
        {
          delta_str = size [0] + "px";
        }
        else if (this._orientation === SlideController.VERTICAL)
        {
          delta_str = size [1] + "px";
        }
      break;
    }

    if (this._orientation === SlideController.HORIZONTAL)
    {
      transform = "translate3D(" + delta_str + ",0,0)";
    }
    else if (this._orientation === SlideController.VERTICAL)
    {
      transform = "translate3D(0," + delta_str + ",0)";
    }

    comp.view.style.webkitTransitionDuration = '0';
    setElementTransform (comp.view, transform);
  },

  /*********************************************************
   *                  Event management
   *********************************************************/
  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var t_ok = false, size = this.size,
      duration = this.__controller__._animation_duration;
          
    if (event.type === core.POINTER_START)
    {
      if (this.__controller__._orientation === SlideController.HORIZONTAL)
      {
        if (event.changedTouches)
        {  this.__pos = event.changedTouches[0].clientX; }
        else
        {  this.__pos = event.clientX; }
      }
      else
      {
        if (event.changedTouches)
        {  this.__pos = event.changedTouches[0].clientY; }
        else
        {  this.__pos = event.clientY; }
      }

      document.addEventListener (core.POINTER_END, this, true);
      document.addEventListener (core.POINTER_MOVE, this, true);
      
      this.animationDuration = 0;
      this.__delta = 0;
    }
    else if (event.type === core.POINTER_MOVE)
    {
      event.preventDefault ();
      if (this.__controller__._orientation === SlideController.HORIZONTAL)
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientX - this.__pos; }
        else
        {  this.__delta = event.clientX - this.__pos; }
      }
      else
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        {  this.__delta = event.clientY - this.__pos; }
      }  
    }
    else if (event.type === core.POINTER_END)
    {
      if (this.__delta > 50)
      {
        t_ok = this.__controller__.goToPreviousView ();
      }
      else if (this.__delta < -50)
      {
        t_ok = this.__controller__.goToNextView ();
      }
      if (!t_ok)
      {
        if (this.__controller__._orientation === SlideController.HORIZONTAL)
        {
          duration = Math.floor (duration * this.__delta / size [0]);
          this.animationDuration = duration;
        }
        else
        {
          duration = Math.floor (duration * this.__delta / size [1]);
          this.animationDuration = duration;
        }
      }
      document.removeEventListener (core.POINTER_END, this, true);
      document.removeEventListener (core.POINTER_MOVE, this, true);
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
    var animationIn = this._transition_in, animationOut,
      setPosition, durations_tmp;
    if (order > 0)
    {
      setPosition = this._transition_out_right;
      animationOut = this._transition_out_left;
    }
    else
    {
      setPosition = this._transition_out_left;
      animationOut = this._transition_out_right;
    }
    
    durations_tmp = setPosition.durations;
    setPosition.durations = '0s';
    
    var self = this, callback = function ()
    {
      try
      {
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
        if (clb) clb.call (self._owner);
      } catch (e) { console.error (e); }
    },
    
    runAnimation = function ()
    {
      setPosition.durations = durations_tmp;
      try
      {
        toComp.show ();
        if (instant)
        {
          var inDurations = animationIn.durations;
          animationIn.durations = '0s';
          var outDurations = animationOut.durations;
          animationOut.durations = '0s';
        }
        animationIn.process (toComp, callback, self);
        animationOut.process (fromComp); 

        if (instant)
        {
          animationIn.durations = inDurations;
          animationOut.durations = outDurations;
        }
      }
      catch (e) { console.error (e); }
    };
    setPosition.process (toComp, function () {
      setTimeout (function () {runAnimation ();}, 0);
    });
  } 
});

/**
 * The duration of the animation between two views
 *
 * @name vs.fx.SlideController.ANIMATION_DURATION
 */
SlideController.ANIMATION_DURATION = 300;

/**
 * Horizontal slide (defaut)
 *
 * @name vs.fx.SlideController.HORIZONTAL
 * @const
 */
SlideController.HORIZONTAL = 0;

/**
 * Vertical slide
 *
 * @name vs.fx.SlideController.VERTICAL
 * @const
 */
SlideController.VERTICAL = 1;


/**
 * Horizontal slide (defaut)
 *
 * @name vs.fx.SlideController.POURCENTAGE
 * @const
 */
SlideController.POURCENTAGE = 0;

/**
 * Vertical slide
 *
 * @name vs.fx.SlideController.PIXEL
 * @const
 */
SlideController.PIXEL = 1;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
fx.SlideController = SlideController;
