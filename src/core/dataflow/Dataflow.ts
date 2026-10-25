import {
  isArray, isFunction, isNumber, isString, container,
  defined
} from 'vs_utils';
import { BaseIdentifiable, ObjectId } from '../BaseIdentifiable';
import DataflowState from './DataflowState';
import type { DataflowNode } from './DataflowNode';
import { createPipe, type Pipe, type PropertyRef, type ValuesOf } from './Connect';
import Component from '../Component';

/**
 * The node of an id: the nodes are the components (DataflowNodeMixin)
 */
function nodeOf(id: ObjectId): DataflowNode | undefined {
  return Component.instances.get(id);
}
import { IDataFlow, DEFAULT_DATAFLOW } from './IDataFlow';
import { ILogger, LOGGER, consoleLogger } from "../ILogger";

let edgeIdCount = 1;

interface Edge {
  id: number;
  out: string[];
  in: string[];
  func?: Function;
}

type Getter<T> = () => T;
type Setter<T> = (v: T) => void;

interface CompiledEdge {
  id: number;
  getters: Getter<any>[];
  setters: Setter<any>[];
  func?: Function;
}

interface CompiledConnection {
  obj: DataflowNode,
  other: number,
  cEdges: CompiledEdge[],
  state: DataflowState,
}

type Edges = Array<Edge>;

type Connection = [ObjectId, number, Edges];

type Connections = Array<Connection>;

function buildConnectParameters(
  src: ObjectId | DataflowNode,
  outDesc: string | string[],
  trg: ObjectId | DataflowNode,
  inDesc: string | string[],
): [DataflowNode, string[], DataflowNode, string[]] {
  const srcObj = isString(src) ? nodeOf(src) : src;
  if (!srcObj) {
    throw new Error(`Unknown component or not data flow compatible, with id ${src}`);
  }
  const trgObj = isString(trg) ? nodeOf(trg) : trg;
  if (!trgObj) {
    throw new Error(`Unknown component or not data flow compatible, with id ${trg}`);
  }

  const propertiesOut = isString(outDesc) ? [outDesc] : outDesc;
  const propertiesIn = isString(inDesc) ? [inDesc] : inDesc;

  return [srcObj, propertiesOut, trgObj, propertiesIn];
}

/**
 * Returns the index of the smallest element into an array
 *
 * @private
 * @param {Array} indegrees the Array
 * @return {integer} the index
 */
function arrayMin(indegrees: number []): number {
  const count = indegrees.length;
  if (count === 0) return -1;
  if (count === 1) return 0;
  let minIndex = 0;
  let min = indegrees[minIndex];

  for (let i = 1; i < indegrees.length; i++) {
    if (indegrees[i] < min) {
      min = indegrees[i];
      minIndex = i;
    }
  }
  return minIndex;
}

/**
 * Returns the getters of the properties, in the same order.
 * Throws for a property which can not be read: a missing getter would shift
 * the values given to the setters.
 */
function generateGetters(obj: DataflowNode, properties: string[]): Getter<any>[] {
  return properties.map(pName => {
    const getter = obj.getPropertyDescriptor(pName)?.get;
    if (!getter) {
      throw new Error(`DataFlow: unknown out property "${pName}" of the node ${obj.id}`);
    }
    return getter;
  });
}

/**
 * Returns the setters of the properties, in the same order.
 * Throws for a property which can not be written.
 */
function generateSetters(obj: DataflowNode, properties: string[]): Setter<any>[] {
  return properties.map(pName => {
    const setter = obj.getPropertyDescriptor(pName)?.set;
    if (!setter) {
      throw new Error(`DataFlow: unknown in property "${pName}" of the node ${obj.id}`);
    }
    return setter;
  });
}

/**
 *  The Dataflow class
 *
 *  @class
 *  A dataflow connects properties of nodes (every Component is a node), and
 *  propagates their values along the connections:
 *  <ol>
 *    <li />connect() the out properties of a node to in properties of
 *      another one, possibly through a function;
 *    <li />build() the dataflow: it sorts the nodes (topologically) and
 *      compiles the connections;
 *    <li />propagate() from a node whose properties changed: the values are
 *      copied along the connections, and each reached node gets its
 *      propertiesDidChange() called, in the sorted order.
 *  </ol>
 *  The properties are accessors (getter for an out property, setter for an
 *  in property). The Model properties propagate when they change; for the
 *  other components, call propagate().
 *  <p>
 *  A default dataflow is given by container.get(DEFAULT_DATAFLOW); it is the
 *  one used by the connect() method of the components (see Connector).
 *  See docs/dataflow.md.
 *
 *  @example
 *  const df = new DataFlow();
 *  df.connect(slider, 'value', view, 'rotation');
 *  df.connect(slider, 'value', label, 'text', (value) => `${value}°`);
 *  df.build();
 *
 *  slider.value = 45;
 *  df.propagate(slider);
 *
 *  @author David Thevenin
 */
