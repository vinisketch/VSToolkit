define(['exports', 'vs_core', 'vs_utils', 'vs_gesture', 'vs_ui'], function (exports, vs_core, vs_utils, vs_gesture, vs_ui) { 'use strict';

vs_core = vs_core && vs_core.hasOwnProperty('default') ? vs_core['default'] : vs_core;
var vs_ui__default = 'default' in vs_ui ? vs_ui['default'] : vs_ui;

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
 *  The Generic vs.fx.Controller class
 *
 *  @see vs.fx.SwipeController
 *  @see vs.fx.CardController
 *  @see vs.fx.NavigationController
 *  @extends vs.core.EventSource
 *
 *  @class
 *  This class can be used to implement your custom GUI controller.
 *  <p/>
 *  Before developing your own controller you can try the SwipeController
 *  or the NavigationController witch match most situations.
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
 *  Example:
 *  <pre class="code">
 * 
 *   // 1 create and init the controller
 *   this.controller = new vs.fx.Controller (this);
 *   this.controller.init ();
 *   
 *   // 2.1 put a first view into the controller
 *   this.controller.add (this.firstView);
 *   // 2.2 set the first view as the initial view
 *   this.controller.initialComponent = this.firstView.id;
 *  
 *   // 3.1 create, configure and put the second view into the controller
 *   var comp = this.createAndAddComponent ('PanelOne');
 *   comp.position = [0, 44];
 *   comp.translation = [320, 0];
 *   this.controller.add (comp);
 *   
 *   // 3.2 declare transitions (with animations) between states
 *   // translateOutLeft is play on firstView when we leave the firstView
 *   // translateInRight is play on comp when we enter into comp
 *   this.controller.addTransition (this.firstView.id, comp.id, 'goToOne',
 *                                  translateOutLeft, translateInRight);
 *   this.controller.addTransition (comp.id, this.firstView.id, 'back',
 *                                  translateOutRight, translateInLeft);
 *  
 *   // 4 create, configure and put the third view into the controller
 *   comp = this.createAndAddComponent ('PanelTwo');
 *   comp.position = [0, 44];
 *   comp.translation = [320, 0];
 *   this.controller.add (comp);
 *   
 *   this.controller.addTransition (this.firstView.id, comp.id, 'goToTwo',
 *                                  translateOutLeft, translateInRight);
 *   this.controller.addTransition (comp.id, this.firstView.id, 'back',
 *                                  translateOutRight, translateInLeft);
 *  
 *   // 5 create, configure and put the fourth view into the controller
 *   var comp = this.createAndAddComponent ('PanelThree');
 *   comp.position = [0, 44];
 *   comp.translation = [320, 0];
 *   this.controller.add (comp);
 *   
 *   this.controller.addTransition (this.firstView.id, comp.id, 'goToThree',
 *                                  translateOutLeft, translateInRight);
 *   this.controller.addTransition (comp.id, this.firstView.id, 'back',
 *                                  translateOutRight, translateInLeft);
 *  
 *  </pre>
 *  @author David Thevenin
 * @name vs.fx.Controller
 *
 *  @constructor
 *   Creates a new vs.fx.Controller.
 *
 * @param {vs.ui.View} owner the View using this controller [mandatory]
 */
function Controller$1 (owner)
{
  this.parent = vs_core.EventSource;
  this.parent ();
  this.constructor = Controller$1;

  if (owner)
  {
    this._fsm = new vs_core.Fsm (this);
  
    // fsm goTo surcharge
    this._fsm.goTo = this.goTo;
    this._owner = owner;
  }
}

Controller$1.prototype = {

   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

   /**
   * @protected
   * @type {Object}
   */
  _owner: null,

   /**
   * @protected
   * @type {vs.core.Fsm}
   */
  _fsm: null,

   /**
   * @protected
   * @type {String}
   */
  _initial_component: null,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (this._owner)
    {
      this._owner.__controller__ = undefined;
      
      this._owner.remove = this._owner._ab_controller_remove;
      this._owner._ab_controller_remove = undefined;
    }
    
    this._delegate = undefined;

    vs_utils.free (this._fsm);
    vs_core.EventSource.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    vs_core.EventSource.prototype.initComponent.call (this);

    if (this._fsm) this._fsm.init ();
    
    if (!this._owner)
    {
      console.error ("Invalid vs.fx.Controller, owner is null vs.fx.Controller.id = '" + this._id + "'");
      return;
    }
    if (this._owner.__controller__)
    {
      console.error ("The owner already use a controller");
      return;
    }
    this._owner.__controller__ = this;
    
    this._owner._ab_controller_remove = this._owner.remove;
    this._owner.remove = this.ab_controller_remove;
  },
  

/*********************************************************
 *                 behavior update
 *********************************************************/
  
  /**
   * @protected
   * @function
   */
  ab_controller_remove : function (child)
  {
    if (!child) { return; }
    
    state = this.__controller__._fsm._list_of_state [child.id];
    if (state)
    {
      this.__controller__.remove (child);
    }
    else
    {
      this._ab_controller_remove (child);
    }
    // XXX should remove the component from the FSM etc...
  },

/*********************************************************
 *                  State Management
 *********************************************************/
 
  /**
   *  Return true if the state already exists
   *
   * @name vs.fx.Controller#isStateExit
   * @function
   * 
   * @return boolean
   */
  isStateExit : function (id)
  {
    if (!this._fsm) return false;
    
    if (this._fsm._list_of_state [id])
    { return true; }
    
    return false;
  },
 
  /**
   * @private
   * @function
   * @deprecated
   */
  add : function (comp, data, extension, bindings)
  {
    console.warn ('vs.fx.Controller.add is deprecated. Use vs.fx.Controller.push'); 
    return this.push (comp, data, extension, bindings);
  },

  /**
   *  Add the a child component to the Controller Manager
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  The component instantiation is a lazy algorithm. The component will
   *  be instantiated and add into the DOM tree only when it has to be show
   *  to the user.
   *  <p>
   *  @example
   *  var myComp = new MyComp (conf);
   *  myComp.layer = new vs.fx.Controller (myComp);
   *  myComp.layer.push ('AComponent1', data1);
   *  myComp.layer.push ('AComponent1', data2);
   *  myComp.layer.push ('AComponent2', data3);
   *
   * @name vs.fx.Controller#push
   * @function
   *
   * @param {String | vs.ui.View} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} config Configuration structure need to build the 
   *     component [optional]
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, extension, bindings)
  {
    if (!comp || !this._fsm) { return; }
    if (!data) { data = {}; }
    
    var state_id = null, binding, i, state;
    if (vs_utils.isString (comp) && data.id)
    { state_id = data.id; }
    else if (!vs_utils.isString (comp) && comp.id)
    { state_id = comp.id; }
    else { state_id = vs_core.createId (); }
    
    if (this.isStateExit (state_id))
    { return; }
    
    this._fsm.addState (state_id);
    state = this._fsm._list_of_state [state_id];
    state.bindings = {};
    
    if (bindings && bindings.length)
    {
      for (i = 0; i < bindings.length; i++)
      {
        binding = bindings [i];
        if (!binding || binding.length !== 3)
        {
          console.warn ('vs.fx.Controller.push: invalid binding information');
          continue;
        }
        this.componentBind (state_id, binding[0], binding[1], binding[2]);
      }
    }
    
    this.setStateComponentInformation (state_id, comp, extension, data);
    
    return state_id;
  },

  /**
   *  Remove a child component to the Slider Manager
   *  <p>
   *  The component can be specified as an Object or an id.
   *  <p>
   *  @example
   *  layer.remove (myComp);
   *  layer.remove (myComp.id);
   *
   * @name vs.fx.Controller#remove
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component id
   */
  remove : function (comp)
  {
    if (!comp || !this._owner || !this._fsm) { return; }
    
    var state_id = null;
    if (vs_utils.isString (comp))
    { state_id = comp; }
    else if (!vs_utils.isString (comp))
    { state_id = comp.id; }
    
    var state = this._fsm._list_of_state [state_id];
    if (state && state.comp)
    {
      this._owner._ab_controller_remove (state.comp);
    }
    this._fsm.removeState (state_id);
  },

  /**
   * Set the component associated to a state
   *
   * @name vs.fx.Controller#setStateComponentInformation
   * @function
   *
   * @private
   * @param {String} state_id the state's name 
   * @param {{String | vs.ui.View}} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} init_data Optional data for the component 
   *                   constructor [optional]
   */
  setStateComponentInformation : function (state_id, comp, extension, init_data)
  {
    if (!state_id || !this._fsm || !this._fsm.existState (state_id)) { return; }
    if (!comp || !this._owner) { return; }
    
    if (!init_data) { init_data = {}; }
    else { init_data = vs_utils.clone (init_data); }
    
    var state = this._fsm._list_of_state [state_id];
    state.init_data = init_data;
    
    if (vs_utils.isString (comp))
    {
      state.comp_name = comp;
      state.comp = undefined;
    }
    else
    {
      state.comp_name = "";
      state.comp = comp;
      if (!this._owner.isChild (comp))
      {
        this._owner.add (comp, extension);
      }
    }
  },

/*********************************************************
 *                  Animation setting
 *********************************************************/

  /**
   *   Add a new transition from the view "from" to the view "to".
   *
   * @name vs.fx.Controller#addTransition
   * @function
   *
   * @param {String} from State from (component id)
   * @param {String} to State to (component id)
   * @param {String} on the input event name which cause the crossing of 
   *      transition
   * @param {vs.fx.Animation} animation_out the animation when exit from the
   *         state from. [optional]
   * @param {vs.fx.Animation} animation_in the animation when enter in the
   *         state to. [optional]
   */
  addTransition : function (from, to, on, animation_out, animation_in)
  {
    var key, t;
        
    if (!from || !this._fsm || !this._fsm.existState (from)) { return; }
    if (!to || !this._fsm.existState (to)) { return; }
    if (!on) { return; }
    
    if (!this._fsm.existInput (on))
    {
      this._fsm.addInput (on);
    }
    
    this._fsm.addTransition (from, to, on);

    for (key in this._fsm._list_of_state [from].transitionEvents)
    {
      t = this._fsm._list_of_state [from].transitionEvents [key];
      if (t.to !== to) { continue; }
      
      t.animation_out = animation_out;
      t.animation_in = animation_in;
    }
  },
  
  /**
   *  @private
   */
  _animateComponents :
    function (fromComp, toComp, animationOut, animationIn, animation_clb, instant)
  {
    var self = this, callback = function ()
    {
      try
      {
        if (animation_clb)
        {
          animation_clb.call (self._owner);
        }
        if (self._delegate && self._delegate.animationDidEnd)
        {
          console.warn ("animationDidEnd is deprecated. Please use 'controllerAnimationDidEnd'.");
          self._delegate.animationDidEnd (self);
        }
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
      }
      catch (e) {
        if (e.stack) console.log (e.stack);
        console.error (e); 
      }
    },
    runAnimation = function ()
    {
      try
      {
        toComp.show ();
        if (!animationIn && !animationOut)
        {
          callback.call (self);
          return;
        }
        if (instant)
        {
          if (animationIn)
          {
            var inDurations = animationIn.durations;
            animationIn.durations = '0s';
          }
          if (animationOut)
          {
            var outDurations = animationOut.durations;
            animationOut.durations = '0s';
          }
        }
        if (animationIn && !animationOut)
        {
          animationIn.process (toComp, callback, self);
        }
        else if (!animationIn && animationOut)
        {
          animationOut.process (fromComp, callback, self);
        }
        else
        {
          if (animationIn) animationIn.process (toComp, callback, self);
          if (animationOut) animationOut.process (fromComp); 
        }
        if (instant)
        {
          if (animationIn) animationIn.durations = inDurations;
          if (animationOut) animationOut.durations = outDurations;
        }
      }
      catch (e) {
        if (e.stack) console.log (e.stack);
        console.error (e);
      }
    };
    vs_core.scheduleAction (function () {runAnimation ();});
  },


/*********************************************************
 *                 Component Event management
 *********************************************************/
 
  /**
   *  The event bind method to listen events
   *  <p>
   *  When you want listen an event generated by a component, you can
   *  bind your object (the observer) to this object using 'componentBind' 
   *  method.
   *
   * @name vs.fx.Controller#componentBind
   * @function
   *
   * @param {string} comp_id the component id [mandatory]
   * @param {string} spec the event specification [mandatory]
   * @param {vs.core.Object} obj the object interested to catch the event [mandatory]
   * @param {string} func the name of a callback. If its not defined
   *        notify method will be called [optional]
   */
  componentBind: function (comp_id, event, obj, func)
  {
    if (!this._fsm) return;
    
    var state = this._fsm._list_of_state [comp_id], a;
    
    if (!state) { return; }
    
    a = state.bindings [event];
    if (!a)
    {
      a = [];
      state.bindings [event] = a;
    }
    
    a.push ([obj, func]);
    if (comp_id === this._current_state)
    {
      state.comp.bind (event, obj, func);
    }
  },
  
  /**
   * @protected
   * @function
   */
  refresh: function ()
  {},

/*********************************************************
 *                 FSM management
 *********************************************************/
 
  /**
   * returns the currents state_id which is the current visible
   * component id.
   *
   * @name vs.fx.Controller#getCurrentState
   * @function
   *
   * @return {string} the current state id
   */
  getCurrentState : function ()
  {
    if (!this._fsm) return;
    
    return this._fsm._current_state;
  },
 
  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
  },

  /**
   * @protected
   * @function
   */
  _beforeStateEnter : function (state, data)
  {
    if (!state || !(state.comp_name || state.comp)) { return; }
    
    var spec, events, i, key, e, new_data;
  
    ////////////////////////////////////////////////////
    // 1) build the component if its need
    if (!state.comp)
    {
      state.comp = this._owner.createAndAddComponent
        (state.comp_name, state.init_data, state.extension);
        
      state.comp.configure (state.init_data);
      if (state.comp && state.comp.propertiesDidChange) 
      { 
        state.comp.propertiesDidChange ();
      }
      state.comp.propertyChange ();
      this.configureNewComponent (state.comp);
    }
    
    ////////////////////////////////////////////////////
    // 2) data adaptation and init
    new_data = data;
    // 2.1) data adaptation
    if (state.data_adaptation_func)
    {
      new_data = state.data_adaptation_func (data);
    }
    // 2.2) component data init
    if (new_data)
    {
      // 2.2.1) set data
      for (key in new_data)
      {
        if (!state.comp.__lookupSetter__ (key) &&
            !state.comp.hasOwnProperty (key))
        {
          continue;
        }
        state.comp [key] = new_data [key];
      }
      
      // 2.2.1) dataflow propagation
      state.comp.propertyChange ();
    }
    
    ////////////////////////////////////////////////////
    // 3) events binding
    for (spec in state.bindings)
    {
      events = state.bindings [spec];
      if (!events) { continue; }
      
      for (i = 0; i < events.length; i ++)
      {
        e = events [i];
        if (!e) { continue; }
        if (e[1]) { state.comp.bind (spec, e[0], e[1]); }
        else { state.comp.bind (spec, e[0]); }
      }
    }
  },

  /**
   * @protected
   * @function
   */
  _beforeStateExit : function (state)
  {
    if (!state || !state.comp) { return; }
    
    var spec, events, i, e;
      
    ////////////////////////////////////////////////////
    // 1) events unbinding
    for (spec in state.bindings)
    {
      events = state.bindings [spec];
      if (!events) { continue; }
      
      for (i = 0; i < events.length; i ++)
      {
        e = events [i];
        if (!e) { continue; }
        if (e[1]) { state.comp.unbind (spec, e[0], e[1]); }
        else { state.comp.bind (spec, e[0]); }
      }
    }
  },

  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.fx.Controller#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   * @param {Boolean} instant make the transition visualy instantly [Optional]
   * @return {Boolean} is the transition was reached or not
   */
  goTo : function (state_id, output, event, instant)
  {
    // manage output
    // TODO WARNING
    var state_from, state_to, transition = null;
    
    if (!state_id || !this._list_of_state [state_id])
    {
      console.warn ("vs.fx.Controller.goTo unknown State id:" + state_id);
      return false;
    }

    // hide old states view
    if (this._current_state)
    {
      if (event)
      {
        transition =
          this._list_of_state [this._current_state].transitionEvents [event.on];
      }
      state_from = this._list_of_state [this._current_state];
      this.owner._beforeStateExit (state_from);
    }
    
    ///
    this._current_state = state_id;
    
    // show new states view
    state_to = this._list_of_state [this._current_state];
    this.owner._beforeStateEnter (state_to, event?event.data:null);
    
    if (state_from && state_from.comp && state_from.comp.viewWillDisappear)
    {
      state_from.comp.viewWillDisappear ();
    }
    if (state_to.comp.viewWillAppear)
    {
      state_to.comp.viewWillAppear ();
    }
    
    if (transition)
    {
      this.owner._animateComponents (
        state_from.comp, state_to.comp,
        transition.animation_out, transition.animation_in,
        null, instant);
    }
    else
    {
      state_to.comp.show ();
    }
    
    if (this.owner._delegate && this.owner._delegate.controllerViewWillChange)
    {
      if (state_from)
      {
        this.owner._delegate.controllerViewWillChange
          (state_from.comp, state_to.comp, this.owner);
      }
      else
      {
        this.owner._delegate.controllerViewWillChange
          (null, state_to.comp, this.owner);
      }
    }

    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (vs_utils.isFunction (clb))
      {
        clb.call (this._owner, event);
      }
      else if (vs_utils.isString (clb))
      {
        this._owner [this._output_action [output]] (event);
      }
    }
    
    return true;
  },

  /**
   * @protected
   * @function
   */
  notify : function (event, instant)
  {
    if (!this._fsm || !event || !event.type) { return; }
    this._fsm.fsmNotify (event.type, event.data, instant);
  },

