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


import { InOut, type ModelEvents } from 'vs_toolkit/vs_core';

import { View, type ViewChild } from '../View/View';
import html_template from './ScrollView.html';

const LAYOUTS = [
  View.HORIZONTAL_LAYOUT, View.DEFAULT_LAYOUT, View.ABSOLUTE_LAYOUT, View.VERTICAL_LAYOUT,
  View.FLOW_LAYOUT, View.LEGACY_HORIZONTAL_LAYOUT, View.LEGACY_ABSOLUTE_LAYOUT,
  View.LEGACY_VERTICAL_LAYOUT, View.LEGACY_FLOW_LAYOUT,
];

/** the inline styles set while the view scrolls */
const VIEW_STYLES = ['display', 'flex-direction'];
const CONTENT_STYLES = ['flex', 'min-width', 'min-height', 'overflow-x', 'overflow-y', 'overscroll-behavior'];

/**
 *  @class
 *  A ScrollView scrolls its content (the 'children' hole) natively, between
 *  a top bar and a bottom bar (the 'top_bar' and 'bottom_bar' holes).
 *  <p>
 *  A child class with a static scrollViewHole ('top_bar', 'bottom_bar')
 *  is added to that hole (NavigationBar, ToolBar).
 *
 *  @example
 *  const view = new ScrollView({ scroll: ScrollView.VERTICAL_SCROLL });
 *  view.init();
 *  view.add(content);
 *  view.scrollTo(0, 100, 200);
 *
 * @extends vs.ui.View
 * @name vs.ui.ScrollView
 */
export class ScrollView<Events extends ModelEvents = {}> extends View<Events> {
  static NO_SCROLL = 0;
  static VERTICAL_SCROLL = 1;
  static HORIZONTAL_SCROLL = 2;
  static SCROLL = 3;

  protected override htmlTemplate = html_template;

  /** the node of the content, which scrolls */
  protected contentView: HTMLElement | null = null;

  #scroll = ScrollView.NO_SCROLL;
  #layout: string | null = null;

  protected override initComponent(): void {
    super.initComponent();
    this.contentView = this.view!.querySelector<HTMLElement>(':scope > .content') ?? this.view;
    if (this.#layout) this.contentView!.classList.add(this.#layout);
    this.#applyScroll();
  }

  protected override destructor(): void {
    this.contentView = null;
    super.destructor();
  }

  /**
   *  Adds a child; a child class with a static scrollViewHole is added to
   *  that hole (a NavigationBar to the top bar, a ToolBar to the bottom
   *  bar)
   */
  override add(child: ViewChild, extension?: string, view?: HTMLElement): void {
    const hole = (child?.constructor as { scrollViewHole?: string } | undefined)?.scrollViewHole;
    super.add(child, hole ?? extension, view);
  }

  /**
   *  The node which scrolls: the content node (between the bars) by
   *  default
   */
  protected scrollContainer(): HTMLElement | null {
    return this.contentView;
  }

  #applyScroll(): void {
    const view = this.view, container = this.scrollContainer();
    if (!view || !container) return;
    if (this.#scroll === ScrollView.NO_SCROLL) {
      if (container !== view) VIEW_STYLES.forEach(property => view.style.removeProperty(property));
      CONTENT_STYLES.forEach(property => container.style.removeProperty(property));
      return;
    }
    // the content takes the space between the bars, and scrolls
    if (container !== view) {
      view.style.display = 'flex';
      view.style.flexDirection = 'column';
      container.style.flex = '1 1 auto';
      container.style.minWidth = '0';
      container.style.minHeight = '0';
    }
    const horizontal = this.#scroll === ScrollView.HORIZONTAL_SCROLL || this.#scroll === ScrollView.SCROLL;
    const vertical = this.#scroll === ScrollView.VERTICAL_SCROLL || this.#scroll === ScrollView.SCROLL;
    container.style.overflowX = horizontal ? 'auto' : 'hidden';
    container.style.overflowY = vertical ? 'auto' : 'hidden';
    container.style.overscrollBehavior = 'contain';
  }

  /**
   * Scrolls the content to (x, y), animated during time ms (0, no
   * animation, by default)
   */
  scrollTo(x: number, y: number, time = 0): void {
    this.scrollContainer()?.scrollTo({ left: x, top: y, behavior: time > 0 ? 'smooth' : 'auto' });
  }

  /**
   * The scroll position of the content [x, y]
   */
  get scrollPosition(): [number, number] {
    const container = this.scrollContainer();
    return container ? [container.scrollLeft, container.scrollTop] : [0, 0];
  }

  /**
   * The scroll: ScrollView.NO_SCROLL (default), VERTICAL_SCROLL,
   * HORIZONTAL_SCROLL or SCROLL (both); true for SCROLL, false for
   * NO_SCROLL
   */
  @InOut set scroll(v: number | boolean) {
    if (v === true) v = ScrollView.SCROLL;
    if (v === false || v === null || v === undefined) v = ScrollView.NO_SCROLL;
    if (v !== ScrollView.NO_SCROLL && v !== ScrollView.VERTICAL_SCROLL &&
        v !== ScrollView.HORIZONTAL_SCROLL && v !== ScrollView.SCROLL) return;
    this.#scroll = v;
    this.#applyScroll();
  }
  get scroll(): number {
    return this.#scroll;
  }

  /**
   * The layout of the content (see View.layout)
   */
  override set layout(v: string | null) {
    if (v && !LAYOUTS.includes(v)) {
      console.error(`Unsupported layout '${v}'!`);
      return;
    }
    const layout = !v || v.includes('_layout') ? v : `${v}_layout`;
    if (layout === this.#layout) return;
    if (this.#layout) this.contentView?.classList.remove(this.#layout);
    this.#layout = layout;
    if (layout) this.contentView?.classList.add(layout);
    this.propertyChange('layout');
  }
  override get layout(): string | null {
    return this.#layout;
  }

  /**
   * The HTML content of the content node
   */
  override set innerHTML(v: string) {
    if (this.contentView) this.contentView.innerHTML = v;
    this.propertyChange('innerHTML');
  }
}

export default ScrollView;
