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


import { createId, isString } from 'vs_utils';
import { Fsm, Model, type Component, type ModelEvents, type event } from 'vs_toolkit/vs_core';
import { View, type Animation } from 'vs_toolkit/vs_ui';

/**
 * The options of a navigation
 */
export interface NavigationOptions {
  /** no animation: the views are moved at once */
  instant?: boolean;
}

/**
 * The delegate of a controller
 */
export interface ControllerDelegate {
  /** the current view changes (before the animation) */
  controllerViewWillChange?(from: View<any> | null, to: View<any>, controller: Controller<any>): void;
  /** the animation between the views ended */
  controllerAnimationDidEnd?(from: View<any> | null, to: View<any>, controller: Controller<any>): void;
}

/**
 * The options of a controller
 */
export interface ControllerOptions {
  delegate?: ControllerDelegate | null;
}

/**
 * The events of a controller
 */
export type ControllerEvents = {
  /** the current view changes (before the animation) */
  viewwillchange: [from: View<any> | null, to: View<any>];
  /** the animation between the views ended */
  animationend: [from: View<any> | null, to: View<any>];
};

/**
 * A listener of an event of a view, bound while its state is the current
 * one: [event, listener]
 */
export type ControllerBinding = [event: string, listener: (...args: any[]) => void];

/**
 * The options of a view pushed into a controller
 */
export interface PushOptions {
  /** the id of the state: the id of the view by default */
  id?: string;
  /** the model values of the view, set when its state is entered */
  data?: Record<string, unknown>;
  /** the hole of the owner the view is added to */
  extension?: string;
  /** the listeners of the view events, bound while its state is the current one */
  bindings?: ControllerBinding[];
}

/**
 * How the controller goes from a view to another (see transitionViews)
 */
export interface TransitionContext {
  fromId: string;
  toId: string;
  /** the input of the transition, undefined for a direct move */
  on: string | undefined;
  instant: boolean;
}

interface ControllerState {
  readonly id: string;
  view?: View<any>;
  /** the name of the component to create (see View.createAndAddComponent) */
  readonly componentName?: string;
  readonly data: Record<string, unknown>;
  readonly extension?: string;
  readonly bindings: ControllerBinding[];
  unbinds: (() => void)[];
}

interface TransitionAnimations {
  out?: Animation;
  in?: Animation;
}

/** the controllers, by owner: a view has one controller */
const controllers = new WeakMap<View<any>, Controller<any>>();

/**
 * Runs an animation on a view (a copy: an animation can run on several
 * views); at once when instant
 */
export function runAnimation(animation: Animation | undefined, view: View<any>, instant = false): Promise<unknown> {
  if (!animation) return Promise.resolve();
  const copy = animation.clone();
  if (instant) copy.duration = 0;
  return copy.start(view);
}

/**
 * Sets the model properties of the view from the values
 */
function assignModel(view: View<any>, values: Record<string, unknown>): void {
  const properties = new Set(view.modelProperties);
  const known: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(values)) {
    if (properties.has(name)) known[name] = value;
  }
  view.assign(known);
}

function callOptional(view: View<any>, method: 'viewWillAppear' | 'viewWillDisappear'): void {
  const func = (view as unknown as Record<string, unknown>)[method];
  if (typeof func === 'function') func.call(view);
}

/**
 * The fsm of a controller: its state changes are given to the controller
 */
class ControllerFsm extends Fsm {
  readonly #willGoTo: (from: string, to: string, on: string | undefined, data: unknown) => void;

  constructor(owner: Component, willGoTo: (from: string, to: string, on: string | undefined, data: unknown) => void) {
    super(owner);
    this.#willGoTo = willGoTo;
  }

  protected override goTo(stateId: string, output?: string, input?: event.Event): boolean {
    if (!this.existState(stateId)) return false;
    this.#willGoTo(this.currentState, stateId, input?.type, input?.data);
    return super.goTo(stateId, output, input);
  }

  /**
   * Goes to a state without crossing a transition (no output)
   */
  jump(stateId: string, on: string | undefined, data: unknown): boolean {
    if (!this.existState(stateId)) return false;
    this.#willGoTo(this.currentState, stateId, on, data);
    return super.goTo(stateId);
  }
}

