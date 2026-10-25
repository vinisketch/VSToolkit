import assert from 'assert';

import '../../di_config';

import Component from '../../../src/core/Component';
import { Model, In, Out, InOut } from '../../../src/core/Model';
import { container } from 'vs_utils';
import { DataFlow, DEFAULT_DATAFLOW } from '../../../src/core/dataflow/Dataflow';

class TodoModel extends Model {
  @Out accessor date = new Date(0);
  @InOut accessor done = false;
  @InOut accessor content = '';
}

class SearchModel extends Model {
  @In accessor query = '';
  @Out accessor count = 0;

  // count computed from query, when the dataflow changes the query
  override propertiesDidChange(): boolean {
    this.count = this.query.length;
    return false;
  }
}

/**
 * Records the events of a model
 */
function recordChanges(model: Model, names: string[]): string[] {
  const log: string[] = [];
  model.on('change', (_model, properties) => log.push(`change [${properties.join(',')}]`));
  names.forEach(name => model.on(`change:${name}`, (_model, property) => log.push(`change:${property}`)));
  return log;
}

describe('Model', function () {
  describe('properties', function () {
    it('should declare the decorated accessors, in order', function () {
      assert.deepStrictEqual(new TodoModel().modelProperties, ['date', 'done', 'content']);
    });

    it('should give the same list to the dataflow', function () {
      const todo = new TodoModel();
      assert.deepStrictEqual(todo.getModelProperties(), todo.modelProperties);
    });

    it('should keep the initial values', function () {
      const todo = new TodoModel();
      assert.deepStrictEqual([todo.date, todo.done, todo.content], [new Date(0), false, '']);
    });

    it('should give the direction of the properties', function () {
      const search = new SearchModel();
      assert.strictEqual(search.getPropertyDirection('query'), 'in');
      assert.strictEqual(search.getPropertyDirection('count'), 'out');
      assert.strictEqual(new TodoModel().getPropertyDirection('done'), 'inout');
      assert.strictEqual(search.getPropertyDirection('unknown'), undefined);
    });

    it('should inherit the properties of a parent model', function () {
      class DatedTodo extends TodoModel {
        @InOut accessor due = 0;
      }
      assert.deepStrictEqual(new DatedTodo().modelProperties, ['date', 'done', 'content', 'due']);
    });

    it('should keep the properties of each instance separate', function () {
      const first = new TodoModel();
      const second = new TodoModel();
      first.done = true;
      assert.strictEqual(second.done, false);
    });

    it('should have no model property without decorator', function () {
      class Plain extends Model {
        accessor value = 1;
      }
      assert.deepStrictEqual(new Plain().modelProperties, []);
    });

    it('should refuse a static or private accessor', function () {
      assert.throws(() => {
        class Invalid extends Model {
          // @ts-expect-error a model property is an instance accessor
          @InOut static accessor value = 1;
        }
        return Invalid;
      }, /public instance accessor/);
    });
  });

  describe('change notification', function () {
    it('should emit change:<property>, then change, when a property is set', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, ['done', 'content']);

      todo.done = true;
      assert.deepStrictEqual(log, ['change:done', 'change [done]']);
    });

    it('should call the listeners synchronously, after the value is set', function () {
      const todo = new TodoModel();
      let value: unknown;
      todo.on('change:done', (model) => { value = model.done; });

      todo.done = true;
      assert.strictEqual(value, true);
    });

    it('should not emit when the value does not change', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, ['done']);

      todo.done = false;
      assert.deepStrictEqual(log, []);
    });

    it('should not emit for the initial values', function () {
      const log: string[] = [];
      class Observed extends Model {
        @InOut accessor value = 1;
        constructor() {
          super();
          this.on('change', () => log.push('change'));
        }
      }
      new Observed();
      assert.deepStrictEqual(log, []);
    });

    it('should notify a change made in place with propertyChange()', function () {
      class ListModel extends Model {
        @InOut accessor items: string[] = [];
      }
      const list = new ListModel();
      const log = recordChanges(list, ['items']);

      list.items.push('item');
      list.propertyChange('items');
      assert.deepStrictEqual(log, ['change:items', 'change [items]']);
    });
  });

  describe('batch', function () {
    it('should notify the changes once, at the end', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, ['done', 'content']);

      todo.batch(() => {
        todo.done = true;
        todo.content = 'a';
        todo.content = 'b';
        assert.deepStrictEqual(log, []);
      });
      assert.deepStrictEqual(log, ['change:done', 'change:content', 'change [done,content]']);
    });

    it('should support nested batches', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, []);

      todo.batch(() => {
        todo.done = true;
        todo.batch(() => { todo.content = 'a'; });
        assert.deepStrictEqual(log, []);
      });
      assert.deepStrictEqual(log, ['change [done,content]']);
    });

    it('should return the result of the function', function () {
      assert.strictEqual(new TodoModel().batch(() => 42), 42);
    });

    it('should notify the changes when the function throws', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, []);

      assert.throws(() => todo.batch(() => {
        todo.done = true;
        throw new Error('boom');
      }), /boom/);
      assert.deepStrictEqual(log, ['change [done]']);
    });

    it('should notify nothing when nothing changed', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, []);

      todo.batch(() => { todo.done = false; });
      assert.deepStrictEqual(log, []);
    });
  });

  describe('assign', function () {
    it('should set several properties with one notification', function () {
      const todo = new TodoModel();
      const log = recordChanges(todo, []);

      todo.assign({ done: true, content: 'x' });
      assert.deepStrictEqual([todo.done, todo.content], [true, 'x']);
      assert.deepStrictEqual(log, ['change [done,content]']);
    });

    it('should throw for an unknown property, without changing the model', function () {
      const todo = new TodoModel();
      assert.throws(() => todo.assign({ done: true, unknown: 1 }), /"unknown" is not a model property/);
      assert.strictEqual(todo.done, false);
    });
  });

  describe('listeners', function () {
    it('should remove a listener with the returned function', function () {
      const todo = new TodoModel();
      let calls = 0;
      const unsubscribe = todo.on('change', () => { calls++; });

      unsubscribe();
      todo.done = true;
      assert.strictEqual(calls, 0);
    });

    it('should remove a listener with off()', function () {
      const todo = new TodoModel();
      let calls = 0;
      const listener = () => { calls++; };
      todo.on('change:done', listener);

      todo.off('change:done', listener);
      todo.done = true;
      assert.strictEqual(calls, 0);
    });

    it('should remove all the listeners of an event with off()', function () {
      const todo = new TodoModel();
      let calls = 0;
      todo.on('change', () => { calls++; });
      todo.on('change', () => { calls++; });

      todo.off('change');
      todo.done = true;
      assert.strictEqual(calls, 0);
    });

    it('should call a once() listener only the first time', function () {
      const todo = new TodoModel();
      let calls = 0;
      todo.once('change', () => { calls++; });

      todo.done = true;
      todo.done = false;
      assert.strictEqual(calls, 1);
    });

    it('should add a listener only once per event', function () {
      const todo = new TodoModel();
      let calls = 0;
      const listener = () => { calls++; };
      todo.on('change', listener);
      todo.on('change', listener);

      todo.done = true;
      assert.strictEqual(calls, 1);
    });

    it('should contain and log an exception thrown by a listener', function () {
      const todo = new TodoModel();
      const errors: unknown[] = [];
      const originals = { log: console.log, error: console.error };
      console.log = () => {};
      console.error = (...args: unknown[]) => { errors.push(args); };
      let called = false;
      try {
        todo.on('change', () => { throw new Error('listener failure'); });
        todo.on('change', () => { called = true; });
        assert.doesNotThrow(() => { todo.done = true; });
      } finally {
        Object.assign(console, originals);
      }
      assert.strictEqual(called, true);
      assert.strictEqual(errors.length, 1);
    });

    it('should remove the listeners when destroyed', function () {
      const todo = new TodoModel();
      let calls = 0;
      todo.on('change', () => { calls++; });

      todo.destroy();
      todo.done = true;
      assert.strictEqual(calls, 0);
    });
  });

  describe('serialization', function () {
    it('should serialize the id and the model properties', function () {
      const todo = new TodoModel('todo-serialized');
      todo.assign({ done: true, content: 'x' });
      assert.deepStrictEqual(todo.toJSON(), { id: 'todo-serialized', date: new Date(0), done: true, content: 'x' });
    });

    it('should give back the properties, dates included, with parseJSON()', function () {
      const source = new TodoModel();
      source.assign({ date: new Date(1326814228756), done: true, content: 'x' });
      const target = new TodoModel();
      const log = recordChanges(target, []);

      target.parseJSON(source.stringify());
      assert.deepStrictEqual([target.date, target.done, target.content], [new Date(1326814228756), true, 'x']);
      assert.strictEqual(target.id === source.id, false);
      assert.deepStrictEqual(log, ['change [date,done,content]']);
    });

    it('should ignore the unknown data when parsing', function () {
      const todo = new TodoModel();
      assert.doesNotThrow(() => todo.parseJSON('{"id":"x","done":true,"unknown":1}'));
      assert.strictEqual(todo.done, true);
    });
  });

  describe('dataflow', function () {
    it('should propagate a property change to the connected models', function () {
      const df = new DataFlow();
      const source = new TodoModel();
      const target = new TodoModel();
      const log = recordChanges(target, ['content']);
      df.connect(source, 'content', target, 'content');
      df.build();

      source.content = 'propagated';
      assert.strictEqual(target.content, 'propagated');
      assert.deepStrictEqual(log, ['change:content', 'change [content]']);
    });

    it('should propagate the changes of a batch once', function () {
      const df = new DataFlow();
      const source = new TodoModel();
      let propagations = 0;
      const target = new (class extends TodoModel {
        override propertiesDidChange(): boolean {
          propagations++;
          return false;
        }
      })();
      const log = recordChanges(target, []);
      df.connect(source, ['done', 'content'], target, ['done', 'content']);
      df.build();

      source.assign({ done: true, content: 'x' });
      assert.deepStrictEqual([target.done, target.content], [true, 'x']);
      assert.strictEqual(propagations, 1);
      // the dataflow sets the target properties one by one
      assert.deepStrictEqual(log, ['change [done]', 'change [content]']);
    });

    it('should propagate the out properties computed by propertiesDidChange', function () {
      const df = new DataFlow();
      const input = new TodoModel();
      const search = new SearchModel();
      const output = new TodoModel();
      df.connect(input, 'content', search, 'query');
      df.connect(search, 'count', output, 'content', (count: number) => `${count} characters`);
      df.build();

      input.content = 'hello';
      assert.strictEqual(search.query, 'hello');
      assert.strictEqual(search.count, 5);
      assert.strictEqual(output.content, '5 characters');
    });

    it('should connect a model with the Connector API, on the default dataflow', function () {
      const source = new TodoModel();
      const target = new TodoModel();
      source.connect('done').to(target, 'done');
      container.get(DEFAULT_DATAFLOW).build();

      source.done = true;
      assert.strictEqual(target.done, true);
    });

    it('should refuse to connect from an in property, or to an out property', function () {
      const df = new DataFlow();
      const search = new SearchModel();
      const todo = new TodoModel();
      assert.throws(() => df.connect(search, 'query', todo, 'content'), /"query" .* is an in property/);
      assert.throws(() => df.connect(todo, 'content', search, 'count'), /"count" .* is an out property/);
    });

    it('should connect a model with a plain component', function () {
      class View extends Component {
        #text = '';
        get text() { return this.#text; }
        set text(value: string) { this.#text = value; }
      }
      const df = new DataFlow();
      const todo = new TodoModel();
      const view = new View();
      df.connect(todo, 'content', view, 'text');
      df.build();

      todo.content = 'shown';
      assert.strictEqual(view.text, 'shown');
    });
  });
});
