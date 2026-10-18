import assert from 'assert';
import { mock } from 'node:test';

import Wait from '../../../../src/core/task/wait';
import { TaskState } from '../../../../src/core/task/taskState';
import { captureConsole, recordingDelegate, throwingDelegate } from './helpers';

describe('Wait', function () {
  let console_: ReturnType<typeof captureConsole>;

  beforeEach(function () {
    mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    console_ = captureConsole();
  });

  afterEach(function () {
    console_.restore();
    mock.timers.reset();
  });

  describe('construction', function () {
    it('should be stopped with the given time', function () {
      const wait = new Wait(100);
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.strictEqual(wait.time, 100);
    });

    it('should accept 0', function () {
      assert.strictEqual(new Wait(0).time, 0);
    });

    for (const time of [-1, NaN, Infinity]) {
      it(`should throw a RangeError for ${time}`, function () {
        assert.throws(() => new Wait(time), RangeError);
      });
    }
  });

  describe('time', function () {
    it('should be settable while stopped', function () {
      const wait = new Wait(100);
      wait.time = 250;
      assert.strictEqual(wait.time, 250);
    });

    it('should throw a RangeError for an invalid time', function () {
      const wait = new Wait(100);
      assert.throws(() => { wait.time = -5; }, RangeError);
      assert.strictEqual(wait.time, 100);
    });

    it('should throw when changed while started', function () {
      const wait = new Wait(100);
      wait.start();
      assert.throws(() => { wait.time = 250; }, /Stop the task/);
      assert.strictEqual(wait.time, 100);
    });

    it('should throw when changed while paused', function () {
      const wait = new Wait(100);
      wait.start();
      wait.pause();
      assert.throws(() => { wait.time = 250; }, /Stop the task/);
    });
  });

  describe('start', function () {
    it('should start the task', function () {
      const wait = new Wait(100);
      wait.start();
      assert.strictEqual(wait.state, TaskState.STARTED);
    });

    it('should not restart when already started, and return the current promise', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate({ withStart: true });
      wait.delegate = delegate;

      const run = wait.start();
      assert.strictEqual(wait.start(), run);
      assert.strictEqual(delegate.events.length, 1);
    });

    it('should call taskDidStart when started and when resumed', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate({ withStart: true });
      wait.delegate = delegate;

      wait.start();
      wait.pause();
      wait.start();
      assert.deepStrictEqual(delegate.events.map(([name]) => name),
        ['taskDidStart', 'taskDidPause', 'taskDidStart']);
    });

    it('should call taskDidEnd once the time has elapsed', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      mock.timers.tick(99);
      assert.deepStrictEqual(delegate.events, []);
      assert.strictEqual(wait.state, TaskState.STARTED);

      mock.timers.tick(1);
      assert.deepStrictEqual(delegate.events, [['taskDidEnd', wait]]);
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should end without error when there is no delegate', function () {
      const wait = new Wait(100);
      wait.start();
      mock.timers.tick(100);
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should be restartable after it ended', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      mock.timers.tick(100);
      wait.start();
      assert.strictEqual(wait.state, TaskState.STARTED);
      mock.timers.tick(100);
      assert.strictEqual(delegate.events.length, 2);
    });

    it('should contain and log an exception thrown by taskDidEnd', function () {
      const wait = new Wait(100);
      wait.delegate = throwingDelegate();

      wait.start();
      assert.doesNotThrow(() => mock.timers.tick(100));
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('stop', function () {
    it('should return false when already stopped', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      assert.strictEqual(wait.stop(), false);
      assert.deepStrictEqual(delegate.events, []);
    });

    it('should stop a started task and call taskDidStop', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      assert.strictEqual(wait.stop(), true);
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events, [['taskDidStop', wait]]);
    });

    it('should cancel the pending end', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      wait.stop();
      mock.timers.tick(1000);
      assert.deepStrictEqual(delegate.events, [['taskDidStop', wait]]);
    });

    it('should stop a paused task', function () {
      const wait = new Wait(100);
      wait.start();
      wait.pause();
      assert.strictEqual(wait.stop(), true);
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should reset the remaining time, so the next start waits the full time', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      mock.timers.tick(60);
      wait.pause();
      wait.stop();

      wait.start();
      mock.timers.tick(99);
      assert.strictEqual(delegate.events.some(([name]) => name === 'taskDidEnd'), false);
      mock.timers.tick(1);
      assert.strictEqual(delegate.events.at(-1)?.[0], 'taskDidEnd');
    });

    it('should contain and log an exception thrown by taskDidStop', function () {
      const wait = new Wait(100);
      wait.delegate = throwingDelegate();

      wait.start();
      assert.doesNotThrow(() => wait.stop());
      assert.strictEqual(console_.output.error.length, 1);
    });
  });

  describe('pause', function () {
    it('should pause a started task and call taskDidPause', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      assert.strictEqual(wait.pause(), true);
      assert.strictEqual(wait.state, TaskState.PAUSED);
      assert.deepStrictEqual(delegate.events, [['taskDidPause', wait]]);
    });

    it('should return false when already paused', function () {
      const wait = new Wait(100);
      wait.start();
      wait.pause();
      assert.strictEqual(wait.pause(), false);
    });

    it('should not end while paused', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      mock.timers.tick(30);
      wait.pause();
      mock.timers.tick(1000);
      assert.deepStrictEqual(delegate.events, [['taskDidPause', wait]]);
    });

    it('should resume for the remaining time only', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      wait.start();
      mock.timers.tick(30);
      wait.pause();
      mock.timers.tick(500);

      wait.start();
      assert.strictEqual(wait.state, TaskState.STARTED);
      mock.timers.tick(69);
      assert.strictEqual(wait.state, TaskState.STARTED);
      mock.timers.tick(1);
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events.at(-1), ['taskDidEnd', wait]);
    });

    it('should accumulate elapsed time across several pauses', function () {
      const wait = new Wait(100);
      wait.start();
      mock.timers.tick(30);
      wait.pause();
      wait.start();
      mock.timers.tick(30);
      wait.pause();
      wait.start();
      mock.timers.tick(39);
      assert.strictEqual(wait.state, TaskState.STARTED);
      mock.timers.tick(1);
      assert.strictEqual(wait.state, TaskState.STOPPED);
    });

    it('should contain and log an exception thrown by taskDidPause', function () {
      const wait = new Wait(100);
      wait.delegate = throwingDelegate();

      wait.start();
      assert.doesNotThrow(() => wait.pause());
      assert.strictEqual(console_.output.error.length, 1);
    });

    it('should do nothing when the task is stopped', function () {
      const wait = new Wait(100);
      const delegate = recordingDelegate();
      wait.delegate = delegate;

      assert.strictEqual(wait.pause(), false);
      assert.strictEqual(wait.state, TaskState.STOPPED);
      assert.deepStrictEqual(delegate.events, []);

      // a later start must still wait the full time
      wait.start();
      mock.timers.tick(99);
      assert.strictEqual(wait.state, TaskState.STARTED);
    });
  });
});
