import assert from 'assert';

import '../../dom';
import '../../di_config';

import { Component, DataFlow, Model, InOut } from 'vs_toolkit/vs_core';
import { View } from '../../../src/ui/View/View';
import { Animation } from '../../../src/ui/Animation';
import { TapRecognizer, MULTI_TAP_DELAY } from '../../../src/ui/Recognizers';

/**
 * Identity check: assert.strictEqual would inspect the happy-dom objects
 * (DOM nodes, views) in depth to describe a failure, which can take forever
 */
function same(actual: unknown, expected: unknown, message = 'not the same object'): void {
  assert.ok(actual === expected, message);
}

/** lets the deferred work (setTimeout 0) run */
async function later(ms = 5): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function makeView(options = {}): View {
  const view = new View(options);
  view.init();
  return view;
}

/**
 * A view with two holes, a text node, and a child created while
 * initializing
 */
class Panel extends View {
  protected override htmlTemplate = '<div class="panel"><span x-hag-ref="title"></span><div x-hag-hole="header"></div><div x-hag-hole="children"></div></div>';
  readonly ownChild = new View();
  #title = '';

  @InOut set title(v: string) {
    this.#title = v;
    const node = this.findNodeRef('title');
    if (node) node.textContent = v;
  }
  get title(): string {
    return this.#title;
  }

  protected override initComponent(): void {
    super.initComponent();
    this.ownChild.init();
    this.add(this.ownChild, 'header');
  }
}

