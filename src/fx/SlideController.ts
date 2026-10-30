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
import type { View } from 'vs_toolkit/vs_ui';

import type { ControllerOptions } from './Controller';
import { StackController } from './StackController';
import { place } from './helpers';

/**
 *  @class
 *  A SlideController presents a sequence of views side by side: the views
 *  slide horizontally (or vertically, see orientation) when going to the
 *  next or previous view, or when the user swipes (isTactile).
 *  <pre>
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡ˉˉˉˉˉˉ⎤    ⎢ ⎡ˉˉˉˉˉˉ⎤ ⎢   ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟  (1) ⎢    ⎢ ⎢  (2) ⎢ ⎢   ⎟  (3) ⎢   ⎟  (4) ⎢
 *   ⎣______⎦    ⎢ ⎣______⎦ ⎢   ⎣______⎦   ⎣______⎦
 *                ⎣____________⎦
 *   (*): the owner
 *  </pre>
 *
 *  @example
 *  const slider = new SlideController(panel, { delegate: this });
 *  slider.push('APanel', { id: '1', data: { … } });
 *  slider.push('APanel', { id: '2', data: { … } });
 *  slider.isTactile = true;
 *  await slider.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.SlideController
 */
export class SlideController extends StackController {
  static override ANIMATION_DURATION = 300;

  static HORIZONTAL = 0;
  static VERTICAL = 1;

  /** the views slide by 100% of their size */
  static PERCENTAGE = 0;
  /** @deprecated use PERCENTAGE */
  static POURCENTAGE = 0;
  /** the views slide by the size of a page (viewSize), in px */
  static PIXEL = 1;

  #orientation = SlideController.HORIZONTAL;
  #animationMode = SlideController.PERCENTAGE;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super(owner, options);
    this.animationDuration = SlideController.ANIMATION_DURATION;
  }

  protected override get isHorizontal(): boolean {
    return this.#orientation === SlideController.HORIZONTAL;
  }

  /**
   * The translation of a view k pages away: 'x,y,0'
   */
  #translation(k: number): string {
    let offset: string;
    if (this.#animationMode === SlideController.PIXEL) {
      const [width, height] = this.pageSize;
      offset = `${k * (this.isHorizontal ? width : height)}px`;
    } else {
      offset = `${k * 100}%`;
    }
    return this.isHorizontal ? `${offset},0,0` : `0,${offset},0`;
  }

  protected override layoutView(view: View<any>, index: number, currentIndex: number): void {
    place(view, `translate3d(${this.#translation(Math.sign(index - currentIndex))})`);
    if (index === currentIndex) view.show();
    else view.hide();
  }

  protected override async stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void> {
    // the new view comes from the side of the move
    place(to, `translate3d(${this.#translation(order)})`);
    to.show();
    await Promise.all([
      this.animateView(to, [['translate', this.#translation(0)]], instant),
      this.animateView(from, [['translate', this.#translation(-order)]], instant),
    ]);
    from.hide();
  }

  /**
   * The orientation: SlideController.HORIZONTAL (default) or VERTICAL
   */
  @InOut set orientation(v: number) {
    if (v !== SlideController.HORIZONTAL && v !== SlideController.VERTICAL) return;
    this.#orientation = v;
    this.updateViewSize();
  }
  get orientation(): number {
    return this.#orientation;
  }

  /**
   * How the views slide: SlideController.PERCENTAGE (default) or PIXEL
   */
  @InOut set animationMode(v: number) {
    if (v !== SlideController.PERCENTAGE && v !== SlideController.PIXEL) return;
    this.#animationMode = v;
    this.updateViewSize();
  }
  get animationMode(): number {
    return this.#animationMode;
  }
}

export default SlideController;
