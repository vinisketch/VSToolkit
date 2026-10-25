import assert from 'assert';

import '../../dom';
import '../../di_config';

import { InOut } from 'vs_toolkit/vs_core';
import { View, Button, NavigationBar } from 'vs_toolkit/vs_ui';
import {
  StackController, SlideController, CardController, CubicController, OpacityController, SwipeController,
  NavigationController, Controller,
} from '../../../src/fx';

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
  const owner = new View({ size: [300, 200] });
  owner.init();
  document.body.appendChild(owner.view!);
  return owner;
}

function transform(view: View): string {
  return view.view!.style.transform;
}

function pointer(type: string, target: EventTarget, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { pointerId: 1, isPrimary: true, bubbles: true, ...init }));
}

/** a swipe of dx px (horizontal) or dy px on the owner */
function swipe(owner: View, dx: number, dy = 0): void {
  pointer('pointerdown', owner.view!, { clientX: 100, clientY: 100 });
  pointer('pointermove', document, { clientX: 100 + dx, clientY: 100 + dy });
  pointer('pointerup', document, { clientX: 100 + dx, clientY: 100 + dy });
}

async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 5));
}

const controllers: Controller<any>[] = [];

function makeStack<C extends StackController>(
  Class: new (owner: View) => C, count = 3,
): { owner: View; controller: C; views: View[] } {
  const owner = makeOwner();
  const controller = new Class(owner);
  controllers.push(controller);
  controller.animationDuration = 0;
  const views = Array.from({ length: count }, () => makeView());
  views.forEach(view => controller.push(view));
  return { owner, controller, views };
}