export class DataFlow implements IDataFlow {
  private static propagationCount = 0;
  #logger: ILogger | undefined;

  // resolved when first needed, console when no LOGGER is registered
  private get logger(): ILogger {
    if (!this.#logger) {
      try {
        this.#logger = container.get(LOGGER);
      } catch {
        this.#logger = consoleLogger;
      }
    }
    return this.#logger;
  }

  #isPropagating = false;
  // connections changed since the last build
  #needsBuild = false;
  // edges from components Object[component.id] => Array[3] <Object, , properties>
  readonly #optimizedEdges = new Map<ObjectId, CompiledConnection[]>();
  // ordered node list Array<Object>
  #nodes: any[] = [];

  readonly #edgesFrom = new Map<ObjectId, Connections>();
  #listNode: Array<ObjectId> = [];
  #shouldNotPropagate = 0;

  readonly #dataflowNodes: DataflowNode[] = [];

  #isSorted = false;
  #isCyclic = false;

  private propagateValues(objSrc: BaseIdentifiable): void {
    const cConnections = this.#optimizedEdges.get(objSrc.id);
    if (!cConnections) {
      return;
    }

    for (let cConnection of cConnections) {
      const objTrg = cConnection.obj;
      for (let edge of cConnection.cEdges) {
        let params = [];

        // get properties out values
        for (let getter of edge.getters) {
          params.push(getter.call(objSrc));
        }

        if (isFunction(edge.func)) {
          // eslint-disable-next-line prefer-spread
          params = edge.func.apply(undefined, params);
          if (!isArray(params)) {
            params = [params];
          }
        }

        // set properties in values
        if (params.length !== edge.setters.length) {
          // skip this edge, propagate the others
          this.logger.error('Dataflow, invalid parameters');
          continue;
        }

        // properties value propagation
        for (let l = 0; l < edge.setters.length; l++) {
          edge.setters[l].call(objTrg, params[l]);
        }

        cConnection.state.inputPropertyDidChange = true;
      }
    }
  }

  /**
   *  Propagates the values from a node along the connections, then from each
   *  reached node, in the sorted order: each reached node gets its
   *  propertiesDidChange() called, before its values are propagated (unless
   *  it returns true).<br />
   *  Does nothing while paused, or when called during a propagation (a node
   *  setting a property during the propagation).
   *
   * @param {DataflowNode} obj the node whose properties changed
   * @param {Boolean} outputPropagation true when only the out properties of
   *        the node changed: its propertiesDidChange() is not called first.
   *        False by default: its in properties changed.
   */
  propagate(obj: DataflowNode, outputPropagation = false): void {
    // The graph is sorted and save into an array.
    // Propagation consist of take each object of tree, one by one, following
    // the array order, and propagation value between node, and call
    // propertiesDidChange method.

    // 1) the dataflow is propagating values, do nothing.
    if (this.#isPropagating || this.#shouldNotPropagate) {
      return;
    }

    // the connections changed: compile them first
    if (this.#needsBuild) {
      this.build();
    }

    this.#isPropagating = true;
    DataFlow.propagationCount++;

    // the propagation state is reset even when a node throws
    try {
      this.#propagateFrom(obj, outputPropagation);
    } finally {
      DataFlow.propagationCount--;
      this.#isPropagating = false;
    }
  }

  #propagateFrom(obj: DataflowNode, outputPropagation: boolean): void {
    let i = 0;
    const l = this.#dataflowNodes.length;

    // 2) manage the first object from which starting propagation
    if (obj) {
      // find the first node corresponding to the id
      while (i < l && this.#dataflowNodes[i] !== obj) { i++; }

      // the node was found. First data propagation
      if (i < l) {
        if (!outputPropagation && obj.propertiesDidChange()) {
          // true means output properties were not changed.
          // => stop propagation

          return;
        }
        this.propagateValues(obj);
        i++;
      } else {
        i = 0;
      }
    }

    // 3) continue the propagation to following nodes
    for (; i < l; i++) {
      const nextObj = this.#dataflowNodes[i];
      const state = DataflowState.get(nextObj.id);
      if (state?.inputPropertyDidChange) {
        state.inputPropertyDidChange = false;
        if (nextObj.propertiesDidChange?.() !== true) {
          // true means output properties were not changed.
          // => stop propagation otherwise we continue
          this.propagateValues(nextObj);
        }
      }
    }
  }