/*********************************************************
 *                  Controller clear
 *********************************************************/

  /**
   * Clear the vs.fx.Controller.
   * All state, event and binding are deleted
   *
   * @name vs.fx.Controller#clear
   * @function
   */
  clear : function ()
  {
    if (!this._fsm) return;
    
    this._fsm.clear ();
  }
};
vs_utils.extendClass(Controller$1, vs_core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (Controller$1, {
  'initialComponent': {
    /*****************************************************************
     *     Properties declaration
     ****************************************************************/
  
    /**
     * Define the initiale component
     * Generate a exception if the component was not already registered
     *
     * @name vs.fx.Controller#initialComponent 
     * @param {string} state_id the state
     */
    set : function (comp_id)
    {
      if (!this._fsm || !comp_id)
      {
        this._initial_component = undefined;
        return;
      }
     
      if (!this._fsm.existState (comp_id)) { return; }
  
      // set initial state and go to it   
      this._initial_component = comp_id;
      this._fsm.initialState = comp_id;
      
      this._fsm.goTo (comp_id);
    },
    
    /**
     * @ignore
     */
    get : function ()
    {
      return this._initial_component;
    }
  },
  'delegate': {
  
    /** 
     * Set the delegate.
     * It should implements following methods
     * <ul>
     *   <li/>controllerViewWillChange :function
     *           (from vs.ui.View, to vs.ui.View, controller),
     *           Called when the view changed
     *   <li/>controllerAnimationDidEnd : function
     *           (from vs.ui.View, to vs.ui.View, controller), Called just after 
     *         the animation ended
     * </ul>
     *
     * @name vs.fx.Controller#delegate 
     * @type {Object}
     */ 
    set : function (v)
    {
      this._delegate = v;
    }
  }
});

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
 *  The vs.fx.StackController class <br />
 * 
 *  @see vs.fx.SwipeController
 *  @see vs.fx.CardController
 *
 *  @extends vs.fx.Controller
 *  @class
 *  The vs.fx.StackController class <br />
 *  This an abstract layer controller and it should no be instanciated.
 *  Use {@link vs.fx.SliderController} or {@link vs.fx.CardController} layers.
 *  @abstract
 * 
 *  @author David Thevenin
 * @name vs.fx.StackController
 *
 *  @constructor
 *   Creates a new vs.fx.StackController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.fx.View will be inserted. 
 *     ['children' by default]
 */
function StackController (owner)
{
  this.parent = Controller$1;
  this.parent (owner);
  this.constructor = StackController;
  
  if (!arguments.length) return;

  this._fsm.addInput (StackController.NEXT);
  this._fsm.addInput (StackController.PRED);
  this._fsm.addInput (StackController.FIRST);

  this._states_array = new Array ();
}

/**
 * The duration of the animation between two views
 * @name vs.fx.StackController.ANIMATION_DURATION
 */
StackController.ANIMATION_DURATION = 350;

/**
 * @private
 * @name vs.fx.StackController.NEXT
 * @const
 */
StackController.NEXT = 'next';

/**
 * @private
 * @name vs.fx.StackController.PRED
 * @const
 */
StackController.PRED = 'pred';

/**
 * @private
 * @name vs.fx.StackController.FIRST
 * @const
 */
StackController.FIRST = 'first';

/**
 * @private
 * @name vs.fx.StackController.LAST
 * @const
 */
StackController.LAST = 'last';

StackController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/

  /**
   * @protected
   * @function
   */
  _is_tactile : false,

  /**
   * @protected
   * @function
   */
  _owner_handler_event_extended : false,

  /**
   * @protected
   * @function
   */
  _owner_handler_event : null,

  /**
   * @protected
   * @function
   */
  _animation_duration: StackController.ANIMATION_DURATION, 
  
  /**
   * @protected
   * @function
   */
  _last_comp_id : null,
  
  /**
   * @protected
   * @function
   */
  _states_array : null,
  
  /**
   * @protected
   * @type {number}
   */
  __nb_panels : 0,

  /**
   *
   * @protected
   * @type {Array}
   */
  _view_size: null,
  
/********************************************************************

********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    delete (this._states_array);
    
    Controller$1.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    Controller$1.prototype.initComponent.call (this);
    
    this.isTactile = this._is_tactile;
    this._updateViewSize ();
  },
  

/********************************************************************

********************************************************************/

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
   *  var myController = new vs.fx.StackController (this | myView);
   *  myController.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.fx.StackController#push
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
    
    var state_id = Controller$1.prototype.push.call
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
    if (this._last_comp_id === this._initial_state)
    {
      state = this._fsm._list_of_state [state_id];
      if (!state)
      {
        console.error ("Unknown error in vs.fx.StackController.push");
        return;
      }
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
    }
    
    this._last_comp_id = state_id;
    return state_id;
  },
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {},

  /**
   *  Remove a child component to the Slider Manager
   *  <p>
   *  The component can be specified as an Object or an id.
   *  <p>
   *  @example
   *  myComp.layer.remove (myComp);
   *  myComp.layer.remove (myComp.id);
   *
   * @name vs.fx.StackController#remove
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component id
   */
  remove : function (comp)
  {
    if (!comp) { return; }
    
    var state_id = null;
    if (vs_utils.isString (comp))
    { state_id = comp; }
    else if (!vs_utils.isString (comp))
    { state_id = comp.id; }
    
    var pos = this._states_array.findItem (state_id);
    if (pos === -1) { return; }
    
    this._fsm.removeTransitionTo (state_id, StackController.NEXT);
    this._fsm.removeTransitionFrom (state_id, StackController.PRED);
    this._fsm.removeTransitionFrom (state_id, StackController.FIRST);

    this._states_array.remove (pos);

    this.__nb_panels --; 
    var state = this._fsm._list_of_state [state_id];
    
    if (pos === 0 && this.__nb_panels > 0)
    {
      this._initial_component = this._states_array [0];
      
      // re configure all to FIRST transition
      for (var state_id_temp in this._states_array)
      {
        if (state_id_temp === state_id) { continue; }
        if (state_id_temp === this._initial_component) { continue; }

        this._fsm.removeTransitionFrom (state_id_temp, StackController.FIRST);
        this.addTransition
          (state_id_temp, this._initial_component, StackController.FIRST);
      }
    }
    if (this.__nb_panels === 0)
    {
      this._initial_component = undefined;
      this._fsm._current_state = undefined;
    }
    
    if (this._initial_component)
    {
      if (this._fsm._current_state === state_id)
      {
        if (pos === 0)
        {
          this._fsm.goTo (this._initial_component);
        }
        else
        {
          if (pos === this._states_array.length) { pos --; }
          this._fsm.goTo (this._states_array [pos]);
        }
      }
      else
      {
        this._fsm.goTo (this._fsm._current_state);
      }
    }
    Controller$1.prototype.remove.call (this, comp);
  },

  /**
   * @protected
   * @function
   *
   * @param {number} orientation = {0, 180, -90, 90}
   */
  orientationDidChange: function (orientation)
  { 
    this._updateViewSize ();
  },

