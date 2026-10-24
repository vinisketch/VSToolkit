import { createId, isFunction, isString } from 'vs_utils';
import { EventSource, Event } from "./event";
import Component from "./Component";

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
 *  @extends core.Component
 *  @class
 *  Fsm defines a deterministic Finite-State-Machine (aka Finite-State
 *  Automaton), such as:
 *  <ul>
 *    <li />there is only one initial state;
 *    <li />there is no transition conditioned on a null input: every
 *      transition has an input;
 *    <li />there is only one transition for a given input and a given state.
 *  </ul>
 *
 *  A fsm is specified by:
 *  <ul>
 *    <li />Q, the set of states;
 *    <li />I, the input alphabet: the words that make the fsm cross a
 *      transition;
 *    <li />O, the output alphabet: the words produced when a transition is
 *      crossed;
 *    <li />E, the transitions: (from state, input, to state, optional output);
 *    <li />an initial state.
 *  </ul>
 *  States, inputs and outputs are declared before being used: using an
 *  unknown one throws.
 *
 *  activate() puts the fsm in its initial state (see currentState). Then the
 *  fsm crosses the transition of its current state for each input it
 *  receives, and ignores the inputs without transition. activate() again goes
 *  back to the initial state.<br /><br />
 *
 *  Inputs are received:
 *  <ul>
 *    <li />from events, by associating an event of a source to an input with
 *      setInput();
 *    <li />or by calling fsmNotify(input, data).
 *  </ul>
 *
 *  Outputs are associated to transitions (Mealy machine). When a transition
 *  with an output is crossed, the fsm:
 *  <ul>
 *    <li />calls the action associated to the output with setOutput(), with
 *      the fsm owner as this;
 *    <li />then dispatches an event named after the output, with the data of
 *      the input; bind it or listen to it on the fsm.
 *  </ul>
 *  Known limitation: only one output can be produced when crossing a
 *  transition.
 *
 *  @example
 *  const fsm = new Fsm(owner);
 *  // states, inputs and outputs declaration
 *  fsm.addState('1');
 *  fsm.addState('2');
 *  fsm.addInput('a');
 *  fsm.addInput('b');
 *  fsm.addOutput('c');
 *  fsm.addOutput('d');
 *  // transitions declaration: 1 -a/c-> 2 -b/d-> 1
 *  fsm.addTransition('1', '2', 'a', 'c');
 *  fsm.addTransition('2', '1', 'b', 'd');
 *  // initial state declaration
 *  fsm.initialState = '1';
 *
 *  // "a" is received when the button emits 'select'
 *  fsm.setInput('a', aButton, 'select');
 *  // owner.onSelect is called when crossing a transition with the output "c"
 *  fsm.setOutput('c', 'onSelect');
 *  // the fsm also dispatches the event "d"
 *  fsm.addEventListener('d', (event) => { … });
 *
 *  // activate the FSM: it is in the state "1"
 *  fsm.activate();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new core.Fsm.
 *
 * @param {core.Component} owner the component using this fsm: the output
 *        actions are called with it as this [mandatory]
 */
export class Fsm extends Component {

  readonly #listOfState = new Map<string, State>();   ///< List of fsm state : Q
  readonly #listInput = new Set<string>();   ///< List of input lexeme (alphabet) : I
  readonly #listOutput = new Set<string>();  ///< List of output lexeme (alphabet) : O

  #initialState = '';  ///< initial state name
  #currentState = '';  ///< current state name

  readonly #inputs = new Map<EventSource, InputInfo[]>();
  readonly #outputAction = new Map<string, string | Function>();

  constructor(private readonly owner: Component) {
    super(createId());
  }

  /**
   *  The initial state, used by activate(); '' for none.
   *  Setting an unknown state throws.
   *
   *  @name core.Fsm#initialState
   *  @param {string} stateId the state
   */
  set initialState(stateId: string) {
    // no initial state
    if (!stateId) {
      this.#initialState = '';
      return;
    }

    this.#checkState(stateId);
    this.#initialState = stateId;
  }