  /**
   *  Connects out properties of the source to in properties of the target.
   *  The nodes take part in this dataflow (see DataflowState).<br />
   *  Without function, the values are copied one by one: there must be as
   *  many out as in properties. With a function, it is called with the out
   *  values and returns the in values: an array, or a single value for one
   *  in property; the numbers of properties may differ.<br />
   *  Throws for an unknown node or property, an in property of the source
   *  or an out property of the target (see Model), or different numbers of
   *  properties without function.<br />
   *  Call build() once the connections are done, before propagating.
   *
   *  @example
   *  df.connect(a, 'value', b, 'value');
   *  df.connect(a, ['x', 'y'], b, 'distance', (x, y) => Math.hypot(x, y));
   *
   * @param {ObjectId|DataflowNode} src the source node, or its id
   * @param {String|Array} outDesc the out property(ies) of the source
   * @param {ObjectId|DataflowNode} trg the target node, or its id
   * @param {String|Array} inDesc the in property(ies) of the target
   * @param {Function} func maps the out values to the in values [optional]
   * @return {number} the id of the connection (see disconnect)
   */
  connect(
    src: ObjectId | DataflowNode,
    outDesc: string | string[],
    trg: ObjectId | DataflowNode,
    inDesc: string | string[],
    func?: Function,
  ): number {
    const [srcObj, propertiesOut, trgObj, propertiesIn] = buildConnectParameters(src, outDesc, trg, inDesc);

    // without function, each out property is copied to an in property; a
    // function can map any number of out values to any number of in values
    if (!func && propertiesIn.length !== propertiesOut.length) {
      throw new Error('DataFlow.connect, parameter error: as many out as in properties are needed without function');
    }

    // throws for an unknown property
    generateGetters(srcObj, propertiesOut);
    generateSetters(trgObj, propertiesIn);

    // throws for a property connected against its direction
    for (const property of propertiesOut) {
      if (srcObj.getPropertyDirection(property) === 'in') {
        throw new Error(`DataFlow.connect: "${property}" of ${srcObj.id} is an in property, it can not be connected from`);
      }
    }
    for (const property of propertiesIn) {
      if (trgObj.getPropertyDirection(property) === 'out') {
        throw new Error(`DataFlow.connect: "${property}" of ${trgObj.id} is an out property, it can not be connected to`);
      }
    }

    // the nodes take part in this dataflow
    DataflowState.add(srcObj, this);
    DataflowState.add(trgObj, this);

    if (!this.#listNode.includes(srcObj.id)) this.#listNode.push(srcObj.id);
    if (!this.#listNode.includes(trgObj.id)) this.#listNode.push(trgObj.id);

    let connections = this.#edgesFrom.get(srcObj.id);
    if (!connections) {
      connections = [];
      this.#edgesFrom.set(srcObj.id, connections);
    }

    // find an existing connection to the component
    let edges = connections.find(connection => connection[0] === trgObj.id)?.[2];

    // no connection exist, create
    if (!edges) {
      edges = [];
      connections.push([trgObj.id, 1, edges]);
    }

    const edgeId = edgeIdCount++;
    edges.push({
      id: edgeId, out: propertiesOut.slice(), in: propertiesIn.slice(), func,
    });

    this.#needsBuild = true;
    return edgeId;
  }

  /**
   *  Removes a connection, by its id, or by its nodes and properties: the
   *  given properties are removed from the connections between the two
   *  nodes, and a connection left without out or in property is removed.
   *  Nothing happens for a connection which does not exist; throws for an
   *  unknown node.<br />
   *  Call build() once the changes are done, before propagating.
   *
   *  @example
   *  const id = df.connect(a, 'value', b, 'value');
   *  df.disconnect(id);
   *  // or
   *  df.disconnect(a, 'value', b, 'value');
   *
   * @param {Number|ObjectId|DataflowNode} edgeId the id returned by connect,
   *        or the source node (or its id)
   * @param {String|Array} outDesc the out property(ies) of the source
   * @param {ObjectId|DataflowNode} trg the target node, or its id
   * @param {String|Array} inDesc the in property(ies) of the target
   */
  disconnect(edgeId: number): void;
  disconnect(src: ObjectId, outDesc: string, trg: ObjectId, inDesc: string): void;
  disconnect(src: DataflowNode, outDesc: string, trg: DataflowNode, inDesc: string): void;
  disconnect(src: ObjectId, outDesc: string[], trg: ObjectId, inDesc: string[]): void;
  disconnect(src: DataflowNode, outDesc: string[], trg: DataflowNode, inDesc: string[]): void;
  disconnect(src: any, outDesc?: any, trg?: any, inDesc?: any): void {
    this.#needsBuild = true;
    if (isNumber(src)) {
      this.disconnectById(src);
    } else {
      const [srcObj, propertiesOut, trgObj, propertiesIn] = buildConnectParameters(src, outDesc, trg, inDesc);
      this.disconnectByParams(srcObj, propertiesOut, trgObj, propertiesIn);
    }
  }

  /**
   * Removes connections by their nodes and properties (see disconnect)
   *
   * @protected
   * @param {DataflowNode} srcObj the source node
   * @param {Array} propertiesOut the out properties of the source
   * @param {DataflowNode} trgObj the target node
   * @param {Array} propertiesIn the in properties of the target
   */
  protected disconnectByParams(srcObj: DataflowNode, propertiesOut: string[], trgObj:DataflowNode, propertiesIn: string[]) {
    const connections = this.#edgesFrom.get(srcObj.id);
    if (!connections) {
      return;
    }

    function removeProperties(sources: string[], list: string[]) {
      list.forEach(data => {
        const index = sources.indexOf(data);
        if (index !== -1) sources.splice(index, 1);
      });
    }

    // find an existing connection to the component
    for (let i = 0; i < connections.length;) {
      const connection = connections[i];
      if (connection[0] === trgObj.id) {
        const edges = connection[2];
        for (let j = 0; j < edges.length;) {
          const edge = edges[j];

          removeProperties(edge.out, propertiesOut);
          removeProperties(edge.in, propertiesIn);

          if (edge.out.length === 0 || edge.in.length === 0) {
            edges.splice(j, 1);
          } else j++;
        }
        if (edges.length === 0) {
          connections.splice(i, 1);
        } else i++;
      } else i++;
    }
  }

  /**
   * Removes a connection by its id (see disconnect)
   *
   * @protected
   * @param {Number} edgeId the id returned by connect
   */
  protected disconnectById(edgeId: number): void {
    this.#edgesFrom.forEach((connections, cid) => {
      if (connections) {
        // find an existing connection to the component
        for (let i = 0; i < connections.length; i++) {
          const connection = connections[i];
          const edges = connection[2];

          for (let j = 0; j < edges.length; j++) {
            const edge = edges[j];
            if (edge.id === edgeId) {
              edges.splice(j, 1);
              if (edges.length === 0) {
                connections.splice(i, 1);
                if (connections.length === 0) {
                  this.#edgesFrom.delete(cid);
                }
              }
              return;
            }
          }
        }
      }
    });
  }

