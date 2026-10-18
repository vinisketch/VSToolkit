import assert from 'assert';
import { mock } from 'node:test';

import PAR, { par } from '../../../../src/core/task/par';
import Wait from '../../../../src/core/task/wait';
import { TaskState } from '../../../../src/core/task/taskState';
import { FakeTask, captureConsole, recordingDelegate, throwingDelegate } from './helpers';

describe('PAR', function () {
  let console_: ReturnType<typeof captureConsole>;

  beforeEach(function () {
    console_ = captureConsole();
  });

  afterEach(function () {
    console_.restore();
  });

  describe('construction', function () {
    it('should be stopped', function () {
      assert.strictEqual(new PAR().state, TaskState.STOPPED);
    });

    it('should accept the tasks in the constructor', function () {
      const a = new FakeTask('a');
      const group = new PAR([a]);
      group.start([]);
      assert.deepStrictEqual(a.calls, ['start']);
    });
  });

  describe('par()', function () {
    it('should return undefined for an empty list', function () {
      assert.strictEqual(par([]), undefined);
    });

    it('should return a stopped PAR running the given tasks', function () {
      const a = new FakeTask('a');
      const group = par([a]);
      assert.ok(group instanceof PAR);
      assert.strictEqual(group.state, TaskState.STOPPED);
      group.start([]);
      assert.deepStrictEqual(a.calls, ['start']);
    });
  });

  describe('start', function () {
    it('should start every task and become their delegate', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, b]);

      assert.strictEqual(group.start([]), true);
      assert.strictEqual(group.state, TaskState.STARTED);
      assert.deepStrictEqual(a.calls, ['start']);
      assert.deepStrictEqual(b.calls, ['start']);
      assert.strictEqual(a.delegate, group);
      assert.strictEqual(b.delegate, group);
    });

    it('should pass its param, unless a task has its own', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, [b, ['own']]]);

      group.start(['shared']);
      assert.deepStrictEqual(a.startParams, [['shared']]);
      assert.deepStrictEqual(b.startParams, [['own']]);
    });

    it('should return false when already started', function () {
      const group = new PAR([new FakeTask()]);
      group.start([]);
      assert.strictEqual(group.start([]), false);
    });

    it('should call taskDidEnd once, after every task ended', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      b.end();
      assert.deepStrictEqual(delegate.events, []);
      assert.strictEqual(group.state, TaskState.STARTED);
      a.end();
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', group]]);
      assert.strictEqual(group.state, TaskState.STOPPED);
    });

    it('should be restartable after it ended', function () {
      const a = new FakeTask('a');
      const group = new PAR([a]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      a.end();
      assert.strictEqual(group.start([]), true);
      a.end();
      assert.strictEqual(delegate.events.length, 2);
    });

    it('should contain and log an exception thrown by taskDidEnd', function () {
      const a = new FakeTask('a');
      const group = new PAR([a]);
      group.delegate = throwingDelegate();

      group.start([]);
      assert.doesNotThrow(() => a.end());
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('stop', function () {
    it('should return false when already stopped', function () {
      const group = new PAR([new FakeTask()]);
      assert.strictEqual(group.stop(), false);
    });

    it('should stop every task and call taskDidStop once', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      assert.strictEqual(group.stop(), true);
      assert.deepStrictEqual(a.calls, ['start', 'stop']);
      assert.deepStrictEqual(b.calls, ['start', 'stop']);
      assert.strictEqual(group.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events, [['taskDidStop', group]]);
    });

    it('should call taskDidStop when stopped while paused', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      group.pause();
      group.stop();
      assert.strictEqual(group.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events.at(-1), ['taskDidStop', group]);
    });

    it('should contain and log an exception thrown by taskDidStop', function () {
      const group = new PAR([new FakeTask()]);
      group.delegate = throwingDelegate();

      group.start([]);
      assert.doesNotThrow(() => group.stop());
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('pause', function () {
    it('should pause every task and call taskDidPause once', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      assert.strictEqual(group.pause(), true);
      assert.deepStrictEqual(a.calls, ['start', 'pause']);
      assert.deepStrictEqual(b.calls, ['start', 'pause']);
      assert.strictEqual(group.state, TaskState.PAUSED);
      assert.deepStrictEqual(delegate.events, [['taskDidPause', group]]);
    });

    it('should do nothing when stopped', function () {
      const a = new FakeTask('a');
      const group = new PAR([a]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      assert.strictEqual(group.pause(), false);
      assert.strictEqual(group.state, TaskState.STOPPED);
      assert.deepStrictEqual(a.calls, []);
      assert.deepStrictEqual(delegate.events, []);
    });

    it('should return false when already paused', function () {
      const group = new PAR([new FakeTask()]);
      group.start([]);
      group.pause();
      assert.strictEqual(group.pause(), false);
    });

    it('should resume every task on start', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new PAR([a, b]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      group.pause();
      assert.strictEqual(group.start([]), true);
      assert.deepStrictEqual(a.calls, ['start', 'pause', 'start']);

      a.end();
      b.end();
      assert.deepStrictEqual(delegate.events.at(-1), ['taskDidEnd', group]);
    });

    it('should contain and log an exception thrown by taskDidPause', function () {
      const group = new PAR([new FakeTask()]);
      group.delegate = throwingDelegate();

      group.start([]);
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

    it('should end when the longest wait ends', function () {
      const group = new PAR([new Wait(50), new Wait(100)]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      mock.timers.tick(99);
      assert.deepStrictEqual(delegate.events, []);
      mock.timers.tick(1);
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', group]]);
    });

    it('should pause only once when some waits already ended', function () {
      const group = new PAR([new Wait(50), new Wait(100)]);
      const delegate = recordingDelegate();
      group.delegate = delegate;

      group.start([]);
      mock.timers.tick(60);
      group.pause();
      assert.deepStrictEqual(delegate.events, [['taskDidPause', group]]);

      group.start([]);
      mock.timers.tick(39);
      assert.strictEqual(group.state, TaskState.STARTED);
      mock.timers.tick(1);
      assert.deepStrictEqual(delegate.events.at(-1), ['taskDidEnd', group]);
    });
  });
});
