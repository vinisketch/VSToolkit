import { ObjectId } from './BaseIdentifiable';
import DataflowNode from './DataflowNode';
/**
 *  The Dataflow class
 *
 *  @class
 *
 *  @author David Thevenin
 *
 */
export declare class DataFlow {
    #private;
    private static propagationCount;
    private readonly logger;
    private propagateValues;
    /**
     * Propagates values along the dataflow graph
     *
     * @protected
     *
     *                 propagation
     * @param obj
     * @param {Boolean} outputPropagation, do a propagation, starting from
     *         output property instead of input property (default configuration)
     */
    propagate(obj: DataflowNode, outputPropagation?: boolean): void;
    /**
     * Connect two components within the dataflow.
     * After a connection, you have to call build method to compile the dataflow.
     * Build can (should) be call when all connection are done (to avoid
     * un-necessary calculation)
     *
     * @function
     * @public
     * @param src
     * @param outDesc
     * @param trg
     * @param inDesc
     * @param func
     */
    connect(src: ObjectId | DataflowNode, outDesc: string | string[], trg: ObjectId | DataflowNode, inDesc: string | string[], func?: unknown): number;
    /**
     * Remove a dataflow connection
     * After the remove, you have to call build method to compile the dataflow.
     * Build can (should) be call when all remove are done (to avoid
     * un-necessary calculation)
     *
     *  @example
     *  // there is two APIs:
     *  df.disconnect(edgeId);
     *  or
     *  df.disconnect(obj_src, property_out, obj_trg, property_in);
     *
     * @param {Number|String|Object} edgeId the id of the edge to remove (this id is returned
     *                 by connect method) or obj_src the DataflowNode (or Id) source.
     * @param {String|Array} property_out one or an array of output property name(s)
     * @param {String|Object} obj_trg the DataflowNode (or Id) target.
     * @param {String|Array} property_in one or an array of input property name(s)
     */
    disconnect(edgeId: number): void;
    disconnect(src: ObjectId, outDesc: string, trg: ObjectId, inDesc: string): void;
    disconnect(src: DataflowNode, outDesc: string, trg: DataflowNode, inDesc: string): void;
    disconnect(src: ObjectId, outDesc: string[], trg: ObjectId, inDesc: string[]): void;
    disconnect(src: DataflowNode, outDesc: string[], trg: DataflowNode, inDesc: string[]): void;
    /**
     * Remove a dataflow connection using a edge parameters
     *
     * @private
     * @param {String|Object} obj_src the DataflowNode (or Id) source.
     * @param {String|Array} property_out one or an array of output property name(s)
     * @param {String|Object} obj_trg the DataflowNode (or Id) target.
     * @param {String|Array} property_in one or an array of input property name(s)
     */
    protected disconnectByParams(srcObj: DataflowNode, propertiesOut: string[], trgObj: DataflowNode, propertiesIn: string[]): void;
    /**
     * Remove a dataflow connection using a edge ids
     *
     * @param {Number} edgeId the id of the edge to remove
     */
    protected disconnectById(edgeId: number): void;
    /**
     * Performs a topological sort on this DAG, so that getNodes returns the
     * ordered list of nodes.<p>
     * Returns true if the graph is acyclic, false otherwise. When the graph is
     * cyclic, the algorithm does at it best to partially order it and issues a
     * warning.
     *
     * @private
     * @return {boolean}
     */
    protected sort(): boolean;
    build(): void;
    /**
     * @private
     */
    pausePropagation(): void;
    /**
     * @private
     */
    restartPropagation(): void;
    /**
     */
    private optimize;
}
export declare const DEFAULT_DATAFLOW: {
    id: Symbol;
    cast: (param: unknown) => DataFlow;
    toString(): string;
};
//# sourceMappingURL=Dataflow.d.ts.map