import { toJSON, parseJSON, applyMixins, isString } from 'vs_utils';
import { EventSource } from './event';
import { createUniqueId } from './helpers';
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
class Component {
    static instances = {};
    #initialised = false;
    #initFunctions = new Set();
    id;
    constructor(id) {
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
    init() {
        if (this.#initialised) {
            throw new Error('impossible to re-initialise a component');
        }
        try {
            this.initComponent();
            this.#initFunctions.forEach(func => func());
            this.#initialised = true;
            // Call optional end initialization method
            this.componentDidInitialize();
        }
        catch (e) {
            throw new Error('Component init failed with the error: ' + e);
        }
        return this;
    }
    // eslint-disable-next-line class-methods-use-this
    initComponent() { }
    // eslint-disable-next-line class-methods-use-this
    componentDidInitialize() { }
    destructor() {
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
    toJSON() {
        return toJSON(this.serialize());
    }
    /**
     *  Set objet's properties from JSON stringification.<p/>
     *  This can be used when retrieve data from serialization.
     *
     * @param {String} json The JSON String
     */
    parseJSON(json) {
        try {
            const rawData = parseJSON(json);
            this.deserialize(rawData);
        }
        catch (e) {
            throw new Error('parseJSON failed with error: ' + e);
        }
    }
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     */
    serialize() {
        return { id: this.id };
    }
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
    deserialize(data) {
    }
}
applyMixins(Component, [EventSource]);
export { Component };
//# sourceMappingURL=Component.js.map