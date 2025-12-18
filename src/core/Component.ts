import { toJSON, parseJSON, applyMixins, isString, SupportMixins } from 'vs_utils';
import { BaseIdentifiable,  ObjectId } from './BaseIdentifiable';
import DataflowNode from "./DataflowNode";
import { EventSource } from './event';
import { createUniqueId, ObjectConfig } from './helpers';


export type InitFunction = () => void;

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
  public static instances: { [id: string]: Component; } = {};

  #initialised = false;
  #initFunctions = new Set<InitFunction>();
  readonly id: string;

  constructor(id?: ObjectId) {
    super();
    this.id = isString(id) ? id : createUniqueId();
    // save the current object
    Component.instances[this.id] = this;
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
    if (this.#initialised) {
      throw new Error('impossible to re-initialise a component');
    }

    try {
      this.initComponent();
      this.#initFunctions.forEach(func => func());
      this.#initialised = true;

      // Call optional end initialization method
      this.componentDidInitialize();
    } catch (e) {
      throw new Error('Component init failed with the error: ' + e);
    }

    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  protected initComponent(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected componentDidInitialize(): void {}

  protected destructor(): void {
    // remove the current object
    delete Component.instances[this.id];

    this.#initialised = false;
  }

  isDeleted() {
    return !this.#initialised;
  }

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   *
   * @return {Object} the object value for stringify
   */
  toJSON(): string {
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
      const rawData = parseJSON(json);
      this.deserialize(rawData);
    } catch (e) {
      throw new Error('parseJSON failed with error: ' + e);
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

export { Component };
