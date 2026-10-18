# Tasks

The task module provides a small, uniform model for anything that runs over
time and can be started, paused, resumed and stopped: a timer, an animation,
a transition… and for composing them, in sequence (`SEQ`) or in parallel
(`PAR`).

```ts
import { task } from 'vs_toolkit/vs_core';
const { seq, par, Wait } = task;

const intro = seq([
  fadeIn,
  new Wait(500),
  par([slideTitle, [zoomLogo, { scale: 2 }]]),
]);

const result = await intro.start(view);   // 'ended' | 'stopped'
```

| Export | Kind | Purpose |
|---|---|---|
| `Task` | abstract class | Base class of every task |
| `Wait` | class | Waits for a given time |
| `SEQ`, `seq()` | class, factory | Runs tasks one after the other |
| `PAR`, `par()` | class, factory | Runs tasks at the same time |
| `TaskState` | enum | `STOPPED`, `STARTED`, `PAUSED` |
| `TaskDelegate` | interface | Callbacks on state changes |
| `TaskEvent`, `TaskListener` | types | Event names and listeners of `on()` / `once()` / `off()` |
| `TaskOptions` | type | Constructor options: `delegate`, `signal` |
| `TaskResult` | type | `'ended' \| 'stopped'`, the result of `start()` |
| `TaskParam`, `TaskAndParams` | types | Start parameter, group entries |

## The task life cycle

```
            start()                     end of the task
 STOPPED ───────────▶ STARTED ─────────────────────────▶ STOPPED   → 'ended'
    ▲                  │   ▲
    │       pause()    │   │ resume()
    │                  ▼   │
    │                 PAUSED
    │                  │
    └──────────────────┘
          stop()  (from STARTED or PAUSED)                         → 'stopped'
```

| Method | From | Effect | Returns |
|---|---|---|---|
| `start(param?)` | `STOPPED` | starts a new run, from the beginning | `Promise<TaskResult>` |
| | `STARTED`, `PAUSED` | **throws** an `Error` | |
| `pause()` | `STARTED` | pauses the run | `true`, `false` in any other state |
| `resume()` | `PAUSED` | resumes the run where it was paused | `true`, `false` in any other state |
| `stop()` | `STARTED`, `PAUSED` | stops, the run is over | `true`, `false` when already stopped |

`STOPPED` is both the initial state and the state after an end or a stop: a
task can always be started again once it is stopped, and it then starts
over from its beginning. A paused task is resumed with `resume()`, not
`start()`.

`task.state` is read-only from the outside.

### The `start()` promise

`start()` returns a promise settled once per **run** (from a start in the
`STOPPED` state, to the end or the stop of the task):

- resolved with `'ended'` when the task reaches its end,
- resolved with `'stopped'` when the task is stopped before (by `stop()`,
  its abort signal, its group or its destructor),
- pending while the task is paused.

The promise never rejects, so calling `start()` without awaiting it is safe.
To stop an `await` chain on a stop, check the result:

```ts
async function playIntro(view) {
  if (await fadeIn.start(view) === 'stopped') return;
  await new Wait(500).start();
  await slideTitle.start(view);
}
```

A new run gives a new promise. A delegate restarting a task from
`taskDidEnd` gets the promise of the new run.

## Options: delegate and abort signal

Every task constructor takes an optional `TaskOptions` as its last
parameter, and so do the `seq()` and `par()` factories:

```ts
new Wait(500, { delegate, signal });
new SEQ([a, b], { delegate });
par([a, b], { signal });
```

### Delegate

The delegate is notified of the task state changes. All the callbacks are
optional and receive the task:

```ts
interface TaskDelegate {
  taskDidStart?:  (task: Task) => void;  // started (a new run)
  taskDidResume?: (task: Task) => void;  // resumed after a pause
  taskDidPause?:  (task: Task) => void;
  taskDidStop?:   (task: Task) => void;  // stopped before its end
  taskDidEnd?:    (task: Task) => void;  // reached its end
}
```

`options.delegate` and the `task.delegate` property are the same thing, and
the delegate can be changed at any time. An exception thrown by a callback is
logged to the console and does not break the task.

The delegate, the events and the `start()` promise are three views of the
same state changes: use the one that fits the calling code.

### Abort signal

