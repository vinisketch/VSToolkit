import { BaseIdentifiable, ObjectId } from './BaseIdentifiable';
import { container } from "vs_utils";
import { DEFAULT_DATAFLOW } from './dataflow/IDataFlow';

/**
 *  Connects an out property of a component on the default dataflow. Not to
 *  be instantiated: it is returned by the connect() method of the
 *  components. build() must be called on the default dataflow before
 *  propagating.
 *  Chaining connections is not supported yet (this API will be reworked).
 *
 *  @example
 *  slider.connect('value').to(view, 'rotation');
 *  container.get(DEFAULT_DATAFLOW).build();
 */
export default class Connector {
  private intermediateObjId: ObjectId | undefined;

  constructor(private readonly objId: ObjectId, private readonly pOut: string) {
  }

  /**
   * Connects the out property of the connector to an in property of the
   * object (see DataFlow.connect).
   *
   * @param {Component} object the target component
   * @param {String} pIn the in property of the target
   * @param {Function} func the function mapping the value [optional]
   * @return {Connector} this connector
   */
  to(object: BaseIdentifiable, pIn: string, func?: any) {
    const df = container.get(DEFAULT_DATAFLOW);
    df.connect(this.objId, this.pOut, object.id, pIn, func);
    this.intermediateObjId = object.id;

    return this;
  }

  /**
   * Not supported yet: chaining connections will be reworked.
   *
   * @param {String} pIn an out property
   * @return {Connector} a new connector
   */
  connect(pIn: string) {
    const objId = this.intermediateObjId || this.objId;

    return new Connector(objId, pIn);
  }
}
