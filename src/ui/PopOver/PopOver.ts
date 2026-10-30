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


import { isArray, isFunction, isNumber } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import { onPointerDownOutside } from '../helpers';
import html_template from './PopOver.html';

/** the space between the point and the popover, in px */
const ARROW_SIZE = 15;
/** the minimal space between the popover and the window borders, in px */
const MARGIN = 5;

/**
 *  @class
 *  A PopOver presents information temporarily on top of the other views,
 *  with an arrow to the point it is about. It is hidden until shown, and
 *  when a pointer goes down outside.
 *  <p/>
 *  show(point, direction) displays it pointing at the point [x, y] (in the
 *  window), ABOVE, BELOW, at the LEFT or at the RIGHT of the point (chosen
 *  according to the space, without direction).
 *  <p/>
 *  The popover has three holes: 'children', the main view, and the
 *  'header' and 'footer' views, displayed with hasHeader and hasFooter
 *  (the navigation buttons, cancel or validation buttons…).
 *
 *  @example
 *  const popOver = new PopOver();
 *  popOver.init();
 *  popOver.add(list, 'children');
 *
 *  popOver.hasFooter = true;
 *  popOver.add(cancelButton, 'footer');
 *
 *  popOver.show([300, 100], PopOver.RIGHT);
 *
 * @extends vs.ui.View
 * @name vs.ui.PopOver
 */
export class PopOver extends View {
  static BELOW = 0;
  static ABOVE = 1;
  static LEFT = 2;
  static RIGHT = 3;

  protected override htmlTemplate = html_template;

  /** the arrow node */
  protected arrow: HTMLElement | null = null;

  #point: number[] | null = null;
  #direction: number | undefined;
  #hasHeader = false;
  #hasFooter = false;
  #stopWatchingPointer: (() => void) | undefined;

  protected override initComponent(): void {
    super.initComponent();
    this.arrow = this.view!.querySelector<HTMLElement>(':scope > .arrow');
    this.view!.classList.toggle('withHeader', this.#hasHeader);
    this.view!.classList.toggle('withFooter', this.#hasFooter);
  }

  /**
   * A popover is hidden until shown (unless the visible option is true)
   */
  protected override componentDidInitialize(): void {
    this.hide();
    super.componentDidInitialize();
  }

  protected override destructor(): void {
    this.#stopWatchingPointer?.();
    this.#stopWatchingPointer = undefined;
    this.arrow = null;
    super.destructor();
  }

  /**
   *  Displays the popover, pointing at the point [x, y] of the window, in
   *  the direction (PopOver.BELOW, ABOVE, LEFT, RIGHT; chosen according to
   *  the space by default); clb is called at the end.
   *  Without point, the popover is displayed where it is.
   */
  override show(clb?: Function): void;
  override show(point: number[] | null, direction?: number, clb?: Function): void;
  override show(point?: number[] | Function | null, direction?: number, clb?: Function): void {
    if (isFunction(point)) {
      clb = point;
      point = undefined;
    }
    if (!this.view || this.visible) return;

    const isPoint = isArray(point) && point.length === 2 && isNumber(point[0]) && isNumber(point[1]);
    this.#point = isPoint ? (point as number[]).slice() : null;
    this.#direction = direction;

    super.show(clb);
    this.#layout();

    this.#stopWatchingPointer?.();
    this.#stopWatchingPointer = onPointerDownOutside(this.view, event => {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
    });
  }

  override hide(clb?: Function): void {
    this.#stopWatchingPointer?.();
    this.#stopWatchingPointer = undefined;
    super.hide(clb);
  }

  /**
   * The direction according to the space around the point
   */
  #autoDirection(point: number[], height: number): number {
    const direction = point[0] > window.innerWidth / 2 ? PopOver.RIGHT : PopOver.LEFT;
    if (point[1] + height + 2 * ARROW_SIZE < window.innerHeight) return PopOver.BELOW;
    if (point[1] - height - 2 * ARROW_SIZE > 0) return PopOver.ABOVE;
    return direction;
  }

  /**
   * Positions the popover and its arrow at the point
   */
  #layout(): void {
    const view = this.view;
    const point = this.#point;
    if (!view || !point) return;

    const width = view.offsetWidth || Math.max(this.size[0], 0);
    const height = view.offsetHeight || Math.max(this.size[1], 0);
    const maxX = window.innerWidth, maxY = window.innerHeight;
    let x = point[0] - width / 2;
    let y = point[1] - height / 2;

    const directions = [PopOver.BELOW, PopOver.ABOVE, PopOver.LEFT, PopOver.RIGHT];
    const direction = directions.includes(this.#direction as number)
      ? this.#direction as number
      : this.#autoDirection(point, height);

    let arrowClass: string, maskPosition: string;
    let arrowLeft = `${MARGIN}px`, arrowRight = `${MARGIN}px`;

    if (direction === PopOver.BELOW || direction === PopOver.ABOVE) {
      y += direction === PopOver.BELOW ? height / 2 + ARROW_SIZE : -height / 2 - ARROW_SIZE;
      x = Math.min(Math.max(x, MARGIN), maxX - width - MARGIN);
      arrowClass = direction === PopOver.BELOW ? 'top' : 'bottom';
      maskPosition = `${point[0] - x - ARROW_SIZE - 8}px 0px`;
    } else {
      x += direction === PopOver.LEFT ? width / 2 + ARROW_SIZE : -width / 2 - ARROW_SIZE;
      y = Math.min(Math.max(y, MARGIN), maxY - height - 20);
      if (direction === PopOver.LEFT) {
        arrowClass = 'left';
        arrowLeft = '-13px';
        arrowRight = 'auto';
        maskPosition = `0px ${point[1] - y - ARROW_SIZE - 2}px`;
      } else {
        arrowClass = 'right';
        arrowLeft = 'auto';
        arrowRight = '-13px';
        maskPosition = `0px ${height - (point[1] - y + ARROW_SIZE) - 2}px`;
      }
    }

    if (this.arrow) {
      this.arrow.className = `arrow ${arrowClass}`;
      this.arrow.style.left = arrowLeft;
      this.arrow.style.right = arrowRight;
      this.arrow.style.setProperty('-webkit-mask-position', maskPosition);
      this.arrow.style.setProperty('mask-position', maskPosition);
    }

    // the position in the parent
    const parent = view.parentElement?.getBoundingClientRect();
    this.position = [x - (parent?.left ?? 0), y - (parent?.top ?? 0)];
  }

  /**
   * Displays the header (the 'withHeader' class name)
   */
  @InOut set hasHeader(v: boolean) {
    this.#hasHeader = !!v;
    this.view?.classList.toggle('withHeader', this.#hasHeader);
  }
  get hasHeader(): boolean {
    return this.#hasHeader;
  }

  /**
   * Displays the footer (the 'withFooter' class name)
   */
  @InOut set hasFooter(v: boolean) {
    this.#hasFooter = !!v;
    this.view?.classList.toggle('withFooter', this.#hasFooter);
  }
  get hasFooter(): boolean {
    return this.#hasFooter;
  }
}

export default PopOver;