  /**
   * Sorts the nodes topologically, for the propagation order (see build).<p>
   * Returns true if the graph is acyclic, false otherwise. When the graph is
   * cyclic, the nodes are partially ordered, and a warning is logged.
   *
   * @protected
   * @return {boolean} true if the graph is acyclic
   */
  protected sort() {
    /// This method uses the classical sorting algorithm with cycle-detection.
    /// See, e.g., http://www.cs.umb.edu/cs310/class23.html
    /// It is normally O(|E|) but this probably won't be the case here
    /// until efficiency issues have been solved.
    /// The algorithm has also been modified in order to cyclic graphs to be
    /// partially sorted instead of being not sorted at all.

    /// 1) Calculate in-degrees for nodes
    const indegrees: number[] = new Array(this.#listNode.length).fill(0);

    this.#edgesFrom.forEach(connections => {
      // FIXME: For more efficiency, store indexes into edges to avoid node
      // search.
      for (let connection of connections) {
        // find the index of the node in the node list
        const cid = connection[0];
        const index = this.#listNode.indexOf(cid);
        if (index === -1) {
          throw new Error('Sort, unknown id');
        }
        indegrees[index]++;
      }
    });

    /// 2) Initialization
    const pending = this.#listNode.slice();
    const sorted = [];
    let violationCount = 0;

