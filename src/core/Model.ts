import { asError } from 'vs_utils';

import Component from './Component';
import DataflowState from './dataflow/DataflowState';
import type { PropertyDirection } from './dataflow/DataflowNode';

/**
 * The declared properties of each model (see the In, Out and InOut
 * decorators), with their direction, in declaration order.
 */
const declaredProperties = new WeakMap<object, Map<string, PropertyDirection>>();

function declareProperty(model: object, name: string, direction: PropertyDirection): void {
  let properties = declaredProperties.get(model);
  if (!properties) {
    properties = new Map();
    declaredProperties.set(model, properties);
  }
  properties.set(name, direction);
}

type PropertyDecorator = <This extends Model, V>(
  target: ClassAccessorDecoratorTarget<This, V>,
  context: ClassAccessorDecoratorContext<This, V>,
) => ClassAccessorDecoratorResult<This, V>;

function propertyDecorator(direction: PropertyDirection, decoratorName: string): PropertyDecorator {
  return function <This extends Model, V>(
    target: ClassAccessorDecoratorTarget<This, V>,
    context: ClassAccessorDecoratorContext<This, V>,
  ): ClassAccessorDecoratorResult<This, V> {
    if (context.static || context.private) {
      throw new Error(`@${decoratorName}: a model property must be a public instance accessor`);
    }
    const name = String(context.name);

    context.addInitializer(function (this: This) {
      declareProperty(this, name, direction);
    });

    return {
      set(this: This, value: V): void {
        const previous = target.get.call(this);
        target.set.call(this, value);
        if (!Object.is(previous, value)) {
          this.propertyChange(name);
        }
      },
    };
  };
}

/**
 * Declares an in model property: it can be connected to, not from.
 * @example
 *  @In accessor query = '';
 */
export const In = propertyDecorator('in', 'In');

/**
 * Declares an out model property: it can be connected from, not to.
 * @example
 *  @Out accessor count = 0;
 */
export const Out = propertyDecorator('out', 'Out');

/**
 * Declares an in/out model property: it can be connected both ways.
 * @example
 *  @InOut accessor done = false;
 */
export const InOut = propertyDecorator('inout', 'InOut');

/**
 * Listener of the 'change' event: called with the model and the names of
 * the changed properties.
 */
export type ChangeListener<M extends Model = Model> = (model: M, properties: string[]) => void;

/**
 * Listener of the 'change:<property>' events: called with the model and the
 * name of the changed property.
 */
export type PropertyChangeListener<M extends Model = Model> = (model: M, property: string) => void;

export type ModelEvent = 'change' | `change:${string}`;

interface ListenerEntry {
  listener: Function;
  once: boolean;
}

/**
 * The core.Model class
 *
 * @extends core.Component
 * @class
 * A Model holds data as declared properties, and notifies their changes.
 * <p>
 * Model properties are declared with the In, Out or InOut decorators on
 * accessors. Setting a property to a different value:
 * <ul>
 *  <li>emits the 'change:<property>' event, then the 'change' event, to the
 *    listeners (see on), synchronously;
 *  <li>propagates the change through the dataflows the model is connected
 *    to.
 * </ul>
 * batch() groups several changes into one notification.
 * <p>
 * The model properties are serialized with the component (see stringify and
 * parseJSON).
 *
 * @example
 *  class TodoModel extends Model {
 *    @Out accessor date = new Date();
 *    @InOut accessor done = false;
 *    @InOut accessor content = '';
 *  }
 *
 *  const todo = new TodoModel();
 *  todo.on('change:done', (model) => { … });
 *  todo.on('change', (model, properties) => { … });
 *
 *  todo.done = true;   // 'change:done', then 'change' with ['done']
 *
 *  todo.batch(() => {  // 'change:done', 'change:content', then one 'change'
 *    todo.done = false;
 *    todo.content = 'Something to do';
 *  });
 *  // or
 *  todo.assign({ done: false, content: 'Something to do' });
 *
 *  // dataflow
 *  connect(todo.$.done).to(checkbox.$.checked);
 *
 * @author David Thevenin
 *
 * @constructor
 *  Main constructor
 *
 * @name core.Model
 *
 * @param {ObjectId} id the model id [optional]
 */
export class Model extends Component {
  readonly #listeners = new Map<ModelEvent, ListenerEntry[]>();

  #batchDepth = 0;
  readonly #pendingChanges = new Set<string>();

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The names of the declared model properties, in declaration order
   */
  get modelProperties(): string[] {
    return [...(declaredProperties.get(this)?.keys() ?? [])];
  }

  /**
   * @see modelProperties (used by the dataflow)
   */
  override getModelProperties(): string[] {
    return this.modelProperties;
  }

  /**
   * The direction of a declared model property, undefined for another one
   */
  override getPropertyDirection(propName: string): PropertyDirection | undefined {
    return declaredProperties.get(this)?.get(propName);
  }

