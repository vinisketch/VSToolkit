import assert from 'assert';

import '../../../di_config';

import Component from '../../../../src/core/Component';
import Event from '../../../../src/core/event/Event';
import EventSource from '../../../../src/core/event/EventSource';
import Container from '../../../../src/core/Container';
import { Fsm } from '../../../../src/core/FSM';

class Source extends Component {}

class Observer extends Component {
  readonly received: Event[] = [];
  readonly types: (string | undefined)[] = [];

  onEvent(event: Event): void {
    this.received.push(event);
    this.types.push(event.type);
  }
}

function makeEvent(type: string, data?: unknown): Event {
  const event = Event.retain();
  event.configure(type, data);
  return event;
}

/**
 * Events are delivered asynchronously by the main loop (setImmediate):
 * let it run.
 */
/**
 * A container which is also an event source, to receive bubbling events
 * (EventSource methods copied on it, as applyMixins does for Component).
 */
class Group extends Container {}
interface Group extends EventSource {}
for (const name of Object.getOwnPropertyNames(EventSource.prototype)) {
  if (name === 'constructor') continue;
  Object.defineProperty(Group.prototype, name, Object.getOwnPropertyDescriptor(EventSource.prototype, name)!);
}

/**
 * A component which is also a container (has add/remove/isChild).
 */
