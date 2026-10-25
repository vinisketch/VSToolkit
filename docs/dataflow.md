# Dataflow

The dataflow connects properties of components, and propagates their values
along the connections: when a property changes, the properties connected to
it are updated, then the ones connected to those, and so on.

```ts
import { container } from 'vs_utils';
import { Component, DataFlow, DEFAULT_DATAFLOW } from 'vs_toolkit/vs_core';

const df = new DataFlow();
df.connect(slider, 'value', view, 'rotation');
df.connect(slider, 'value', label, 'text', (value) => `${value}°`);
df.build();

slider.value = 45;
df.propagate(slider);   // view.rotation === 45, label.text === '45°'
```

| Export | Kind | Purpose |
|---|---|---|
| `DataFlow` | class | A dataflow: connections, build, propagation |
| `DEFAULT_DATAFLOW` | token | `container.get(DEFAULT_DATAFLOW)` gives the default dataflow |
| `IDataFlow` | interface | The API of a dataflow |
| `DataflowNode` | interface | The node API, implemented by every `Component` |
| `PropertyDirection` | type | `'in' \| 'out' \| 'inout'` |
| `Connector` | class | Connects a property on the default dataflow (`node.connect(…).to(…)`) |
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
- `connect()` returns the id of the connection, for `disconnect()`.

```ts
df.connect(a, 'value', b, 'value');                           // copy
df.connect(a, ['x', 'y'], b, ['x', 'y']);                     // 2 -> 2
df.connect(a, 'celsius', b, 'fahrenheit', (c) => c * 9 / 5 + 32);
df.connect(a, ['x', 'y'], b, 'distance', (x, y) => Math.hypot(x, y)); // 2 -> 1
df.connect(a, 'point', b, ['x', 'y'], (p) => [p.x, p.y]);             // 1 -> 2
```

`connect()` throws for:

- an unknown node (id);
- an unknown property: a missing getter (out) or setter (in);
- an `@In` property of the source, or an `@Out` property of the target;
- different numbers of out and in properties without function.

A function returning the wrong number of values is detected during the
propagation: the error is logged and this connection is skipped, the others
still propagate.

### build()

**Call `build()` after connecting or disconnecting, before propagating.**
It sorts the nodes (topologically: each node after the nodes it depends on)
and compiles the connections. Calling it once after a series of changes is
enough.

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
const id = df.connect(a, 'value', b, 'value');
df.disconnect(id);
// or, by nodes and properties
df.disconnect(a, 'value', b, 'value');
df.build();
```

By nodes and properties, the given properties are removed from the
connections between the two nodes, and a connection left without out or in
property is removed: `df.disconnect(a, 'y', b, 'y')` keeps the `x` part of a
`['x', 'y'] -> ['x', 'y']` connection.

Disconnecting a connection which does not exist does nothing; an unknown node
throws. As for `connect()`, call `build()` afterwards.

## The default dataflow and Connector

`container.get(DEFAULT_DATAFLOW)` gives the default dataflow (always the same
instance). The `connect()` method of the components connects on it:

```ts
slider.connect('value').to(view, 'rotation');
slider.connect('value').to(label, 'text', (value) => `${value}°`);

container.get(DEFAULT_DATAFLOW).build();
```

- `node.connect(out)` returns a `Connector` for an out property of `node`.
- `.to(target, in, func?)` connects it to an in property of `target`, like
  `connect(node, out, target, in, func?)` on the default dataflow.

Chaining connections (`.to(…).to(…)`, or `.connect(…)` after `.to(…)`) is not
supported yet: this API will be reworked.

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
df.connect(input, 'text', search, 'query');
df.connect(search, 'count', label, 'text', (count) => `${count} characters`);
df.build();

input.text = 'hello';
df.propagate(input);    // search.query === 'hello', search.count === 5,
                        // label.text === '5 characters'
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
- Disconnect a component before destroying it: `build()` throws for a
  connection to a component which no longer exists.
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
| `../Connector.ts` | `Connector` |

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

The tests are in `tests/unit/core/dataflow/dataflow.spec.ts` (including the
scenarios of the former jsUnit tests) and `tests/unit/core/model.spec.ts`.
