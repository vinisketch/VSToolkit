/**
  Copyright (C) 2009-2011. ViniSketch SARL (c) All rights reserved
  
  THIS SOURCE CODE, ALL THE INTELLECTUAL PROPERTY RIGHTS THAT IT
  CONTAINS, AND ALL COPYRIGHTS PERTAINING THERETO ARE THE EXCLUSIVE
  PROPERTY OF VINISKETCH SARL.
  
  THIS SOURCE CODE SHALL NOT BE COPIED OR REPRODUCED IN
  FULL OR IN PART.
  
  THE PRESENT COPYRIGHT NOTICE MAY NOT BE CHANGED NOR REMOVED FROM THE
  PRESENT FILE.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 *  The PageFlipController class <br />
 *  @class
 *  This layer manage a list of children using a card layout.
 *  <p>
 *  Delegate:
 *  <ul>
 *    <li/>controllerViewWillChange : function (from vs.ui.View, to vs.ui.View, controller), Called when the view
 *        changed
 *    <li/>animationWillStart : function (PageFlipController), Called just 
 *         before the animation start
 *    <li/>controllerAnimationDidEnd : function (from vs.ui.View, to vs.ui.View, controller), Called just after 
 *         the animation ended
 *  </ul>
 *  <p>
 *  @example
 *  theApplicatioin.layer = new PageFlipController (myComp);
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
 *	@param {vs.ui.View} owner the View using this Layer [mandatory]
 *	@param {String} extension The hole into the vs.ui.View will be inserted. 
 *     ['children' by default]
 */
function PageFlipController (owner, extension)
{
  this.parent = vs.fx.StackController;
  this.parent (owner, extension);
  this.constructor = PageFlipController;
  
/********************************************************************

********************************************************************/

  this._page_flip = new PageFlipAnimation (owner);
  this._page_flip.delegate = this;
    
  this.animationDuration = PageFlipController.ANIMATION_DURATION;
  this.isTactile = false;
}
window.PageFlipController = PageFlipController;

/**
 * The duration of the animation between two views
 */
PageFlipController.ANIMATION_DURATION = 5000;


/**
 * @const
 * @private
 */
PageFlipController.CAPTURE_WIDTH = 100;

/**
 * @const
 * @private
 */
PageFlipController.FLIP_THRESHOLD = 10;

