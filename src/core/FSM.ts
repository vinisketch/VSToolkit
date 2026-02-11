import { isFunction, isString } from 'vs_utils';
import { createId } from './Core';
import { EventSource } from "./event";
import Component from "./Component";
import { Action } from "./Action";

interface Arc {
  to: string;
  on: string;
  output: string;
}

export interface Transition extends Arc {
  from: string;
}

export class State {
  transitionEvents = new Map<string, Arc>();
}

type InputInfo = [string, string, EventSource];

/**
 *  The Fsm class
 *
 *  @extends core.EventSource
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
 *   <li />only one output lexeme can be generated when crossing a transition.
 *  </ul>
 *
 *  Simple example to create a automata:
 *  @example
 *
 *   var my_fsm = new core.Fsm (object);
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
 *   Creates a new core.Fsm.
 *
 *
 * @param {core.Object} owner the Object using this Fsm [mandatory]
 */
export class Fsm extends Component {

  readonly #listOfState = new Map<string, State>();   ///< List of fsm state : Q
  readonly #listInput = new Set<string>();   ///< List of input lexeme (alphabet) : I
  readonly #listOutput = new Set<string>();  ///< List of output lexeme (alphabet) : O

  #initialState = "";  ///< initial state name
  #currentState = "";  ///< current state name

  readonly #inputs = new Map<EventSource, InputInfo[]>();
  readonly #outputAction = new Map<string, string | Function>();

  constructor(private readonly owner: Component) {
    super(createId());
  }

  /**
   *   Define the initiale state
   *   Generate an exception if the state was not already defined
   *
   *   @name core.Fsm#initialState
   *   @param {string} stateId the state
   */
  set initialState(stateId: string) {
    if (!stateId) {
      this.#initialState = undefined;
      return;
    }

    if (!this.existState(stateId)) {
      return;
    }

    // set initial state and go to it
    this.#initialState = stateId;
  }

  /**
   * @ignore
   */
  get initialState(): string {
    return this.#initialState;
  }

  /*****************************************************************
   *     Generic function
   ****************************************************************/

  /**
   * @priva
   *
   * @param {core.Object} obj The cloned object
   * @param {Object} map Map of cloned objects
   */
  // _clone(obj, cloned_map) {
  //   super._clone(obj, cloned_map);
  //
  //   obj.owner = obj.__config__.owner;
  //   obj.#currentState = "";
  //
  //   obj.#inputs = {};
  //   obj._output_action = {};
  //
  //   // XXX TODO WARNING il faut refaire in inputs en outputs.
  // }

  /**
   *  Full facility constructor that takes specification of the fsm as
   *  parameter.
   *  transitions is an array of object {from, to, on, output}
   *
   * @param {Array} states is an array of state
   * @param {Array} inputs is an array of input
   * @param {Array} outputs is an array of output
   * @param {Array} transitions is an array of object {from, to, on, output}
   */
  initWithData(states: any[], inputs: any[], outputs: any[], transitions: Transition[]) {
    if (!states || !inputs || !outputs || !transitions) {
      return;
    }

    states.forEach(state => this.addState(state));
    inputs.forEach(input => this.addInput(input));
    outputs.forEach(output => this.addOutput(output));
    transitions.forEach(transition => this.addTransition(
      transition.from, transition.to,
      transition.on, transition.output,
    ));
  }

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
   * @param {Array} matrix
   */
  initWithMatrix(matrix: string[][]) {
    // add state
    for (let i = 1; i < matrix[0].length; i++) {
      this.addState(matrix[0] [i]);
    }

    // add transition (add input / output)
    for (let i = 1; i < matrix.length; i++) {
      let from = matrix[i][0]

      for (let j = 1; j < matrix[0].length; j++) {
        let to = matrix[0][j];
        let i_o = matrix [i][j];
        if (i_o) {
          let io_a = i_o.split('/');
          if (io_a[0]) this.addInput(io_a[0]);
          if (io_a[1]) this.addOutput(io_a[1]);

          this.addTransition(from, to, io_a[0], io_a[1]);
        }
      }
    }
  }

  /*******************************************
   Managing inputs
   *******************************************/

  /**
   *  Add an imput to the fsm
   *  This input will be added to the list of input alphabet.
   *
   * @param {string} input the new word that will be added to the alphabet
   */
  addInput(input: string) {
    if (!input || this.existInput(input)) {
      return;
    }

    this.#listInput.add(input);
  }

