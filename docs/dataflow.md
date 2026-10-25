# Dataflow

The dataflow connects properties of components, and propagates their values
along the connections: when a property changes, the properties connected to
it are updated, then the ones connected to those, and so on.

```ts
import { connect } from 'vs_toolkit/vs_core';

connect(slider.$.value).to(view.$.rotation);
connect(slider.$.value).map(value => `${value}°`).to(label.$.text);

slider.value = 45;   // slider is a Model: view.rotation === 45, label.text === '45°'
```

`slider.$.value` is a **reference** to the `value` property of `slider` (not
its value): the connections are typed, and checked by the compiler.

| Export | Kind | Purpose |
|---|---|---|
| `connect()` | function | Starts a chain of connections on the default dataflow |
| `PropertyRef`, `Pipe` | classes | A property reference (`component.$.property`), a chain of connections |
| `DataFlow` | class | A dataflow: connections, build, propagation |
| `DEFAULT_DATAFLOW` | token | `container.get(DEFAULT_DATAFLOW)` gives the default dataflow |
| `IDataFlow` | interface | The API of a dataflow |
| `DataflowNode` | interface | The node API, implemented by every `Component` |
| `PropertyDirection` | type | `'in' \| 'out' \| 'inout'` |
| `Connector` | class | Deprecated: `node.connect('out').to(target, 'in')` |
| `Model`, `In`, `Out`, `InOut` | class, decorators | Components whose declared properties propagate when they change |

## Nodes and properties

Every `Component` is a dataflow node. A node's properties are **accessors**:

- an **out** property (connected *from*) needs a getter;
- an **in** property (connected *to*) needs a setter.

A plain field (`value = 0`) is not an accessor: connecting it throws.

```ts
class Slider extends Component {
  #value = 0;
  get value() { return this.#value; }
  set value(v: number) { this.#value = v; }
}
```

A [`Model`](#models) declares its properties with a direction (`@In`,
`@Out`, `@InOut`): connecting *from* an `@In` property, or *to* an `@Out`
property, throws. The properties of other components can be connected both
ways.

### propertiesDidChange()

A node is told that its in properties changed by its `propertiesDidChange()`
method (it returns `false` by default). Override it to compute out properties
from the in ones:

```ts
class Doubler extends Component {
  // … accessors input (in) and output (out)
  override propertiesDidChange(): boolean {
    this.output = this.input * 2;
    return false;   // true stops the propagation from this node
  }
}
```

Returning `true` means "my out properties did not change": the propagation
does not continue from this node.

## Connecting

### Property references: `$`

`component.$.name` is a reference to the property `name` of `component`: it
does not read the property. `connect()` starts a chain of connections from
references, on the default dataflow (`df.from()` does the same on another
dataflow):

```ts
connect(a.$.x).to(b.$.x);                        // a.x -> b.x
connect(a.$.x).to(b.$.x).to(c.$.y);              // a.x -> b.x -> c.y
connect(a.$.x, a.$.y).to(b.$.y, b.$.x);          // one value per property
connect(a.$.celsius).map(c => c * 9 / 5 + 32).to(b.$.fahrenheit);
connect(p.$.x, p.$.y).map((x, y) => Math.hypot(x, y)).to(q.$.distance);   // 2 -> 1
connect(p.$.point).mapAll(pt => [pt.x, pt.y]).to(q.$.x, q.$.y);          // 1 -> 2

df.from(a.$.x).to(b.$.x);                        // on the dataflow df
a.$.x.to(b.$.x);                                 // same as connect(a.$.x).to(b.$.x)
```

- `.to(…targets)` connects the values to the target properties, one value
  per property, and returns a pipe **from the targets**: `.to()` calls chain
  the connections (`a -> b -> c`). To connect a value to several targets,
  write several `connect()`.
- `.map(func)` maps the values to **one** value; `.mapAll(func)` to several
  values (it returns them as an array). A map applies to the next `.to()`;
  maps compose (`.map(f).map(g)`).
