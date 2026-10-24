import { injectionToken } from 'vs_utils';
import DataflowNode from './DataflowNode';
import { ObjectId } from '../BaseIdentifiable';

export interface IDataFlow {
  propagate(obj: DataflowNode, outputPropagation?: boolean): void;
  connect(
    src: ObjectId | DataflowNode,
    outDesc: string | string[],
    trg: ObjectId | DataflowNode,
    inDesc: string | string[],
    func?: unknown,
  ): number;
  disconnect(edgeId: number): void;
  disconnect(src: ObjectId, outDesc: string, trg: ObjectId, inDesc: string): void;
  disconnect(src: DataflowNode, outDesc: string, trg: DataflowNode, inDesc: string): void;
  disconnect(src: ObjectId, outDesc: string[], trg: ObjectId, inDesc: string[]): void;
  disconnect(src: DataflowNode, outDesc: string[], trg: DataflowNode, inDesc: string[]): void;
  build(): void;
  pausePropagation(): void;
  restartPropagation(): void;
}

export const DEFAULT_DATAFLOW = injectionToken<IDataFlow>("DEFAULT_DATAFLOW");
