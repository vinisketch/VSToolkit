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


import { isArray, isString } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import { toText } from '../helpers';
import html_template from './ComboBox.html';

/**
 * The events of a ComboBox
 */
export type ComboBoxEvents = {
  /** the user selected an item (formerly 'change') */
  select: [item: string];
};

/**
 *  @class
 *  A ComboBox lets the user select an item in a drop-down list (a native
 *  select).
 *
 *  @example
 *  const combo = new ComboBox({ data: ['item1', 'item2', 'item3'] });
 *  combo.init();
 *  combo.on('select', (combo, item) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.ComboBox
 */
export class ComboBox extends View<ComboBoxEvents> {
  protected override htmlTemplate = html_template;

  /** the select node */
  protected select: HTMLSelectElement | null = null;

  #data: string[] = [];
  #selectedItem: string | null = null;
  #changeListener = () => {
    const select = this.select!;
    this.#selectedItem = select.value;
    this.propertyChange('selectedItem');
    this.emit('select', select.value);
  };

  protected override initComponent(): void {
    super.initComponent();
    const select = document.createElement('select');
    select.name = this.id;
    select.disabled = !this.enable;
    select.addEventListener('change', this.#changeListener);
    this.view!.appendChild(select);
    this.select = select;
    this.#updateOptions();
  }

  protected override destructor(): void {
    this.select?.removeEventListener('change', this.#changeListener);
    this.select = null;
    super.destructor();
  }

  protected override didEnable(): void {
    if (this.select) this.select.disabled = !this.enable;
  }

  /**
   * Gives the focus to the combo box
   */
  setFocus(): void {
    this.select?.focus();
  }

  /**
   * Removes the focus from the combo box
   */
  setBlur(): void {
    this.select?.blur();
  }

  #updateOptions(): void {
    const select = this.select;
    if (!select) return;
    select.replaceChildren(...this.#data.map(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      return option;
    }));
    this.#updateSelection();
  }

  #updateSelection(): void {
    const select = this.select;
    if (!select) return;
    if (this.#selectedItem !== null && this.#data.includes(this.#selectedItem)) {
      select.value = this.#selectedItem;
    } else {
      select.selectedIndex = this.#data.length ? 0 : -1;
    }
  }

  /**
   * The selected item (the first item by default)
   */
  @InOut set selectedItem(v: string | null) {
    if (!isString(v)) return;
    this.#selectedItem = v;
    this.#updateSelection();
  }
  get selectedItem(): string | null {
    return this.#selectedItem;
  }

  /**
   * The items of the list (converted to text)
   */
  @InOut set data(v: string[]) {
    if (!isArray(v)) return;
    this.#data = v.map(item => toText(item) ?? '');
    this.#updateOptions();
  }
  get data(): string[] {
    return this.#data.slice();
  }
}

export default ComboBox;
