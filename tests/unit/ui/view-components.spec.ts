import assert from 'assert';

import '../../dom';
import '../../di_config';

import {
  SVGView, ComboBox, SegmentedButton, Canvas, PopOver, SplitView, View, Button,
  type SplitViewDelegate,
} from '../../../src/ui';

/** identity comparison (a failing deepStrictEqual on DOM objects hangs) */
function same(actual: unknown, expected: unknown, message?: string): void {
  assert.ok(actual === expected, message ?? 'not the same object');
}

async function later(ms = 5): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function pointerDown(node: EventTarget): void {
  node.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, isPrimary: true, bubbles: true }));
}

describe('view components', function () {
  afterEach(function () {
    document.body.innerHTML = '';
  });

  describe('SVGView', function () {
    const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs></defs><circle id="dot" r="1"/><rect width="2" height="2"/></svg>';
    const originalFetch = globalThis.fetch;
    let requests: string[];

    beforeEach(function () {
      requests = [];
      globalThis.fetch = (async (url: string) => {
        requests.push(url);
        if (url.includes('missing')) return { ok: false, status: 404, statusText: 'Not Found' };
        return { ok: true, text: async () => SVG };
      }) as unknown as typeof fetch;
    });

    afterEach(function () {
      globalThis.fetch = originalFetch;
    });

    function uses(view: SVGView): string[] {
      return [...view.view!.querySelectorAll('svg > use')].map(use => use.getAttribute('href')!);
    }

    it('should use all the elements of a file, loaded once', async function () {
      const first = new SVGView({ href: 'shapes.svg' });
      first.init();
      const second = new SVGView({ href: 'shapes.svg' });
      second.init();
      await later();

      const ids = uses(first);
      assert.strictEqual(ids.length, 2);
      assert.strictEqual(ids[0], '#dot');
      assert.ok(document.getElementById(ids[1].slice(1)), 'an id is given to the rect');
      assert.deepStrictEqual(uses(second), ids);
      assert.deepStrictEqual(requests, ['shapes.svg']);
    });

    it('should use an element of a file', async function () {
      const svg = new SVGView({ href: 'element.svg#dot' });
      svg.init();
      await later();
      assert.deepStrictEqual(uses(svg), ['#dot']);
    });

    it('should apply the view box', async function () {
      const svg = new SVGView({ href: 'box.svg#dot', viewBox: [0, 0, 20, 10] });
      svg.init();
      await later();
      const node = svg.view!.querySelector('svg')!;
      assert.strictEqual(node.getAttribute('viewBox'), '0 0 20 10');
      assert.strictEqual(node.getAttribute('width'), '20');
      svg.viewBox = [1, 2] as number[];
      assert.deepStrictEqual(svg.viewBox, [0, 0, 20, 10]);
    });

    it('should ignore a document loaded for a former href', async function () {
      const svg = new SVGView({ href: 'former.svg' });
      svg.init();
      svg.contentData = '<svg><g id="data"></g></svg>';
      await later();
      assert.ok(svg.view!.querySelector('#data'));
      assert.strictEqual(svg.view!.querySelector('use'), null);
      assert.strictEqual(svg.href, null);
    });

    it('should report a document which can not be loaded', async function () {
      const errors: unknown[] = [];
      const error = console.error;
      console.error = (...args: unknown[]) => { errors.push(args[0]); };
      try {
        const svg = new SVGView({ href: 'missing.svg' });
        svg.init();
        await later();
        assert.strictEqual(svg.view!.children.length, 0);
        assert.match(String(errors[0]), /missing\.svg/);
      } finally {
        console.error = error;
      }
    });
  });

  describe('ComboBox', function () {
    it('should display its items, the first one selected', function () {
      const combo = new ComboBox({ data: ['a', 'b', 'c'] });
      combo.init();
      const select = combo.view!.querySelector('select')!;
      assert.deepStrictEqual([...select.options].map(option => option.value), ['a', 'b', 'c']);
      assert.strictEqual(select.value, 'a');

      combo.selectedItem = 'c';
      assert.strictEqual(select.value, 'c');
    });

    it('should keep the selected item when the items change', function () {
      const combo = new ComboBox({ selectedItem: 'b', data: ['a', 'b'] });
      combo.init();
      const select = combo.view!.querySelector('select')!;
      assert.strictEqual(select.value, 'b');
      combo.data = ['b', 'd'];
      assert.strictEqual(select.value, 'b');
      assert.deepStrictEqual(combo.data, ['b', 'd']);
    });

    it('should notify the item selected by the user', function () {
      const combo = new ComboBox({ data: ['a', 'b'] });
      combo.init();
      const log: string[] = [];
      combo.on('change:selectedItem', () => log.push(`change:${combo.selectedItem}`));
      combo.on('select', (_combo, item) => log.push(`select:${item}`));

      const select = combo.view!.querySelector('select')!;
      select.value = 'b';
      select.dispatchEvent(new Event('change'));
      assert.deepStrictEqual(log, ['change:b', 'select:b']);
    });

    it('should be disabled with the view', function () {
      const combo = new ComboBox({ enable: false });
      combo.init();
      const select = combo.view!.querySelector('select')!;
      assert.strictEqual(select.disabled, true);
      combo.enable = true;
      assert.strictEqual(select.disabled, false);
    });
  });

  describe('SegmentedButton', function () {
    function buttons(segmented: SegmentedButton): HTMLElement[] {
      return [...segmented.view!.querySelectorAll<HTMLElement>(':scope > div > div')];
    }

    it('should display its buttons, type and orientation', function () {
      const segmented = new SegmentedButton({ items: ['a', null, 'b', 3], type: SegmentedButton.BAR_TYPE });
      segmented.init();
      assert.deepStrictEqual(buttons(segmented).map(button => button.textContent), ['a', 'b', '3']);
      assert.deepStrictEqual(segmented.items, ['a', 'b', '3']);
      assert.ok(segmented.hasClassName('bar'));
      assert.strictEqual(segmented.hasClassName(SegmentedButton.DEFAULT_TYPE), false);
      assert.ok(segmented.hasClassName('horizontal'));

      segmented.orientation = SegmentedButton.VERTICAL;
      assert.ok(segmented.hasClassName('vertical'));
      assert.strictEqual(segmented.hasClassName('horizontal'), false);
    });

    it('should select a button set before its items', function () {
      const segmented = new SegmentedButton({ selectedIndex: 1, items: ['a', 'b'] });
      segmented.init();
      assert.strictEqual(segmented.selectedIndex, 1);
      assert.ok(buttons(segmented)[1].classList.contains('selected'));

      segmented.selectedIndex = 5;
      assert.strictEqual(segmented.selectedIndex, 1);
      segmented.items = ['x'];
      assert.strictEqual(segmented.selectedIndex, -1);
    });

    it('should select the pressed button, once', function () {
      const segmented = new SegmentedButton({ items: ['a', 'b', 'c'] });
      segmented.init();
      const selections: [number, string][] = [];
      segmented.on('select', (_segmented, index, item) => selections.push([index, item]));
      const changes: number[] = [];
      segmented.on('change:selectedIndex', () => changes.push(segmented.selectedIndex));

      pointerDown(buttons(segmented)[2]);
      pointerDown(buttons(segmented)[2]);
      assert.deepStrictEqual(selections, [[2, 'c']]);
      assert.deepStrictEqual(changes, [2]);
      assert.deepStrictEqual(buttons(segmented).map(button => button.classList.contains('selected')),
        [false, false, true]);
    });

    it('should not select when disabled', function () {
      const segmented = new SegmentedButton({ items: ['a', 'b'], enable: false });
      segmented.init();
      pointerDown(buttons(segmented)[0]);
      assert.strictEqual(segmented.selectedIndex, -1);
    });

    it('should clear the selection of momentary buttons', async function () {
      const segmented = new SegmentedButton({ items: ['a', 'b'], isToggleButtons: false });
      segmented.init();
      pointerDown(buttons(segmented)[0]);
      assert.strictEqual(segmented.selectedIndex, 0);
      await later(320);
      assert.strictEqual(segmented.selectedIndex, -1);
      assert.strictEqual(buttons(segmented)[0].classList.contains('selected'), false);
    });

    it('should stop listening once destroyed', function () {
      const segmented = new SegmentedButton({ items: ['a', 'b'] });
      segmented.init();
      const button = buttons(segmented)[1];
      let selections = 0;
      segmented.on('select', () => { selections++; });
      segmented.destroy();
      pointerDown(button);
      assert.strictEqual(selections, 0);
    });
  });

  describe('Canvas', function () {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    let calls: string[];

    beforeEach(function () {
      calls = [];
      const context = new Proxy({}, {
        get: (_target, name) => (...args: unknown[]) => {
          calls.push(`${String(name)}(${args.map(arg => typeof arg === 'number' ? Math.round(arg) : arg).join(',')})`);
        },
      });
      HTMLCanvasElement.prototype.getContext = (() => context) as unknown as typeof originalGetContext;
    });

    afterEach(function () {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('should size the canvas, and draw', function () {
      const draws: number[][] = [];
      class Drawing extends Canvas {
        override draw(x = 0, y = 0, width = this.size[0], height = this.size[1]): void {
          draws.push([x, y, width, height]);
        }
      }
      const drawing = new Drawing({ size: [200, 100] });
      drawing.init();
      assert.strictEqual(drawing.canvasNode!.width, 200);
      assert.strictEqual(drawing.canvasNode!.height, 100);
      assert.deepStrictEqual(draws, [[0, 0, 200, 100]]);

      drawing.size = [50, 20];
      assert.strictEqual(drawing.canvasNode!.width, 50);
      assert.deepStrictEqual(draws[1], [0, 0, 50, 20]);
      assert.ok(drawing.getContext() === drawing.context);
    });

    it('should clear the canvas by default', function () {
      const canvas = new Canvas({ size: [10, 20] });
      canvas.init();
      assert.deepStrictEqual(calls, ['clearRect(0,0,10,20)']);
    });

    it('should draw rectangles, polygons and ellipses', function () {
      const canvas = new Canvas();
      canvas.init();
      canvas.drawRect(1, 2, 3, 4);
      assert.deepStrictEqual(calls, ['beginPath()', 'rect(1,2,3,4)', 'stroke()']);

      calls = [];
      canvas.polygon(0, 0, 10, 0, 10, 10);
      assert.deepStrictEqual(calls,
        ['beginPath()', 'moveTo(0,0)', 'lineTo(10,0)', 'lineTo(10,10)', 'closePath()', 'moveTo(0,0)', 'stroke()']);

      calls = [];
      canvas.drawRect(0, 0, 10, 10, 2);
      assert.deepStrictEqual(calls.slice(0, 3), ['beginPath()', 'moveTo(0,5)', 'arcTo(0,0,10,0,2)']);
      assert.strictEqual(calls.filter(call => call.startsWith('arcTo')).length, 4);

      calls = [];
      assert.ok(canvas.ellipse(5, 5, 4, 2) === canvas);
      assert.deepStrictEqual(calls, ['beginPath()', 'ellipse(5,5,4,2,0,0,6,false)', 'stroke()']);

      assert.throws(() => canvas.polygon(0, 0, 1, 1), /not enough arguments/);
    });

    it('should rotate the points', function () {
      const [x, y] = new Canvas().rotatePoint(1, 0, Math.PI / 2);
      assert.ok(Math.abs(x) < 1e-9 && Math.abs(y - 1) < 1e-9);
    });
  });

  describe('PopOver', function () {
    function makePopOver(options = {}) {
      const popOver = new PopOver({ size: [100, 50], ...options });
      popOver.init();
      document.body.appendChild(popOver.view!);
      return popOver;
    }

    it('should be hidden until shown', function () {
      const popOver = makePopOver();
      assert.strictEqual(popOver.visible, false);
      assert.strictEqual(popOver.view!.style.display, 'none');
    });

    it('should point at the point, below it', function () {
      const popOver = makePopOver();
      popOver.show([300, 100], PopOver.BELOW);
      assert.strictEqual(popOver.visible, true);
      assert.deepStrictEqual(popOver.position, [250, 115]);
      assert.strictEqual(popOver.view!.querySelector('.arrow')!.className, 'arrow top');
    });

    it('should stay in the window', function () {
      const popOver = makePopOver();
      popOver.show([10, 100], PopOver.ABOVE);
      assert.deepStrictEqual(popOver.position, [5, 35]);
      assert.strictEqual(popOver.view!.querySelector('.arrow')!.className, 'arrow bottom');
    });

    it('should point at the point, on its sides', function () {
      const popOver = makePopOver();
      popOver.show([300, 100], PopOver.RIGHT);
      assert.deepStrictEqual(popOver.position, [185, 75]);
      assert.strictEqual(popOver.view!.querySelector('.arrow')!.className, 'arrow right');
      popOver.hide();
      popOver.show([300, 100], PopOver.LEFT);
      assert.deepStrictEqual(popOver.position, [315, 75]);
    });

    it('should choose the direction according to the space', function () {
      const popOver = makePopOver();
      popOver.show([300, window.innerHeight - 10]);
      assert.strictEqual(popOver.view!.querySelector('.arrow')!.className, 'arrow bottom');
    });

    it('should be shown without point, with a callback', async function () {
      const popOver = makePopOver({ position: [1, 2] });
      let shown = 0;
      popOver.show(() => { shown++; });
      await later();
      assert.strictEqual(shown, 1);
      assert.deepStrictEqual(popOver.position, [1, 2]);
    });

    it('should be hidden when a pointer goes down outside', function () {
      const popOver = makePopOver();
      const outside = document.createElement('div');
      document.body.appendChild(outside);
      let outsideEvents = 0;
      outside.addEventListener('pointerdown', () => { outsideEvents++; });

      popOver.show([300, 100]);
      pointerDown(popOver.view!.querySelector('.center')!);
      assert.strictEqual(popOver.visible, true);
      pointerDown(outside);
      assert.strictEqual(popOver.visible, false);
      assert.strictEqual(outsideEvents, 0, 'the event is stopped');

      pointerDown(outside);
      assert.strictEqual(outsideEvents, 1, 'no more listening once hidden');
    });

    it('should display its header and footer', function () {
      const popOver = makePopOver({ hasHeader: true });
      assert.ok(popOver.hasClassName('withHeader'));
      popOver.hasFooter = true;
      popOver.hasHeader = false;
      assert.ok(popOver.hasClassName('withFooter'));
      assert.strictEqual(popOver.hasClassName('withHeader'), false);
    });

    it('should type check its show overloads (at compile time)', function () {
      const typeErrors = () => {
        const popOver = new PopOver();
        popOver.show();
        popOver.show(() => {});
        popOver.show([1, 2], PopOver.BELOW, () => {});
        // @ts-expect-error the direction is a number
        popOver.show([1, 2], 'below');
      };
      assert.ok(typeErrors);
    });
  });

  describe('SplitView', function () {
    function makeSplitView(options = {}) {
      const splitView = new SplitView(options);
      splitView.init();
      document.body.appendChild(splitView.view!);
      const second = new View();
      second.init();
      const main = new View();
      main.init();
      return { splitView, second, main };
    }

    function popOverOf(splitView: SplitView): PopOver {
      return (splitView as unknown as { popOver: PopOver }).popOver;
    }

    function panel(splitView: SplitView, name: string): Element {
      return splitView.view!.querySelector(`:scope > [x-hag-hole="${name}"]`)!;
    }

    it('should be a tablet split view, at the left, in the window orientation', function () {
      const { splitView } = makeSplitView();
      assert.strictEqual(splitView.mode, SplitView.TABLET_MODE);
      assert.strictEqual(splitView.secondPanelPosition, SplitView.LEFT);
      // happy-dom window: 1024 x 768
      assert.strictEqual(splitView.orientation, SplitView.HORIZONTAL);
      assert.ok(splitView.hasClassName('tablet'));
      assert.ok(splitView.hasClassName('horizontal'));
      assert.ok(splitView.hasClassName('left'));
      assert.ok(popOverOf(splitView).view!.parentElement === document.body);
    });

    it('should add the views to their panels', function () {
      const { splitView, second, main } = makeSplitView();
      splitView.add(second, 'second_panel');
      splitView.add(main);
      same(second.view!.parentElement, panel(splitView, 'second_panel'));
      same(main.view!.parentElement, panel(splitView, 'main_panel'));
    });

    it('should move the second view into the popover in the vertical orientation', function () {
      const log: string[] = [];
      const { splitView, second } = makeSplitView();
      const popOver = popOverOf(splitView);
      splitView.delegate = {
        willShowView: (view, pop) => { log.push('show'); same(view, second); same(pop, popOver); },
        willHideView: () => log.push('hide'),
      } satisfies SplitViewDelegate;
      splitView.add(second, 'second_panel');

      splitView.orientationWillChange(0);
      assert.strictEqual(splitView.orientation, SplitView.VERTICAL);
      assert.ok(popOver.isChild(second));
      assert.strictEqual(splitView.isChild(second), false);

      splitView.showPopOver([20, 20]);
      assert.strictEqual(popOver.visible, true);

      splitView.orientation = SplitView.HORIZONTAL;
      assert.strictEqual(popOver.visible, false);
      assert.ok(splitView.isChild(second));
      same(second.view!.parentElement, panel(splitView, 'second_panel'));
      assert.deepStrictEqual(log, ['hide', 'show']);
    });

    it('should keep the second view in its panel in mobile mode', function () {
      const { splitView, second } = makeSplitView({ orientation: SplitView.VERTICAL });
      splitView.add(second, 'second_panel');
      assert.ok(popOverOf(splitView).isChild(second));

      splitView.mode = SplitView.MOBILE_MODE;
      assert.ok(splitView.isChild(second));
      splitView.showPopOver([20, 20]);
      assert.strictEqual(popOverOf(splitView).visible, false);
    });

    it('should show and hide the main view in mobile mode, with its button', function () {
      const { splitView } = makeSplitView({ mode: SplitView.MOBILE_MODE });
      const button = new Button();
      button.init();
      splitView.hideMainPanelButton = button;

      splitView.showMainView();
      assert.ok(splitView.hasClassName('main_view_visible'));
      assert.strictEqual(button.visible, true);

      (button as unknown as { emit(event: 'select'): void }).emit('select');
      assert.strictEqual(splitView.hasClassName('main_view_visible'), false);
      assert.strictEqual(button.visible, false);
    });

    it('should remove the second views, also from the popover', function () {
      const { splitView, second, main } = makeSplitView({ orientation: SplitView.VERTICAL });
      splitView.add(second, 'second_panel');
      splitView.add(main);
      const removed = splitView.removeAllChildren();
      assert.strictEqual(removed!.length, 2);
      assert.strictEqual(popOverOf(splitView).isChild(second), false);
      assert.strictEqual(splitView.isChild(main), false);
    });

    it('should destroy its popover and the second views', function () {
      const { splitView, second } = makeSplitView({ orientation: SplitView.VERTICAL });
      splitView.add(second, 'second_panel');
      const popOverNode = popOverOf(splitView).view!;
      splitView.destroy();
      assert.strictEqual(popOverNode.parentElement, null);
      assert.strictEqual(second.view, null);
    });
  });
});