`options.signal` is an
[`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal)
bound to the task **for its whole life**, not to one run:

- aborting it has the same effect as calling `stop()`, whether the task is
  started or paused (nothing happens if it is already stopped);
- once the signal is aborted, the task cannot be started anymore: `start()`
  resolves with `'stopped'` straight away.

```ts
const controller = new AbortController();
const slideshow = seq(slides, { signal: controller.signal });

slideshow.start();
// later, e.g. when the view is removed
controller.abort();
```

One controller can stop several independent tasks at once.

## Events

In addition to its delegate, a task emits events, with an API similar to
Node's `EventEmitter`:

```ts
const unsubscribe = task.on('end', (task) => console.log('done', task.id));
task.once('start', () => console.log('first start only'));
task.off('pause', onPause);   // remove a listener
task.off('pause');            // remove every 'pause' listener
unsubscribe();                // same as task.off('end', listener)
```

| Event | Emitted when | Delegate callback |
|---|---|---|
| `'start'` | the task is started (a new run) | `taskDidStart` |
| `'pause'` | the task is paused | `taskDidPause` |
| `'resume'` | the task is resumed after a pause | `taskDidResume` |
| `'stop'` | the task is stopped before its end | `taskDidStop` |
| `'end'` | the task reaches its end | `taskDidEnd` |

- `on()` and `once()` return a function removing the listener.
- A listener receives the task, and is called **synchronously**, right after
  the delegate and after the state change (`task.state` is already
  updated).
- Listeners are called in the order they were added; a listener is added
  only once per event (adding it again does nothing).
- An exception thrown by a listener is logged to the console, and does not
  prevent the other listeners from being called.
- The listeners are removed by the task destructor.

These events are independent from the `bind()` / `addEventListener()` API
inherited from `Component`, which dispatches `Event` objects asynchronously.

## Wait

`Wait` ends after a given time, in milliseconds.

```ts
const wait = new Wait(1000);
await wait.start();
```

- Pausing keeps the elapsed time: `resume()` waits only for the remaining
  time.
- `start()` always waits for the full time, after an end or a stop.
- `wait.time` can only be changed while the task is stopped (it throws
  otherwise).
- The time must be a finite number ≥ 0, otherwise a `RangeError` is thrown.
- `start()` ignores its parameter.

## Groups: SEQ and PAR

A group is a task made of tasks, so groups nest freely
(`seq([a, par([b, seq([c, d])])])`).

### Declaring the tasks

A group takes a list of entries, either a task, or a task with its own start
parameter:

```ts
seq([
  fadeIn,                   // started with the group parameter
  [moveTo, { x: 0, y: 0 }], // started with its own parameter
]);
```

When the group is started with `start(param)`, each task is started with its
own parameter if it has one (even a falsy one, like `0` or `false`), with the
group `param` otherwise.

The tasks can be given to the constructor, to the factory, or later with
`setTasks()`, which only works while the group is stopped (it returns
`false` otherwise) and replaces the previous tasks. Empty entries are
skipped, invalid ones are skipped with a console warning.

`seq([])` and `par([])` are valid: starting an empty group resolves with
`'ended'` at once.

### SEQ

`SEQ` runs its tasks one after the other, each one being started when the
previous one has ended. The group ends when its last task ends.

- `pause()` pauses the running task; `resume()` resumes **that** task.
- `stop()` stops the running task; the next start begins again with the
  first task.
- `taskDidStart` and `taskDidResume` are notified once for the sequence,
  not for every task of the sequence.
- When its running task is paused or resumed by someone else than the
  sequence, the sequence follows: it pauses or resumes too.

### PAR

`PAR` starts all its tasks at the same time and ends when the longest one
has ended.

- `pause()` pauses the tasks still running; `resume()` resumes only those:
  tasks which already ended are not restarted.
- `stop()` stops every task still running.
- A task paused by someone else than the group keeps the group running: it
  waits for that task to be resumed.
- If its tasks end while the group is paused (resumed by someone else),
  the group ends on `resume()`.

### Tasks and groups

A group does **not** take the delegate of its tasks: a task keeps its own
delegate, which is notified together with the groups.

A task can belong to several groups; a group only reacts to the tasks it is
currently running and ignores the others. A task can only run once at a
time, so starting a group throws if one of its tasks is already running
(started or paused), and none of its tasks is started.

If a task of a group is stopped from the outside (with `stop()` or its abort
signal), it will not end, so the group stops:

- a `SEQ` stops at once;
- a `PAR` stops once none of its tasks is running anymore.

## Writing a task

Extend `Task` and implement four methods. `start()` itself is implemented
by `Task`: it checks the state (throwing when started or paused), manages
the run promise and the abort signal, and calls your `doStart()`.

| Method | Called | Must |
|---|---|---|
| `protected doStart(param?)` | by `start()`, only when the task is `STOPPED` | start the work **from its beginning**, set `this.state = STARTED`, notify `taskDidStart`, return `true`; return `false` if there is nothing to run |
| `pause()` | by users and groups | return `false` unless `STARTED`; otherwise suspend the work, set `PAUSED`, notify `taskDidPause`, return `true` |
| `resume()` | by users and groups | return `false` unless `PAUSED`; otherwise continue the work where it was paused, set `STARTED`, notify `taskDidResume`, return `true` |
| `stop()` | by users, groups, the abort signal, the destructor | return `false` if already `STOPPED`; otherwise cancel the work, set `STOPPED`, notify `taskDidStop`, return `true` |

When the work reaches its natural end, set `this.state = STOPPED` and
notify `taskDidEnd`.

Notifications go through `this.notify(callbackName)`, never directly to
`this.delegate`: `notify()` also settles the `start()` promise, emits the
matching event and informs the groups. **Always update `this.state` before calling `notify()`**, since
the callbacks (and the groups) read it.

Accept and forward `TaskOptions` in the constructor, so the task supports
the delegate and the abort signal like the others.

### Example: a frame based progress task

```ts
import { task } from 'vs_toolkit/vs_core';
const { Task, TaskState } = task;

/**
 * Calls `onProgress` with a value going from 0 to 1 over `duration` ms,
 * once per animation frame.
 */
export class Progress extends Task {
  #elapsed = 0;
  #lastFrame = 0;
  #frame = 0;

  constructor(
    private readonly duration: number,
    private readonly onProgress: (value: number) => void,
    options?: task.TaskOptions,
  ) {
    super(options);
  }

  protected override doStart(): boolean {
    this.#elapsed = 0;            // a start is always from the beginning
    this.#run();
    this.notify('taskDidStart');
    return true;
  }

  resume(): boolean {
    if (this.state !== TaskState.PAUSED) return false;

    this.#run();                  // keeps the elapsed time
    this.notify('taskDidResume');
    return true;
  }

  stop(): boolean {
    if (this.state === TaskState.STOPPED) return false;

    cancelAnimationFrame(this.#frame);
    this.state = TaskState.STOPPED;
    this.notify('taskDidStop');
    return true;
  }

  pause(): boolean {
    if (this.state !== TaskState.STARTED) return false;

    cancelAnimationFrame(this.#frame);
    this.state = TaskState.PAUSED;
    this.notify('taskDidPause');
    return true;
  }

  #run(): void {
    this.state = TaskState.STARTED;
    this.#lastFrame = performance.now();
    this.#frame = requestAnimationFrame(this.#tick);
  }

  #tick = (now: number): void => {
    this.#elapsed += now - this.#lastFrame;
    this.#lastFrame = now;

    const value = Math.min(this.#elapsed / this.duration, 1);
    this.onProgress(value);

    if (value < 1) {
      this.#frame = requestAnimationFrame(this.#tick);
    } else {
      this.state = TaskState.STOPPED;   // state first…
      this.notify('taskDidEnd');        // …then notify
    }
  };
}
```

It composes with the other tasks like any of them:

```ts
await seq([
  new Progress(300, v => view.opacity = v),
  new Wait(1000),
  new Progress(300, v => view.opacity = 1 - v),
]).start();
```

### Checklist

- `doStart()` always starts from the beginning; `resume()` continues from
  where `pause()` left off.
- `pause()` only acts from `STARTED`, `resume()` only from `PAUSED`, `stop()`
  from `STARTED` and `PAUSED`.
- The natural end sets `STOPPED`, then notifies `taskDidEnd`.
- Each notification is sent once per state change.
- Pending work (timers, frames, listeners) is cancelled by `stop()` and
  `pause()`.
- `TaskOptions` are forwarded to `super()`.

## Internals

Useful when working on the module itself, whose sources are in
`src/core/task/`.

| File | Content |
|---|---|
| `task.ts` | `Task`, the run promise, `notify()`, the abort signal, the group registry |
| `helper.ts` | `BaseTask`, the base class of the groups: `setTasks()`, parameter resolution |
| `seq.ts`, `par.ts` | the groups and their factories |
| `wait.ts` | `Wait` |
| `taskDelegate.ts`, `taskState.ts` | `TaskDelegate`, `TaskState` |

- **Group registry.** Groups are not delegates of their tasks. `task.ts`
  keeps a `WeakMap<Task, Set<group>>` filled by `setTasks()`
  (`attachToGroup` / `detachFromGroup`, not exported from the module index).
  `notify()` calls the task delegate, then the event listeners, then every
  group of the task: the listeners of a task run before its groups react
  (e.g. before a `SEQ` starts its next task).
- **Run promise.** `start()` creates the run, and
  `notify()` settles it on `taskDidEnd` / `taskDidStop`, before calling the
  callbacks.
- **Group notifications.** When a group pauses or stops itself, it sets its
  own state first, then pauses/stops its tasks: the callbacks of its tasks
  are ignored (the group is no longer `STARTED`), and the group notifies its
  own delegate once.
- **SEQ** tracks the index of the running task (`#currentTask`); **PAR**
  tracks the set of tasks which have not ended yet (`#runningTasks`).

## Tests

The unit tests live in `tests/unit/core/task/` (mocha + tsx):

```sh
npm test                  # run the tests
npm run typecheck:test    # type check the tests
```

`helpers.ts` provides a `FakeTask`, driven by the test (`end()` simulates
its natural end), and a `recordingDelegate()` recording the callbacks it
receives.

Time based tests use Node's `mock.timers`. Note that `mock.timers.tick(n)`
moves the clock to its target before running the due callbacks: a task
started from a callback (e.g. the second `Wait` of a `SEQ`) must be reached
by ticking up to each task boundary separately:

```ts
seq([new Wait(50), new Wait(100)]).start();
mock.timers.tick(50);    // first Wait ends, the second one starts
mock.timers.tick(100);   // second Wait ends
```
