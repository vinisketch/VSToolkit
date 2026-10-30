import { ObjectId } from '../BaseIdentifiable';
import { IDataFlow, DEFAULT_DATAFLOW } from './IDataFlow';
import type { DataflowNode } from './DataflowNode';
import { container } from 'vs_utils';

/**
 * The dataflow state of a node: the dataflows it takes part in, and whether
 * its in properties changed during a propagation.
 * DataFlow.connect() adds the nodes it connects (see add).
 */
export default class DataflowState {
  private static readonly states = new Map<ObjectId, DataflowState>();

  /**
   * The dataflows the node takes part in
   */
  readonly dataflows = new Set<IDataFlow>();

  private constructor(private comp: DataflowNode, df: IDataFlow) {
    DataflowState.states.set(comp.id, this);
  }

  /**
   * Adds the node to a dataflow (the default dataflow by default), and
   * returns its state
   */
  static add(comp: DataflowNode, df = container.get(DEFAULT_DATAFLOW)): DataflowState {
    const state = DataflowState.states.get(comp.id) ?? new DataflowState(comp, df);
    state.dataflows.add(df);
    return state;
  }

  /**
   * The state of a node, undefined if it takes part in no dataflow
   */
  static get(id: ObjectId): DataflowState | undefined {
    return DataflowState.states.get(id);
  }

  /**
   * Propagates from the node, in each of its dataflows
   */
  propagate(): void {
    this.dataflows.forEach(df => df.propagate(this.comp));
  }

  /**
   * Tells that in properties of the node changed: calls its
   * propertiesDidChange(), then propagates from the node.
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
   * Tells that out properties of the node changed: propagates from the node
   * (in each of its dataflows).
   */
  outPropertyChange(): void {
    this.inputPropertyDidChange = true;
    this.propagate();
  }

  /**
   * Alias of inPropertyDidChange()
   */
  propertyChange() {
    this.inPropertyDidChange();
  }

  /**
   * Pauses the propagation of the dataflows of the node
   */
  pausePropagation(): void {
    this.dataflows.forEach(df => df.pausePropagation());
  }

  /**
   * Ends a pause of the dataflows of the node
   */
  restartPropagation(): void {
    this.dataflows.forEach(df => df.restartPropagation());
  }

  /**
   * Set when the dataflow changed in properties of the node, until the
   * propagation reaches it
   */
  inputPropertyDidChange = false;
}