/*********************************************************
 *                  Event management
 *********************************************************/
  
  /**
   * Go to the view specified by its id if it exist.
   *
   * @name vs.fx.StackController#goToViewId
   * @function
   * 
   * @param {String} id The state id (component id)
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   */
  goToViewId : function (id, clb, instant)
  {
    var pos = this._states_array.findItem (id);
    if (pos === -1) { return false; }
    
    this.goToViewAt (pos, clb, instant);
  },

  /**
   *  Go to the view specified by its position (index start at 0)
   *
   * @name vs.fx.StackController#goToViewAt
   * @function
   *
   * @param {number} index The component index
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   */
  goToViewAt : function (pos, clb, instant)
  {
    if (pos < 0) { return false; }
    if (pos > this._states_array.length) { return false; }
    
    var current_pos = this._states_array.findItem (this._fsm._current_state);
    if (current_pos === pos) { return true; }
    
    var state_from = this._fsm._list_of_state [this._fsm._current_state];
    if (pos > current_pos)
    {
      while (current_pos < pos - 1)
      {
        this._fsm.fsmNotify (StackController.NEXT, null, true);
        current_pos ++;
      }
      this._fsm.fsmNotify (StackController.NEXT, null, true);
      
      var state_to = this._fsm._list_of_state [this._fsm._current_state];
      this._stackAnimateComponents (1, state_from.comp, state_to.comp, clb, instant);
    }
    else
    {
      while (pos + 1 < current_pos )
      {
        this._fsm.fsmNotify (StackController.PRED, null, true);
        current_pos --;
      }
      this._fsm.fsmNotify (StackController.PRED, null, true);

      var state_to = this._fsm._list_of_state [this._fsm._current_state];
      this._stackAnimateComponents (-1, state_from.comp, state_to.comp, clb, instant);
    }
  },

  /**
   *  @protected
   */
  _stackAnimateComponents : function (order, fromComp, toComp, clb, instant)
  {},
  
  /**
   *  do nothing, will be managed by _stackAnimateComponents
   *  @protected
   */
  _animateComponents :
    function (fromComp, toComp, animationOut, animationIn, animation_clb, instant)
  {},
  
  /**
   * Go to the next view if it exist.
   *
   * @name vs.fx.StackController#goToNextView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToNextView : function (clb, instant)
  {
    var state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.fsmNotify (StackController.NEXT, null, true),
      state_to = this._fsm._list_of_state [this._fsm._current_state];

    if (r) this._stackAnimateComponents (1, state_from.comp, state_to.comp, clb, instant);
    return r;
  },

  /**
   * Go to the previous view if it exist.
   *
   * @name vs.fx.StackController#goToPreviousView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible, false if not (no view exists)
   */
  goToPreviousView : function (clb, instant)
  {
    var state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.fsmNotify (StackController.PRED, null, true),
      state_to = this._fsm._list_of_state [this._fsm._current_state];

    if (r) this._stackAnimateComponents (-1, state_from.comp, state_to.comp, clb, instant);
    return r;
  },

  /**
   * Go to the first view
   *
   * @name vs.fx.StackController#goToFirstView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible
   */
  goToFirstView : function (clb, instant, order)
  {
    var state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.fsmNotify (StackController.FIRST, null, true),
      state_to = this._fsm._list_of_state [this._fsm._current_state];

    if (r) this._stackAnimateComponents (order?order:-1, state_from.comp, state_to.comp, clb, instant);
    return r;
  },


  /**
   * Go to the last first
   *
   * @name vs.fx.StackController#goToLastView
   * @function
   * 
   * @param {Function} clb a function reference, will be called at the end
   *                   of transition
   * @param {boolean} instant Force a transition without animation
   * @return true if the transition is possible
   */
  goToLastView : function (clb, instant, order)
  {
    var
      state_from = this._fsm._list_of_state [this._fsm._current_state],
      r = this._fsm.goTo (
        this._last_state, null, {
          on: StackController.LAST,
          data: null
        }, instant),
      state_to = this._fsm._list_of_state [this._fsm._current_state];
    

    if (r) this._stackAnimateComponents (order?order:1, state_from.comp, state_to.comp, clb, instant);
    return r;
  },

  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {}
};
vs_utils.extendClass (StackController, Controller$1);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (StackController, {

  'viewSize': {
   /** 
     * Getter|Setter for view size.
     * @name vs.fx.StackController#viewSize 
     *
     * @type {Array.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!vs_utils.isArray (v) || v.length !== 2) { return; }
      if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber(v[1])) { return; }
      
      if (!this._view_size)
      { this._view_size = []; }
      
      this._view_size [0] = v [0];
      this._view_size [1] = v [1];
      
      this._updateViewSize ();
    },
  
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (!this._view_size)
      {
        return this._owner.size;
      }
      return this._view_size.slice ();
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
          this._owner_handler_event = this._owner.handleEvent;
          this._owner.handleEvent = this.handleEvent;
          vs_gesture.addPointerListener (this._owner.view, vs_core.POINTER_START, this._owner, false);
        }
        this._owner_handler_event_extended = true;
      }
      else
      {
        this._is_tactile = false;
        if (!this._owner || !this._owner.view) return;
        
        if (this._owner_handler_event_extended)
        {
          vs_gesture.removePointerListener(this._owner.view, vs_core.POINTER_START, this._owner, false);
          this._owner.handleEvent = this._owner_handler_event;
          
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
  'animationDuration': {
    /** 
     * Set the animation/transition temporisation (in millisecond)
     * @name vs.fx.StackController#animationDuration 
     * @type {number}
     */ 
    set : function (time)
    {
      if (!time) { time = 0; }
      if (!vs_utils.isNumber (time)) { return }
      
      this._animation_duration = time;
    }
  }
});

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
        if (!vs_utils.isNumber (v)) { return }
      
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
    
    if (vs_utils.SUPPORT_3D_TRANSFORM) transform = "translate3d";
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
    if (vs_utils.SUPPORT_3D_TRANSFORM) transform += ",0)";
    else transform += ")";

    comp.view.style.webkitTransitionDuration = '0';
    vs_utils.setElementTransform (comp.view, transform);
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

      vs_gesture.addPointerListener(document, vs_core.POINTER_END, this, true);
      vs_gesture.addPointerListener(document, vs_core.POINTER_MOVE, this, true);
    }
    else if (event.type === vs_core.POINTER_MOVE)
    {
      event.preventDefault ();
      state = this.__controller__._fsm._list_of_state 
        [this.__controller__._fsm._current_state];
      index = this.__controller__._states_array.indexOf 
        (this.__controller__._fsm._current_state);
      
      if (index > 0)
      { state_before_id = this.__controller__._states_array [index-1]; }
      
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.RIGHT_OUT)
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientX - this.__pos; }
        else
        {  this.__delta = event.clientX - this.__pos; }
      
        if (vs_utils.SUPPORT_3D_TRANSFORM)
        { transform = "translate3d("+this.__delta+"px,0px,0)"; }
        else transform = "translate("+this.__delta+"px,0px)";
      }
      else
      {
        if (event.changedTouches)
        { this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        { this.__delta = event.clientY - this.__pos; }
      
        if (vs_utils.SUPPORT_3D_TRANSFORM)
        { transform = "translate3d(0px,"+this.__delta+"px,0)"; }
        else transform = "translate(0px,"+this.__delta+"px)";
      }
      if (this.__controller__._direction === CardController.LEFT_OUT ||
          this.__controller__._direction === CardController.TOP_OUT)
      {
        if (this.__delta < 0)
        {
          state.comp.view.style.webkitTransitionDuration = 0;
          vs_utils.setElementTransform (state.comp.view, transform);
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
              if (vs_utils.SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+(this.__delta-this._size[0])+"px,0px,0)";
              }
              else transform = 
                "translate("+(this.__delta-this._size[0])+"px,0px)";
            }
            else
            {
              if (vs_utils.SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,"+(this.__delta-this._size[1])+"px,0)";
              }
              else transform = 
                "translate(0px,"+(this.__delta-this._size[1])+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration = 0;
            vs_utils.setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      else
      {
        if (this.__delta > 0)
        {
          state.comp.view.style.webkitTransitionDuration = 0;
          vs_utils.setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__controller__._direction === CardController.LEFT_OUT ||
                this.__controller__._direction === CardController.RIGHT_OUT)
            {
              if (vs_utils.SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+(this._size[0]+this.__delta)+"px,0px,0)";
              }
              else transform = 
                "translate("+(this._size[0]+this.__delta)+"px,0px)";
            }
            else
            {
              if (vs_utils.SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,"+(this._size[1]+this.__delta)+"px,0)";
              }
              else transform = 
                "translate(0px,"+(this._size[1]+this.__delta)+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration = 0;
            vs_utils.setElementTransform (state_before.comp.view, transform);
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
        index = this.__controller__._states_array.indexOf (this.__controller__._fsm._current_state);
        
        if (index > 0)
        { state_before_id = this.__controller__._states_array [index-1]; }
        
        if ((this.__controller__._direction === CardController.LEFT_OUT ||
            this.__controller__._direction === CardController.TOP_OUT) &&
            this.__delta < 0)
        {
          if (vs_utils.SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__controller__._animation_duration + 'ms';
          vs_utils.setElementTransform (state.comp.view, transform);
        }
        else if ((this.__controller__._direction === CardController.RIGHT_OUT ||
            this.__controller__._direction === CardController.BOTTOM_OUT) &&
            this.__delta > 0)
        {
          if (vs_utils.SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__controller__._animation_duration + 'ms';
          vs_utils.setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__controller__._fsm._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (vs_utils.SUPPORT_3D_TRANSFORM) transform = "translate3d";
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
            if (vs_utils.SUPPORT_3D_TRANSFORM) transform += ",0)";
            else transform += ")";

            state_before.comp.view.style.webkitTransitionDuration =
              this.__controller__._animation_duration + 'ms';
            vs_utils.setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      vs_gesture.removePointerListener(document, vs_core.POINTER_END, this, true);
      vs_gesture.removePointerListener(document, vs_core.POINTER_MOVE, this, true);
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
 *  The vs.fx.CubicController class <br />
 *  @class
 *  This layer manage a list of children using a card layout.
 *  <p />
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the slider is horizontal, but you can change it using the 
 *  property "orientation".
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
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller), Called when the view
 *        changed
 *  </ul>
 *  <p>
 *  @example
 *  theApplicatioin.layer = new vs.fx.CubicController (myComp);
 *
 *  myComp.layer.push ('APanel', {id: '1', data: {...}});
 *  myComp.layer.push ('APanel', {id: '2', data: {...}});
 *  myComp.layer.push ('APanel', {id: '3', data: {...}});
 *  myComp.layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.View.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 */
function CubicController (owner, extension)
{
  this.parent = StackController;
  this.parent (owner, extension);
  this.constructor = CubicController;
  
  if (owner) owner.setStyle ('-webkit-transform-style', 'preserve-3d');
  
/********************************************************************
                  setter and getter declarations
********************************************************************/
}

CubicController._translate_animation = new vs_ui.RotateXYZAnimation (-90,0,0);
CubicController._translate_animation.init ();
CubicController._translate_animation.addKeyFrame ('from', {degX:0});
CubicController._translate_animation.addKeyFrame (50, {degX:-92});
CubicController._translate_animation.addKeyFrame (70, {degX:-84});
CubicController._translate_animation.addKeyFrame (80, {degX:-90});
CubicController._translate_animation.addKeyFrame (95, {degX:-88});
CubicController._translate_animation.durations = "2s";

/**
 * Horizontal slide (defaut)
 * @const
 */
CubicController.HORIZONTAL = 0;

/**
 * Vertical slide
 * @const
 */
CubicController.VERTICAL = 1;


CubicController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/
  
  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : CubicController.HORIZONTAL,

/********************************************************************

********************************************************************/
  
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
   *  var myComp = new MyComp (conf);
   *  myComp.layer = new vs.fx.StackController (myComp, 'children');
   *  myComp.layer.push ('AComponent1', data1);
   *  myComp.layer.push ('AComponent1', data2);
   *  myComp.layer.push ('AComponent2', data3);
   *
   * @name vs.fx.CubicController#push
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the component.
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, bindings)
  {
    if (!comp) { return; }
    
    if (!vs_utils.isString (comp))
    {
      var index = this._states_array.length;
      comp.position = [0, 0];
      comp.setStyle ('z-index', 1000 - index);
    }
    return StackController.prototype.push.call
      (this, comp, data, bindings);
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
    var t_ok = false, state, state_before_id, state_before, transform, index;
    
    if (event.type === vs_core.POINTER_START)
    {
      if (this.__layer._orientation === CubicController.HORIZONTAL)
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

      vs_gesture.addPointerListener(document, vs_core.POINTER_END, this, true);
      vs_gesture.addPointerListener(document, vs_core.POINTER_MOVE, this, true);
      
      this.animationDuration = 0;
    }
    else if (event.type === vs_core.POINTER_MOVE)
    {
      event.preventDefault ();
      state = this.__layer._list_of_state [this.__layer._current_state];
      index = this.__layer._states_array.indexOf (this.__layer._current_state);
      
      if (index > 0) { state_before_id = this.__layer._states_array [index-1]; }
      
      if (this.__layer._orientation === CubicController.HORIZONTAL)
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientX - this.__pos; }
        else
        {  this.__delta = event.clientX - this.__pos; }
      
        if (vs_utils.SUPPORT_3D_TRANSFORM)
        { transform = "translate3d("+this.__delta+"px,0px,0)"; }
        else transform = "translate("+this.__delta+"px,0px)";
      }
      else
      {
        if (event.changedTouches)
        {  this.__delta =  event.changedTouches[0].clientY - this.__pos; }
        else
        {  this.__delta = event.clientY - this.__pos; }
      
        if (vs_utils.SUPPORT_3D_TRANSFORM)
        { transform = "translate3d(0px,"+this.__delta+"px,0)"; }
        else transform = "translate(0px,"+this.__delta+"px)";
      }  
      if (this.__delta < 0)
      {
        state.comp.view.style.webkitTransitionDuration = 0;
        vs_utils.setElementTransform (state.comp.view, transform);
      }
      else if (state_before_id)
      {
        state_before = this.__layer._list_of_state [state_before_id];
        if (state_before && state_before.comp)
        {
          if (this.__layer._orientation === CubicController.HORIZONTAL)
          {
            if (vs_utils.SUPPORT_3D_TRANSFORM)
            {
              transform = 
                "translate3d("+(this.__delta-this._size[0])+"px,0px,0)";
            }
            else transform = 
              "translate("+(this.__delta-this._size[0])+"px,0px)";
          }
          else
          {
            if (vs_utils.SUPPORT_3D_TRANSFORM)
            {
              transform = 
                "translate3d(0px,"+(this.__delta-this._size[1])+"px,0)";
            }
            else transform = 
              "translate(0px,"+(this.__delta-this._size[1])+"px)";
          }  
          state_before.comp.view.style.webkitTransitionDuration = 0;
          vs_utils.setElementTransform (state_before.comp.view, transform);
        }
      }
    }
    else if (event.type === vs_core.POINTER_END)
    {
      state = this.__layer._list_of_state [this.__layer._current_state];
      if (this.__delta > 50)
      {
        t_ok = this.__layer.goToPreviousView ();
      }
      else if (this.__delta < -50)
      {
        t_ok = this.__layer.goToNextView ();
      }
      if (!t_ok)
      {
        index = this.__layer._states_array.indexOf (this.__layer._current_state);
        
        if (index > 0)
        { state_before_id = this.__layer._states_array [index-1]; }
        
        if (this.__delta < 0)
        {
          if (vs_utils.SUPPORT_3D_TRANSFORM)
          { transform = "translate3d(0,0,0)"; }
          else transform = "translate(0,0)";

          state.comp.view.style.webkitTransitionDuration =
            this.__layer._animation_duration + 'ms';
          vs_utils.setElementTransform (state.comp.view, transform);
        }
        else if (state_before_id)
        {
          state_before = this.__layer._list_of_state [state_before_id];
          if (state_before && state_before.comp)
          {
            if (this.__layer._orientation === CubicController.HORIZONTAL)
            {
              if (vs_utils.SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d("+this._size[0]+"px,0px,0)";
              }
              else transform = 
                "translate("+this._size[0]+"px,0px)";
            }
            else
            {
              if (vs_utils.SUPPORT_3D_TRANSFORM)
              {
                transform = 
                  "translate3d(0px,-"+this._size[1]+"px,0)";
              }
              else transform = 
                "translate(0px,-"+this._size[1]+"px)";
            }  
            state_before.comp.view.style.webkitTransitionDuration =
              this.__layer._animation_duration + 'ms';
            vs_utils.setElementTransform (state_before.comp.view, transform);
          }
        }
      }
      vs_gesture.removePointerListener(document, vs_core.POINTER_END, this, true);
      vs_gesture.removePointerListener(document, vs_core.POINTER_MOVE, this, true);
    }
  },
  
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.fx.CubicController#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   */
  goTo : function (state_id, output, event)
  {
    var state_to, index = this._states_array.indexOf (state_id), 
      state_from = this._list_of_state [this._current_state];
    // manage output
    // TODO WARNING
        
    StackController.prototype.goTo.call (this, state_id, output, event);
    if (!state_id) { return; }

    this.owner.animationDuration = this._animation_duration;

    state_to = this._list_of_state [this._current_state];
    state_to.comp.setStyle ('position', 'absolute');
    state_to.comp.position = [0, 0];
    state_to.comp.setStyle ('z-index', 1000 - index);
    
    if (state_from && state_to)
    {
      state_from.comp.setStyle ('-webkit-transform', 'scale3d(.835,.835,.835) translateZ(200px)');
      
      state_to.comp.setStyle ('-webkit-transform', 'scale3d(.835,.835,.835) rotateX(90deg) translateZ(200px)');
    }

    function initState (index)
    {
      var state_id = this._states_array [index],
          state = this._list_of_state [state_id];
      
      if (!state) { return; }

      if (!state.comp)
      {
        state.comp = this.owner.createAndAddComponent
          (state.comp_name, state.init_data, state.extension);
          
        state.comp.configure (state.init_data);
        state.comp.style ('position', 'absolute');
        if (state.comp && state.comp.propertiesDidChange) 
        { 
          state.comp.propertiesDidChange ();
        }
        state.comp.propertyChange ();
      }
      if (state.view)
      {
        __setPos (state.view, 0, 0);
      }
      else
      {
        state.comp.position = [0, 0];
      }
      state.comp.show ();
      state.comp.style ('z-index', 1000 - index);
    }
    
    /// left/top component 
    if (index > 0) { initState.call (this, index - 1); }

    /// right/bottom component 
    if (index < this._states_array.length - 1)
    { initState.call (this, index + 1); }
     
    if (event && event.on === StackController.NEXT && state_from)
    {
      if (this._orientation === CubicController.HORIZONTAL)
      {
        CubicController._translate_animation.process (this.owner);
      }
      else
      {
        CubicController._translate_animation.process (this.owner);
      }
    }
    else if (event && event.on === StackController.PRED && state_to)
    {
      CubicController._translate_animation.x = 0;
      CubicController._translate_animation.y = 0;
      CubicController._translate_animation.process (state_to.comp);
    }

    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (vs_utils.isFunction (clb))
      {
        clb.call (this.owner, event);
      }
      else if (vs_utils.isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
  }
};
vs_utils.extendClass (CubicController, StackController);

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
 *  The vs.fx.NavigationController class implements a controller for navigating
 *  on hierarchical contents.
 *
 *  @extends vs.fx.Controller
 *
 *  @class
 *  The vs.fx.NavigationController class implements a controller for navigating
 *  on hierarchical contents.
 *  <p/>
 *  The controller shows a first view (the initialComponent) and allows to
 *  navigate from this first view to a second view and a third ... and back
 *  to the previous one til the first view.
 *  <p/>
 *  The next picture shows a example of hierarchical contents navigation.
 *
 *  <pre>                 
 *                
 *   ⎡ˉˉˉˉˉˉ⎤    ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟      ⎢__> ⎢      ⎢__>⎟      ⎢ 
 *   ⎟  (1) ⎢    ⎢  (2) ⎢   ⎟  (3) ⎢
 *   ⎟      ⎢<__ ⎢      ⎢<__⎟      ⎢
 *   ⎣______⎦    ⎣______⎦   ⎣______⎦
 *        | |   
 *        | |    ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *        | ⎣__>⎢      ⎢-->⎟      ⎢
 *        | |    ⎢  (4) ⎢   ⎟  (5) ⎢ 
 *        | |<___⎢      ⎢<__⎟      ⎢
 *        |      ⎣______⎦   ⎣______
 *        |            |   
 *        |            |    ⎡ˉˉˉˉˉˉ⎤
 *        |            ⎣__>⎢      ⎢
 *        |            |    ⎢  (6) ⎢
 *        |            |<___⎢      ⎢
 *        |                 ⎣______⎦
 *        |   
 *        |    ⎡ˉˉˉˉˉˉ⎤
 *        ⎣__>⎢      ⎢
 *        |    ⎢  (7) ⎢
 *        |<___⎢      ⎢
 *             ⎣______⎦
 *
 * 
 *  (1, ... ,7) : component's views managed by the SliderLayer
 *
 *  </pre>
 *  The controller can manage a navigation bar during the user navigates.
 *  For instance it can hides or shows components (button, label, ...) and/or
 *  reconfigurate them. (for instance change the text value of a label.
 *  <p/>
 *  Example:
 *  <pre class='code'>
 *  this.controller = new vs.fx.NavigationController (this, this.navBar);
 *  this.controller.init ();
 *  
 *  // 1.1 put the first view into the controller
 *  this.controller.push (this.firstView);
 *  // 1.2 configure the navigation bar for the first view (nothing)
 *  this.controller.configureNavigationBarState (this.firstView.id, []);
 *  // 1.3 finally configure the first view as the initial component
 *  this.controller.initialComponent = this.firstView.id;
 *  
 *  var backId = this.navBar.backButton.id;
 *  var titleId = this.navBar.title.id;
 *
 *  // 2.1 set the second view, with parameters
 *  var id = this.controller.push ('PanelOne', {position: [0, 44]});
 *  // 2.2 configure the navigation bar to show the back button, the title
 *  //  and set the text title
 *  this.controller.configureNavigationBarState
 *    (id, [{comp: backId}, 
 *          {comp: titleId, properties: {text: 'Panel One'}}]);    
 *  // 2.3 configure the transition between the first and second view
 *  this.controller.configureTransition (this.firstView.id, id, 'goToOne');
 *  
 *  // 3 set the third view
 *  id = this.controller.push ('PanelTwo', {position: [0, 44]});
 *  this.controller.configureNavigationBarState
 *    (id, [{comp: backId}, 
 *          {comp: titleId, properties: {text: 'Panel Two'}}]);    
 *  this.controller.configureTransition (this.firstView.id, id, 'goToTwo');
 *  
 *  // 3 set the last view
 *  id = this.controller.push ('PanelThree', {position: [0, 44]});
 *  this.controller.configureNavigationBarState
 *    (id, [{comp: backId}, 
 *          {comp: titleId, properties: {text: 'Panel Three'}}]);    
 *  this.controller.configureTransition (this.firstView.id, id, 'goToThree');
 * 
 *  </pre>
 * 
 *  @author David Thevenin
 * @name vs.fx.NavigationController
 *
 *  @constructor
 *   Creates a new vs.fx.NavigationController.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 * @param {number} animationType Select the animation use during transition. 
 *     [optional]
 */
function NavigationController (owner, navBar, type)
{
  this.parent = Controller$1;
  this.parent (owner);
  this.constructor = NavigationController;
  
  if (!arguments.length) return;
  
  if (type == NavigationController.NO_ANIMATION ||
      type == NavigationController.CARD_ANIMATION ||
      type == NavigationController.SLIDE_ANIMATION)
  { this._animation_type = type; }
  
  else
  { this._animation_type = NavigationController.DEFAULT_ANIMATION; }
     
  this.setNavigationBar (navBar);
  
  this.__nav_bar_states = {};
}

/**
 *  There is no animation during transition between two views.
 *  <br />
 *  If the platform you are targeting does not support animations or
 *  does not support accelerated animations, you should use this
 *  configuration.
 *
 * @name vs.fx.NavigationController.NO_ANIMATION
 */
NavigationController.NO_ANIMATION = 0;

/**
 * There is card animation during transition between two views.
 *
 * @name vs.fx.NavigationController.CARD_ANIMATION
 */
NavigationController.CARD_ANIMATION = 1;

/**
 * There is slide animation during transition between two views.
 *  <br />
 *  This is the default configuration
 *
 * @name vs.fx.NavigationController.SLIDE_ANIMATION
 */
NavigationController.SLIDE_ANIMATION = 2;

/**
 * Select the default animation configuration (Slide animations)
 *
 * @name vs.fx.NavigationController.DEFAULT_ANIMATION
 */
NavigationController.DEFAULT_ANIMATION =
  NavigationController.SLIDE_ANIMATION;

/**
 * @private
 */
NavigationController.BACK = 'back';

NavigationController.prototype = {

  /**
   * @protected
   * @function
   */
  _nav_bar : null,

  /**
   * @protected
   * @function
   */
  __nav_bar_states : null,

  /**
   * @protected
   * @function
   */
  _animation_type : NavigationController.DEFAULT_ANIMATION,

 /**********************************************************************

  *********************************************************************/

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    Controller$1.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    Controller$1.prototype.initComponent.call (this);
   
    var size = this._owner.size;
    

    this.__translate_in_right = new TranslateAnimation (0);
    this.__translate_out_right = new Animation (['translate', '100%,0,0']);
    this.__translate_out_left = new Animation (['translate', '-100%,0,0']);
    this.__translate_in_left = new TranslateAnimation (0);
  },

  /**
   *  Defines the Navigation Bar
   *
   * @name vs.fx.NavigationController#setNavigationBar
   * @function
   *
   * @param {vs.ui.NavigationBar} navBar the ab bar
   */
  setNavigationBar : function (navBar)
  {
    if (!navBar || !navBar instanceof ui.NavigationBar) { return; }
    
    this._nav_bar = navBar;
  },
  
  /**
   * @protected
   * @function
   */
  _updateViewSize : function ()
  {},
  
  /**
   *  Add the a child component to the Navigation Controller
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  The component instantiation is a lazy algorithm. The component will
   *  be instantiated and add into the DOM tree only when it has to be show
   *  to the user.
   *  <p>
   *  @example
   *  var myComp = new MyComp (conf);
   *  myComp.controller = new vs.fx.NavigationController (myComp);
   *
   *  // push a component name (the component will be instanciated when needs)
   *  myComp.controller.push ('AComponent1', {id: 'comp1'});
   *
   *  // instanciate a component and push it 
   *  var comp2 = myComp.createAndAddComponent ('AComponent1', {id: 'comp2'});
   *  myComp.controller.push (comp2);
   *
   *  // create a button object and push it
   *  var comp3 = new vs.ui.Button ({id: 'comp3', text: 'hello'});
   *  myComp.controller.push (comp3);
   *  myComp.controller.initComponent = comp2.id;
   *
   * @name vs.fx.NavigationController#push
   * @function
   *
   * @param {String | vs.ui.View} comp The GUI component name to instanciate or 
   *    the instance of the component  
   * @param {Object} config Configuration structure need to build the 
   *     component [optional]
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, bindings)
  {
    if (!comp) { return; }
    if (!data) { data = {}; }
    
    var size, state_id =
      Controller$1.prototype.push.call (this, comp, data, null, bindings);
    if (!state_id) { return; }

    var state = this._fsm._list_of_state [state_id];
    if (state && state.comp)
    {
      this.configureNewComponent (state.comp);
    }

    return state_id;
  },
  
  /**
   *
   * @param {String} state The state (component id)  
   * @param {Array} configurations configuration parameters 
   *     Structure have to follow : [{comp: vs.core.Object|String, properties:{prop_name: value}}
   *
   * @name vs.fx.NavigationController#configureNavigationBarState
   * @function
   */
  configureNavigationBarState : function (state_id, configurations)
  {
    var state = this._fsm._list_of_state [state_id], comp, i, l, conf,
      components = [], state_conf = {};
    if (!state || !configurations)
    { return; }
    
    for (i = 0, l = configurations.length; i < l; i++)
    {
      conf = configurations [i];
      if (!conf) { continue; }
      
      comp = conf.comp;
      if (!comp) { continue; }
      
      // component is specified by an id
      if (vs_utils.isString (comp))
      { comp = vs_core.VSObject._obs [comp]; }
      
      if (!comp instanceof vs_ui__default.View)
      { continue; }
      
      components.push (comp);
      if (conf.properties)
      {
        state_conf [comp.id] = conf.properties;
      }
    }
    
    this.__nav_bar_states [state_id] = state_conf;
    if (this._nav_bar)
    {
      this._nav_bar.setStateItems (state_id, components);
    }
  },
  
  /**
   *   Add a new transition from the state "from" to the state "to".
   *   The states have to be already specified.
   *
   * @name vs.fx.NavigationController#configureTransition
   * @function
   *
   * @param {string} from State from
   * @param {string} to State to
   * @param {string} on input lexem which cause the crossing of transition
   * @param {string} output optional ouput lexem that will be produce by the 
   *                  transition
   * @param {string} anim optional animation name
   */
  configureTransition : function (from, to, on)
  {
    if (!from || !this._fsm.existState (from)) { return; }
    if (!to || !this._fsm.existState (to)) { return; }
    if (!on) { return; }
    
    if (!this._fsm.existInput (on)) { this._fsm.addInput (on); }
    
    if (this._animation_type === NavigationController.SLIDE_ANIMATION)
    {
      this.addTransition (from, to, on,
        this.__translate_out_left, this.__translate_in_right);
        
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, this.__translate_in_left);

      this.__translate_in_left.duration = "300ms"; 
      this.__translate_out_left.duration = "300ms"; 
      this.__translate_in_right.duration = "300ms"; 
      this.__translate_out_right.duration = "300ms"; 
    }
    else if (this._animation_type === NavigationController.CARD_ANIMATION)
    {
      this.addTransition (from, to, on,
        null, this.__translate_in_right);
                
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, null);

      this.__translate_in_right.duration = "300ms"; 
      this.__translate_out_right.duration = "300ms"; 
    }
    else // no animation
    {
      this.addTransition (from, to, on,
        null, this.__translate_in_right);
                
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, null);

      this.__translate_in_right.duration = "0"; 
      this.__translate_out_right.duration = "0"; 
    }
  },
  

  /*********************************************************
   *                 FSM management
   *********************************************************/

  /**
   * @protected
   * @function
   */
  configureNewComponent : function (comp)
  {
    var animation = this.__translate_out_right,
      duration = animation.duration;
    
    // apply the transformation without animation
    animation.process (comp, null, null, true);
  },

  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.fx.NavigationController#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   */
  goTo : function (state_id, output, event, instant)
  {
    var ok = 
      Controller$1.prototype.goTo.call (this, state_id, output, event, instant);
 
    if (ok && this.owner._nav_bar)
    {
      this.owner._nav_bar.changeState
        (state_id, this.owner.__nav_bar_states [state_id]);
    }
  },
  
  /**
   *  do nothing, will be managed by _stackAnimateComponents
   *  @protected
   */
  _animateComponents : Controller$1.prototype._animateComponents
};
vs_utils.extendClass (NavigationController, StackController);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (NavigationController, {
  'viewSize': {
   /** 
     * Getter|Setter for view size.
     * @name vs.fx.NavigationController#viewSize 
     *
     * @type {Array.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!vs_utils.isArray (v) || v.length !== 2) { return; }
      if (!vs_utils.isNumber (v[0]) || !vs_utils.isNumber(v[1])) { return; }
      
      if (!this._view_size)
      { this._view_size = []; }
      
      this._view_size [0] = v [0];
      this._view_size [1] = v [1];
      
      this._updateViewSize ();
    },
  
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (!this._view_size)
      {
        return this._owner.size;
      }
      return this._view_size.slice ();
    }
  },
  'initialComponent': {
    /**
     *  Define the initiale component
     *  Generate a exception if the component was not already registered
     *
     * @name vs.fx.NavigationController#initialComponent 
     * @param {string} state_id the state
     */
    set : function (comp_id)
    {
      if (!comp_id)
      {
        this._initial_component = undefined;
        return;
      }
      
      if (!this._fsm.existState (comp_id)) { return; }
  
      // set initial state and go to it   
      this._initial_component = comp_id;
      this._fsm.initialState = comp_id;
      
      this._fsm.goTo (comp_id);
      var state = this._fsm._list_of_state [comp_id],
        animation = this.__translate_in_right,
        duration = animation.duration;
          
      if (state && state.comp)
      {
        // apply the transformation without animation
        animation.process (state.comp, null, null, true);
      }
    },
    
    /**
     * @ignore
     */
    get : function ()
    {
      return this._initial_component;
    }
  }
});

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
 *  The vs.fx.OpacityController class <br />
 *  @class
 *  This layer manage a list of children using a card layout.
 *  <p />
 *  Children can be slided horizontally (right <-> left) or vertically 
 *  (top <-> bottom) using a pointing device (mouse, touch screen, ...),
 *  or using methods goToNextView and goToPreviousView.
 *  <p />
 *  By default the slider is horizontal, but you can change it using the 
 *  property "orientation".
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
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller), Called when the view
 *        changed
 *  </ul>
 *  <p>
 *  @example
 *  theApplicatioin.layer = new vs.fx.OpacityController (myComp);
 *
 *  myComp.layer.push ('APanel', {id: '1', data: {...}});
 *  myComp.layer.push ('APanel', {id: '2', data: {...}});
 *  myComp.layer.push ('APanel', {id: '3', data: {...}});
 *  myComp.layer.push ('APanel', {id: '4', data: {...}});
 *
 *  @extends vs.fx.StackController
 * @name vs.fx.OpacityController
 * 
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.View.
 *
 * @param {vs.ui.View} owner the View using this Layer [mandatory]
 * @param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 */
