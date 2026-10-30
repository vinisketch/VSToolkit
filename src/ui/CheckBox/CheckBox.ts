/*
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and
  contributors. All rights reserved

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


import { isArray } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { AbstractList } from '../List/AbstractList';
import { toText } from '../helpers';
import html_template from './CheckBox.html';

/**
 * The events of a CheckBox
 */
export type CheckBoxEvents = {
  /** the user checked or unchecked an item (formerly 'change') */
  select: [indexes: number[], items: string[]];
};

/**
 *  @class
 *  A CheckBox is a vertical list of check boxes: the user selects one or
 *  more items. Use a RadioButton to select only one item.
 *
 *  @example
 *  const checkBox = new CheckBox({ data: ['item1', 'item2', 'item3'] });
 *  checkBox.init();
 *  checkBox.on('select', (checkBox, indexes, items) => { … });
 *
 * @extends vs.ui.AbstractList
 * @name vs.ui.CheckBox
 */
export class CheckBox extends AbstractList<string, CheckBoxEvents> {
  protected override htmlTemplate = html_template;

  #inputs: HTMLInputElement[] = [];
  #labels: HTMLLabelElement[] = [];
  #selectedIndexes: number[] = [];
  #changeListener = (event: Event) => {
    const index = this.#inputs.indexOf(event.target as HTMLInputElement);
    if (index === -1) return;
    this.#selectedIndexes = this.#inputs.flatMap((input, i) => (input.checked ? [i] : []));
    this.propertyChange('selectedIndexes');
    this.emit('select', this.selectedIndexes, this.#selectedIndexes.map(i => this.items[i]));
  };

  protected override initComponent(): void {
    super.initComponent();
    this.itemsView!.addEventListener('change', this.#changeListener);
  }

  protected override destructor(): void {
    this.itemsView?.removeEventListener('change', this.#changeListener);
    this.#inputs = [];
    this.#labels = [];
    super.destructor();
  }

  protected override didEnable(): void {
    this.#inputs.forEach(input => { input.disabled = !this.enable; });
  }

  protected override renderData(): void {
    const itemsView = this.itemsView;
    if (!itemsView) return;
    this.#inputs = [];
    this.#labels = [];
    const nodes: HTMLElement[] = [];
    this.items.forEach((item, index) => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = this.id;
      input.id = `${this.id}_l${index}`;
      input.value = String(index);
      input.disabled = !this.enable;
      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.textContent = toText(item) ?? '';
      this.#inputs.push(input);
      this.#labels.push(label);
      nodes.push(input, label);
    });
    itemsView.replaceChildren(...nodes);

    // the selection of the new items
    const selected = this.#selectedIndexes.filter(index => index < this.#inputs.length);
    selected.forEach(index => { this.#inputs[index].checked = true; });
    if (selected.length !== this.#selectedIndexes.length) {
      this.#selectedIndexes = selected;
      this.propertyChange('selectedIndexes');
    }
  }

  protected override itemIndexOf(node: Node | null): number {
    for (let index = 0; index < this.#inputs.length; index++) {
      if (node === this.#inputs[index] || (node && this.#labels[index].contains(node))) return index;
    }
    return -1;
  }

  protected override itemNodeAt(index: number): HTMLElement | undefined {
    return this.#inputs[index];
  }

  protected override touchItemFeedback(index: number): void {
    this.#inputs[index]?.classList.add('pressed');
    this.#labels[index]?.classList.add('pressed');
  }

  protected override untouchItemFeedback(index: number): void {
    this.#inputs[index]?.classList.remove('pressed');
    this.#labels[index]?.classList.remove('pressed');
  }

  /**
   * Checks the item at the index, or unchecks it if it is checked
   */
  selectItem(index: number): void {
    const input = this.#inputs[index];
    if (!input) return;
    const selected = this.#selectedIndexes.includes(index);
    this.selectedIndexes = selected
      ? this.#selectedIndexes.filter(i => i !== index)
      : [...this.#selectedIndexes, index];
  }

  /**
   * The indexes of the checked items (kept until the items are set)
   */
  @InOut set selectedIndexes(v: number[]) {
    if (!isArray(v)) return;
    const count = this.items.length;
    const indexes = v.filter(index => Number.isInteger(index) && index >= 0 && (!count || index < count));
    this.#selectedIndexes = [...new Set(indexes)].sort((a, b) => a - b);
    this.#inputs.forEach((input, index) => { input.checked = this.#selectedIndexes.includes(index); });
  }
  get selectedIndexes(): number[] {
    return this.#selectedIndexes.slice();
  }
}

export default CheckBox;
