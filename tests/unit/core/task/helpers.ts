import Task, { TaskOptions } from '../../../../src/core/task/task';
import { TaskState } from '../../../../src/core/task/taskState';
import { TaskDelegate } from '../../../../src/core/task/taskDelegate';

/**
 * A task fully driven by the test: start/stop/pause behave like a real task
 * (they notify the delegate and groups synchronously, as Wait does) and
 * `end()` simulates the task reaching its natural end.
 */
export class FakeTask extends Task {
  readonly calls: string[] = [];
  readonly startParams: unknown[] = [];

  constructor(readonly name = 'fake', options?: TaskOptions) {
    super(options);
  }

  protected override doStart(param?: unknown): boolean {
    this.calls.push('start');
    this.startParams.push(param);
    this.state = TaskState.STARTED;
    this.notify('taskDidStart');
    return true;
  }

  override stop(): boolean {
    this.calls.push('stop');
    this.state = TaskState.STOPPED;
    this.notify('taskDidStop');
    return true;
  }

  override pause(): boolean {
    this.calls.push('pause');
    this.state = TaskState.PAUSED;
    this.notify('taskDidPause');
    return true;
  }

  end(): void {
    this.state = TaskState.STOPPED;
    this.notify('taskDidEnd');
  }

  override toString(): string {
    return this.name;
  }
}

export type DelegateEvent = [keyof TaskDelegate, unknown];

/**
 * A delegate that records every callback it receives, in order.
 * taskDidStart is only recorded when `withStart` is set.
 */
export function recordingDelegate({ withStart = false } = {}): TaskDelegate & { events: DelegateEvent[] } {
  const events: DelegateEvent[] = [];
  const delegate: TaskDelegate & { events: DelegateEvent[] } = {
    events,
    taskDidEnd: (task) => { events.push(['taskDidEnd', task]); },
    taskDidStop: (task) => { events.push(['taskDidStop', task]); },
    taskDidPause: (task) => { events.push(['taskDidPause', task]); },
  };
  if (withStart) {
    delegate.taskDidStart = (task) => { events.push(['taskDidStart', task]); };
  }
  return delegate;
}

/**
 * A delegate whose callbacks all throw, to check errors are contained.
 */
export function throwingDelegate(): TaskDelegate {
  const fail = () => { throw new Error('delegate failure'); };
  return { taskDidEnd: fail, taskDidStop: fail, taskDidPause: fail };
}

type ConsoleMethod = 'log' | 'warn' | 'error';

/**
 * Replaces console.log/warn/error with recorders for the duration of a test.
 * Call the returned `restore` in afterEach.
 */
export function captureConsole() {
  const output: Record<ConsoleMethod, unknown[][]> = { log: [], warn: [], error: [] };
  const originals = { log: console.log, warn: console.warn, error: console.error };

  (Object.keys(output) as ConsoleMethod[]).forEach((method) => {
    console[method] = (...args: unknown[]) => { output[method].push(args); };
  });

  return {
    output,
    restore() {
      Object.assign(console, originals);
    },
  };
}
