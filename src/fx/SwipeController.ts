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

import type { ControllerOptions, NavigationOptions } from './Controller';
import { StackController, SWIPE_THRESHOLD } from './StackController';
import { place } from './helpers';

/**
 *  @class
 *  A SwipeController presents a sequence of views as a carousel: the views
 *  are side by side, horizontally (or vertically, see orientation), and
 *  move together when going to the next or previous view, or when the user
 *  swipes (isTactile).
 *  <p/>
 *  With isContinuousSwipe, the views follow the pointer; with isCircular,
 *  the last view is followed by the first one.
 *
 *  @example
 *  const carousel = new SwipeController(panel);
 *  carousel.isCircular = true;
 *  carousel.isContinuousSwipe = true;
 *  carousel.isTactile = true;
 *  carousel.push(view1);
 *  carousel.push(view2);
 *
 * @extends vs.fx.StackController
 * @name vs.fx.SwipeController
 */
export class SwipeController extends StackController {
  static override ANIMATION_DURATION = 300;

  static HORIZONTAL = 0;
  static VERTICAL = 1;

  #orientation = SwipeController.HORIZONTAL;
  #isCircular = false;
  #isContinuousSwipe = false;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super(owner, options);
    this.animationDuration = SwipeController.ANIMATION_DURATION;
  }

  protected override get isHorizontal(): boolean {
    return this.#orientation === SwipeController.HORIZONTAL;
  }

  /** the size of a page along the orientation */
  get #page(): number {
    const [width, height] = this.pageSize;
    return this.isHorizontal ? width : height;
  }

  /** the translation of a view at the distance px: 'x,y,0' */
  #translation(px: number): string {
    return this.isHorizontal ? `${px}px,0,0` : `0,${px}px,0`;
  }

  protected override layoutView(view: View<any>, index: number, currentIndex: number): void {
    place(view, `translate3d(${this.#translation((index - currentIndex) * this.#page)})`);
    view.show();
  }

  /** the neighbors of the current view: [previous, next], circular */
  #neighbors(): [number, number] {
    const index = this.currentIndex, count = this.stack.length;
    let previous = index - 1, next = index + 1;
    if (this.#isCircular && count > 2) {
      previous = (index - 1 + count) % count;
      next = (index + 1) % count;
    }
    return [previous, next];
  }

  protected override async stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void> {
    const page = this.#page;
    // the new view comes from the side of the move (it may be far: circular)
    if (!this.isDragging) place(to, `translate3d(${this.#translation(order * page)})`);
    to.show();
    await Promise.all([
      this.animateView(to, [['translate', this.#translation(0)]], instant),
      this.animateView(from, [['translate', this.#translation(-order * page)]], instant),
    ]);
    this.updateViewSize();
  }

  override goToNextView(options: NavigationOptions = {}): Promise<boolean> {
    if (this.#isCircular && this.currentIndex === this.stack.length - 1) return this.moveTo(0, 1, options);
    return super.goToNextView(options);
  }

  override goToPreviousView(options: NavigationOptions = {}): Promise<boolean> {
    if (this.#isCircular && this.currentIndex === 0) return this.moveTo(this.stack.length - 1, -1, options);
    return super.goToPreviousView(options);
  }

  /*****************************************************************
   *  Swipe: the views follow the pointer (isContinuousSwipe)
   ****************************************************************/

  /** the views follow the pointer */
  protected isDragging = false;

  protected override dragStart(): void {
    this.isDragging = false;
  }

  protected override dragMove(dx: number, dy: number): void {
    if (!this.#isContinuousSwipe) return;
    this.isDragging = true;
    const delta = this.isHorizontal ? dx : dy, page = this.#page;
    const [previous, next] = this.#neighbors();
    const current = this.currentView;
    if (current) place(current, `translate3d(${this.#translation(delta)})`);
    for (const [index, offset] of [[previous, -page], [next, page]]) {
      const view = this.viewAt(index);
      if (!view) continue;
      view.show();
      place(view, `translate3d(${this.#translation(offset + delta)})`);
    }
  }

  protected override dragEnd(dx: number, dy: number): Promise<boolean> {
    const delta = this.isHorizontal ? dx : dy;
    let move: Promise<boolean> = Promise.resolve(false);
    if (delta > SWIPE_THRESHOLD) move = this.goToPreviousView();
    else if (delta < -SWIPE_THRESHOLD) move = this.goToNextView();
    return move.then(moved => {
      if (!moved) this.cancelDrag();
      this.isDragging = false;
      return moved;
    });
  }

  protected override cancelDrag(): void {
    if (!this.isDragging) return;
    const page = this.#page;
    const [previous, next] = this.#neighbors();
    const moves: [View<any> | undefined, number][] = [
      [this.currentView, 0], [this.viewAt(previous), -page], [this.viewAt(next), page],
    ];
    for (const [view, offset] of moves) {
      if (view) this.animateView(view, [['translate', this.#translation(offset)]], false);
    }
  }

  /**
   * The orientation: SwipeController.HORIZONTAL (default) or VERTICAL
   */
  @InOut set orientation(v: number) {
    if (v !== SwipeController.HORIZONTAL && v !== SwipeController.VERTICAL) return;
    this.#orientation = v;
    this.updateViewSize();
  }
  get orientation(): number {
    return this.#orientation;
  }

  /**
   * The last view is followed by the first one (and the first one is
   * preceded by the last one)
   */
  @InOut set isCircular(v: boolean) {
    this.#isCircular = !!v;
  }
  get isCircular(): boolean {
    return this.#isCircular;
  }

  /**
   * The views follow the pointer while the user swipes
   */
  @InOut set isContinuousSwipe(v: boolean) {
    this.#isContinuousSwipe = !!v;
  }
  get isContinuousSwipe(): boolean {
    return this.#isContinuousSwipe;
  }
}

export default SwipeController;
