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
import { toText } from '../helpers';
import html_template from './TextLabel.html';

/**
 *  @class
 *  A TextLabel displays a text, which can not be selected.
 *
 *  @example
 *  const label = new TextLabel({ text: 'Hello' });
 *  label.init();
 *
 * @extends vs.ui.View
 * @name vs.ui.TextLabel
 */
export class TextLabel extends View {
  protected override htmlTemplate = html_template;

  #text = '';

  protected override initComponent(): void {
    super.initComponent();
    if (this.#text && this.view) this.view.textContent = this.#text;
  }

  /**
   * The text (a number or an object is converted to text)
   */
  @InOut set text(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#text = text;
    if (this.view) this.view.textContent = text;
  }
  get text(): string {
    return this.#text;
  }
}

export default TextLabel;