  /**
   * @ignore
   */
  get initialState(): string {
    return this.#initialState;
  }

  /**
   *  The current state (read only): '' until the fsm is activated, or when
   *  the current state is removed or the fsm is cleared.
   *
   *  @name core.Fsm#currentState
   */
  get currentState(): string {
    return this.#currentState;
  }

  /**
   *  Declares the states, inputs, outputs and transitions of the fsm.
   *  Throws if a list is missing, or if a transition uses an unknown state,
   *  input or output.
   *
   *  @example
   *  // 1 -a/x-> 2 -b-> 1
   *  fsm.initWithData(['1', '2'], ['a', 'b'], ['x'], [
   *    { from: '1', to: '2', on: 'a', output: 'x' },
   *    { from: '2', to: '1', on: 'b', output: '' },
   *  ]);
   *
   * @param {Array<string>} states the states
   * @param {Array<string>} inputs the inputs
   * @param {Array<string>} outputs the outputs
   * @param {Array<Transition>} transitions the transitions {from, to, on, output}
   */
  initWithData(states: string[], inputs: string[], outputs: string[], transitions: Transition[]) {
    if (!states || !inputs || !outputs || !transitions) {
      throw new TypeError('Fsm.initWithData: states, inputs, outputs and transitions are mandatory');
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
   *  Declares the fsm from a state x state matrix:
   *  <ul>
   *    <li />the first row lists the "to" states, and declares them;
   *    <li />the first column lists the "from" states, which must be in the
   *      first row;
   *    <li />each other cell is empty (no transition), or the transition from
   *      the state of its row to the state of its column, as "input",
   *      "input/" or "input/output". Its input and output are declared.
   *  </ul>
   *  Throws if the first row is missing, if a cell has no input (e.g. "/o"),
   *  or if a row's state is not in the first row.
   *
   *  @example
   *  // 1 -a-> 2 -b/x-> 3 -c-> 1
   *  fsm.initWithMatrix([
   *    ['',  '1',  '2',  '3'  ],
   *    ['1', '',   'a',  ''   ],
   *    ['2', '',   '',   'b/x'],
   *    ['3', 'c/', '',   ''   ],
   *  ]);
   *
   * @param {Array<Array<string>>} matrix
   */
  initWithMatrix(matrix: string[][]) {
    if (!matrix?.[0]) {
      throw new TypeError('Fsm.initWithMatrix: the matrix needs a first row listing the states');
    }

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
          if (!io_a[0]) {
            throw new Error(`Fsm.initWithMatrix: the transition "${i_o}" from "${from}" to "${to}" has no input`);
          }
          this.addInput(io_a[0]);
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
   *  Declares an input (a word of the input alphabet).
   *  Declaring it again does nothing; an empty input throws.
   *
   * @param {string} input the input
   */
  addInput(input: string) {
    if (!input) {
      throw new Error('Fsm.addInput: the input is empty');
    }
    if (this.existInput(input)) {
      return;
    }

    this.#listInput.add(input);
  }

  /**
   *  Returns the declared inputs
   *
   * @return {Iterator<string>} the inputs
   */
  getInputs(): IterableIterator<string> {
    return this.#listInput.values();
  }

  /**
   *  Tests if an input is declared
   *
   * @param {string} input the input
   * @return {boolean} true if it is declared
   */
  existInput(input: string): boolean {
    return this.#listInput.has(input);
  }

  /*******************************************
   Managing outputs
   *******************************************/
  /**
   *  Declares an output (a word of the output alphabet).
   *  Declaring it again does nothing; an empty output throws.
   *
   * @param {string} output the output
   */
  addOutput(output: string) {
    if (!output) {
      throw new Error('Fsm.addOutput: the output is empty');
    }
    if (this.existOutput(output)) {
      return;
    }

    this.#listOutput.add(output);
  }

  /**
   *  Returns the declared outputs
   *
   * @return {Iterator<string>} the outputs
   */
  getOutputs(): IterableIterator<string> {
    return this.#listOutput.values();
  }

  /**
   *  Tests if an output is declared
   *
   * @param {string} output the output
   * @return {boolean} true if it is declared
   */
  existOutput(output: string): boolean {
    return this.#listOutput.has(output)
  }

  /*******************************************
   Validation: throw on an unknown name
   *******************************************/

  #checkState(name: string): void {
    if (!name || !this.existState(name)) {
      throw new Error(`Fsm: unknown state "${name}"`);
    }
  }

  #checkInput(input: string): void {
    if (!input || !this.existInput(input)) {
      throw new Error(`Fsm: unknown input "${input}"`);
    }
  }

  #checkOutput(output: string): void {
    if (!output || !this.existOutput(output)) {
      throw new Error(`Fsm: unknown output "${output}"`);
    }
  }

