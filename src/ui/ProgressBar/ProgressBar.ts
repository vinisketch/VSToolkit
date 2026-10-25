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
import html_template from './ProgressBar.html';

/**
 *  @class
 *  A ProgressBar shows the progress of a task: its index in its range. An
 *  indeterminate ProgressBar shows a task of unknown duration.
 *
 *  @example
 *  const bar = new ProgressBar({ range: [0, 10], index: 3 });
 *  bar.init();
 *
 * @extends vs.ui.View
 * @name vs.ui.ProgressBar
 */
export class ProgressBar extends View {
  protected override htmlTemplate = html_template;

  /** the node of the bar */
  protected innerView: HTMLElement | null = null;

  #index = 0;
  #range = [0, 100];
  #indeterminate = false;

  protected override initComponent(): void {
    super.initComponent();
    this.innerView = this.view!.firstElementChild as HTMLElement | null;
    this.view!.classList.toggle('indeterminate', this.#indeterminate);
    this.#updateBar();
  }

  protected override destructor(): void {
    this.innerView = null;
    super.destructor();
  }

  /**
   * The width of the bar, in percent of the view (the borders of the
   * themes do not depend on the size)
   */
  #updateBar(): void {
    if (!this.innerView) return;
    const [min, max] = this.#range;
    const ratio = Math.min(Math.max((this.#index - min) / (max - min), 0), 1);
    this.innerView.style.width = `${ratio * 100}%`;
  }

  /**
   * The progress, in the range (the bar is full beyond the range)
   */
  @InOut set index(v: number) {
    if (!isNumber(v)) return;
    this.#index = v;
    this.#updateBar();
  }
  get index(): number {
    return this.#index;
  }

  /**
   * The range of the index [min, max], [0, 100] by default
   */
  @InOut set range(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    if (v[0] >= v[1]) return;
    this.#range[0] = v[0];
    this.#range[1] = v[1];
    this.#updateBar();
  }
  get range(): number[] {
    return this.#range.slice();
  }

  /**
   * True for a task of unknown duration (the 'indeterminate' class name)
   */
  @InOut set indeterminate(v: boolean) {
    this.#indeterminate = !!v;
    this.view?.classList.toggle('indeterminate', this.#indeterminate);
  }
  get indeterminate(): boolean {
    return this.#indeterminate;
  }
}

export default ProgressBar;
