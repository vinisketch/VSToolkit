import assert from 'assert';

import '../../dom';
import '../../di_config';

import { Model, InOut } from 'vs_toolkit/vs_core';
import {
  CheckBox, RadioButton, List, SimpleListItem, DefaultListItem, AbstractListItem, MULTI_TAP_DELAY,
} from '../../../src/ui';

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

function check(input: HTMLInputElement, checked = true): void {
  input.checked = checked;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('list components', function () {
  afterEach(function () {
    document.body.innerHTML = '';
  });

  describe('CheckBox', function () {
    function inputs(checkBox: CheckBox): HTMLInputElement[] {
      return [...checkBox.view!.querySelectorAll('input')];
    }

    it('should display a check box and a label by item', function () {
      const checkBox = new CheckBox({ data: ['a', 'b'] });
      checkBox.init();
      const [first] = inputs(checkBox);
      assert.strictEqual(inputs(checkBox).length, 2);
      assert.strictEqual(first.type, 'checkbox');
      assert.strictEqual(first.name, checkBox.id);
      const labels = [...checkBox.view!.querySelectorAll('label')];
      assert.deepStrictEqual(labels.map(label => label.textContent), ['a', 'b']);
      assert.strictEqual(labels[0].htmlFor, first.id);
    });

    it('should notify the items checked by the user', function () {
      const checkBox = new CheckBox({ data: ['a', 'b', 'c'] });
      checkBox.init();
      const log: string[] = [];
      checkBox.on('change:selectedIndexes', () => log.push(`change:${checkBox.selectedIndexes}`));
      checkBox.on('select', (_checkBox, indexes, items) => log.push(`select:${indexes}:${items}`));

      check(inputs(checkBox)[2]);
      check(inputs(checkBox)[0]);
      check(inputs(checkBox)[2], false);
      assert.deepStrictEqual(log,
        ['change:2', 'select:2:c', 'change:0,2', 'select:0,2:a,c', 'change:0', 'select:0:a']);
    });

    it('should check the selected indexes, given before the items', function () {
      const checkBox = new CheckBox({ selectedIndexes: [2, 0, 7], data: ['a', 'b', 'c'] });
      checkBox.init();
      assert.deepStrictEqual(checkBox.selectedIndexes, [0, 2]);
      assert.deepStrictEqual(inputs(checkBox).map(input => input.checked), [true, false, true]);

      checkBox.selectItem(1);
      checkBox.selectItem(0);
      assert.deepStrictEqual(checkBox.selectedIndexes, [1, 2]);
      checkBox.data = ['x', 'y'];
      assert.deepStrictEqual(checkBox.selectedIndexes, [1]);
      assert.deepStrictEqual(inputs(checkBox).map(input => input.checked), [false, true]);
    });

    it('should give the feedback of a touched item', function () {
      const checkBox = new CheckBox({ data: ['a'] });
      checkBox.init();
      const label = checkBox.view!.querySelector('label')!;
      pointer('pointerdown', label);
      assert.ok(label.classList.contains('pressed'));
      assert.ok(inputs(checkBox)[0].classList.contains('pressed'));
      pointer('pointerup', document);
      assert.strictEqual(label.classList.contains('pressed'), false);
    });

    it('should disable its check boxes', function () {
      const checkBox = new CheckBox({ data: ['a'], enable: false });
      checkBox.init();
      assert.strictEqual(inputs(checkBox)[0].disabled, true);
      checkBox.enable = true;
      assert.strictEqual(inputs(checkBox)[0].disabled, false);
    });
  });

  describe('RadioButton', function () {
    function inputs(radio: RadioButton): HTMLInputElement[] {
      return [...radio.view!.querySelectorAll('input')];
    }

    it('should select one item', function () {
      const radio = new RadioButton({ selectedIndex: 1, data: ['a', 'b', 'c'] });
      radio.init();
      assert.strictEqual(inputs(radio)[0].type, 'radio');
      assert.deepStrictEqual(inputs(radio).map(input => input.checked), [false, true, false]);

      radio.selectedIndex = 2;
      assert.deepStrictEqual(inputs(radio).map(input => input.checked), [false, false, true]);
      radio.selectedIndex = 5;
      assert.strictEqual(radio.selectedIndex, 2);
      radio.selectedIndex = -1;
      assert.deepStrictEqual(inputs(radio).map(input => input.checked), [false, false, false]);
    });

    it('should notify the item selected by the user', function () {
      const radio = new RadioButton({ data: ['a', 'b'] });
      radio.init();
      const log: string[] = [];
      radio.on('change:selectedIndex', () => log.push(`change:${radio.selectedIndex}`));
      radio.on('select', (_radio, index, item) => log.push(`select:${index}:${item}`));
      check(inputs(radio)[1]);
      assert.deepStrictEqual(log, ['change:1', 'select:1:b']);
    });

    it('should clear a selection out of the new items', function () {
      const radio = new RadioButton({ data: ['a', 'b', 'c'], selectedIndex: 2 });
      radio.init();
      radio.data = ['x', 'y'];
      assert.strictEqual(radio.selectedIndex, -1);
    });
  });

  describe('List', function () {
    function itemNodes(list: List): HTMLElement[] {
      return [...list.view!.querySelectorAll<HTMLElement>(':scope > ul > *')];
    }

    it('should display the items with the default items', function () {
      const list = new List({ data: [{ title: 'one' }, { title: 'two', label: '2', other: true }, 'three'] });
      list.init();
      assert.ok(list.hasClassName(List.DEFAULT_LIST));
      const nodes = itemNodes(list);
      assert.deepStrictEqual(nodes.map(node => node.tagName), ['LI', 'LI', 'LI']);
      assert.strictEqual(nodes[0].textContent, 'one');
      assert.strictEqual(nodes[1].textContent, 'two2');
      assert.strictEqual(nodes[1].querySelector('span')!.textContent, '2');
      assert.strictEqual(nodes[2].textContent, 'three');
      assert.ok(list.getItems()[1] instanceof DefaultListItem);
      assert.strictEqual(list.getItems()[1].index, 1);
    });

    it('should select the tapped item, pressed meanwhile', async function () {
      const data = [{ title: 'one' }, { title: 'two' }];
      const list = new List({ data });
      list.init();
      const selections: [number, unknown][] = [];
      list.on('itemselect', (_list, index, item) => selections.push([index, item]));
      const changes: string[][] = [];
      list.on('change', (_list, properties) => changes.push([...properties].sort()));

      const node = itemNodes(list)[1];
      pointer('pointerdown', node);
      assert.strictEqual(list.getItems()[1].pressed, true);
      assert.ok(node.classList.contains('pressed'));
      pointer('pointerup', document);
      assert.strictEqual(list.getItems()[1].pressed, false);
      await later(MULTI_TAP_DELAY + 10);

      assert.strictEqual(selections.length, 1);
      assert.strictEqual(selections[0][0], 1);
      assert.ok(selections[0][1] === data[1]);
      assert.strictEqual(list.selectedIndex, 1);
      assert.ok(list.selectedItem === data[1]);
      assert.deepStrictEqual(changes, [['selectedIndex', 'selectedItem']]);

      await tap(itemNodes(list)[1]);
      assert.strictEqual(selections.length, 2);
      assert.strictEqual(changes.length, 1, 'the same selection is not notified again');
    });

    it('should not select when the items are not selectable', async function () {
      const list = new List({ data: ['a'], itemsSelectable: false });
      list.init();
      let selections = 0;
      list.on('itemselect', () => { selections++; });
      pointer('pointerdown', itemNodes(list)[0]);
      assert.strictEqual(list.getItems()[0].pressed, false);
      pointer('pointerup', document);
      await later(MULTI_TAP_DELAY + 10);
      assert.strictEqual(selections, 0);
    });

    it('should create the items with a template class or a template item', async function () {
      let selected = 0;
      class Row extends SimpleListItem {
        override didSelect(): void { selected++; }
      }
      const list = new List({ data: ['a', 'b'] });
      list.init();
      list.setItemTemplate(Row);
      assert.ok(list.getItems()[0] instanceof Row);
      assert.strictEqual(itemNodes(list)[1].querySelector('.title')!.textContent, 'b');
      await tap(itemNodes(list)[0]);
      assert.strictEqual(selected, 1);

      const template = new SimpleListItem();
      template.init();
      template.addClassName('custom');
      list.add(template);
      assert.ok(list.getItems()[0] instanceof SimpleListItem);
      assert.ok(list.getItems()[0] !== template);
      assert.strictEqual(itemNodes(list)[0].querySelector('.title')!.textContent, 'a');
    });

    it('should follow the changes of the model items', function () {
      class Contact extends Model { @InOut accessor title = 'Ann'; @InOut accessor phone = '1'; }
      const contact = new Contact();
      let titles = 0;
      class ContactItem extends DefaultListItem {
        override set title(v: string) { titles++; super.title = v; }
        override get title(): string { return super.title; }
      }
      const list = new List();
      list.init();
      list.setItemTemplate(ContactItem);
      list.data = [contact];
      assert.strictEqual(itemNodes(list)[0].textContent, 'Ann');

      contact.title = 'Bob';
      assert.strictEqual(itemNodes(list)[0].textContent, 'Bob');

      const count = titles;
      list.data = [];
      contact.title = 'Cid';
      assert.strictEqual(titles, count, 'the former items do not follow the model');
    });

    it('should display the sections of a block list', function () {
      const list = new List({ type: List.BLOCK_LIST, data: ['A', { title: 'a1' }, { title: 'a2' }, 'B', { title: 'b1' }] });
      list.init();
      assert.ok(list.hasClassName('BlockList'));
      assert.strictEqual(list.hasClassName('DefaultList'), false);
      const sections = itemNodes(list);
      assert.strictEqual(sections.length, 2);
      assert.strictEqual(sections[0].querySelector(':scope > div')!.textContent, 'A');
      assert.deepStrictEqual([...sections[0].querySelectorAll(':scope > ul > li')].map(li => li.textContent), ['a1', 'a2']);
      assert.ok(list.getTitleItem(1) === sections[1]);
      assert.strictEqual(list.getItems()[2].index, 4);
    });

    it('should scroll to a section with the direct access bar of a tab list', function () {
      const list = new List({ type: List.TAB_LIST, scroll: true, data: ['Apple', { title: 'a1' }, 'Banana', { title: 'b1' }] });
      list.init();
      document.body.appendChild(list.view!);
      const bar = list.view!.querySelector<HTMLElement>(':scope > .direct_access')!;
      assert.deepStrictEqual([...bar.children].map(letter => letter.textContent), ['A', 'B']);

      const container = list.view!.querySelector('ul')!;
      list.getTitleItem(1)!.getBoundingClientRect = () => ({ top: 300 } as DOMRect);
      pointer('pointerdown', bar.children[1]);
      assert.strictEqual(container.scrollTop, 300);
      const value = list.view!.querySelector<HTMLElement>('.direct_access_value')!;
      assert.strictEqual(value.textContent, 'B');
      assert.strictEqual(value.style.opacity, '1');
      pointer('pointerup', document);
      assert.strictEqual(value.style.opacity, '0');

      list.type = List.DEFAULT_LIST;
      assert.strictEqual(list.view!.querySelector('.direct_access'), null);
    });

    it('should hide the items which do not match the filters', function () {
      const list = new List({ data: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }] });
      list.init();
      const displays = () => itemNodes(list).map(node => node.style.display !== 'none');

      list.filters = [{ property: 'title', value: 't', matching: List.FILTER_STARTS_WITH, strict: false }];
      assert.deepStrictEqual(displays(), [false, true, true]);
      list.filters = [
        { property: 'title', value: 'T', matching: List.FILTER_STARTS_WITH },
        { property: 'title', value: 'e', matching: List.FILTER_CONTAINS },
      ];
      assert.deepStrictEqual(displays(), [false, false, true]);
      list.filters = [{ property: 'title', value: 'One' }];
      assert.deepStrictEqual(displays(), [true, false, false]);
      list.filters = null;
      assert.deepStrictEqual(displays(), [true, true, true]);
    });

    it('should scroll natively, and to an item', function () {
      const list = new List({ data: ['a', 'b', 'c'], hasArrow: true });
      list.init();
      assert.ok(list.hasClassName('arrow'));
      const container = list.view!.querySelector('ul')!;
      assert.strictEqual(container.style.overflowY, '');

      list.scroll = true;
      assert.strictEqual(container.style.overflowY, 'auto');
      const scrolls: ScrollToOptions[] = [];
      container.scrollTo = ((options: ScrollToOptions) => { scrolls.push(options); }) as typeof container.scrollTo;
      itemNodes(list)[2].getBoundingClientRect = () => ({ top: 80 } as DOMRect);
      list.scrollToElementAt(2);
      list.scrollToElementAt(2, 0);
      assert.deepStrictEqual(scrolls, [{ top: 80, behavior: 'smooth' }, { top: 80, behavior: 'auto' }]);

      list.scroll = false;
      assert.strictEqual(container.style.overflowY, '');
    });

    it('should destroy its items, and its template', function () {
      const template = new SimpleListItem();
      template.init();
      const list = new List({ data: ['a'] });
      list.init();
      list.setItemTemplate(template);
      const item = list.getItems()[0];
      list.destroy();
      assert.strictEqual(item.view, null);
      assert.strictEqual(template.view, null);
    });

    it('should type check its items (at compile time)', function () {
      const typeErrors = () => {
        const list = new List();
        // @ts-expect-error a template is a list item class or a list item
        list.setItemTemplate(Model);
        list.setItemTemplate(AbstractListItem);
        // @ts-expect-error the itemselect listener gets the index and the item
        list.on('itemselect', (_list, index: string) => index);
      };
      assert.ok(typeErrors);
    });
  });
});