describe('stack controllers', function () {
  afterEach(function () {
    controllers.splice(0).forEach(controller => controller.destroy());
    document.body.innerHTML = '';
  });

  describe('StackController (SlideController)', function () {
    it('should start with the first view', function () {
      const { controller, views } = makeStack(SlideController);
      assert.deepStrictEqual(controller.stack, views.map(view => view.id));
      assert.strictEqual(controller.initialComponent, views[0].id);
      assert.strictEqual(controller.currentIndex, 0);
      same(controller.currentView, views[0]);
    });

    it('should go to the next, previous, last and first views', async function () {
      const { controller } = makeStack(SlideController, 4);
      assert.strictEqual(await controller.goToNextView(), true);
      assert.strictEqual(controller.currentIndex, 1);
      assert.strictEqual(await controller.goToLastView(), true);
      assert.strictEqual(controller.currentIndex, 3);
      assert.strictEqual(await controller.goToNextView(), false, 'no view after the last one');
      assert.strictEqual(await controller.goToPreviousView(), true);
      assert.strictEqual(controller.currentIndex, 2);
      assert.strictEqual(await controller.goToFirstView(), true);
      assert.strictEqual(controller.currentIndex, 0);
      assert.strictEqual(await controller.goToPreviousView(), false);
    });

    it('should go to a view by its position or its id', async function () {
      const { controller, views } = makeStack(SlideController);
      assert.strictEqual(await controller.goToViewAt(2), true);
      same(controller.currentView, views[2]);
      assert.strictEqual(await controller.goToViewAt(2), true, 'already there');
      assert.strictEqual(await controller.goToViewAt(7), false);
      assert.strictEqual(await controller.goToViewAt(-1), false);
      assert.strictEqual(await controller.goToViewId(views[1].id), true);
      assert.strictEqual(controller.currentIndex, 1);
      assert.strictEqual(await controller.goToViewId('unknown'), false);
    });

    it('should cross the next and pred transitions of the fsm', async function () {
      const { controller } = makeStack(SlideController);
      assert.strictEqual(await controller.notify(StackController.NEXT), true);
      assert.strictEqual(await controller.notify(StackController.NEXT), true);
      assert.strictEqual(controller.currentIndex, 2);
      assert.strictEqual(await controller.notify(StackController.FIRST), true);
      assert.strictEqual(controller.currentIndex, 0);
    });

    it('should relink the views when one is removed', async function () {
      const { owner, controller, views } = makeStack(SlideController, 4);
      controller.remove(views[1]);
      assert.strictEqual(owner.isChild(views[1]), false);
      await controller.goToNextView();
      same(controller.currentView, views[2]);

      // the current view is replaced by its neighbor
      controller.remove(views[2]);
      same(controller.currentView, views[3]);

      // the first one: a new initial view
      controller.remove(views[0]);
      assert.strictEqual(controller.initialComponent, views[3].id);
      assert.deepStrictEqual(controller.stack, [views[3].id]);
    });

    it('should tell the delegate the views of the move', async function () {
      const { controller, views } = makeStack(SlideController);
      const moves: [View | null, View][] = [];
      controller.delegate = { controllerAnimationDidEnd: (from, to) => moves.push([from, to]) };
      await controller.goToViewAt(2);
      assert.strictEqual(moves.length, 1);
      same(moves[0][0], views[0]);
      same(moves[0][1], views[2]);
    });

    it('should change the view when the user swipes', async function () {
      const { owner, controller } = makeStack(SlideController);
      controller.isTactile = true;
      swipe(owner, -80);
      await settle();
      assert.strictEqual(controller.currentIndex, 1);
      swipe(owner, 80);
      await settle();
      assert.strictEqual(controller.currentIndex, 0);
      swipe(owner, -20);
      await settle();
      assert.strictEqual(controller.currentIndex, 0, 'too short');

      controller.isTactile = false;
      swipe(owner, -80);
      await settle();
      assert.strictEqual(controller.currentIndex, 0);
    });

    it('should create the views of the component names', async function () {
      class Page extends View { @InOut accessor index = 0; }
      View.registerComponent('FxPage', Page);
      const owner = makeOwner();
      const controller = new SlideController(owner);
      controllers.push(controller);
      controller.animationDuration = 0;
      for (const index of [1, 2]) controller.push('FxPage', { id: `fx_page${index}`, data: { index } });

      assert.strictEqual((controller.currentView as Page).index, 1);
      await controller.goToNextView();
      const page = controller.currentView as Page;
      assert.ok(page instanceof Page);
      assert.strictEqual(page.index, 2);
      assert.strictEqual(page.view!.style.position, 'absolute');
    });
  });

  describe('SlideController', function () {
    it('should place the views side by side', function () {
      const { views } = makeStack(SlideController);
      assert.deepStrictEqual(views.map(transform),
        ['translate3d(0%,0,0)', 'translate3d(100%,0,0)', 'translate3d(100%,0,0)']);
      assert.deepStrictEqual(views.map(view => view.visible), [true, false, false]);
    });

    it('should slide the views', async function () {
      const { controller, views } = makeStack(SlideController);
      await controller.goToNextView();
      assert.strictEqual(transform(views[0]), 'translate3d(-100%,0,0)');
      assert.strictEqual(transform(views[1]), 'translate3d(0%,0,0)');
      assert.deepStrictEqual(views.map(view => view.visible), [false, true, false]);
    });

    it('should slide vertically, by pixels', function () {
      const { controller, views } = makeStack(SlideController);
      controller.orientation = SlideController.VERTICAL;
      controller.animationMode = SlideController.PIXEL;
      assert.strictEqual(transform(views[1]), 'translate3d(0,200px,0)');
      controller.viewSize = [300, 150];
      assert.strictEqual(transform(views[1]), 'translate3d(0,150px,0)');
      assert.deepStrictEqual(controller.viewSize, [300, 150]);
    });
  });

  describe('CardController', function () {
    it('should stack the cards, the next ones out of the owner', function () {
      const { views } = makeStack(CardController);
      assert.deepStrictEqual(views.map(transform),
        ['translate3d(0px,0,0)', 'translate3d(100%,0,0)', 'translate3d(100%,0,0)']);
      assert.deepStrictEqual(views.map(view => view.getStyle('z-index')), ['1', '2', '3']);
    });

    it('should slide the next card in, and the current card out', async function () {
      const { controller, views } = makeStack(CardController);
      controller.direction = CardController.BOTTOM_OUT;
      assert.strictEqual(transform(views[1]), 'translate3d(0,100%,0)');

      await controller.goToNextView();
      assert.strictEqual(transform(views[1]), 'translate3d(0,0px,0)');
      assert.strictEqual(views[0].visible, false);

      await controller.goToPreviousView();
      assert.strictEqual(transform(views[1]), 'translate3d(0,100%,0)');
      assert.deepStrictEqual(views.map(view => view.visible), [true, false, false]);
    });

    it('should move the cards with the pointer', async function () {
      const { owner, controller, views } = makeStack(CardController);
      controller.isTactile = true;
      // towards the left (RIGHT_OUT): the next card comes
      pointer('pointerdown', owner.view!, { clientX: 200 });
      pointer('pointermove', document, { clientX: 160 });
      assert.strictEqual(transform(views[1]), 'translate3d(calc(100% + -40px),0,0)');
      assert.strictEqual(views[1].visible, true);
      pointer('pointerup', document, { clientX: 160 });
      await settle();
      assert.strictEqual(controller.currentIndex, 0, 'too short: back');
      assert.strictEqual(views[1].visible, false);

      swipe(owner, -80);
      await settle();
      assert.strictEqual(controller.currentIndex, 1);
      swipe(owner, 80);
      await settle();
      assert.strictEqual(controller.currentIndex, 0);
    });
  });

  describe('CubicController', function () {
    it('should turn the cube, then reset the faces', async function () {
      const { owner, controller, views } = makeStack(CubicController);
      assert.strictEqual(owner.getStyle('perspective'), '1000px');
      await controller.goToNextView();
      assert.deepStrictEqual(views.map(view => view.visible), [false, true, false]);
      assert.deepStrictEqual([transform(views[0]), transform(views[1])], ['', '']);

      controller.orientation = CubicController.VERTICAL;
      assert.strictEqual(await controller.goToPreviousView({ instant: true }), true);
      assert.strictEqual(controller.currentIndex, 0);
    });
  });

  describe('OpacityController', function () {
    it('should cross-fade the views', async function () {
      const { controller, views } = makeStack(OpacityController);
      await controller.goToNextView();
      assert.deepStrictEqual(views.map(view => view.visible), [false, true, false]);
      assert.strictEqual(views[1].view!.style.opacity, '1');
      assert.strictEqual(views[0].getStyle('opacity'), 1, 'reset once hidden');
    });
  });

  describe('SwipeController', function () {
    it('should place the views side by side, and move them together', async function () {
      const { controller, views } = makeStack(SwipeController);
      assert.deepStrictEqual(views.map(transform),
        ['translate3d(0px,0,0)', 'translate3d(300px,0,0)', 'translate3d(600px,0,0)']);
      await controller.goToNextView();
      assert.deepStrictEqual(views.map(transform),
        ['translate3d(-300px,0,0)', 'translate3d(0px,0,0)', 'translate3d(300px,0,0)']);
      assert.ok(views.every(view => view.visible));
    });

    it('should go around when circular', async function () {
      const { controller } = makeStack(SwipeController);
      assert.strictEqual(await controller.goToPreviousView(), false);
      controller.isCircular = true;
      assert.strictEqual(await controller.goToPreviousView(), true);
      assert.strictEqual(controller.currentIndex, 2);
      assert.strictEqual(await controller.goToNextView(), true);
      assert.strictEqual(controller.currentIndex, 0);
    });

    it('should follow the pointer with a continuous swipe', async function () {
      const { owner, controller, views } = makeStack(SwipeController);
      controller.isTactile = true;
      controller.isContinuousSwipe = true;
      controller.isCircular = true;
      pointer('pointerdown', owner.view!, { clientX: 200 });
      pointer('pointermove', document, { clientX: 170 });
      assert.deepStrictEqual(views.map(transform),
        ['translate3d(-30px,0,0)', 'translate3d(270px,0,0)', 'translate3d(-330px,0,0)']);
      pointer('pointerup', document, { clientX: 170 });
      await settle();
      assert.strictEqual(controller.currentIndex, 0);

      controller.orientation = SwipeController.VERTICAL;
      swipe(owner, 0, -90);
      await settle();
      assert.strictEqual(controller.currentIndex, 1);
      assert.strictEqual(transform(views[1]), 'translate3d(0,0px,0)');
    });
  });

  describe('NavigationController', function () {
    function makeNavigation(animationType = NavigationController.SLIDE_ANIMATION) {
      const owner = makeOwner();
      const navigationBar = new NavigationBar();
      navigationBar.init();
      const controller = new NavigationController(owner, { navigationBar, animationType });
      controllers.push(controller);
      controller.animationDuration = 0;
      const [home, detail] = [makeView(), makeView()];
      controller.push(home);
      controller.push(detail);
      controller.initialComponent = home.id;
      controller.configureTransition(home.id, detail.id, 'open');
      return { owner, controller, navigationBar, home, detail };
    }

    it('should go to a view and back, sliding', async function () {
      const { controller, home, detail } = makeNavigation();
      assert.strictEqual(detail.visible, false);
      assert.strictEqual(await controller.notify('open'), true);
      same(controller.currentView, detail);
      assert.strictEqual(transform(detail), 'translate3d(0,0,0)');
      assert.strictEqual(transform(home), 'translate3d(-100%,0,0)');
      assert.strictEqual(home.visible, false);

      assert.strictEqual(await controller.notify(NavigationController.BACK), true);
      same(controller.currentView, home);
      assert.strictEqual(transform(detail), 'translate3d(100%,0,0)');
      assert.strictEqual(await controller.notify(NavigationController.BACK), false);
    });

    it('should cover the current view with a card animation', async function () {
      const { controller, home } = makeNavigation(NavigationController.CARD_ANIMATION);
      await controller.notify('open');
      assert.strictEqual(transform(home), 'translate3d(0,0,0)', 'the current view does not move');
      assert.strictEqual(controller.animationType, NavigationController.CARD_ANIMATION);
    });

    it('should configure the navigation bar for each view', async function () {
      const { controller, navigationBar, home, detail } = makeNavigation();
      const back = new Button({ text: 'Back' });
      back.init();
      const title = new Button();
      title.init();
      controller.configureNavigationBarState(home.id, [{ comp: title, properties: { text: 'Home' } }]);
      controller.configureNavigationBarState(detail.id, [
        { comp: back.id }, { comp: title, properties: { text: 'Detail' } },
      ]);
      assert.strictEqual(navigationBar.currentState, home.id);
      assert.strictEqual(title.text, 'Home');
      assert.strictEqual(back.visible, false);

      await controller.notify('open');
      assert.strictEqual(navigationBar.currentState, detail.id);
      assert.strictEqual(title.text, 'Detail');
      assert.strictEqual(back.visible, true);
    });
  });
});
