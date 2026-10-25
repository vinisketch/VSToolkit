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


import { isArray, isString } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View, type ViewChild } from '../View/View';
import { CSS_SYMBIAN, getDeviceCSSCode } from '../theme';
import html_template from './NavigationBar.html';

/**
 *  @class
 *  A NavigationBar is displayed at the top of a view (the top bar of a
 *  ScrollView): typically navigation buttons and a title, or any widget.
 *  <p>
 *  Its children are grouped by states: changeState shows the children of
 *  a state, and hides the others.
 *
 *  @example
 *  const bar = new NavigationBar();
 *  bar.init();
 *  bar.setStateItems('list', [title, editButton]);
 *  bar.setStateItems('detail', [backButton, title]);
 *  bar.changeState('list');
 *
 * @extends vs.ui.View
 * @name vs.ui.NavigationBar
 */
export class NavigationBar extends View {
  static DEFAULT_STYLE = 'blue_style';
  static BLACK_TRANSLUCIDE_STYLE = 'black_translucide_style';
  static BLACK_STYLE = 'black_style';

  /** added to the top bar of a ScrollView */
  static scrollViewHole = 'top_bar';

  protected override htmlTemplate = html_template;

  #style = NavigationBar.DEFAULT_STYLE;
  #states = new Map<string, ViewChild[]>();
  #currentState: string | null = null;

  protected override initComponent(): void {
    super.initComponent();
    // slides up to hide
    const height = getDeviceCSSCode() === CSS_SYMBIAN ? 50 : 44;
    this.setHideAnimation([['translateY', `-${height}px`]]);
    this.setShowAnimation([['translateY', '0px']]);
    if (this.#style) this.addClassName(this.#style);
  }

  /*****************************************************************
   *  States
   ****************************************************************/

  /**
   *  Sets the children of a state (added to the bar if needed)
   */
  setStateItems(state: string, items: ViewChild[]): void {
    if (!isString(state) || !state || !isArray(items)) return;
    this.#states.set(state, items.slice());
    for (const item of items) {
      if (!this.isChild(item)) this.add(item, 'children');
    }
    if (this.#currentState === state) this.#showStateItems(items);
  }

  /**
   *  Returns the children of a state
   */
  getStateItems(state: string): ViewChild[] | undefined {
    return this.#states.get(state)?.slice();
  }

  /**
   *  Shows the children of the state, and hides the others. The children
   *  can be configured: { [child id]: { property: value } }
   */
  changeState(state: string, configuration?: Record<string, Record<string, unknown>>): void {
    if (!state) return;
    this.#currentState = state;
    const items = this.#states.get(state) ?? [];
    for (const item of items) {
      const values = configuration?.[item.id];
      if (values) Object.assign(item, values);
    }
    this.#showStateItems(items);
  }

  /**
   *  The current state
   */
  get currentState(): string | null {
    return this.#currentState;
  }

  #showStateItems(items: ViewChild[]): void {
    for (const child of this.getChildren()) {
      if (child instanceof View && !items.includes(child)) child.hide();
    }
    for (const item of items) {
      if (item instanceof View) item.show();
    }
  }

  /**
   *  Removes a child, also from the states
   */
  override remove(child: ViewChild): void {
    super.remove(child);
    for (const items of this.#states.values()) {
      const index = items.indexOf(child);
      if (index !== -1) items.splice(index, 1);
    }
  }

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The style: a class name (NavigationBar.DEFAULT_STYLE…)
   */
  @InOut set style(v: string) {
    if (!isString(v)) return;
    if (this.#style) this.removeClassName(this.#style);
    this.#style = v;
    this.addClassName(v);
  }
  get style(): string {
    return this.#style;
  }

  /**
   * The size of the bar is given by its theme: the size of the node
   */
  override set size(_v: number[]) {
    // the theme sizes the bar
  }
  override get size(): number[] {
    return this.view ? [this.view.offsetWidth, this.view.offsetHeight] : super.size;
  }

  /**
   * The position of the bar is given by its parent: the position of the
   * node
   */
  override set position(_v: number[]) {
    // the parent positions the bar
  }
  override get position(): number[] {
    return this.view ? [this.view.offsetLeft, this.view.offsetTop] : super.position;
  }
}

export default NavigationBar;
