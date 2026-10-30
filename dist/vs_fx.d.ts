import { ModelEvents, Model, Fsm, Component, event } from 'vs_toolkit/vs_core';
import { View, Animation, DragDelegate, NavigationBar } from 'vs_toolkit/vs_ui';

/**
 * The options of a navigation
 */
interface NavigationOptions {
    /** no animation: the views are moved at once */
    instant?: boolean;
}
/**
 * The delegate of a controller
 */
interface ControllerDelegate {
    /** the current view changes (before the animation) */
    controllerViewWillChange?(from: View<any> | null, to: View<any>, controller: Controller<any>): void;
    /** the animation between the views ended */
    controllerAnimationDidEnd?(from: View<any> | null, to: View<any>, controller: Controller<any>): void;
}
/**
 * The options of a controller
 */
interface ControllerOptions {
    delegate?: ControllerDelegate | null;
}
/**
 * The events of a controller
 */
type ControllerEvents = {
    /** the current view changes (before the animation) */
    viewwillchange: [from: View<any> | null, to: View<any>];
    /** the animation between the views ended */
    animationend: [from: View<any> | null, to: View<any>];
};
/**
 * A listener of an event of a view, bound while its state is the current
 * one: [event, listener]
 */
type ControllerBinding = [event: string, listener: (...args: any[]) => void];
/**
 * The options of a view pushed into a controller
 */
