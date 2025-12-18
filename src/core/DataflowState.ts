import { ObjectId } from './BaseIdentifiable';
import { DataFlow, defaultDataflow } from './Dataflow';
import DataflowComponent from './DataflowComponent';

export default class DataflowState {
  private static readonly states = new Map<ObjectId, DataflowState>();

  readonly df = new Set<DataFlow>();

  private constructor(private comp: DataflowComponent, df: DataFlow) {
    this.df.add(df);
  }

  static add(comp: DataflowComponent, df: DataFlow = defaultDataflow): DataflowState {
    const state = new DataflowState(comp, df);
    DataflowState.states.set(comp.id, state);
    return state;
  }

  static get(id: ObjectId): DataflowState | undefined {
    return DataflowState.states.get(id);
  }

  propagate(): void {
    this.df.forEach(df => df.propagate(this.comp));
  }

  /**
   * Manually tel an input property change.
   * <br/>
   * It will generate a call to propertiesDidChange.
   * @name vs.core.Object#inPropertyDidChange
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
   * @name vs.core.Object#outPropertyChange
   * @function
   *
   * @param {String} property the name of the modified property.[optional]
   */
  outPropertyChange(): void {
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

  pausePropagation(): void {
    this.df.forEach(df => df.pausePropagation());
  }

  restartPropagation(): void {
    this.df.forEach(df => df.restartPropagation());
  }

  inputPropertyDidChange = false;
}
