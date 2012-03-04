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
 OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 *  The Fsm class
 *
 *  @extends vs.core.EventSource
 *  @class
 *  Fsm element defines a deterministic Finite-State-Machine
 *  (aka Finite-State Automaton). A fsn is an automaton such as:
 *  <ul>
 *    <li />there is only one initial state;
 *    <li />there is no transitions conditioned on null input;
 *    <li />there is only one transition for a given input and a given state.
 *  </ul>
 *
 *    A fsm is specified as flollowing :
 *  <ul>
 *    <li />the set Q, is the set of state;
 *    <li />the set I, is the input alphabet, i.e. a set of word that ca be
 *      generate a transition between two states;
 *    <li />the set O, is the ouput alphabet. It containts the set of word
 *      produced when a transition is crossed;
 *    <li />the set E, is the list of transition <QxIxQxO>;
 *    <li />an initial state.
 *  </ul>
 *
 *  When an automaton is rendered (after run), it begins in the initial state.
 *  It changes to new states depending on events that it receives and the
 *  transition function. Whenever the automaton is deactivated (for instance
 *  by being in a deactivated branch of a Rules), it does not react any more
 *  to events. It will resume to its last state and react again to events when
 *  reactivated.<br /><br />
 *
 *  The general manner to control fsm and make it cross a transition is to
 *  associate event to a input lexem. For that use the methods setInput ().
 *  But an automaton can also be manually control by notifying to it a input
 *  lexem. For that, use the method Fsm.fsmNotify (String).<br /><br />
 *
 *  Automatons can have outputs associated to their transitions (aka Mealy
 *  machine) or states (aka Moore machine, not yet implemented). At that time 
 *  the fsm emit event defined by an string (the output lexem) or call an
 *  action associated to the output lexem.
 *  The event can be received by setting a Binding on this fsm.
 *  Otherwise for specifying the action use the setOuput () method.<br />
 *  <br />
 *  Known limitations:
 *  <ul>
 *   <li />only one output lexem can be generated when crossing a transition.
 *  </ul>
 *
 *  Simple example to create a automata:
 *  @example
 *
 *   var my_fsm = new vs.core.Fsm (object);
 *   // States declaration 
 *   my_fsm.addState ("1");
 *   my_fsm.addState ("2");
 *   // Input lexems declaration
 *   my_fsm.addInput ("a");
 *   my_fsm.addInput ("b");
 *   // Ouptut lexems declaration
 *   my_fsm.addOutput ("c");
 *   my_fsm.addOutput ("d");
 *   // transitions declaration
 *   my_fsm.addTransition ("1", "2", "a", "c");
 *   my_fsm.addTransition ("2", "3", "b", "d");
 *   // initial state declaration
 *   my_fsm.setInitialState ("1");
 *   // activate the FSM
 *   my_fsm.activate ();
 * 
 *   // event associations
 *   // "a" will be generated after the button selection
 *   my_fsm.setInput ("a", aButton, 'select');
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.core.Fsm.
 *
 * @name vs.core.Fsm
 *
 * @param {vs.core.Object} owner the Object using this Fsm [mandatory]
 */
var Fsm = function (owner)
{
  this.parent = core.EventSource;
  this.parent (createId ());
  this.constructor = Fsm;
  
  this.owner = owner;

  this._list_of_state = {};   ///< List of fsm state : Q
  this._list_input = new Array ();   ///< List of input lexem (alphabet) : I
  this._list_output = new Array ();  ///< List of output lexem (alphabet) : O

  this._initial_state = "";  ///< initial state name
  this._current_state = "";  ///< current state name

  this._inputs = {};
  this._output_action = {};
}

