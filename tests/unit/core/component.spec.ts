import assert from 'assert';

import '../../di_config';

import Component from '../../../src/core/Component';
import Event from '../../../src/core/event/Event';
import Handler from '../../../src/core/event/Handler';
import { isEventSource } from '../../../src/core/event/EventSource';

/**
 * A component exposing its protected API to the tests
 */
class TestComponent extends Component {
  readonly calls: string[] = [];
  deserialized: unknown[] = [];

  protected override initComponent(): void {
    this.calls.push('initComponent');
  }

  protected override componentDidInitialize(): void {
    this.calls.push('componentDidInitialize');
  }

  protected override deserialize(data: unknown): void {
    this.deserialized.push(data);
  }
}

class Serialized extends Component {
  name = 'serialized';

  protected override serialize() {
    return { ...super.serialize(), name: this.name };
  }
}

async function flush(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setImmediate(resolve));
  }
}

describe('Component', function () {
  describe('id', function () {
    it('should keep the given id', function () {
      assert.strictEqual(new TestComponent('my-id').id, 'my-id');
    });

    it('should generate a unique id for an empty id', function () {
      const component = new TestComponent('');
      assert.ok(component.id);
      assert.notStrictEqual(component.id, new TestComponent('').id);
      assert.strictEqual(Component.instances.has(''), false);
    });

    it('should generate a unique id when none is given', function () {
      const first = new TestComponent();
      const second = new TestComponent();
      assert.ok(first.id);
      assert.notStrictEqual(first.id, second.id);
    });
  });

  describe('instances', function () {
    it('should register the component by its id', function () {
      const component = new TestComponent();
      assert.strictEqual(Component.instances.get(component.id), component);
    });

    it('should unregister the component when destroyed', function () {
      const component = new TestComponent();
      component.destroy();
      assert.strictEqual(Component.instances.has(component.id), false);
    });

    it('should throw for the id of a living component, and keep the first one', function () {
      const first = new TestComponent('duplicate');
      assert.throws(() => new TestComponent('duplicate'), /"duplicate" already exists/);
      assert.strictEqual(Component.instances.get('duplicate'), first);
    });

    it('should accept the id of a destroyed component', function () {
      const first = new TestComponent('reused');
      first.destroy();

      const second = new TestComponent('reused');
      assert.strictEqual(Component.instances.get('reused'), second);
    });

    it('should register any id, including "__proto__"', function () {
      const component = new TestComponent('__proto__');
      assert.strictEqual(Component.instances.get('__proto__'), component);

      component.destroy();
      assert.strictEqual(Component.instances.has('__proto__'), false);
    });
  });

  describe('init', function () {
    it('should call initComponent, then componentDidInitialize, and return the component', function () {
      const component = new TestComponent();
      assert.strictEqual(component.init(), component);
      assert.deepStrictEqual(component.calls, ['initComponent', 'componentDidInitialize']);
    });

    it('should throw when called twice', function () {
      const component = new TestComponent();
      component.init();
      assert.throws(() => component.init(), /impossible to re-initialise/);
      assert.deepStrictEqual(component.calls, ['initComponent', 'componentDidInitialize']);
    });

    it('should throw an error keeping the initialization error as cause', function () {
      const failure = new Error('boom');
      const component = new (class extends Component {
        protected override initComponent(): void { throw failure; }
      })();

      assert.throws(() => component.init(), (err: Error) => {
        assert.match(err.message, /Component init failed/);
        assert.strictEqual(err.cause, failure);
        return true;
      });
    });

    it('should not be initialized before init(), and be initialized after', function () {
      const component = new TestComponent();
      assert.strictEqual(component.isInitialized(), false);
      component.init();
      assert.strictEqual(component.isInitialized(), true);
    });

    it('should not be initialized after a failure of initComponent', function () {
      const component = new (class extends Component {
        protected override initComponent(): void { throw new Error('boom'); }
      })();

      assert.throws(() => component.init());
      assert.strictEqual(component.isInitialized(), false);
    });

    it('should stay initialized, and throw, when componentDidInitialize fails', function () {
      const failure = new Error('boom');
      const component = new (class extends Component {
        protected override componentDidInitialize(): void { throw failure; }
      })('did-init-failure');

      assert.throws(() => component.init(), (err: Error) => {
        assert.match(err.message, /did-init-failure is initialized, but componentDidInitialize failed/);
        assert.strictEqual(err.cause, failure);
        return true;
      });
      assert.strictEqual(component.isInitialized(), true);
      assert.throws(() => component.init(), /impossible to re-initialise/);
    });

    it('should not be initialized once destroyed', function () {
      const component = new TestComponent();
      component.init();
      component.destroy();
      assert.strictEqual(component.isInitialized(), false);
    });

    it('should be retried after a failure of initComponent', function () {
      let fail = true;
      const component = new (class extends Component {
        protected override initComponent(): void {
          if (fail) throw new Error('boom');
        }
      })();

      assert.throws(() => component.init());
      fail = false;
      assert.doesNotThrow(() => component.init());
    });
  });

  describe('destroy', function () {
    it('should call the destructor once, even when called twice', function () {
      let calls = 0;
      const component = new (class extends Component {
        protected override destructor(): void {
          calls++;
          super.destructor();
        }
      })();

      component.destroy();
      component.destroy();
      assert.strictEqual(calls, 1);
      assert.strictEqual(component.isDeleted(), true);
    });
  });

  describe('instances view', function () {
    it('should list the living components only', function () {
      const living = new TestComponent();
      const destroyed = new TestComponent();
      destroyed.destroy();

      assert.strictEqual(Component.instances.has(living.id), true);
      assert.strictEqual(Component.instances.has(destroyed.id), false);
      assert.ok([...Component.instances.keys()].includes(living.id));
      assert.ok(![...Component.instances.keys()].includes(destroyed.id));
      assert.ok([...Component.instances.values()].includes(living));
      assert.ok([...Component.instances].some(([id, c]) => id === living.id && c === living));
      assert.strictEqual(Component.instances.size, [...Component.instances.keys()].length);

      const seen: Component[] = [];
      Component.instances.forEach((component) => seen.push(component));
      assert.ok(seen.includes(living));
    });
  });

  describe('garbage collection', function () {
    /**
     * Runs the garbage collector (node --expose-gc, see .mocharc.json)
     * and lets the finalization callbacks run.
     */
    async function collectGarbage(): Promise<void> {
      const gc = (globalThis as { gc?: () => void }).gc!;
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setImmediate(resolve));
        gc();
      }
      await new Promise(resolve => setImmediate(resolve));
    }

    before(function () {
      if (!(globalThis as { gc?: unknown }).gc) this.skip();
    });

    it('should free the id of a component garbage collected without being destroyed', async function () {
      (() => { new TestComponent('collected'); })();
      await collectGarbage();

      assert.strictEqual(Component.instances.has('collected'), false);
      assert.doesNotThrow(() => new TestComponent('collected-reuse'));
      (() => { new TestComponent('collected-reuse-2'); })();
      assert.doesNotThrow(() => new TestComponent('collected'));
    });

    it('should not free the id of a referenced component', async function () {
      const kept = new TestComponent('kept');
      await collectGarbage();

      assert.strictEqual(Component.instances.get('kept'), kept);
    });
  });

  describe('destructor', function () {
    it('should mark the component as deleted', function () {
      const component = new TestComponent();
      assert.strictEqual(component.isDeleted(), false);
      component.destroy();
      assert.strictEqual(component.isDeleted(), true);
    });

    it('should release the event bindings of the component', async function () {
      const source = new TestComponent();
      const observer = new TestComponent();
      const received: unknown[] = [];
      source.bind('select', observer, (event: Event) => received.push(event.type));

      source.destroy();
      const event = Event.retain();
      event.configure('select');
      source.dispatchEvent(event);
      await flush();
      assert.deepStrictEqual(received, []);
    });
  });

  describe('destructor, as event observer', function () {
    function makeEvent(type = 'select'): Event {
      const event = Event.retain();
      event.configure(type);
      return event;
    }

    it('should remove its bindings on other sources', async function () {
      const source = new TestComponent();
      const observer = new TestComponent();
      const received: string[] = [];
      source.bind('select', observer, () => received.push('observer'));

      observer.destroy();
      source.dispatchEvent(makeEvent());
      await flush();
      assert.deepStrictEqual(received, []);
    });

    it('should remove its bindings on every event and every source', async function () {
      const first = new TestComponent();
      const second = new TestComponent();
      const observer = new TestComponent();
      const received: string[] = [];
      first.bind('select', observer, () => received.push('first select'));
      first.bind('change', observer, () => received.push('first change'));
      second.bind('select', observer, () => received.push('second select'));

      observer.destroy();
      first.dispatchEvent(makeEvent('select'));
      first.dispatchEvent(makeEvent('change'));
      second.dispatchEvent(makeEvent('select'));
      await flush();
      assert.deepStrictEqual(received, []);
    });

    it('should keep the bindings of the other observers', async function () {
      const source = new TestComponent();
      const destroyed = new TestComponent();
      const alive = new TestComponent();
      const received: string[] = [];
      source.bind('select', destroyed, () => received.push('destroyed'));
      source.bind('select', alive, () => received.push('alive'));
      source.addEventListener('select', () => received.push('listener'));

      destroyed.destroy();
      source.dispatchEvent(makeEvent());
      await flush();
      assert.deepStrictEqual(received.sort(), ['alive', 'listener']);
    });

    it('should not receive an event dispatched before its destruction', async function () {
      const source = new TestComponent();
      const observer = new TestComponent();
      const received: string[] = [];
      source.bind('select', observer, () => received.push('observer'));

      // delivered asynchronously, after the destruction
      source.dispatchEvent(makeEvent());
      observer.destroy();
      await flush();
      assert.deepStrictEqual(received, []);
    });

    it('should still be unbound after it was unbound and bound again', async function () {
      const source = new TestComponent();
      const observer = new TestComponent();
      const received: string[] = [];
      const callback = () => received.push('observer');
      source.bind('select', observer, callback);
      source.unbind('select', observer, callback);
      source.bind('select', observer, callback);

      observer.destroy();
      source.dispatchEvent(makeEvent());
      await flush();
      assert.deepStrictEqual(received, []);
    });

    it('should release the handlers of its bindings (not only skip them)', function () {
      const source = new TestComponent();
      const observer = new TestComponent();

      // the next binding takes this handler from the pool (last in, first out)
      const handler = Handler.retain();
      Handler.release(handler);
      source.bind('select', observer, () => {});

      // the binding is removed: its handler goes back to the pool
      observer.destroy();
      assert.strictEqual(Handler.retain(), handler);
    });

    it('should not fail when its source was destroyed before', function () {
      const source = new TestComponent();
      const observer = new TestComponent();
      source.bind('select', observer, () => {});

      source.destroy();
      assert.doesNotThrow(() => observer.destroy());
    });
  });

  describe('serialization', function () {
    it('should serialize its id by default', function () {
      const component = new Component('serial-id');
      assert.deepStrictEqual(component.toJSON(), { id: 'serial-id' });
    });

    it('should serialize the data of subclasses', function () {
      const component = new Serialized('serial-sub');
      assert.deepStrictEqual(component.toJSON(), { id: 'serial-sub', name: 'serialized' });
    });

    it('should be serialized as an object by JSON.stringify, not as a JSON string', function () {
      const component = new Serialized('nested');
      const parsed = JSON.parse(JSON.stringify({ component }));
      assert.deepStrictEqual(parsed.component, { id: 'nested', name: 'serialized' });
    });

    it('should be serialized as a whole by JSON.stringify', function () {
      const component = new Serialized('alone');
      assert.deepStrictEqual(JSON.parse(JSON.stringify(component)), { id: 'alone', name: 'serialized' });
    });

    it('should return its JSON string with stringify()', function () {
      const component = new Serialized('string');
      const json = component.stringify();
      assert.strictEqual(typeof json, 'string');
      assert.deepStrictEqual(JSON.parse(json), { id: 'string', name: 'serialized' });
    });

    it('should give the data of stringify() back to deserialize with parseJSON()', function () {
      const source = new Serialized('round-trip');
      const target = new TestComponent();
      target.parseJSON(source.stringify());
      assert.deepStrictEqual(target.deserialized, [{ id: 'round-trip', name: 'serialized' }]);
    });

    it('should give back the dates of stringify() with parseJSON()', function () {
      const date = new Date(1326814228756);
      const source = new (class extends Component {
        protected override serialize() { return { ...super.serialize(), date }; }
      })('dated');
      const target = new TestComponent();

      target.parseJSON(source.stringify());
      const [data] = target.deserialized as { date: unknown }[];
      assert.ok(data.date instanceof Date);
      assert.strictEqual((data.date as Date).getTime(), date.getTime());
    });

    it('should give the parsed data to deserialize', function () {
      const component = new TestComponent();
      component.parseJSON('{"id":"x","value":42}');
      assert.deepStrictEqual(component.deserialized, [{ id: 'x', value: 42 }]);
    });

    it('should throw on an empty JSON string, without calling deserialize', function () {
      const component = new TestComponent();
      assert.throws(() => component.parseJSON(''), (err: Error) => {
        assert.match(err.message, /parseJSON failed/);
        assert.ok(err.cause instanceof SyntaxError);
        return true;
      });
      assert.deepStrictEqual(component.deserialized, []);
    });

    it('should throw on invalid JSON, keeping the parse error as cause', function () {
      const component = new TestComponent();
      assert.throws(() => component.parseJSON('{ invalid'), (err: Error) => {
        assert.match(err.message, /parseJSON failed/);
        assert.ok(err.cause instanceof SyntaxError);
        return true;
      });
    });
  });

  describe('events', function () {
    it('should be an event source', function () {
      const component = new TestComponent();
      assert.strictEqual(isEventSource(component), true);
    });

    it('should deliver its events', async function () {
      const source = new TestComponent();
      const types: (string | undefined)[] = [];
      source.addEventListener('select', (event) => types.push(event.type));

      const event = Event.retain();
      event.configure('select');
      source.dispatchEvent(event);
      await flush();
      assert.deepStrictEqual(types, ['select']);
    });
  });
});
