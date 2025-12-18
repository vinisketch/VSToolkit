import { SupportMixins } from 'vs_utils';
import { ObjectConfig } from './helpers';
import Connector from './Connector';
import { BaseIdentifiable, ObjectId } from "./BaseIdentifiable";
export declare function Input(value: any, { name, addInitializer, ...rest }: any): void;
export default class DataflowNode extends SupportMixins implements BaseIdentifiable {
    #private;
    readonly id: string;
    static get(id: string): DataflowNode | undefined;
    constructor(id?: ObjectId);
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
    protected configure(config: Exclude<ObjectConfig, 'id'>): void;
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
    propertiesDidChange(): boolean;
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     */
    /**
     * Returns a property descriptor for a property (along the object's
     * prototype chain) of a given object.
     *
     * @param {String} propName The name of the property whose description is to
     *   be retrieved
     * @return {Object} The property descriptor or null
     */
    getPropertyDescriptor(propName: string): PropertyDescriptor | undefined;
    getModelProperties(): string[];
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
    connect(propertyName: string): Connector;
}
//# sourceMappingURL=DataflowNode.d.ts.map