  /**
   *  Return the input alphabet of the fsm
   *
   * @return {Array} the alphabet as a set of String
   */
  getInputs(): Iterator<string> {
    return this.#listInput.values();
  }

  /**
   *  Test if a word in inlcude in imput alphabet
   *
   * @param {string} input the input
   * @return true is exists
   */
  existInput(input: string): boolean {
    return this.#listInput.has(input);
  }

  /*******************************************
   Managing outputs
   *******************************************/
  /**
   *  Add an ouput to the fsm
   *  This ouput will be added to the list of ouput alphabet.
   *
   * @param {string} output the new word that will be added to the alphabet
   */
  addOutput(output: string) {
    if (!output || this.existOutput(output)) {
      return;
    }

    this.#listOutput.add(output);
  }

  /**
   *  Return the output alphabet of the fsm
   *
   * @return the alphabet as a set of String
   */
  getOutputs(): IterableIterator<string> {
    return this.#listOutput.values();
  }

  /**
   *  Test if a word in include in output alphabet
   *
   * @param {string} output the output
   * @return true is exists
   */
  existOutput(output: string): boolean {
    return this.#listOutput.has(output)
  }

  /*******************************************
   Managing States
   *******************************************/
  /**
   *  Add a State to the fsm
   *
   * @param {string} name the new state name
   */
  addState(name: string): boolean {
    if (!name || this.existState(name)) {
      return false;
    }

    const state = new State();

    this.#listOfState.set(name, state);
    return true;
  }

  /**
   *  Remove a State from the fsm
   *
   * @param {string} name the new state name
   */
  removeState(name: string): boolean {
    if (!name || !this.existState(name)) {
      return false;
    }

    this.#listOfState.delete(name);
    return true;
  }

  /**
   *  Rename a State of the fsm
   *
   * @param {string} oldName the old state name
   * @param {string} newName the new state name
   */
  renameState(oldName: string, newName: string): boolean {
    if (!oldName || !this.existState(oldName) || !newName || this.existState(newName)) {
      return false;
    }

    // change state name
    this.#listOfState.set(newName, this.#listOfState.get(oldName));
    this.#listOfState.delete(oldName)

    // rename initial state if need
    if (this.#initialState === oldName) {
      this.#initialState = newName;
    }

    // change all transition to state with the new name
    for (const state of this.#listOfState.values()) {
      for (const t of state?.transitionEvents.values() ?? []) {
        if (t.to === oldName) {
          t.to = newName;
        }
      }
    }

    return true;
  }

  /**
   *  Get list of fsm State
   *
   * @return {Array} list of states
   */
  getListState(): IterableIterator<State> {
    return this.#listOfState.values();
  }

  /**
   *  Test existence of a state
   *
   * @param {string} state the state
   * @return true if state exists
   */
  existState(state: string): boolean {
    return this.#listOfState.has(state);
  }

  /**
   *  Add a new transition from the state "from" to the state "to".
   *  The state from have to be already specified, otherwise, it will
   *  generate an exception.
   *
   *
   * @param {string} from State from
   * @param {string} to State to
   * @param {string} on input lexeme which cause the crossing of transition
   * @param output
   *    crossing
   */
  addTransition(from: string, to: string, on: string, output: string) {
    if (!from || !this.existState(from)) {
      return;
    }
    if (!to || !this.existState(to)) {
      return;
    }
    if (!on || !this.existInput(on)) {
      return;
    }

    const arc: Arc = {
      on: on,
      to: to,
      output: output,
    };
    this.#listOfState.get(from).transitionEvents.set(on, arc);
  }

  /**
   *  Remove a transition from the state "from".
   *
   * @param {string} from State from
   * @param {string} on input lexeme which cause the crossing of transition
   */
  removeTransitionFrom(from: string, on: string) {
    if (!from || !this.existState(from) || !on || !this.existInput(on)) {
      return;
    }

    const state = this.#listOfState.get(from);
    state?.transitionEvents.delete(on);
  }

  /**
   *  Remove a transition to the state "to".
   *
   * @param {string} tp State tp
   * @param {string} on input lexeme which cause the crossing of transition
   */
  removeTransitionTo(to: string, on: string) {
    if (!to || !this.existState(to)) {
      return;
    }
    if (!on || !this.existInput(on)) {
      return;
    }

    for (const from in this.#listOfState) {
      const state = this.#listOfState.get(from);
      const t = state.transitionEvents.get(on);
      if (t?.to !== to) {
        continue;
      }

      state.transitionEvents.delete(on);
    }
  }

