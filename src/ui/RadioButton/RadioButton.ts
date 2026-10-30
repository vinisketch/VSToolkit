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


import { isNumber } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { AbstractList } from '../List/AbstractList';
import { toText } from '../helpers';
import html_template from './RadioButton.html';

/**
 * The events of a RadioButton
 */
export type RadioButtonEvents = {
  /** the user selected an item (formerly 'change') */
  select: [index: number, item: string];
};

/**
 *  @class
 *  A RadioButton is a vertical list of radio buttons: the user selects one,
 *  and only one, item. Use a CheckBox to select several items.
 *
 *  @example
 *  const radio = new RadioButton({ data: ['item1', 'item2', 'item3'] });
 *  radio.init();
 *  radio.on('select', (radio, index, item) => { … });
 *
 * @extends vs.ui.AbstractList
 * @name vs.ui.RadioButton
 */
export class RadioButton extends AbstractList<string, RadioButtonEvents> {
  protected override htmlTemplate = html_template;

  #inputs: HTMLInputElement[] = [];
  #labels: HTMLLabelElement[] = [];
  #selectedIndex = -1;
  #changeListener = (event: Event) => {
    const index = this.#inputs.indexOf(event.target as HTMLInputElement);
    if (index === -1 || !this.#inputs[index].checked) return;
    this.#selectedIndex = index;
    this.propertyChange('selectedIndex');
    this.emit('select', index, this.items[index]);
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
      input.type = 'radio';
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
    if (this.#selectedIndex >= this.#inputs.length) {
      this.#selectedIndex = -1;
      this.propertyChange('selectedIndex');
    } else if (this.#selectedIndex !== -1) {
      this.#inputs[this.#selectedIndex].checked = true;
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
   * The index of the selected item, -1 without selection (kept until the
   * items are set)
   */
  @InOut set selectedIndex(v: number) {
    const index = isNumber(v) ? v : parseInt(String(v), 10);
    const count = this.items.length;
    if (!Number.isInteger(index) || index < -1 || (count && index >= count)) return;
    this.#selectedIndex = index;
    this.#inputs.forEach((input, i) => { input.checked = i === index; });
  }
  get selectedIndex(): number {
    return this.#selectedIndex;
  }
}

export default RadioButton;