function OpacityController (owner, extension)
{
  this.parent = StackController;
  this.parent (owner, extension);
  this.constructor = OpacityController;

  this.animationDuration = OpacityController.ANIMATION_DURATION;
}

/** @private */
OpacityController._opacity_animation = new vs_ui.OpacityAnimation (1);
OpacityController._opacity_animation.init ();
OpacityController._opacity_animation.durations = "0.2s";

/**
 * The duration of the animation between two views
 * @name vs.fx.OpacityController.ANIMATION_DURATION
 */
OpacityController.ANIMATION_DURATION = 500;

OpacityController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/

/********************************************************************

********************************************************************/
  
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
   *  var myComp = new MyComp (conf);
   *  myComp.layer = new vs.fx.StackController (myComp, 'children');
   *  myComp.layer.push ('AComponent1', data1);
   *  myComp.layer.push ('AComponent1', data2);
   *  myComp.layer.push ('AComponent2', data3);
   *
   * @name vs.fx.OpacityController#push
   * @function
   *
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the component.
   * @param {Array} bindings Bindings configuration [[spec, observer, method], ...]
   */
  push : function (comp, data, bindings)
  {
    if (!comp) { return; }
    
    if (!vs_utils.isString (comp))
    {
      var index = this._states_array.length;
      comp.position = [0, 0];
      comp.setStyle ('z-index', 1000 - index);
    }
    StackController.prototype.push.call (this, comp, data, bindings);
  },
  
