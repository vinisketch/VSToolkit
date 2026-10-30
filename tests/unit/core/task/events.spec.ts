import assert from 'assert';
import { mock } from 'node:test';

import '../../../di_config';

import { TaskEvent } from '../../../../src/core/task/task';
import Wait from '../../../../src/core/task/wait';
import SEQ from '../../../../src/core/task/seq';
import PAR from '../../../../src/core/task/par';
import { TaskState } from '../../../../src/core/task/taskState';
import { FakeTask, captureConsole } from './helpers';

const ALL_EVENTS: TaskEvent[] = ['start', 'pause', 'resume', 'stop', 'end'];

/**
 * Listens to every event of a task, and records them in order.
 */
function recordEvents(task: FakeTask | Wait | SEQ | PAR, log: string[] = [], prefix = '') {
  ALL_EVENTS.forEach(event => task.on(event, () => log.push(prefix + event)));
  return log;
}

describe('Task events', function () {
  let console_: ReturnType<typeof captureConsole>;

  beforeEach(function () {
    console_ = captureConsole();
  });

  afterEach(function () {
    console_.restore();
  });

  describe('on', function () {
    it('should emit start, pause, resume and stop', function () {
      const task = new FakeTask();
      const log = recordEvents(task);

      task.start();
      task.pause();
      task.resume();
      task.stop();
      assert.deepStrictEqual(log, ['start', 'pause', 'resume', 'stop']);
    });

    it('should emit end', function () {
      const task = new FakeTask();
      const log = recordEvents(task);

      task.start();
      task.end();
      assert.deepStrictEqual(log, ['start', 'end']);
    });

    it('should call the listener with the task', function () {
      const task = new FakeTask();
      let received: unknown;
      task.on('start', (t) => { received = t; });

      task.start();
      assert.strictEqual(received, task);
    });

    it('should call the listener synchronously, after the state change', function () {
      const task = new FakeTask();
      let state: TaskState | undefined;
      task.on('pause', (t) => { state = t.state; });

      task.start();
      task.pause();
      assert.strictEqual(state, TaskState.PAUSED);
    });

    it('should call every listener, in the order they were added', function () {
      const task = new FakeTask();
      const log: string[] = [];
      task.on('start', () => log.push('first'));
      task.on('start', () => log.push('second'));

      task.start();
      assert.deepStrictEqual(log, ['first', 'second']);
    });

    it('should add a listener only once per event', function () {
      const task = new FakeTask();
      let count = 0;
      const listener = () => { count++; };
      task.on('start', listener);
      task.on('start', listener);

      task.start();
      assert.strictEqual(count, 1);
    });

    it('should call the delegate first, then the listeners', function () {
      const log: string[] = [];
      const task = new FakeTask('task', { delegate: { taskDidStart: () => log.push('delegate') } });
      task.on('start', () => log.push('listener'));

      task.start();
      assert.deepStrictEqual(log, ['delegate', 'listener']);
    });

    it('should call the listeners of a task before its group reacts', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);
      const log: string[] = [];
      a.on('end', () => log.push(`a end, b ${b.calls.length ? 'started' : 'not started'}`));

      group.start();
      a.end();
      assert.deepStrictEqual(log, ['a end, b not started']);
      assert.deepStrictEqual(b.calls, ['start']);
    });

    it('should return a function removing the listener', function () {
      const task = new FakeTask();
      let count = 0;
      const unsubscribe = task.on('start', () => { count++; });

      unsubscribe();
      task.start();
      assert.strictEqual(count, 0);
    });

    it('should contain and log an exception thrown by a listener', function () {
      const task = new FakeTask();
      const log: string[] = [];
      task.on('start', () => { throw new Error('listener failure'); });
      task.on('start', () => log.push('second'));

      assert.doesNotThrow(() => task.start());
      assert.deepStrictEqual(log, ['second']);
      assert.strictEqual(console_.output.error.length, 1);
    });

    it('should support a listener removing itself while the event is emitted', function () {
      const task = new FakeTask();
      const log: string[] = [];
      const first = () => { log.push('first'); task.off('start', first); };
      task.on('start', first);
      task.on('start', () => log.push('second'));

      task.start();
      task.stop();
      task.start();
      assert.deepStrictEqual(log, ['first', 'second', 'second']);
    });
  });

  describe('once', function () {
    it('should call the listener only the first time', function () {
      const task = new FakeTask();
      let count = 0;
      task.once('start', () => { count++; });

      task.start();
      task.stop();
      task.start();
      assert.strictEqual(count, 1);
    });

    it('should return a function removing the listener', function () {
      const task = new FakeTask();
      let count = 0;
      const unsubscribe = task.once('start', () => { count++; });

      unsubscribe();
      task.start();
      assert.strictEqual(count, 0);
    });

    it('should be removable with off()', function () {
      const task = new FakeTask();
      let count = 0;
      const listener = () => { count++; };
      task.once('start', listener);

      task.off('start', listener);
      task.start();
      assert.strictEqual(count, 0);
    });
  });

  describe('off', function () {
    it('should remove a listener', function () {
      const task = new FakeTask();
      let count = 0;
      const listener = () => { count++; };
      task.on('start', listener);

      task.off('start', listener);
      task.start();
      assert.strictEqual(count, 0);
    });

    it('should only remove the listener from the given event', function () {
      const task = new FakeTask();
      const log: string[] = [];
      const listener = (t: unknown) => log.push(t === task ? 'called' : 'wrong');
      task.on('start', listener);
      task.on('stop', listener);

      task.off('start', listener);
      task.start();
      task.stop();
      assert.deepStrictEqual(log, ['called']);
    });

    it('should remove every listener of the event when no listener is given', function () {
      const task = new FakeTask();
      const log = recordEvents(task);

      task.off('start');
      task.start();
      task.stop();
      assert.deepStrictEqual(log, ['stop']);
    });

    it('should ignore an unknown listener', function () {
      const task = new FakeTask();
      assert.doesNotThrow(() => task.off('start', () => {}));
    });
  });

  describe('with groups', function () {
    it('should emit the group events once, and the task events for each task', function () {
      const a = new FakeTask('a');
      const b = new FakeTask('b');
      const group = new SEQ([a, b]);
      const log: string[] = [];
      recordEvents(group, log, 'seq:');
      recordEvents(a, log, 'a:');
      recordEvents(b, log, 'b:');

      group.start();
      group.pause();
      group.resume();
      a.end();
      b.end();
      assert.deepStrictEqual(log, [
        'a:start', 'seq:start',
        'a:pause', 'seq:pause',
        'a:resume', 'seq:resume',
        'a:end', 'b:start',
        'b:end', 'seq:end',
      ]);
    });

    it('should emit stop when a PAR is stopped', function () {
      const group = new PAR([new FakeTask('a'), new FakeTask('b')]);
      const log = recordEvents(group);

      group.start();
      group.stop();
      assert.deepStrictEqual(log, ['start', 'stop']);
    });
  });

  describe('with a Wait', function () {
    beforeEach(function () {
      mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    });

    afterEach(function () {
      mock.timers.reset();
    });

    it('should emit end after the time', function () {
      const wait = new Wait(100);
      const log = recordEvents(wait);

      wait.start();
      mock.timers.tick(100);
      assert.deepStrictEqual(log, ['start', 'end']);
    });

    it('should emit stop when the abort signal is aborted', function () {
      const controller = new AbortController();
      const wait = new Wait(100, { signal: controller.signal });
      const log = recordEvents(wait);

      wait.start();
      controller.abort();
      assert.deepStrictEqual(log, ['start', 'stop']);
    });
  });
});
