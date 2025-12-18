import { DEFAULT_DATAFLOW } from './Dataflow';
import { container } from 'vs_utils';
export default class DataflowState {
    comp;
    static states = new Map();
    df = new Set();
    constructor(comp, df) {
        this.comp = comp;
        this.df.add(df);
    }
    static add(comp, df = container.get(DEFAULT_DATAFLOW)) {
        const state = new DataflowState(comp, df);
        DataflowState.states.set(comp.id, state);
        return state;
    }
    static get(id) {
        return DataflowState.states.get(id);
    }
    propagate() {
        this.df.forEach(df => df.propagate(this.comp));
    }
    /**
     * Manually tel an input property change.
     * <br/>
     * It will generate a call to propertiesDidChange.
     * @name core.Object#inPropertyDidChange
     * @function
     *
     */
    inPropertyDidChange() {
        this.inputPropertyDidChange = true;
        // Dataflow propagation, do nothing
        // if (DataFlow.__nb_propagation > 0) return;
        // call the change propagation
        this.comp.propertiesDidChange();
        this.propagate();
    }
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
    outPropertyChange() {
        this.inputPropertyDidChange = true;
        this.propagate();
    }
    /**
     * Manually force properties change propagation.
     * <br/>
     * If no property name is specified, the system will assume all component's
     * properties have been modified.
     *
     * alias for inPropertyDidChange
     */
    propertyChange() {
        this.inPropertyDidChange();
    }
    pausePropagation() {
        this.df.forEach(df => df.pausePropagation());
    }
    restartPropagation() {
        this.df.forEach(df => df.restartPropagation());
    }
    inputPropertyDidChange = false;
}
//# sourceMappingURL=DataflowState.js.map