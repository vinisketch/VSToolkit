import assert from 'assert';

import '../../dom';
import '../../di_config';

import { InOut } from 'vs_toolkit/vs_core';
import { View, OpacityAnimation, TranslateAnimation } from 'vs_toolkit/vs_ui';
import { Controller, type ControllerDelegate } from '../../../src/fx';

/** identity comparison (a failing deepStrictEqual on DOM objects hangs) */
function same(actual: unknown, expected: unknown, message?: string): void {
  assert.ok(actual === expected, message ?? 'not the same object');
}

function makeView(): View {
  const view = new View();
  view.init();
  return view;
}

function makeOwner(): View {
  const owner = new View({ size: [320, 480] });
  owner.init();
  document.body.appendChild(owner.view!);
  return owner;
}

class Panel extends View {
  @InOut accessor title = '';
  appeared = 0;
  disappeared = 0;
  viewWillAppear(): void { this.appeared++; }
  viewWillDisappear(): void { this.disappeared++; }
}

describe('Controller', function () {
  const components: { destroy(): void }[] = [];
  function track<T extends { destroy(): void }>(component: T): T {
    components.push(component);
    return component;
  }

  afterEach(function () {
    components.splice(0).forEach(component => component.destroy());
    document.body.innerHTML = '';
  });

  describe('owner', function () {
    it('should control a view, which has one controller', function () {
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      same(controller.owner, owner);
      same(Controller.of(owner), controller);
      assert.throws(() => new Controller(owner), /already has a controller/);
      assert.throws(() => new Controller({} as View), TypeError);
    });

    it('should free its owner when destroyed', function () {
      const owner = makeOwner();
      new Controller(owner).destroy();
      assert.strictEqual(Controller.of(owner), undefined);
      track(new Controller(owner));
    });
  });

  describe('states', function () {
    it('should push views, added to the owner', function () {
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      const view = makeView();

      assert.strictEqual(controller.push(view), view.id);
      assert.ok(owner.isChild(view));
      assert.strictEqual(controller.push(view), undefined, 'a state once');
      assert.ok(controller.hasState(view.id));
      same(controller.getView(view.id), view);
      assert.strictEqual(controller.push(makeView(), { id: 'other' }), 'other');
      assert.deepStrictEqual(controller.getStates(), [view.id, 'other']);
    });

    it('should create a component when its state is first entered', function () {
      View.registerComponent('FxPanel', Panel);
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      const id = controller.push('FxPanel', { id: 'panel', data: { title: 'Created' } })!;
      assert.strictEqual(id, 'panel');
      assert.strictEqual(controller.getView(id), undefined);

      controller.initialComponent = id;
      const panel = controller.getView(id) as Panel;
      assert.ok(panel instanceof Panel);
      assert.strictEqual(panel.title, 'Created');
      assert.ok(owner.isChild(panel));
      same(controller.currentView, panel);
    });

    it('should show the initial view, without animation', function () {
      const controller = track(new Controller(makeOwner()));
      const view = makeView();
      view.hide();
      controller.push(view);
      controller.initialComponent = view.id;
      assert.strictEqual(controller.currentState, view.id);
      assert.strictEqual(controller.initialComponent, view.id);
      assert.strictEqual(view.visible, true);
      assert.throws(() => { controller.initialComponent = 'unknown'; }, /unknown state/);
    });

    it('should remove a state and its view', function () {
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      const view = makeView();
      controller.push(view);
      controller.initialComponent = view.id;

      assert.strictEqual(controller.remove(view.id), true);
      assert.strictEqual(controller.hasState(view.id), false);
      assert.strictEqual(owner.isChild(view), false);
      assert.strictEqual(controller.currentState, '');
      assert.strictEqual(controller.initialComponent, '');
      assert.strictEqual(controller.remove(view), false);
    });
  });

  describe('transitions', function () {
    function makeTwoViews() {
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      const first = new Panel();
      first.init();
      const second = new Panel();
      second.init();
      controller.push(first);
      controller.push(second);
      controller.initialComponent = first.id;
      return { owner, controller, first, second };
    }

    it('should cross a transition, with its animations, then resolve', async function () {
      const { controller, first, second } = makeTwoViews();
      const out = new OpacityAnimation(0, { duration: 0 });
      const into = new TranslateAnimation(5, 0, 0, { duration: 0, additive: false });
      controller.addTransition(first.id, second.id, 'go', out, into);

      const moving = controller.notify('go');
      assert.strictEqual(controller.currentState, second.id);
      assert.strictEqual(await moving, true);
      assert.strictEqual(first.view!.style.opacity, '0');
      assert.strictEqual(second.view!.style.transform, 'translate3d(5px,0px,0px)');
      assert.strictEqual(second.visible, true);
    });

    it('should resolve false without transition', async function () {
      const { controller, first } = makeTwoViews();
      assert.strictEqual(await controller.notify('unknown'), false);
      controller.addTransition(first.id, first.id, 'stay');
      assert.strictEqual(await controller.notify('nowhere'), false);
    });

    it('should throw for a transition between unknown states', function () {
      const { controller, first } = makeTwoViews();
      assert.throws(() => controller.addTransition(first.id, 'unknown', 'go'), /unknown state/);
      assert.throws(() => controller.addTransition(first.id, first.id, ''), /empty/);
    });

    it('should set the data of the input to the new view', async function () {
      const { controller, first, second } = makeTwoViews();
      controller.addTransition(first.id, second.id, 'go');
      await controller.notify('go', { title: 'Hello', unknown: 1 });
      assert.strictEqual(second.title, 'Hello');
    });

    it('should tell its delegate and emit events, in order', async function () {
      const { controller, first, second } = makeTwoViews();
      controller.addTransition(first.id, second.id, 'go', new OpacityAnimation(0, { duration: 0 }));
      const log: string[] = [];
      const delegate: ControllerDelegate = {
        controllerViewWillChange: (from, to, c) => {
          same(from, first); same(to, second); same(c, controller);
          log.push('delegate:willChange');
        },
        controllerAnimationDidEnd: () => log.push('delegate:didEnd'),
      };
      controller.delegate = delegate;
      controller.on('viewwillchange', (_c, from, to) => { same(from, first); same(to, second); log.push('event:willChange'); });
      controller.on('animationend', () => log.push('event:end'));

      await controller.notify('go');
      assert.deepStrictEqual(log, ['delegate:willChange', 'event:willChange', 'delegate:didEnd', 'event:end']);
      assert.deepStrictEqual([first.disappeared, second.appeared], [1, 1]);
    });

    it('should move at once when instant', async function () {
      const { controller, first, second } = makeTwoViews();
      controller.addTransition(first.id, second.id, 'go', new OpacityAnimation(0, { duration: '10s' }));
      const started = Date.now();
      assert.strictEqual(await controller.notify('go', undefined, { instant: true }), true);
      assert.ok(Date.now() - started < 1000);
      assert.strictEqual(first.view!.style.opacity, '0');
    });

    it('should run an animation on several views', async function () {
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      const [a, b, c] = [makeView(), makeView(), makeView()];
      [a, b, c].forEach(view => controller.push(view));
      controller.initialComponent = a.id;
      const fade = new OpacityAnimation(0.5, { duration: 0 });
      controller.addTransition(a.id, b.id, 'go', fade);
      controller.addTransition(b.id, c.id, 'go', fade);

      await Promise.all([controller.notify('go'), controller.notify('go')]);
      assert.strictEqual(controller.currentState, c.id);
      assert.strictEqual(b.view!.style.opacity, '0.5');
    });
  });

  describe('bindings', function () {
    it('should bind the listeners while the state is the current one', async function () {
      const owner = makeOwner();
      const controller = track(new Controller(owner));
      const first = new Panel();
      first.init();
      const second = makeView();
      const titles: string[] = [];
      controller.push(first, { bindings: [['change:title', (panel: Panel) => titles.push(panel.title)]] });
      controller.push(second);

      first.title = 'before';
      controller.initialComponent = first.id;
      first.title = 'current';
      controller.addTransition(first.id, second.id, 'go');
      await controller.notify('go');
      first.title = 'after';
      assert.deepStrictEqual(titles, ['current']);

      controller.componentBind(second.id, 'change:visible', () => titles.push('second'));
      second.hide();
      assert.deepStrictEqual(titles, ['current', 'second']);
    });
  });
});