  /**
   *  Return the list of transitions to the state set
   *
   * @param {string} to State to
   * @return {Array} list of transitions
   */
  getTransitionsToState(to: string): Transition[] {
    if (!this.existState(to)) {
      return [];
    }

    const result: Transition[] = [];

    for (const [stateId, state] of this.#listOfState.entries()) {
      for (const t of state?.transitionEvents.values() ?? []) {
        if (t.to !== to) {
          continue;
        }

        const tt: Transition = {
          ...t,
          from: stateId,
        }
        result.push(tt);
      }
    }

    return result;
  }

  /**
   *  Return the list of transitions from the state set
   *
   * @param {string} from State from
   * @return {Array} list of transitions
   */
  getTransitionsFromState(from: string): Transition[] | undefined {
    if (!this.existState(from)) {
      return;
    }

    const result: Transition[] = [];

    const state = this.#listOfState.get(from);
    if (!state) {
      return undefined;
    }

    for (const input in state.transitionEvents) {
      const t = state.transitionEvents.get(input);

      const tt: Transition = {
        ...t,
        from: from,
      }
      result.push(tt);
    }

    return result;
  }

  /**
   *  Switch two states of the fsm
   *
   *  if states have transitions from or to them,
   *  the function reconfigures the transitions.
   *
   *
   * @param {string} stateId1 State
   * @param {string} stateId2 State
   */
  switchStates(stateId1: string, stateId2: string) {
    if (stateId1 === stateId2) {
      return;
    }

    if (!this.existState(stateId1) || !this.existState(stateId2)) {
      return;
    }

    // 1) get all transitions coming from arriving to state 1 and 2
    // 1.1) get all transitions
    const t_to_state1 = this.getTransitionsToState(stateId1);
    const t_from_state1 = this.getTransitionsFromState(stateId1);
    const t_to_state2 = this.getTransitionsToState(stateId2);
    const t_from_state2 = this.getTransitionsFromState(stateId2);

    // 1.2) remove duplicate in case stateId1 is connected to stateId2
    //   and vise versa.
    for (let i = 0; i < t_to_state1.length;) {
      const t = t_to_state1 [i];
      if (t.from === stateId2) {
        t_to_state1.splice(i, 1);
      } else {
        i++;
      }
    }
    for (let i = 0; i < t_from_state1.length;) {
      const t = t_from_state1 [i];
      if (t.to === stateId2) {
        t_from_state1.splice(i, 1);
      } else {
        i++;
      }
    }

    // 2) remove all these transitions in order to reconfigure the fsm
    for (let t of t_to_state1) {
      this.removeTransitionFrom(t.from, t.on);
    }
    for (let t of t_from_state1) {
      this.removeTransitionFrom(t.from, t.on);
    }
    for (let t of t_to_state2) {
      this.removeTransitionFrom(t.from, t.on);
    }
    for (let t of t_from_state2) {
      this.removeTransitionFrom(t.from, t.on);
    }

    // 3) reconfigure the fsm
    for (let t of t_to_state1) {
      const from = (t.from === stateId2) ? stateId1 : t.from;
      this.addTransition(from, stateId2, t.on, t.output);
    }
    for (let t of t_from_state1) {
      const to = (t.from === stateId2) ? stateId1 : t.to;
      this.addTransition(stateId2, to, t.on, t.output);
    }
    for (let t of t_to_state2) {
      const from = (t.from === stateId1) ? stateId2 : t.from;
      this.addTransition(from, stateId1, t.on, t.output);
    }
    for (let t of t_from_state2) {
      const to = (t.to === stateId1) ? stateId2 : t.to;
      this.addTransition(stateId1, to, t.on, t.output);
    }

    if (this.#initialState === stateId1) {
      this.#initialState = stateId2;
    } else if (this.#initialState === stateId2) {
      this.#initialState = stateId1;
    }
  }

  /*******************************************
   Managing Call
   *******************************************/
  /**
   *   Build a event binding to an input lexeme.
   *  To control the fsm and make it passes through a transition, the
   *  programmer is able to directly fsmNotify a entry lexeme to the fsm (see the
   *  general fsm documentation), or associate event source and spec to an
   *  input lexeme, like event binding. <br /><br />
   *
   *  This method takes as parameter a pointer on the event source and the
   *  specification of the event.
   *
   *
   * @param {string} on input lexeme on which is associated the event
   * @param {core.EventSource} src the object source of the event
   * @param eventSpec
   */
  setInput(on: string, src: EventSource, eventSpec: string) {
    if (!on || !src || !eventSpec) {
      return;
    }

    if (src.bind) {
      src.bind(eventSpec, this, this.handleEvent);
    // } else if (src.addEventListener) {
    //   this.nodeBind(src, eventSpec);
    } else {
      return;
    }

    let a = this.#inputs.get(src);
    if (!a) {
      a = [];
      this.#inputs.set(src, a);
    }
    a.push([eventSpec, on, src]);
  }


