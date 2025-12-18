import { isString, toJSON, parseJSON } from 'vs_utils';
import BaseIdentifiable, { ObjectId } from '../../../src/core/BaseIdentifiable';
import logger from '../../../src/logger';
import { VSEventTargetInterface } from '../../../src/core/event';

let idIndex = 1;

/**
 * Returns a local unique Id <p>
 * The algorithm is based on an index initialized when the page is loaded.
 */
// eslint-disable-next-line no-plusplus
export const createUniqueId = (): string => `vs_id_${idIndex++}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

export type ObjectConfig = Record<string, any>;

export type InitFunction = () => void;

/**
 *  @class Object
 *  vs.core.Object is the root class of most class hierarchies. Through
 *  vs.core.Object, objects inherit a basic interface for configuration
 *  and clone mechanism. It provides an unique identifier for objects.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.Object
 *
 * @param {Object} config the configuration structure
*/
export default class Component implements BaseIdentifiable, VSEventTargetInterface {
  public static instances: { [id: string]: Component; } = {};

  readonly id: string;
  #initialised = false;
  #initFunctions = new Set<InitFunction>();

  constructor(id?: ObjectId) {
    // configuration
    if (isString(id)) {
      this.id = id;
    } else {
      this.id = createUniqueId();
    }
    // save the current object
    Component.instances[this.id] = this;
  }

  protected registerInitFunction(func: InitFunction) {
    this.#initFunctions.add(func);
  }

  /**
   *  Object default init. <p>
   *
   * @name vs.core.Object#init
   * @function
   *
   *  @example
   *  myObject = new vs.core.Object (vs.core.createId ());
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
      logger.error('Component init failed with the error: ', e);
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
      logger.error('parseJSON failed with error: ', e);
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


  /***
   * VS Event Target implementation
   */



}
