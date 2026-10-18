// import { BaseIdentifiable, ObjectId } from './BaseIdentifiable';
// import { container } from "vs_utils";
// import { DEFAULT_DATAFLOW } from './IDataFlow';

// /**
//  *  The class Connector is Dataflow Connector. Show not be instanced.
//  *  A Connector Object is returned by the connect method call.
//  *
//  */
// export default class Connector {
//   private intermediateObjId: ObjectId | undefined;

//   constructor(private readonly objId: ObjectId, private readonly pOut: string) {
//   }

//   /**
//    * @param {Component} objId the Component the connector will be connected
//    *        to
//    * @param {String} pIn the Component in property name to connect
//    *        to
//    */
//   to(object: BaseIdentifiable, pIn: string, func?: any) {
//     const df = container.get(DEFAULT_DATAFLOW);
//     df.connect(this.objId, this.pOut, object.id, pIn, func);
//     this.intermediateObjId = object.id;

//     return this;
//   }

//   /**
//    * @param {String} property_name the Component out property name to connect
//    *        from
//    */
//   connect(pIn: string) {
//     const objId = this.intermediateObjId || this.objId;

//     return new Connector(objId, pIn);
//   }
// }
