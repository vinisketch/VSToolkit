import { injectionToken } from 'vs_utils';
import type { DataflowNode } from './DataflowNode';
import type { Pipe, PropertyRef, ValuesOf } from './Connect';
import { ObjectId } from '../BaseIdentifiable';

/**
 * A dataflow: a graph of connections between properties of nodes (the
 * components), along which the property values are propagated.
 * See DataFlow, and docs/dataflow.md.
 */
export interface IDataFlow {
  /**
   * Propagates the values from a node, along the connections.
   * outputPropagation: true when only the node's out properties changed:
   * its propertiesDidChange() is then not called first.
   */
  propagate(obj: DataflowNode, outputPropagation?: boolean): void;

  /**
   * Connects out properties of src to in properties of trg, through an
   * optional function; returns the id of the connection (edge).
   */
  connect(
    src: ObjectId | DataflowNode,
    outDesc: string | string[],
    trg: ObjectId | DataflowNode,
    inDesc: string | string[],
    func?: Function,
  ): number;

  /**
   * Removes a connection, by its id or by its nodes and properties.
   */
  disconnect(edgeId: number): void;
  disconnect(src: ObjectId, outDesc: string, trg: ObjectId, inDesc: string): void;
  disconnect(src: DataflowNode, outDesc: string, trg: DataflowNode, inDesc: string): void;
  disconnect(src: ObjectId, outDesc: string[], trg: ObjectId, inDesc: string[]): void;
  disconnect(src: DataflowNode, outDesc: string[], trg: DataflowNode, inDesc: string[]): void;
  /**
   * Starts a chain of connections from properties of a component (see
   * Component.$ and connect())
   */
  from<Sources extends PropertyRef<any>[]>(...sources: Sources): Pipe<ValuesOf<Sources>>;

  /**
   * Compiles the connections; done automatically by the next propagation
   * after connecting or disconnecting
   */
  build(): void;

  /**
   * Pauses the propagation (the pauses add up)
   */
  pausePropagation(): void;

  /**
   * Ends a pause; it does not propagate the changes made during the pause
   */
  restartPropagation(): void;
}

/**
 * The token of the default dataflow, used by connect()/Connector:
 * container.get(DEFAULT_DATAFLOW)
 */
export const DEFAULT_DATAFLOW = injectionToken<IDataFlow>("DEFAULT_DATAFLOW");
