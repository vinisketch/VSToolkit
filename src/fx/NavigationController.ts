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


import { isNumber, isString } from 'vs_utils';
import { Component, InOut } from 'vs_toolkit/vs_core';
import { Animation, NavigationBar, View } from 'vs_toolkit/vs_ui';

import { Controller, type ControllerOptions, type TransitionContext } from './Controller';
import { place } from './helpers';

/**
 * A component shown in the navigation bar for a view, and its properties
 */
export interface NavigationBarItem {
  /** the component, or its id */
  comp: View<any> | string;
  /** the properties set to the component when the view is shown */
  properties?: Record<string, unknown>;
}

/**
 * The options of a navigation controller
 */
export interface NavigationControllerOptions extends ControllerOptions {
  navigationBar?: NavigationBar | null;
  /** NavigationController.SLIDE_ANIMATION (default), CARD_ANIMATION or NO_ANIMATION */
  animationType?: number;
}

/**
 *  @class
 *  A NavigationController navigates in hierarchical contents: from a first
 *  view (the initialComponent) to a second one, a third one… and back
 *  (the NavigationController.BACK input) to the first one.
 *  <pre>
 *   ⎡ˉˉˉˉˉˉ⎤    ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟  (1) ⎢__> ⎢  (2) ⎢__>⎟  (3) ⎢
 *   ⎟      ⎢<__ ⎢      ⎢<__⎟      ⎢
 *   ⎣______⎦    ⎣______⎦   ⎣______⎦
 *        ⎣__>⎡ˉˉˉˉˉˉ⎤
 *        ⎢<__⎢  (4) ⎢
 *            ⎣______⎦
 *  </pre>
 *  It configures a navigation bar for each view: the components shown, and
 *  their properties (e.g. the text of a title).
 *
 *  @example
 *  const controller = new NavigationController(app, { navigationBar: navBar });
 *  controller.push(firstView);
 *  controller.configureNavigationBarState(firstView.id, []);
 *  controller.initialComponent = firstView.id;
 *
 *  const id = controller.push('PanelOne', { data: { title: 'One' } });
 *  controller.configureNavigationBarState(id, [
 *    { comp: backButton }, { comp: title, properties: { text: 'Panel One' } },
 *  ]);
 *  controller.configureTransition(firstView.id, id, 'goToOne');
 *
 *  await controller.notify('goToOne');
 *  await controller.notify(NavigationController.BACK);
 *
 * @extends vs.fx.Controller
 * @name vs.fx.NavigationController
 */
export class NavigationController extends Controller {
  /** no animation between the views */
  static NO_ANIMATION = 0;
  /** the new view comes over the current one */
  static CARD_ANIMATION = 1;
  /** the views slide (default) */
  static SLIDE_ANIMATION = 2;
  static DEFAULT_ANIMATION = NavigationController.SLIDE_ANIMATION;

  /** the input going back to the previous view */
  static BACK = 'back';

  static ANIMATION_DURATION = 300;

  #navigationBar: NavigationBar | null = null;
  #animationType = NavigationController.DEFAULT_ANIMATION;
  #animationDuration = NavigationController.ANIMATION_DURATION;
  /** the components of the navigation bar for each view, and their properties */
  readonly #barStates = new Map<string, { components: View<any>[]; configuration: Record<string, Record<string, unknown>> }>();

  constructor(owner: View<any>, options: NavigationControllerOptions = {}) {
    super(owner, options);
    this.fsm.addInput(NavigationController.BACK);
    this.navigationBar = options.navigationBar ?? null;
    if (options.animationType !== undefined) this.animationType = options.animationType;
  }