/*********************************************************
 *                  Event management
 *********************************************************/
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   * @private
   *
   * @name vs.fx.OpacityController#goTo
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   */
  goTo : function (state_id, output, event)
  {
    var state_to, index = this._states_array.indexOf (state_id), 
      state_from = this._list_of_state [this._current_state];
    // manage output
    // TODO WARNING
    StackController.prototype.goTo.call (this, state_id, output, event);
    if (!state_id) { return; }

//    this.owner.animationDuration = this._animation_duration;

    state_to = this._list_of_state [this._current_state];
    state_to.comp.setStyle ('position', 'absolute');
    state_to.comp.position = [0, 0];
    state_to.comp.setStyle ('z-index', 1000 - index);
        
    function initState (index)
    {
      var state_id = this._states_array [index],
          state = this._list_of_state [state_id];
      
      if (!state) { return; }

      if (!state.comp)
      {
        state.comp = this.owner.createAndAddComponent
          (state.comp_name, state.init_data, state.extension);
          
        state.comp.configure (state.init_data);
        state.comp.setStyle ('position', 'absolute');
        if (state.comp && state.comp.propertiesDidChange) 
        { 
          state.comp.propertiesDidChange ();
        }
        state.comp.propertyChange ();
      }
      if (state.view)
      {
        __setPos (state.view, 0, 0);
      }
      else
      {
        state.comp.position = [0, 0];
      }
      state.comp.show ();
      state.comp.setStyle ('z-index', 1000 - index);
    }
    
    /// left/top component 
    if (index > 0) { initState.call (this, index - 1); }

    /// right/bottom component 
    if (index < this._states_array.length - 1)
    { initState.call (this, index + 1); }
     
    if (event && event.on === StackController.NEXT && state_from)
    {
      OpacityController._opacity_animation.value = 0;
      OpacityController._opacity_animation.process (state_from.comp);
    }
    else if (event && event.on === StackController.PRED && state_to)
    {
      OpacityController._opacity_animation.value = 1;
      OpacityController._opacity_animation.process (state_to.comp);
    }

    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (vs_utils.isFunction (clb))
      {
        clb.call (this.owner, event);
      }
      else if (vs_utils.isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
  }
};
vs_utils.extendClass (OpacityController, StackController);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperty (OpacityController, "animationDuration", {
  /** 
   * Set the animation/transition temporisation (in millisecond)
   * @name vs.fx.OpacityController#animationDuration 
   * @type {number}
   */ 
  set : function (time)
  {
    if (!time) { time = 0; }
    if (!vs_utils.isNumber (time)) { return }
    
    this._animation_duration = time;
    OpacityController._opacity_animation.durations = time / 1000 + "s";
  }
});

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
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View,
 *         controller), Called when the view changed
 *    <li/>controllerAnimationDidEnd : function (from vs.ui.View, to vs.ui.View, 
 *         controller), Called just after the animation ended
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
var SlideController = vs_core.createClass ({

  parent: StackController,
  
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
        if (!vs_utils.isNumber (v)) { return }
      
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
        
        vs_utils.free (this._transition_out_right);
        vs_utils.free (this._transition_out_left);
        
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
        vs_utils.setElementTransform (state.comp.view, "translate3D(0,0,0)");
        continue;
      }
      
      state.comp.view.style.webkitTransitionDuration = '0';
      vs_utils.setElementTransform (state.comp.view, transform);
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
    vs_utils.setElementTransform (comp.view, transform);
    comp.hide ();
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
          
    if (event.type === vs_core.POINTER_START)
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

      vs.addPointerListener(document, vs_core.POINTER_END, this, true);
      vs.addPointerListener(document, vs_core.POINTER_MOVE, this, true);
      
      this.animationDuration = 0;
      this.__delta = 0;
    }
    else if (event.type === vs_core.POINTER_MOVE)
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
    else if (event.type === vs_core.POINTER_END)
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
      vs.removePointerListener(document, vs_core.POINTER_END, this, true);
      vs.removePointerListener(document, vs_core.POINTER_MOVE, this, true);
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
      fromComp.hide ();
      try
      {
        if (self._delegate && self._delegate.controllerAnimationDidEnd)
        {
          self._delegate.controllerAnimationDidEnd (fromComp, toComp, self);
        }
        if (clb) clb.call (self._owner);
      } catch (e) { if (e.stack) console.log (e.stack);console.error (e); }
    },
    
    runAnimation = function ()
    {
      setPosition.durations = durations_tmp;
      try
      {
        toComp.show ();
        toComp.refresh ();
        vs_core.scheduleAction (function () {
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
        });
      }
      catch (e) { if (e.stack) console.log (e.stack);console.error (e); }
    };
    setPosition.process (toComp, function () {
      vs_core.scheduleAction (function () {runAnimation ();});
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
var SwipeController = vs_core.createClass ({

  parent: StackController,
  
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
      
      vs_utils.setElementTransform (carousel_div,
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
        vs_utils.setElementTransform (carousel_div,
          "translate3D(" + self.__current_pos + "px,0,0)");
      else
        vs_utils.setElementTransform (carousel_div,
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

    var self = this;
    
    function runAnimation ()
    {
      try
      {
        toComp.show ();
        toComp.refresh ();
        vs_core.scheduleAction (function () {
          if (instant) {
            carousel_div.style.webkitTransitionDuration = "0ms";
          }
          else {
            carousel_div.style.webkitTransitionDuration =
              self._animation_duration + "ms";
          }

          if (self._orientation === SwipeController.HORIZONTAL)
            vs_utils.setElementTransform (carousel_div,
              "translate3D(" + self.__current_pos + "px,0,0)");
          else
            vs_utils.setElementTransform (carousel_div,
              "translate3D(0," + self.__current_pos + "px,0)");
        });
      }
      catch (e) { if (e.stack) console.log (e.stack);console.error (e); }
    }
    runAnimation ();
  }
});
vs_utils.extend (SwipeController.prototype, vs_ui.RecognizerManager);

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

/** @license
  Copyright (C) 2009-2018. David Thevenin, ViniSketch SARL (c), and 
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

exports.CardController = CardController;
exports.Controller = Controller$1;
exports.CubicController = CubicController;
exports.NavigationController = NavigationController;
exports.OpacityController = OpacityController;
exports.SlideController = SlideController;
exports.StackController = StackController;
exports.SwipeController = SwipeController;

Object.defineProperty(exports, '__esModule', { value: true });

});
