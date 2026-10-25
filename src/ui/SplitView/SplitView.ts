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

import { View, type ViewChild } from '../View/View';
import { PopOver } from '../PopOver/PopOver';
import type { Button } from '../Button/Button';
import html_template from './SplitView.html';

/**
 * The delegate of a SplitView: notified when the second view moves
 */
export interface SplitViewDelegate {
  /** the second view is displayed in its panel */
  willShowView?(view: ViewChild, popOver: PopOver): void;
  /** the second view is moved into the popover */
  willHideView?(view: ViewChild, popOver: PopOver): void;
}

/** the width of the second view in the popover, in px */
const SECOND_VIEW_WIDTH = 320;
const POP_OVER_BORDER_WIDTH = 8;
const POP_OVER_HEIGHT = 500;

/**
 *  @class
 *  A SplitView presents two views: the main view (the 'main_panel' hole)
 *  and a second view (the 'second_panel' hole).
 *  <p/>
 *  In tablet mode, the views are side by side in the horizontal (landscape)
 *  orientation; in the vertical (portrait) orientation, the second view is
 *  moved into a PopOver (see showPopOver).
 *  In mobile mode, the second view is always in its panel, and the main
 *  view slides over it (see showMainView, the 'main_view_visible' class
 *  name).
 *
 *  @example
 *  const splitView = new SplitView();
 *  splitView.init();
 *  splitView.delegate = {
 *    willShowView(view, popOver) { … },
 *    willHideView(view, popOver) { … },
 *  };
 *  splitView.add(menuPanel, 'second_panel');
 *  splitView.add(mainPanel, 'main_panel');
 *
 * @extends vs.ui.View
 * @name vs.ui.SplitView
 */
export class SplitView extends View {
  static TABLET_MODE = 'tablet';
  static MOBILE_MODE = 'mobile';

  static VERTICAL = 'vertical';
  static HORIZONTAL = 'horizontal';

  static RIGHT = 'right';
  static LEFT = 'left';
  static BOTTOM = 'bottom';
  static TOP = 'top';

  protected override htmlTemplate = html_template;

  /** notified when the second view moves */
  delegate: SplitViewDelegate | null = null;

  /** the popover of the second view, in the tablet vertical orientation */
  protected readonly popOver = new PopOver();

  #secondViews: ViewChild[] = [];
  #mode = SplitView.TABLET_MODE;
  #orientation = '';
  #secondPanelPosition = SplitView.LEFT;
  #hideMainPanelButton: Button | null = null;
  #showPopOverButton: Button | null = null;
  #unbindHideMainPanelButton: (() => void) | undefined;
  #unbindShowPopOverButton: (() => void) | undefined;

