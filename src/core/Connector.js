import { DEFAULT_DATAFLOW } from './Dataflow';
import { container } from "../../../VS_util/src/utils";
/**
 *  The class Connector is Dataflow Connector. Show not be instanced.
 *  A Connector Object is returned by the connect method call.
 *
 */
export default class Connector {
    objId;
    pOut;
    intermediateObjId;
    constructor(objId, pOut) {
        this.objId = objId;
        this.pOut = pOut;
    }
    /**
     * @param {Component} objId the Component the connector will be connected
     *        to
     * @param {String} pIn the Component in property name to connect
     *        to
     */
    to(object, pIn, func) {
        const df = container.get(DEFAULT_DATAFLOW);
        df.connect(this.objId, this.pOut, object.id, pIn, func);
        this.intermediateObjId = object.id;
        return this;
    }
    /**
     * @param {String} property_name the Component out property name to connect
     *        from
     */
    connect(pIn) {
        const objId = this.intermediateObjId || this.objId;
        return new Connector(objId, pIn);
    }
}
//# sourceMappingURL=Connector.js.map