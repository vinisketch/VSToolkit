import assert from 'assert';
import { mock } from 'node:test';

import '../../../di_config';

import Wait from '../../../../src/core/task/wait';
import SEQ, { seq } from '../../../../src/core/task/seq';
import PAR, { par } from '../../../../src/core/task/par';
import { TaskState } from '../../../../src/core/task/taskState';
import { FakeTask, captureConsole, recordingDelegate } from './helpers';

type PromiseState = 'pending' | 'ended' | 'stopped';

/**
 * Returns 'pending', or the TaskResult a start() promise resolved with,
 * once pending microtasks have run. (setImmediate is not mocked here)
 */
async function stateOf(promise: Promise<'ended' | 'stopped'>): Promise<PromiseState> {
  let state: PromiseState = 'pending';
  promise.then((result) => { state = result; });
  await new Promise(resolve => setImmediate(resolve));
  return state;
}

describe('Task.start promise', function () {
  let console_: ReturnType<typeof captureConsole>;

  beforeEach(function () {
    mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    console_ = captureConsole();
  });

  afterEach(function () {
    console_.restore();
    mock.timers.reset();
  });

  describe('result', function () {
    it('should resolve with "ended" when the task ends', async function () {
      const wait = new Wait(100);
      const run = wait.start();

      mock.timers.tick(99);
      assert.strictEqual(await stateOf(run), 'pending');
      mock.timers.tick(1);
      assert.strictEqual(await stateOf(run), 'ended');
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should resolve with "stopped" when the task is destroyed', async function () {
      const wait = new Wait(100);
      const run = wait.start();

      wait.destroy();
      assert.strictEqual(await run, 'stopped');
      assert.strictEqual(wait.isDeleted(), true);
    });

    it('should resolve with "stopped" when the task is stopped', async function () {
      const wait = new Wait(100);
      const run = wait.start();

      wait.stop();
      assert.strictEqual(await run, 'stopped');
    });

    it('should stay pending while paused, and settle after the resume', async function () {
      const wait = new Wait(100);
      const run = wait.start();

      mock.timers.tick(40);
      wait.pause();
      mock.timers.tick(1000);
      assert.strictEqual(await stateOf(run), 'pending');

      assert.strictEqual(wait.resume(), true);
      mock.timers.tick(60);
      assert.strictEqual(await stateOf(run), 'ended');
    });

    it('should return a new promise for each run', async function () {
      const wait = new Wait(100);

      const first = wait.start();
      mock.timers.tick(100);
      await first;

      const second = wait.start();
      assert.notStrictEqual(second, first);
      assert.strictEqual(await stateOf(second), 'pending');
    });

    it('should also notify the delegate', async function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      const run = wait.start();
      mock.timers.tick(100);
      await run;
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', wait]]);
    });

    it('should give a new promise to a delegate restarting the task when it ends', async function () {
      const task = new FakeTask();
      let restarted: Promise<'ended' | 'stopped'> | undefined;
      task.delegate = {
        taskDidEnd: () => { restarted = task.start(); },
      };

      const run = task.start();
      task.end();
      assert.strictEqual(await stateOf(run), 'ended');
      assert.ok(restarted);
      assert.notStrictEqual(restarted, run);
      assert.strictEqual(await stateOf(restarted), 'pending');
    });

    it('should chain with await', async function () {
      const order: string[] = [];
      const flow = (async () => {
        await new Wait(50).start();
        order.push('first');
        await new Wait(50).start();
        order.push('second');
      })();

      mock.timers.tick(50);
      await new Promise(resolve => setImmediate(resolve));
      assert.deepStrictEqual(order, ['first']);
      mock.timers.tick(50);
      await flow;
      assert.deepStrictEqual(order, ['first', 'second']);
    });
  });

  describe('with groups', function () {
    it('should resolve a SEQ with "ended" after its last task ended', async function () {
      const group = new SEQ([new Wait(50), new Wait(100)]);
      const run = group.start();

      mock.timers.tick(50);
      mock.timers.tick(99);
      assert.strictEqual(await stateOf(run), 'pending');
      mock.timers.tick(1);
      assert.strictEqual(await stateOf(run), 'ended');
    });

    it('should resolve a PAR with "ended" after its longest task ended', async function () {
      const group = new PAR([new Wait(50), new Wait(100)]);
      const run = group.start();

      mock.timers.tick(99);
      assert.strictEqual(await stateOf(run), 'pending');
      mock.timers.tick(1);
      assert.strictEqual(await stateOf(run), 'ended');
    });

    it('should resolve with "stopped" when the group is stopped', async function () {
      const group = new SEQ([new Wait(50), new Wait(100)]);
      const run = group.start();

      mock.timers.tick(60);
      group.stop();
      assert.strictEqual(await run, 'stopped');
    });

    it('should start again from the beginning after a stop, with a new promise', async function () {
      const group = new SEQ([new Wait(50), new Wait(100)]);
      const first = group.start();
      mock.timers.tick(50);
      group.stop();
      assert.strictEqual(await first, 'stopped');

      const second = group.start();
      assert.notStrictEqual(second, first);
      mock.timers.tick(50);
      mock.timers.tick(99);
      assert.strictEqual(await stateOf(second), 'pending');
      mock.timers.tick(1);
      assert.strictEqual(await stateOf(second), 'ended');
    });
  });

  describe('with an AbortSignal option', function () {
    it('should stop the task when aborted, like stop()', async function () {
      const controller = new AbortController();
      const delegate = recordingDelegate();
      const wait = new Wait(100, { signal: controller.signal, delegate });

      const run = wait.start();
      mock.timers.tick(40);
      controller.abort();

      assert.strictEqual(await run, 'stopped');
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events, [['taskDidStop', wait]]);
    });

    it('should stop a paused task when aborted', async function () {
      const controller = new AbortController();
      const wait = new Wait(100, { signal: controller.signal });

      const run = wait.start();
      wait.pause();
      controller.abort();

      assert.strictEqual(await run, 'stopped');
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should do nothing when aborted while the task is stopped', function () {
      const controller = new AbortController();
      const delegate = recordingDelegate();
      const wait = new Wait(100, { signal: controller.signal, delegate });

      controller.abort();
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events, []);
    });

    it('should not start once the signal is aborted', async function () {
      const controller = new AbortController();
      const wait = new Wait(100, { signal: controller.signal });

      const first = wait.start();
      controller.abort();
      assert.strictEqual(await first, 'stopped');

      assert.strictEqual(await wait.start(), 'stopped');
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should not start with an already aborted signal', async function () {
      const controller = new AbortController();
      controller.abort();
      const a = new FakeTask('a', { signal: controller.signal });

      assert.strictEqual(await a.start(), 'stopped');
      assert.deepStrictEqual(a.calls, []);
    });

    it('should stop every task of an aborted group', async function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const controller = new AbortController();
      const group = new PAR([a, b], { signal: controller.signal });

      const run = group.start();
      controller.abort();

      assert.strictEqual(await run, 'stopped');
      assert.deepStrictEqual(a.calls, ['start', 'stop']);
      assert.deepStrictEqual(b.calls, ['start', 'stop']);
    });

    it('should stop only the aborted task of a group, which then stops', async function () {
      const controller = new AbortController();
      const a = new FakeTask('a', { signal: controller.signal });
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);

      const run = group.start();
      controller.abort();

      assert.strictEqual(await run, 'stopped');
      assert.deepStrictEqual(a.calls, ['start', 'stop']);
      assert.deepStrictEqual(b.calls, []);
    });

    it('should be accepted by the seq() and par() factories', async function () {
      const controller = new AbortController();
      const sequence = seq([new FakeTask()], { signal: controller.signal });
      const parallel = par([new FakeTask()], { signal: controller.signal });

      const runs = [sequence.start(), parallel.start()];
      controller.abort();
      assert.deepStrictEqual(await Promise.all(runs), ['stopped', 'stopped']);
    });
  });

  describe('with a delegate option', function () {
    it('should set the task delegate', function () {
      const delegate = recordingDelegate();
      assert.strictEqual(new Wait(100, { delegate }).delegate, delegate);
      assert.strictEqual(new SEQ([], { delegate }).delegate, delegate);
      assert.strictEqual(seq([], { delegate }).delegate, delegate);
      assert.strictEqual(par([], { delegate }).delegate, delegate);
    });

    it('should be notified', async function () {
      const delegate = recordingDelegate();
      const wait = new Wait(100, { delegate });

      const run = wait.start();
      mock.timers.tick(100);
      await run;
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', wait]]);
    });

    it('should leave the delegate undefined by default', function () {
      assert.strictEqual(new Wait(100).delegate, undefined);
    });
  });
});
