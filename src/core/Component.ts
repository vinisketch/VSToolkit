import { toJSON, parseJSON, applyMixins, SupportMixins, createUniqueId } from 'vs_utils';
import { BaseIdentifiable,  ObjectId } from './BaseIdentifiable';
import { EventSource } from './event';

export type InitFunction = () => void;

/**
 * The registry of the living components: a component is held weakly, so a
 * component nobody references anymore (and never destroyed) can be garbage
 * collected, its id is then freed.
 */
const registry = new Map<ObjectId, WeakRef<Component>>();

const finalization = new FinalizationRegistry<ObjectId>((id) => {
  // the id may have been reused meanwhile by another component
  if (registry.get(id)?.deref() === undefined) registry.delete(id);
});

function livingComponent(id: ObjectId): Component | undefined {
  return registry.get(id)?.deref();
}

/**
 * The living components, as a Map (a snapshot)
 */
function livingComponents(): Map<ObjectId, Component> {
  const living = new Map<ObjectId, Component>();
  for (const [id, ref] of registry) {
    const component = ref.deref();
    if (component) living.set(id, component);
  }
  return living;
}

/**
 * Read only view of the living components, by id
 */
const instancesView: ReadonlyMap<ObjectId, Component> = {
  get: (id: ObjectId) => livingComponent(id),
  has: (id: ObjectId) => livingComponent(id) !== undefined,
  get size() {
    return livingComponents().size;
  },
  forEach(callback, thisArg?) {
    livingComponents().forEach((component, id) => callback.call(thisArg, component, id, instancesView));
  },
  entries: () => livingComponents().entries(),
  keys: () => livingComponents().keys(),
  values: () => livingComponents().values(),
  [Symbol.iterator]: () => livingComponents().entries(),
};

/**
 *  @class Object
 *  core.Object is the root class of most class hierarchies. Through
 *  core.Object, objects inherit a basic interface for configuration
 *  and clone mechanism. It provides a unique identifier for objects.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @param {Object} config the configuration structure
*/
class Component extends SupportMixins implements BaseIdentifiable {
  /**
   * The living components, by id (read only).
   * A component leaves it when it is destroyed, or garbage collected.
   */
  static get instances(): ReadonlyMap<ObjectId, Component> {
    return instancesView;
  }

  #state: 'non-initialized' | 'initialized' | 'deleted' = 'non-initialized';
  #deleted = false;
  readonly #initFunctions = new Set<InitFunction>();
  readonly id: string;

  constructor(id?: ObjectId) {
    super();
    // no id, or an empty one: generate it
    this.id = id || createUniqueId();

    // an id identifies one living component: it is free again once the
    // component with this id is destroyed
    if (livingComponent(this.id)) {
      throw new Error(`A component with the id "${this.id}" already exists`);
    }

    // save the current object
    registry.set(this.id, new WeakRef(this));
    finalization.register(this, this.id, this);
  }

  /**
   *  Object default init. <p>
   *
   *  @example
   *  myObject = new core.Object (core.createId ());
   *  myObject.init ();
   *  @return {Object} this
   */
  init(): this {
    if (this.#state !== 'non-initialized') {
      throw new Error('impossible to re-initialise a component');
    }

    try {
      this.initComponent();
      this.#initFunctions.forEach(func => func());
    } catch (e) {
      // not initialized: init() can be called again
      throw new Error('Component init failed with the error: ' + e, { cause: e });
    }

    this.#state = 'initialized';

    try {
      // Call optional end initialization method
      this.componentDidInitialize();
    } catch (e) {
      // the component stays initialized (see isInitialized())
      throw new Error(
        `Component ${this.id} is initialized, but componentDidInitialize failed with the error: ${e}`,
        { cause: e },
      );
    }

    return this;
  }

  /**
   *  Returns true once init() has initialized the component (even if
   *  componentDidInitialize() then failed), until it is deleted.
   */
  isInitialized(): boolean {
    return this.#state === 'initialized';
  }

  // eslint-disable-next-line class-methods-use-this
  protected initComponent(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected componentDidInitialize(): void {}

  /**
   *  Destroys the component: releases its resources (e.g. its event
   *  bindings, as source and as observer) and frees its id.
   *  Calling it again does nothing.
   *  <p>
   *  Subclasses release their own resources by overriding destructor().
   */
  destroy(): void {
    if (this.isDeleted()) return;
    this.destructor();
  }

  /**
   *  Releases the component resources. Called once, by destroy().
   *  When overriding it, call super.destructor().
   */
  protected destructor(): void {
    // release the mixins resources (e.g. the event bindings of EventSource)
    this.release();

    // remove the current object
    if (livingComponent(this.id) === this) registry.delete(this.id);
    finalization.unregister(this);

    this.#state = 'deleted';
  }

  isDeleted() {
    return this.#state === 'deleted';
  }

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  Called by JSON.stringify(), so that a component (alone or nested in
   *  other data) is serialized as the object returned by serialize().
   *
   * @return {Object} the object value for stringify
   */
  toJSON(): any {
    return this.serialize();
  }

  /**
   *  Returns the JSON string of the component.<p/>
   *  This can be used for persistence; the reverse operation is parseJSON().
   *
   * @return {String} the JSON string
   */
  stringify(): string {
    return toJSON(this.serialize());
  }

  /**
   *  Set objet's properties from JSON stringification.<p/>
   *  This can be used when retrieve data from serialization.
   *
   * @param {String} json The JSON String
   */
  parseJSON(json: string): void {
    try {
      if (!json) throw new SyntaxError('empty JSON string');

      const rawData = parseJSON(json);
      this.deserialize(rawData);
    } catch (e) {
      throw new Error('parseJSON failed with error: ' + e, { cause: e });
    }
  }

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   */
  protected serialize(): any {
    return { id: this.id };
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  protected deserialize(data: any): void {
  }
}

interface Component extends BaseIdentifiable, EventSource {}

applyMixins(Component, [EventSource]);

export default Component;


