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


import type { View } from 'vs_toolkit/vs_ui';

import type { ControllerOptions } from './Controller';
import { StackController } from './StackController';

/**
 *  @class
 *  An OpacityController presents a sequence of views one over the other:
 *  the views cross-fade when going to the next or previous view, or when
 *  the user swipes (isTactile).
 *
 *  @example
 *  const fader = new OpacityController(panel);
 *  fader.push(view1);
 *  fader.push(view2);
 *  await fader.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.OpacityController
 */
export class OpacityController extends StackController {
  static override ANIMATION_DURATION = 500;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super(owner, options);
    this.animationDuration = OpacityController.ANIMATION_DURATION;
  }

  protected override layoutView(view: View<any>, index: number, currentIndex: number): void {
    view.setStyle('opacity', 1);
    if (index === currentIndex) view.show();
    else view.hide();
  }

  protected override async stackAnimate(_order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void> {
    to.setStyle('opacity', 0);
    to.show();
    await Promise.all([
      this.animateView(to, [['opacity', '1']], instant),
      this.animateView(from, [['opacity', '0']], instant),
    ]);
    from.hide();
    from.setStyle('opacity', 1);
  }
}

export default OpacityController;
