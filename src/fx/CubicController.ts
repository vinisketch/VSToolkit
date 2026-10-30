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
 *  A CubicController presents a sequence of views on the faces of a cube:
 *  the cube turns horizontally (or vertically, see orientation) when going
 *  to the next or previous view, or when the user swipes (isTactile).
 *
 *  @example
 *  const cube = new CubicController(panel);
 *  cube.push(view1);
 *  cube.push(view2);
 *  await cube.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.CubicController
 */
export class CubicController extends StackController {
  static override ANIMATION_DURATION = 500;

  static HORIZONTAL = 0;
  static VERTICAL = 1;

  #orientation = CubicController.HORIZONTAL;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super(owner, options);
    this.animationDuration = CubicController.ANIMATION_DURATION;
    this.owner.setStyle('perspective', '1000px');
  }

  protected override get isHorizontal(): boolean {
    return this.#orientation === CubicController.HORIZONTAL;
  }

  /** the rotation of the cube: around y, or around x */
  get #rotation(): string {
    return this.isHorizontal ? 'rotateY' : 'rotateX';
  }

  protected override layoutView(view: View<any>, index: number, currentIndex: number): void {
    place(view, '');
    view.setStyle('transform-origin');
    if (index === currentIndex) view.show();
    else view.hide();
  }

  protected override async stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void> {
    // the two faces turn around the center of the cube
    const [width, height] = this.pageSize;
    const origin = `50% 50% -${(this.isHorizontal ? width : height) / 2}px`;
    // forward: the cube turns to the left (horizontal), to the top (vertical)
    const angle = this.isHorizontal ? 90 * order : -90 * order;
    for (const view of [from, to]) view.setStyle('transform-origin', origin);
    place(to, `${this.#rotation}(${angle}deg)`);
    to.show();

    await Promise.all([
      this.animateView(to, [[this.#rotation, '0deg']], instant),
      this.animateView(from, [[this.#rotation, `${-angle}deg`]], instant),
    ]);
    from.hide();
    this.layoutView(from, 1, 0);
    this.layoutView(to, 0, 0);
  }

  /**
   * The orientation: CubicController.HORIZONTAL (default) or VERTICAL
   */
  @InOut set orientation(v: number) {
    if (v !== CubicController.HORIZONTAL && v !== CubicController.VERTICAL) return;
    this.#orientation = v;
  }
  get orientation(): number {
    return this.#orientation;
  }
}

export default CubicController;