  /**
   *   Associate an action to the generation of an output lexeme.
   *  To make able the fsm to control the application, the programmer can
   *  associate an action to the generation of an output lexeme when the fsm
   *  cross a transition.<br /><br />
   *
   *  This method takes as parameter a pointer on an action object and a
   *  optional user data.
   *
   *
   * @param {string}output output lexeme on which is associated the action
   * @param {function|string} action the function's name a function of the
   *        fsm owner
   */
  setOutput(output: string, action: string | Function): void {
    if (!output || !action) {
      return;
    }

    this.#outputAction.set(output, action);
  }

  /*******************************************
   Event managing methods
   *******************************************/

  /**
   *  Activate the FSM which start by the initial state.
   *  <p>
   *  Return false if no initial state is specified.
   *
   *
   * @return {boolean} is activated
   */
  activate(): boolean {
    if (!this.#initialState || !this.#listOfState.has(this.#initialState)) {
      return false;
    }

    this.goTo(this.#initialState);
    return true;
  }

  /**
   *  Private method use by the fsm to cross a transition.
   *  @note for the moment only one output lexeme can be generation when
   *  crossing a transition
   *  @private
   *
   *
   * @param {String} id_sate the id of target state.
   * @param {String} output
   * @param {Object} event the event
   * @return {Boolean} is the transition was reached
   */
  goTo(stateId: string, output?: string, event?: Event) {
    // manage output
    // TODO WARNING
    let state;

    if (!this.existState(stateId)) {
      return false;
    }

    // hide old states view
    if (this.#currentState) {
      state = this.#listOfState.get(this.#currentState);
    }

    ///
    this.#currentState = stateId;

    if (output && this.#outputAction.get(output)) {
      const clb = this.#outputAction.get(output);
      if (isFunction(clb)) {
        clb.call(this.owner, event);
      } else if (isString(clb)) {
        // @ts-ignore
        const func = this.owner[clb];
        if (isFunction(func)) {
          func(event);
        }
      }
    }

    return true;
  }

  /**
   *  Clear the fsm.
   *  All state, event and binding are deleted
   *
   */
  clear(): void {
    this.#listOfState.clear();

    this.#listInput.clear();
    this.#listOutput.clear();

    this.#initialState = "";

    // remove input event bindings
    for (const [, a] of this.#inputs.entries()) {
      for (let [eventSpec, , src] of a) {
        if (src.bind) {
          src.unbind(eventSpec, this, this.handleEvent)
        // } else if (src.addEventListener) {
        //   this.nodeUnbind(src, event_spec);
        }
      }
    }

    this.#currentState = "";
  }

  /**
   *  @private
   *
   *
   * @param {Object} event the event
   */
  private readonly handleEvent = (event: Event): void => {
    // @ts-ignore
    const a = this.#inputs.get(event.src);
    if (!a) {
      return;
    }

    for (let [spec, on,] of a) {
      if (event.type !== spec) continue;

      if (!this.#listOfState.has(this.#currentState)) {
        continue;
      }

      // @ts-ignore
      this.fsmNotify(on, event.data);
    }
  }

  /**
   *  Returns the state accessible on the given input from the current state.
   *  Returns undefined in no state is accessible.
   *
   * @public
   *
   * @param {String} on input
   * @return {Object} the state
   */
  getAccessibleStateOn(on: string): State | undefined {
    if (!this.#listOfState.has(this.#currentState)) {
      return;
    }

    const transition = this.#listOfState.get(this.#currentState)?.transitionEvents.get(on);

    if (!transition) {
      return;
    }

    return this.#listOfState.get(transition.to);
  }

  /**
   *  @public
   *
   *
   * @param {String} on input
   * @return {Object} data associate to the event
   */
  fsmNotify(on: string, data: any) {
    if (!this.#listOfState.has(this.#currentState)) {
      return;
    }

    const transition =
      this.#listOfState.get(this.#currentState).transitionEvents.get(on);

    if (!transition) {
      return false;
    }

    // @ts-ignore
    this.goTo(transition.to, transition.output, { on, data: data });
    return true;
  }
}

