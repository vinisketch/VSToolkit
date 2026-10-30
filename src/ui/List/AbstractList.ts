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
import { InOut, type ModelEvents } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import TapRecognizer, { type TapDelegate } from '../Recognizers/TapRecognizer';

/**
 *  @class
 *  The base of the lists (List, CheckBox, RadioButton): a view which
 *  renders its data in its items node (the 'item_children' hole, or its
 *  first ul), scrolls natively (scroll), and gives the touch feedback and
 *  the selection of its items (itemsSelectable).
 *  <p>
 *  A subclass renders the data (renderData), and finds the index of the
 *  item of a node (itemIndexOf).
 *
 * @extends vs.ui.View
 * @name vs.ui.AbstractList
 */
export abstract class AbstractList<Item = unknown, Events extends ModelEvents = {}>
  extends View<Events> implements TapDelegate {

  /** the node of the items */
  protected itemsView: HTMLElement | null = null;

  #data: Item[] = [];
  #scroll = false;
  #itemsSelectable = true;
  #tapRecognizer: TapRecognizer | undefined;
  #touchedIndex = -1;

  protected override initComponent(): void {
    super.initComponent();
    const view = this.view!;
    this.itemsView = view.querySelector<HTMLElement>('[x-hag-hole="item_children"]')
      ?? view.querySelector('ul')
      ?? view;

    this.#tapRecognizer = new TapRecognizer(this);
    this.addPointerRecognizer(this.#tapRecognizer);

    this.#applyScroll();
    this.renderData();
  }

  protected override destructor(): void {
    if (this.#tapRecognizer) {
      this.removePointerRecognizer(this.#tapRecognizer);
      this.#tapRecognizer = undefined;
    }
    this.itemsView = null;
    super.destructor();
  }

  /*****************************************************************
   *  Subclass API
   ****************************************************************/

  /**
   * Renders the data in the items node (called once initialized and when
   * the data change)
   */
  protected abstract renderData(): void;

  /**
   * Returns the index of the item of the node (in the items node), -1 for
   * a node out of the items
   */
  protected abstract itemIndexOf(node: Node | null): number;

  /**
   * Returns the node of the item at the index
   */
  protected abstract itemNodeAt(index: number): HTMLElement | undefined;

  /** gives the feedback of a touched item */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  protected touchItemFeedback(_index: number): void {}

  /** removes the feedback of a touched item */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  protected untouchItemFeedback(_index: number): void {}

  /** the user tapped the item */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  protected didSelectItem(_index: number): void {}

  /*****************************************************************
   *  Tap delegate
   ****************************************************************/

  didTouch(_target: unknown, _element: HTMLElement, event: PointerEvent): void {
    this.#untouchItem();
    if (!this.#itemsSelectable) return;
    const index = this.itemIndexOf(event.target as Node | null);
    if (index === -1) return;
    this.#touchedIndex = index;
    this.touchItemFeedback(index);
  }

  didUntouch(): void {
    // the touched item is selected on tap
    const index = this.#touchedIndex;
    if (index !== -1) this.untouchItemFeedback(index);
  }

  didTap(): void {
    const index = this.#touchedIndex;
    this.#touchedIndex = -1;
    if (index !== -1 && this.#itemsSelectable) this.didSelectItem(index);
  }

  #untouchItem(): void {
    if (this.#touchedIndex !== -1) this.untouchItemFeedback(this.#touchedIndex);
    this.#touchedIndex = -1;
  }

  /*****************************************************************
   *  Scroll
   ****************************************************************/

  #applyScroll(): void {
    const style = this.itemsView?.style;
    if (!style) return;
    if (this.#scroll) {
      style.overflowY = 'auto';
      style.height = '100%';
      style.boxSizing = 'border-box';
      style.overscrollBehavior = 'contain';
    } else {
      for (const property of ['overflow-y', 'height', 'box-sizing', 'overscroll-behavior']) {
        style.removeProperty(property);
      }
    }
  }

  /**
   * Scrolls to the item at the index, animated during time ms (200 by
   * default, 0 for no animation)
   */
  scrollToElementAt(index: number, time = 200): void {
    const container = this.itemsView, node = this.itemNodeAt(index);
    if (!this.#scroll || !container || !node) return;
    const top = container.scrollTop + node.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({ top, behavior: isNumber(time) && time > 0 ? 'smooth' : 'auto' });
  }

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The items of the list
   */
  @InOut set data(v: Item[]) {
    if (!isArray(v)) return;
    this.#data = v.slice();
    this.#touchedIndex = -1;
    if (this.view) this.renderData();
  }
  get data(): Item[] {
    return this.#data.slice();
  }

  /**
   * The items, without copy (for the subclasses)
   */
  protected get items(): readonly Item[] {
    return this.#data;
  }

  /**
   * The items scroll (vertically, natively), false by default
   */
  @InOut set scroll(v: boolean) {
    this.#scroll = !!v;
    this.#applyScroll();
  }
  get scroll(): boolean {
    return this.#scroll;
  }

  /**
   * The items give a touch feedback and are selected when tapped (true by
   * default)
   */
  @InOut set itemsSelectable(v: boolean) {
    this.#itemsSelectable = !!v;
    if (!this.#itemsSelectable) this.#untouchItem();
  }
  get itemsSelectable(): boolean {
    return this.#itemsSelectable;
  }
}

export default AbstractList;
