/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isString, SupportMixins } from 'vs_utils';
import { createUniqueId } from './helpers';
// import DataflowState from './DataflowState';
import Connector from './Connector';
const nodesBis = new Map();
export function Input(value, { name, addInitializer, ...rest }) {
    console.log(addInitializer);
    console.log(rest);
    addInitializer(function () {
        let node = nodesBis.get(this);
        if (!node) {
            node = new DataflowNode(this.id);
            nodesBis.set(this, node);
        }
    });
}
export default class DataflowNode extends SupportMixins {
    #configParams;
    id;
    static #nodes = new Map();
    static get(id) {
        return DataflowNode.#nodes.get(id);
    }
    constructor(id) {
        super();
        this.id = isString(id) ? id : createUniqueId();
        // DataflowState.add(this);
        DataflowNode.#nodes.set(this.id, this);
        if (this.#configParams) {
            this.configure(this.#configParams);
            this.#configParams = undefined;
        }
    }
    /**
     *  Object configuration method. <p>
     *  Call this method to adjust some properties of the internal components
     *  using one call. <br/>
     *  It takes as parameters, an associated array <propertyName, value>.
     *  <br/><br/>
     *  Ex:
     *  @example
     *  var myObject = new core.Object ({id: 'myobject'});
     *  myObject.init ();
     *
     *  myObject.configure ({prop1: "1", prop2: 'hello', ..});
     *  <=>
     *  myObject.prop1 = "1";
     *  myObject.prop2 = "hello";
     *  ...
     *
     * @name core.Object#configure
     * @function
     *
     * @param {Object} config the associated array used for configuring the
     *        object.
     */
    configure(config) {
        // let shouldPropagate = false;
        // // let props; let key; let i; ; let
        // //   desc;
        // const state = DataflowState.get(this.id)!;
        // state.pausePropagation();
        //
        // // Manage model
        // // if (config instanceof Model) {
        // //   desc = this.getPropertyDescriptor ('model');
        // //   if (desc && desc.set) {
        // //     // model property assignation
        // //     this.model = config;
        // //     shouldPropagate = true;
        // //   }
        // //   else {
        // //     // one by one property copy
        // //     props = config.getModelProperties ();
        // //     for (i = 0; i < props.length; i += 1)
        // //     {
        // //       key = props [i];
        // //       if (key === 'id') continue;
        // //       this [key] = config [key];
        // //       shouldPropagate = true;
        // //     }
        // //   }
        // // }
        // // else {
        // if (config) {
        //   const properties = this.getModelProperties();
        //   properties.forEach(key => {
        //     // @ts-ignore
        //     this[key] = config[key];
        //     shouldPropagate = true;
        //   });
        // }
        // // }
        //
        // state.restartPropagation();
        // if (shouldPropagate) {
        //   this.propertiesDidChange();
        //   state.propagate();
        // }
    }
    /**
     *  This method is called by the dataflow algorithm when input properties have
     *  been changed.
     *  You should reimplement this method if you want make specific calculation
     *  on properties changed, and/or modifying output properties.
     *  If you have modifying an output property (and want to continue the
     *  dataflow propagation) you have to return 'false' or nothing.
     *  Otherwise return 'true' to and the propagation will terminate.
     *
     * @return {boolean} true if you want stop de propagation, false otherwise
     */
    // eslint-disable-next-line class-methods-use-this
    propertiesDidChange() {
        return false;
    }
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     */
    // protected override serialize(): any {
    //   const base = super.serialize();
    //   const properties = this.getModelProperties();
    //
    //   if (properties) {
    //     properties.forEach(propName => {
    //       // @ts-ignore TODO a fixer
    //       const value = this[`_${underscore(propName)}`];
    //       if (value === undefined) {
    //         return;
    //       }
    //       let result;
    //       if (isDate(value)) {
    //         result = value;
    //       } else if (isFunction(value.serialize)) {
    //         logger.warn('THIS CASE IS NOT PROPERLY MANAGED, (especially deserialization)');
    //         result = value.serialize();
    //       } else {
    //         result = value;
    //       }
    //       base[propName] = result;
    //     });
    //   }
    //   return base;
    // }
    //
    // /**
    //  * @protected
    //  */
    // protected override deserialize(data: any): void {
    //   this.configure(data);
    // }
    /**
     * Returns a property descriptor for a property (along the object's
     * prototype chain) of a given object.
     *
     * @param {String} propName The name of the property whose description is to
     *   be retrieved
     * @return {Object} The property descriptor or null
     */
    getPropertyDescriptor(propName) {
        const desc = Object.getOwnPropertyDescriptor(this, propName);
        if (desc)
            return desc;
        /** @private */
        function getOwnPropertyDescriptor(obj) {
            if (!obj)
                return undefined;
            const proto = Object.getPrototypeOf(obj);
            if (!proto)
                return undefined;
            const subCompDesc = Object.getOwnPropertyDescriptor(proto, propName);
            if (subCompDesc)
                return subCompDesc;
            return getOwnPropertyDescriptor(proto);
        }
        return getOwnPropertyDescriptor(this);
    }
    // eslint-disable-next-line class-methods-use-this
    getModelProperties() {
        return [];
    }
    /**
     * Connect two components within the dataflow.
     * This method return a Connector that will allow you to declare your
     * dataflow with a simple chaining API.
     *
     * @example
     * /// First example: the slide will rotate the view1 and view2
     * var slider = new vs.ui.Slider ({}).init ();
     * var view1 = new vs.ui.View ({}).init ();
     * var view2 = new vs.ui.View ({}).init ();
     *
     * slider
     *   .connect ("value") // out property
     *   .to (view1, "rotation"); // in property
     *   .to (view2, "rotation"); // in property
     *
     * /// Seconde example: the slide will rotate the view1 and view2
     * var slider = new vs.ui.Slider ({range: [1, 10]}).init ();
     * var list = new core.Array({data: ["item1", ..., "item10"]}).init ();
     * var label = new vs.ui.TextLabel ({}).init ();
     *
     * slider
     *   .connect ("value") // out property
     *   .to (list, "index") // in property
     *     .connect ("value") // in property
     *     .to (label, "text"); // in property
     *
     *
     * @name core.Object#connect
     * @function
     * @public
     * @param {String} property_name the Component out property name to connect
     *                 from
     * @return {Connector} returns the connector object that allow the chaining
     */
    connect(propertyName) {
        return new Connector(this.id, propertyName);
    }
}
//# sourceMappingURL=DataflowNode.js.map