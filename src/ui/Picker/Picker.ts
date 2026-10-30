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


/*
  Based on the Spinning Wheel of Matteo Spinelli
  http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch/11
  Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
  Released under MIT license, http://cubiq.org/dropbox/mit-license.txt
*/

import { isArray } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import { CSS_ANDROID, CSS_BLACKBERRY, CSS_DEFAULT, CSS_WP7, getDeviceCSSCode } from '../theme';
import html_template from './Picker.html';

/**
 * The values of a slot: an object (key → displayed value) or an array
 */
export type PickerValues = Record<string, string | number> | (string | number)[];

/**
 * A slot (a wheel) of a picker
 */
export interface PickerSlot {
  values: PickerValues;
  /** the class names of the slot: 'right', 'shrink', 'readonly'… */
  style?: string;
  /** the key selected by default */
  defaultValue?: string | number;
}

/**
 * The selected keys and values of the slots
 */
export interface PickerSelection {
  keys: string[];
  values: (string | number)[];
}

/**
 * The delegate of a Picker
 */
export interface PickerDelegate {
  /** the user selected a row */
  pickerViewSelectRow?(picker: Picker): void;
}

/**
 * The events of a Picker
 */
export type PickerEvents = {
  /** the user selected a row (formerly 'change') */
  select: [selection: PickerSelection];
};

interface Slot {
  readonly data: PickerSlot;
  readonly entries: [string, string | number][];
  readonly readonly: boolean;
  list: HTMLUListElement | null;
  position: number;
}

/** the duration of a move back within the boundaries, in ms */
const BACK_DURATION = 150;

/**
 *  @class
 *  A Picker shows one or more sets of values on spinning wheels (slots);
 *  the user rotates the wheels to align the values with the selection
 *  indicator. With the Android theme, the slots have + and - buttons.
 *
 *  @example
 *  const sizePicker = new Picker();
 *  sizePicker.init();
 *  sizePicker.addSlot(Picker.NUMBERS, 'right');
 *  sizePicker.addSlot(Picker.NUMBERS, 'right');
 *  sizePicker.addSlot({ separator: ',' }, 'readonly');
 *  sizePicker.addSlot(Picker.NUMBERS, 'right');
 *  sizePicker.addSlot({ cm: 'Cm', ft: 'Feet' }, 'shrink');
 *  sizePicker.on('select', (picker, { keys, values }) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Picker
 */
