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
import html_template from './InputField.html';

const FIELD_EVENTS = ['input', 'change', 'focus', 'blur'];

/**
 * The type of an InputField
 */
export type InputFieldType = 'text' | 'password' | 'search';

/**
 *  @class
 *  An InputField is a one line text input, with a clear button. It can be
 *  a text field, a password field (the characters are replaced by dots) or
 *  a search field.
 *  Its value is notified on each change (the 'input' event); the 'commit'
 *  event is emitted when the user commits the text. It has the 'focus'
 *  class name while it has the focus, and loses it when a pointer goes
 *  down outside.
 *
 *  @example
 *  const input = new InputField({ id: 'input' });
 *  input.init();
 *  input.placeholder = 'Type your password...';
 *  input.type = InputField.PASSWORD;
 *
 * @extends vs.ui.View
 * @name vs.ui.InputField
 */
export class InputField extends View<TextInputEvents> {
  /** a text input */
  static TEXT = 'text' as const;
  /** a password input: the characters are replaced by dots */
  static PASSWORD = 'password' as const;
  /** a search input */
  static SEARCH = 'search' as const;

  protected override htmlTemplate = html_template;

  /** the input node */
  protected textField: HTMLInputElement | null = null;
  /** the clear button node */
  protected clearButton: HTMLElement | null = null;

  #value = '';
  #placeholder = 'type ...';
  #type: InputFieldType = InputField.TEXT;
  #stopWatchingPointer: (() => void) | undefined;
  #fieldListener = (event: Event) => this.#handleFieldEvent(event);
  #clearListener = (event: Event) => {
    // keeps the focus in the input
    event.preventDefault();
    this.clear();
  };

  protected override initComponent(): void {
    super.initComponent();
    const textField = this.view!.querySelector('input');
    if (!textField) {
      throw new Error(`vs.ui.InputField ${this.id}: no input node`);
    }
    this.textField = textField;
    textField.name = this.id;
    textField.value = this.#value;
    textField.setAttribute('placeholder', this.#placeholder);
    textField.disabled = !this.enable;
    for (const type of FIELD_EVENTS) textField.addEventListener(type, this.#fieldListener);

    this.clearButton = this.view!.querySelector<HTMLElement>('.clear_button');
    this.clearButton?.addEventListener('pointerdown', this.#clearListener);

    this.#applyType();
    this.#updateClearButton();
  }

  protected override destructor(): void {
    this.#stopWatchingPointer?.();
    this.#stopWatchingPointer = undefined;
    for (const type of FIELD_EVENTS) this.textField?.removeEventListener(type, this.#fieldListener);
    this.clearButton?.removeEventListener('pointerdown', this.#clearListener);
    this.textField = null;
    this.clearButton = null;
    super.destructor();
  }

  protected override didEnable(): void {
    if (this.textField) this.textField.disabled = !this.enable;
  }

  /**
   * Gives the focus to the input
   */
  setFocus(): void {
    this.textField?.focus();
  }

  /**
   * Removes the focus from the input
   */
  setBlur(): void {
    this.textField?.blur();
  }

  /**
   * Clears the text, as the user did (with the clear button): notifies the
   * value and emits the 'input' and 'commit' events.
   */
  clear(): void {
    if (this.textField) this.textField.value = '';
    this.#value = '';
    this.#updateClearButton();
    this.propertyChange('value');
    this.emit('input', '');
    this.emit('commit', '');
  }

  /**
   * The clear button is visible while the input has the focus and a text
   */
  #updateClearButton(): void {
    if (!this.clearButton) return;
    const visible = this.hasClassName('focus') && !!this.#value;
    this.clearButton.style.visibility = visible ? 'visible' : 'hidden';
  }

  #applyType(): void {
    if (!this.view) return;
    for (const type of [InputField.TEXT, InputField.PASSWORD, InputField.SEARCH]) {
      this.view.classList.toggle(type, type === this.#type);
    }
    this.textField?.setAttribute('type', this.#type);
  }

  #handleFieldEvent(event: Event): void {
    const textField = this.textField!;
    switch (event.type) {
      case 'focus':
        this.addClassName('focus');
        this.#value = textField.value;
        this.#updateClearButton();
        this.#stopWatchingPointer?.();
        this.#stopWatchingPointer = onPointerDownOutside(this.view!, () => this.setBlur());
        this.emit('focus');
        break;

      case 'blur':
        this.removeClassName('focus');
        this.#updateClearButton();
        this.#stopWatchingPointer?.();
        this.#stopWatchingPointer = undefined;
        this.emit('blur');
        break;

      case 'input':
        this.#value = textField.value;
        this.#updateClearButton();
        this.propertyChange('value');
        this.emit('input', this.#value);
        break;

      case 'change':
        if (this.#value !== textField.value) {
          this.#value = textField.value;
          this.#updateClearButton();
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
    if (this.textField) this.textField.value = text;
    this.#updateClearButton();
  }
  get value(): string {
    return this.#value;
  }

  /**
   * The type: InputField.TEXT, PASSWORD or SEARCH (also a class name)
   */
  @InOut set type(v: InputFieldType) {
    if (v !== InputField.TEXT && v !== InputField.PASSWORD && v !== InputField.SEARCH) return;
    this.#type = v;
    this.#applyType();
  }
  get type(): InputFieldType {
    return this.#type;
  }

  /**
   * A hint to help the user fill the input
   */
  @InOut set placeholder(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#placeholder = text;
    this.textField?.setAttribute('placeholder', text);
  }
  get placeholder(): string {
    return this.#placeholder;
  }
}

export default InputField;
