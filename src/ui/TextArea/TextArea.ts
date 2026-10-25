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
import { toText, onPointerDownOutside, type TextInputEvents } from '../helpers';
import html_template from './TextArea.html';

const FIELD_EVENTS = ['input', 'change', 'focus', 'blur'];

/**
 *  @class
 *  A TextArea is a multi-line text input. Its value is notified on each
 *  change (the 'input' event); the 'commit' event is emitted when the user
 *  commits the text. It loses the focus when a pointer goes down outside.
 *
 *  @example
 *  const area = new TextArea({ value: 'Hello' });
 *  area.init();
 *  area.on('commit', (area, value) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.TextArea
 */
export class TextArea extends View<TextInputEvents> {
  declare view: HTMLTextAreaElement | null;

  protected override htmlTemplate = html_template;

  #value = '';
  #stopWatchingPointer: (() => void) | undefined;
  #fieldListener = (event: Event) => this.#handleFieldEvent(event);

  protected override initComponent(): void {
    super.initComponent();
    const view = this.view!;
    view.value = this.#value;
    view.disabled = !this.enable;
    for (const type of FIELD_EVENTS) view.addEventListener(type, this.#fieldListener);
  }

  protected override destructor(): void {
    this.#stopWatchingPointer?.();
    this.#stopWatchingPointer = undefined;
    for (const type of FIELD_EVENTS) this.view?.removeEventListener(type, this.#fieldListener);
    super.destructor();
  }

  protected override didEnable(): void {
    if (this.view) this.view.disabled = !this.enable;
  }

  /**
   * Gives the focus to the text area
   */
  setFocus(): void {
    this.view?.focus();
  }

  /**
   * Removes the focus from the text area
   */
  setBlur(): void {
    this.view?.blur();
  }

  #handleFieldEvent(event: Event): void {
    const view = this.view!;
    switch (event.type) {
      case 'focus':
        this.#stopWatchingPointer?.();
        this.#stopWatchingPointer = onPointerDownOutside(view, () => this.setBlur());
        this.emit('focus');
        break;

      case 'blur':
        this.#stopWatchingPointer?.();
        this.#stopWatchingPointer = undefined;
        this.emit('blur');
        break;

      case 'input':
        this.#value = view.value;
        this.propertyChange('value');
        this.emit('input', this.#value);
        break;

      case 'change':
        if (this.#value !== view.value) {
          this.#value = view.value;
          this.propertyChange('value');
        }
        this.emit('commit', this.#value);
        break;
    }
  }

  /**
   * The text (a number or an object is converted to text)
   */
  @InOut set value(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#value = text;
    if (this.view) this.view.value = text;
  }
  get value(): string {
    return this.#value;
  }
}

export default TextArea;
