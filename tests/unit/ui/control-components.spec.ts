import assert from 'assert';

import '../../dom';
import '../../di_config';

import { Switch, Slider, Picker, MULTI_TAP_DELAY, CSS_ANDROID, CSS_PURE } from '../../../src/ui';

async function later(ms = 5): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function pointer(type: string, target: EventTarget, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { pointerId: 1, isPrimary: true, bubbles: true, ...init }));
}

function tap(node: HTMLElement): void {
  pointer('pointerdown', node);
  pointer('pointerup', document);
}

/** the theme of the page (see theme.ts) */
function useTheme(code: number): void {
  const style = document.createElement('style');
  style.textContent = `.device_test { margin-top: ${code}px; }`;
  document.head.appendChild(style);
}

/** a layout (happy-dom does not lay out) */
function layout(node: HTMLElement, sizes: Partial<Record<'offsetWidth' | 'offsetHeight' | 'clientHeight', number>>): void {
  for (const [name, value] of Object.entries(sizes)) {
    Object.defineProperty(node, name, { value, configurable: true });
  }
}

describe('control components', function () {
  afterEach(function () {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('Switch', function () {
    function switchView(toggle: Switch): HTMLElement {
      return toggle.view!.querySelector('.switch')!;
    }

    it('should be on by default, with its texts', function () {
      const toggle = new Switch();
      toggle.textOn = 'I';
      toggle.init();
      toggle.textOff = 'O';
      assert.strictEqual(toggle.toggled, true);
      assert.ok(toggle.hasClassName('on'));
      assert.strictEqual(toggle.view!.querySelector('.toggle_on')!.textContent, 'I');
      assert.strictEqual(toggle.view!.querySelector('.toggle_off')!.textContent, 'O');
    });

    it('should toggle when tapped', async function () {
      const toggle = new Switch();
      toggle.init();
      const log: string[] = [];
      toggle.on('change:toggled', () => log.push(`change:${toggle.toggled}`));
      toggle.on('toggle', (_toggle, toggled) => log.push(`toggle:${toggled}`));

      pointer('pointerdown', toggle.view!);
      assert.ok(toggle.hasClassName('pressed'));
      assert.strictEqual(toggle.selected, true);
      pointer('pointerup', document);
      assert.strictEqual(toggle.hasClassName('pressed'), false);
      await later(MULTI_TAP_DELAY + 10);

      assert.deepStrictEqual(log, ['change:false', 'toggle:false']);
      assert.strictEqual(toggle.hasClassName('on'), false);
      assert.strictEqual(switchView(toggle).style.transform, 'translate3d(0px,0,0)');
    });

    it('should not toggle when disabled', async function () {
      const toggle = new Switch({ enable: false });
      toggle.init();
      tap(toggle.view!);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(toggle.toggled, true);
    });

    it('should move the switch according to its layout', function () {
      const toggle = new Switch({ toggled: false });
      toggle.init();
      layout(toggle.view!, { offsetWidth: 80 });
      layout(switchView(toggle), { offsetWidth: 30 });
      toggle.toggled = true;
      assert.strictEqual(switchView(toggle).style.transform, 'translate3d(50px,0,0)');
    });

    it('should move the switch according to the theme', function () {
      useTheme(CSS_PURE);
      const pure = new Switch();
      pure.init();
      assert.strictEqual(switchView(pure).style.transform, 'translate3d(-15px,0,0)');

      document.head.innerHTML = '';
      useTheme(CSS_ANDROID);
      const android = new Switch();
      android.init();
      layout(android.view!, { offsetWidth: 80 });
      android.refresh();
      assert.strictEqual(switchView(android).style.transform, 'translate3d(0px,0,0)');
    });

    it('should leave its height to the theme', function () {
      const toggle = new Switch({ size: [80, 30] });
      toggle.init();
      assert.strictEqual(toggle.view!.style.width, '80px');
      assert.strictEqual(toggle.view!.style.height, '');
    });

    it('should stop listening once destroyed', async function () {
      const toggle = new Switch();
      toggle.init();
      const node = toggle.view!;
      let toggles = 0;
      toggle.on('toggle', () => { toggles++; });
      toggle.destroy();
      tap(node);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(toggles, 0);
    });
  });

  describe('Slider', function () {
    function makeSlider(options = {}) {
      const slider = new Slider(options);
      slider.init();
      layout(slider.view!, { offsetWidth: 200, offsetHeight: 100 });
      return slider;
    }

    it('should keep its value in its range', function () {
      const slider = makeSlider({ value: 150 });
      assert.strictEqual(slider.value, 100);
      slider.value = -5;
      assert.strictEqual(slider.value, 0);
      slider.value = NaN;
      assert.strictEqual(slider.value, 0);

      slider.value = 50;
      slider.range = [0, 20];
      assert.strictEqual(slider.value, 20);
      slider.range = [5, 5];
      assert.deepStrictEqual(slider.range, [0, 20]);
    });

    it('should place the handle at the value', function () {
      const slider = makeSlider();
      slider.value = 50;
      // 50% of 200px, minus half the handle (23px); centered on the track
      assert.strictEqual(slider.view!.querySelector<HTMLElement>('.handle')!.style.transform,
        'translate3d(88.5px,-6.5px,0)');
      assert.strictEqual(slider.view!.style.backgroundSize, '100px 10px');

      slider.orientation = Slider.VERTICAL;
      assert.ok(slider.hasClassName('vertical'));
      assert.strictEqual(slider.hasClassName('horizontal'), false);
      assert.strictEqual(slider.view!.querySelector<HTMLElement>('.handle')!.style.transform,
        'translate3d(-6.5px,38.5px,0)');
    });

    it('should follow the pointer, then commit', function () {
      const slider = makeSlider();
      const log: string[] = [];
      slider.on('change:value', () => log.push(`change:${slider.value}`));
      slider.on('input', (_slider, value) => log.push(`input:${value}`));
      slider.on('commit', (_slider, value) => log.push(`commit:${value}`));

      pointer('pointerdown', slider.view!, { clientX: 50 });
      pointer('pointermove', document, { clientX: 150 });
      pointer('pointerup', document, { clientX: 150 });
      assert.deepStrictEqual(log, ['change:25', 'input:25', 'change:75', 'input:75', 'commit:75']);
    });

    it('should follow the pointer vertically', function () {
      const slider = makeSlider({ orientation: Slider.VERTICAL, range: [0, 10] });
      pointer('pointerdown', slider.view!, { clientY: 30 });
      assert.strictEqual(slider.value, 3);
      pointer('pointerup', document);
    });

    it('should stop listening once destroyed', function () {
      const slider = makeSlider();
      const node = slider.view!;
      slider.destroy();
      pointer('pointerdown', node, { clientX: 50 });
      pointer('pointerup', document);
      assert.strictEqual(slider.value, 0);
    });
  });

  describe('Picker', function () {
    const SIZES = { s: 'Small', m: 'Medium', l: 'Large' };

    function makePicker() {
      const picker = new Picker();
      picker.init();
      document.body.appendChild(picker.view!);
      return picker;
    }

    function items(picker: Picker, slot: number): HTMLElement[] {
      return [...picker.view!.querySelectorAll<HTMLElement>('.slots > div')[slot].querySelectorAll('li')];
    }

    function drag(target: HTMLElement, from: number, to: number): void {
      pointer('pointerdown', target, { clientY: from });
      pointer('pointermove', document, { clientY: to });
      pointer('pointerup', document, { clientY: to });
    }

    it('should display its slots, the first rows selected', function () {
      const picker = makePicker();
      picker.addSlot(Picker.NUMBERS, 'right');
      picker.addSlot(SIZES, 'shrink');
      assert.deepStrictEqual(items(picker, 1).map(item => item.textContent), ['Small', 'Medium', 'Large']);
      assert.strictEqual(picker.view!.querySelectorAll('.slots > div')[1].className, 'shrink');
      assert.deepStrictEqual(picker.getSelectedValues(), { keys: ['0', 's'], values: [0, 'Small'] });
    });

    it('should select the default and given keys', function () {
      const picker = makePicker();
      picker.data = [{ values: Picker.NUMBERS, defaultValue: 4 }, { values: SIZES }, { style: 'none' } as never];
      assert.strictEqual(picker.data.length, 2);
      assert.deepStrictEqual(picker.selectedKeys, ['4', 's']);

      picker.selectedKeys = ['7', 'l'];
      assert.deepStrictEqual(picker.selectedKeys, ['7', 'l']);
      assert.deepStrictEqual(picker.selectedValues, [7, 'Large']);
      assert.strictEqual(picker.scrollToValue(1, 'xl'), false);
      assert.strictEqual(picker.scrollToValue(5, 's'), false);
    });

    it('should select the row of a short drag', function () {
      const picker = makePicker();
      picker.addSlot(Picker.NUMBERS);
      const log: string[][] = [];
      picker.on('select', (_picker, { keys }) => log.push(keys));
      let delegated = 0;
      picker.delegate = { pickerViewSelectRow: (p) => { if (p === picker) delegated++; } };

      drag(items(picker, 0)[0], 100, 75);
      assert.deepStrictEqual(log, [['1']]);
      assert.strictEqual(delegated, 1);
      assert.strictEqual(picker.view!.querySelector('ul')!.style.transform, 'translate3d(0,-44px,0)');
    });

    it('should throw a slot to its last row', function () {
      const picker = makePicker();
      picker.addSlot(Picker.NUMBERS);
      drag(items(picker, 0)[0], 300, 200);
      assert.deepStrictEqual(picker.selectedKeys, ['9']);
    });

    it('should go back within the boundaries at the end of the transition', function () {
      const picker = makePicker();
      layout(picker.view!, { clientHeight: 400 });
      picker.addSlot(Picker.NUMBERS, '', 9);
      const log: string[][] = [];
      picker.on('select', (_picker, { keys }) => log.push(keys));

      drag(items(picker, 0)[9], 100, 200);
      const list = picker.view!.querySelector('ul')!;
      assert.strictEqual(list.style.transform, 'translate3d(0,100px,0)', 'beyond the top');
      assert.deepStrictEqual(log, []);

      list.dispatchEvent(new Event('transitionend'));
      assert.strictEqual(list.style.transform, 'translate3d(0,0px,0)');
      assert.deepStrictEqual(log, [['0']]);
    });

    it('should not scroll a readonly slot', function () {
      const picker = makePicker();
      picker.addSlot({ separator: ',' }, 'readonly');
      picker.addSlot(Picker.NUMBERS);
      let selections = 0;
      picker.on('select', () => { selections++; });
      drag(items(picker, 0)[0], 100, 75);
      assert.strictEqual(selections, 0);
    });

    it('should select with the buttons of the Android theme', function () {
      useTheme(CSS_ANDROID);
      const picker = makePicker();
      picker.addSlot(SIZES);
      assert.strictEqual(picker.view!.querySelector('.frame'), null);
      const incr = picker.view!.querySelector<HTMLElement>('.button_incr')!;
      const decr = picker.view!.querySelector<HTMLElement>('.button_decr')!;

      pointer('pointerdown', incr);
      assert.ok(incr.classList.contains('active'));
      pointer('pointerup', incr);
      assert.strictEqual(incr.classList.contains('active'), false);
      assert.deepStrictEqual(picker.selectedKeys, ['m']);

      for (const button of [decr, decr]) {
        pointer('pointerdown', button);
        pointer('pointerup', button);
      }
      assert.deepStrictEqual(picker.selectedKeys, ['s']);
    });

    it('should stop listening once destroyed', function () {
      const picker = makePicker();
      picker.addSlot(Picker.NUMBERS);
      const item = items(picker, 0)[0];
      let selections = 0;
      picker.on('select', () => { selections++; });
      picker.destroy();
      drag(item, 100, 75);
      assert.strictEqual(selections, 0);
    });
  });
});
