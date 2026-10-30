import assert from 'assert';

import '../../di_config';

import Component from '../../../src/core/Component';
import Event from '../../../src/core/event/Event';
import { Fsm, Transition } from '../../../src/core/FSM';

class Owner extends Component {
  readonly calls: [string, unknown, Event | undefined][] = [];

  onOutput(event?: Event): void {
    this.calls.push(['onOutput', this, event]);
  }
}

class Source extends Component {}

function transition(from: string, to: string, on: string, output = ''): Transition {
  return { from, to, on, output };
}

/**
 * 1 -a-> 2 -b-> 3 -c-> 1, with the outputs x, y, z
 */
function makeCycle(owner = new Owner()): Fsm {
  const fsm = new Fsm(owner);
  fsm.initWithData(['1', '2', '3'], ['a', 'b', 'c'], ['x', 'y', 'z'], [
    transition('1', '2', 'a', 'x'),
    transition('2', '3', 'b', 'y'),
    transition('3', '1', 'c', 'z'),
  ]);
  fsm.initialState = '1';
  return fsm;
}

function arcs(fsm: Fsm, states: string[]): string[] {
  return states
    .flatMap(state => fsm.getTransitionsFromState(state) ?? [])
    .map(t => `${t.from}-${t.on}->${t.to}`)
    .sort();
}

function makeEvent(type: string, data?: unknown): Event {
  const event = Event.retain();
  event.configure(type, data);
  return event;
}

async function flush(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setImmediate(resolve));
  }
}

