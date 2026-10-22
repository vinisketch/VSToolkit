import assert from 'assert';

import '../../../di_config';

import Component from '../../../../src/core/Component';
import Event from '../../../../src/core/event/Event';

class Source extends Component {}

describe('Event', function () {
  describe('retain', function () {
    it('should return an empty Event', function () {
      const event = Event.retain();
      assert.ok(event instanceof Event);
      assert.strictEqual(event.type, undefined);
      assert.strictEqual(event.src, undefined);
      assert.strictEqual(event.srcTarget, undefined);
    });

    it('should return distinct events while none is released', function () {
      const first = Event.retain();
      const second = Event.retain();
      assert.notStrictEqual(first, second);
    });

    it('should reuse a released event', function () {
      const event = Event.retain();
      Event.release(event);
      assert.strictEqual(Event.retain(), event);
    });
  });

  describe('configure', function () {
    it('should set the type', function () {
      const event = Event.retain();
      event.configure('select');
      assert.strictEqual(event.type, 'select');
    });

    it('should replace the type of a configured event', function () {
      const event = Event.retain();
      event.configure('select');
      event.configure('change');
      assert.strictEqual(event.type, 'change');
    });
  });

  describe('release', function () {
    it('should clear the type, source and target', function () {
      const source = new Source();
      const event = Event.retain();
      event.configure('select', { value: 1 });
      event.src = source;
      event.srcTarget = source;

      Event.release(event);
      assert.strictEqual(event.type, undefined);
      assert.strictEqual(event.src, undefined);
      assert.strictEqual(event.srcTarget, undefined);
    });

    it('should not give the same event twice when it is released twice', function () {
      const event = Event.retain();
      Event.release(event);
      Event.release(event);

      const first = Event.retain();
      const second = Event.retain();
      assert.notStrictEqual(first, second);
    });
  });
});