- The properties given to `connect()`, or to one `.to()`, must be properties
  of the same component.
- Everything is typed: `$` only has the properties of the component, and a
  value can only be connected to a property of a compatible type (after its
  map).

```ts
connect(slider.$.value).to(label.$.text);                   // compile error: number -> string
connect(slider.$.value).map(v => `${v}`).to(label.$.text);  // ok
```

A chain is also the handle of its connections: `disconnect()` removes them
all.

```ts
const chain = connect(a.$.x).to(b.$.x).to(c.$.x);
chain.disconnect();
```

### DataFlow.connect()

The references are built on `DataFlow.connect()`, which connects property
names:

```ts
const id = df.connect(src, outProperties, trg, inProperties, func?);
```

- `src` and `trg` are components, or their ids.
- `outProperties` and `inProperties` are a property name or an array of
  names.
- Without function, the values are copied one by one: there must be **as
  many out as in properties**.
- With a function, it is called with the out values, in order, and returns
  the in values: an array, or a single value for one in property. The
  numbers of properties may then differ.
- `df.connect()` returns the id of the connection, for `df.disconnect()`.

```ts
df.connect(a, 'value', b, 'value');                           // copy
df.connect(a, ['x', 'y'], b, ['x', 'y']);                     // 2 -> 2
df.connect(a, 'celsius', b, 'fahrenheit', (c) => c * 9 / 5 + 32);
df.connect(a, ['x', 'y'], b, 'distance', (x, y) => Math.hypot(x, y)); // 2 -> 1
df.connect(a, 'point', b, ['x', 'y'], (p) => [p.x, p.y]);             // 1 -> 2
```

`df.connect()` (and so `.to()`) throws for:

- an unknown node (id);
- an unknown property: a missing getter (out) or setter (in);
- an `@In` property of the source, or an `@Out` property of the target;
- different numbers of out and in properties without function.

A function returning the wrong number of values is detected during the
propagation: the error is logged and this connection is skipped, the others
still propagate.

### build()

The connections are compiled by `build()`: it sorts the nodes
(topologically: each node after the nodes it depends on) and compiles the
connections. **It is done automatically** by the next propagation after
connecting or disconnecting; calling it explicitly compiles at once. The
destroyed components, and their connections, are forgotten by the build.

A cyclic graph is accepted: the nodes are partially ordered, and a warning is
logged. A propagation still reaches each node at most once.

## Propagating

```ts
df.propagate(node);         // node's in properties changed
df.propagate(node, true);   // only node's out properties changed
```

From the node, in the sorted order:

1. unless `outputPropagation` is `true`, the node's `propertiesDidChange()` is
   called; returning `true` stops the propagation;
2. the values are copied along the node's connections, through their
   functions, to the target nodes;
3. each reached node gets its `propertiesDidChange()` called, then its values
   are propagated in turn (unless it returned `true`).