describe('Fsm', function () {
  describe('id', function () {
    it('should get a generated unique id', function () {
      const first = new Fsm(new Owner());
      const second = new Fsm(new Owner());
      assert.ok(first.id);
      assert.notStrictEqual(first.id, second.id);
      assert.strictEqual(Component.instances.get(first.id), first);
    });
  });

  describe('states', function () {
    it('should list the names of the states', function () {
      assert.deepStrictEqual([...makeCycle().getListState()], ['1', '2', '3']);
    });

    it('should add, test and remove states', function () {
      const fsm = new Fsm(new Owner());
      assert.strictEqual(fsm.addState('1'), true);
      assert.strictEqual(fsm.existState('1'), true);
      assert.strictEqual(fsm.removeState('1'), true);
      assert.strictEqual(fsm.existState('1'), false);
    });

    it('should refuse an empty or an existing state', function () {
      const fsm = new Fsm(new Owner());
      fsm.addState('1');
      assert.strictEqual(fsm.addState(''), false);
      assert.strictEqual(fsm.addState('1'), false);
      assert.strictEqual(fsm.removeState('unknown'), false);
    });

    it('should rename a state, its transitions and the initial state', function () {
      const fsm = makeCycle();
      assert.strictEqual(fsm.renameState('1', 'one'), true);

      assert.strictEqual(fsm.existState('1'), false);
      assert.strictEqual(fsm.existState('one'), true);
      assert.strictEqual(fsm.initialState, 'one');
      assert.deepStrictEqual(arcs(fsm, ['one', '2', '3']), ['2-b->3', '3-c->one', 'one-a->2']);
    });

    it('should refuse to rename to an existing or unknown state', function () {
      const fsm = makeCycle();
      assert.strictEqual(fsm.renameState('1', '2'), false);
      assert.strictEqual(fsm.renameState('unknown', 'x'), false);
    });

    it('should keep working after renaming the current state', function () {
      const fsm = makeCycle();
      fsm.activate();

      fsm.renameState('1', 'one');
      assert.strictEqual(fsm.fsmNotify('a', null), true);
    });

    it('should remove the transitions to a removed state', function () {
      const fsm = makeCycle();
      fsm.removeState('2');
      assert.deepStrictEqual(arcs(fsm, ['1', '3']), ['3-c->1']);
    });

    it('should not cross a transition to a removed state', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.removeState('2');
      assert.strictEqual(fsm.fsmNotify('a', null), false);
    });

    it('should clear the initial state when it is removed', function () {
      const fsm = makeCycle();
      fsm.removeState('1');
      assert.strictEqual(fsm.initialState, '');
      assert.strictEqual(fsm.activate(), false);
    });
  });

  describe('inputs and outputs', function () {
    it('should add and test inputs, once', function () {
      const fsm = new Fsm(new Owner());
      fsm.addInput('a');
      fsm.addInput('a');
      assert.strictEqual(fsm.existInput('a'), true);
      assert.deepStrictEqual([...fsm.getInputs()], ['a']);
    });

    it('should add and test outputs, once', function () {
      const fsm = new Fsm(new Owner());
      fsm.addOutput('x');
      fsm.addOutput('x');
      assert.strictEqual(fsm.existOutput('x'), true);
      assert.deepStrictEqual([...fsm.getOutputs()], ['x']);
    });

    it('should throw for an empty input or output', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.addInput(''), /input is empty/);
      assert.throws(() => fsm.addOutput(''), /output is empty/);
    });
  });

  describe('transitions', function () {
    it('should add transitions between existing states on existing inputs', function () {
      const fsm = makeCycle();
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-a->2', '2-b->3', '3-c->1']);
    });

    it('should throw for a transition with an unknown state, input or output', function () {
      const fsm = makeCycle();
      assert.throws(() => fsm.addTransition('1', 'unknown', 'b'), /unknown state "unknown"/);
      assert.throws(() => fsm.addTransition('unknown', '1', 'b'), /unknown state "unknown"/);
      assert.throws(() => fsm.addTransition('1', '3', 'unknown'), /unknown input "unknown"/);
      assert.throws(() => fsm.addTransition('1', '3', ''), /unknown input ""/);
      assert.throws(() => fsm.addTransition('1', '3', 'b', 'unknown'), /unknown output "unknown"/);
      assert.deepStrictEqual(arcs(fsm, ['1']), ['1-a->2']);
    });

    it('should accept a transition without output', function () {
      const fsm = makeCycle();
      fsm.addTransition('1', '3', 'b');
      assert.deepStrictEqual(fsm.getTransitionsFromState('1').find(t => t.on === 'b'), transition('1', '3', 'b'));
    });

    it('should throw when removing a transition of an unknown state or input', function () {
      const fsm = makeCycle();
      assert.throws(() => fsm.removeTransitionFrom('unknown', 'a'), /unknown state/);
      assert.throws(() => fsm.removeTransitionFrom('1', 'unknown'), /unknown input/);
      assert.throws(() => fsm.removeTransitionTo('unknown', 'a'), /unknown state/);
      assert.throws(() => fsm.removeTransitionTo('2', 'unknown'), /unknown input/);
    });

    it('should do nothing when removing a transition which does not exist', function () {
      const fsm = makeCycle();
      fsm.removeTransitionFrom('1', 'b');
      fsm.removeTransitionTo('1', 'a');
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-a->2', '2-b->3', '3-c->1']);
    });

    it('should list the transitions to a state', function () {
      const fsm = makeCycle();
      assert.deepStrictEqual(fsm.getTransitionsToState('2'), [transition('1', '2', 'a', 'x')]);
      assert.deepStrictEqual(fsm.getTransitionsToState('unknown'), []);
    });

    it('should return an empty list of transitions from an unknown state', function () {
      const fsm = makeCycle();
      assert.deepStrictEqual(fsm.getTransitionsFromState('unknown'), []);
    });

    it('should return copies of the transitions', function () {
      const fsm = makeCycle();
      fsm.getTransitionsFromState('1')![0].to = '3';
      assert.deepStrictEqual(arcs(fsm, ['1']), ['1-a->2']);
    });

    it('should remove a transition from a state', function () {
      const fsm = makeCycle();
      fsm.removeTransitionFrom('1', 'a');
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['2-b->3', '3-c->1']);
    });

    it('should remove the transitions to a state on an input', function () {
      const fsm = makeCycle();
      fsm.removeTransitionTo('3', 'b');
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-a->2', '3-c->1']);
    });
  });

  describe('switchStates', function () {
    it('should switch two states, their transitions and the initial state', function () {
      const fsm = makeCycle();
      fsm.switchStates('1', '2');

      // 2 -a-> 1 -b-> 3 -c-> 2
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-b->3', '2-a->1', '3-c->2']);
      assert.strictEqual(fsm.initialState, '2');
    });

    it('should switch two states with a self loop', function () {
      const fsm = new Fsm(new Owner());
      fsm.initWithData(['1', '2', '3'], ['a', 'b'], [], [
        transition('1', '1', 'a'),
        transition('1', '3', 'b'),
      ]);

      fsm.switchStates('1', '2');
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['2-a->2', '2-b->3']);
    });

    it('should do nothing for the same state', function () {
      const fsm = makeCycle();
      fsm.switchStates('1', '1');
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-a->2', '2-b->3', '3-c->1']);
    });

    it('should throw for an unknown state', function () {
      const fsm = makeCycle();
      assert.throws(() => fsm.switchStates('1', 'unknown'), /unknown state "unknown"/);
      assert.throws(() => fsm.switchStates('unknown', '1'), /unknown state "unknown"/);
      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-a->2', '2-b->3', '3-c->1']);
    });
  });

  describe('initWithData', function () {
    it('should throw when a list is missing', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithData(['1'], ['a'], [], undefined as any), TypeError);
    });

    it('should throw for a transition with an unknown state, input or output', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithData(['1'], ['a'], [], [transition('1', '2', 'a')]), /unknown state "2"/);
      assert.throws(() => fsm.initWithData(['1'], ['a'], [], [transition('1', '1', 'b')]), /unknown input "b"/);
      assert.throws(() => fsm.initWithData(['1'], ['a'], [], [transition('1', '1', 'a', 'x')]), /unknown output "x"/);
    });

    it('should throw for a state listed twice', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithData(['1', '2', '1'], [], [], []), /duplicate state "1"/);
    });

    it('should throw for a state already declared', function () {
      const fsm = new Fsm(new Owner());
      fsm.addState('1');
      assert.throws(() => fsm.initWithData(['1'], [], [], []), /duplicate state "1"/);
    });

    it('should throw for an empty state, input or output', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithData([''], [], [], []), /a state is empty/);
      assert.throws(() => fsm.initWithData(['1'], [''], [], []), /an input is empty/);
      assert.throws(() => fsm.initWithData(['1'], [], [''], []), /an output is empty/);
    });

    it('should not change the fsm when it throws', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithData(['1', '2'], ['a'], ['x'], [
        transition('1', '2', 'a', 'x'),
        transition('2', '3', 'a'),
      ]));
      assert.strictEqual(fsm.existState('1'), false);
      assert.deepStrictEqual([...fsm.getInputs()], []);
      assert.deepStrictEqual([...fsm.getOutputs()], []);
    });

    it('should accept inputs and outputs already declared or listed twice', function () {
      const fsm = new Fsm(new Owner());
      fsm.addInput('a');
      fsm.initWithData(['1', '2'], ['a', 'b', 'b'], ['x', 'x'], [transition('1', '2', 'b', 'x')]);
      assert.deepStrictEqual([...fsm.getInputs()], ['a', 'b']);
      assert.deepStrictEqual([...fsm.getOutputs()], ['x']);
      assert.deepStrictEqual(arcs(fsm, ['1']), ['1-b->2']);
    });

    it('should accept transitions using the states, inputs and outputs already declared', function () {
      const fsm = new Fsm(new Owner());
      fsm.addState('1');
      fsm.addInput('a');
      fsm.addOutput('x');
      fsm.initWithData(['2'], [], [], [transition('1', '2', 'a', 'x')]);
      assert.deepStrictEqual(arcs(fsm, ['1']), ['1-a->2']);
    });
  });

  describe('initWithMatrix', function () {
    it('should throw for a matrix without states row', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithMatrix([]), TypeError);
    });

    it('should throw for a transition without input', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithMatrix([
        ['', '1', '2'],
        ['1', '', '/x'],
      ]), /"\/x" from "1" to "2" has no input/);
    });

    it('should throw for a state twice in the first row, without changing the fsm', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithMatrix([
        ['', '1', '2', '1'],
        ['1', '', 'a', ''],
      ]), /duplicate state "1"/);
      assert.deepStrictEqual([...fsm.getListState()], []);
      assert.deepStrictEqual([...fsm.getInputs()], []);
    });

    it('should throw for a state twice in the first column', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithMatrix([
        ['', '1', '2'],
        ['1', '', 'a'],
        ['1', 'b', ''],
      ]), /"1" has two rows/);
      assert.deepStrictEqual([...fsm.getListState()], []);
    });

    it('should throw for a row of a state missing in the first row', function () {
      const fsm = new Fsm(new Owner());
      assert.throws(() => fsm.initWithMatrix([
        ['', '1', '2'],
        ['3', '', 'a'],
      ]), /unknown state "3"/);
    });

    it('should build the states and the transitions of a matrix', function () {
      const fsm = new Fsm(new Owner());
      fsm.initWithMatrix([
        ['', '1', '2', '3'],
        ['1', '', 'a/x', ''],
        ['2', '', '', 'b'],
        ['3', 'c/', '', ''],
      ]);

      assert.deepStrictEqual(arcs(fsm, ['1', '2', '3']), ['1-a->2', '2-b->3', '3-c->1']);
      assert.deepStrictEqual([...fsm.getInputs()].sort(), ['a', 'b', 'c']);
      assert.deepStrictEqual([...fsm.getOutputs()], ['x']);
    });
  });

  describe('running', function () {
    it('should not activate without initial state', function () {
      const fsm = new Fsm(new Owner());
      fsm.addState('1');
      assert.strictEqual(fsm.activate(), false);
    });

    it('should throw for an unknown initial state', function () {
      const fsm = makeCycle();
      assert.throws(() => { fsm.initialState = 'unknown'; }, /unknown state "unknown"/);
      assert.strictEqual(fsm.initialState, '1');
    });

    it('should accept an empty initial state, meaning none', function () {
      const fsm = makeCycle();
      fsm.initialState = '';
      assert.strictEqual(fsm.initialState, '');
      assert.strictEqual(fsm.activate(), false);
    });

    it('should not cross transitions before being activated', function () {
      const fsm = makeCycle();
      assert.strictEqual(fsm.fsmNotify('a', null), false);
    });

    it('should cross the transitions of the current state', function () {
      const fsm = makeCycle();
      assert.strictEqual(fsm.activate(), true);

      assert.strictEqual(fsm.fsmNotify('b', null), false);
      assert.strictEqual(fsm.fsmNotify('a', null), true);
      assert.strictEqual(fsm.fsmNotify('a', null), false);
      assert.strictEqual(fsm.fsmNotify('b', null), true);
      assert.strictEqual(fsm.fsmNotify('c', null), true);
      assert.strictEqual(fsm.fsmNotify('a', null), true);
    });

    it('should give the state accessible on an input', function () {
      const fsm = makeCycle();
      fsm.activate();
      assert.strictEqual(fsm.getAccessibleStateOn('a'), '2');
      assert.strictEqual(fsm.getAccessibleStateOn('b'), undefined);
    });

    it('should give no accessible state before being activated', function () {
      assert.strictEqual(makeCycle().getAccessibleStateOn('a'), undefined);
    });

    it('should go back to the initial state when activated again', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.fsmNotify('a', null);

      fsm.activate();
      assert.strictEqual(fsm.fsmNotify('a', null), true);
    });
  });

  describe('currentState', function () {
    it('should be empty before the activation', function () {
      assert.strictEqual(makeCycle().currentState, '');
    });

    it('should be the initial state once activated', function () {
      const fsm = makeCycle();
      fsm.activate();
      assert.strictEqual(fsm.currentState, '1');
    });

    it('should follow the crossed transitions', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.fsmNotify('a', null);
      assert.strictEqual(fsm.currentState, '2');
      fsm.fsmNotify('a', null);
      assert.strictEqual(fsm.currentState, '2');
      fsm.fsmNotify('b', null);
      assert.strictEqual(fsm.currentState, '3');
    });

    it('should follow a rename', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.renameState('1', 'one');
      assert.strictEqual(fsm.currentState, 'one');
    });

    it('should follow a switch', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.switchStates('1', '2');
      assert.strictEqual(fsm.currentState, '2');
      // still in the same state: its transition 'a' now goes to '1'
      fsm.fsmNotify('a', null);
      assert.strictEqual(fsm.currentState, '1');
    });

    it('should be empty when the current state is removed', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.removeState('1');
      assert.strictEqual(fsm.currentState, '');
      assert.strictEqual(fsm.fsmNotify('a', null), false);
    });

    it('should be empty once cleared', function () {
      const fsm = makeCycle();
      fsm.activate();
      fsm.clear();
      assert.strictEqual(fsm.currentState, '');
    });
  });

  describe('outputs', function () {
    it('should call the action function of an output, with the owner as this', function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      let self: unknown;
      let type: string | undefined;
      let src: unknown;
      fsm.setOutput('x', function (this: unknown, event: Event) {
        self = this;
        type = event.type;
        src = event.src;
      });
      fsm.activate();

      fsm.fsmNotify('a', null);
      assert.strictEqual(self, owner);
      assert.strictEqual(type, 'a');
      assert.strictEqual(src, fsm);
    });

    it('should give the action an event still valid after the action returned', function () {
      const fsm = makeCycle();
      let received: Event | undefined;
      fsm.setOutput('x', (event: Event) => { received = event; });
      fsm.activate();

      fsm.fsmNotify('a', null);
      // e.g. an action using the event later, asynchronously
      assert.strictEqual(received?.type, 'a');
      assert.strictEqual(received?.src, fsm);
    });

    it('should call an owner method given by name', function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      fsm.setOutput('x', 'onOutput');
      fsm.activate();

      fsm.fsmNotify('a', null);
      assert.strictEqual(owner.calls.length, 1);
      assert.strictEqual(owner.calls[0][1], owner);
    });

    it('should throw for an unknown output or an invalid action', function () {
      const fsm = makeCycle();
      assert.throws(() => fsm.setOutput('unknown', () => {}), /unknown output "unknown"/);
      assert.throws(() => fsm.setOutput('x', '' as any), TypeError);
      assert.throws(() => fsm.setOutput('x', 42 as any), TypeError);
    });

    it('should not call the action of another output', function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      fsm.setOutput('y', 'onOutput');
      fsm.activate();

      fsm.fsmNotify('a', null);
      assert.strictEqual(owner.calls.length, 0);
    });

    it('should dispatch the output event with the source as src, after the action', async function () {
      const fsm = makeCycle();
      const log: string[] = [];
      const sources: unknown[] = [];
      fsm.setOutput('x', () => log.push('action'));
      fsm.addEventListener('x', (event) => { log.push('event'); sources.push(event.src); });
      fsm.activate();

      fsm.fsmNotify('a', null);
      await flush();
      assert.deepStrictEqual(log, ['action', 'event']);
      assert.deepStrictEqual(sources, [fsm]);
    });

    it('should not dispatch an event for a transition without output', async function () {
      const fsm = new Fsm(new Owner());
      fsm.initWithData(['1', '2'], ['a'], [], [transition('1', '2', 'a')]);
      fsm.initialState = '1';
      const types: (string | undefined)[] = [];
      fsm.addEventListener('', (event) => types.push(event.type));
      fsm.activate();

      fsm.fsmNotify('a', null);
      await flush();
      assert.deepStrictEqual(types, []);
    });

    it('should give the data of the input to the action and the output event', async function () {
      const fsm = makeCycle();
      const data = { value: 42 };
      const received: unknown[] = [];
      fsm.setOutput('x', (event: Event) => received.push(['action', event.data]));
      fsm.addEventListener('x', (event) => received.push(['event', event.data]));
      fsm.activate();

      fsm.fsmNotify('a', data);
      await flush();
      assert.deepStrictEqual(received, [['action', data], ['event', data]]);
    });

    it('should dispatch an event named after the output', async function () {
      const fsm = makeCycle();
      const types: (string | undefined)[] = [];
      fsm.addEventListener('x', (event) => types.push(event.type));
      fsm.activate();

      fsm.fsmNotify('a', null);
      await flush();
      assert.deepStrictEqual(types, ['x']);
    });
  });

  describe('setInput', function () {
    it('should throw for an unknown input, an invalid source or an empty event', function () {
      const fsm = makeCycle();
      const source = new Source();
      assert.throws(() => fsm.setInput('unknown', source, 'tap'), /unknown input "unknown"/);
      assert.throws(() => fsm.setInput('a', {} as any, 'tap'), TypeError);
      assert.throws(() => fsm.setInput('a', source, ''), /event specification is empty/);
    });

    it('should cross a transition on the bound event', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const source = new Source();
      fsm.setOutput('x', 'onOutput');
      fsm.activate();

      fsm.setInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(owner.calls.length, 1);
    });

    it('should give the data of the bound event to the output action', async function () {
      const fsm = makeCycle();
      const source = new Source();
      const received: unknown[] = [];
      fsm.setOutput('x', (event: Event) => received.push(event.data));
      fsm.activate();

      fsm.setInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('tap', 'tap data'));
      await flush();
      assert.deepStrictEqual(received, ['tap data']);
    });

    it('should ignore the other events of the source', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const source = new Source();
      fsm.setOutput('x', 'onOutput');
      fsm.activate();

      fsm.setInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('other'));
      await flush();
      assert.strictEqual(owner.calls.length, 0);
    });

    it('should cross the transition once when the same input is bound twice', async function () {
      const owner = new Owner();
      const fsm = new Fsm(owner);
      // 1 -a-> 1: a loop, crossed on each 'a'
      fsm.initWithData(['1'], ['a'], ['x'], [transition('1', '1', 'a', 'x')]);
      fsm.initialState = '1';
      fsm.setOutput('x', 'onOutput');
      fsm.activate();
      const source = new Source();

      fsm.setInput('a', source, 'tap');
      fsm.setInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(owner.calls.length, 1);
    });

    it('should cross the transitions of the inputs bound to the same event', async function () {
      const owner = new Owner();
      const fsm = new Fsm(owner);
      // 1 -a-> 2 -b-> 3: one 'tap' crosses 'a', then 'b' from the new state
      fsm.initWithData(['1', '2', '3'], ['a', 'b'], [], [
        transition('1', '2', 'a'),
        transition('2', '3', 'b'),
      ]);
      fsm.initialState = '1';
      fsm.activate();
      const source = new Source();

      fsm.setInput('a', source, 'tap');
      fsm.setInput('b', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(fsm.currentState, '3');
    });

    it('should stop reacting to the events once destroyed', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const source = new Source();
      fsm.setOutput('x', 'onOutput');
      fsm.activate();
      fsm.setInput('a', source, 'tap');

      fsm.destroy();
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(owner.calls.length, 0);
    });
  });

  describe('unsetInput', function () {
    it('should stop receiving the input from the event', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const source = new Source();
      fsm.setOutput('x', 'onOutput');
      fsm.activate();
      fsm.setInput('a', source, 'tap');

      fsm.unsetInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(owner.calls.length, 0);
      assert.strictEqual(fsm.currentState, '1');
    });

    it('should keep the other inputs of the same event', async function () {
      const fsm = new Fsm(new Owner());
      fsm.initWithData(['1', '2'], ['a', 'b'], [], [transition('1', '2', 'b')]);
      fsm.initialState = '1';
      fsm.activate();
      const source = new Source();
      fsm.setInput('a', source, 'tap');
      fsm.setInput('b', source, 'tap');

      fsm.unsetInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(fsm.currentState, '2');
    });

    it('should do nothing for an association which does not exist', function () {
      const fsm = makeCycle();
      assert.doesNotThrow(() => fsm.unsetInput('a', new Source(), 'tap'));
    });

    it('should throw for an unknown input', function () {
      const fsm = makeCycle();
      assert.throws(() => fsm.unsetInput('unknown', new Source(), 'tap'), /unknown input "unknown"/);
    });

    it('should allow to associate the input again', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const source = new Source();
      fsm.setOutput('x', 'onOutput');
      fsm.activate();
      fsm.setInput('a', source, 'tap');
      fsm.unsetInput('a', source, 'tap');

      fsm.setInput('a', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(owner.calls.length, 1);
    });
  });

  describe('unsetOutput', function () {
    it('should remove the action, and still dispatch the output event', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const types: (string | undefined)[] = [];
      fsm.setOutput('x', 'onOutput');
      fsm.addEventListener('x', (event) => types.push(event.type));
      fsm.activate();

      fsm.unsetOutput('x');
      fsm.fsmNotify('a', null);
      await flush();
      assert.strictEqual(owner.calls.length, 0);
      assert.deepStrictEqual(types, ['x']);
    });

    it('should do nothing for an output without action', function () {
      assert.doesNotThrow(() => makeCycle().unsetOutput('y'));
    });

    it('should throw for an unknown output', function () {
      assert.throws(() => makeCycle().unsetOutput('unknown'), /unknown output "unknown"/);
    });
  });

  describe('clear', function () {
    it('should remove the states, inputs, outputs and initial state', function () {
      const fsm = makeCycle();
      fsm.clear();

      assert.strictEqual(fsm.existState('1'), false);
      assert.deepStrictEqual([...fsm.getInputs()], []);
      assert.deepStrictEqual([...fsm.getOutputs()], []);
      assert.strictEqual(fsm.initialState, '');
      assert.strictEqual(fsm.activate(), false);
    });

    it('should remove the output actions', function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      fsm.setOutput('x', 'onOutput');

      fsm.clear();
      fsm.initWithData(['1', '2'], ['a'], ['x'], [transition('1', '2', 'a', 'x')]);
      fsm.initialState = '1';
      fsm.activate();
      fsm.fsmNotify('a', null);
      assert.strictEqual(owner.calls.length, 0);
    });

    it('should remove the input bindings', async function () {
      const owner = new Owner();
      const fsm = makeCycle(owner);
      const source = new Source();
      fsm.setInput('a', source, 'tap');

      fsm.clear();
      // same source and event, bound to another input
      fsm.initWithData(['1', '2'], ['a', 'b'], ['x'], [
        transition('1', '2', 'a', 'x'),
        transition('1', '2', 'b'),
      ]);
      fsm.initialState = '1';
      fsm.setOutput('x', 'onOutput');
      fsm.activate();
      fsm.setInput('b', source, 'tap');

      source.dispatchEvent(makeEvent('tap'));
      await flush();
      // only 'b' is crossed: the output of 'a' is not produced
      assert.strictEqual(owner.calls.length, 0);
    });
  });
});
