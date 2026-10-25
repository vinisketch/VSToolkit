import assert from 'assert';

import '../../dom';
import '../../di_config';

import { DataFlow, Model, InOut } from 'vs_toolkit/vs_core';
import { ProgressBar, TextArea, InputField } from '../../../src/ui';

function type(node: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  node.value = text;
  node.dispatchEvent(new Event('input'));
}

function commit(node: HTMLInputElement | HTMLTextAreaElement): void {
  node.dispatchEvent(new Event('change'));
}

function pointerDown(node: EventTarget): void {
  node.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, isPrimary: true, bubbles: true }));
}

describe('input components', function () {
  afterEach(function () {
    document.body.innerHTML = '';
  });

  describe('ProgressBar', function () {
    function barWidth(bar: ProgressBar): string {
      return (bar.view!.firstElementChild as HTMLElement).style.width;
    }

    it('should show its index in its range', function () {
      const bar = new ProgressBar({ index: 25 });
      bar.init();
      assert.ok(bar.view!.classList.contains('vs_ui_progressbar'));
      assert.strictEqual(barWidth(bar), '25%');

      bar.range = [0, 50];
      assert.strictEqual(barWidth(bar), '50%');
      bar.index = 10;
      assert.strictEqual(barWidth(bar), '20%');
    });

    it('should keep the bar in the view', function () {
      const bar = new ProgressBar({ range: [10, 20], index: 30 });
      bar.init();
      assert.strictEqual(bar.index, 30);
      assert.strictEqual(barWidth(bar), '100%');
      bar.index = 0;
      assert.strictEqual(barWidth(bar), '0%');
    });

    it('should ignore the invalid values', function () {
      const bar = new ProgressBar();
      bar.init();
      bar.range = [10, 10];
      bar.range = [20, 10];
      bar.range = [1] as number[];
      bar.index = 'a' as unknown as number;
      assert.deepStrictEqual(bar.range, [0, 100]);
      assert.strictEqual(bar.index, 0);

      const range = bar.range;
      range[1] = 1;
      assert.deepStrictEqual(bar.range, [0, 100]);
    });

    it('should toggle the indeterminate class name', function () {
      const bar = new ProgressBar({ indeterminate: true });
      bar.init();
      assert.ok(bar.hasClassName('indeterminate'));
      bar.indeterminate = false;
      assert.strictEqual(bar.hasClassName('indeterminate'), false);
    });

    it('should notify its index', function () {
      const bar = new ProgressBar();
      bar.init();
      const changes: string[][] = [];
      bar.on('change', (_bar, properties) => changes.push(properties));
      bar.index = 5;
      bar.index = 5;
      assert.deepStrictEqual(changes, [['index']]);
    });
  });

  describe('TextArea', function () {
    it('should display its value', function () {
      const area = new TextArea({ value: 'Hello' });
      area.init();
      assert.strictEqual(area.view!.tagName, 'TEXTAREA');
      assert.strictEqual(area.view!.value, 'Hello');
      area.value = 12 as unknown as string;
      assert.strictEqual(area.view!.value, '12');
      assert.strictEqual(area.value, '12');
    });

    it('should notify the value typed by the user, and emit input then commit', function () {
      const area = new TextArea();
      area.init();
      const log: string[] = [];
      area.on('change:value', () => log.push(`change:${area.value}`));
      area.on('input', (_area, value) => log.push(`input:${value}`));
      area.on('commit', (_area, value) => log.push(`commit:${value}`));

      type(area.view!, 'ab');
      commit(area.view!);
      assert.deepStrictEqual(log, ['change:ab', 'input:ab', 'commit:ab']);
    });

    it('should propagate the typed value to a model', function () {
      class Target extends Model { @InOut accessor text = ''; }
      const target = new Target();
      const area = new TextArea();
      area.init();
      new DataFlow().from(area.$.value).to(target.$.text);

      type(area.view!, 'typed');
      assert.strictEqual(target.text, 'typed');
    });

    it('should lose the focus when a pointer goes down outside', function () {
      const area = new TextArea();
      area.init();
      document.body.appendChild(area.view!);
      const log: string[] = [];
      area.on('focus', () => log.push('focus'));
      area.on('blur', () => log.push('blur'));

      area.setFocus();
      assert.ok(document.activeElement === area.view);
      pointerDown(area.view!);
      assert.ok(document.activeElement === area.view);
      pointerDown(document.body);
      assert.strictEqual(document.activeElement === area.view, false);
      assert.deepStrictEqual(log, ['focus', 'blur']);
    });

    it('should be disabled with the view', function () {
      const area = new TextArea({ enable: false });
      area.init();
      assert.strictEqual(area.view!.disabled, true);
      area.enable = true;
      assert.strictEqual(area.view!.disabled, false);
    });

    it('should stop listening once destroyed', function () {
      const area = new TextArea();
      area.init();
      const node = area.view!;
      let inputs = 0;
      area.on('input', () => { inputs++; });
      area.destroy();
      type(node, 'x');
      assert.strictEqual(inputs, 0);
    });
  });

  describe('InputField', function () {
    function makeInput(options = {}) {
      const input = new InputField(options);
      input.init();
      document.body.appendChild(input.view!);
      const textField = input.view!.querySelector('input')!;
      const clearButton = input.view!.querySelector<HTMLElement>('.clear_button')!;
      return { input, textField, clearButton };
    }

    it('should set its value, type and placeholder', function () {
      const { input, textField } = makeInput({ value: 'v', type: InputField.PASSWORD, placeholder: 'secret' });
      assert.strictEqual(textField.value, 'v');
      assert.strictEqual(textField.getAttribute('type'), 'password');
      assert.ok(input.hasClassName('password'));
      assert.strictEqual(textField.getAttribute('placeholder'), 'secret');
      assert.strictEqual(textField.name, input.id);

      input.type = InputField.SEARCH;
      assert.strictEqual(textField.getAttribute('type'), 'search');
      assert.strictEqual(input.hasClassName('password'), false);
      assert.ok(input.hasClassName('search'));

      input.type = 'other' as 'text';
      assert.strictEqual(input.type, 'search');
    });

    it('should notify the value typed by the user, and emit input then commit', function () {
      const { input, textField } = makeInput();
      const log: string[] = [];
      input.on('change:value', () => log.push(`change:${input.value}`));
      input.on('input', (_input, value) => log.push(`input:${value}`));
      input.on('commit', (_input, value) => log.push(`commit:${value}`));

      type(textField, 'abc');
      commit(textField);
      assert.deepStrictEqual(log, ['change:abc', 'input:abc', 'commit:abc']);
    });

    it('should show the clear button while focused with a text', function () {
      const { input, textField, clearButton } = makeInput({ value: 'text' });
      assert.strictEqual(clearButton.style.visibility, 'hidden');

      input.setFocus();
      assert.ok(input.hasClassName('focus'));
      assert.strictEqual(clearButton.style.visibility, 'visible');
      type(textField, '');
      assert.strictEqual(clearButton.style.visibility, 'hidden');
      type(textField, 'a');
      assert.strictEqual(clearButton.style.visibility, 'visible');

      input.setBlur();
      assert.strictEqual(input.hasClassName('focus'), false);
      assert.strictEqual(clearButton.style.visibility, 'hidden');
    });

    it('should clear the text with the clear button, keeping the focus', function () {
      const { input, textField, clearButton } = makeInput({ value: 'text' });
      const log: string[] = [];
      input.on('input', (_input, value) => log.push(`input:${value}`));
      input.on('commit', (_input, value) => log.push(`commit:${value}`));

      input.setFocus();
      pointerDown(clearButton);
      assert.strictEqual(textField.value, '');
      assert.strictEqual(input.value, '');
      assert.deepStrictEqual(log, ['input:', 'commit:']);
      assert.ok(document.activeElement === textField);
    });

    it('should lose the focus when a pointer goes down outside', function () {
      const { input, textField } = makeInput();
      input.setFocus();
      assert.ok(document.activeElement === textField);
      pointerDown(document.body);
      assert.strictEqual(document.activeElement === textField, false);
    });

    it('should disable its input', function () {
      const { input, textField } = makeInput({ enable: false });
      assert.strictEqual(textField.disabled, true);
      input.enable = true;
      assert.strictEqual(textField.disabled, false);
    });

    it('should stop listening once destroyed', function () {
      const { input, textField, clearButton } = makeInput();
      let events = 0;
      input.on('input', () => { events++; });
      input.destroy();
      type(textField, 'x');
      pointerDown(clearButton);
      assert.strictEqual(events, 0);
    });

    it('should type check its events (at compile time)', function () {
      const typeErrors = () => {
        const input = new InputField();
        // @ts-expect-error the 'continuous_change' event was renamed 'input'
        input.on('continuous_change', () => {});
        // @ts-expect-error the value of a commit is a string
        input.on('commit', (_input, value: number) => value);
        // @ts-expect-error an InputField type is 'text', 'password' or 'search'
        input.type = 'number';
      };
      assert.ok(typeErrors);
    });
  });
});
