import assert from 'assert';
import { container } from 'vs_utils';

import '../../../di_config';

import { DataFlow, DEFAULT_DATAFLOW } from '../../../../src/core/dataflow/Dataflow';
import DataflowNode from '../../../../src/core/dataflow/DataflowNode';
import DataflowState from '../../../../src/core/dataflow/DataflowState';

/**
 * A dataflow node with two properties, a and b
 */
class Node extends DataflowNode {
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
 * Makes the nodes usable by the dataflow (DataflowNode does not do it, see
 * the "registration" tests)
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

    it('should throw for different numbers of out and in properties', function () {
      const df = new DataFlow();
      const [src, trg] = makeNodes(df, 2);
      assert.throws(() => df.connect(src, ['a', 'b'], trg, ['a']), /parameter error/);
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
});