describe('View', function () {
  let warnings: unknown[];
  let errors: unknown[];
  const originals = { warn: console.warn, error: console.error, log: console.log };

  beforeEach(function () {
    warnings = [];
    errors = [];
    console.warn = (...args: unknown[]) => { warnings.push(args); };
    console.error = (...args: unknown[]) => { errors.push(args); };
    console.log = () => {};
  });

  afterEach(function () {
    Object.assign(console, originals);
    document.body.innerHTML = '';
  });

  describe('node', function () {
    it('should create its node from its template', function () {
      const view = makeView();
      assert.ok(view.view instanceof HTMLElement);
      assert.strictEqual(view.view!.className, 'vs_ui_view');
      assert.strictEqual(view.view!.id, view.id);
      same(view.view!.getAttribute('x-hag-comp'), view.id);
      same(View.componentOf(view.view), view);
    });

    it('should use the node of the options', function () {
      const node = document.createElement('section');
      same(makeView({ node }).view, node);
    });

    it('should find the node by id', function () {
      document.body.innerHTML = '<div id="existing"></div><div id="by_component_id"></div>';
      // the view takes the node: its id becomes the component id
      const existing = document.getElementById('existing');
      same(makeView({ nodeId: 'existing' }).view, existing);
      const byId = document.getElementById('by_component_id');
      same(makeView({ id: 'by_component_id' }).view, byId);
    });

    it('should find a node of another view with nodeRef', function () {
      const root = makeView({ template: '<div><p x-hag-ref="item"></p></div>' });
      const item = makeView({ nodeRef: `${root.id}#item` });
      same(item.view, root.view!.querySelector('p'));
    });

    it('should copy a node of the application templates', function () {
      document.body.innerHTML = '<div class="application_templates"><div class="card"><b>card</b></div></div>';
      const first = makeView({ templateRef: 'card' });
      const second = makeView({ templateRef: 'card' });
      assert.strictEqual(first.view!.className, 'card');
      assert.ok(first.view !== second.view);
      assert.strictEqual(document.querySelector('.application_templates'), null);
    });

    it('should parse the template of the options', function () {
      assert.strictEqual(makeView({ template: '<ul class="list"></ul>' }).view!.className, 'list');
    });

    it('should create a div, with a warning, without template', function () {
      class Empty extends View { protected override htmlTemplate = ''; }
      const view = new Empty();
      view.init();
      assert.strictEqual(view.view!.tagName, 'DIV');
      assert.strictEqual(warnings.length, 1);
    });
  });

  describe('options', function () {
    it('should assign the model properties of the options once initialized', function () {
      const panel = new Panel({ title: 'Hello', size: [100, 50] });
      panel.init();
      assert.strictEqual(panel.title, 'Hello');
      assert.strictEqual(panel.findNodeRef('title')!.textContent, 'Hello');
      assert.deepStrictEqual(panel.size, [100, 50]);
    });

    it('should refuse an option which is not a model property', function () {
      const view = new View({ unknown: 1 });
      assert.throws(() => view.init(), /"unknown" is not a model property/);
    });

    it('should declare its properties as model properties', function () {
      const view = makeView();
      for (const name of ['size', 'position', 'visible', 'enable', 'opacity', 'layout', 'magnet']) {
        assert.ok(view.modelProperties.includes(name), name);
      }
    });

    it('should notify the changes of its properties', function () {
      const view = makeView();
      const changes: string[][] = [];
      view.on('change', (_view, properties) => changes.push(properties));

      view.size = [10, 20];
      view.size = [10, 20];
      view.opacity = 0.5;
      assert.deepStrictEqual(changes, [['size'], ['opacity']]);
    });
  });

  describe('children', function () {
    it('should add a child view into a hole', function () {
      const panel = new Panel();
      panel.init();
      const child = makeView();

      panel.add(child);
      same(child.view!.parentElement, panel.view!.querySelector(':scope > [x-hag-hole="children"]'));
      same(child.parent, panel);
      assert.ok(panel.isChild(child));
      const inHole = panel.getChildren('children');
      assert.ok(inHole.length === 1 && inHole[0] === child);
      const all = panel.getChildren();
      assert.ok(all.length === 2 && all[0] === panel.ownChild && all[1] === child);
    });

    it('should add a child into a named hole', function () {
      const panel = new Panel();
      panel.init();
      same(panel.ownChild.view!.parentElement, panel.view!.querySelector(':scope > [x-hag-hole="header"]'));
    });

    it('should not add a child twice', function () {
      const view = makeView();
      const child = makeView();
      view.add(child);
      view.add(child);
      assert.strictEqual(view.getChildren().length, 1);
    });

    it('should keep a non graphical child', function () {
      const view = makeView();
      const model = new Model();
      view.add(model);
      assert.ok(view.isChild(model));
    });

    it('should remove a child, and its node', function () {
      const view = makeView();
      const child = makeView();
      view.add(child);

      view.remove(child);
      assert.strictEqual(view.isChild(child), false);
      same(child.view!.parentElement, null);
      same(child.parent, undefined);
    });

    it('should remove all the children, and return them or destroy them', function () {
      const view = makeView();
      const [a, b] = [makeView(), makeView()];
      view.add(a);
      view.add(b);
      const removed = view.removeAllChildren()!;
      assert.ok(removed.length === 2 && removed[0] === a && removed[1] === b);

      view.add(a);
      assert.strictEqual(view.removeAllChildren(true), undefined);
      assert.strictEqual(a.isDeleted(), true);
    });

    it('should call viewDidAdd', function () {
      let calls = 0;
      class Observed extends View { override viewDidAdd() { calls++; super.viewDidAdd(); } }
      const child = new Observed();
      child.init();
      makeView().add(child);
      assert.strictEqual(calls, 1);
    });

    it('should destroy its children, and leave its parent, when destroyed', function () {
      const parent = makeView();
      const view = makeView();
      const child = makeView();
      parent.add(view);
      view.add(child);
      const node = view.view!;

      view.destroy();
      assert.strictEqual(parent.isChild(view), false);
      assert.strictEqual(child.isDeleted(), true);
      same(view.view, null);
      same(View.componentOf(node), undefined);
    });
  });

  describe('layout', function () {
    it('should set the position and size styles', function () {
      const view = makeView({ position: [10, 20], size: [100, 50] });
      const { left, top, width, height } = view.view!.style;
      assert.deepStrictEqual([left, top, width, height], ['10px', '20px', '100px', '50px']);
    });

    it('should apply the magnets', function () {
      const view = makeView({ position: [10, 20], size: [100, 50] });
      view.magnet = View.MAGNET_BOTTOM;
      assert.strictEqual(view.view!.style.position, 'absolute');
      assert.deepStrictEqual([view.view!.style.top, view.view!.style.bottom], ['auto', '0px']);

      view.magnet = View.MAGNET_CENTER;
      assert.deepStrictEqual([view.view!.style.top, view.view!.style.left], ['50%', '50%']);
      assert.match(view.view!.style.transform, /translate\(-50%,\s*-50%\)/);

      view.magnet = View.MAGNET_NONE;
      assert.strictEqual(view.view!.style.position, '');
    });

    it('should set the layout class name', function () {
      const view = makeView();
      view.layout = View.VERTICAL_LAYOUT;
      assert.ok(view.hasClassName('vertical_layout'));
      view.layout = View.HORIZONTAL_LAYOUT;
      assert.deepStrictEqual([view.hasClassName('vertical_layout'), view.hasClassName('horizontal_layout')], [false, true]);

      view.layout = 'unknown';
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(view.layout, 'horizontal_layout');
    });
  });

  describe('style', function () {
    it('should set and get the styles', function () {
      const view = makeView();
      view.setStyle('color', 'red');
      assert.strictEqual(view.getStyle('color'), 'red');
      view.setStyle('color');
      assert.strictEqual(view.getStyle('color'), '');
      assert.strictEqual(view.getStyle('opacity'), 1);

      view.setStyles({ marginTop: '5px' });
      assert.strictEqual(view.view!.style.marginTop, '5px');
    });

    it('should manage the class names', function () {
      const view = makeView();
      view.addClassName('a', 'b');
      view.removeClassName('a');
      view.toggleClassName('c');
      assert.deepStrictEqual([view.hasClassName('a'), view.hasClassName('b'), view.hasClassName('c')], [false, true, true]);
    });

    it('should set the opacity, in [0, 1]', function () {
      const view = makeView();
      view.opacity = 0.3;
      view.opacity = 2;
      assert.strictEqual(view.opacity, 0.3);
      assert.strictEqual(view.view!.style.opacity, '0.3');
    });

    it('should toggle the disabled class name', function () {
      const view = makeView();
      view.enable = false;
      assert.ok(view.hasClassName('disabled'));
      view.enable = true;
      assert.strictEqual(view.hasClassName('disabled'), false);
    });

    it('should set the inner HTML', function () {
      const view = makeView();
      view.innerHTML = '<b>bold</b>';
      assert.strictEqual(view.view!.querySelector('b')!.textContent, 'bold');
    });
  });

  describe('transformations', function () {
    it('should translate, rotate and scale the view', function () {
      const view = makeView();
      view.translate(10, 20);
      assert.deepStrictEqual(view.translation, [10, 20, 0]);
      const ctm = view.getCTM();
      assert.deepStrictEqual([ctm.m41, ctm.m42], [10, 20]);
      assert.match(view.view!.style.transform, /^matrix/);

      view.rotate(90);
      assert.deepStrictEqual(view.rotation, [0, 0, 90]);
      assert.strictEqual(Math.round(view.getCTM().m12), 1);
    });

    it('should keep the scale within its bounds', function () {
      const view = makeView();
      view.scale(10);
      assert.strictEqual(view.scaling, 3);
      view.minScale = 1;
      view.scale(0.1);
      assert.strictEqual(view.scaling, 1);
    });

    it('should stack the transformations', function () {
      const view = makeView();
      view.translate(10, 0);
      view.flushTransformStack();
      assert.deepStrictEqual(view.translation, [0, 0, 0]);
      view.translate(5, 0);
      assert.strictEqual(view.getCTM().m41, 15);

      view.clearTransformStack();
      assert.strictEqual(view.getCTM().m41, 5);
    });

    it('should combine the transformations of the parents', function () {
      const parent = makeView();
      const child = makeView();
      parent.add(child);
      parent.translate(7, 0);
      assert.strictEqual(child.getParentCTM().m41, 7);
      assert.strictEqual(parent.getParentCTM().isIdentity, true);
    });
  });

  describe('visibility', function () {
    it('should hide and show the view, then call the callbacks', async function () {
      const view = makeView();
      view.view!.style.display = 'flex';
      const log: string[] = [];

      view.hide(() => log.push('hidden'));
      assert.strictEqual(view.visible, false);
      assert.strictEqual(view.view!.style.display, 'none');

      view.show(() => log.push('shown'));
      assert.strictEqual(view.visible, true);
      assert.strictEqual(view.view!.style.display, 'flex');

      await later();
      assert.deepStrictEqual(log, ['hidden', 'shown']);
    });

    it('should show and hide with the visible property, and notify', function () {
      const view = makeView();
      const changes: string[][] = [];
      view.on('change', (_view, properties) => changes.push(properties));

      view.visible = false;
      view.visible = true;
      assert.strictEqual(view.view!.style.display, '');
      assert.deepStrictEqual(changes, [['visible'], ['visible']]);
    });

    it('should notify the visibility changes of show() and hide() once', async function () {
      const view = makeView();
      document.body.appendChild(view.view!);
      view.setShowAnimation(Animation.FadeIn, { duration: 10 });
      const changes: string[][] = [];
      view.on('change', (_view, properties) => changes.push(properties));

      view.hide();
      assert.deepStrictEqual(changes, [['visible']]);
      view.show();
      assert.deepStrictEqual(changes, [['visible']]);   // visible at the end of the animation
      await later(50);
      assert.deepStrictEqual(changes, [['visible'], ['visible']]);
      assert.strictEqual(view.visible, true);
    });

    it('should hide with the hide animation', async function () {
      const view = makeView();
      document.body.appendChild(view.view!);
      view.setHideAnimation(Animation.FadeOut, { duration: 10 });

      view.hide();
      assert.notStrictEqual(view.view!.style.display, 'none');   // animating
      await later(50);
      assert.strictEqual(view.view!.style.display, 'none');
      assert.strictEqual(view.view!.style.opacity, '0');
    });

    it('should clone the given animation', function () {
      const view = makeView();
      view.setShowAnimation(Animation.FadeIn);
      assert.ok(view.showAnimation instanceof Animation);
      assert.ok(view.showAnimation !== Animation.FadeIn);

      view.setShowAnimation(null);
      same(view.showAnimation, undefined);
    });

    it('should animate the view', async function () {
      const view = makeView();
      document.body.appendChild(view.view!);
      let ended = false;
      const run = view.animate([['opacity', '0.5']], { duration: 10 }, () => { ended = true; });

      assert.strictEqual(await run, 'ended');
      assert.strictEqual(ended, true);
      assert.strictEqual(view.view!.style.opacity, '0.5');
    });
  });

  describe('pointer recognizers', function () {
    function tap(node: HTMLElement): void {
      node.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, isPrimary: true, bubbles: true }));
      document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, isPrimary: true }));
    }

    it('should attach a recognizer added before the initialization', async function () {
      const view = new View();
      let taps = 0;
      view.addPointerRecognizer(new TapRecognizer({ didTap: () => { taps++; } }));
      view.init();

      tap(view.view!);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(taps, 1);
    });

    it('should ignore the pointers of a disabled view', async function () {
      const view = makeView();
      let taps = 0;
      view.addPointerRecognizer(new TapRecognizer({ didTap: () => { taps++; } }));

      view.enable = false;
      tap(view.view!);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(taps, 0);
    });

    it('should detach a removed recognizer', async function () {
      const view = makeView();
      let taps = 0;
      const recognizer = new TapRecognizer({ didTap: () => { taps++; } });
      view.addPointerRecognizer(recognizer);

      view.removePointerRecognizer(recognizer);
      tap(view.view!);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(taps, 0);
      assert.strictEqual(recognizer.target, undefined);
    });
  });

  describe('events', function () {
    it('should bind the pointer events of its node', function () {
      const view = makeView();
      const observer = new (class extends Component {
        readonly received: string[] = [];
        onDown(event: Event) { this.received.push(event.type); }
      })();

      view.bind('pointerdown', observer, 'onDown');
      view.view!.dispatchEvent(new PointerEvent('pointerdown'));
      view.unbind('pointerdown', observer);
      view.view!.dispatchEvent(new PointerEvent('pointerdown'));
      assert.deepStrictEqual(observer.received, ['pointerdown']);
    });

    it('should bind the other events as an event source', async function () {
      const view = makeView();
      const received: string[] = [];
      view.addEventListener('select', (event) => received.push(String(event.type)));
      const { event: { Event } } = await import('vs_toolkit/vs_core');
      const event = Event.retain();
      event.configure('select');
      view.dispatchEvent(event);
      await later();
      assert.deepStrictEqual(received, ['select']);
    });

    it('should forward the events to its parent when bubbling', function () {
      const received: string[] = [];
      class Parent extends View { override handleEvent(event: Event) { received.push(event.type); } }
      const parent = new Parent();
      parent.init();
      const child = makeView();
      parent.add(child);

      child.handleEvent(new Event('first'));
      child.bubbling = true;
      child.handleEvent(new Event('second'));
      child.notifyToParent(new Event('third'));
      assert.deepStrictEqual(received, ['second', 'third']);
    });
  });

  describe('clone', function () {
    it('should copy the class, the model properties and the animations', function () {
      const panel = new Panel({ title: 'Original', size: [10, 20] });
      panel.init();
      panel.setShowAnimation(Animation.FadeIn);

      const copy = panel.clone();
      assert.ok(copy instanceof Panel);
      assert.notStrictEqual(copy.id, panel.id);
      assert.strictEqual(copy.title, 'Original');
      assert.strictEqual(copy.findNodeRef('title')!.textContent, 'Original');
      assert.deepStrictEqual(copy.size, [10, 20]);
      assert.ok(copy.showAnimation instanceof Animation);
      assert.ok(copy.showAnimation !== panel.showAnimation);
    });

    it('should clone the added children, not the ones created while initializing', function () {
      const panel = new Panel();
      panel.init();
      const child = makeView({ opacity: 0.5 });
      panel.add(child);

      const copy = panel.clone();
      const [own, cloned] = copy.getChildren();
      assert.strictEqual(copy.getChildren().length, 2);
      assert.strictEqual(own, copy.ownChild);
      assert.ok(cloned !== child);
      assert.strictEqual((cloned as View).opacity, 0.5);
      same((cloned as View).parent, copy);
    });

    it('should accept options overriding the values', function () {
      const panel = new Panel({ title: 'Original' });
      panel.init();
      assert.strictEqual(panel.clone({ title: 'Copy' }).title, 'Copy');
    });

    it('should keep the template of the options', function () {
      const view = makeView({ template: '<ul class="list"></ul>' });
      assert.strictEqual(view.clone().view!.className, 'list');
    });
  });

  describe('createAndAddComponent', function () {
    it('should create, initialize and add a registered component', function () {
      View.registerComponent('Panel', Panel);
      const view = makeView();

      const panel = view.createAndAddComponent('Panel', { title: 'Created' });
      assert.ok(panel instanceof Panel);
      assert.strictEqual((panel as Panel).title, 'Created');
      same(panel!.parent, view);
      assert.ok(panel!.isInitialized());
    });

    it('should use a template of the application', function () {
      document.body.innerHTML = '<div class="application_templates"><div class="Card"></div></div>';
      View.registerComponent('Card', View);
      const card = makeView().createAndAddComponent('Card');
      assert.strictEqual(card!.view!.className, 'Card');
    });

    it('should use the static template of the class', function () {
      class Badge extends View { static template = '<em class="badge"></em>'; }
      View.registerComponent('Badge', Badge);
      assert.strictEqual(makeView().createAndAddComponent('Badge')!.view!.className, 'badge');
    });

    it('should return undefined for an unknown component', function () {
      same(makeView().createAndAddComponent('UnknownComponent'), undefined);
      assert.strictEqual(errors.length, 1);
    });
  });

  describe('dataflow', function () {
    it('should connect its properties', function () {
      class Source extends Model { @InOut accessor level = 1; }
      const source = new Source();
      const view = makeView();
      new DataFlow().from(source.$.level).to(view.$.opacity);

      source.level = 0.25;
      assert.strictEqual(view.opacity, 0.25);
      assert.strictEqual(view.view!.style.opacity, '0.25');
    });
  });
});
