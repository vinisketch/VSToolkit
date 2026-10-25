import { Mixin } from 'vs_utils';
import Connector from '../Connector';
import type { BaseIdentifiable } from '../BaseIdentifiable';

/**
 * The direction of a property in the dataflow:
 * 'in' can only be connected to, 'out' can only be connected from,
 * 'inout' both.
 */
export type PropertyDirection = 'in' | 'out' | 'inout';

/**
 * The API of a dataflow node.
 * Every Component is a dataflow node: DataflowNodeMixin is applied to it.
 */
export interface DataflowNode extends BaseIdentifiable {
  /**
   *  Called by the dataflow when input properties have been changed.
   *  Reimplement it to compute output properties.
   *
   * @return {boolean} true to stop the propagation (output properties not
   *         changed), false to continue it
   */
  propertiesDidChange(): boolean;

  /**
   * Returns the descriptor of a property, along the prototype chain
   */
  getPropertyDescriptor(propName: string): PropertyDescriptor | undefined;

  /**
   * Returns the names of the declared properties (see Model), [] by default
   */
  getModelProperties(): string[];

  /**
   * Returns the direction of a declared property (see Model), undefined
   * when it is not declared: such a property can be connected both ways.
   */
  getPropertyDirection(propName: string): PropertyDirection | undefined;

  /**
   * Connects an out property of this node, using the default dataflow
   * (see Connector); build() must then be called on it.
   *
   * @example
   * slider.connect('value').to(view, 'rotation');
   * container.get(DEFAULT_DATAFLOW).build();
   *
   * @return {Connector} the connector of the out property
   */
  connect(propertyName: string): Connector;
}

/**
 * Implementation of DataflowNode, mixed in Component (see applyMixins).
 * A mixin has no field: only its methods are copied.
 */
export class DataflowNodeMixin extends Mixin {
  // eslint-disable-next-line class-methods-use-this
  propertiesDidChange(): boolean {
    return false;
  }

  getPropertyDescriptor(propName: string): PropertyDescriptor | undefined {
    for (let obj: object | null = this; obj; obj = Object.getPrototypeOf(obj)) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, propName);
      if (descriptor) return descriptor;
    }
    return undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  getModelProperties(): string[] {
    return [];
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  getPropertyDirection(propName: string): PropertyDirection | undefined {
    return undefined;
  }

  connect(this: BaseIdentifiable, propertyName: string): Connector {
    return new Connector(this.id, propertyName);
  }
}