class Panel extends Source {
  readonly #children = new Set<Component>();
  add(child: Component) { this.#children.add(child); }
  remove(child: Component) { this.#children.delete(child); }
  isChild(child: Component) { return this.#children.has(child); }
}

async function flush(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setImmediate(resolve));
  }
}

describe('EventSource (mixed in Component)', function () {
  describe('bind', function () {
    it('should not throw on a Component', function () {
      const source = new Source();
      const observer = new Observer();
      assert.doesNotThrow(() => source.bind('select', observer, observer.onEvent));
      assert.doesNotThrow(() => source.addEventListener('select', () => {}));
    });

    it('should deliver the event to the callback, with the object as this', async function () {
      const source = new Source();
      const observer = new Observer();
      let self: unknown;
      source.bind('select', observer, function (this: unknown, event: Event) {
        self = this;
        observer.onEvent(event);
      });

      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.strictEqual(self, observer);
      assert.deepStrictEqual(observer.types, ['select']);
      assert.strictEqual(observer.received[0].src, source);
    });

    it('should call a method given by name on the object', async function () {
      const source = new Source();
      const observer = new Observer();
      source.bind('select', observer, 'onEvent');

      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(observer.types, ['select']);
    });

    it('should only deliver the events of the bound spec', async function () {
      const source = new Source();
      const observer = new Observer();
      source.bind('select', observer, 'onEvent');

      source.dispatchEvent(makeEvent('other'));
      await flush();
      assert.deepStrictEqual(observer.types, []);
    });

    it('should keep the bindings of each source separate', async function () {
      const first = new Source();
      const second = new Source();
      const observer = new Observer();
      first.bind('select', observer, 'onEvent');

      second.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(observer.types, []);
    });

    it('should deliver to every bound handler', async function () {
      const source = new Source();
      const a = new Observer();
      const b = new Observer();
      source.bind('select', a, 'onEvent');
      source.bind('select', b, 'onEvent');

      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(a.types, ['select']);
      assert.deepStrictEqual(b.types, ['select']);
    });

    it('should ignore a binding without spec, object or callback', async function () {
      const source = new Source();
      const observer = new Observer();
      source.bind('', observer, 'onEvent');
      source.bind('select', undefined as any, 'onEvent');
      source.bind('select', observer, undefined as any);

      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(observer.types, []);
    });
  });

  describe('unbind', function () {
    it('should remove the binding of the callback', async function () {
      const source = new Source();
      const observer = new Observer();
      source.bind('select', observer, 'onEvent');

      source.unbind('select', observer, 'onEvent');
      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(observer.types, []);
    });

    it('should remove all the bindings of the object when no callback is given', async function () {
      const source = new Source();
      const observer = new Observer();
      const other = new Observer();
      const log: string[] = [];
      source.bind('select', observer, () => log.push('first'));
      source.bind('select', observer, () => log.push('second'));
      source.bind('select', other, 'onEvent');

      source.unbind('select', observer);
      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(log, []);
      assert.deepStrictEqual(other.types, ['select']);
    });

    it('should ignore an unknown binding', function () {
      const source = new Source();
      assert.doesNotThrow(() => source.unbind('select', new Observer(), 'onEvent'));
    });
  });

  describe('addEventListener / removeEventListener', function () {
    it('should deliver the event to the listener', async function () {
      const source = new Source();
      const types: (string | undefined)[] = [];
      source.addEventListener('select', (event) => types.push(event.type));

      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(types, ['select']);
    });

    it('should remove the listener', async function () {
      const source = new Source();
      const types: (string | undefined)[] = [];
      const listener = (event: Event) => types.push(event.type);
      source.addEventListener('select', listener);

      source.removeEventListener('select', listener);
      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(types, []);
    });

    it('should not remove a bind() using the same function', async function () {
      const source = new Source();
      const observer = new Observer();
      const callback = (event: Event) => observer.onEvent(event);
      source.bind('select', observer, callback);

      source.removeEventListener('select', callback);
      source.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(observer.types, ['select']);
    });
  });

  describe('dispatchEvent', function () {
    it('should return false for an event without type', function () {
      assert.strictEqual(new Source().dispatchEvent(Event.retain()), false);
    });

    it('should accept an event nobody listens to', async function () {
      const source = new Source();
      assert.strictEqual(source.dispatchEvent(makeEvent('select')), true);
      await flush();
    });

    it('should deliver to the handlers bound at dispatch time, even if unbound before delivery', async function () {
      const source = new Source();
      const first = new Observer();
      const second = new Observer();
      source.bind('select', first, 'onEvent');

      source.dispatchEvent(makeEvent('select'));
      // unbinding releases the handler to the pool, the next bind reuses it
      source.unbind('select', first, 'onEvent');
      source.bind('select', second, 'onEvent');
      await flush();

      assert.deepStrictEqual(first.types, ['select']);
      assert.deepStrictEqual(second.types, []);
    });

    it('should log an exception thrown by a handler, and still call the others', async function () {
      const source = new Source();
      const observer = new Observer();
      const errors: unknown[] = [];
      const originalError = console.error;
      console.error = (...args: unknown[]) => { errors.push(args); };

      try {
        source.addEventListener('select', () => { throw new Error('handler failure'); });
        source.bind('select', observer, 'onEvent');
        source.dispatchEvent(makeEvent('select'));
        await flush();
      } finally {
        console.error = originalError;
      }

      assert.strictEqual(errors.length, 1);
      assert.deepStrictEqual(observer.types, ['select']);
    });
  });

  describe('with Fsm.setInput', function () {
    it('should make the fsm cross a transition on a bound event', async function () {
      const owner = new Observer();
      const source = new Source();
      const fsm = new Fsm(owner);
      fsm.initWithData(['idle', 'selected'], ['select'], ['didSelect'], [
        { from: 'idle', to: 'selected', on: 'select', output: 'didSelect' },
      ]);
      let crossed = false;
      fsm.setOutput('didSelect', () => { crossed = true; });
      fsm.initialState = 'idle';
      fsm.activate();

      fsm.setInput('select', source, 'tap');
      source.dispatchEvent(makeEvent('tap'));
      await flush();
      assert.strictEqual(crossed, true);
    });
  });
  describe('bubbling', function () {
    it('should bubble an event without handler from a child to its parent', async function () {
      const group = new Group();
      const child = new Source();
      group.add(child);
      const types: (string | undefined)[] = [];
      group.addEventListener('select', (event) => types.push(event.type));

      child.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(types, ['select']);
    });

    it('should bubble from a child which is itself a container', async function () {
      const group = new Group();
      const panel = new Panel();
      group.add(panel);
      const types: (string | undefined)[] = [];
      group.addEventListener('select', (event) => types.push(event.type));

      panel.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(types, ['select']);
    });

    it('should keep the child as the event source when bubbling', async function () {
      const group = new Group();
      const panel = new Panel();
      group.add(panel);
      const sources: unknown[] = [];
      group.addEventListener('select', (event) => sources.push(event.src));

      panel.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(sources, [panel]);
    });

    it('should not bubble an event handled by the child', async function () {
      const group = new Group();
      const panel = new Panel();
      group.add(panel);
      const log: string[] = [];
      group.addEventListener('select', () => log.push('parent'));
      panel.addEventListener('select', () => log.push('child'));

      panel.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(log, ['child']);
    });

    it('should not bubble from a child without parent', async function () {
      const panel = new Panel();
      assert.strictEqual(panel.dispatchEvent(makeEvent('select')), true);
      await flush();
    });
  });
});
