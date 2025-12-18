import { EventSource } from "./event";
import Component from "./Component";
interface Arc {
    to: string;
    on: string;
    output: string;
}
export interface Transition extends Arc {
    from: string;
}
export declare class State {
    transitionEvents: Map<string, Arc>;
}
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
 *   <li />only one output lexem can be generated when crossing a transition.
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
export declare class Fsm extends Component {
    #private;
    private owner;
    constructor(owner: Component);
    /**
     *   Define the initiale state
     *   Generate an exception if the state was not already defined
     *
     *   @name core.Fsm#initialState
     *   @param {string} stateId the state
     */
    set initialState(stateId: string);
    /**
     * @ignore
     */
    get initialState(): string;
    /*****************************************************************
     *     Generic function
     ****************************************************************/
    /**
     * @priva
     *
     * @param {core.Object} obj The cloned object
     * @param {Object} map Map of cloned objects
     */
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
    initWithData(states: any[], inputs: any[], outputs: any[], transitions: Transition[]): void;
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
    initWithMatrix(matrix: string[][]): void;
    /*******************************************
     Managing inputs
     *******************************************/
    /**
     *  Add an imput to the fsm
     *  This input will be added to the list of input alphabet.
     *
     * @param {string} input the new word that will be added to the alphabet
     */
    addInput(input: string): void;
    /**
     *  Return the input alphabet of the fsm
     *
     * @return {Array} the alphabet as a set of String
     */
    getInputs(): Iterator<string>;
    /**
     *  Test if a word in inlcude in imput alphabet
     *
     * @param {string} input the input
     * @return true is exists
     */
    existInput(input: string): boolean;
    /*******************************************
     Managing outputs
     *******************************************/
    /**
     *  Add an ouput to the fsm
     *  This ouput will be added to the list of ouput alphabet.
     *
     * @param {string} output the new word that will be added to the alphabet
     */
    addOutput(output: string): void;
    /**
     *  Return the ouput alphabet of the fsm
     *
     * @return the alphanet as a set of String
     */
    getOutputs(): IterableIterator<string>;
    /**
     *  Test if a word in include in ouput alphabet
     *
     * @param {string} output the output
     * @return true is exists
     */
    existOutput(output: string): boolean;
    /*******************************************
     Managing States
     *******************************************/
    /**
     *  Add a State to the fsm
     *
     * @param {string} name the new state name
     */
    addState(name: string): boolean;
    /**
     *  Remove a State from the fsm
     *
     * @param {string} name the new state name
     */
    removeState(name: string): boolean;
    /**
     *  Rename a State of the fsm
     *
     * @param {string} oldName the old state name
     * @param {string} newName the new state name
     */
    renameState(oldName: string, newName: string): boolean;
    /**
     *  Get list of fsm State
     *
     * @return {Array} list of states
     */
    getListState(): IterableIterator<State>;
    /**
     *  Test existance of a state
     *
     * @param {string} state the state
     * @return true if state exists
     */
    existState(state: string): boolean;
    /**
     *  Add a new transition from the state "from" to the state "to".
     *  The state from have to be already specified, otherwise, it will
     *  generate an exception.
     *
     *
     * @param {string} from State from
     * @param {string} to State to
     * @param {string} on input lexem which cause the crossing of transition
     * @param output
     *    crossing
     */
    addTransition(from: string, to: string, on: string, output: string): void;
    /**
     *  Remove a transition from the state "from".
     *
     * @param {string} from State from
     * @param {string} on input lexem which cause the crossing of transition
     */
    removeTransitionFrom(from: string, on: string): void;
    /**
     *  Remove a transition to the state "to".
     *
     * @param {string} tp State tp
     * @param {string} on input lexem which cause the crossing of transition
     */
    removeTransitionTo(to: string, on: string): void;
    /**
     *  Return the list of transitions to the state set
     *
     * @param {string} to State to
     * @return {Array} list of transitions
     */
    getTransitionsToState(to: string): Transition[];
    /**
     *  Return the list of transitions from the state set
     *
     * @param {string} from State from
     * @return {Array} list of transitions
     */
    getTransitionsFromState(from: string): Transition[] | undefined;
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
    switchStates(stateId1: string, stateId2: string): void;
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
     *
     * @param {string} on input lexem on which is associated the event
     * @param {core.EventSource} src the object source of the event
     * @param eventSpec
     */
    setInput(on: string, src: EventSource, eventSpec: string): void;
    /**
     *   Associate an action to the generation of an output lexem.
     *  To make able the fsm to control the application, the programmer can
     *  associate an action to the generation of an ouput lexem when the fsm
     *  cross a transition.<br /><br />
     *
     *  This method takes as parameter a pointer on an action object and a
     *  optional user data.
     *
     *
     * @param {string}output output lexem on which is associated the action
     * @param {function|string} action the function's name a function of the
     *        fsm owner
     */
    setOutput(output: string, action: string | Function): void;
    /*******************************************
     Event managing methodes
     *******************************************/
    /**
     *  Activate the FSM which start by the initial state.
     *  <p>
     *  Return false if no initial state is specified.
     *
     *
     * @return {boolean} is activated
     */
    activate(): boolean;
    /**
     *  Private method use by the fsm to cross a transition.
     *  @note for the moment only one ouput lexem can be generation when
     *  crossing a transition
     *  @private
     *
     *
     * @param {String} id_sate the id of target state.
     * @param {String} output
     * @param {Object} event the event
     * @return {Boolean} is the transition was reached
     */
    goTo(stateId: string, output?: string, event?: Event): boolean;
    /**
     *  Clear the fsm.
     *  All state, event and binding are deleted
     *
     */
    clear(): void;
    /**
     *  @private
     *
     *
     * @param {Object} event the event
     */
    private handleEvent;
    /**
     *  Returns the state accessible on the given input from the current state.
     *  Returns undefined in no state is accessible.
     *
     * @public
     *
     * @param {String} on input
     * @return {Object} the state
     */
    getAccessibleStateOn(on: string): State | undefined;
    /**
     *  @public
     *
     *
     * @param {String} on input
     * @return {Object} data associate to the event
     */
    fsmNotify(on: string, data: any): boolean;
}
export {};
//# sourceMappingURL=FSM.d.ts.map