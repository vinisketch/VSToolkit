// import { ObjectId } from './BaseIdentifiable';
// import { IDataFlow, DEFAULT_DATAFLOW } from './IDataFlow';
// import DataflowNode from './DataflowNode';
// import { container } from 'vs_utils';

// export default class DataflowState {
//   private static readonly states = new Map<ObjectId, DataflowState>();

//   readonly dataflows = new Set<IDataFlow>();

//   private constructor(private comp: DataflowNode, df: IDataFlow) {
//     DataflowState.states.set(comp.id, this);
//   }

//   static add(comp: DataflowNode, df = container.get(DEFAULT_DATAFLOW)): DataflowState {
//     const state = DataflowState.states.get(comp.id) ?? new DataflowState(comp, df);
//     state.dataflows.add(df);
//     return state;
//   }

//   static get(id: ObjectId): DataflowState | undefined {
//     return DataflowState.states.get(id);
//   }

//   propagate(): void {
//     this.dataflows.forEach(df => df.propagate(this.comp));
//   }

//   /**
//    * Manually tell an input property change.
//    * <br/>
//    * It will generate a call to propertiesDidChange.
//    * @name core.Object#inPropertyDidChange
//    * @function
//    *
//    */
//   inPropertyDidChange() {
//     this.inputPropertyDidChange = true;

//     // Dataflow propagation, do nothing
//     // if (DataFlow.__nb_propagation > 0) return;

//     // call the change propagation
//     this.comp.propertiesDidChange();
//     this.propagate();
//   }

//   /**
//    * Manually force out properties change propagation.
//    * <br/>
//    * If no property name is specified, the system will assume all component's
//    * properties have been modified.
//    *
//    * @name core.Object#outPropertyChange
//    */
//   outPropertyChange(): void {
//     this.inputPropertyDidChange = true;
//     this.propagate();
//   }

//   /**
//    * Manually force properties change propagation.
//    * <br/>
//    * If no property name is specified, the system will assume all component's
//    * properties have been modified.
//    *
//    * alias for inPropertyDidChange
//    */
//   propertyChange() {
//     this.inPropertyDidChange();
//   }

//   pausePropagation(): void {
//     this.dataflows.forEach(df => df.pausePropagation());
//   }

//   restartPropagation(): void {
//     this.dataflows.forEach(df => df.restartPropagation());
//   }

//   inputPropertyDidChange = false;
// }
