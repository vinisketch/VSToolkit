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
import vs_ui from 'vs_ui';
import {
  isNumber, isArray, isString,
  extendClass, defineClassProperties
} from 'vs_utils';

import Controller from './Controller';
import StackController from './StackController';

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
  this.parent = Controller;
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
    Controller.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    Controller.prototype.initComponent.call (this);
   
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
      Controller.prototype.push.call (this, comp, data, null, bindings);
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
      if (isString (comp))
      { comp = vs_core.VSObject._obs [comp]; }
      
      if (!comp instanceof vs_ui.View)
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

      this.__translate_in_left.duration = "300ms" 
      this.__translate_out_left.duration = "300ms" 
      this.__translate_in_right.duration = "300ms" 
      this.__translate_out_right.duration = "300ms" 
    }
    else if (this._animation_type === NavigationController.CARD_ANIMATION)
    {
      this.addTransition (from, to, on,
        null, this.__translate_in_right);
                
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, null);

      this.__translate_in_right.duration = "300ms" 
      this.__translate_out_right.duration = "300ms" 
    }
    else // no animation
    {
      this.addTransition (from, to, on,
        null, this.__translate_in_right);
                
      this.addTransition (to, from, NavigationController.BACK,
        this.__translate_out_right, null);

      this.__translate_in_right.duration = "0" 
      this.__translate_out_right.duration = "0" 
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
      Controller.prototype.goTo.call (this, state_id, output, event, instant);
 
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
  _animateComponents : Controller.prototype._animateComponents
};
extendClass (NavigationController, StackController);

/********************************************************************
                  Define class properties
********************************************************************/

defineClassProperties (NavigationController, {
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
      if (!isArray (v) || v.length !== 2) { return; }
      if (!isNumber (v[0]) || !isNumber(v[1])) { return; }
      
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
/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default NavigationController;
