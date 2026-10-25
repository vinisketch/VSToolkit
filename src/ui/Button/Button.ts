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


import { isString } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import TapRecognizer, { type TapDelegate } from '../Recognizers/TapRecognizer';
import { toText } from '../helpers';
import html_template from './Button.html';

/**
 * The events of a Button
 */
export type ButtonEvents = {
  /** the button was clicked or tapped */
  select: [];
};

/**
 *  @class
 *  A Button emits a 'select' event when it is clicked or tapped. It has the
 *  'pressed' class name while it is pressed.
 *
 *  @example
 *  const button = new Button({ text: 'Hello', style: Button.BLUE_STYLE });
 *  button.init();
 *  button.on('select', () => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Button
 */
export class Button extends View<ButtonEvents> implements TapDelegate {
  static DEFAULT_TYPE = 'default';
  static NAVIGATION_TYPE = 'nav';
  static NAVIGATION_BACK_TYPE = 'nav_back';
  static NAVIGATION_FORWARD_TYPE = 'nav_forward';

  static DEFAULT_STYLE = 'default_style';
  static GREEN_STYLE = 'green';
  static RED_STYLE = 'red';
  static GREY_STYLE = 'grey';
  static BLUE_STYLE = 'blue_style';
  static BLACK_STYLE = 'black_style';
  static SILVER_STYLE = 'silver_style';

  protected override htmlTemplate = html_template;

  /** the node of the text */
  protected textView: HTMLElement | null = null;

  #tapRecognizer: TapRecognizer | undefined;
  #text = '';
  #style = Button.DEFAULT_STYLE;
  #type = Button.DEFAULT_TYPE;
  #selected = false;

  protected override initComponent(): void {
    super.initComponent();
    this.textView = this.view!.firstElementChild as HTMLElement | null;

    this.#tapRecognizer = new TapRecognizer(this);
    this.addPointerRecognizer(this.#tapRecognizer);

    if (this.textView) this.textView.textContent = this.#text;
    this.view!.setAttribute('name', this.id);
    if (this.#style) this.addClassName(this.#style);
    if (this.#type) this.addClassName(this.#type);
  }

  protected override destructor(): void {
    if (this.#tapRecognizer) {
      this.removePointerRecognizer(this.#tapRecognizer);
      this.#tapRecognizer = undefined;
    }
    super.destructor();
  }

  /**
   * True while the button is pressed
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
    this.emit('select');
  }

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The text of the button (a number or an object is converted to text)
   */
  @InOut set text(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#text = text;
    if (this.textView) this.textView.textContent = text;
  }
  get text(): string {
    return this.#text;
  }

  /**
   * The style of the button: a class name (Button.BLUE_STYLE…)
   */
  @InOut set style(v: string) {
    if (!isString(v)) return;
    // the former '_ios' styles
    v = v.replace('_ios', '');
    if (this.#style) this.removeClassName(this.#style);
    this.#style = v;
    this.addClassName(v);
  }
  get style(): string {
    return this.#style;
  }

  /**
   * The type of the button: a class name (Button.DEFAULT_TYPE,
   * NAVIGATION_TYPE…)
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
}

export default Button;
