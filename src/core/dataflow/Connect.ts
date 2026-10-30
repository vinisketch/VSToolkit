import { container } from 'vs_utils';

import type { DataflowNode } from './DataflowNode';
import { DEFAULT_DATAFLOW, type IDataFlow } from './IDataFlow';

/**
 * A reference to a property of a node: what component.$.property gives.
 * T is the type of the property.
 */
export class PropertyRef<T = unknown> {
  constructor(readonly node: DataflowNode, readonly name: string) {}

  // type of the property, for the type checking of the connections
  // (a method, so that a target property may accept a wider type)
  declare __type?: (value: T) => void;

  /**
   * Connects this property, on the default dataflow: same as
   * connect(this).to(…)
   */
  to<Targets extends RefsOf<[T]>>(...targets: Targets): Pipe<[T]> {
    return connect<[PropertyRef<T>]>(this).to(...targets);
  }

  /**
   * Same as connect(this).map(func)
   */
  map<R>(func: (value: T) => R): Pipe<[R]> {
    return connect<[PropertyRef<T>]>(this).map(func);
  }

  /**
   * Same as connect(this).mapAll(func)
   */
  mapAll<R extends unknown[]>(func: (value: T) => R): Pipe<R> {
    return connect<[PropertyRef<T>]>(this).mapAll(func);
  }

  toString(): string {
    return `${this.node.id}.${this.name}`;
  }
}

/**
 * The type of the value of a property reference
 */
export type ValueOf<R> = R extends PropertyRef<infer T> ? T : never;

/**
 * The types of the values of property references
 */
export type ValuesOf<Refs extends readonly PropertyRef<any>[]> = { [K in keyof Refs]: ValueOf<Refs[K]> };

/**
 * Property references accepting values of the given types
 */
export type RefsOf<V extends readonly unknown[]> = { [K in keyof V]: PropertyRef<V[K]> };

/**
 * The property references of a component: component.$
 */
export type PropertyRefs<C> = {
  readonly [K in keyof C as K extends '$' ? never : C[K] extends Function ? never : K]: PropertyRef<C[K]>;
};

/**
 * Returns the property references of a node (see Component.$): a proxy
 * creating a PropertyRef for each property name read on it.
 */
export function propertyRefs<C extends DataflowNode>(node: C): PropertyRefs<C> {
  return new Proxy({}, {
    get(_target, name) {
      if (typeof name !== 'string') return undefined;
      return new PropertyRef(node, name);
    },
  }) as PropertyRefs<C>;
}

type Transform = (...values: unknown[]) => unknown[];

/**
 * A chain of connections, created by connect() or DataFlow.from().
 * V is the types of the values it carries.
 *
 * @example
 *  connect(slider.$.value)
 *    .map(value => `${value}°`)
 *    .to(label.$.text);
 */
export class Pipe<V extends unknown[]> {
  /**
   * @private use connect() or DataFlow.from()
   */
  constructor(
    private readonly dataflow: IDataFlow,
    private readonly sources: PropertyRef<unknown>[],
    private readonly transform: Transform | undefined,
    // the connections of the whole chain, shared by its pipes
    private readonly edges: number[],
  ) {
    if (sources.length === 0) {
      throw new Error('connect: at least one property is needed');
    }
    checkSameNode(sources, 'the properties to connect from');
  }

  /**
   *  Maps the values to one value
   *
   * @param {Function} func called with the values, returns the new value
   */
  map<R>(func: (...values: V) => R): Pipe<[R]> {
    const transform = this.transform;
    const mapped: Transform = (...values) => [func(...(transform ? transform(...values) : values) as V)];
    return new Pipe(this.dataflow, this.sources, mapped, this.edges);
  }

  /**
   *  Maps the values to several values
   *
   * @param {Function} func called with the values, returns the new values
   */
  mapAll<R extends unknown[]>(func: (...values: V) => R): Pipe<R> {
    const transform = this.transform;
    const mapped: Transform = (...values) => func(...(transform ? transform(...values) : values) as V);
    return new Pipe(this.dataflow, this.sources, mapped, this.edges);
  }

  /**
   *  Connects the values to properties of a node, one value per property,
   *  and returns a pipe from these properties, to chain the connections.
   *  Throws if the properties are not of the same node, or for any reason
   *  DataFlow.connect throws (e.g. an unknown property, or different numbers
   *  of values and properties without map).
   *
   * @param {PropertyRef} targets the properties to connect to
   * @return {Pipe} a pipe from the target properties
   */
  to<Targets extends RefsOf<V>>(...targets: Targets): Pipe<V> {
    if (targets.length === 0) {
      throw new Error('connect.to: at least one property is needed');
    }
    checkSameNode(targets, 'the properties to connect to');

    const source = this.sources[0].node;
    const target = targets[0].node;
    const edge = this.dataflow.connect(
      source,
      this.sources.map(ref => ref.name),
      target,
      targets.map(ref => ref.name),
      this.transform,
    );
    this.edges.push(edge);

    return new Pipe(this.dataflow, targets as PropertyRef<unknown>[], undefined, this.edges);
  }

  /**
   *  Removes all the connections of the chain (the ones created by its
   *  to() calls).
   */
  disconnect(): void {
    for (const edge of this.edges) {
      this.dataflow.disconnect(edge);
    }
    this.edges.length = 0;
  }
}

function checkSameNode(refs: readonly PropertyRef<any>[], what: string): void {
  for (const ref of refs) {
    if (!(ref instanceof PropertyRef)) {
      throw new TypeError(`connect: ${what} must be property references (component.$.property)`);
    }
  }
  const node = refs[0].node;
  if (refs.some(ref => ref.node !== node)) {
    throw new Error(`connect: ${what} must be properties of the same component (${refs.join(', ')})`);
  }
}

/**
 * Creates a pipe on a dataflow (see DataFlow.from)
 * @private
 */
export function createPipe<Sources extends PropertyRef<any>[]>(
  dataflow: IDataFlow, sources: Sources,
): Pipe<ValuesOf<Sources>> {
  return new Pipe<ValuesOf<Sources>>(dataflow, sources, undefined, []);
}

/**
 *  Starts a chain of connections from properties of a component, on the
 *  default dataflow (see DataFlow.from for another dataflow).
 *
 *  @example
 *  connect(slider.$.value).to(view.$.rotation);
 *  connect(slider.$.value).map(v => `${v}°`).to(label.$.text);
 *  connect(a.$.x).to(b.$.x).to(c.$.x);                  // a.x -> b.x -> c.x
 *  connect(p.$.x, p.$.y).map((x, y) => Math.hypot(x, y)).to(q.$.distance);
 *
 * @param {PropertyRef} sources the properties to connect from
 * @return {Pipe} the pipe from these properties
 */
export function connect<Sources extends PropertyRef<any>[]>(...sources: Sources): Pipe<ValuesOf<Sources>> {
  return createPipe(container.get(DEFAULT_DATAFLOW), sources);
}