    /// 3) Loop until everything has been sorted
    while (pending.length !== 0) {
      /// Extract a node of minimal input degree and append it to list top sorted
      const minI = arrayMin(indegrees);
      const indegree = indegrees[minI];

      indegrees.splice(minI, 1);
      const nId = pending[minI];
      pending.splice(minI, 1);

      if (indegree > 0) {
        violationCount++;
      }
      sorted.push(nId);

      /// 4) Decrement indegrees of nodes m adjacent to n
      /// FIXME: For more efficiency, store adjacent nodes to avoid this search.
      /// Use an adjacency matrix implementation ?
      const connections = this.#edgesFrom.get(nId);
      if (connections !== undefined) {
        for (let connection of connections) {
          const mi = pending.indexOf(connection[0]);
          if (mi !== -1) {
            indegrees[mi]--;
          }
        }
      }
    }

    /// 5) Update node list & return result
    this.#listNode = sorted;
    this.#isSorted = true;
    this.#isCyclic = violationCount > 0;

    if (violationCount > 0) {
      const edgeCount = this.#edgesFrom.size;
      this.logger.warn(
        'WARNING: Cycles detected during topological sort.'
        + '%d dependencies out of %d have been violated.\n',
        violationCount,
        edgeCount,
      );
    }
    return !this.#isCyclic;
  }

  /**
   *  Starts a chain of connections from properties of a component, on this
   *  dataflow (see connect() for the default dataflow).
   *
   *  @example
   *  df.from(slider.$.value).map(v => `${v}°`).to(label.$.text);
   *
   * @param {PropertyRef} sources the properties to connect from
   * @return {Pipe} the pipe from these properties
   */
  from<Sources extends PropertyRef<any>[]>(...sources: Sources): Pipe<ValuesOf<Sources>> {
    return createPipe(this, sources);
  }

  /**
   * Forgets the nodes which do not exist anymore (destroyed components),
   * and their connections
   */
  #forgetMissingNodes(): void {
    for (const id of [...this.#edgesFrom.keys()]) {
      if (!nodeOf(id)) this.#edgesFrom.delete(id);
    }
    for (const connections of this.#edgesFrom.values()) {
      for (let i = connections.length - 1; i >= 0; i--) {
        if (!nodeOf(connections[i][0])) connections.splice(i, 1);
      }
    }
    this.#listNode = this.#listNode.filter(id => nodeOf(id));
  }

  /**
   *  Compiles the dataflow: sorts the nodes and compiles the connections.
   *  It is done automatically by the next propagation after connecting or
   *  disconnecting; calling it explicitly compiles the dataflow at once.
   *  The destroyed components and their connections are forgotten.
   */
  build(): void {
    this.#forgetMissingNodes();
    this.#needsBuild = false;
    this.sort();
    this.optimize(this.#edgesFrom, this.#listNode);
  }

  /**
   *  Pauses the propagation: propagate() does nothing until
   *  restartPropagation() is called as many times.
   */
  pausePropagation(): void {
    this.#shouldNotPropagate++;
  }

  /**
   *  Ends a pause (see pausePropagation). It does not propagate the changes
   *  made during the pause: call propagate() for that.
   */
  restartPropagation(): void {
    this.#shouldNotPropagate--;
    if (this.#shouldNotPropagate < 0) {
      this.#shouldNotPropagate = 0;
    }
  }

  /**
   * Compiles the connections: resolves the nodes, and the getters and
   * setters of the connected properties
   */
  private optimize(edgeRefs: Map<ObjectId, Connections>, nodeList: ObjectId[]) {
    this.#dataflowNodes.length = 0;
    for (let id of nodeList) {
      const obj = nodeOf(id);
      if (obj) {
        this.#dataflowNodes.push(obj);
      }
    }

    this.#optimizedEdges.clear();
    for (const [id, data] of edgeRefs.entries()) {
      const objSrc = defined(nodeOf(id));

      const compiledConnections: CompiledConnection[] = [];
      this.#optimizedEdges.set(id, compiledConnections);

      for (let connections of data) {
        const cid = connections[0];
        const objTrg = defined(nodeOf(cid));

        const compiledConnection: CompiledConnection = {
          obj: objTrg,
          other: connections[1],
          cEdges: [],
          state: DataflowState.get(objTrg.id)!,
        };
        compiledConnections.push(compiledConnection);

        const edges = connections[2];
        for (let edge of edges) {
          const compiledEdge: CompiledEdge = {
            id: edge.id,
            getters: [],
            setters: [],
            func: edge.func,
          };
          compiledConnection.cEdges.push(compiledEdge);

          // manage out properties
          compiledEdge.getters = generateGetters(objSrc, edge.out);

          // manage in properties
          compiledEdge.setters = generateSetters(objTrg, edge.in);
        }
      }
    }
  }
}

export { DEFAULT_DATAFLOW } from './IDataFlow';
container.registerFactory(DEFAULT_DATAFLOW, () => new DataFlow())
