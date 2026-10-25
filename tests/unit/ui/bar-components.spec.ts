import assert from 'assert';

import '../../dom';
import '../../di_config';

import {
  NavigationBar, ToolBar, ToolBarButton, ToolBarText, Application, ScrollView, SplitView, View, Button,
  MULTI_TAP_DELAY,
} from '../../../src/ui';

/** identity comparison (a failing deepStrictEqual on DOM objects hangs) */
function same(actual: unknown, expected: unknown, message?: string): void {
  assert.ok(actual === expected, message ?? 'not the same object');
}

async function later(ms = 5): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function pointer(type: string, target: EventTarget, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { pointerId: 1, isPrimary: true, bubbles: true, ...init }));
}

async function tap(node: HTMLElement): Promise<void> {
  pointer('pointerdown', node);
  pointer('pointerup', document);
  await later(MULTI_TAP_DELAY + 10);
}

function makeView(): View {
  const view = new View();
  view.init();
  return view;
}

describe('bar components', function () {
  afterEach(function () {
    Application.stop();
    document.body.innerHTML = '';
    document.body.removeAttribute('id');
    document.body.removeAttribute('style');
  });

  describe('NavigationBar', function () {
    it('should have its style, and be added to the top bar of a scroll view', function () {
      const bar = new NavigationBar({ style: NavigationBar.BLACK_STYLE });
      bar.init();
      assert.ok(bar.hasClassName('black_style'));
      assert.strictEqual(bar.hasClassName(NavigationBar.DEFAULT_STYLE), false);

      const scrollView = new ScrollView();
      scrollView.init();
      scrollView.add(bar);
      same(bar.view!.parentElement, scrollView.view!.querySelector('[x-hag-hole="top_bar"]'));
    });

    it('should show the children of the current state', function () {
      const bar = new NavigationBar();
      bar.init();
      const title = makeView(), edit = makeView(), back = makeView();
      bar.setStateItems('list', [title, edit]);
      bar.setStateItems('detail', [back, title]);
      assert.ok(bar.isChild(back));

      bar.changeState('list');
      assert.strictEqual(bar.currentState, 'list');
      assert.deepStrictEqual([title.visible, edit.visible, back.visible], [true, true, false]);
      bar.changeState('detail');
      assert.deepStrictEqual([title.visible, edit.visible, back.visible], [true, false, true]);

      const done = makeView();
      bar.setStateItems('detail', [done]);
      assert.deepStrictEqual([title.visible, back.visible, done.visible], [false, false, true]);
      assert.strictEqual(bar.getStateItems('detail')!.length, 1);
      assert.strictEqual(bar.getStateItems('unknown'), undefined);
    });

    it('should configure the children of a state', function () {
      const bar = new NavigationBar();
      bar.init();
      const button = new Button({ id: 'back' });
      button.init();
      bar.setStateItems('detail', [button]);
      bar.changeState('detail', { back: { text: 'Back' } });
      assert.strictEqual(button.text, 'Back');
    });

    it('should remove a child from its states', function () {
      const bar = new NavigationBar();
      bar.init();
      const title = makeView();
      bar.setStateItems('list', [title]);
      bar.remove(title);
      assert.deepStrictEqual(bar.getStateItems('list'), []);
    });

    it('should slide up when hidden', function () {
      const bar = new NavigationBar();
      bar.init();
      assert.ok(bar.hideAnimation);
      assert.deepStrictEqual(bar.hideAnimation!.properties, ['translateY']);
    });
  });

  describe('ToolBar', function () {
    // the ids of the buttons are global: the bars are destroyed
    const bars: ToolBar[] = [];
    afterEach(function () {
      bars.splice(0).forEach(bar => bar.destroy());
    });

    function makeBar(options = {}): ToolBar {
      const bar = new ToolBar(options);
      bar.init();
      bars.push(bar);
      return bar;
    }

    function itemNode(bar: ToolBar, id: string): HTMLElement {
      return bar.getItem(id)!.view!;
    }

    it('should create its buttons, and be added to the bottom bar of a scroll view', function () {
      const bar = makeBar();
      const button = bar.addButton('add', ToolBar.BUTTON_ADD, 'Add')!;
      assert.ok(button instanceof ToolBarButton);
      assert.strictEqual(bar.addButton('add', ToolBar.BUTTON_ADD), undefined);
      assert.ok(button.hasClassName('vs_ui_toolbar_button'));
      assert.ok(button.hasClassName('add'));
      assert.strictEqual(button.view!.textContent, 'Add');
      assert.ok(bar.hasClassName(ToolBar.DEFAULT_STYLE));
      assert.ok(ToolBar.Button === ToolBarButton && ToolBar.Text === ToolBarText);

      const scrollView = new ScrollView();
      scrollView.init();
      scrollView.add(bar);
      same(bar.view!.parentElement, scrollView.view!.querySelector('[x-hag-hole="bottom_bar"]'));
    });

    it('should select the tapped item, active meanwhile', async function () {
      const bar = makeBar({ configuration: [['a', ToolBar.BUTTON_ADD], ['b', ToolBar.BUTTON_CANCEL, 'Cancel']] });
      const selections: string[] = [];
      bar.on('itemselect', (_bar, id) => selections.push(id));

      pointer('pointerdown', itemNode(bar, 'b'));
      assert.ok(bar.getItem('b')!.hasClassName('active'));
      pointer('pointerup', document);
      assert.strictEqual(bar.getItem('b')!.hasClassName('active'), false);
      await later(MULTI_TAP_DELAY + 10);
      assert.deepStrictEqual(selections, ['b']);
      assert.strictEqual(bar.selectedId, 'b');
      assert.ok(bar.getItem('b')!.hasClassName('select'));

      // the selected toggle button
      await tap(itemNode(bar, 'b'));
      assert.deepStrictEqual(selections, ['b']);

      await tap(itemNode(bar, 'a'));
      assert.deepStrictEqual(selections, ['b', 'a']);
      assert.strictEqual(bar.getItem('b')!.hasClassName('select'), false);
    });

    it('should not keep the selection of momentary buttons', async function () {
      const bar = makeBar({ isToggleButtons: false, configuration: [['a', ToolBar.BUTTON_ADD]] });
      const selections: string[] = [];
      bar.on('itemselect', (_bar, id) => selections.push(id));
      await tap(itemNode(bar, 'a'));
      await tap(itemNode(bar, 'a'));
      assert.deepStrictEqual(selections, ['a', 'a']);
      assert.strictEqual(bar.getItem('a')!.hasClassName('select'), false);
    });

    it('should replace its configuration, destroying its former buttons', function () {
      const bar = makeBar({ configuration: [['a', ToolBar.BUTTON_ADD]] });
      const text = new ToolBarText({ id: 'info', text: 'Info' });
      text.init();
      bar.addItem(text);
      assert.strictEqual(text.view!.querySelector('.text_view')!.textContent, 'Info');
      const former = bar.getItem('a')!;

      bar.configuration = [['b', ToolBar.BUTTON_SAVE, 'Save']];
      assert.strictEqual(former.view, null, 'the created button is destroyed');
      assert.ok(text.view, 'the added item is only removed');
      assert.strictEqual(bar.getItem('info'), undefined);
      assert.deepStrictEqual(bar.configuration, [['b', 'save', 'Save']]);
    });

    it('should provide the button icons', function () {
      assert.strictEqual(ToolBar.BUTTON_ZOOM_OUT, 'zoom_out');
      assert.strictEqual(ToolBar.BUTTON_WALLET, 'wallet');
      assert.strictEqual(ToolBar.BUTTON_DOWNLOAD, 'download');
    });
  });

  describe('Application', function () {
    it('should be the body of the page by default, or of an html node', function () {
      const app = new Application({ id: 'app' });
      app.init();
      same(app.view, document.body);
      assert.strictEqual(document.body.id, 'app');
      same(View.componentOf(document.body), app);
      app.destroy();

      const html = document.createElement('html');
      html.appendChild(document.createElement('body'));
      const other = new Application({ node: html });
      other.init();
      same(other.view, html.querySelector('body'));
    });

    it('should start and stop the applications', function () {
      const started: string[] = [];
      class MyApplication extends Application {
        override applicationStarted(): void { started.push(this.id); }
      }
      const app = new MyApplication({ id: 'my_app', node: document.createElement('div') });
      app.init();
      assert.ok(Application.getApplications().includes(app));
      Application.start();
      assert.deepStrictEqual(started, ['my_app']);

      Application.stop();
      assert.strictEqual(app.view, null);
      assert.deepStrictEqual(Application.getApplications(), []);
    });

    it('should notify the orientation changes to its views', function () {
      const app = new Application({ node: document.createElement('div') });
      app.init();
      const splitView = new SplitView({ orientation: SplitView.VERTICAL });
      splitView.init();
      const panel = makeView();
      app.add(panel);
      panel.add(splitView);

      const changes: number[] = [];
      app.on('orientationchange', (_app, orientation) => changes.push(orientation));
      const width = window.innerWidth, height = window.innerHeight;
      const resize = (w: number, h: number) => {
        Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: h, configurable: true });
        window.dispatchEvent(new Event('resize'));
      };
      try {
        resize(400, 800);
        assert.deepStrictEqual(changes, [0]);
        assert.strictEqual(app.orientation, 0);
        assert.strictEqual(splitView.orientation, SplitView.VERTICAL);

        resize(800, 400);
        assert.deepStrictEqual(changes, [0, 90]);
        assert.strictEqual(splitView.orientation, SplitView.HORIZONTAL, 'the split view follows');
        resize(900, 400);
        assert.deepStrictEqual(changes, [0, 90], 'not a new orientation');
      } finally {
        resize(width, height);
      }
    });

    it('should size and position its node in px', function () {
      const app = new Application({ node: document.createElement('div'), size: [320, 480], position: [0, 10] });
      app.init();
      const style = app.view!.style;
      assert.deepStrictEqual([style.width, style.height, style.left, style.top], ['320px', '480px', '0px', '10px']);
    });

    it('should load scripts and style sheets', async function () {
      const app = new Application({ node: document.createElement('div') });
      app.init();
      const loaded: string[] = [];
      app.on('cssloaded', (_app, path) => loaded.push(path));

      // the elements are not loaded by happy-dom
      const appended: HTMLElement[] = [];
      const appendChild = document.head.appendChild;
      document.head.appendChild = (<T extends Node>(node: T): T => { appended.push(node as unknown as HTMLElement); return node; });
      try {
        const loading = app.loadCSS('theme.css');
        const link = appended[0] as HTMLLinkElement;
        assert.strictEqual(link.rel, 'stylesheet');
        assert.match(link.href, /theme\.css$/);
        link.dispatchEvent(new Event('load'));
        await loading;
        assert.deepStrictEqual(loaded, ['theme.css']);

        const failing = app.loadScript('missing.js');
        appended[1].dispatchEvent(new Event('error'));
        await assert.rejects(failing, /missing\.js/);
      } finally {
        document.head.appendChild = appendChild;
      }
    });

    it('should type check its events (at compile time)', function () {
      const typeErrors = () => {
        class MyApplication extends Application<{ ready: [] }> {}
        const app = new MyApplication();
        app.on('ready', () => {});
        app.on('orientationchange', (_app, orientation: number) => orientation);
        // @ts-expect-error an application has no 'unknown' event
        app.on('unknown', () => {});
      };
      assert.ok(typeErrors);
    });
  });
});
