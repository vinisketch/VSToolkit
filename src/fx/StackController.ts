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


import { isArray, isNumber, isString } from 'vs_utils';
import { InOut, type ModelEvents } from 'vs_toolkit/vs_core';
import { DragRecognizer, type DragDelegate, type View } from 'vs_toolkit/vs_ui';

import {
  Controller, type ControllerOptions, type NavigationOptions, type PushOptions, type TransitionContext,
} from './Controller';
import { animate } from './helpers';

/** the drag distance (px) which changes the view */
export const SWIPE_THRESHOLD = 50;

/**
 *  @class
 *  The base of the controllers presenting a sequence of views (slides,
 *  cards…): it goes to the next, previous, first, last view, or to a view
 *  by its position, and changes the view when the user swipes the owner
 *  (isTactile).
 *  <p/>
 *  The sequence is a fsm: each view has the 'next', 'pred' and 'first'
 *  transitions, so notify(StackController.NEXT) also works.
 *  <p/>
 *  A subclass places the views (layoutView) and animates the change of view
 *  (stackAnimate).
 *
 * @extends vs.fx.Controller
 * @name vs.fx.StackController
 */
export abstract class StackController<Events extends ModelEvents = {}>
  extends Controller<Events> implements DragDelegate {

  static NEXT = 'next';
  static PRED = 'pred';
  static FIRST = 'first';
  static LAST = 'last';

  /** the duration of the animation between two views, in ms */
  static ANIMATION_DURATION = 350;

  readonly #stack: string[] = [];
  #animationDuration = StackController.ANIMATION_DURATION;
  #isTactile = false;
  #dragRecognizer: DragRecognizer | undefined;
  #viewSize: number[] | null = null;
  /** the animation direction forced for the next move (circular move) */
  #order: 1 | -1 | undefined;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super(owner, options);
    for (const input of [StackController.NEXT, StackController.PRED, StackController.FIRST]) {
      this.fsm.addInput(input);
    }
  }

  protected override destructor(): void {
    this.#setTactile(false);
    super.destructor();
  }

  /*****************************************************************
   *  The sequence of views
   ****************************************************************/

  /**
   *  The ids of the states, in their order
   */
  get stack(): string[] {
    return this.#stack.slice();
  }

  /**
   *  The position of the current view, -1 before the first push
   */
  get currentIndex(): number {
    return this.#stack.indexOf(this.currentState);
  }

  /**
   *  Pushes a view at the end of the sequence; the first one is the
   *  initial view
   */
  override push(component: View<any> | string, options: PushOptions = {}): string | undefined {
    const id = super.push(component, options);
    if (!id) return undefined;
    this.#stack.push(id);
    this.#relink();
    if (this.#stack.length === 1) this.initialComponent = id;
    this.updateViewSize();
    return id;
  }

  /**
   *  Removes a view from the sequence; the current one is replaced by its
   *  neighbor
   */
  override remove(component: View<any> | string): boolean {
    const id = isString(component) ? component : component?.id;
    const index = id ? this.#stack.indexOf(id) : -1;
    const wasCurrent = id === this.currentState;
    if (!super.remove(component)) return false;
    if (index === -1) return true;

    this.#stack.splice(index, 1);
    this.#relink();
    if (index === 0 && this.#stack.length) this.setInitialState(this.#stack[0]);
    if (wasCurrent && this.#stack.length) {
      this.jumpTo(this.#stack[Math.min(index, this.#stack.length - 1)], undefined, { instant: true });
    }
    this.updateViewSize();
    return true;
  }

  override clear(): void {
    super.clear();
    this.#stack.length = 0;
    for (const input of [StackController.NEXT, StackController.PRED, StackController.FIRST]) {
      this.fsm.addInput(input);
    }
  }

  /**
   * The 'next', 'pred' and 'first' transitions of the sequence
   */
  #relink(): void {
    const stack = this.#stack;
    stack.forEach((id, index) => {
      for (const on of [StackController.NEXT, StackController.PRED, StackController.FIRST]) {
        this.removeTransition(id, on);
      }
      if (index < stack.length - 1) this.addTransition(id, stack[index + 1], StackController.NEXT);
      if (index > 0) {
        this.addTransition(id, stack[index - 1], StackController.PRED);
        this.addTransition(id, stack[0], StackController.FIRST);
      }
    });
  }

  /*****************************************************************
   *  Navigation
   ****************************************************************/

  /**
   *  Goes to the view at the position. Resolves true once the animation
   *  ended (also when it is the current view), false for an invalid
   *  position.
   */
  goToViewAt(index: number, options: NavigationOptions = {}): Promise<boolean> {
    return this.moveTo(index, undefined, options);
  }

  /**
   *  Goes to the view of the state
   */
  goToViewId(id: string, options: NavigationOptions = {}): Promise<boolean> {
    return this.goToViewAt(this.#stack.indexOf(id), options);
  }

  goToNextView(options: NavigationOptions = {}): Promise<boolean> {
    return this.goToViewAt(this.currentIndex + 1, options);
  }

  goToPreviousView(options: NavigationOptions = {}): Promise<boolean> {
    return this.goToViewAt(this.currentIndex - 1, options);
  }

  goToFirstView(options: NavigationOptions = {}): Promise<boolean> {
    return this.goToViewAt(0, options);
  }

  goToLastView(options: NavigationOptions = {}): Promise<boolean> {
    return this.goToViewAt(this.#stack.length - 1, options);
  }

  /**
   *  Goes to the view at the position, animated in the order (1: forward,
   *  -1: backward; by default according to the positions)
   */
  protected moveTo(index: number, order: 1 | -1 | undefined, options: NavigationOptions): Promise<boolean> {
    if (!Number.isInteger(index) || index < 0 || index >= this.#stack.length) return Promise.resolve(false);
    const current = this.currentIndex;
    if (index === current) return Promise.resolve(true);

    const id = this.#stack[index];
    this.#order = order;
    try {
      // through the transition of the fsm (and its output) when it exists
      for (const on of [StackController.NEXT, StackController.PRED, StackController.FIRST]) {
        if (this.fsm.getAccessibleStateOn(on) === id) return this.notify(on, undefined, options);
      }
      return this.jumpTo(id, StackController.LAST, options);
    } finally {
      this.#order = undefined;
    }
  }

  protected override transitionViews(from: View<any>, to: View<any>, context: TransitionContext): Promise<void> {
    const order = this.#order ?? (this.#stack.indexOf(context.toId) >= this.#stack.indexOf(context.fromId) ? 1 : -1);
    return this.stackAnimate(order, from, to, context.instant);
  }

  /*****************************************************************
   *  Views
   ****************************************************************/

  protected override configureNewComponent(view: View<any>, id: string): void {
    view.setStyle('position', 'absolute');
    const index = this.#stack.indexOf(id);
    this.layoutView(view, index === -1 ? this.#stack.length : index, Math.max(this.currentIndex, 0));
  }

  /**
   *  Places the views according to the current one (after a change of
   *  orientation, of size…)
   */
  protected updateViewSize(): void {
    const current = Math.max(this.currentIndex, 0);
    this.#stack.forEach((id, index) => {
      const view = this.getView(id);
      if (view) this.layoutView(view, index, current);
    });
  }

  override refresh(): void {
    this.updateViewSize();
  }

  /**
   *  Called when the orientation changes (see Application)
   */
  orientationDidChange(): void {
    this.updateViewSize();
  }

  /**
   *  Returns the view at the position, created if needed
   */
  protected viewAt(index: number): View<any> | undefined {
    const id = this.#stack[index];
    return id === undefined ? undefined : this.ensureView(id);
  }

  /**
   *  The size of a page [width, height]: the viewSize, else the size of the
   *  owner node
   */
  protected get pageSize(): [number, number] {
    if (this.#viewSize) return [this.#viewSize[0], this.#viewSize[1]];
    const view = this.owner.view;
    if (view?.offsetWidth || view?.offsetHeight) return [view.offsetWidth, view.offsetHeight];
    const [width, height] = this.owner.size;
    return [Math.max(width, 0), Math.max(height, 0)];
  }

  /**
   *  Animates properties of a view, during animationDuration (or at once)
   */
  protected animateView(view: View<any>, properties: [string, string][], instant: boolean): Promise<unknown> {
    return animate(view, properties, instant ? 0 : this.#animationDuration);
  }

  /**
   *  Places a view (without animation) according to its position and the
   *  position of the current view
   */
  protected abstract layoutView(view: View<any>, index: number, currentIndex: number): void;

  /**
   *  Animates the change of view, in the order (1: forward, -1: backward)
   */
  protected abstract stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;

  /*****************************************************************
   *  Swipe
   ****************************************************************/

  #setTactile(v: boolean): void {
    if (v && !this.#dragRecognizer) {
      this.#dragRecognizer = new DragRecognizer(this);
      this.owner.addPointerRecognizer(this.#dragRecognizer);
    } else if (!v && this.#dragRecognizer) {
      this.owner.removePointerRecognizer(this.#dragRecognizer);
      this.#dragRecognizer = undefined;
    }
  }

  #lastDelta = { dx: 0, dy: 0 };

  didDragStart(): void {
    this.#lastDelta = { dx: 0, dy: 0 };
    this.dragStart();
  }

  didDrag(delta: { dx: number; dy: number }): void {
    this.#lastDelta = delta;
    this.dragMove(delta.dx, delta.dy);
  }

  didDragEnd(): void {
    const { dx, dy } = this.#lastDelta;
    this.dragEnd(dx, dy);
  }

  /** the swipe is horizontal (dx), else vertical (dy) */
  protected get isHorizontal(): boolean {
    return true;
  }

  /** the user starts to swipe */
  // eslint-disable-next-line class-methods-use-this
  protected dragStart(): void {}

  /** the user swipes (since the start) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  protected dragMove(_dx: number, _dy: number): void {}

  /**
   *  The user released: a swipe longer than SWIPE_THRESHOLD goes to the
   *  previous view (towards the right / the bottom) or to the next one;
   *  else cancelDrag
   */
  protected dragEnd(dx: number, dy: number): Promise<boolean> {
    const delta = this.isHorizontal ? dx : dy;
    let move: Promise<boolean> = Promise.resolve(false);
    if (delta > SWIPE_THRESHOLD) move = this.goToPreviousView();
    else if (delta < -SWIPE_THRESHOLD) move = this.goToNextView();
    return move.then(moved => {
      if (!moved) this.cancelDrag();
      return moved;
    });
  }

  /** the swipe did not change the view: the views go back */
  // eslint-disable-next-line class-methods-use-this
  protected cancelDrag(): void {}

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The views change when the user swipes the owner
   */
  @InOut set isTactile(v: boolean) {
    this.#isTactile = !!v;
    this.#setTactile(this.#isTactile);
  }
  get isTactile(): boolean {
    return this.#isTactile;
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

  /**
   * The size of a page [width, height], the size of the owner by default
   */
  @InOut set viewSize(v: number[] | null) {
    if (v === null) {
      this.#viewSize = null;
    } else {
      if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
      this.#viewSize = v.slice();
    }
    this.updateViewSize();
  }
  get viewSize(): number[] {
    return [...this.pageSize];
  }
}

export default StackController;