/**
 *  @class
 *  A Controller presents the views of its owner one at a time: each view is
 *  a state of a finite state machine, and the transitions between the
 *  states animate the views (an animation out of the current view, an
 *  animation into the new one).
 *  <p/>
 *  Use the StackController subclasses (SlideController, CardController,
 *  SwipeController…) or the NavigationController, which match most
 *  situations, before writing your own controller.
 *  <p/>
 *  A view is pushed as a view, or as the name of a component created when
 *  its state is first entered (see View.createAndAddComponent).
 *  The controller tells its delegate and emits events when the view
 *  changes ('viewwillchange') and when the animation ends
 *  ('animationend').
 *
 *  @example
 *  const controller = new Controller(app);
 *  controller.init();
 *  controller.push(firstView);
 *  controller.push('PanelOne', { id: 'one', data: { title: 'One' } });
 *  controller.addTransition(firstView.id, 'one', 'goToOne', slideOutLeft, slideInRight);
 *  controller.addTransition('one', firstView.id, 'back', slideOutRight, slideInLeft);
 *  controller.initialComponent = firstView.id;
 *
 *  await controller.notify('goToOne');
 *
 * @extends core.Model
 * @name vs.fx.Controller
 */
export class Controller<Events extends ModelEvents = {}> extends Model<ControllerEvents & Events> {
  /** the view whose children are controlled */
  readonly owner: View<any>;

  /** told when the view changes */
  delegate: ControllerDelegate | null;

  /** the states and transitions */
  protected readonly fsm: ControllerFsm;

  readonly #states = new Map<string, ControllerState>();
  readonly #transitions = new Map<string, TransitionAnimations>();
  #initialComponent = '';
  #instant = false;
  #transition: Promise<boolean> | undefined;