Setting a property of a plain component does not propagate anything: call
`propagate()`. The properties of a [`Model`](#models) propagate by
themselves.

A propagation is synchronous. `propagate()` does nothing when called during a
propagation (e.g. by a node setting a property in `propertiesDidChange()`):
the running propagation already handles the reached nodes. If a node throws,
the exception goes up to the caller of `propagate()`, and the dataflow keeps
working.

### Pausing

```ts
df.pausePropagation();
a.x = 1;
a.y = 2;
df.restartPropagation();
df.propagate(a);
```

While paused, `propagate()` does nothing. Pauses add up: the propagation
restarts when `restartPropagation()` was called as many times as
`pausePropagation()`. `restartPropagation()` does not propagate the changes
made during the pause: call `propagate()` for that.

## Disconnecting

```ts
const chain = connect(a.$.value).to(b.$.value);
chain.disconnect();
// or, with DataFlow.connect()
const id = df.connect(a, 'value', b, 'value');
df.disconnect(id);
// or, by nodes and properties
df.disconnect(a, 'value', b, 'value');
```

By nodes and properties, the given properties are removed from the
connections between the two nodes, and a connection left without out or in
property is removed: `df.disconnect(a, 'y', b, 'y')` keeps the `x` part of a
`['x', 'y'] -> ['x', 'y']` connection.

Disconnecting a connection which does not exist does nothing; an unknown node
throws.

## The default dataflow

`container.get(DEFAULT_DATAFLOW)` gives the default dataflow (always the same
instance): the one used by `connect()` and `ref.to()`. Use `new DataFlow()`
and `df.from()` for a separate dataflow (e.g. in tests).

The former `node.connect('out').to(target, 'in')` API (`Connector`) still
works on the default dataflow, but it is deprecated: use the references.

## Models

A `Model` declares its properties with the `@In`, `@Out` and `@InOut`
decorators on accessors. When a property is set to a different value, the
model notifies its listeners, then **propagates the change** through each
dataflow it takes part in: no `propagate()` call is needed.

```ts
class SearchModel extends Model {
  @In accessor query = '';
  @Out accessor count = 0;

  override propertiesDidChange(): boolean {
    this.count = this.query.length;
    return false;
  }
}

const search = new SearchModel();
connect(input.$.text).to(search.$.query);
connect(search.$.count).map(count => `${count} characters`).to(label.$.text);

input.text = 'hello';   // input is a Model: search.query === 'hello',
                        // search.count === 5, label.text === '5 characters'
```

- A change of `@Out` properties only propagates with `outputPropagation`
  (the model's `propertiesDidChange()` is not called); any other change
  propagates as an in change.
- `batch()` and `assign()` group several changes: they are propagated once.
- A model reached by a propagation gets its properties set one by one: it
  notifies its listeners for each of them.

See the `Model` class documentation for the change notifications
(`on('change', …)`) and the serialization.

## Limitations

- Only the properties of a `Model` propagate by themselves; for the other
  components, call `propagate()` after changing their properties.
- A node takes part in a dataflow from its first connection; disconnecting
  all its connections keeps it in the dataflow (with no connection).

## Internals

Useful when working on the dataflow itself, in `src/core/dataflow/`.

| File | Content |
|---|---|
| `Dataflow.ts` | `DataFlow`: connections, sort, compilation, propagation |
| `DataflowNode.ts` | the `DataflowNode` interface and `DataflowNodeMixin`, mixed in `Component` |
| `DataflowState.ts` | per node: its dataflows, and its "in properties changed" flag |
| `IDataFlow.ts` | `IDataFlow`, `DEFAULT_DATAFLOW` |
| `Connect.ts` | `PropertyRef`, `Pipe`, `connect()`, the `$` proxy |
| `../Connector.ts` | `Connector` (deprecated) |

- **References.** `Component.$` is a proxy creating a `PropertyRef` (node,
  name) per property read. A `Pipe` holds its sources and its map functions
  (composed into one function returning the values); `.to()` calls
  `DataFlow.connect()` and returns a pipe from the targets. The pipes of a
  chain share the list of their connections, for `disconnect()`.
- **Nodes.** `DataflowNodeMixin` is applied to `Component` (like
  `EventSource`): its methods are copied on the prototype. The dataflow finds
  a node by id in `Component.instances`.
- **Connections.** `connect()` stores edges by source node: target id and
  edges (out properties, in properties, function). `build()` sorts the nodes
  and compiles each edge into getters (of the source) and setters (of the
  target).
- **Propagation.** It walks the sorted nodes from the source. Copying values
  to a target sets its `inputPropertyDidChange` flag (`DataflowState`); the
  walk then calls `propertiesDidChange()` and propagates from each flagged
  node. The propagation state is reset in a `finally`.
- **Models.** `Model` propagates from `DataflowState.get(id).dataflows`, after
  its listeners.

The tests are in `tests/unit/core/dataflow/connect.spec.ts` (references and
chains), `tests/unit/core/dataflow/dataflow.spec.ts` (including the scenarios
of the former jsUnit tests) and `tests/unit/core/model.spec.ts`.
