import assert from 'assert';
import { container } from 'vs_utils';

import '../../../di_config';

import { DataFlow, DEFAULT_DATAFLOW } from '../../../../src/core/dataflow/Dataflow';
import Component from '../../../../src/core/Component';
import type { DataflowNode } from '../../../../src/core/dataflow/DataflowNode';
import DataflowState from '../../../../src/core/dataflow/DataflowState';

/**
 * A dataflow node (every component is) with two properties, a and b
 */
class Node extends Component {
  #a: unknown = undefined;
  #b: unknown = undefined;
  didChangeCalls = 0;
  stopPropagation = false;

  get a(): unknown { return this.#a; }
  set a(value: unknown) { this.#a = value; }

  get b(): unknown { return this.#b; }
  set b(value: unknown) { this.#b = value; }

  override propertiesDidChange(): boolean {
    this.didChangeCalls++;
    return this.stopPropagation;
  }
}

/**
 * Registers the nodes in the dataflow (connect() also does it, see the
 * "registration" tests)
 */
function register(df: DataFlow, ...nodes: DataflowNode[]): void {
  nodes.forEach(node => DataflowState.add(node, df));
}

function makeNodes(df: DataFlow, count: number): Node[] {
  const nodes = Array.from({ length: count }, () => new Node());
  register(df, ...nodes);
  return nodes;
}

describe('DataFlow', function () {
  describe('default dataflow', function () {
    it('should be given by the container, from the first call', function () {
      const first = container.get(DEFAULT_DATAFLOW);
      assert.ok(first instanceof DataFlow);
      assert.strictEqual(container.get(DEFAULT_DATAFLOW), first);
    });
  });

  describe('registration', function () {
    it('should connect two nodes without registering them by hand', function () {
      const df = new DataFlow();
      const [src, trg] = [new Node(), new Node()];
      assert.doesNotThrow(() => df.connect(src, 'a', trg, 'a'));
    });

    it('should throw for an unknown node id', function () {
      const df = new DataFlow();
      const [trg] = makeNodes(df, 1);
      assert.throws(() => df.connect('unknown-node', 'a', trg, 'a'), /Unknown component/);
    });

    it('should throw for different numbers of out and in properties without function', function () {
      const df = new DataFlow();
      const [src, trg] = makeNodes(df, 2);
      assert.throws(() => df.connect(src, ['a', 'b'], trg, ['a']), /parameter error/);
    });

    it('should accept different numbers of out and in properties with a function', function () {
      const df = new DataFlow();
      const [src, trg] = makeNodes(df, 2);
      assert.doesNotThrow(() => df.connect(src, ['a', 'b'], trg, ['a'], (a: number, b: number) => a + b));
    });

    it('should throw for an unknown property', function () {
      const df = new DataFlow();
      const [src, trg] = makeNodes(df, 2);
      assert.throws(() => {
        df.connect(src, ['unknown', 'a'], trg, ['a', 'b']);
        df.build();
      }, /unknown/i);
    });
  });

  describe('propagation', function () {
    it('should propagate a property along a chain of nodes', function () {
      const df = new DataFlow();
      const [n1, n2, n3] = makeNodes(df, 3);
      df.connect(n1, 'a', n2, 'a');
      df.connect(n2, 'a', n3, 'a');
      df.build();

      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, 1);
      assert.strictEqual(n3.a, 1);
    });

    it('should propagate several properties of one connection', function () {
      const df = new DataFlow();
      const [n1, n2, n3] = makeNodes(df, 3);
      df.connect(n1, ['a', 'b'], n2, ['a', 'b']);
      df.connect(n2, ['a', 'b'], n3, ['b', 'a']);
      df.build();

      n1.a = 1;
      n1.b = 2;
      df.propagate(n1);
      assert.deepStrictEqual([n2.a, n2.b], [1, 2]);
      assert.deepStrictEqual([n3.a, n3.b], [2, 1]);
    });

    it('should accept node ids', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1.id, 'a', n2.id, 'b');
      df.build();

      n1.a = 'value';
      df.propagate(n1);
      assert.strictEqual(n2.b, 'value');
    });

    it('should transform the values with the function of the connection', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1, ['a', 'b'], n2, ['a', 'b'], (a: number, b: number) => [a + b, a * b]);
      df.build();

      n1.a = 2;
      n1.b = 3;
      df.propagate(n1);
      assert.deepStrictEqual([n2.a, n2.b], [5, 6]);
    });

    it('should call propertiesDidChange on the targets', function () {
      const df = new DataFlow();
      const [n1, n2, n3] = makeNodes(df, 3);
      df.connect(n1, 'a', n2, 'a');
      df.connect(n2, 'a', n3, 'a');
      df.build();

      df.propagate(n1);
      assert.strictEqual(n2.didChangeCalls, 1);
      assert.strictEqual(n3.didChangeCalls, 1);
    });

    it('should stop at a node whose propertiesDidChange returns true', function () {
      const df = new DataFlow();
      const [n1, n2, n3] = makeNodes(df, 3);
      df.connect(n1, 'a', n2, 'a');
      df.connect(n2, 'a', n3, 'a');
      df.build();
      n2.stopPropagation = true;

      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, 1);
      assert.strictEqual(n3.a, undefined);
    });

    it('should not propagate while paused', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1, 'a', n2, 'a');
      df.build();

      df.pausePropagation();
      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, undefined);

