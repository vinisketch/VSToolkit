import { BaseIdentifiable, ObjectId } from './BaseIdentifiable';
/**
 *  The class Connector is Dataflow Connector. Show not be instanced.
 *  A Connector Object is returned by the connect method call.
 *
 */
export default class Connector {
    private readonly objId;
    private readonly pOut;
    private intermediateObjId;
    constructor(objId: ObjectId, pOut: string);
    /**
     * @param {Component} objId the Component the connector will be connected
     *        to
     * @param {String} pIn the Component in property name to connect
     *        to
     */
    to(object: BaseIdentifiable, pIn: string, func?: any): this;
    /**
     * @param {String} property_name the Component out property name to connect
     *        from
     */
    connect(pIn: string): Connector;
}
//# sourceMappingURL=Connector.d.ts.map