  protected override initComponent(): void {
    super.initComponent();
    this.popOver.init();
    this.popOver.hide();
    document.body.appendChild(this.popOver.view!);

    if (!this.#orientation) {
      const portrait = window.matchMedia?.('(orientation: portrait)').matches
        ?? window.innerHeight >= window.innerWidth;
      this.#orientation = portrait ? SplitView.VERTICAL : SplitView.HORIZONTAL;
    }
    this.addClassName(this.#mode, this.#orientation, this.#secondPanelPosition);
    this.#placeSecondView();
  }

  protected override destructor(): void {
    this.#unbindHideMainPanelButton?.();
    this.#unbindShowPopOverButton?.();
    this.#unbindHideMainPanelButton = this.#unbindShowPopOverButton = undefined;
    this.#hideMainPanelButton = this.#showPopOverButton = null;

    // the second views in the popover are destroyed with it
    const popOverNode = this.popOver.view;
    this.popOver.destroy();
    popOverNode?.remove();
    this.#secondViews = [];
    super.destructor();
  }

  /**
   *  Adds a child: to the second panel (the 'second_panel' hole, or the
   *  popover), else to the main panel
   */
  override add(child: ViewChild, extension?: string, view?: HTMLElement): void {
    if (extension !== 'second_panel') {
      super.add(child, 'main_panel', view);
      return;
    }
    if (!this.#secondViews.includes(child)) this.#secondViews.push(child);
    if (this.#isSecondPanelVisible()) super.add(child, 'second_panel', view);
    else this.popOver.add(child);
  }

  override remove(child: ViewChild): void {
    const index = this.#secondViews.indexOf(child);
    if (index !== -1) {
      this.#secondViews.splice(index, 1);
      if (this.popOver.isChild(child)) this.popOver.remove(child);
    }
    super.remove(child);
  }

  override removeAllChildren(shouldDestroy = false, extension?: string): ViewChild[] | undefined {
    const inPopOver = !extension || extension === 'second_panel'
      ? this.#secondViews.filter(child => this.popOver.isChild(child))
      : [];
    inPopOver.forEach(child => {
      this.remove(child);
      if (shouldDestroy) child.destroy();
    });
    const removed = super.removeAllChildren(shouldDestroy, extension);
    return shouldDestroy ? undefined : [...inPopOver, ...(removed ?? [])];
  }

  override refresh(): void {
    super.refresh();
    if (this.popOver.visible) this.popOver.refresh();
  }

  /**
   *  Changes the orientation (an angle: -90 or 90 for the horizontal
   *  orientation), called when the device orientation changes
   */
  orientationWillChange(orientation: number): void {
    this.orientation = orientation === 90 || orientation === -90 ? SplitView.HORIZONTAL : SplitView.VERTICAL;
  }

  orientationDidChange(): void {
    this.refresh();
  }

  /**
   *  Displays the popover of the second view (in the tablet vertical
   *  orientation), see PopOver.show
   */
  showPopOver(point: number[], direction?: number): void {
    if (this.#mode !== SplitView.TABLET_MODE || this.#orientation !== SplitView.VERTICAL) return;
    this.popOver.show(point, direction);
    this.popOver.refresh();
  }

  /**
   *  Hides the popover of the second view
   */
  hidePopOver(): void {
    this.popOver.hide();
  }

  /**
   *  Displays the main view over the second view (in mobile mode)
   */
  showMainView(): void {
    if (this.#mode !== SplitView.MOBILE_MODE) return;
    this.#hideMainPanelButton?.show();
    this.addClassName('main_view_visible');
  }

  /**
   *  Hides the main view (in mobile mode)
   */
  hideMainView(): void {
    if (this.#mode !== SplitView.MOBILE_MODE) return;
    this.#hideMainPanelButton?.hide();
    this.removeClassName('main_view_visible');
  }

  #isSecondPanelVisible(): boolean {
    return this.#mode === SplitView.MOBILE_MODE || this.#orientation === SplitView.HORIZONTAL;
  }

  /**
   * Moves the first second view into its panel or into the popover
   */
  #placeSecondView(): void {
    if (!this.view) return;
    const child = this.#secondViews[0];
    if (!child) return;

    if (this.#isSecondPanelVisible()) {
      this.popOver.hide();
      if (this.popOver.isChild(child)) this.popOver.remove(child);
      if (!this.isChild(child)) super.add(child, 'second_panel');
      if (child instanceof View) child.show(() => child.refresh());
      this.#showPopOverButton?.hide();
      this.delegate?.willShowView?.(child, this.popOver);
    } else {
      if (this.isChild(child)) super.remove(child);
      if (!this.popOver.isChild(child)) this.popOver.add(child);
      if (child instanceof View) child.show();
      this.popOver.size = [SECOND_VIEW_WIDTH + 2 * POP_OVER_BORDER_WIDTH, POP_OVER_HEIGHT];
      this.#showPopOverButton?.show();
      this.delegate?.willHideView?.(child, this.popOver);
    }
  }

  /**
   * The button which hides the main view (in mobile mode)
   */
  set hideMainPanelButton(button: Button | null) {
    this.#unbindHideMainPanelButton?.();
    this.#unbindHideMainPanelButton = undefined;
    this.#hideMainPanelButton = button;
    if (!button) return;
    if (this.#mode === SplitView.TABLET_MODE) button.hide();
    this.#unbindHideMainPanelButton = button.on('select', () => this.hideMainView());
  }
  get hideMainPanelButton(): Button | null {
    return this.#hideMainPanelButton;
  }

  /**
   * The button which displays the popover (in tablet mode)
   */
  set showPopOverButton(button: Button | null) {
    this.#unbindShowPopOverButton?.();
    this.#unbindShowPopOverButton = undefined;
    this.#showPopOverButton = button;
    if (!button) return;
    if (this.#isSecondPanelVisible()) button.hide();
    this.#unbindShowPopOverButton = button.on('select', () => this.showPopOver([20, 20]));
  }
  get showPopOverButton(): Button | null {
    return this.#showPopOverButton;
  }

  /**
   * The mode: SplitView.TABLET_MODE (default) or MOBILE_MODE (also a class
   * name)
   */
  @InOut set mode(v: string) {
    if (v !== SplitView.TABLET_MODE && v !== SplitView.MOBILE_MODE) return;
    this.removeClassName(this.#mode);
    this.#mode = v;
    this.addClassName(v);
    this.#placeSecondView();
  }
  get mode(): string {
    return this.#mode;
  }

  /**
   * The orientation: SplitView.VERTICAL or HORIZONTAL (also a class name),
   * the window orientation by default
   */
  @InOut set orientation(v: string) {
    if (v !== SplitView.VERTICAL && v !== SplitView.HORIZONTAL) return;
    if (this.#orientation) this.removeClassName(this.#orientation);
    this.#orientation = v;
    this.addClassName(v);
    this.#placeSecondView();
  }
  get orientation(): string {
    return this.#orientation;
  }

  /**
   * The position of the second panel: SplitView.LEFT (default), RIGHT, TOP
   * or BOTTOM (also a class name)
   */
  @InOut set secondPanelPosition(v: string) {
    if (v !== SplitView.LEFT && v !== SplitView.RIGHT && v !== SplitView.TOP && v !== SplitView.BOTTOM) return;
    this.removeClassName(this.#secondPanelPosition);
    this.#secondPanelPosition = v;
    this.addClassName(v);
  }
  get secondPanelPosition(): string {
    return this.#secondPanelPosition;
  }
}

export default SplitView;
