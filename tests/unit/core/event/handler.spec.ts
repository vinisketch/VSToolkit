import assert from 'assert';

import '../../../di_config';

import Component from '../../../../src/core/Component';
import Event from '../../../../src/core/event/Event';
import Handler from '../../../../src/core/event/Handler';

class Observer extends Component {
  readonly calls: [unknown, Event][] = [];

  onEvent(event: Event): void {
    this.calls.push([this, event]);
  }
}

function makeEvent(type = 'select'): Event {
  const event = Event.retain();
  event.configure(type);
  return event;
}

describe('Handler', function () {
  describe('configure', function () {
    it('should keep the object and the function', function () {
      const observer = new Observer();
      const func = () => {};
      const handler = Handler.retain();

      handler.configure(observer, func);
      assert.strictEqual(handler.obj, observer);
      assert.strictEqual(handler.func, func);
    });

    it('should keep a method name', function () {
      const observer = new Observer();
      const handler = Handler.retain();

      handler.configure(observer, 'onEvent');
      assert.strictEqual(handler.func, 'onEvent');
    });

    it('should accept no object', function () {
      const func = () => {};
      const handler = Handler.retain();

      handler.configure(undefined, func);
      assert.strictEqual(handler.obj, undefined);
      assert.strictEqual(handler.func, func);
    });

    it('should replace the callback of a configured handler', function () {
      const observer = new Observer();
      const handler = Handler.retain();

      handler.configure(observer, () => {});
      handler.configure(observer, 'onEvent');
      assert.strictEqual(handler.func, 'onEvent');
    });
  });

  describe('toListener', function () {
    it('should call the function with the object as this, and the event', function () {
      const observer = new Observer();
      let self: unknown;
      let received: unknown;
      const handler = Handler.retain();
      handler.configure(observer, function (this: unknown, event: Event) {
        self = this;
        received = event;
      });

      const event = makeEvent();
      handler.toListener()(event);
      assert.strictEqual(self, observer);
      assert.strictEqual(received, event);
    });

    it('should call a method given by name on the object', function () {
      const observer = new Observer();
      const handler = Handler.retain();
      handler.configure(observer, 'onEvent');

      const event = makeEvent();
      handler.toListener()(event);
      assert.deepStrictEqual(observer.calls, [[observer, event]]);
    });

    it('should look the method up when called', function () {
      const observer = new Observer();
      const handler = Handler.retain();
      handler.configure(observer, 'onEvent');
      const listener = handler.toListener();

      let replaced = false;
      observer.onEvent = () => { replaced = true; };
      listener(makeEvent());
      assert.strictEqual(replaced, true);
    });

    it('should do nothing when the method does not exist', function () {
      const observer = new Observer();
      const handler = Handler.retain();
      handler.configure(observer, 'unknownMethod');

      assert.doesNotThrow(() => handler.toListener()(makeEvent()));
    });

    it('should do nothing for a method name without object', function () {
      const handler = Handler.retain();
      handler.configure(undefined, 'onEvent');

      assert.doesNotThrow(() => handler.toListener()(makeEvent()));
    });

    it('should not be affected by the release and reuse of the handler', function () {
      const first = new Observer();
      const second = new Observer();
      const handler = Handler.retain();
      handler.configure(first, 'onEvent');
      const listener = handler.toListener();

      Handler.release(handler);
      const reused = Handler.retain();
      assert.strictEqual(reused, handler);
      reused.configure(second, 'onEvent');

      listener(makeEvent());
      assert.strictEqual(first.calls.length, 1);
      assert.strictEqual(second.calls.length, 0);
    });
  });

  describe('release', function () {
    it('should clear the object and the callback', function () {
      const handler = Handler.retain();
      handler.configure(new Observer(), 'onEvent');

      Handler.release(handler);
      assert.strictEqual(handler.obj, undefined);
      assert.strictEqual(handler.func, undefined);
    });

    it('should reuse a released handler', function () {
      const handler = Handler.retain();
      Handler.release(handler);
      assert.strictEqual(Handler.retain(), handler);
    });

    it('should not give the same handler twice when it is released twice', function () {
      const handler = Handler.retain();
      Handler.release(handler);
      Handler.release(handler);

      const first = Handler.retain();
      const second = Handler.retain();
      assert.notStrictEqual(first, second);
    });
  });
});
