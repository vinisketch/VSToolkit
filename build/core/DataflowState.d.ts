import { ObjectId } from './BaseIdentifiable';
import { DataFlow } from './Dataflow';
import DataflowNode from './DataflowNode';
export default class DataflowState {
    private comp;
    private static readonly states;
    readonly df: Set<DataFlow>;
    private constructor();
    static add(comp: DataflowNode, df?: DataFlow): DataflowState;
    static get(id: ObjectId): DataflowState | undefined;
    propagate(): void;
    /**
     * Manually tel an input property change.
     * <br/>
     * It will generate a call to propertiesDidChange.
     * @name core.Object#inPropertyDidChange
     * @function
     *
     */
    inPropertyDidChange(): void;
    /**
     * Manually force out properties change propagation.
     * <br/>
     * If no property name is specified, the system will assume all component's
     * properties have been modified.
     *
     * @name core.Object#outPropertyChange
     * @function
     *
     * @param {String} property the name of the modified property.[optional]
     */
    outPropertyChange(): void;
    /**
     * Manually force properties change propagation.
     * <br/>
     * If no property name is specified, the system will assume all component's
     * properties have been modified.
     *
     * alias for inPropertyDidChange
     */
    propertyChange(): void;
    pausePropagation(): void;
    restartPropagation(): void;
    inputPropertyDidChange: boolean;
}
//# sourceMappingURL=DataflowState.d.ts.map