export class Picker extends View<PickerEvents> {
  static NUMBERS: Record<string, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 };

  protected override htmlTemplate = html_template;

  /** notified when the user selects a row */
  delegate: PickerDelegate | null = null;

  /** the theme (see theme.ts) */
  protected mode = CSS_DEFAULT;
  /** the height of a row, in px */
  protected cellHeight = 44;
  /** the deceleration of a thrown slot */
  protected friction = 0.003;

  #slots: Slot[] = [];
  #slotsView: HTMLElement | null = null;
  #frameView: HTMLElement | null = null;
  #selection: PickerSelection | undefined;

  #activeSlot: Slot | undefined;
  #pointerId = 0;
  #startY = 0;
  #scrollStartY = 0;
  #scrollStartTime = 0;
  #hideTimer: ReturnType<typeof setTimeout> | undefined;
  #slotToHide: Slot | undefined;

  #pointerDownListener = (event: PointerEvent) => this.#scrollStart(event);
  #pointerMoveListener = (event: PointerEvent) => this.#scrollMove(event);
  #pointerUpListener = (event: PointerEvent) => this.#scrollEnd(event);
  #buttonListener = (event: PointerEvent) => this.#buttonEvent(event);
  #transitionEndListener = (event: Event) => this.#backWithinBoundaries(event);

  protected override initComponent(): void {
    super.initComponent();
    const view = this.view!;
    this.mode = getDeviceCSSCode();
    this.#slotsView = view.querySelector('.slots');
    this.#frameView = view.querySelector('.frame');

    if (this.mode === CSS_BLACKBERRY) this.cellHeight = 50;
    if (this.mode === CSS_WP7) this.cellHeight = 83;

    if (this.mode === CSS_ANDROID || this.mode === CSS_WP7) {
      this.#frameView?.remove();
      this.#frameView = null;
    }
    if (this.mode === CSS_ANDROID) {
      for (const type of ['pointerdown', 'pointerup', 'pointercancel']) {
        view.addEventListener(type, this.#buttonListener as EventListener);
      }
    } else {
      // the slots scroll with the pointer, not the page
      view.style.touchAction = 'none';
      view.addEventListener('pointerdown', this.#pointerDownListener);
    }
    this.#slots.forEach((slot, index) => this.#renderSlot(slot, index));
  }

  protected override destructor(): void {
    const view = this.view;
    view?.removeEventListener('pointerdown', this.#pointerDownListener);
    for (const type of ['pointerdown', 'pointerup', 'pointercancel']) {
      view?.removeEventListener(type, this.#buttonListener as EventListener);
    }
    this.#stopTracking();
    clearTimeout(this.#hideTimer);
    this.#slots.forEach(slot => slot.list?.removeEventListener('transitionend', this.#transitionEndListener));
    this.#slots = [];
    this.#slotsView = this.#frameView = null;
    super.destructor();
  }

  /*****************************************************************
   *  Slots
   ****************************************************************/

  /**
   * Adds a slot: its values (key → displayed value), its class names
   * ('right', 'shrink', 'readonly'…) and its key selected by default
   */
  addSlot(values: PickerValues, style = '', defaultValue?: string | number): void {
    const data: PickerSlot = { values, style, defaultValue };
    const slot: Slot = {
      data,
      entries: Object.entries(values),
      readonly: /\breadonly\b/.test(style),
      list: null,
      position: 0,
    };
    this.#slots.push(slot);
    this.#selection = undefined;
    this.#renderSlot(slot, this.#slots.length - 1);
  }

  /**
   * Removes all the slots
   */
  removeAllSlots(): void {
    this.#slots.forEach(slot => slot.list?.removeEventListener('transitionend', this.#transitionEndListener));
    this.#slots = [];
    this.#selection = undefined;
    this.#activeSlot = undefined;
    this.#slotsView?.replaceChildren();
  }

  #renderSlot(slot: Slot, index: number): void {
    const slotsView = this.#slotsView;
    if (!slotsView) return;

    const list = document.createElement('ul');
    for (const [, value] of slot.entries) {
      const item = document.createElement('li');
      item.textContent = String(value);
      list.appendChild(item);
    }
    list.style.transitionTimingFunction = 'cubic-bezier(0, 0, 0.2, 1)';
    list.style.transform = 'translate3d(0,0,0)';
    slot.list = list;
    slot.position = 0;

    const container = document.createElement('div');
    if (this.mode === CSS_ANDROID) {
      const wheel = document.createElement('div');
      wheel.className = slot.data.style ?? '';
      wheel.appendChild(list);
      container.append(this.#createButton('button_incr', '+', slot), wheel, this.#createButton('button_decr', '-', slot));
    } else {
      container.className = slot.data.style ?? '';
      container.appendChild(list);
    }
    slotsView.appendChild(container);

    if (slot.data.defaultValue !== undefined) this.scrollToValue(index, slot.data.defaultValue);
  }

  #createButton(className: string, text: string, slot: Slot): HTMLElement {
    const button = document.createElement('div');
    button.className = slot.readonly ? `${className} readonly` : className;
    if (!slot.readonly) button.textContent = text;
    return button;
  }

  /**
   * The lowest position of the slot (its last row selected)
   */
  getSlotMaxScroll(slot: number): number {
    const entries = this.#slots[slot]?.entries.length ?? 0;
    return -Math.max(entries - 1, 0) * this.cellHeight;
  }

  #maxScroll(slot: Slot): number {
    return this.getSlotMaxScroll(this.#slots.indexOf(slot));
  }

  #isOutside(slot: Slot): boolean {
    return slot.position > 0 || slot.position < this.#maxScroll(slot);
  }

  #setPosition(slot: Slot, position: number): void {
    this.#selection = undefined;
    slot.position = position;
    if (slot.list) slot.list.style.transform = `translate3d(0,${position}px,0)`;
  }

  #stopAnimation(slot: Slot): void {
    slot.list?.removeEventListener('transitionend', this.#transitionEndListener);
    slot.list?.style.setProperty('transition-duration', '0ms');
  }

  /**
   * Scrolls the slot to the position; out of the boundaries, it goes back
   * within them at the end of the transition
   */
  #scrollTo(slot: Slot, position: number, duration = 100): void {
    slot.list?.style.setProperty('transition-duration', `${duration}ms`);
    this.#setPosition(slot, position || 0);
    if (this.#isOutside(slot)) {
      slot.list?.addEventListener('transitionend', this.#transitionEndListener);
    } else {
      this.#didSelect();
    }
  }

  #backWithinBoundaries(event: Event): void {
    const slot = this.#slots.find(slot => slot.list === event.target);
    if (!slot) return;
    slot.list!.removeEventListener('transitionend', this.#transitionEndListener);
    this.#scrollTo(slot, slot.position > 0 ? 0 : this.#maxScroll(slot), BACK_DURATION);
  }

  #didSelect(): void {
    this.delegate?.pickerViewSelectRow?.(this);
    this.propertyChange('selectedKeys');
    this.emit('select', this.#computeSelection());
  }

  /**
   * Selects the row of the key in the slot, without animation. Returns
   * false for an unknown slot or key.
   */
  scrollToValue(slot: number, key: string | number): boolean {
    const target = this.#slots[slot];
    if (!target) return false;
    const index = target.entries.findIndex(([entryKey]) => entryKey === String(key));
    if (index === -1) return false;
    this.#stopAnimation(target);
    this.#setPosition(target, -index * this.cellHeight);
    return true;
  }

  /**
   * Returns the selected keys and values. The animations are stopped, and
   * the slots put back within their boundaries.
   */
  getSelectedValues(): PickerSelection {
    for (const slot of this.#slots) {
      this.#stopAnimation(slot);
      const maxScroll = this.#maxScroll(slot);
      if (slot.position > 0) this.#setPosition(slot, 0);
      else if (slot.position < maxScroll) this.#setPosition(slot, maxScroll);
    }
    return this.#computeSelection();
  }

  #computeSelection(): PickerSelection {
    if (this.#selection) return this.#selection;
    const keys: string[] = [], values: (string | number)[] = [];
    for (const slot of this.#slots) {
      if (!slot.entries.length) continue;
      const index = Math.min(Math.max(-Math.round(slot.position / this.cellHeight), 0), slot.entries.length - 1);
      const [key, value] = slot.entries[index];
      keys.push(key);
      values.push(value);
    }
    this.#selection = { keys, values };
    return this.#selection;
  }

  /*****************************************************************
   *  Pointer events
   ****************************************************************/

  /**
   * The slot under the pointer
   */
  #slotAt(event: PointerEvent): Slot | undefined {
    const target = event.target as Element | null;
    const list = target?.closest?.('ul');
    const slot = list && this.#slots.find(slot => slot.list === list);
    if (slot) return slot;

    // the frame is over the slots (when pointer-events does not work)
    if (!target || target !== this.#frameView || !this.#slotsView) return undefined;
    const border = parseInt(getComputedStyle(this.#frameView).borderLeftWidth, 10) || 0;
    const delta = this.mode === CSS_BLACKBERRY ? 8 : 0;
    const x = event.clientX - this.#slotsView.getBoundingClientRect().left - border - delta;
    let right = 0;
    return this.#slots.find(slot => {
      right += slot.list?.offsetWidth ?? 0;
      return x < right;
    });
  }

  #stopTracking(): void {
    document.removeEventListener('pointermove', this.#pointerMoveListener, true);
    document.removeEventListener('pointerup', this.#pointerUpListener, true);
    document.removeEventListener('pointercancel', this.#pointerUpListener, true);
  }

  #scrollStart(event: PointerEvent): void {
    if (!event.isPrimary || !this.enable) return;
    const slot = this.#slotAt(event);
    if (!slot || slot.readonly || !slot.list) return;
    event.preventDefault();
    event.stopPropagation();

    this.#activeSlot = slot;
    this.#pointerId = event.pointerId;
    this.#stopAnimation(slot);

    // stops and holds the slot where its transition is
    const transform = getComputedStyle(slot.list).transform;
    if (transform && transform !== 'none') {
      try {
        const y = new DOMMatrix(transform).m42;
        if (y !== slot.position) this.#setPosition(slot, y);
      } catch {
        // an unparsable transform: the slot position is kept
      }
    }

    this.#startY = event.clientY;
    this.#scrollStartY = slot.position;
    this.#scrollStartTime = event.timeStamp;
    document.addEventListener('pointermove', this.#pointerMoveListener, true);
    document.addEventListener('pointerup', this.#pointerUpListener, true);
    document.addEventListener('pointercancel', this.#pointerUpListener, true);

    if (this.mode === CSS_WP7 || this.mode === CSS_BLACKBERRY) {
      clearTimeout(this.#hideTimer);
      if (this.#slotToHide && this.#slotToHide !== slot) {
        this.#slotToHide.list?.parentElement?.classList.remove('visible');
        this.#slotToHide = undefined;
      }
      slot.list.parentElement?.classList.add('visible');
      if (this.mode === CSS_WP7) this.addClassName('dragging');
    }
  }

  #scrollMove(event: PointerEvent): void {
    const slot = this.#activeSlot;
    if (!slot || event.pointerId !== this.#pointerId) return;
    event.preventDefault();
    event.stopPropagation();

    let delta = event.clientY - this.#startY;
    if (this.#isOutside(slot)) delta /= 2;
    this.#setPosition(slot, slot.position + delta);
    this.#startY = event.clientY;

    // prevents the slingshot effect
    if (event.timeStamp - this.#scrollStartTime > 80) {
      this.#scrollStartY = slot.position;
      this.#scrollStartTime = event.timeStamp;
    }
  }

  #scrollEnd(event: PointerEvent): void {
    const slot = this.#activeSlot;
    if (!slot || event.pointerId !== this.#pointerId) return;
    this.#stopTracking();
    this.#activeSlot = undefined;

    if (this.mode === CSS_WP7 || this.mode === CSS_BLACKBERRY) {
      this.#slotToHide = slot;
      this.#hideTimer = setTimeout(() => {
        this.#slotToHide?.list?.parentElement?.classList.remove('visible');
        this.#slotToHide = undefined;
        this.removeClassName('dragging');
      }, 1000);
    }

    // out of the boundaries: back within them
    const maxScroll = this.#maxScroll(slot);
    if (this.#isOutside(slot)) {
      this.#scrollTo(slot, slot.position > 0 ? 0 : maxScroll);
      return;
    }

    let distance = slot.position - this.#scrollStartY;
    // a short drag: to the nearest row
    if (Math.abs(distance) < this.cellHeight / 1.5) {
      if (slot.position % this.cellHeight) {
        this.#scrollTo(slot, Math.round(slot.position / this.cellHeight) * this.cellHeight, 100);
      } else {
        this.#didSelect();
      }
      return;
    }

    // a fake deceleration
    const duration = Math.max(event.timeStamp - this.#scrollStartTime, 1);
    let newDuration = (2 * distance / duration) / this.friction;
    distance = (this.friction / 2) * (newDuration * newDuration);
    if (newDuration < 0) {
      newDuration = -newDuration;
      distance = -distance;
    }

    const quarter = (this.view?.clientHeight ?? 0) / 4;
    let position = slot.position + distance;
    if (position > 0) {
      // not too far from the top
      position = Math.min(position / 2, quarter);
      newDuration /= 3;
    } else if (position < maxScroll) {
      // not too far from the bottom
      position = Math.max((position - maxScroll) / 2 + maxScroll, maxScroll - quarter);
      newDuration /= 3;
    } else {
      position = Math.round(position / this.cellHeight) * this.cellHeight;
    }
    this.#scrollTo(slot, Math.round(position), Math.round(newDuration));
  }

  /**
   * The + and - buttons of the Android theme
   */
  #buttonEvent(event: PointerEvent): void {
    const button = (event.target as Element | null)?.closest?.<HTMLElement>('.button_incr, .button_decr');
    if (!button || button.classList.contains('readonly')) return;

    if (event.type === 'pointerdown') {
      if (this.enable) button.classList.add('active');
      return;
    }
    const wasActive = button.classList.contains('active');
    button.classList.remove('active');
    if (event.type !== 'pointerup' || !wasActive) return;

    const slot = this.#slots.find(slot => slot.list?.parentElement?.parentElement === button.parentElement);
    if (!slot) return;
    const position = button.classList.contains('button_decr')
      ? Math.min(slot.position + this.cellHeight, 0)
      : Math.max(slot.position - this.cellHeight, this.#maxScroll(slot));
    this.#scrollTo(slot, position);
  }

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The slots (see addSlot)
   */
  @InOut set data(v: PickerSlot[]) {
    if (!isArray(v)) return;
    this.removeAllSlots();
    for (const slot of v) {
      if (!slot?.values) continue;
      this.addSlot(slot.values, slot.style, slot.defaultValue);
    }
  }
  get data(): PickerSlot[] {
    return this.#slots.map(slot => ({ ...slot.data }));
  }

  /**
   * The selected key of each slot; setting them selects the rows
   */
  @InOut set selectedKeys(v: (string | number)[]) {
    if (!isArray(v)) return;
    v.forEach((key, slot) => {
      if (key !== undefined && key !== null) this.scrollToValue(slot, key);
    });
  }
  get selectedKeys(): string[] {
    return this.#computeSelection().keys.slice();
  }

  /**
   * The selected value of each slot
   */
  get selectedValues(): (string | number)[] {
    return this.#computeSelection().values.slice();
  }
}

export default Picker;