  constructor(owner: View<any>, options: ControllerOptions = {}) {
    super();
    if (!(owner instanceof View)) {
      throw new TypeError('vs.fx.Controller: the owner must be a view');
    }
    if (controllers.has(owner)) {
      throw new Error(`vs.fx.Controller: the view ${owner.id} already has a controller`);
    }
    controllers.set(owner, this);
    this.owner = owner;
    this.delegate = options.delegate ?? null;
    this.fsm = new ControllerFsm(this, (from, to, on, data) => this.#willGoTo(from, to, on, data));
  }

  /**
   *  Returns the controller of a view
   */
  static of(view: View<any>): Controller<any> | undefined {
    return controllers.get(view);
  }

  protected override destructor(): void {
    const current = this.#states.get(this.fsm.currentState);
    if (current) this.#unbindState(current);
    if (controllers.get(this.owner) === this) controllers.delete(this.owner);
    this.fsm.destroy();
    this.#states.clear();
    this.#transitions.clear();
    super.destructor();
  }

  /*****************************************************************
   *  States
   ****************************************************************/

  /**
   *  Returns true if the state exists
   */
  hasState(id: string): boolean {
    return this.#states.has(id);
  }

  /**
   *  Returns the ids of the states, in the order they were pushed
   */
  getStates(): string[] {
    return [...this.#states.keys()];
  }

  /**
   *  Returns the view of a state, undefined until a component name is
   *  created
   */
  getView(id: string): View<any> | undefined {
    return this.#states.get(id)?.view;
  }

  /**
   *  The current state, '' before the initial component
   */
  get currentState(): string {
    return this.fsm.currentState;
  }

  /**
   *  The view of the current state
   */
  get currentView(): View<any> | undefined {
    return this.getView(this.fsm.currentState);
  }

  /**
   *  Pushes a view, or the name of a component created when its state is
   *  first entered. Returns the id of its state, undefined if the state
   *  already exists.
   */
  push(component: View<any> | string, options: PushOptions = {}): string | undefined {
    if (!component) return undefined;
    const isName = isString(component);
    const id = options.id || (isName ? createId() : component.id);
    if (this.#states.has(id)) return undefined;

    const state: ControllerState = {
      id,
      componentName: isName ? component : undefined,
      data: { ...options.data },
      extension: options.extension,
      bindings: [],
      unbinds: [],
    };
    this.#states.set(id, state);
    this.fsm.addState(id);
    for (const [event, listener] of options.bindings ?? []) this.componentBind(id, event, listener);

    if (!isName) {
      state.view = component;
      if (!this.owner.isChild(component)) this.owner.add(component, options.extension);
      this.configureNewComponent(component, id);
    }
    return id;
  }

  /**
   *  Removes the state of a view (or of a state id), and removes its view
   *  from the owner. Returns false for an unknown state.
   */
  remove(component: View<any> | string): boolean {
    const id = isString(component) ? component : component?.id;
    const state = id ? this.#states.get(id) : undefined;
    if (!state) return false;

    if (this.fsm.currentState === id) this.#unbindState(state);
    if (state.view) this.owner.remove(state.view);
    this.fsm.removeState(id);
    this.#states.delete(id);
    for (const key of [...this.#transitions.keys()]) {
      if (key.startsWith(`${id}\u0000`)) this.#transitions.delete(key);
    }
    if (this.#initialComponent === id) this.#initialComponent = '';
    return true;
  }

  /**
   *  Removes all the states
   */
  clear(): void {
    const current = this.#states.get(this.fsm.currentState);
    if (current) this.#unbindState(current);
    for (const state of this.#states.values()) {
      if (state.view) this.owner.remove(state.view);
    }
    this.#states.clear();
    this.#transitions.clear();
    this.#initialComponent = '';
    this.fsm.clear();
  }

  /**
   *  Binds a listener to an event of the view of a state, while this state
   *  is the current one
   */
  componentBind(id: string, event: string, listener: (...args: any[]) => void): void {
    const state = this.#states.get(id);
    if (!state) return;
    state.bindings.push([event, listener]);
    if (this.fsm.currentState === id && state.view) {
      state.unbinds.push(this.#bind(state.view, event, listener));
    }
  }

  /**
   *  The initial view (its state id): setting it goes to it, without
   *  animation
   */
  set initialComponent(id: string) {
    if (!id) {
      this.#initialComponent = '';
      this.fsm.initialState = '';
      return;
    }
    if (!this.#states.has(id)) {
      throw new Error(`vs.fx.Controller: unknown state "${id}"`);
    }
    this.#initialComponent = id;
    this.fsm.initialState = id;
    this.fsm.activate();
  }
  get initialComponent(): string {
    return this.#initialComponent;
  }

  /**
   *  Sets the initial state, without going to it
   */
  protected setInitialState(id: string): void {
    this.#initialComponent = id;
    this.fsm.initialState = id;
  }

  /*****************************************************************
   *  Transitions
   ****************************************************************/

  /**
   *  Adds a transition from a state to another, on an input, with the
   *  animation out of the current view and the animation into the new one
   *  [optional]
   */
  addTransition(from: string, to: string, on: string, animationOut?: Animation | null, animationIn?: Animation | null): void {
    for (const state of [from, to]) {
      if (!this.#states.has(state)) throw new Error(`vs.fx.Controller: unknown state "${state}"`);
    }
    if (!on) throw new Error('vs.fx.Controller: the input is empty');
    this.fsm.addInput(on);
    this.fsm.addTransition(from, to, on);
    this.#transitions.set(`${from}\u0000${on}`, { out: animationOut ?? undefined, in: animationIn ?? undefined });
  }

  /**
   *  Removes the transition of a state on an input
   */
  removeTransition(from: string, on: string): void {
    if (!this.#states.has(from) || !this.fsm.existInput(on)) return;
    this.fsm.removeTransitionFrom(from, on);
    this.#transitions.delete(`${from}\u0000${on}`);
  }

  /**
   *  Returns the animations of the transition of a state on an input
   */
  protected transitionAnimations(from: string, on: string | undefined): TransitionAnimations | undefined {
    return on === undefined ? undefined : this.#transitions.get(`${from}\u0000${on}`);
  }

  /**
   *  Sends an input: crosses the transition of the current state on it, if
   *  any. The data are set to the model of the new view. Resolves true once
   *  the animation ended, false without transition.
   */
  notify(on: string, data?: unknown, options: NavigationOptions = {}): Promise<boolean> {
    if (!this.fsm.existInput(on)) return Promise.resolve(false);
    return this.navigate(options, () => this.fsm.fsmNotify(on, data));
  }

  /**
   *  Goes to a state, without crossing a transition (on is given to
   *  transitionViews). Resolves true once the animation ended, false for an
   *  unknown state.
   */
  protected jumpTo(id: string, on: string | undefined, options: NavigationOptions = {}, data?: unknown): Promise<boolean> {
    return this.navigate(options, () => this.fsm.jump(id, on, data));
  }

  /**
   *  Runs a move of the fsm, and returns the promise of its animation
   */
  protected navigate(options: NavigationOptions, move: () => boolean): Promise<boolean> {
    this.#instant = !!options.instant;
    this.#transition = undefined;
    try {
      if (!move()) return Promise.resolve(false);
    } finally {
      this.#instant = false;
    }
    return this.#transition ?? Promise.resolve(true);
  }

  /*****************************************************************
   *  State changes
   ****************************************************************/

  #bind(view: View<any>, event: string, listener: (...args: any[]) => void): () => void {
    return (view as unknown as { on(event: string, listener: Function): () => void }).on(event, listener);
  }

  #unbindState(state: ControllerState): void {
    state.unbinds.forEach(unbind => unbind());
    state.unbinds = [];
  }

  /**
   *  Returns the view of the state, created from its component name if
   *  needed
   */
  protected ensureView(id: string): View<any> | undefined {
    const state = this.#states.get(id);
    if (!state) return undefined;
    if (state.view) return state.view;
    if (!state.componentName) return undefined;

    const view = this.owner.createAndAddComponent(state.componentName, { ...state.data }, state.extension);
    if (!view) {
      throw new Error(`vs.fx.Controller: impossible to create the component "${state.componentName}"`);
    }
    state.view = view;
    this.configureNewComponent(view, id);
    return view;
  }

  #willGoTo(fromId: string, toId: string, on: string | undefined, data: unknown): void {
    const from = this.#states.get(fromId);
    const to = this.#states.get(toId)!;
    if (from) this.#unbindState(from);
    this.willChangeState(fromId, toId);

    // the new view: created if needed, its model set, its events bound
    const toView = this.ensureView(toId)!;
    if (data && typeof data === 'object') assignModel(toView, data as Record<string, unknown>);
    to.unbinds = to.bindings.map(([event, listener]) => this.#bind(toView, event, listener));

    const fromView = from?.view ?? null;
    if (fromView && fromView !== toView) callOptional(fromView, 'viewWillDisappear');
    callOptional(toView, 'viewWillAppear');

    this.delegate?.controllerViewWillChange?.(fromView, toView, this);
    (this as Controller).emit('viewwillchange', fromView, toView);

    if (!fromView || fromView === toView) {
      toView.show();
      this.#transition = Promise.resolve(true);
      return;
    }

    const context: TransitionContext = { fromId, toId, on, instant: this.#instant };
    this.#transition = this.transitionViews(fromView, toView, context).then(
      () => {
        this.delegate?.controllerAnimationDidEnd?.(fromView, toView, this);
        (this as Controller).emit('animationend', fromView, toView);
        return true;
      },
      (error: unknown) => {
        console.error(`vs.fx.Controller: the transition from "${fromId}" to "${toId}" failed`, error);
        return false;
      },
    );
  }

  /*****************************************************************
   *  Subclass API
   ****************************************************************/

  /**
   *  Called when the current state changes, before the views change
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  protected willChangeState(_fromId: string, _toId: string): void {}

  /**
   *  Prepares a new view of the controller (pushed, or created from its
   *  component name)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  protected configureNewComponent(_view: View<any>, _id: string): void {}

  /**
   *  Animates the change of view: shows the new view, and runs the
   *  animations of the transition (in parallel)
   */
  protected async transitionViews(from: View<any>, to: View<any>, context: TransitionContext): Promise<void> {
    const animations = this.transitionAnimations(context.fromId, context.on);
    to.show();
    await Promise.all([
      runAnimation(animations?.in, to, context.instant),
      runAnimation(animations?.out, from, context.instant),
    ]);
  }

  /**
   *  Updates the views (e.g. after a size change)
   */
  // eslint-disable-next-line class-methods-use-this
  refresh(): void {}
}

export default Controller;