  /**
   *  Sets several model properties, with one notification (see batch).
   *  Throws, without changing the model, for a name which is not a model
   *  property.
   *
   * @param {Object} values the values, by property name
   */
  assign(values: Partial<Record<string, unknown>>): void {
    const properties = declaredProperties.get(this);
    for (const name of Object.keys(values)) {
      if (!properties?.has(name)) {
        throw new Error(`Model.assign: "${name}" is not a model property of ${this.id}`);
      }
    }

    this.batch(() => {
      for (const [name, value] of Object.entries(values)) {
        (this as unknown as Record<string, unknown>)[name] = value;
      }
    });
  }

  /*****************************************************************
   *  Change notification
   ****************************************************************/

  /**
   *  Notifies the change of a property: the model properties do it when
   *  they are set to a different value. Call it after changing a value in
   *  place (e.g. adding an item to an array property).
   *
   * @param {string} property the name of the changed property
   */
  propertyChange(property: string): void {
    this.#pendingChanges.add(property);
    if (this.#batchDepth === 0) {
      this.#flushChanges();
    }
  }

  /**
   *  Runs the function, and notifies the properties it changed once it
   *  returns (or throws): each 'change:<property>' event once, then one
   *  'change' event, then the dataflow propagation. Batches can be nested.
   *
   * @param {Function} func the function changing the model
   * @return the result of the function
   */
  batch<T>(func: () => T): T {
    this.#batchDepth++;
    try {
      return func();
    } finally {
      this.#batchDepth--;
      if (this.#batchDepth === 0) {
        this.#flushChanges();
      }
    }
  }

  #flushChanges(): void {
    if (this.#pendingChanges.size === 0) return;

    const properties = [...this.#pendingChanges];
    this.#pendingChanges.clear();

    // 1) the listeners
    for (const property of properties) {
      this.#emit(`change:${property}`, property);
    }
    this.#emit('change', properties);

    // 2) the dataflows the model is connected to
    const state = DataflowState.get(this.id);
    if (state) {
      // out properties only: computed by the model, no input changed
      const outputPropagation = properties.every(property => this.getPropertyDirection(property) === 'out');
      state.dataflows.forEach(dataflow => dataflow.propagate(this, outputPropagation));
    }
  }

  /*****************************************************************
   *  Events
   ****************************************************************/

  /**
   *  Adds a listener called (synchronously) on each change: 'change' for
   *  any change, 'change:<property>' for the changes of a property.
   *  A listener is added only once per event.
   *
   * @return {Function} a function removing the listener
   */
  on(event: 'change', listener: ChangeListener<this>): () => void;
  on(event: `change:${string}`, listener: PropertyChangeListener<this>): () => void;
  on(event: ModelEvent, listener: Function): () => void {
    return this.#addListener(event, listener, false);
  }

  /**
   *  Same as on(), but the listener is removed after its first call.
   *
   * @return {Function} a function removing the listener
   */
  once(event: 'change', listener: ChangeListener<this>): () => void;
  once(event: `change:${string}`, listener: PropertyChangeListener<this>): () => void;
  once(event: ModelEvent, listener: Function): () => void {
    return this.#addListener(event, listener, true);
  }

  /**
   *  Removes a listener added with on() or once(). Without listener,
   *  removes all the listeners of the event.
   */
  off(event: ModelEvent, listener?: Function): void {
    if (!listener) {
      this.#listeners.delete(event);
      return;
    }
    const entries = this.#listeners.get(event);
    const index = entries?.findIndex(entry => entry.listener === listener) ?? -1;
    if (index !== -1) entries!.splice(index, 1);
  }

  #addListener(event: ModelEvent, listener: Function, once: boolean): () => void {
    let entries = this.#listeners.get(event);
    if (!entries) {
      entries = [];
      this.#listeners.set(event, entries);
    }
    if (!entries.some(entry => entry.listener === listener)) {
      entries.push({ listener, once });
    }
    return () => this.off(event, listener);
  }

  #emit(event: ModelEvent, argument: unknown): void {
    const entries = this.#listeners.get(event);
    if (!entries?.length) return;

    // a listener may add or remove listeners: iterate over a copy
    for (const entry of [...entries]) {
      if (entry.once) this.off(event, entry.listener);
      try {
        entry.listener(this, argument);
      } catch (e) {
        const err = asError(e);
        if (err.stack) console.log(err.stack);
        console.error(err);
      }
    }
  }

  /*****************************************************************
   *  Life cycle and serialization
   ****************************************************************/

  protected override destructor(): void {
    this.#listeners.clear();
    super.destructor();
  }

  /**
   *  Serializes the id and the model properties
   */
  protected override serialize(): any {
    const data = super.serialize();
    for (const name of this.modelProperties) {
      data[name] = (this as unknown as Record<string, unknown>)[name];
    }
    return data;
  }

  /**
   *  Sets the model properties present in the data (see assign); the other
   *  data (e.g. the id) is ignored.
   */
  protected override deserialize(data: any): void {
    const properties = declaredProperties.get(this);
    const values: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(data ?? {})) {
      if (properties?.has(name)) values[name] = value;
    }
    this.assign(values);
  }
}
