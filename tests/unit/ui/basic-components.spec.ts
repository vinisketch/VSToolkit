import assert from 'assert';

import '../../dom';
import '../../di_config';

import { DataFlow, Model, InOut } from 'vs_toolkit/vs_core';
import { TextLabel, ImageView, Button, MULTI_TAP_DELAY } from '../../../src/ui';

async function later(ms = 5): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function tap(node: HTMLElement): void {
  node.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, isPrimary: true, bubbles: true }));
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, isPrimary: true }));
}

describe('basic components', function () {
  afterEach(function () {
    document.body.innerHTML = '';
  });

  describe('TextLabel', function () {
    it('should display its text', function () {
      const label = new TextLabel({ text: 'Hello' });
      label.init();
      assert.strictEqual(label.view!.className, 'vs_ui_textlabel');
      assert.strictEqual(label.view!.textContent, 'Hello');

      label.text = 'World';
      assert.strictEqual(label.view!.textContent, 'World');
    });

    it('should convert the values to text', function () {
      const label = new TextLabel();
      label.init();
      label.text = 42 as unknown as string;
      assert.strictEqual(label.text, '42');
      label.text = null as unknown as string;
      assert.strictEqual(label.text, '');
      label.text = { toString: () => 'object' } as unknown as string;
      assert.strictEqual(label.text, 'object');
    });

    it('should keep a text set before the initialization', function () {
      const label = new TextLabel();
      label.text = 'early';
      label.init();
      assert.strictEqual(label.view!.textContent, 'early');
    });

    it('should be connected to a model', function () {
      class Source extends Model { @InOut accessor title = ''; }
      const source = new Source();
      const label = new TextLabel();
      label.init();
      new DataFlow().from(source.$.title).to(label.$.text);

      source.title = 'from the model';
      assert.strictEqual(label.view!.textContent, 'from the model');
    });
  });

  describe('ImageView', function () {
    it('should display its image', function () {
      const image = new ImageView({ src: 'logo.png' });
      image.init();
      assert.strictEqual(image.view!.tagName, 'IMG');
      assert.strictEqual(image.src, 'logo.png');
      assert.match(image.view!.src, /logo\.png$/);
      assert.strictEqual(image.view!.getAttribute('width'), '100%');
    });

    it('should keep the src of its node', function () {
      const node = document.createElement('img');
      node.setAttribute('src', 'images/existing.png');
      const image = new ImageView({ node });
      image.init();
      assert.strictEqual(image.src, 'images/existing.png');
    });

    it('should set its size and the image size', function () {
      const image = new ImageView({ size: [64, 32] });
      image.init();
      assert.deepStrictEqual(image.size, [64, 32]);
      assert.strictEqual(image.view!.getAttribute('width'), '64');
      assert.strictEqual(image.view!.style.width, '64px');
    });

    it('should notify its size change once', function () {
      const image = new ImageView();
      image.init();
      const changes: string[][] = [];
      image.on('change', (_image, properties) => changes.push(properties));

      image.size = [10, 10];
      assert.deepStrictEqual(changes, [['size']]);
    });

    it('should free its image when destroyed', function () {
      const image = new ImageView({ src: 'logo.png' });
      image.init();
      const node = image.view!;
      image.destroy();
      assert.match(node.src, /^data:image\/gif/);
    });
  });

  describe('Button', function () {
    it('should display its text, style and type', function () {
      const button = new Button({ text: 'OK', style: Button.BLUE_STYLE });
      button.init();
      assert.ok(button.view!.classList.contains('vs_ui_button'));
      assert.strictEqual(button.view!.firstElementChild!.textContent, 'OK');
      assert.ok(button.hasClassName('blue_style'));
      assert.strictEqual(button.hasClassName(Button.DEFAULT_STYLE), false);
      assert.ok(button.hasClassName(Button.DEFAULT_TYPE));
    });

    it('should convert its text, displayed as text', function () {
      const button = new Button();
      button.init();
      const textView = button.view!.firstElementChild!;
      const values: [unknown, string][] = [
        ['hello', 'hello'], [10, '10'], [10.45, '10.45'], [true, 'true'], [false, 'false'],
        [null, ''], [undefined, ''], ['<b>hello</b>', '<b>hello</b>'],
      ];
      for (const [value, text] of values) {
        button.text = value as string;
        assert.strictEqual(button.text, text);
        assert.strictEqual(textView.textContent, text);
      }
      assert.strictEqual(textView.querySelector('b'), null, 'the HTML is not parsed');
    });

    it('should set each style and type', function () {
      const button = new Button({ style: Button.BLACK_STYLE });
      button.init();
      for (const style of [Button.BLACK_STYLE, Button.BLUE_STYLE, Button.DEFAULT_STYLE, Button.GREEN_STYLE,
        Button.GREY_STYLE, Button.RED_STYLE, Button.SILVER_STYLE]) {
        button.style = style;
        assert.strictEqual(button.style, style);
        assert.ok(button.hasClassName(style));
      }
      assert.ok(button.hasClassName(Button.DEFAULT_TYPE));
      for (const type of [Button.NAVIGATION_BACK_TYPE, Button.NAVIGATION_FORWARD_TYPE, Button.NAVIGATION_TYPE]) {
        button.type = type;
        assert.strictEqual(button.type, type);
        assert.ok(button.hasClassName(type));
      }
      assert.strictEqual(button.hasClassName(Button.DEFAULT_TYPE), false);
    });

    it('should replace its style and type class names', function () {
      const button = new Button();
      button.init();
      button.style = 'red_ios';
      button.type = Button.NAVIGATION_TYPE;
      assert.strictEqual(button.style, 'red');
      assert.ok(button.hasClassName('red'));
      assert.strictEqual(button.hasClassName(Button.DEFAULT_TYPE), false);
      assert.ok(button.hasClassName('nav'));
    });

    it('should emit select when tapped, pressed meanwhile', async function () {
      const button = new Button({ text: 'OK' });
      button.init();
      let selected = 0;
      button.on('select', (b) => { if (b === button) selected++; });

      button.view!.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, isPrimary: true, bubbles: true }));
      assert.ok(button.hasClassName('pressed'));
      assert.strictEqual(button.selected, true);
      document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, isPrimary: true }));
      assert.strictEqual(button.hasClassName('pressed'), false);

      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(selected, 1);
    });

    it('should not emit select when disabled', async function () {
      const button = new Button();
      button.init();
      let selected = 0;
      button.on('select', () => { selected++; });

      button.enable = false;
      tap(button.view!);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(selected, 0);
    });

    it('should stop listening once destroyed', async function () {
      const button = new Button();
      button.init();
      const node = button.view!;
      let selected = 0;
      button.on('select', () => { selected++; });

      button.destroy();
      tap(node);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(selected, 0);
    });

    it('should type check its events (at compile time)', function () {
      const typeErrors = () => {
        const button = new Button();
        // @ts-expect-error a Button has no 'unknown' event
        button.on('unknown', () => {});
        // @ts-expect-error the select listener gets no argument after the button
        button.on('select', (_button, extra: number) => extra);
      };
      assert.ok(typeErrors);
    });
  });
});