interface PushOptions {
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
interface TransitionContext {
    fromId: string;
    toId: string;
    /** the input of the transition, undefined for a direct move */
    on: string | undefined;
    instant: boolean;
}
interface TransitionAnimations {
    out?: Animation;
    in?: Animation;
}
/**
 * Runs an animation on a view (a copy: an animation can run on several
 * views); at once when instant
 */
declare function runAnimation(animation: Animation | undefined, view: View<any>, instant?: boolean): Promise<unknown>;
/**
 * The fsm of a controller: its state changes are given to the controller
 */
declare class ControllerFsm extends Fsm {
    #private;
    constructor(owner: Component, willGoTo: (from: string, to: string, on: string | undefined, data: unknown) => void);
    protected goTo(stateId: string, output?: string, input?: event.Event): boolean;
    /**
     * Goes to a state without crossing a transition (no output)
     */
    jump(stateId: string, on: string | undefined, data: unknown): boolean;
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
declare class Controller<Events extends ModelEvents = {}> extends Model<ControllerEvents & Events> {
    #private;
    /** the view whose children are controlled */
    readonly owner: View<any>;
    /** told when the view changes */
    delegate: ControllerDelegate | null;
    /** the states and transitions */
    protected readonly fsm: ControllerFsm;
    constructor(owner: View<any>, options?: ControllerOptions);
    /**
     *  Returns the controller of a view
     */
    static of(view: View<any>): Controller<any> | undefined;
    protected destructor(): void;
    /*****************************************************************
     *  States
     ****************************************************************/
    /**
     *  Returns true if the state exists
     */
    hasState(id: string): boolean;
    /**
     *  Returns the ids of the states, in the order they were pushed
     */
    getStates(): string[];
    /**
     *  Returns the view of a state, undefined until a component name is
     *  created
     */
    getView(id: string): View<any> | undefined;
    /**
     *  The current state, '' before the initial component
     */
    get currentState(): string;
    /**
     *  The view of the current state
     */
    get currentView(): View<any> | undefined;
    /**
     *  Pushes a view, or the name of a component created when its state is
     *  first entered. Returns the id of its state, undefined if the state
     *  already exists.
     */
    push(component: View<any> | string, options?: PushOptions): string | undefined;
    /**
     *  Removes the state of a view (or of a state id), and removes its view
     *  from the owner. Returns false for an unknown state.
     */
    remove(component: View<any> | string): boolean;
    /**
     *  Removes all the states
     */
    clear(): void;
    /**
     *  Binds a listener to an event of the view of a state, while this state
     *  is the current one
     */
    componentBind(id: string, event: string, listener: (...args: any[]) => void): void;
    /**
     *  The initial view (its state id): setting it goes to it, without
     *  animation
     */
    set initialComponent(id: string);
    get initialComponent(): string;
    /**
     *  Sets the initial state, without going to it
     */
    protected setInitialState(id: string): void;
    /*****************************************************************
     *  Transitions
     ****************************************************************/
    /**
     *  Adds a transition from a state to another, on an input, with the
     *  animation out of the current view and the animation into the new one
     *  [optional]
     */
    addTransition(from: string, to: string, on: string, animationOut?: Animation | null, animationIn?: Animation | null): void;
    /**
     *  Removes the transition of a state on an input
     */
    removeTransition(from: string, on: string): void;
    /**
     *  Returns the animations of the transition of a state on an input
     */
    protected transitionAnimations(from: string, on: string | undefined): TransitionAnimations | undefined;
    /**
     *  Sends an input: crosses the transition of the current state on it, if
     *  any. The data are set to the model of the new view. Resolves true once
     *  the animation ended, false without transition.
     */
    notify(on: string, data?: unknown, options?: NavigationOptions): Promise<boolean>;
    /**
     *  Goes to a state, without crossing a transition (on is given to
     *  transitionViews). Resolves true once the animation ended, false for an
     *  unknown state.
     */
    protected jumpTo(id: string, on: string | undefined, options?: NavigationOptions, data?: unknown): Promise<boolean>;
    /**
     *  Runs a move of the fsm, and returns the promise of its animation
     */
    protected navigate(options: NavigationOptions, move: () => boolean): Promise<boolean>;
    /**
     *  Returns the view of the state, created from its component name if
     *  needed
     */
    protected ensureView(id: string): View<any> | undefined;
    /*****************************************************************
     *  Subclass API
     ****************************************************************/
    /**
     *  Called when the current state changes, before the views change
     */
    protected willChangeState(_fromId: string, _toId: string): void;
    /**
     *  Prepares a new view of the controller (pushed, or created from its
     *  component name)
     */
    protected configureNewComponent(_view: View<any>, _id: string): void;
    /**
     *  Animates the change of view: shows the new view, and runs the
     *  animations of the transition (in parallel)
     */
    protected transitionViews(from: View<any>, to: View<any>, context: TransitionContext): Promise<void>;
    /**
     *  Updates the views (e.g. after a size change)
     */
    refresh(): void;
}

/** the drag distance (px) which changes the view */
declare const SWIPE_THRESHOLD = 50;
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
declare abstract class StackController<Events extends ModelEvents = {}> extends Controller<Events> implements DragDelegate {
    #private;
    static NEXT: string;
    static PRED: string;
    static FIRST: string;
    static LAST: string;
    /** the duration of the animation between two views, in ms */
    static ANIMATION_DURATION: number;
    constructor(owner: View<any>, options?: ControllerOptions);
    protected destructor(): void;
    /*****************************************************************
     *  The sequence of views
     ****************************************************************/
    /**
     *  The ids of the states, in their order
     */
    get stack(): string[];
    /**
     *  The position of the current view, -1 before the first push
     */
    get currentIndex(): number;
    /**
     *  Pushes a view at the end of the sequence; the first one is the
     *  initial view
     */
    push(component: View<any> | string, options?: PushOptions): string | undefined;
    /**
     *  Removes a view from the sequence; the current one is replaced by its
     *  neighbor
     */
    remove(component: View<any> | string): boolean;
    clear(): void;
    /*****************************************************************
     *  Navigation
     ****************************************************************/
    /**
     *  Goes to the view at the position. Resolves true once the animation
     *  ended (also when it is the current view), false for an invalid
     *  position.
     */
    goToViewAt(index: number, options?: NavigationOptions): Promise<boolean>;
    /**
     *  Goes to the view of the state
     */
    goToViewId(id: string, options?: NavigationOptions): Promise<boolean>;
    goToNextView(options?: NavigationOptions): Promise<boolean>;
    goToPreviousView(options?: NavigationOptions): Promise<boolean>;
    goToFirstView(options?: NavigationOptions): Promise<boolean>;
    goToLastView(options?: NavigationOptions): Promise<boolean>;
    /**
     *  Goes to the view at the position, animated in the order (1: forward,
     *  -1: backward; by default according to the positions)
     */
    protected moveTo(index: number, order: 1 | -1 | undefined, options: NavigationOptions): Promise<boolean>;
    protected transitionViews(from: View<any>, to: View<any>, context: TransitionContext): Promise<void>;
    /*****************************************************************
     *  Views
     ****************************************************************/
    protected configureNewComponent(view: View<any>, id: string): void;
    /**
     *  Places the views according to the current one (after a change of
     *  orientation, of size…)
     */
    protected updateViewSize(): void;
    refresh(): void;
    /**
     *  Called when the orientation changes (see Application)
     */
    orientationDidChange(): void;
    /**
     *  Returns the view at the position, created if needed
     */
    protected viewAt(index: number): View<any> | undefined;
    /**
     *  The size of a page [width, height]: the viewSize, else the size of the
     *  owner node
     */
    protected get pageSize(): [number, number];
    /**
     *  Animates properties of a view, during animationDuration (or at once)
     */
    protected animateView(view: View<any>, properties: [string, string][], instant: boolean): Promise<unknown>;
    /**
     *  Places a view (without animation) according to its position and the
     *  position of the current view
     */
    protected abstract layoutView(view: View<any>, index: number, currentIndex: number): void;
    /**
     *  Animates the change of view, in the order (1: forward, -1: backward)
     */
    protected abstract stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;
    didDragStart(): void;
    didDrag(delta: {
        dx: number;
        dy: number;
    }): void;
    didDragEnd(): void;
    /** the swipe is horizontal (dx), else vertical (dy) */
    protected get isHorizontal(): boolean;
    /** the user starts to swipe */
    protected dragStart(): void;
    /** the user swipes (since the start) */
    protected dragMove(_dx: number, _dy: number): void;
    /**
     *  The user released: a swipe longer than SWIPE_THRESHOLD goes to the
     *  previous view (towards the right / the bottom) or to the next one;
     *  else cancelDrag
     */
    protected dragEnd(dx: number, dy: number): Promise<boolean>;
    /** the swipe did not change the view: the views go back */
    protected cancelDrag(): void;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The views change when the user swipes the owner
     */
    set isTactile(v: boolean);
    get isTactile(): boolean;
    /**
     * The duration of the animation between two views, in ms
     */
    set animationDuration(v: number);
    get animationDuration(): number;
    /**
     * The size of a page [width, height], the size of the owner by default
     */
    set viewSize(v: number[] | null);
    get viewSize(): number[];
}

/**
 *  @class
 *  A SlideController presents a sequence of views side by side: the views
 *  slide horizontally (or vertically, see orientation) when going to the
 *  next or previous view, or when the user swipes (isTactile).
 *  <pre>
 *                   (*)
 *                ⎡ˉˉˉˉˉˉˉˉˉˉˉˉ⎤
 *   ⎡ˉˉˉˉˉˉ⎤    ⎢ ⎡ˉˉˉˉˉˉ⎤ ⎢   ⎡ˉˉˉˉˉˉ⎤   ⎡ˉˉˉˉˉˉ⎤
 *   ⎟  (1) ⎢    ⎢ ⎢  (2) ⎢ ⎢   ⎟  (3) ⎢   ⎟  (4) ⎢
 *   ⎣______⎦    ⎢ ⎣______⎦ ⎢   ⎣______⎦   ⎣______⎦
 *                ⎣____________⎦
 *   (*): the owner
 *  </pre>
 *
 *  @example
 *  const slider = new SlideController(panel, { delegate: this });
 *  slider.push('APanel', { id: '1', data: { … } });
 *  slider.push('APanel', { id: '2', data: { … } });
 *  slider.isTactile = true;
 *  await slider.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.SlideController
 */
declare class SlideController extends StackController {
    #private;
    static ANIMATION_DURATION: number;
    static HORIZONTAL: number;
    static VERTICAL: number;
    /** the views slide by 100% of their size */
    static PERCENTAGE: number;
    /** @deprecated use PERCENTAGE */
    static POURCENTAGE: number;
    /** the views slide by the size of a page (viewSize), in px */
    static PIXEL: number;
    constructor(owner: View<any>, options?: ControllerOptions);
    protected get isHorizontal(): boolean;
    protected layoutView(view: View<any>, index: number, currentIndex: number): void;
    protected stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;
    /**
     * The orientation: SlideController.HORIZONTAL (default) or VERTICAL
     */
    set orientation(v: number);
    get orientation(): number;
    /**
     * How the views slide: SlideController.PERCENTAGE (default) or PIXEL
     */
    set animationMode(v: number);
    get animationMode(): number;
}

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
declare class CardController extends StackController {
    #private;
    static ANIMATION_DURATION: number;
    /** the cards leave to the left (and come from the left) */
    static LEFT_OUT: number;
    static RIGHT_OUT: number;
    static TOP_OUT: number;
    static BOTTOM_OUT: number;
    constructor(owner: View<any>, options?: ControllerOptions);
    protected get isHorizontal(): boolean;
    protected layoutView(view: View<any>, index: number, currentIndex: number): void;
    protected stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;
    /*****************************************************************
     *  Swipe: the cards follow the pointer
     ****************************************************************/
    protected dragStart(): void;
    protected dragMove(dx: number, dy: number): void;
    protected dragEnd(dx: number, dy: number): Promise<boolean>;
    protected cancelDrag(): void;
    /**
     * The side the cards leave to: CardController.LEFT_OUT, RIGHT_OUT
     * (default), TOP_OUT or BOTTOM_OUT
     */
    set direction(v: number);
    get direction(): number;
}

/**
 *  @class
 *  A CubicController presents a sequence of views on the faces of a cube:
 *  the cube turns horizontally (or vertically, see orientation) when going
 *  to the next or previous view, or when the user swipes (isTactile).
 *
 *  @example
 *  const cube = new CubicController(panel);
 *  cube.push(view1);
 *  cube.push(view2);
 *  await cube.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.CubicController
 */
declare class CubicController extends StackController {
    #private;
    static ANIMATION_DURATION: number;
    static HORIZONTAL: number;
    static VERTICAL: number;
    constructor(owner: View<any>, options?: ControllerOptions);
    protected get isHorizontal(): boolean;
    protected layoutView(view: View<any>, index: number, currentIndex: number): void;
    protected stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;
    /**
     * The orientation: CubicController.HORIZONTAL (default) or VERTICAL
     */
    set orientation(v: number);
    get orientation(): number;
}

/**
 *  @class
 *  An OpacityController presents a sequence of views one over the other:
 *  the views cross-fade when going to the next or previous view, or when
 *  the user swipes (isTactile).
 *
 *  @example
 *  const fader = new OpacityController(panel);
 *  fader.push(view1);
 *  fader.push(view2);
 *  await fader.goToNextView();
 *
 * @extends vs.fx.StackController
 * @name vs.fx.OpacityController
 */
declare class OpacityController extends StackController {
    static ANIMATION_DURATION: number;
    constructor(owner: View<any>, options?: ControllerOptions);
    protected layoutView(view: View<any>, index: number, currentIndex: number): void;
    protected stackAnimate(_order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;
}

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
declare class SwipeController extends StackController {
    #private;
    static ANIMATION_DURATION: number;
    static HORIZONTAL: number;
    static VERTICAL: number;
    constructor(owner: View<any>, options?: ControllerOptions);
    protected get isHorizontal(): boolean;
    protected layoutView(view: View<any>, index: number, currentIndex: number): void;
    protected stackAnimate(order: 1 | -1, from: View<any>, to: View<any>, instant: boolean): Promise<void>;
    goToNextView(options?: NavigationOptions): Promise<boolean>;
    goToPreviousView(options?: NavigationOptions): Promise<boolean>;
    /*****************************************************************
     *  Swipe: the views follow the pointer (isContinuousSwipe)
     ****************************************************************/
    /** the views follow the pointer */
    protected isDragging: boolean;
    protected dragStart(): void;
    protected dragMove(dx: number, dy: number): void;
    protected dragEnd(dx: number, dy: number): Promise<boolean>;
    protected cancelDrag(): void;
    /**
     * The orientation: SwipeController.HORIZONTAL (default) or VERTICAL
     */
    set orientation(v: number);
    get orientation(): number;
    /**
     * The last view is followed by the first one (and the first one is
     * preceded by the last one)
     */
    set isCircular(v: boolean);
    get isCircular(): boolean;
    /**
     * The views follow the pointer while the user swipes
     */
    set isContinuousSwipe(v: boolean);
    get isContinuousSwipe(): boolean;
}

/**
 * A component shown in the navigation bar for a view, and its properties
 */
interface NavigationBarItem {
    /** the component, or its id */
    comp: View<any> | string;
    /** the properties set to the component when the view is shown */
    properties?: Record<string, unknown>;
}
/**
 * The options of a navigation controller
 */
interface NavigationControllerOptions extends ControllerOptions {
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
declare class NavigationController extends Controller {
    #private;
    /** no animation between the views */
    static NO_ANIMATION: number;
    /** the new view comes over the current one */
    static CARD_ANIMATION: number;
    /** the views slide (default) */
    static SLIDE_ANIMATION: number;
    static DEFAULT_ANIMATION: number;
    /** the input going back to the previous view */
    static BACK: string;
    static ANIMATION_DURATION: number;
    constructor(owner: View<any>, options?: NavigationControllerOptions);
    /**
     *  Sets the components shown in the navigation bar for a view, and their
     *  properties
     */
    configureNavigationBarState(id: string, items: NavigationBarItem[]): void;
    /**
     *  Adds the transition from a view to another on an input, and the
     *  transition back (NavigationController.BACK)
     */
    configureTransition(from: string, to: string, on: string): void;
    protected willChangeState(_fromId: string, toId: string): void;
    /**
     * A new view waits on the right
     */
    protected configureNewComponent(view: View<any>): void;
    /**
     * The initial view, in place
     */
    set initialComponent(id: string);
    get initialComponent(): string;
    /**
     * The animations: going forward, the new view comes from the right (and
     * the current view leaves to the left, SLIDE_ANIMATION); going back, the
     * current view leaves to the right
     */
    protected transitionViews(from: View<any>, to: View<any>, context: TransitionContext): Promise<void>;
    /**
     * The navigation bar configured for each view
     */
    set navigationBar(bar: NavigationBar | null);
    get navigationBar(): NavigationBar | null;
    /**
     * NavigationController.SLIDE_ANIMATION (default), CARD_ANIMATION or
     * NO_ANIMATION
     */
    set animationType(v: number);
    get animationType(): number;
    /**
     * The duration of the animation between two views, in ms
     */
    set animationDuration(v: number);
    get animationDuration(): number;
}

export { CardController, Controller, CubicController, NavigationController, OpacityController, SWIPE_THRESHOLD, SlideController, StackController, SwipeController, runAnimation };
export type { ControllerBinding, ControllerDelegate, ControllerEvents, ControllerOptions, NavigationBarItem, NavigationControllerOptions, NavigationOptions, PushOptions, TransitionContext };