  /**
   *  Sets the components shown in the navigation bar for a view, and their
   *  properties
   */
  configureNavigationBarState(id: string, items: NavigationBarItem[]): void {
    if (!this.hasState(id) || !items) return;
    const components: View<any>[] = [];
    const configuration: Record<string, Record<string, unknown>> = {};
    for (const item of items) {
      const comp = isString(item?.comp) ? Component.instances.get(item.comp) : item?.comp;
      if (!(comp instanceof View)) continue;
      components.push(comp);
      if (item.properties) configuration[comp.id] = item.properties;
    }
    this.#barStates.set(id, { components, configuration });
    const bar = this.#navigationBar;
    if (!bar) return;
    bar.setStateItems(id, components);
    // the new components are hidden, except the ones of the current view
    const current = this.currentState;
    if (current) bar.changeState(current, this.#barStates.get(current)?.configuration);
  }

  /**
   *  Adds the transition from a view to another on an input, and the
   *  transition back (NavigationController.BACK)
   */
  configureTransition(from: string, to: string, on: string): void {
    this.addTransition(from, to, on);
    this.addTransition(to, from, NavigationController.BACK);
  }

  protected override willChangeState(_fromId: string, toId: string): void {
    this.#navigationBar?.changeState(toId, this.#barStates.get(toId)?.configuration);
  }

  /**
   * A new view waits on the right
   */
  protected override configureNewComponent(view: View<any>): void {
    if (view === this.currentView) return;
    place(view, 'translate3d(100%,0,0)');
    view.hide();
  }

  /**
   * The initial view, in place
   */
  override set initialComponent(id: string) {
    super.initialComponent = id;
    const view = id ? this.getView(id) : undefined;
    if (view) place(view, 'translate3d(0,0,0)');
  }
  override get initialComponent(): string {
    return super.initialComponent;
  }

  /**
   * The animations: going forward, the new view comes from the right (and
   * the current view leaves to the left, SLIDE_ANIMATION); going back, the
   * current view leaves to the right
   */
  protected override async transitionViews(from: View<any>, to: View<any>, context: TransitionContext): Promise<void> {
    const back = context.on === NavigationController.BACK;
    const slide = this.#animationType === NavigationController.SLIDE_ANIMATION;
    const duration = context.instant || this.#animationType === NavigationController.NO_ANIMATION
      ? 0 : this.#animationDuration;
    const move = (view: View<any>, translation: string) =>
      new Animation([['translate', translation]], { duration, additive: false }).start(view);

    if (back) {
      // the previous view: below (card), or on the left (slide)
      place(to, `translate3d(${slide ? '-100%' : '0'},0,0)`);
      to.show();
      await Promise.all([move(from, '100%,0,0'), slide ? move(to, '0,0,0') : undefined]);
    } else {
      // the new view comes from the right
      place(to, 'translate3d(100%,0,0)');
      to.show();
      await Promise.all([move(to, '0,0,0'), slide ? move(from, '-100%,0,0') : undefined]);
    }
    from.hide();
  }

  /**
   * The navigation bar configured for each view
   */
  set navigationBar(bar: NavigationBar | null) {
    if (bar !== null && !(bar instanceof NavigationBar)) return;
    this.#navigationBar = bar;
    if (!bar) return;
    for (const [id, { components }] of this.#barStates) bar.setStateItems(id, components);
    if (this.currentState) bar.changeState(this.currentState, this.#barStates.get(this.currentState)?.configuration);
  }
  get navigationBar(): NavigationBar | null {
    return this.#navigationBar;
  }

  /**
   * NavigationController.SLIDE_ANIMATION (default), CARD_ANIMATION or
   * NO_ANIMATION
   */
  @InOut set animationType(v: number) {
    if (v !== NavigationController.NO_ANIMATION && v !== NavigationController.CARD_ANIMATION &&
        v !== NavigationController.SLIDE_ANIMATION) return;
    this.#animationType = v;
  }
  get animationType(): number {
    return this.#animationType;
  }

  /**
   * The duration of the animation between two views, in ms
   */
  @InOut set animationDuration(v: number) {
    if (!isNumber(v) || v < 0) return;
    this.#animationDuration = v;
  }
  get animationDuration(): number {
    return this.#animationDuration;
  }
}

export default NavigationController;
