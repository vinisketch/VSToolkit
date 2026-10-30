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


import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import TapRecognizer, { type TapDelegate } from '../Recognizers/TapRecognizer';
import { toText } from '../helpers';
import { CSS_ANDROID, CSS_DEFAULT, CSS_PURE, getDeviceCSSCode } from '../theme';
import html_template from './Switch.html';

/**
 * The events of a Switch
 */
export type SwitchEvents = {
  /** the user toggled the switch (formerly 'change') */
  toggle: [toggled: boolean];
};

/**
 *  @class
 *  A Switch displays a boolean value (toggled, the 'on' class name); the
 *  user taps it to change the value. It has the 'pressed' class name while
 *  it is pressed.
 *
 *  @example
 *  const toggle = new Switch({ textOn: 'I', textOff: 'O' });
 *  toggle.init();
 *  toggle.on('toggle', (toggle, toggled) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Switch
 */
export class Switch extends View<SwitchEvents> implements TapDelegate {
  protected override htmlTemplate = html_template;

  /** the theme (see theme.ts) */
  protected mode = CSS_DEFAULT;

  #tapRecognizer: TapRecognizer | undefined;
  #toggleOnView: HTMLElement | null = null;
  #toggleOffView: HTMLElement | null = null;
  #switchView: HTMLElement | null = null;
  #toggled = true;
  #selected = false;
  #textOn = '';
  #textOff = '';

  protected override initComponent(): void {
    super.initComponent();
    const view = this.view!;
    this.#toggleOnView = view.querySelector('.toggle_on');
    this.#toggleOffView = view.querySelector('.toggle_off');
    this.#switchView = view.querySelector('.switch');

    this.#tapRecognizer = new TapRecognizer(this);
    this.addPointerRecognizer(this.#tapRecognizer);

    this.mode = getDeviceCSSCode();
    if (this.#toggleOnView) this.#toggleOnView.textContent = this.#textOn;
    if (this.#toggleOffView) this.#toggleOffView.textContent = this.#textOff;
    this.#updateSwitch();
  }

  protected override destructor(): void {
    if (this.#tapRecognizer) {
      this.removePointerRecognizer(this.#tapRecognizer);
      this.#tapRecognizer = undefined;
    }
    this.#toggleOnView = this.#toggleOffView = this.#switchView = null;
    super.destructor();
  }

  override viewDidAdd(): void {
    super.viewDidAdd();
    // once laid out
    setTimeout(() => this.#updateSwitch(), 0);
  }

  override refresh(): void {
    super.refresh();
    this.mode = getDeviceCSSCode();
    this.#updateSwitch();
  }

  /**
   * The height of a switch is given by its theme
   */
  protected override didUpdateSizeAndPosition(): void {
    this.view?.style.removeProperty('height');
    if (this.view) this.view.style.bottom = 'auto';
  }

  /**
   * True while the switch is pressed
   */
  get selected(): boolean {
    return this.#selected;
  }

  /*****************************************************************
   *  Tap delegate
   ****************************************************************/

  didTouch(): void {
    this.addClassName('pressed');
    this.#selected = true;
  }

  didUntouch(): void {
    this.removeClassName('pressed');
    this.#selected = false;
  }

  didTap(): void {
    this.toggled = !this.#toggled;
    this.emit('toggle', this.#toggled);
  }

  /**
   * The 'on' class name, and the position of the switch
   */
  #updateSwitch(): void {
    const view = this.view, switchView = this.#switchView;
    if (!view) return;
    view.classList.toggle('on', this.#toggled);
    if (!switchView) return;

    let x = 0;
    if (this.#toggled && this.mode === CSS_PURE) {
      x = -15;
    } else if (this.#toggled && this.mode !== CSS_ANDROID) {
      const style = getComputedStyle(view);
      const border = (parseInt(style.borderLeftWidth, 10) || 0) + (parseInt(style.borderRightWidth, 10) || 0);
      x = view.offsetWidth - (switchView.offsetWidth + 2 * switchView.offsetLeft) - border;
    }
    switchView.style.transform = `translate3d(${x}px,0,0)`;
  }

  /**
   * The text of the 'on' state
   */
  @InOut set textOn(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#textOn = text;
    if (this.#toggleOnView) this.#toggleOnView.textContent = text;
  }
  get textOn(): string {
    return this.#textOn;
  }

  /**
   * The text of the 'off' state
   */
  @InOut set textOff(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#textOff = text;
    if (this.#toggleOffView) this.#toggleOffView.textContent = text;
  }
  get textOff(): string {
    return this.#textOff;
  }

  /**
   * The value of the switch, true (on) by default
   */
  @InOut set toggled(v: boolean) {
    this.#toggled = !!v;
    this.#updateSwitch();
  }
  get toggled(): boolean {
    return this.#toggled;
  }
}

export default Switch;