PageFlipController.prototype = {

/********************************************************************
                  protected members declarations
********************************************************************/
  
  /**
   *
   * @private
   * @type {number}
   */
  _canvas : null,

  /**
   *
   * @private
   * @type {number}
   */
  _continuous_interaction : false,

/********************************************************************
                  setter and getter declarations
********************************************************************/
  /** 
   * Getter|Setter for the tab bar style
   * @name PageFlipController#isTactile 
   * @type {boolean}
   */ 
  set isTactile (v)
  {
    if (v)
    {
      this._is_tactile = true;

      if (!this._owner_handler_event_extended)
      {
         this._owner.view.addEventListener (vs.core.POINTER_START, this._owner);
         this._owner_handler_event = this._owner.handleEvent;
         this._owner.handleEvent = this.handleEvent;
         this._owner_handler_event_extended = true;
      }
    }
    else
    {
      this._is_tactile = false;
      
      if (this._owner_handler_event_extended)
      {
        this._owner.view.removeEventListener (vs.core.POINTER_START, this._owner);
        this._owner.handleEvent = this._owner_handler_event;        
        this._owner_handler_event_extended = false;
      }
    }
  },

  /** 
   * @return {boolean}
   */ 
  get isTactile ()
  {
    return this._is_tactile;
  },

  /** 
   * Set the animation/transition temporisation (in millisecond)
   * @name PageFlipController#animationDuration 
   * @type {number}
   */ 
  set animationDuration (time)
  {
    if (!time) { time = 0; }
    if (!vs.util.isNumber (time)) { return };
    
    this._page_flip._animation_duration = time;
  },

//   /** 
//    * Set the interaction continuous or not (the page flow the finger or not).
//    * By default it set to false
//    * @name PageFlipController#continuousInteraction 
//    * @type {boolean}
//    */ 
//   set continuousInteraction (v)
//   {
//     if (v)
//     {
//       this._continuous_interaction = true;
//     }
//     else
//     {
//       this._continuous_interaction = false;
//     }
//   },

  /** 
   * Set rendering model.
   * @name PageFlipAnimation#renderingModel 
   * @type {Object}
   */ 
  set renderingModel (v)
  {
    this._page_flip.renderingModel = v;
  },
  
/********************************************************************

********************************************************************/
  
  /**
   *  Add a child component to the Page Flip Manager
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
   *  myComp.layer = new PageFlipController (myComp, 'children');
   *  myComp.layer.push ('AComponent1', data1);
   *  myComp.layer.push ('AComponent1', data2);
   *  myComp.layer.push ('AComponent2', data3);
   *
   *	@param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   *	@param {Object} config Configuration structure need to buil
   *	                the component.
   *	@param {Array} bindings Bindings configuration
   *                 [[spec, observer, method], ...]
   */
  push : function (comp, data, bindings)
  {
    if (!comp) { return; }
    
    if (!vs.util.isString (comp))
    {
      var index = this._states_array.length;
      comp.position = [0, 0];
      comp.setStyle ('z-index', 1000 - index);
      comp.setStyle ('-webkit-transform', 'rotateY(0)');
    }
    vs.fx.StackController.prototype.push.call (this, comp, data, bindings);
  },
  
/*********************************************************
 *                  Event management
 *********************************************************/
 
  test : function (p)
  {
    var state_id = this._states_array [0];
    state = this._fsm._list_of_state [state_id];
    this._page_flip.renderFlip (p, state.comp)
  },
  
  /**
   * @private
   */
  handleEvent : function (event)
  {
    var t_ok = false, state, state_before_id, state_before, index, a, p;
    
    this.__bound = this.view.getBoundingClientRect ();
    
    if (event.type === vs.core.POINTER_START)
    {
      if (event.changedTouches)
      {
        this.__pos_x = event.changedTouches[0].pageX;
        this.__pos_y = event.changedTouches[0].pageX;
      }
      else
      { 
        this.__pos_x = event.pageX;
        this.__pos_y = event.pageY;
      }

      if (this.__pos_x < PageFlipController.CAPTURE_WIDTH ||
          this.__pos_x > this._size [0] - PageFlipController.CAPTURE_WIDTH) 
      {
        document.addEventListener (vs.core.POINTER_END, this, true);
        document.addEventListener (vs.core.POINTER_MOVE, this, true);
      }
      
      if (this.__controller__._delegate && this.__controller__._delegate.animationWillStart)
      {
        this.__controller__._delegate.animationWillStart (this.__controller__);
      }
    }
    else if (event.type === vs.core.POINTER_MOVE)
    {
      event.preventDefault ();
      state = this.__controller__._list_of_state [this.__controller__._current_state];
      index = this.__controller__._states_array.indexOf (this.__controller__._current_state)
      
      if (index > 0) { state_before_id = this.__controller__._states_array [index-1]; }
        
      if (event.changedTouches)
      { 
        this.__delta_x = event.changedTouches[0].pageX - this.__pos_x;
        this.__delta_y = event.changedTouches[0].pageY - this.__pos_y;
        p = (this._size [0] - event.changedTouches[0].pageX + this.__bound.left) 
          / this._size [0];
      }
      else
      {
        this.__delta_x = event.pageX - this.__pos_x;
        this.__delta_y = event.pageY - this.__pos_y;
        p = (this._size [0] - event.pageX + this.__bound.left) / this._size [0];
      }

      if (!this.__controller__._continuous_interaction) { return; }
      
      if (this.__controller__._page_flip._is_rendering) { return; }
  
      a = Math.atan2 (this.__delta_x, this.__delta_y);
      
      if (this.__pos_x > this._size [0] - PageFlipController.CAPTURE_WIDTH)
      {
        this.__controller__._page_flip._is_rendering = true;
        this.__controller__._page_flip.renderFlip (p, state.comp.view);
        this.__controller__._page_flip._is_rendering = false;
      }
      else if (index > 0)
      {
        state = this.__controller__._list_of_state [state_before_id];

        this.__controller__._page_flip._is_rendering = true;
        this.__controller__._page_flip.renderFlip (p, state.comp.view);
        this.__controller__._page_flip._is_rendering = false;
      }
    }
    else if (event.type === vs.core.POINTER_END)
    {
      state = this.__controller__._list_of_state [this.__controller__._current_state];
      index = this.__controller__._states_array.indexOf (this.__controller__._current_state)
      if (index > 0) { state_before_id = this.__controller__._states_array [index-1]; }

      if (index > 0 && this.__delta_x > PageFlipController.FLIP_THRESHOLD)
      {
        t_ok = this.__controller__.goToPreviousView ();
      }
      else if (index < this.__controller__._states_array.length - 1 && 
        this.__delta_x < -PageFlipController.FLIP_THRESHOLD)
      {
        t_ok = this.__controller__.goToNextView ();
      }
      if (!t_ok && this.__controller__._continuous_interaction)
      {
        if (this.__pos_x < PageFlipController.CAPTURE_WIDTH &&
            state_before_id)
        {
          state = this.__controller__._list_of_state [state_before_id];
          this.__controller__._page_flip.processLeftOut (state.comp);
        }
        else if (index > 0)
        {
          this.__controller__._page_flip.processRightIn (state.comp);
        }
      }
      document.removeEventListener (vs.core.POINTER_END, this, true);
      document.removeEventListener (vs.core.POINTER_MOVE, this, true);
    }
  },
  
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   *  @param {String} id_sate the id of target state.
   *  @param {String} output
   *  @param {Object} event the event
   */
  goTo : function (state_id, output, event)
  {
    if (this.owner.__still_animating) { return false; }

    var state_to, index = this.owner._states_array.indexOf (state_id), 
      state_from = this._list_of_state [this._current_state];
    // manage output
    // TODO WARNING
    vs.fx.StackController.prototype.goTo.call (this, state_id, output, event);
    if (!state_id) { return; }

    state_to = this._list_of_state [this._current_state];
    state_to.comp.setStyle ('position', 'absolute');
    state_to.comp.position = [0, 0];
    state_to.comp.setStyle ('z-index', 1000 - index);
        
    function initState (index)
    {
      var state_id = this.owner._states_array [index],
          state = this._list_of_state [state_id];
      
      if (!state) { return; }

      if (!state.comp)
      {
        state.comp = this._owner.createAndAddComponent
          (state.comp_name, state.init_data, state.extension);
          
        state.comp.configure (state.init_data);
        state.comp.setStyle ('position', 'absolute');
        if (state.comp && state.comp.compute) 
        { 
          state.comp.compute ();
        }
        _propagate (state.comp.id);
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
    if (index < this.owner._states_array.length - 1)
    { initState.call (this, index + 1); }
     
    if (event && event.on === vs.fx.StackController.NEXT && state_from)
    {
      this.owner.__still_animating = true;
      if (state_to && state_to.comp)
      { this.owner._page_flip.processNext (state_from.comp, state_to.comp); }
      else
      { this.owner._page_flip.processNext (state_from.comp); }
    }
    else if (event && event.on === vs.fx.StackController.PRED && state_to)
    {
      this.owner.__still_animating = true;
      if (state_from && state_from.comp)
      { this.owner._page_flip.processPrevious (state_to.comp, state_from.comp); }
      else
      { this.owner._page_flip.processPrevious (state_to.comp); }
    }

    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (util.isFunction (clb))
      {
        clb.call (this._owner, event);
      }
      else if (vs.util.isString (clb))
      {
        this._owner [this._output_action [output]] (event);
      }
    }
  },

  /**
   * @protected
   */
  setPageSize: function (w, h)
  { 
    // recalculate page with and height after orientation change
    this._page_flip.setPageSize (w, h);
  },

/********************************************************************
                  vs.core.Task delegate implementation
********************************************************************/
  /**
   * @protected
   */
  taskDidEnd : function (task)
  {
    this.__still_animating = false;
    if (this._delegate && this._delegate.animationDidEnd)
    {
      console.warn ("animationDidEnd is deprecated. Please use 'controllerAnimationDidEnd'.");
      this._delegate.animationDidEnd (this);
    }
    if (this._delegate && self._delegate.controllerAnimationDidEnd)
    {
      // XXX TODO a finir
      this._delegate.controllerAnimationDidEnd (null, null, this);
    }
  }
};
PageFlipController.prototype.__proto__ = vs.fx.StackController.prototype;