Fsm.prototype =
{
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    delete (this._list_of_state);
    
    this.owner = undefined;
  
    delete (this._list_of_state);
    delete (this._list_input);
    delete (this._list_output);
    delete (this._inputs);
    delete (this._output_action);
  },

  /*****************************************************************
  *     Generic function
  ****************************************************************/

  /**
   * @private
   * @function
   * 
   * @param {vs.core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  _clone : function (obj, cloned_map)
  {
    EventSource.prototype._clone.call (this, obj, cloned_map);

    obj.owner = obj.__config__.owner;
    obj._current_state = "";
    
    obj._inputs = {};
    obj._output_action = {};
    
    // XXX TODO WARNING il faut refaire in inputs en outputs.
  },
  
  /**
   *  Full facility constructor that takes specification of the fsm as
   *  parameter.
   *  transitions is an array of object {from, to, on, output}
   *
   * @name vs.core.Fsm#initWithData 
   * @function
   *
   * @param {Array} states is an array of state
   * @param {Array} inputs is an array of input
   * @param {Array} outputs is an array of output
   * @param {Array} transitions is an array of object {from, to, on, output}
   */
  initWithData : function (states, inputs, outputs, transitions)
  {
    if (!states || !inputs || !outputs || !transitions) { return; }
    
    for (var i = 0; i < states.length; i++)
    { this.addState (states [i]); }
    
    for (var i = 0; i < inputs.length; i++)
    { this.addInput (inputs [i]); }
    
    for (var i = 0; i < outputs.length; i++)
    { this.addOutput (outputs [i]); }
    
    for (var i = 0; i < transitions.length; i++)
    {
      this.addTransition (transitions [i].from, transitions [i].to,
        transitions [i].on, transitions [i].output);
    }
  },
  
  /**
   *  Full facility constructor that takes state x state matrix of the fsm as
   *  parameter:
   * <ul>
   *   <li />First columm : list of "from" sates \n
   *   <li />First row : list of "to" sates \n
   *   <li />other cell : tuple "i/o" of input and ouput event \n
   * </ul>
   *
   *  If no id is specified, will create a random one.
   *
   *  @example
   *  // fsm is : 1 -a-> 2 -b-> 3 -c-> 1 \n
   *
   *  matrix = [
   *       ["", "1", "2", "3"],
   *       ["1", "", "a/", ""],
   *       ["2", "", "", "b/"],
   *       ["3", "c/", "", ""]
   *  ];
   *
   *  // Specification for input/output of a transition must have the following
   *  // form : "i" | "i/" | "/o" | "i/o"
   *
   *  fsm = new Fsm (object);
   *  fsm.initWithMatrix (matrix);
   *
   * @name vs.core.Fsm#initWithMatrix 
   * @function
   * @param {Array} matrix
   */
  initWithMatrix : function (matrix)
  {
    // add state
    for (var i = 1; i < matrix[0].length; i++)
    { this.addState (matrix[0] [i]); }
    
    // add transition (add input / output)
    for (var i = 1; i < matrix.length; i++)
    {
      var from = matrix[i][0]

      for (var j = 1; j < matrix[0].length; j++)
      {
        var to = matrix[0][j];
        var i_o =  matrix [i][j];
        if (i_o)
        {
          var io_a = i_o.split ('/');
          if (io_a[0]) this.addInput (io_a[0]);
          if (io_a[1]) this.addOutput (io_a[1]);
          
          this.addTransition (from, to, io_a[0], io_a[1]);
        }
      }
    }
  },
  
  /*******************************************
              Managing inputs
  *******************************************/
  
  /**
   *  Add an imput to the fsm
   *  This input will be add to the list of input alphabet.
   *
   * @name vs.core.Fsm#addInput 
   * @function
   *
   * @param {string} input the new word that will be add to the alphabet
   */
  addInput : function (input)
  {
    if (!input || this.existInput (input)) { return; }
    
    this._list_input.push (input);
  },
  
  /**
   *  Return the input alphabet of the fsm
   *
   * @name vs.core.Fsm#getInputs 
   * @function
   *
   * @return {Array} the alphabet as a set of String
   */
  getInputs : function ()
  {
    return this._list_input.slice ();
  },

  /**
   *  Test if a word in inlcude in imput alphabet
   *
   * @name vs.core.Fsm#existInput 
   * @function
   *
   * @param {string} input the input
   * @return true is exists
   */
  existInput : function (input)
  {
    if (!input) { return; }
    
    return (this._list_input.findItem (input) > -1)
  },
    
  /*******************************************
              Managing outputs
  *******************************************/
  /**
   *  Add an ouput to the fsm
   *  This ouput will be add to the list of ouput alphabet.
   *
   * @name vs.core.Fsm#addOutput 
   * @function
   *
   * @param {string} output the new word that will be add to the alphabet
   */
  addOutput : function (output)
  {
    if (!output || this.existOutput (output)) { return; }
    
    this._list_output.push (output);
  },

  /**
   *  Return the ouput alphabet of the fsm
   *
   * @name vs.core.Fsm#getOutputs 
   * @function
   *
   * @return the alphanet as a set of String
   */
  getOutputs : function ()
  {
    return this._list_output.slice ();
  },

  /**
   *  Test if a word in include in ouput alphabet
   *
   * @name vs.core.Fsm#existOutput 
   * @function
   *
   * @param {string} output the output
   * @return true is exists
   */
  existOutput : function (output)
  {
    if (!output) { return; }
    
    return (this._list_output.findItem (output) > -1)
  },
  
  /*******************************************
              Managing States
  *******************************************/
  /**
   *  Add a State to the fsm
   *
   * @name vs.core.Fsm#addState 
   * @function
   *
   * @param {string} name the new state name
   */
  addState : function (name)
  {
    if (!name || this.existState (name)) { return false; }
    
    var state = {};
    state.transitionEvents = {};
    
    this._list_of_state [name] = state;
    return true;
  },

  /**
   *  Remove a State from the fsm
   *
   * @name vs.core.Fsm#removeState 
   * @function
   *
   * @param {string} name the new state name
   */
  removeState : function (name)
  {
    if (!name || !this.existState (name)) { return false; }
        
    delete (this._list_of_state [name]);
    return true;
  },

  /**
   *  Rename a State of the fsm
   *
   * @name vs.core.Fsm#renameState 
   * @function
   *
   * @param {string} old_name the old state name
   * @param {string} new_name the new state name
   */
  renameState : function (old_name, new_name)
  {
    if (!old_name || !this.existState (old_name)) { return false; }
    if (!new_name || this.existState (new_name)) { return false; }
    
    // change state name
    this._list_of_state [new_name] = this._list_of_state [old_name];
    delete (this._list_of_state [old_name]);
    
    // rename initial state if need
    if (this._initial_state === old_name)
    {
      this._initial_state = new_name;
    }
    
    // change all transition to state with the new name
    for (var state_id in this._list_of_state)
    {
      var state = this._list_of_state [state_id];
      if (state === null) { continue; }
      
      for (var input in state.transitionEvents)
      {
        var t = state.transitionEvents [input];
        
        if (t.to === old_name)
        {
          t.to = new_name;
        }
      }
    }
    
    return true;
  },

  /**
   *  Get list of fsm State
   *
   * @name vs.core.Fsm#getListState 
   * @function
   *
   * @return {Array} list of states
   */
  getListState : function ()
  {
    var result = [];
    
    for (var key in this._list_of_state)
    {
      result.push (key);
    }
    return result;
  },

  /**
   *  Test existance of a state
   *
   * @name vs.core.Fsm#existState 
   * @function
   *
   * @param {string} state the state
   * @return true if state exists
   */
  existState : function (state)
  {
    if (!state) { return false; }
    
    if (this._list_of_state [state]) { return true; }
    return false;
  },
    
  /**
   *  Add a new transition from the state "from" to the state "to".
   *  The state from have to be already specified, otherwise, it will
   *  generate a exception.
   *
   * @name vs.core.Fsm#addTransition 
   * @function
   *
   * @param {string} from State from
   * @param {string} to State to
   * @param {string} on input lexem which cause the crossing of transition
   * @param {string} ouput optional ouput lexem that will be produce by the 
   *    crossing
   */
  addTransition : function (from, to, on, output)
  {
    if (!from || !this.existState (from)) { return; }
    if (!to || !this.existState (to)) { return; }
    if (!on || !this.existInput (on)) { return; }

    var transition = {
      on: on,
      to: to,
      output: output
    };
    this._list_of_state [from].transitionEvents [on] = transition;
  },

  /**
   *  Remove a transition from the state "from".
   *
   * @name vs.core.Fsm#removeTransitionFrom 
   * @function
   *
   * @param {string} from State from
   * @param {string} on input lexem which cause the crossing of transition
   */
  removeTransitionFrom : function (from, on)
  {
    if (!from || !this.existState (from)) { return; }
    if (!on || !this.existInput (on)) { return; }

    var state = this._list_of_state [from]
    if (state.transitionEvents [on])
    {
      delete (state.transitionEvents [on]);
    }
  },

  /**
   *  Remove a transition to the state "to".
   *
   * @name vs.core.Fsm#removeTransitionTo 
   * @function
   *
   * @param {string} tp State tp
   * @param {string} on input lexem which cause the crossing of transition
   */
  removeTransitionTo : function (to, on)
  {
    if (!to || !this.existState (to)) { return; }
    if (!on || !this.existInput (on)) { return; }
    
    
    for (var from in this._list_of_state)
    {
      var state = this._list_of_state [from];
      var t = state.transitionEvents [on];
      if (!t || t.to !== to) { continue; }
      
      delete (state.transitionEvents [on]);
    }
  },

  /**
   *  Return the list of transitions to the state set
   *
   * @name vs.core.Fsm#getTransionsToState 
   * @function
   *
   * @param {string} to State to
   * @return {Array} list of transitions
   */
  getTransionsToState : function (to)
  {
    if (!this.existState (to)) { return; }
    
    var result = [];
    
    for (var state_id in this._list_of_state)
    {
      var state = this._list_of_state [state_id];
      if (state === null) { continue; }
      
      for (var input in state.transitionEvents)
      {
        var t = state.transitionEvents [input];
        
        if (t.to !== to) { continue; }
        
        var tt = util.clone (t);
        tt.from = state_id;
        result.push (tt);
      }
    }
    
    return result;
  },

  /**
   *  Return the list of transitions from the state set
   *
   * @name vs.core.Fsm#getTransionsFromState 
   * @function
   *
   * @param {string} from State from
   * @return {Array} list of transitions
   */
  getTransionsFromState : function (from)
  {
    if (!this.existState (from)) { return; }
    
    var result = [];
    
    var state = this._list_of_state [from];
    if (state === null) { return null; }
    
    for (var inputs in state.transitionEvents)
    {
      var t = state.transitionEvents [inputs];
      
      var tt = util.clone (t);
      tt.from = from;
      result.push (tt);
    }
    
    return result;
  },

  /**
   *  Switch two states of the fsm
   *
   *  if states have transitions from or to them,
   *  the function reconfigures the transitions.
   *
   * @name vs.core.Fsm#switchStates 
   * @function
   *
   * @param {string} state_id1 State 
   * @param {string} state_id2 State 
   */
  switchStates : function (state_id1, state_id2)
  {
    if (state_id1 === state_id2) { return; }
   
    if (!this.existState (state_id1) || !this.existState (state_id2))
    { return; }
  
    // 1) get all transitions coming from arriving to state 1 and 2
    // 1.1) get all transitions
    var t_to_state1 = this.getTransionsToState (state_id1);
    var t_from_state1 = this.getTransionsFromState (state_id1);
    var t_to_state2 = this.getTransionsToState (state_id2);
    var t_from_state2 = this.getTransionsFromState (state_id2);
    
    // 1.2) remove doublons in case state_id1 is connected to state_id2
    //   and vise versa.
    for (var i = 0; i < t_to_state1.length;)
    {
      var t = t_to_state1 [i];
      if (t.from === state_id2) { t_to_state1.remove (t); }
      else { i++; }
    }
    for (var i = 0; i < t_from_state1.length;)
    {
      var t = t_from_state1 [i];
      if (t.to === state_id2) { t_from_state1.remove (t); }
      else { i++; }
    }

    // 2) remove all these transitions in order to reconfigure the fsm
    for (var i = 0; i < t_to_state1.length; i ++)
    {
      var t = t_to_state1 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    for (var i = 0; i < t_from_state1.length; i ++)
    {
      var t = t_from_state1 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    for (var i = 0; i < t_to_state2.length; i ++)
    {
      var t = t_to_state2 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    for (var i = 0; i < t_from_state2.length; i ++)
    {
      var t = t_from_state2 [i];
      this.removeTransitionFrom (t.from, t.on);
    }
    
    // 3) reconfigure the fsm
    for (var i = 0; i < t_to_state1.length; i ++)
    {
      var t = t_to_state1 [i];
      
      var from = (t.from === state_id2)?state_id1:t.from;
      this.addTransition (from, state_id2, t.on, t.output);
    }
    for (var i = 0; i < t_from_state1.length; i ++)
    {
      var t = t_from_state1 [i];

      var to = (t.from === state_id2)?state_id1:t.to;
      this.addTransition (state_id2, to, t.on, t.output);
    }
    for (var i = 0; i < t_to_state2.length; i ++)
    {
      var t = t_to_state2 [i];

      var from = (t.from === state_id1)?state_id2:t.from;
      this.addTransition (from, state_id1, t.on, t.output);
    }
    for (var i = 0; i < t_from_state2.length; i ++)
    {
      var t = t_from_state2 [i];

      var to = (t.to === state_id1)?state_id2:t.to;
      this.addTransition (state_id1, to, t.on, t.output);
    }
    
    if (this._initial_state === state_id1)
    { this._initial_state = state_id2; }
    else if (this._initial_state === state_id2)
    { this._initial_state = state_id1; }
  },
  
/*******************************************
            Managing Call
*******************************************/
  /**
   *   Build a event binding to an input lexem.
   *  To control the fsm and make it passes trought a transition, the
   *  programmer is able to directly fsmNotify a entry lexem to the fsm (see the
   *  general fsm documentation), or associate event source and spec to an
   *  input lexem, like event binding. <br /><br />
   *
   *  This method takes as parameter a pointer on the event source and the
   *  specification of the event.
   *
   * @name vs.core.Fsm#setInput 
   * @function
   *
   * @param {string} on input lexem on which is associated the event
   * @param {vs.core.EventSource} src the object source of the event
   * @param {string} spec the name of the event
   */
  setInput : function (on, src, event_spec)
  {
    if (!on || !src || !event_spec) { return; }
    
    if (src.bind)
    {
      src.bind (event_spec, this);
    }
    else if (src.addEventListener)
    {
      this.nodeBind (src, event_spec);
    }
    else { return; }

    var a = this._inputs [src];
    if (!a)
    {
      a = [];
      this._inputs [src] = a;
    }
    a.push ([event_spec, on, src]);
  },


  /**
   *   Associate an action to the generation of an output lexem.
   *  To make able the fsm to control the application, the programmer can
   *  associate an action to the generation of an ouput lexem when the fsm
   *  cross a transition.<br /><br />
   *
   *  This method takes as parameter a pointer on an action object and a
   *  optional user data.
   *
   * @name vs.core.Fsm#setOutput 
   * @function
   *
   * @param {string}output output lexem on which is associated the action
   * @param {function|string} action the function's name a function of the
   *        fsm owner
   */
  setOutput : function (output, action)
  {
    if (!output || !action) { return; }
    
    this._output_action [output] = action;
  },
  
/*******************************************
          Event managing methodes
*******************************************/

  /**
   *  Activate the FSM which start by the initial state.
   *  <p>
   *  Return false if no initial state is specified.
   *
   * @name vs.core.Fsm#activate 
   * @function
   *
   * @return {boolean} is activated
   */
  activate : function ()
  {
    if (!this._initial_state || !this._list_of_state [this._initial_state])
    { return false; }
    
    this.goTo (this._initial_state);
    return true;
  },
  
  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one ouput lexem can be generation when
   *  crossing a transition
   *  @private
   *
   * @name vs.core.Fsm#goTo 
   * @function
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   * @return {Boolean} is the transition was reached
   */
  goTo : function (state_id, output, event)
  {
    // manage output
    // TODO WARNING
    var state = undefined;
    
    if (!this.existState (state_id))
    { return false; }
    
    // hide old states view
    if (this._current_state)
    {
      state = this._list_of_state [this._current_state];
    }
    
    ///
    this._current_state = state_id;
    
    if (output && this._output_action [output])
    {
      var clb = this._output_action [output];
      if (clb instanceof Function)
      {
        clb.call (this.owner, event);
      }
      else if (util.isString (clb))
      {
        this.owner [this._output_action [output]] (event);
      }
    }
    
    return true;
  },
  
  /**
   *  Clear the fsm.
   *  All state, event and binding are deleted
   *
   * @name vs.core.Fsm#clear
   * @function
   */
  clear : function ()
  {
    this._list_of_state = {};
    
    delete (this._list_input);
    delete (this._list_output);
    
    this._list_input = new Array ();
    this._list_output = new Array ();
    
    this._initial_state = "";
    
    // remove input event bindings
    for (var key in this._inputs)
    {
      var a = this._inputs [key];
      
      for (var i = 0; i < a.length; i++)
      {
        var src = a [i][2];
        var event_spec = a [i][0];
        if (src.bind)
        {
          src.unbind (event_spec, this)
        }
        else if (src.addEventListener)
        {
          this.nodeUnbind (src, event_spec);
        }
      }
    }
    
    this._current_state = "";
  },
  
  /**
   *  @private
   *
   * @name vs.core.Fsm#notify 
   *
   * @param {Object} event the event
   * @function
   */
  notify : function (event)
  {
    var a = this._inputs [event.src];
    if (!a) { return; }
    
    for (var i = 0; i < a.length; i++)
    {
      var spec = a [i][0], on = a [i][1];
      if (event.type !== spec) continue;
      
      if (!this._list_of_state [this._current_state]) { continue; }
      
      this.fsmNotify (on, event.data);
    }
  },
  
  /**
   *  @public
   *
   * @name vs.core.Fsm#fsmNotify 
   * @function
   *
   * @param {String} on input
   * @return {Object} data associate to the event 
   */
  fsmNotify : function (on, data, instant)
  {
    if (!this._list_of_state [this._current_state]) { return; }
    
    var transition =
      this._list_of_state [this._current_state].transitionEvents [on];
      
    if (!transition) { return false; }
    
    this.goTo (transition.to, transition.output, {on: on, data: data}, instant);
    return true;
  }
};
util.extendClass (Fsm, EventSource);

/*****************************************************************
 *     Properties declaration
 ****************************************************************/

util.defineClassProperty (Fsm, "initialState", {
  /**
   *   Define the initiale state
   *   Generate a exception if the state was not already defined
   *
   *   @name vs.core.Fsm#initialState 
   *   @param {string} state_id the state
   */
  set : function (state_id)
  {
    if (!state_id)
    {
      this._initial_state = undefined;
      return;
    }
    
    if (!this.existState (state_id)) { return; }

    // set initial state and go to it   
    this._initial_state = state_id;
  },
  
  /**
   * @ignore
   */
  get : function ()
  {
    return this._initial_state;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/**
 * @private
 */
core.Fsm = Fsm;