      df.restartPropagation();
      df.propagate(n1);
      assert.strictEqual(n2.a, 1);
    });

    it('should propagate to the other connections after an invalid one', function () {
      const df = new DataFlow();
      const [n1, n2, n3] = makeNodes(df, 3);
      // returns one value for two properties: invalid
      df.connect(n1, ['a', 'b'], n2, ['a', 'b'], () => [1]);
      df.connect(n1, 'a', n3, 'a');
      df.build();

      n1.a = 'value';
      df.propagate(n1);
      assert.strictEqual(n3.a, 'value');
    });

    it('should keep working after an exception in propertiesDidChange', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1, 'a', n2, 'a');
      df.build();
      const original = n2.propertiesDidChange.bind(n2);
      n2.propertiesDidChange = () => { throw new Error('boom'); };

      n1.a = 1;
      try { df.propagate(n1); } catch { /* the error may propagate */ }

      n2.propertiesDidChange = original;
      n1.a = 2;
      df.propagate(n1);
      assert.strictEqual(n2.a, 2);
    });

    it('should not fail on a cyclic graph', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1, 'a', n2, 'a');
      df.connect(n2, 'a', n1, 'b');
      assert.doesNotThrow(() => df.build());

      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, 1);
    });
  });

  describe('disconnect', function () {
    it('should remove a connection by its id', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      const edgeId = df.connect(n1, 'a', n2, 'a');
      df.disconnect(edgeId);
      df.build();

      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, undefined);
    });

    it('should remove a connection by its nodes and properties', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1, 'a', n2, 'a');
      df.disconnect(n1, 'a', n2, 'a');
      df.build();

      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, undefined);
    });

    it('should remove the connection to the second target of a source', function () {
      const df = new DataFlow();
      const [n1, n2, n3] = makeNodes(df, 3);
      df.connect(n1, 'a', n2, 'a');
      df.connect(n1, 'a', n3, 'a');
      df.disconnect(n1, 'a', n3, 'a');
      df.build();

      n1.a = 1;
      df.propagate(n1);
      assert.strictEqual(n2.a, 1);
      assert.strictEqual(n3.a, undefined);
    });

    it('should keep the other properties of a connection', function () {
      const df = new DataFlow();
      const [n1, n2] = makeNodes(df, 2);
      df.connect(n1, ['a', 'b'], n2, ['a', 'b']);
      df.disconnect(n1, 'b', n2, 'b');
      df.build();

      n1.a = 1;
      n1.b = 2;
      df.propagate(n1);
      assert.deepStrictEqual([n2.a, n2.b], [1, undefined]);
    });
  });

  describe('Connector', function () {
    it('should chain connections on the default dataflow', function () {
      const df = container.get(DEFAULT_DATAFLOW);
      const [n1, n2, n3] = [new Node(), new Node(), new Node()];
      register(df as DataFlow, n1, n2, n3);

      n1.connect('a').to(n2, 'a').connect('b').to(n3, 'b');
      df.build();

      n1.a = 1;
      n2.b = 2;
      df.propagate(n1);
      assert.strictEqual(n2.a, 1);
      assert.strictEqual(n3.b, 2);
    });
  });
  /**
   * The scenarios of the former jsUnit tests (tests/unit/core/dataflow_test.js,
   * removed: see the git history).
   * The former setters marked the nodes as changed and df.propagate() was
   * called without node; here the propagation starts from the changed node.
   */
  describe('legacy scenarios', function () {
    class Item extends Component {
      inOut: unknown = undefined;
      inOut1: unknown = undefined;
      inOut2: unknown = undefined;
      in: number = 0;
      out: number = 0;
    }

    /**
     * Turns the fields into accessors (getPropertyDescriptor needs a getter
     * and a setter)
     */
    function makeItem(df: DataFlow, didChange?: (item: Item) => void): Item {
      const item = new Item();
      for (const name of ['inOut', 'inOut1', 'inOut2', 'in', 'out'] as const) {
        let value = (item as any)[name];
        Object.defineProperty(item, name, { get: () => value, set: (v) => { value = v; }, configurable: true });
      }
      if (didChange) item.propertiesDidChange = () => { didChange(item); return false; };
      DataflowState.add(item, df);
      return item;
    }

    function makeItems(df: DataFlow, count: number): Item[] {
      return Array.from({ length: count }, () => makeItem(df));
    }

    const values = (item: Item) => [item.inOut1, item.inOut2];

    it('Propagation1: two properties connected one by one along a chain', function () {
      const df = new DataFlow();
      const [item1, item2, item3] = makeItems(df, 3);
      df.connect(item1, 'inOut1', item2, 'inOut1');
      df.connect(item1, 'inOut2', item2, 'inOut2');
      df.connect(item2, 'inOut1', item3, 'inOut1');
      df.connect(item2, 'inOut2', item3, 'inOut2');
      df.build();

      item1.inOut1 = 1;
      item1.inOut2 = 2;
      df.propagate(item1);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[1, 2], [1, 2], [1, 2]]);
    });

    it('Propagation2: two properties connected together along a chain', function () {
      const df = new DataFlow();
      const [item1, item2, item3] = makeItems(df, 3);
      df.connect(item1, ['inOut1', 'inOut2'], item2, ['inOut1', 'inOut2']);
      df.connect(item2, ['inOut1', 'inOut2'], item3, ['inOut1', 'inOut2']);
      df.build();

      item1.inOut1 = 1;
      item1.inOut2 = 2;
      df.propagate(item1);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[1, 2], [1, 2], [1, 2]]);
    });

    it('Propagation3: out properties computed by propertiesDidChange', function () {
      const df = new DataFlow();
      const plusOne = (item: Item) => { item.out = item.in + 1; };
      const [item1, item2, item3] = [makeItem(df, plusOne), makeItem(df, plusOne), makeItem(df, plusOne)];
      df.connect(item1, ['out'], item2, ['in']);
      df.connect(item2, ['out'], item3, ['in']);
      df.build();

      item1.in = 1;
      df.propagate(item1);
      assert.deepStrictEqual([item1.in, item1.out], [1, 2]);
      assert.deepStrictEqual([item2.in, item2.out], [2, 3]);
      assert.deepStrictEqual([item3.in, item3.out], [3, 4]);
    });

    it('Function1: a chain of functions', function () {
      const df = new DataFlow();
      const items = makeItems(df, 5);
      const twice = (v: number) => v * 2;
      const thrice = (v: number) => v * 3;
      df.connect(items[0], 'inOut', items[1], 'inOut', twice);
      df.connect(items[1], 'inOut', items[2], 'inOut', twice);
      df.connect(items[2], 'inOut', items[3], 'inOut', thrice);
      df.connect(items[3], 'inOut', items[4], 'inOut', thrice);
      df.build();

      items[0].inOut = 1;
      df.propagate(items[0]);
      assert.deepStrictEqual(items.map(item => item.inOut), [1, 2, 4, 12, 36]);
    });

    it('Function2: a function mapping two properties to two properties', function () {
      const df = new DataFlow();
      const [item1, item2, item3] = makeItems(df, 3);
      const func = (v1: number, v2: number) => [v2 * 2, v1 * 3];
      df.connect(item1, ['inOut1', 'inOut2'], item2, ['inOut1', 'inOut2'], func);
      df.connect(item2, ['inOut1', 'inOut2'], item3, ['inOut1', 'inOut2'], func);
      df.build();

      item1.inOut1 = 1;
      item1.inOut2 = 2;
      df.propagate(item1);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[1, 2], [4, 3], [6, 12]]);
    });

    it('Function3: functions mapping two properties to one, and one to two', function () {
      const df = new DataFlow();
      const [item1, item2, item3] = makeItems(df, 3);
      df.connect(item1, ['inOut1', 'inOut2'], item2, 'inOut', (v1: number, v2: number) => v1 * v2);
      df.connect(item2, 'inOut', item3, ['inOut1', 'inOut2'], (v: number) => [v * 2, v * 3]);
      df.build();

      item1.inOut1 = 1;
      item1.inOut2 = 2;
      df.propagate(item1);
      assert.strictEqual(item2.inOut, 2);
      assert.deepStrictEqual(values(item3), [4, 6]);
    });

    /**
     * item1 -inOut1-> item2 -inOut1-> item3, and the same for inOut2; then
     * disconnects item2 -inOut1-> item3 and item1 -inOut2-> item2
     */
    function disconnectScenario(disconnect: (df: DataFlow, items: Item[], ids: Record<string, number>) => void) {
      const df = new DataFlow();
      const items = makeItems(df, 3);
      const [item1, item2, item3] = items;
      const ids = {
        t11: df.connect(item1, 'inOut1', item2, 'inOut1'),
        t21: df.connect(item1, 'inOut2', item2, 'inOut2'),
        t12: df.connect(item2, 'inOut1', item3, 'inOut1'),
        t22: df.connect(item2, 'inOut2', item3, 'inOut2'),
      };
      df.build();

      item1.inOut1 = 1;
      item1.inOut2 = 2;
      df.propagate(item1);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[1, 2], [1, 2], [1, 2]]);

      disconnect(df, items, ids);
      df.build();

      item1.inOut1 = 3;
      item1.inOut2 = 4;
      df.propagate(item1);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[3, 4], [3, 2], [1, 2]]);

      return { df, items, ids };
    }

    it('UnconnectAPI_ID_1: disconnect by edge ids', function () {
      disconnectScenario((df, _items, ids) => {
        df.disconnect(ids.t12);
        df.disconnect(ids.t21);
      });
    });

    it('UnconnectAPI_ID_2: the remaining connections still propagate', function () {
      const { df, items: [item1, item2, item3] } = disconnectScenario((df, _items, ids) => {
        df.disconnect(ids.t12);
        df.disconnect(ids.t21);
      });

      item2.inOut2 = 6;
      df.propagate(item2);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[3, 4], [3, 6], [1, 6]]);
    });

    it('UnconnectAPI_PM_1: disconnect by nodes and properties', function () {
      disconnectScenario((df, [item1, item2, item3]) => {
        df.disconnect(item2, 'inOut1', item3, 'inOut1');
        df.disconnect(item1, 'inOut2', item2, 'inOut2');
      });
    });

    it('Reconnect: connect again after a disconnection', function () {
      const { df, items: [item1, item2, item3] } = disconnectScenario((df, _items, ids) => {
        df.disconnect(ids.t12);
        df.disconnect(ids.t21);
      });
      item2.inOut2 = 6;
      df.propagate(item2);

      df.connect(item2, 'inOut1', item3, 'inOut1');
      df.connect(item1, 'inOut2', item2, 'inOut2');
      df.build();

      item2.inOut1 = 7;
      item2.inOut2 = 8;
      df.propagate(item2);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[3, 4], [7, 8], [7, 8]]);

      item1.inOut1 = 9;
      item1.inOut2 = 10;
      df.propagate(item1);
      assert.deepStrictEqual([values(item1), values(item2), values(item3)], [[9, 10], [9, 10], [9, 10]]);
    });
  });
});