  /*******************************************
   Managing States
   *******************************************/
  /**
   *  Declares a state
   *
   * @param {string} name the state name
   * @return {boolean} false if the name is empty or the state already exists
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
   *  Removes a state, and the transitions to it.
   *  The initial and current states become '' if they were the removed state.
   *
   * @param {string} name the state name
   * @return {boolean} false if the state does not exist
   */
  removeState(name: string): boolean {
    if (!name || !this.existState(name)) {
      return false;
    }

    this.#listOfState.delete(name);

    // remove the transitions to the removed state
    for (const state of this.#listOfState.values()) {
      for (const [on, arc] of state.transitionEvents) {
        if (arc.to === name) state.transitionEvents.delete(on);
      }
    }

    if (this.#initialState === name) this.#initialState = '';
    if (this.#currentState === name) this.#currentState = '';

    return true;
  }

  /**
   *  Renames a state. The transitions to it, and the initial and current
   *  states, follow.
   *
   * @param {string} oldName the old state name
   * @param {string} newName the new state name
   * @return {boolean} false if the old state does not exist or the new one
   *         already exists
   */
  renameState(oldName: string, newName: string): boolean {
    if (!oldName || !this.existState(oldName) || !newName || this.existState(newName)) {
      return false;
    }

    // change state name
    this.#listOfState.set(newName, this.#listOfState.get(oldName)!);
    this.#listOfState.delete(oldName)

    // rename initial and current states if need
    if (this.#initialState === oldName) {
      this.#initialState = newName;
    }
    if (this.#currentState === oldName) {
      this.#currentState = newName;
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
   *  Returns the states (State objects, without their names)
   *
   * @return {Iterator<State>} the states
   */
  getListState(): IterableIterator<State> {
    return this.#listOfState.values();
  }

  /**
   *  Tests if a state is declared
   *
   * @param {string} state the state
   * @return {boolean} true if it is declared
   */
  existState(state: string): boolean {
    return this.#listOfState.has(state);
  }

  /**
   *  Adds the transition from the state "from" to the state "to", on the
   *  input "on". It replaces the transition of "from" on "on", if any.
   *  The states, the input and the output (if any) must be declared,
   *  otherwise it throws.
   *
   * @param {string} from the state the transition starts from
   * @param {string} to the state the transition goes to
   * @param {string} on the input crossing the transition
   * @param {string} output the output produced when crossing it [optional]
   */
  addTransition(from: string, to: string, on: string, output?: string) {
    this.#checkState(from);
    this.#checkState(to);
    this.#checkInput(on);
    if (output) this.#checkOutput(output);

    const arc: Arc = {
      on: on,
      to: to,
      output: output ?? '',
    };
    this.#listOfState.get(from)!.transitionEvents.set(on, arc);
  }

  /**
   *  Removes the transition of the state "from" on the input "on" (nothing
   *  happens if there is none). Throws for an unknown state or input.
   *
   * @param {string} from the state the transition starts from
   * @param {string} on the input of the transition
   */
  removeTransitionFrom(from: string, on: string) {
    this.#checkState(from);
    this.#checkInput(on);

    this.#listOfState.get(from)!.transitionEvents.delete(on);
  }

  /**
   *  Removes the transitions to the state "to" on the input "on", from every
   *  state (nothing happens if there is none). Throws for an unknown state
   *  or input.
   *
   * @param {string} to the state the transitions go to
   * @param {string} on the input of the transitions
   */
  removeTransitionTo(to: string, on: string) {
    this.#checkState(to);
    this.#checkInput(on);

    for (const state of this.#listOfState.values()) {
      const t = state.transitionEvents.get(on);
      if (t?.to !== to) {
        continue;
      }

      state.transitionEvents.delete(on);
    }
  }

  /**
   *  Returns the transitions to a state (copies), [] for an unknown state
   *
   * @param {string} to the state
   * @return {Array<Transition>} the transitions
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
   *  Returns the transitions from a state (copies), [] for an unknown state
   *
   * @param {string} from the state
   * @return {Array<Transition>} the transitions
   */
  getTransitionsFromState(from: string): Transition[] {
    const state = this.#listOfState.get(from);
    if (!state) {
      return [];
    }

    const result: Transition[] = [];

    for (const t of state.transitionEvents.values()) {
      const tt: Transition = {
        ...t,
        from: from,
      }
      result.push(tt);
    }

    return result;
  }

  /**
   *  Switches the names of two states: each state keeps its transitions, and
   *  the transitions to the two states, the initial and the current states
   *  follow. Throws for an unknown state; does nothing for the same state.
   *
   * @param {string} stateId1 a state
   * @param {string} stateId2 another state
   */
  switchStates(stateId1: string, stateId2: string) {
    if (stateId1 === stateId2) {
      return;
    }

    this.#checkState(stateId1);
    this.#checkState(stateId2);
    const state1 = this.#listOfState.get(stateId1)!;
    const state2 = this.#listOfState.get(stateId2)!;

    // switching two states is switching their names: the states keep their
    // transitions, and the transitions to them follow
    this.#listOfState.set(stateId1, state2);
    this.#listOfState.set(stateId2, state1);

    const switchName = (name: string): string =>
      (name === stateId1) ? stateId2 : (name === stateId2) ? stateId1 : name;

    for (const state of this.#listOfState.values()) {
      for (const arc of state.transitionEvents.values()) {
        arc.to = switchName(arc.to);
      }
    }

    this.#initialState = switchName(this.#initialState);
    this.#currentState = switchName(this.#currentState);
  }

  /*******************************************
   Inputs and outputs binding
   *******************************************/
  /**
   *  Associates an event of a source to an input: each time the source
   *  dispatches the event, the fsm receives the input (see fsmNotify), with
   *  the event data.<br />
   *  Several inputs can be associated to the same event: they are received
   *  in the order of association. Associating the same input and event again
   *  does nothing.<br />
   *  Throws for an unknown input, a source which is not an EventSource or an
   *  empty event specification.
   *
   * @param {string} on the input
   * @param {core.EventSource} src the source of the event
   * @param {string} eventSpec the event specification, e.g. 'select'
   */
  setInput(on: string, src: EventSource, eventSpec: string) {
    this.#checkInput(on);
    if (!src?.bind) {
      throw new TypeError('Fsm.setInput: the source must be an EventSource');
    }
    if (!eventSpec) {
      throw new Error('Fsm.setInput: the event specification is empty');
    }

    let a = this.#inputs.get(src);
    if (a?.some(([spec, input]) => spec === eventSpec && input === on)) {
      // already bound
      return;
    }

    // bind the source event once, whatever the number of inputs on it
    if (!a?.some(([spec]) => spec === eventSpec)) {
      src.bind(eventSpec, this, this.handleEvent);
    }

    if (!a) {
      a = [];
      this.#inputs.set(src, a);
    }
    a.push([eventSpec, on, src]);
  }


  /**
   *  Associates an action to an output: it is called each time the fsm
   *  crosses a transition producing this output, with the fsm owner as this
   *  and the input event (type: the input, src: the fsm) as parameter.
   *  The action may keep the event.<br />
   *  It replaces the previous action of the output. Throws for an unknown
   *  output, or an action which is not a function or a method name.
   *
   * @param {string} output the output
   * @param {Function|string} action a function, or the name of a method of
   *        the fsm owner
   */
  setOutput(output: string, action: string | Function): void {
    this.#checkOutput(output);
    if (!isFunction(action) && !(isString(action) && action)) {
      throw new TypeError('Fsm.setOutput: the action must be a function or a method name');
    }

    this.#outputAction.set(output, action);
  }

  /*******************************************
   Running
   *******************************************/

  /**
   *  Activates the fsm: its current state becomes the initial state (also
   *  when it is already activated). No output is produced.
   *
   * @return {boolean} false if there is no initial state
   */
  activate(): boolean {
    if (!this.#initialState || !this.#listOfState.has(this.#initialState)) {
      return false;
    }

    this.goTo(this.#initialState);
    return true;
  }

  /**
   *  Goes to a state, and produces the output: calls its action, then
   *  dispatches the output event.<br />
   *  Used by the fsm to cross a transition. It is public, but calling it
   *  directly goes to the state without crossing any transition.
   *
   * @param {string} stateId the state to go to
   * @param {string} output the output to produce [optional]
   * @param {Event} event the input event, given to the action [optional]
   * @return {boolean} false if the state does not exist
   */
  goTo(stateId: string, output?: string, event?: Event): boolean {
    if (!this.existState(stateId)) {
      return false;
    }

    this.#currentState = stateId;

    if (!output) {
      return true;
    }

    // 1) the action associated to the output
    const clb = this.#outputAction.get(output);
    if (isFunction(clb)) {
      clb.call(this.owner, event);
    } else if (isString(clb)) {
      const func = (this.owner as unknown as Record<string, unknown>)[clb];
      if (isFunction(func)) {
        func.call(this.owner, event);
      }
    }

    // 2) the output event, for the listeners of this fsm
    const outputEvent = Event.retain();
    // @ts-ignore data is private
    outputEvent.configure(output, event?.data);
    this.dispatchEvent(outputEvent);

    return true;
  }

  /**
   *  Clears the fsm: removes the states, inputs, outputs, transitions, the
   *  initial and current states, the output actions and the input bindings
   *  (the sources events are unbound).
   */
  clear(): void {
    this.#listOfState.clear();

    this.#listInput.clear();
    this.#listOutput.clear();

    this.#initialState = "";

    // remove input event bindings (bound once per source event)
    for (const [src, a] of this.#inputs.entries()) {
      for (const eventSpec of new Set(a.map(([spec]) => spec))) {
        src.unbind(eventSpec, this, this.handleEvent);
      }
    }
    this.#inputs.clear();

    this.#outputAction.clear();

    this.#currentState = "";
  }

  /**
   *  Receives the events bound by setInput(), and notifies their inputs
   *  @private
   *
   * @param {Event} event the event
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
   *  Returns the state the fsm would go to on the input, from its current
   *  state (the State object, without its name); undefined if there is no
   *  such transition or the fsm is not activated.
   *
   * @param {string} on the input
   * @return {State} the state
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
   *  Sends an input to the fsm: crosses the transition of the current state
   *  on this input, if any, and produces its output (see setOutput).
   *
   * @param {string} on the input
   * @param {any} data the data of the input, given to the output action
   *        (in the event) and to the output event
   * @return {boolean} true if a transition was crossed
   */
  fsmNotify(on: string, data: any): boolean {
    if (!this.#listOfState.has(this.#currentState)) {
      return false;
    }

    const transition = this.#listOfState.get(this.#currentState)?.transitionEvents.get(on);
    if (!transition) {
      return false;
    }

    // not released to the pool: an action may keep the event it receives
    const event = Event.retain();
    event.configure(on, data);
    event.src = this;
    event.srcTarget = this;

    return this.goTo(transition.to, transition.output, event);
  }
}

