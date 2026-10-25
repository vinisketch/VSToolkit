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


import { isArray, isNumber } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import DragRecognizer, { type DragDelegate } from '../Recognizers/DragRecognizer';
import { CSS_ANDROID, CSS_BLACKBERRY, CSS_IOS, CSS_WP7, getDeviceCSSCode } from '../theme';
import html_template from './Slider.html';

/**
 * The events of a Slider
 */
export type SliderEvents = {
  /** the user changed the value: on each move (formerly 'continuous_change') */
  input: [value: number];
  /** the user released the slider (formerly 'change') */
  commit: [value: number];
};

/** the width of the handle by theme, until the handle is laid out */
const HANDLE_WIDTHS = new Map([[CSS_IOS, 28], [CSS_WP7, 30], [CSS_ANDROID, 34], [CSS_BLACKBERRY, 35]]);
const DEFAULT_HANDLE_WIDTH = 23;

/**
 *  @class
 *  A Slider selects a value in a continuous range ([0, 100] by default).
 *  It is horizontal or vertical. The user taps or drags it: the value is
 *  notified on each move (the 'input' event), and the 'commit' event is
 *  emitted when the slider is released.
 *
 *  @example
 *  const slider = new Slider({ orientation: Slider.HORIZONTAL, value: 10 });
 *  slider.init();
 *  slider.on('commit', (slider, value) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Slider
 */
export class Slider extends View<SliderEvents> implements DragDelegate {
  static HORIZONTAL = 0;
  static VERTICAL = 1;

  protected override htmlTemplate = html_template;

  /** the handle node */
  protected handle: HTMLElement | null = null;

  #dragRecognizer: DragRecognizer | undefined;
  #mode = 0;
  #handleWidth = DEFAULT_HANDLE_WIDTH;
  #handleHeight = 0;
  #handleDelta = 10;
  #orientation = Slider.HORIZONTAL;
  #value = 0;
  #range = [0, 100];

  protected override initComponent(): void {
    super.initComponent();
    this.#mode = getDeviceCSSCode();
    this.#handleWidth = HANDLE_WIDTHS.get(this.#mode) ?? DEFAULT_HANDLE_WIDTH;
    if (this.#mode === CSS_BLACKBERRY) {
      this.#handleHeight = 12;
      this.#handleDelta = 3;
    }
    this.handle = this.view!.querySelector('.handle');

    this.#dragRecognizer = new DragRecognizer(this);
    this.addPointerRecognizer(this.#dragRecognizer);

    this.#applyOrientation();
    this.#render();
  }

  protected override destructor(): void {
    if (this.#dragRecognizer) {
      this.removePointerRecognizer(this.#dragRecognizer);
      this.#dragRecognizer = undefined;
    }
    this.handle = null;
    super.destructor();
  }

  override refresh(): void {
    const view = this.view;
    if (view && this.handle) {
      // the laid out handle
      if (this.handle.offsetWidth) this.#handleWidth = this.handle.offsetWidth;
      const delta = this.#orientation === Slider.HORIZONTAL ? view.offsetHeight : view.offsetWidth;
      if (delta) this.#handleDelta = delta;
    }
    this.#render();
    super.refresh();
  }

  /*****************************************************************
   *  Drag delegate
   ****************************************************************/

  didDragStart(event: PointerEvent): void {
    if (this.handle?.offsetWidth) this.#handleWidth = this.handle.offsetWidth;
    this.#setValueAt(event);
  }

  didDrag(_delta: { dx: number; dy: number }, event: PointerEvent): void {
    this.#setValueAt(event);
  }

  didDragEnd(): void {
    this.emit('commit', this.#value);
  }

  /**
   * The value at the pointer position
   */
  #setValueAt(event: PointerEvent): void {
    const view = this.view;
    if (!view) return;
    const rect = view.getBoundingClientRect();
    const [min, max] = this.#range;
    const ratio = this.#orientation === Slider.HORIZONTAL
      ? (event.clientX - rect.left) / view.offsetWidth
      : (event.clientY - rect.top) / view.offsetHeight;
    if (!Number.isFinite(ratio)) return;
    this.value = min + (max - min) * ratio;
    this.emit('input', this.#value);
  }

  #applyOrientation(): void {
    const vertical = this.#orientation === Slider.VERTICAL;
    this.view?.classList.toggle('vertical', vertical);
    this.view?.classList.toggle('horizontal', !vertical);
  }

  /**
   * The position of the handle, and the size of the track background
   */
  #render(): void {
    const view = this.view, handle = this.handle;
    if (!view || !handle) return;
    const [min, max] = this.#range;
    const d1 = this.#handleWidth / 2;
    const d2 = this.#mode === CSS_BLACKBERRY
      ? (this.#handleHeight - this.#handleDelta) / 2
      : (this.#handleWidth - this.#handleDelta) / 2;

    if (this.#orientation === Slider.HORIZONTAL) {
      const x = Math.floor((this.#value - min) * view.offsetWidth / (max - min)) - d1;
      handle.style.transform = `translate3d(${x}px,${-d2}px,0)`;
      view.style.backgroundSize = `${x + d1}px 10px`;
    } else {
      const y = Math.floor((this.#value - min) * view.offsetHeight / (max - min)) - d1;
      handle.style.transform = `translate3d(${-d2}px,${y}px,0)`;
      view.style.backgroundSize = `10px ${y + d1}px`;
    }
  }

  /**
   * The size of the slider [width, height], in px
   */
  override set size(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    super.size = v;
    this.#render();
  }
  override get size(): number[] {
    return super.size;
  }

  /**
   * The value, in the range
   */
  @InOut set value(v: number) {
    if (!isNumber(v) || Number.isNaN(v)) return;
    const [min, max] = this.#range;
    this.#value = Math.min(Math.max(v, min), max);
    this.#render();
  }
  get value(): number {
    return this.#value;
  }

  /**
   * The range of the value [min, max], [0, 100] by default
   */
  @InOut set range(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    if (v[0] >= v[1]) return;
    this.#range = [v[0], v[1]];
    // the value stays in the range
    this.value = this.#value;
  }
  get range(): number[] {
    return this.#range.slice();
  }

  /**
   * The orientation: Slider.HORIZONTAL or VERTICAL (the 'horizontal' or
   * 'vertical' class name)
   */
  @InOut set orientation(v: number) {
    if (v !== Slider.HORIZONTAL && v !== Slider.VERTICAL) return;
    this.#orientation = v;
    this.#applyOrientation();
    this.#render();
  }
  get orientation(): number {
    return this.#orientation;
  }
}

export default Slider;
