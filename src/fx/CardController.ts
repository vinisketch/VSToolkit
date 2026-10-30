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
import { StackController, SWIPE_THRESHOLD } from './StackController';
import { place } from './helpers';

/**
 *  @class
 *  A CardController presents a sequence of views as a stack of cards: the
 *  next card slides in over the current one, from the side of the
 *  direction; going back, the current card slides out to this side.
 *  When the user swipes (isTactile), the cards follow the pointer.
 *
 *  @example
 *  const cards = new CardController(panel, { delegate: this });
 *  cards.direction = CardController.BOTTOM_OUT;
 *  cards.push('APanel', { id: '1', data: { … } });
 *  cards.push('APanel', { id: '2', data: { … } });
 *  await cards.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.CardController
 */
export class CardController extends StackController {
  static override ANIMATION_DURATION = 300;

  /** the cards leave to the left (and come from the left) */
  static LEFT_OUT = 0;
  static RIGHT_OUT = 1;
  static TOP_OUT = 2;
  static BOTTOM_OUT = 3;

  #direction = CardController.RIGHT_OUT;
  /** the card which follows the pointer, and where it goes back */
  #dragged: { view: View<any>; isNext: boolean } | undefined;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super(owner, options);
    this.animationDuration = CardController.ANIMATION_DURATION;
  }

  protected override get isHorizontal(): boolean {
    return this.#direction === CardController.LEFT_OUT || this.#direction === CardController.RIGHT_OUT;
  }

  /** 1 when the cards leave towards the right / the bottom, else -1 */
  get #outSign(): 1 | -1 {
    return this.#direction === CardController.RIGHT_OUT || this.#direction === CardController.BOTTOM_OUT ? 1 : -1;
  }

  /**
   * The translation of a card: out of the owner, plus px pixels
   */
  #translation(out: boolean, px = 0): string {
    const offset = out ? (px ? `calc(${this.#outSign * 100}% + ${px}px)` : `${this.#outSign * 100}%`) : `${px}px`;
    return this.isHorizontal ? `${offset},0,0` : `0,${offset},0`;
  }

  protected override layoutView(view: View<any>, index: number, currentIndex: number): void {
    // the next cards are above the previous ones
    view.setStyle('z-index', index + 1);
    place(view, `translate3d(${this.#translation(index > currentIndex)})`);
    if (index === currentIndex) view.show();
    else view.hide();
  }

  protected override async stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void> {
    to.show();
    if (order > 0) {
      // the new card comes over the current one
      if (!this.#dragged) place(to, `translate3d(${this.#translation(true)})`);
      await this.animateView(to, [['translate', this.#translation(false)]], instant);
    } else {
      // the current card leaves, the previous one is below
      place(to, `translate3d(${this.#translation(false)})`);
      await this.animateView(from, [['translate', this.#translation(true)]], instant);
    }
    from.hide();
  }

  /*****************************************************************
   *  Swipe: the cards follow the pointer
   ****************************************************************/

  protected override dragStart(): void {
    this.#dragged = undefined;
  }

  protected override dragMove(dx: number, dy: number): void {
    const delta = this.isHorizontal ? dx : dy;
    const index = this.currentIndex;
    if (delta * this.#outSign > 0) {
      // the current card leaves, the previous one appears below
      const current = this.currentView, previous = this.viewAt(index - 1);
      if (!current || !previous) return;
      previous.show();
      place(current, `translate3d(${this.#translation(false, delta)})`);
      this.#dragged = { view: current, isNext: false };
    } else {
      // the next card comes
      const next = this.viewAt(index + 1);
      if (!next) return;
      next.show();
      place(next, `translate3d(${this.#translation(true, delta)})`);
      this.#dragged = { view: next, isNext: true };
    }
  }

  protected override dragEnd(dx: number, dy: number): Promise<boolean> {
    const delta = (this.isHorizontal ? dx : dy) * this.#outSign;
    let move: Promise<boolean> = Promise.resolve(false);
    if (delta > SWIPE_THRESHOLD) move = this.goToPreviousView();
    else if (delta < -SWIPE_THRESHOLD) move = this.goToNextView();
    return move.then(moved => {
      if (!moved) this.cancelDrag();
      this.#dragged = undefined;
      return moved;
    });
  }

  protected override cancelDrag(): void {
    const dragged = this.#dragged;
    if (!dragged) return;
    const { view, isNext } = dragged;
    this.animateView(view, [['translate', this.#translation(isNext)]], false).then(() => {
      if (isNext) view.hide();
      else this.viewAt(this.currentIndex - 1)?.hide();
    });
  }

  /**
   * The side the cards leave to: CardController.LEFT_OUT, RIGHT_OUT
   * (default), TOP_OUT or BOTTOM_OUT
   */
  @InOut set direction(v: number) {
    if (v !== CardController.LEFT_OUT && v !== CardController.RIGHT_OUT &&
        v !== CardController.TOP_OUT && v !== CardController.BOTTOM_OUT) return;
    this.#direction = v;
    this.updateViewSize();
  }
  get direction(): number {
    return this.#direction;
  }
}

export default CardController;
