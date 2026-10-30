import assert from 'assert';

import '../../../di_config';

import Component from '../../../../src/core/Component';
import { Model, In, Out, InOut } from '../../../../src/core/Model';
import { container } from 'vs_utils';
import { DataFlow, DEFAULT_DATAFLOW } from '../../../../src/core/dataflow/Dataflow';
import { connect, PropertyRef } from '../../../../src/core/dataflow/Connect';

/**
 * A component with accessor properties of several types
 */
class Node extends Component {
  #x = 0;
  #y = 0;
  #text = '';
  #list: number[] = [];

  get x(): number { return this.#x; }
  set x(value: number) { this.#x = value; }

  get y(): number { return this.#y; }
  set y(value: number) { this.#y = value; }

  get text(): string { return this.#text; }
  set text(value: string) { this.#text = value; }

  get list(): number[] { return this.#list; }
  set list(value: number[]) { this.#list = value; }

  method(): void {}
}

class Search extends Model {
  @In accessor query = '';
  @Out accessor count = 0;
  @InOut accessor label = '';
}

describe('connect (property references)', function () {
  describe('$', function () {
    it('should give a reference to a property', function () {
      const node = new Node();
      const ref = node.$.x;
      assert.ok(ref instanceof PropertyRef);
      assert.strictEqual(ref.node, node);
      assert.strictEqual(ref.name, 'x');
      assert.strictEqual(String(ref), `${node.id}.x`);
    });

    it('should not read the property', function () {
      let reads = 0;
      class Counted extends Component {
        get value(): number { reads++; return 1; }
        set value(_v: number) {}
      }
      const ref = new Counted().$.value;
      assert.ok(ref);
      assert.strictEqual(reads, 0);
    });

    it('should type check the property names and types (at compile time)', function () {
      // checked by the type checking of the tests (npm run typecheck:test):
      // each @ts-expect-error line must be a type error
      const typeErrors = () => {
        const node = new Node();
        // @ts-expect-error unknown property
        node.$.unknown;
        // @ts-expect-error methods are not properties
        node.$.method;
        // @ts-expect-error a number can not be connected to a string
        new DataFlow().from(node.$.x).to(new Node().$.text);
        // @ts-expect-error two values for one property, without map
        new DataFlow().from(node.$.x, node.$.y).to(new Node().$.x);
      };
      assert.ok(typeErrors);
    });
  });

  describe('to', function () {
    it('should connect a property to another one', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x).to(b.$.x);

      a.x = 5;
      df.propagate(a);
      assert.strictEqual(b.x, 5);
    });

    it('should chain the connections: a -> b -> c', function () {
      const df = new DataFlow();
      const [a, b, c] = [new Node(), new Node(), new Node()];
      df.from(a.$.x).to(b.$.x).to(c.$.y);

      a.x = 3;
      df.propagate(a);
      assert.strictEqual(b.x, 3);
      assert.strictEqual(c.y, 3);
    });

    it('should connect several properties, one value per property', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x, a.$.y).to(b.$.y, b.$.x);

      a.x = 1;
      a.y = 2;
      df.propagate(a);
      assert.deepStrictEqual([b.x, b.y], [2, 1]);
    });

    it('should not need build()', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x).to(b.$.x);
      a.x = 1;
      df.propagate(a);
      assert.strictEqual(b.x, 1);

      // connecting again: built again by the next propagation
      const c = new Node();
      df.from(b.$.x).to(c.$.x);
      a.x = 2;
      df.propagate(a);
      assert.strictEqual(c.x, 2);
    });

    it('should throw for properties of different components', function () {
      const df = new DataFlow();
      const [a, b, c] = [new Node(), new Node(), new Node()];
      assert.throws(() => df.from(a.$.x, b.$.y), /same component/);
      assert.throws(() => (df.from(a.$.x).to as any)(b.$.x, c.$.x), /same component/);
    });

    it('should throw without property', function () {
      const df = new DataFlow();
      assert.throws(() => df.from(), /at least one property/);
      assert.throws(() => df.from(new Node().$.x).to(...([] as unknown as [PropertyRef<number>])), /at least one property/);
    });

    it('should throw for something which is not a property reference', function () {
      const df = new DataFlow();
      assert.throws(() => df.from(42 as any), /property references/);
    });

    it('should throw for an unknown property, at connection', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      assert.throws(() => df.from((a.$ as any).unknown).to(b.$.x as any), /unknown out property "unknown"/);
    });

    it('should throw for different numbers of values and properties without map', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      assert.throws(() => (df.from(a.$.x, a.$.y).to as any)(b.$.x), /parameter error/);
    });
  });

  describe('map', function () {
    it('should map the value', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x).map(x => `${x}°`).to(b.$.text);

      a.x = 45;
      df.propagate(a);
      assert.strictEqual(b.text, '45°');
    });

    it('should map several values to one', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x, a.$.y).map((x, y) => Math.hypot(x, y)).to(b.$.x);

      a.x = 3;
      a.y = 4;
      df.propagate(a);
      assert.strictEqual(b.x, 5);
    });

    it('should map one value to several with mapAll', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x).mapAll((x): [number, string] => [x * 2, `x=${x}`]).to(b.$.y, b.$.text);

      a.x = 2;
      df.propagate(a);
      assert.deepStrictEqual([b.y, b.text], [4, 'x=2']);
    });

    it('should give an array value to one property, without spreading it', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x).map(x => [x, x + 1]).to(b.$.list);

      a.x = 1;
      df.propagate(a);
      assert.deepStrictEqual(b.list, [1, 2]);
    });

    it('should compose the maps', function () {
      const df = new DataFlow();
      const [a, b] = [new Node(), new Node()];
      df.from(a.$.x).map(x => x + 1).map(x => x * 10).to(b.$.x);

      a.x = 1;
      df.propagate(a);
      assert.strictEqual(b.x, 20);
    });

    it('should map each step of a chain', function () {
      const df = new DataFlow();
      const [a, b, c] = [new Node(), new Node(), new Node()];
      df.from(a.$.x).map(x => x * 2).to(b.$.x).map(x => `${x}`).to(c.$.text);

      a.x = 4;
      df.propagate(a);
      assert.strictEqual(b.x, 8);
      assert.strictEqual(c.text, '8');
    });

    it('should type check the mapped values (at compile time)', function () {
      const typeErrors = () => {
        const [a, b] = [new Node(), new Node()];
        // @ts-expect-error the mapped value is a string, b.$.x a number
        new DataFlow().from(a.$.x).map(x => `${x}`).to(b.$.x);
        // @ts-expect-error the map function takes the values of the sources
        new DataFlow().from(a.$.x).map((x: string) => x);
      };
      assert.ok(typeErrors);
    });
  });

  describe('disconnect', function () {
    it('should remove all the connections of the chain', function () {
      const df = new DataFlow();
      const [a, b, c] = [new Node(), new Node(), new Node()];
      const chain = df.from(a.$.x).to(b.$.x).to(c.$.x);

      chain.disconnect();
      a.x = 1;
      df.propagate(a);
      b.x = 2;
      df.propagate(b);
      assert.strictEqual(b.x, 2);
      assert.strictEqual(c.x, 0);
    });

    it('should keep the other connections', function () {
      const df = new DataFlow();
      const [a, b, c] = [new Node(), new Node(), new Node()];
      const first = df.from(a.$.x).to(b.$.x);
      df.from(a.$.x).to(c.$.x);

      first.disconnect();
      a.x = 1;
      df.propagate(a);
      assert.deepStrictEqual([b.x, c.x], [0, 1]);
    });
  });

  describe('destroyed components', function () {
    it('should forget a destroyed component and its connections', function () {
      const df = new DataFlow();
      const [a, b, c] = [new Node(), new Node(), new Node()];
      df.from(a.$.x).to(b.$.x);
      df.from(a.$.x).to(c.$.x);
      df.propagate(a);

      b.destroy();
      a.x = 7;
      assert.doesNotThrow(() => df.propagate(a));
      assert.strictEqual(c.x, 7);
    });
  });

  describe('default dataflow', function () {
    it('should connect with connect()', function () {
      const [a, b] = [new Node(), new Node()];
      connect(a.$.x).to(b.$.x);

      a.x = 9;
      // plain components do not propagate by themselves
      container.get(DEFAULT_DATAFLOW).propagate(a);
      assert.strictEqual(b.x, 9);
    });

    it('should connect from a reference with ref.to() and ref.map()', function () {
      const [a, b, c] = [new Search(), new Search(), new Search()];
      a.$.label.to(b.$.label);
      a.$.label.map(label => label.toUpperCase()).to(c.$.label);

      a.label = 'hello';
      assert.strictEqual(b.label, 'hello');
      assert.strictEqual(c.label, 'HELLO');
    });
  });

  describe('models', function () {
    it('should propagate the model changes, without build() nor propagate()', function () {
      const df = new DataFlow();
      const [source, search] = [new Search(), new Search()];
      df.from(source.$.label).to(search.$.query);

      source.label = 'text';
      assert.strictEqual(search.query, 'text');
    });

    it('should check the directions of the model properties', function () {
      const df = new DataFlow();
      const [a, b] = [new Search(), new Search()];
      assert.throws(() => df.from(a.$.query).to(b.$.label), /is an in property/);
      assert.throws(() => df.from(a.$.label).map(l => l.length).to(b.$.count), /is an out property/);
    });

    it('should connect models and plain components', function () {
      const df = new DataFlow();
      const search = new Search();
      const node = new Node();
      df.from(search.$.label).map(label => label.length).to(node.$.x);

      search.label = 'four';
      assert.strictEqual(node.x, 4);
    });
  });
});
