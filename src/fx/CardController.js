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

import vs_core from 'vs_core';
import { isNumber, setElementTransform, SUPPORT_3D_TRANSFORM } from 'vs_utils';
import { addPointerListener, removePointerListener } from 'vs_gesture';

import StackController from './StackController';

/**
 *  The vs.fx.CardController class <br />
 *  @class
 *  This layer manage a list of children using a card style animation.
 *  <p />
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the card slide to left out. You can change it using the 
 *  property "direction". You can configure it with four directions:
 *  <ul>
 *    <li>vs.fx.CardController.LEFT_OUT
 *    <li>vs.fx.CardController.RIGHT_OUT
 *    <li>vs.fx.CardController.TOP_OUT
 *    <li>vs.fx.CardController.BOTTOM_OUT
 *  </ul>
 *  <p />
 *  The following example shows a typical example with panels
 *  (components 1 to 3).
 *
 *  <pre style="font-family:courier">
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡(1)ˉˉˉ⎤    ⎢ ⎡(2)ˉˉˉ⎤  ⎢
 *   ⎟      ⎢    ⎢ ⎢⎡(3)ˉ⎢ˉ⎤⎢
 *   ⎟      ⎢    ⎢ ⎢⎢    ⎢ ⎢⎢
 *   ⎟      ⎢    ⎢ ⎢⎢    ⎢ ⎢⎢
 *   ⎣______⎦    ⎢ ⎣______⎦ ⎢⎢
 *                ⎢   ⎣_______⎦⎢
 *                ⎣_____________⎦
 *
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡(2)ˉˉˉ⎤    ⎢ ⎡(3)ˉˉˉ⎤  ⎢
 *   ⎢⎡(1)ˉ⎢ˉ⎤ ⎢ ⎢       ⎢  ⎢
 *   ⎢⎢    ⎢ ⎢ ⎢ ⎢       ⎢  ⎢
 *   ⎢⎢    ⎢ ⎢ ⎢ ⎢       ⎢  ⎢
 *   ⎣______⎦ ⎢ ⎢ ⎣______⎦   ⎢
 *     ⎣______⎦  ⎢             ⎢
 *                ⎣_____________⎦
 *
 *
 *  (*) : device screen
 *  (1, ...,3) : components managed by the CardLayer
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
 *  var myController = new vs.fx.CardController (myComp);
 *  myLayer.init ();
 *
 *  myController.push ('APanel', {id: '1', data: {...}});
 *  myController.push ('APanel', {id: '2', data: {...}});
 *  myController.push ('APanel', {id: '3', data: {...}});
 *  myController.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.CardController
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.fx.CardController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 */
var CardController = vs_core.createClass ({

  parent: StackController,

  /********************************************************************
                    protected members declarations
  ********************************************************************/
  
  /**
   *
   * @protected
   * @type {number}
   */
  _direction : 0,

  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_out : null,
  
  /**
   *
   * @protected
   * @type {vs.fx.TranslateAnimation}
   */
  _transition_in : null,  

  /********************************************************************
                    Define class properties
  ********************************************************************/

  properties : {

    'direction': {
      /** 
       * Getter|Setter Card slide direction 
       * @name vs.fx.CardController#direction 
       * @type String
       */ 
      set : function (v)
      {
        var state, state_id, i = 0, pos = 0, index, transform = '';
      
        if (v !== CardController.LEFT_OUT &&
            v !== CardController.RIGHT_OUT &&
            v !== CardController.BOTTOM_OUT &&
            v !== CardController.TOP_OUT) { return; }
      
        this._direction = v;
        this._updateViewSize ();
      },
  
      /** 
       * @ignore
       * @return {String}
       */ 
      get : function ()
      {
        return this._direction;
      }
    },

    'animationDuration': {
      /** 
       * Set the animation/transition temporisation (in millisecond)
       * @name vs.fx.CardController#animationDuration 
       * @type {number}
       */ 
      set : function (v)
      {
        if (!v) { v = 0; }
        if (!isNumber (v)) { return };
      
        this._animation_duration = v;
        if (this._transition_out)
          this._transition_out.duration = this._animation_duration + 'ms';
        if (this._transition_in)
          this._transition_in.duration = this._animation_duration + 'ms';
      }
    }
  },
  
  constructor : function (owner)
  {
    this._super (owner);

    if (owner)
    {
      this._transition_out = new Animation (['translate', '${x}%,${y}%,0']);
      this._transition_out.x = 0;
      this._transition_out.y = 0;
      
      this._transition_in = new Animation (['translate', '${x}%,${y}%,0']);
      this._transition_in.x = 0;
      this._transition_in.y = 0;
  
      this.animationDuration = CardController.ANIMATION_DURATION;
    }

    this._direction = CardController.RIGHT_OUT;
  },

  /*********************************************************
   *                behavior update
   *********************************************************/
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {
    if (!this._transition_out) return;
    
    if (this._direction === CardController.LEFT_OUT)
    {
      this._transition_out.x = -100;
      this._transition_out.y = 0;
    }
    else if (this._direction === CardController.RIGHT_OUT)
    {
      this._transition_out.x = 100;
      this._transition_out.y = 0;
    }
    else if (this._direction === CardController.BOTTOM_OUT)
    {
      this._transition_out.x = 0;
      this._transition_out.y = 100;
    }
    else
    {
      this._transition_out.x = 0;
      this._transition_out.y = -100;
    }
  },

  /*********************************************************
   *                  Event management
   *********************************************************/

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
   *  var myController = new vs.fx.CardController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.CardController#push
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
      console.error ("Unknown error in vs.fx.CardController.push");
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
    var transform;
    
    if (SUPPORT_3D_TRANSFORM) transform = "translate3d";
    else transform = "translate";
    if (this._direction === CardController.LEFT_OUT)
    {
      transform += "(-100%,0";
    }
    else if (this._direction === CardController.RIGHT_OUT)
    {
      transform += "(100%,0";
    }
    else if (this._direction === CardController.BOTTOM_OUT)
    {
      transform += "(0,100%";
    }
    else
    {
      transform += "(0,-100%";
    }
    if (SUPPORT_3D_TRANSFORM) transform += ",0)";
    else transform += ")";

    comp.view.style.webkitTransitionDuration = '0';
    setElementTransform (comp.view, transform);
  },

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    var t_ok = false, state, state_before_id, state_before, transform, index;
    
    if (event.type === vs_core.POINTER_START)
    {
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.RIGHT_OUT)
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

      addPointerListener(document, vs_core.POINTER_END, this, true);
      addPointerListener(document, vs_core.POINTER_MOVE, this, true);
    }
    else if (event.type === vs_core.POINTER_MOVE)
    {
      event.preventDefault ();
      state = this.__controller__._fsm._list_of_state 
        [this.__controller__._fsm._current_state];
      index = this.__controller__._states_array.indexOf 
        (this.__controller__._fsm._current_state)
      
      if (index > 0)
      { state_before_id = this.__controller__._states_array [index-1]; }
      
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.RIGHT_OUT)
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientX - this.__pos; }
        else
        {  this.__delta = event.clientX - this.__pos; }
      
        if (SUPPORT_3D_TRANSFORM)
        { transform = "translate3d("+this.__delta+"px,0px,0)"; }
        else transform = "translate("+this.__delta+"px,0px)";
      }
      else
      {
        if (event.changedTouches)
        { this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        { this.__delta = event.clientY - this.__pos; }
      
        if (SUPPORT_3D_TRANSFORM)
        { transform = "translate3d(0px,"+this.__delta+"px,0)"; }
        else transform = "translate(0px,"+this.__delta+"px)";
      }
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.TOP_OUT)
      {
        if (this.__delta < 0)
        {
          state.comp.view.style.webkitTransitionDuration = 0;
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before =
            this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__controller__._direction === CardController.LEFT_OUT ||
                this.__controller__._direction === CardController.RIGHT_OUT)
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+(this.__delta-this._size[0])+"px,0px,0)";
              }
              else transform = 
                "translate("+(this.__delta-this._size[0])+"px,0px)";
            }
            else
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,"+(this.__delta-this._size[1])+"px,0)";
              }
              else transform = 
                "translate(0px,"+(this.__delta-this._size[1])+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration = 0;
            setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      else
      {
        if (this.__delta > 0)
        {
          state.comp.view.style.webkitTransitionDuration = 0;
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__controller__._direction === CardController.LEFT_OUT ||
                this.__controller__._direction === CardController.RIGHT_OUT)
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+(this._size[0]+this.__delta)+"px,0px,0)";
              }
              else transform = 
                "translate("+(this._size[0]+this.__delta)+"px,0px)";
            }
            else
            {
              if (SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,"+(this._size[1]+this.__delta)+"px,0)";
              }
              else transform = 
                "translate(0px,"+(this._size[1]+this.__delta)+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration = 0;
            setElementTransform (state_before.comp.view, transform);
          }
        }
      }
    }
    else if (event.type === vs_core.POINTER_END)
    {
      state = this.__controller__._fsm._list_of_state   
        [this.__controller__._fsm._current_state];
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.TOP_OUT)
      {
        if (this.__delta > 50)
        {
          t_ok = this.__controller__.goToPreviousView ();
        }
        else if (this.__delta < -50)
        {
          t_ok = this.__controller__.goToNextView ();
        }
      }
      else
      {
        if (this.__delta > 50)
        {
          t_ok = this.__controller__.goToNextView ();
        }
        else if (this.__delta < -50)
        {
          t_ok = this.__controller__.goToPreviousView ();
        }
      }
      if (!t_ok)
      {
        index = this.__controller__._states_array.indexOf (this.__controller__._fsm._current_state)
        
        if (index > 0)
        { state_before_id = this.__controller__._states_array [index-1]; }
        
        if ((this.__controller__._direction === CardController.LEFT_OUT ||
            this.__controller__._direction === CardController.TOP_OUT) &&
            this.__delta < 0)
        {
          if (SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__controller__._animation_duration + 'ms';
          setElementTransform (state.comp.view, transform);
        }
        else if ((this.__controller__._direction === CardController.RIGHT_OUT ||
            this.__controller__._direction === CardController.BOTTOM_OUT) &&
            this.__delta > 0)
        {
          if (SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__controller__._animation_duration + 'ms';
          setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (SUPPORT_3D_TRANSFORM) transform = "translate3d";
            else transform = "translate";

            if (this.__controller__._direction === CardController.LEFT_OUT)
            {
              transform = "(-100%,0px"; 
            }
            else if (this.__controller__._direction === CardController.RIGHT_OUT)
            {
              transform = "(100%,0px"; 
            }
            else if (this.__controller__._direction === CardController.BOTTOM_OUT)
            {
              transform = "(0px,100%"; 
            }
            else
            {
              transform = "(0px,-100%"; 
            }    
            if (SUPPORT_3D_TRANSFORM) transform += ",0)";
            else transform += ")";

            state_before.comp.view.style.webkitTransitionDuration =
              this.__controller__._animation_duration + 'ms';
            setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      removePointerListener(document, vs_core.POINTER_END, this, true);
      removePointerListener(document, vs_core.POINTER_MOVE, this, true);
    }
  },
  
  /**
   *  @protected
   */
  _stackAnimateComponents : function (order, fromComp, toComp, clb, instant)
  {
    var animation, setInitialPosAnimation, durations_tmp,
      compToAnimate;

    if (order > 0)
    {
      animation = this._transition_in;
      compToAnimate = toComp;
    }
    else
    {
      animation = this._transition_out;
      setInitialPosAnimation = this._transition_in;
      compToAnimate = fromComp;
    }

    if (setInitialPosAnimation)
    {
      durations_tmp = setInitialPosAnimation.durations;
      setInitialPosAnimation.durations = '0s';
    }
    var self = this, callback = function ()
    {
      fromComp.hide ();
      try
      {
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
        if (clb) clb.call (this.owner);
      }
      catch (e) {
        if (e.stack) console.log (e.stack);
        console.error (e);
      }
    },
    
    runAnimation = function ()
    {
      if (setInitialPosAnimation)
        setInitialPosAnimation.durations = durations_tmp;
      try
      {
        toComp.show ();
        if (instant)
        {
          var inDurations = animation.durations;
          animation.durations = '0s';
        }
        animation.process (compToAnimate, callback, self);

        if (instant)
        {
          animation.durations = inDurations;
        }
      }
      catch (e) {
        if (e.stack) console.log (e.stack);
        console.error (e);
      }
    };
    if (setInitialPosAnimation) setInitialPosAnimation.process (toComp, function () {
      vs_core.scheduleAction (function () {runAnimation ();});
    });
    else runAnimation ();
  } 
});

/**
 * The duration of the animation between two views
 * @name vs.fx.CardController.ANIMATION_DURATION
 */
CardController.ANIMATION_DURATION = 300;

/**
 * Left out card slide
 * @name vs.fx.CardController.LEFT_OUT
 * @const
 */
CardController.LEFT_OUT = 0;

/**
 * Right out card slide (defaut)
 * @name vs.fx.CardController.RIGHT_OUT
 * @const
 */
CardController.RIGHT_OUT = 1;

/**
 * Top out card slide
 * @name vs.fx.CardController.TOP_OUT
 * @const
 */
CardController.TOP_OUT = 2;

/**
 * Bottom out card slide
 * @name vs.fx.CardController.BOTTOM_OUT
 * @const
 */
CardController.BOTTOM_OUT = 3;

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default CardController;
