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
import html_template from './SegmentedButton.html';

/** the time a momentary button stays selected, in ms */
const MOMENTARY_DELAY = 300;

/**
 * The events of a SegmentedButton
 */
export type SegmentedButtonEvents = {
  /** the user selected a button */
  select: [index: number, item: string];
};

/**
 *  @class
 *  A SegmentedButton displays a set of buttons, horizontally or vertically.
 *  Only one button is selected (the 'selected' class name); a 'select'
 *  event is emitted when the user presses another button.
 *  Without toggle buttons (isToggleButtons false), the buttons are
 *  momentary: the selection is cleared after a short delay.
 *
 *  @example
 *  const segmented = new SegmentedButton({
 *    items: ['test1', 'test2', 'test3'],
 *    type: SegmentedButton.BAR_TYPE,
 *  });
 *  segmented.init();
 *  segmented.on('select', (segmented, index, item) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.SegmentedButton
 */
export class SegmentedButton extends View<SegmentedButtonEvents> {
  static DEFAULT_TYPE = 'default';
  static BAR_TYPE = 'bar';

  static HORIZONTAL = 0;
  static VERTICAL = 1;

  protected override htmlTemplate = html_template;

  #items: string[] = [];
  #buttons: HTMLElement[] = [];
  #selectedIndex = -1;
  #type = SegmentedButton.DEFAULT_TYPE;
  #isToggleButtons = true;
  #orientation = SegmentedButton.HORIZONTAL;
  #momentaryTimer: ReturnType<typeof setTimeout> | undefined;
  #pointerListener = (event: PointerEvent) => this.#didPointerDown(event);

  protected override initComponent(): void {
    super.initComponent();
    this.view!.addEventListener('pointerdown', this.#pointerListener);
    this.#renderButtons();
    this.addClassName(this.#type);
    this.#applyOrientation();
  }

  protected override destructor(): void {
    clearTimeout(this.#momentaryTimer);
    this.view?.removeEventListener('pointerdown', this.#pointerListener);
    this.#buttons = [];
    super.destructor();
  }

  #renderButtons(): void {
    const view = this.view;
    if (!view) return;
    const container = document.createElement('div');
    this.#buttons = this.#items.map(item => {
      const button = document.createElement('div');
      button.textContent = item;
      container.appendChild(button);
      return button;
    });
    view.replaceChildren(container);
    this.#updateSelection();
  }

  #updateSelection(): void {
    this.#buttons.forEach((button, index) => {
      button.classList.toggle('selected', index === this.#selectedIndex);
    });
  }

  #applyOrientation(): void {
    const vertical = this.#orientation === SegmentedButton.VERTICAL;
    this.view?.classList.toggle('vertical', vertical);
    this.view?.classList.toggle('horizontal', !vertical);
  }

  #didPointerDown(event: PointerEvent): void {
    if (!event.isPrimary || !this.enable) return;
    const target = event.target as Node | null;
    const index = this.#buttons.findIndex(button => !!target && button.contains(target));
    if (index === -1 || index === this.#selectedIndex) return;

    event.stopPropagation();
    event.preventDefault();
    this.selectedIndex = index;
    this.emit('select', index, this.#items[index]);
  }

  /**
   * The texts of the buttons
   */
  @InOut set items(v: string[]) {
    if (!isArray(v)) return;
    this.#items = v.map(item => toText(item) ?? '').filter(item => item !== '');
    if (this.#selectedIndex >= this.#items.length) this.#selectedIndex = -1;
    this.#renderButtons();
  }
  get items(): string[] {
    return this.#items.slice();
  }

  /**
   * The index of the selected button, -1 without selection
   */
  @InOut set selectedIndex(v: number) {
    if (!Number.isInteger(v) || v < -1) return;
    if (this.#items.length && v >= this.#items.length) return;

    clearTimeout(this.#momentaryTimer);
    this.#selectedIndex = v;
    this.#updateSelection();

    if (!this.#isToggleButtons && v !== -1) {
      this.#momentaryTimer = setTimeout(() => {
        this.#momentaryTimer = undefined;
        this.#selectedIndex = -1;
        this.#updateSelection();
        this.propertyChange('selectedIndex');
      }, MOMENTARY_DELAY);
    }
  }
  get selectedIndex(): number {
    return this.#selectedIndex;
  }

  /**
   * The type: a class name (SegmentedButton.DEFAULT_TYPE, BAR_TYPE)
   */
  @InOut set type(v: string) {
    if (!isString(v)) return;
    if (this.#type) this.removeClassName(this.#type);
    this.#type = v;
    this.addClassName(v);
  }
  get type(): string {
    return this.#type;
  }

  /**
   * True (default) for toggle buttons, false for momentary buttons
   */
  @InOut set isToggleButtons(v: boolean) {
    this.#isToggleButtons = !!v;
  }
  get isToggleButtons(): boolean {
    return this.#isToggleButtons;
  }

  /**
   * The orientation: SegmentedButton.HORIZONTAL or VERTICAL (the
   * 'horizontal' or 'vertical' class name)
   */
  @InOut set orientation(v: number) {
    if (v !== SegmentedButton.HORIZONTAL && v !== SegmentedButton.VERTICAL) return;
    this.#orientation = v;
    this.#applyOrientation();
  }
  get orientation(): number {
    return this.#orientation;
  }
}

export default SegmentedButton;
