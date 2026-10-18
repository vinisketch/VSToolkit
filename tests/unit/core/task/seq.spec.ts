import assert from 'assert';
import { mock } from 'node:test';

import SEQ, { seq } from '../../../../src/core/task/seq';
import Wait from '../../../../src/core/task/wait';
import { TaskState } from '../../../../src/core/task/taskState';
import { FakeTask, captureConsole, recordingDelegate, throwingDelegate } from './helpers';

describe('SEQ', function () {
  let console_: ReturnType<typeof captureConsole>;

  beforeEach(function () {
    console_ = captureConsole();
  });

  afterEach(function () {
    console_.restore();
  });

  describe('construction', function () {
    it('should be stopped', function () {
      assert.strictEqual(new SEQ().state, TaskState.STOPPED);
    });

    it('should accept the tasks in the constructor', function () {
      const a = new FakeTask('a');
      const group = new SEQ([a]);
      group.start();
      assert.deepStrictEqual(a.calls, ['start']);
    });
  });

  describe('seq()', function () {
    it('should return undefined for an empty list', function () {
      assert.strictEqual(seq([]), undefined);
    });

    it('should return a stopped SEQ running the given tasks', function () {
      const a = new FakeTask('a');
      const group = seq([a]);
      assert.ok(group instanceof SEQ);
      assert.strictEqual(group.state, TaskState.STOPPED);
      group.start();
      assert.deepStrictEqual(a.calls, ['start']);
    });
  });

  describe('setTasks', function () {
    it('should accept a task, [task] and [task, params]', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const c = new FakeTask('c');
      const group = new SEQ();

      assert.strictEqual(group.setTasks([a, [b], [c, ['own']]]), true);

      group.start(['shared']);
      a.end();
      b.end();
      assert.deepStrictEqual(a.startParams, [['shared']]);
      assert.deepStrictEqual(b.startParams, [['shared']]);
      assert.deepStrictEqual(c.startParams, [['own']]);
    });

    it('should replace the previous tasks', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a]);

      group.setTasks([b]);
      group.start();
      assert.deepStrictEqual(a.calls, []);
      assert.deepStrictEqual(b.calls, ['start']);
    });

    it('should skip empty entries and invalid tasks with a warning', function () {
      const a = new FakeTask('a');
      const group = new SEQ();
      const notATask = { toString: () => 'not a task' } as any;

      group.setTasks([null as any, [] as any, notATask, a]);
      assert.strictEqual(console_.output.warn.length, 2);

      group.start();
      assert.deepStrictEqual(a.calls, ['start']);
    });

    it('should refuse to change tasks while started', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a]);

      group.start();
      assert.strictEqual(group.setTasks([b]), false);
      a.end();
      assert.deepStrictEqual(b.calls, []);
    });
  });

  describe('start', function () {
    it('should start only the first task and become its delegate', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);

      assert.strictEqual(group.start(), true);
      assert.strictEqual(group.state, TaskState.STARTED);
      assert.deepStrictEqual(a.calls, ['start']);
      assert.deepStrictEqual(b.calls, []);
      assert.strictEqual(a.delegate, group);
    });

    it('should return false when already started', function () {
      const group = new SEQ([new FakeTask()]);
      group.start();
      assert.strictEqual(group.start(), false);
    });

    it('should return false and stay stopped when it has no tasks', function () {
      const group = new SEQ();
      assert.strictEqual(group.start(), false);
      assert.strictEqual(group.state, TaskState.STOPPED);
    });

    it('should start the next task when the current one ends, with the same param', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);

      group.start(['p']);
      a.end();
      assert.deepStrictEqual(b.calls, ['start']);
      assert.deepStrictEqual(b.startParams, [['p']]);
      assert.strictEqual(group.state, TaskState.STARTED);
    });

    it('should call taskDidEnd once, after the last task ended', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start();
      a.end();
      assert.deepStrictEqual(delegate.events, []);
      b.end();
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', group]]);
      assert.strictEqual(group.state, TaskState.STOPPED);
    });

    it('should restart from the first task after it ended', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);

      group.start();
      a.end();
      b.end();
      group.start();
      assert.deepStrictEqual(a.calls, ['start', 'start']);
      assert.deepStrictEqual(b.calls, ['start']);
    });

    it('should contain and log an exception thrown by taskDidEnd', function () {
      const a = new FakeTask('a');
      const group = new SEQ([a]);
      group.delegate = throwingDelegate();

      group.start();
      assert.doesNotThrow(() => a.end());
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('stop', function () {
    it('should return false when already stopped', function () {
      const group = new SEQ([new FakeTask()]);
      assert.strictEqual(group.stop(), false);
    });

    it('should stop the running task and call taskDidStop', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start();
      a.end();
      assert.strictEqual(group.stop(), true);
      assert.deepStrictEqual(a.calls, ['start']);
      assert.deepStrictEqual(b.calls, ['start', 'stop']);
      assert.strictEqual(group.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events, [['taskDidStop', group]]);
    });

    it('should restart from the first task after a stop', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);

      group.start();
      a.end();
      group.stop();
      group.start();
      assert.deepStrictEqual(a.calls, ['start', 'start']);
    });

    it('should stop the paused task when stopped while paused', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start();
      a.end();
      group.pause();
      group.stop();

      assert.deepStrictEqual(b.calls, ['start', 'pause', 'stop']);
      assert.strictEqual(group.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events.at(-1), ['taskDidStop', group]);
    });

    it('should contain and log an exception thrown by taskDidStop', function () {
      const group = new SEQ([new FakeTask()]);
      group.delegate = throwingDelegate();

      group.start();
      assert.doesNotThrow(() => group.stop());
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('pause', function () {
    it('should pause the running task and call taskDidPause', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start();
      assert.strictEqual(group.pause(), true);
      assert.deepStrictEqual(a.calls, ['start', 'pause']);
      assert.deepStrictEqual(b.calls, []);
      assert.strictEqual(group.state, TaskState.PAUSED);
      assert.deepStrictEqual(delegate.events, [['taskDidPause', group]]);
    });

    it('should return false when already paused', function () {
      const group = new SEQ([new FakeTask()]);
      group.start();
      group.pause();
      assert.strictEqual(group.pause(), false);
    });

    it('should resume the paused task, not the next one', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);

      group.start(['p']);
      group.pause();
      assert.strictEqual(group.start(), true);
      assert.deepStrictEqual(a.calls, ['start', 'pause', 'start']);
      assert.deepStrictEqual(b.calls, []);

      a.end();
      assert.deepStrictEqual(b.calls, ['start']);
    });

    it('should contain and log an exception thrown by taskDidPause', function () {
      const group = new SEQ([new FakeTask()]);
      group.delegate = throwingDelegate();

      group.start();
      assert.doesNotThrow(() => group.pause());
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('with Wait tasks', function () {
    beforeEach(function () {
      mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    });

    afterEach(function () {
      mock.timers.reset();
    });

    // mock.timers.tick() moves the clock to its target before running due
    // callbacks, so a Wait started from a callback must be reached by
    // ticking up to each task boundary separately.

    it('should end after the sum of the waits', function () {
      const group = new SEQ([new Wait(50), new Wait(100)]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start();
      mock.timers.tick(50);
      mock.timers.tick(99);
      assert.deepStrictEqual(delegate.events, []);
      mock.timers.tick(1);
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', group]]);
    });

    it('should resume where it was paused', function () {
      const group = new SEQ([new Wait(50), new Wait(100)]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start();
      mock.timers.tick(50);
      mock.timers.tick(30);
      group.pause();
      mock.timers.tick(1000);
      group.start();
      mock.timers.tick(69);
      assert.strictEqual(group.state, TaskState.STARTED);
      mock.timers.tick(1);
      assert.deepStrictEqual(delegate.events.at(-1), ['taskDidEnd', group]);
    });
  });
});
