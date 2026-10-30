import { task, ModelEvents, Model, Component } from 'vs_toolkit/vs_core';

declare const Task: typeof task.Task;
/********************************************************************
                    CSS names (without vendor prefix)
*********************************************************************/
declare const ANIMATION_DURATION = "animation-duration";
declare const ANIMATION_DELAY = "animation-delay";
declare const ANIMATION_NAME = "animation-name";
declare const ANIMATION_TIMING_FUNC = "animation-timing-function";
declare const ANIMATION_FILL_MODE = "animation-fill-mode";
declare const ITERATION_COUNT = "animation-iteration-count";
declare const TRANSITION_DURATION = "transition-duration";
declare const TRANSITION_DELAY = "transition-delay";
declare const TRANSITION_TIMING_FUNC = "transition-timing-function";
declare const TRANSITION_PROPERTY = "transition-property";
declare const TRANSFORM_ORIGIN = "transform-origin";
declare const TRANSFORM = "transform";
declare const KEY_FRAMES = "keyframes";
declare const ANIMATION_END = "animationend";
declare const TRANSITION_END = "transitionend";
/********************************************************************
                    Types
*********************************************************************/
/**
 * What an animation animates: a view
 */
interface AnimationTarget {
    readonly view: HTMLElement | null;
    /** for the $width and $height variables */
    readonly size?: number[];
    /** for the $x and $y variables */
    readonly position?: number[];
    /** the current transform, for the additive animations */
    getCTM?(): DOMMatrix;
}
/**
 * A property and its value, e.g. ['opacity', '0'] or
 * ['translate', '${x}px,${y}px,0']
 */
type AnimationProperty = [property: string, value: string];
/**
 * The values of a key frame: one per property (in the same order), or the
 * variables used by the property values
 */
type KeyFrameValues = (string | null | undefined)[] | Record<string, unknown>;
interface AnimationOptions {
    /** CSS time ('0.3s', '200ms') or ms */
    duration?: string | number;
    /** CSS timing function ('ease', 'linear'…) */
    timing?: string;
    /** transform origin, in % of the view size */
    origin?: [number, number];
    /** number of iterations, or 'infinite' */
    iterationCount?: number | 'infinite';
    /** delay before the animation starts, in ms */
    delay?: number;
    /** the transforms are applied after the current transform of the view */
    additive?: boolean;
}
/**
 *  @class
 *  An animation of the CSS properties of a view, as a Task: start(view)
 *  runs it, pause()/resume()/stop() control it, and its promise (or
 *  taskDidEnd, on('end')) tells its end. It uses the Web Animations API
 *  (element.animate); when it is not available, the final values are
 *  applied at once.
 *  <p>
 *  An animation is defined by properties and their values: CSS properties,
 *  or transforms (translate, translateX, translateY, rotate, rotateX,
 *  rotateY, scale, scaleX, scaleY, scaleZ, skew, perspective). The values
 *  may contain variables: ${name} (a field of the animation, or a key frame
 *  variable), $width, $height, $x, $y (the size and position of the view).
 *  <p>
 *  By default it animates from the current values to the given ones; key
 *  frames (addKeyFrame) define other steps.
 *
 *  @example
 *  const fade = new Animation([['opacity', '0']], { duration: '1s' });
 *  await fade.start(view);
 *
 *  const slide = new Animation([['translateX', '0px']]);
 *  slide.addKeyFrame('from', ['$width']);
 *
 *  seq([fade, slide]).start(view);
 *
 * @name vs.fx.Animation
 */
declare class Animation extends Task {
    #private;
    static readonly DEFAULT_DURATION = "0.3s";
    static readonly EASE = "ease";
    static readonly LINEAR = "linear";
    static readonly EASE_IN = "ease-in";
    static readonly EASE_OUT = "ease-out";
    static readonly EASE_IN_OUT = "ease-in-out";
    static readonly DEFAULT_TIMING = "ease";
    /** the animated properties */
    properties: string[];
    /** the final values of the properties */
    values: string[];
    /** the key frames, by position ('0%' … '100%') */
    keyFrames: Map<string, KeyFrameValues>;
    duration: string | number;
    timing: string;
    origin: [number, number] | undefined;
    iterationCount: number | 'infinite';
    delay: number;
    additive: boolean;
    constructor(animations?: AnimationProperty[], options?: AnimationOptions & task.TaskOptions);
    /**
     *  Sets the animated properties and their final values
     *
     * @param {Array} animations the [property, value] pairs
     */
    setAnimations(animations: AnimationProperty[]): void;
    /**
     *  Sets the options (duration, timing, origin, iterationCount, delay,
     *  additive) given
     */
    setOptions(options: AnimationOptions): void;
    /**
     *  Adds a key frame
     *
     * @param {String|number} position 'from' (0%), 'to' (100%), or a %
     * @param {Array|Object} values the values (one per property), or the
     *        variables used by the property values
     */
    addKeyFrame(position: 'from' | 'to' | number, values: KeyFrameValues): void;
    /**
     *  Returns a new animation with the same definition, e.g. to run it on
     *  several views at the same time
     */
    clone(): this;
    /*****************************************************************
     *  Task implementation
     ****************************************************************/
    /**
     *  Starts the animation on a view (the task parameter).
     *  Throws if the parameter is not a view.
     */
    protected doStart(param?: unknown): boolean;
    stop(): boolean;
    pause(): boolean;
    resume(): boolean;
    /*****************************************************************
     *  Predefined animations (to clone, see View.setShowAnimation)
     ****************************************************************/
    static SlideOutRight: Animation;
    static SlideOutLeft: Animation;
    static SlideOutTop: Animation;
    static SlideOutBottom: Animation;
    static SlideInRight: Animation;
    static SlideInLeft: Animation;
    static SlideInTop: Animation;
    static SlideInBottom: Animation;
    static FadeIn: Animation;
    static FadeOut: Animation;
}
/********************************************************************
                    Specific animations
*********************************************************************/
/**
 * Translates the view by (x, y, z) px
 */
declare class TranslateAnimation extends Animation {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number, options?: AnimationOptions & task.TaskOptions);
}
/**
 * Rotates the view by deg degrees
 */
declare class RotateAnimation extends Animation {
    deg: number;
    constructor(deg?: number, options?: AnimationOptions & task.TaskOptions);
}
/**
 * Rotates the view around the x, y and z axes, in degrees
 */
declare class RotateXYZAnimation extends Animation {
    degX: number;
    degY: number;
    degZ: number;
    constructor(degX?: number, degY?: number, degZ?: number, options?: AnimationOptions & task.TaskOptions);
}
/**
 * Scales the view: by sx on both axes, or by (sx, sy, sz)
 */
declare class ScaleAnimation extends Animation {
    sx: number;
    sy: number;
    sz: number;
    constructor(sx?: number, sy?: number, sz?: number, options?: AnimationOptions & task.TaskOptions);
}
/**
 * Skews the view by (ax, ay) degrees
 */
declare class SkewAnimation extends Animation {
    ax: number;
    ay: number;
    constructor(ax?: number, ay?: number, options?: AnimationOptions & task.TaskOptions);
}
/**
 * Changes the opacity of the view
 */
declare class OpacityAnimation extends Animation {
    value: number;
    constructor(value?: number, options?: AnimationOptions & task.TaskOptions);
}

/**
 * Threshold, in px, of a pointer move cancelling a tap
 */
declare const MOVE_THRESHOLD = 20;
/**
 * What a recognizer is attached to: a view
 */
interface RecognizerTarget {
    readonly view: HTMLElement | null;
    /** a disabled target is ignored */
    readonly enable?: boolean;
}
/**
 *  @class
 *  Base class of the pointer recognizers: a recognizer listens to the
 *  pointer events (native Pointer Events) of a view, recognizes a gesture
 *  (tap, drag, pinch, rotation) and calls its delegate.
 *  <p>
 *  A recognizer listens to 'pointerdown' on the view; while a gesture is in
 *  progress, it follows the pointers on the document (startTracking), so
 *  that the gesture continues outside the view.
 *
 *  @example
 *  view.addPointerRecognizer(new TapRecognizer({ didTap: (nbTaps) => … }));
 */
declare abstract class PointerRecognizer<Delegate extends object = object> {
    #private;
    /**
     * The object called when the gesture is recognized
     */
    delegate: Delegate | undefined;
    constructor(delegate?: Delegate);
    /**
     * The target (view) the recognizer is attached to
     */
    get target(): RecognizerTarget | undefined;
    /**
     *  Attaches the recognizer to a target (see View.addPointerRecognizer)
     */
    attach(target: RecognizerTarget): void;
    /**
     *  Detaches the recognizer from its target
     */
    detach(): void;
    /*****************************************************************
     *  Subclass hooks
     ****************************************************************/
    /** called once attached to the view */
    protected didAttach(view: HTMLElement): void;
    /** called before being detached from the view */
    protected willDetach(view: HTMLElement): void;
    /** resets the recognition state */
    protected reset(): void;
    /** a pointer went down on the view */
    protected pointerDown(event: PointerEvent): void;
    /** a pointer moved, while tracking */
    protected pointerMove(event: PointerEvent): void;
    /** a pointer went up, while tracking */
    protected pointerUp(event: PointerEvent): void;
    /** a pointer was cancelled, while tracking: a pointer up by default */
    protected pointerCancel(event: PointerEvent): void;
    /*****************************************************************
     *  Helpers
     ****************************************************************/
    /**
     *  Follows the pointers on the document (move, up, cancel)
     */
    protected startTracking(): void;
    /**
     *  Stops following the pointers on the document
     */
    protected stopTracking(): void;
    /**
     *  Calls a method of the delegate, if it exists; an exception it throws is
     *  logged
     */
    protected notify(method: keyof Delegate, ...args: unknown[]): void;
}

/**
 * The options of a view: how to get its DOM node, and the initial values of
 * its model properties (assigned once initialized, see init)
 */
interface ViewOptions {
    /** the component id */
    id?: string;
    /** the DOM node of the view */
    node?: HTMLElement;
    /** the id of the DOM node of the view */
    nodeId?: string;
    /** a node of another view: 'rootId#ref' (x-hag-ref attribute) */
    nodeRef?: string;
    /** the root view of nodeRef, with the former 'ref' syntax */
    rootRef?: string;
    /** a template of the .application_templates node (its class name) */
    templateRef?: string;
    /** an HTML template */
    template?: string;
    /** the initial values of the model properties */
    [property: string]: unknown;
}
type ViewClass = new (options?: ViewOptions) => View<any>;
/** something which can be a child of a view: a view, or a non graphical component */
type ViewChild = Component;
/**
 *  @class
 *  A View is the base class of the graphical components: a Model with a DOM
 *  node (view.view).
 *  <p>
 *  Its node comes from the options (node, nodeId, nodeRef, templateRef,
 *  template), or from its HTML template (htmlTemplate). Its template
 *  defines holes (x-hag-hole attribute) where its children are added.
 *  <p>
 *  It manages its children, its layout (position, size, autosizing,
 *  magnet, layout), its transformations (translation, rotation, scaling),
 *  its visibility (show/hide, with animations), its CSS, and its pointer
 *  recognizers.
 *
 *  @example
 *  const view = new View({ position: [10, 10], size: [100, 50] });
 *  view.init();
 *  application.add(view);
 *
 * @name vs.ui.View
 */
declare class View<Events extends ModelEvents = {}> extends Model<Events> {
    #private;
    /********************************************************************
                      Constants
    *********************************************************************/
    static DEFAULT_LAYOUT: string | null;
    static HORIZONTAL_LAYOUT: string;
    static LEGACY_HORIZONTAL_LAYOUT: string;
    static VERTICAL_LAYOUT: string;
    static LEGACY_VERTICAL_LAYOUT: string;
    static ABSOLUTE_LAYOUT: string;
    static LEGACY_ABSOLUTE_LAYOUT: string;
    static FLOW_LAYOUT: string;
    static LEGACY_FLOW_LAYOUT: string;
    /** threshold, in px, of a pointer move unselecting an item */
    static MOVE_THRESHOLD: number;
    static MAGNET_NONE: number;
    static MAGNET_TOP: number;
    static MAGNET_BOTTOM: number;
    static MAGNET_LEFT: number;
    static MAGNET_RIGHT: number;
    static MAGNET_CENTER: number;
    /** the hole of the non graphical children */
    static NON_G_OBJECT: string;
    /** the default hole */
    static ANY_PLACE: string;
    /**
     *  Registers a component class, for createAndAddComponent
     */
    static registerComponent(name: string, Class: ViewClass): void;
    /**
     *  The view (component) of a view node
     */
    static componentOf(node: Element | null | undefined): View<any> | undefined;
    /********************************************************************
                      Fields
    *********************************************************************/
    /** the DOM node of the view, once initialized */
    view: HTMLElement | null;
    /** the HTML template of the view, used without node in the options */
    protected htmlTemplate: string;
    constructor(options?: ViewOptions);
    /********************************************************************
                      Life cycle
    *********************************************************************/
    /**
     *  Builds the DOM node of the view (see ViewOptions), finds its holes and
     *  attaches its recognizers.
     */
    protected initComponent(): void;
    /**
     *  Applies the magnet, then assigns the initial values of the options
     *  (once the subclasses are initialized)
     */
    protected componentDidInitialize(): void;
    protected destructor(): void;
    /**
     *  Updates the size and position from the DOM, and refreshes the children
     */
    refresh(): void;
    /**
     *  Notifies that the view node was added to the DOM. Override it to
     *  perform tasks when the view is presented; call the parent method.
     */
    viewDidAdd(): void;
    /**
     *  Returns a copy of a template of the application: the node of class ref
     *  in the .application_templates node (removed from the document once
     *  read)
     */
    static templateNode(ref: string): HTMLElement | undefined;
    /**
     *  Returns the node of the view with the x-hag-ref (or x-hag-comp)
     *  attribute ref
     */
    findNodeRef(ref: string): Element | undefined;
    /********************************************************************
                      Children
    *********************************************************************/
    /**
     * The parent view, once added (see add)
     */
    get parent(): View<any> | undefined;
    /**
     *  Creates a component from its class name (see registerComponent, or a
     *  global class), initializes it and adds it to this view.
     *  Its node is found with the options (see ViewOptions), else in the
     *  application templates, the template of its class, or loaded from
     *  '<name>.xhtml'; else it uses its html template.
     *
     * @param {String} name the class name
     * @param {Object} options the options of the component
     * @param {String} extension the hole to add it to
     * @return {View} the component, undefined if it could not be created
     */
    createAndAddComponent(name: string, options?: ViewOptions, extension?: string): View<any> | undefined;
    /**
     *  Returns true if the component is a child of this view
     */
    isChild(child: ViewChild | null | undefined): boolean;
    /**
     *  Returns the children of a hole (all the children without hole)
     */
    getChildren(extension?: string): ViewChild[];
    /**
     *  Adds a child: a view (its node is added to the hole extension, the
     *  'children' hole by default) or a non graphical component.
     *  The add is lazy: a view node already in the hole is not moved.
     *
     *  @example
     *  view.add(button, 'children');
     *
     * @param {Component} child the child
     * @param {String} extension the hole [optional]
     * @param {HTMLElement} view the node of the child, if not child.view
     *        [optional]
     */
    add(child: ViewChild, extension?: string, view?: HTMLElement): void;
    /**
     *  Removes a child: its node is removed from the DOM
     */
    remove(child: ViewChild): void;
    /**
     *  Removes all the children (of a hole), and destroys them or returns
     *  them
     *
     * @param {Boolean} shouldDestroy destroy the removed children
     * @param {String} extension the hole [optional]
     * @return {Array} the removed children, if not destroyed
     */
    removeAllChildren(shouldDestroy?: boolean, extension?: string): ViewChild[] | undefined;
    /**
     *  Returns a new view of the same class: its model properties, show and
     *  hide animations are copied, and its children (except the ones it
     *  created while initializing, created again by the clone) are cloned in
     *  the same holes. The clone is initialized.
     *
     * @param {ViewOptions} options the options of the clone [optional]
     * @return {View} the clone
     */
    clone(options?: ViewOptions): this;
    /********************************************************************
                      Events
    *********************************************************************/
    /**
     *  Binds an event: a pointer event of the view node ('pointerdown',
     *  'pointermove', 'pointerup', 'pointercancel'), or a component event
     *  (see EventSource.bind).
     *  The pointer events are given to func (a function, or the name of a
     *  method of obj; 'notify' by default), with obj as this.
     */
    bind(spec: string, obj: Component, func?: Function | string): void;
    /**
     *  Unbinds an event (see bind)
     */
    unbind(spec: string, obj: Component, func?: Function | string): void;
    /**
     *  Default handler of the bound pointer events (see bind)
     */
    notify(event: Event): void;
    /**
     *  Receives the events of the children (see notifyToParent): forwards
     *  them to the parent when bubbling is set
     */
    handleEvent(event: Event): void;
    /**
     *  Gives an event to the parent: to its handleEvent, else to its notify
     */
    notifyToParent(event: Event): void;
    /**
     *  Gets an event's pointer position relatively to the view
     */
    getPointerPosition(event: PointerEvent): {
        x: number;
        y: number;
    };
    /********************************************************************
                      Pointer recognizers
    *********************************************************************/
    /**
     *  Adds a pointer recognizer (tap, drag, pinch, rotation…); it is attached
     *  to the view node once it exists
     */
    addPointerRecognizer(recognizer: PointerRecognizer<any>): void;
    /**
     *  Removes a pointer recognizer
     */
    removePointerRecognizer(recognizer: PointerRecognizer<any>): void;
    /********************************************************************
                      Layout
    *********************************************************************/
    /**
     * The size of the view [width, height], in px
     */
    set size(v: number[]);
    get size(): number[];
    /**
     * The position of the view [x, y], in px
     */
    set position(v: number[]);
    get position(): number[];
    /**
     * The size and position behaviors according to the parent size
     * [horizontal, vertical]
     */
    set autosizing(v: number[]);
    get autosizing(): number[];
    /**
     * The magnet: View.MAGNET_NONE, TOP, BOTTOM, LEFT, RIGHT or CENTER
     */
    set magnet(code: number);
    get magnet(): number;
    /**
     * The layout of the children: View.DEFAULT_LAYOUT, HORIZONTAL_LAYOUT,
     * VERTICAL_LAYOUT, ABSOLUTE_LAYOUT or FLOW_LAYOUT
     */
    set layout(v: string | null);
    get layout(): string | null;
    /**
     *  Called once the node style is updated from the size, position,
     *  autosizing and magnet: a subclass can adjust it
     */
    protected didUpdateSizeAndPosition(): void;
    /********************************************************************
                      CSS
    *********************************************************************/
    /**
     *  Returns the inline value of a CSS property (undefined for 'auto'); a
     *  number for the opacity (1 by default)
     */
    getStyle(property: string): string | number | undefined;
    /**
     *  Returns the computed value of a CSS property (undefined for 'auto'); a
     *  number for the opacity
     */
    getComputedStyle(property: string): string | number | undefined;
    /**
     *  Sets an inline CSS property; undefined removes it
     */
    setStyle(property: string, value?: string | number): void;
    /**
     *  Sets inline CSS properties (camelized names)
     */
    setStyles(style: Record<string, number | string | null | undefined>): void;
    /**
     *  Adds CSS rules for the elements of this view:
     *  addCssRules('.name', ['color: red']) <=> '#<id> .name { color: red }'
     */
    addCssRules(selector: string, rules: string[]): void;
    /**
     *  Adds a CSS rule for the elements of this view (see addCssRules)
     */
    addCssRule(selector: string, rule: string): void;
    hasClassName(className: string): boolean;
    addClassName(...classNames: string[]): void;
    removeClassName(...classNames: string[]): void;
    toggleClassName(className: string): void;
    /**
     *  Sets the CSS visibility of the view node (see also show and hide)
     */
    setVisible(visibility: boolean): void;
    /**
     *  Forces the browser to render the view again, then calls clb
     */
    redraw(clb?: Function): void;
    /**
     * The HTML content of the view node
     */
    set innerHTML(v: string);
    /********************************************************************
                      Visibility
    *********************************************************************/
    /**
     * Shows (true) or hides (false) the view, see show and hide
     */
    set visible(v: boolean);
    get visible(): boolean;
    /**
     *  Displays the view, with its show animation; clb is called at the end
     */
    show(clb?: Function): void;
    /**
     *  Hides the view, with its hide animation; clb is called at the end
     */
    hide(clb?: Function): void;
    /**
     *  Sets the animation used to show the view: an Animation (cloned), or
     *  [property, value] pairs; null removes it.
     *
     *  @example
     *  view.setShowAnimation([['translate', '0,0,0'], ['opacity', '1']]);
     *  view.setShowAnimation(Animation.FadeIn, { duration: '1s' });
     */
    setShowAnimation(animations?: [string, string][] | Animation | null, options?: AnimationOptions, clb?: Function): void;
    /**
     *  Sets the animation used to hide the view (see setShowAnimation)
     */
    setHideAnimation(animations?: [string, string][] | Animation | null, options?: AnimationOptions, clb?: Function): void;
    /**
     * The show animation (see setShowAnimation)
     */
    set showAnimation(v: Animation | [string, string][] | null | undefined);
    get showAnimation(): Animation | undefined;
    /**
     * The hide animation (see setHideAnimation)
     */
    set hideAnimation(v: Animation | [string, string][] | null | undefined);
    get hideAnimation(): Animation | undefined;
    /**
     *  Animates the view, with an Animation or [property, value] pairs.
     *
     *  @example
     *  await view.animate([['translate', '100px,0,0'], ['opacity', '0']]);
     *
     * @return {Promise} the result of the animation ('ended' or 'stopped')
     */
    animate(animations: [string, string][] | Animation, options?: AnimationOptions, clb?: Function): Promise<'ended' | 'stopped'> | undefined;
    /********************************************************************
                      State
    *********************************************************************/
    /**
     * Activates or deactivates the view (the 'disabled' class name; the
     * recognizers ignore a disabled view)
     */
    set enable(v: boolean);
    get enable(): boolean;
    /**
     *  Called when the view is enabled or disabled
     */
    protected didEnable(): void;
    /**
     * The opacity, in [0, 1]
     */
    set opacity(v: number);
    get opacity(): number;
    /**
     * Forwards the events to the parent (see handleEvent), false by default
     */
    set bubbling(v: boolean);
    get bubbling(): boolean;
    /********************************************************************
                      Transformations
    *********************************************************************/
    /**
     *  Moves the view by (x, y, z) px
     */
    translate(x: number, y: number, z?: number): void;
    /**
     *  Rotates the view, in degrees: around the z axis, or around the x, y
     *  and z axes
     */
    rotate(r: number | number[]): void;
    /**
     *  Scales the view, within [minScale, maxScale]
     */
    scale(s: number): void;
    /**
     *  Starts a new transformation space, with a new origin: the current
     *  transformation goes into the transformation stack
     */
    setNewTransformOrigin(origin: {
        x: number;
        y: number;
    }): void;
    /**
     *  Moves the current transformation into the transformation stack
     */
    flushTransformStack(): void;
    /**
     *  Adds a matrix to the transformation stack
     */
    pushNewTransform(matrix: DOMMatrix): void;
    /**
     *  Removes the previous transformations (the transformation stack)
     */
    clearTransformStack(): void;
    /**
     *  The current transformation matrix of the view
     */
    getCTM(): DOMMatrix;
    /**
     *  The combined transformation matrix of the parents (identity without
     *  parent)
     */
    getParentCTM(): DOMMatrix;
    /**
     * The translation [tx, ty, tz] (see translate)
     */
    set translation(v: number[]);
    get translation(): number[];
    /**
     * The rotation, in degrees (see rotate)
     */
    set rotation(v: number | number[]);
    get rotation(): number[];
    /**
     * The scale (see scale)
     */
    set scaling(v: number);
    get scaling(): number;
    /**
     * The minimum scale (0.5 by default)
     */
    set minScale(v: number);
    get minScale(): number;
    /**
     * The maximum scale (3 by default)
     */
    set maxScale(v: number);
    get maxScale(): number;
    /**
     * The origin of the transformations [x, y], in px
     */
    set transformOrigin(v: number[]);
    get transformOrigin(): number[];
}

/**
 *  @class
 *  An HTML template: an HTML text fragment, possibly containing ${name}
 *  tags.
 *  <ul>
 *    <li>apply(values) expands the tags with values, into an HTML string;
 *    <li>node() parses the template into a DOM node (see parseHTML).
 *  </ul>
 *
 *  @example
 *  const template = new Template('<span style="${style}">${name.last}, ${name.first}</span>');
 *  template.apply({ style: 'color:blue', name: { last: 'Doe', first: 'John' } });
 *  // -> '<span style="color:blue">Doe, John</span>'
 *
 *  new Template('<div class="box"><p x-hag-hole="children"></p></div>').node();
 *  // -> the div element
 *
 * @name vs.ui.Template
 */
declare class Template {
    private readonly html;
    constructor(html: string);
    /**
     * The HTML string of the template
     */
    toString(): string;
    /**
     *  Returns the HTML string of the template, with its tags replaced by the
     *  values ('' for a missing value).
     *
     * @param {Object} values the values, by tag name
     * @return {String} the HTML string
     */
    apply(values?: Record<string, unknown>): string;
    /**
     *  Parses the template into a new DOM node (see parseHTML).
     *
     * @return {HTMLElement} the node, undefined if the template has no element
     */
    node(): HTMLElement | undefined;
    /**
     *  Parses an HTML string into a DOM node: its first element, detached.
     *
     * @param {String} html the HTML string
     * @return {HTMLElement} the node, undefined if the HTML has no element
     */
    static parseHTML(html: string): HTMLElement | undefined;
}

/**
 *  @class
 *  Base class of the two pointers gestures (pinch, rotation): the gesture
 *  starts when a second pointer goes down on the view, changes while the
 *  pointers move, and ends when one of them goes up.
 *  <p>
 *  It sets touch-action: none on the view, so that the browser does not
 *  zoom or scroll the page.
 */
declare abstract class GestureRecognizer<Delegate extends object = object> extends PointerRecognizer<Delegate> {
    #private;
    /** the gesture started */
    protected abstract gestureStart(event: PointerEvent): void;
    /**
     * the gesture changed
     * @param scale the distance between the pointers, relatively to the start
     * @param rotation the rotation of the pointers since the start, in degrees
     */
    protected abstract gestureChange(event: PointerEvent, scale: number, rotation: number): void;
    /** the gesture ended */
    protected abstract gestureEnd(event: PointerEvent): void;
    protected didAttach(view: HTMLElement): void;
    protected willDetach(view: HTMLElement): void;
    protected reset(): void;
    protected pointerDown(event: PointerEvent): void;
    protected pointerMove(event: PointerEvent): void;
    protected pointerUp(event: PointerEvent): void;
}

/**
 * Delay, in ms, to wait for another tap (double tap…)
 */
declare const MULTI_TAP_DELAY = 100;
interface TapDelegate {
    /** a pointer went down on the view */
    didTouch?(target: RecognizerTarget, element: HTMLElement, event: PointerEvent): void;
    /** the pointer went up, or moved too far (no tap) */
    didUntouch?(target: RecognizerTarget, element: HTMLElement, event: PointerEvent): void;
    /** the view was tapped nbTaps times (1, 2 for a double tap…) */
    didTap?(nbTaps: number, target: RecognizerTarget, element: HTMLElement, event: PointerEvent): void;
}
/**
 *  @class
 *  Recognizes taps (single, double…) on a view.
 *  <p>
 *  A tap is a pointer going down then up on the view, without moving more
 *  than MOVE_THRESHOLD px. Taps following each other within
 *  MULTI_TAP_DELAY ms are counted together: didTap is called once, with
 *  their number.
 *
 *  @example
 *  view.addPointerRecognizer(new TapRecognizer({
 *    didTap: (nbTaps) => { if (nbTaps === 2) … },
 *  }));
 */
declare class TapRecognizer extends PointerRecognizer<TapDelegate> {
    #private;
    protected reset(): void;
    protected pointerDown(event: PointerEvent): void;
    protected pointerMove(event: PointerEvent): void;
    protected pointerUp(event: PointerEvent): void;
    protected pointerCancel(event: PointerEvent): void;
}

interface DragDelegate {
    /** a pointer went down on the view: the drag starts */
    didDragStart?(event: PointerEvent, target: RecognizerTarget): void;
    /** the pointer moved by (dx, dy) px since the drag start */
    didDrag?(delta: {
        dx: number;
        dy: number;
    }, event: PointerEvent, target: RecognizerTarget): void;
    /** the pointer went up (or was cancelled): the drag ends */
    didDragEnd?(event: PointerEvent, target: RecognizerTarget): void;
}
/**
 *  @class
 *  Recognizes a drag of a view: one pointer going down on the view, moving,
 *  then going up. The moves are given relatively to the drag start.
 *  <p>
 *  It sets touch-action: none on the view, so that a touch drag does not
 *  scroll the page.
 *
 *  @example
 *  view.addPointerRecognizer(new DragRecognizer({
 *    didDrag: ({ dx, dy }) => view.translate(dx, dy),
 *  }));
 */
declare class DragRecognizer extends PointerRecognizer<DragDelegate> {
    #private;
    protected didAttach(view: HTMLElement): void;
    protected willDetach(view: HTMLElement): void;
    protected reset(): void;
    protected pointerDown(event: PointerEvent): void;
    protected pointerMove(event: PointerEvent): void;
    protected pointerUp(event: PointerEvent): void;
}

interface PinchDelegate {
    /** a second pointer went down on the view: the pinch starts */
    didPinchStart?(event: PointerEvent, target: RecognizerTarget): void;
    /** the pointers moved: scale is their distance relatively to the start */
    didPinchChange?(scale: number, event: PointerEvent, target: RecognizerTarget): void;
    /** a pointer went up: the pinch ends */
    didPinchEnd?(event: PointerEvent, target: RecognizerTarget): void;
}
/**
 *  @class
 *  Recognizes a pinch on a view: two pointers moving apart or together.
 *
 *  @example
 *  view.addPointerRecognizer(new PinchRecognizer({
 *    didPinchChange: (scale) => view.scale(scale),
 *  }));
 */
declare class PinchRecognizer extends GestureRecognizer<PinchDelegate> {
    protected gestureStart(event: PointerEvent): void;
    protected gestureChange(event: PointerEvent, scale: number): void;
    protected gestureEnd(event: PointerEvent): void;
}

interface RotationDelegate {
    /** a second pointer went down on the view: the rotation starts */
    didRotationStart?(event: PointerEvent): void;
    /** the pointers turned by rotation degrees since the start */
    didRotationChange?(rotation: number, event: PointerEvent): void;
    /** a pointer went up: the rotation ends */
    didRotationEnd?(event: PointerEvent): void;
}
/**
 *  @class
 *  Recognizes a rotation on a view: two pointers turning around each other.
 *  The rotation is in degrees, clockwise.
 *
 *  @example
 *  view.addPointerRecognizer(new RotationRecognizer({
 *    didRotationChange: (rotation) => view.rotate(rotation),
 *  }));
 */
declare class RotationRecognizer extends GestureRecognizer<RotationDelegate> {
    protected gestureStart(event: PointerEvent): void;
    protected gestureChange(event: PointerEvent, _scale: number, rotation: number): void;
    protected gestureEnd(event: PointerEvent): void;
}

/**
 * A blank image: set as src to free an image
 */
declare const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
/**
 * Converts a value to the text of a component: '' for null or undefined,
 * the string form of the other values. Returns undefined for a value which
 * can not be converted.
 */
declare function toText(value: unknown): string | undefined;
/**
 * The events of a text input (TextArea, InputField)
 */
type TextInputEvents = {
    /** the user changed the text: on each change (formerly 'continuous_change') */
    input: [value: string];
    /** the user committed the text (formerly 'change') */
    commit: [value: string];
    /** the input got the focus */
    focus: [];
    /** the input lost the focus */
    blur: [];
};

/**
 * The codes of the themes: a theme gives its code as the margin-top (in px)
 * of the '.device_test' elements (see getDeviceCSSCode).
 */
declare const CSS_DEFAULT = 0;
declare const CSS_IOS = 5;
declare const CSS_WP7 = 6;
declare const CSS_BLACKBERRY = 7;
declare const CSS_SYMBIAN = 8;
declare const CSS_ANDROID = 9;
declare const CSS_MEEGO = 10;
declare const CSS_PURE = 100;
declare const CSS_FLAT = 101;
declare const CSS_HOLO = 102;
declare const CSS_IOS7 = 103;
/**
 * Returns the code of the theme of the page (CSS_IOS, CSS_ANDROID…),
 * CSS_DEFAULT without theme
 */
declare function getDeviceCSSCode(): number;

/**
 *  @class
 *  A TextLabel displays a text, which can not be selected.
 *
 *  @example
 *  const label = new TextLabel({ text: 'Hello' });
 *  label.init();
 *
 * @extends vs.ui.View
 * @name vs.ui.TextLabel
 */
declare class TextLabel extends View {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /**
     * The text (a number or an object is converted to text)
     */
    set text(v: string);
    get text(): string;
}

/**
 *  @class
 *  An ImageView displays an image.
 *
 *  @example
 *  const image = new ImageView({ src: 'logo.png', size: [64, 64] });
 *  image.init();
 *
 * @extends vs.ui.View
 * @name vs.ui.ImageView
 */
declare class ImageView extends View {
    #private;
    protected htmlTemplate: string;
    view: HTMLImageElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     * The url of the image
     */
    set src(v: string | null);
    get src(): string | null;
    /**
     * The size of the image [width, height], in px; once displayed, the
     * actual size of the node
     */
    set size(v: number[]);
    get size(): number[];
}

/**
 * The events of a Button
 */
type ButtonEvents = {
    /** the button was clicked or tapped */
    select: [];
};
/**
 *  @class
 *  A Button emits a 'select' event when it is clicked or tapped. It has the
 *  'pressed' class name while it is pressed.
 *
 *  @example
 *  const button = new Button({ text: 'Hello', style: Button.BLUE_STYLE });
 *  button.init();
 *  button.on('select', () => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Button
 */
declare class Button extends View<ButtonEvents> implements TapDelegate {
    #private;
    static DEFAULT_TYPE: string;
    static NAVIGATION_TYPE: string;
    static NAVIGATION_BACK_TYPE: string;
    static NAVIGATION_FORWARD_TYPE: string;
    static DEFAULT_STYLE: string;
    static GREEN_STYLE: string;
    static RED_STYLE: string;
    static GREY_STYLE: string;
    static BLUE_STYLE: string;
    static BLACK_STYLE: string;
    static SILVER_STYLE: string;
    protected htmlTemplate: string;
    /** the node of the text */
    protected textView: HTMLElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     * True while the button is pressed
     */
    get selected(): boolean;
    /*****************************************************************
     *  Tap delegate
     ****************************************************************/
    didTouch(): void;
    didUntouch(): void;
    didTap(): void;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The text of the button (a number or an object is converted to text)
     */
    set text(v: string);
    get text(): string;
    /**
     * The style of the button: a class name (Button.BLUE_STYLE…)
     */
    set style(v: string);
    get style(): string;
    /**
     * The type of the button: a class name (Button.DEFAULT_TYPE,
     * NAVIGATION_TYPE…)
     */
    set type(v: string);
    get type(): string;
}

/**
 *  @class
 *  A ProgressBar shows the progress of a task: its index in its range. An
 *  indeterminate ProgressBar shows a task of unknown duration.
 *
 *  @example
 *  const bar = new ProgressBar({ range: [0, 10], index: 3 });
 *  bar.init();
 *
 * @extends vs.ui.View
 * @name vs.ui.ProgressBar
 */
declare class ProgressBar extends View {
    #private;
    protected htmlTemplate: string;
    /** the node of the bar */
    protected innerView: HTMLElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     * The progress, in the range (the bar is full beyond the range)
     */
    set index(v: number);
    get index(): number;
    /**
     * The range of the index [min, max], [0, 100] by default
     */
    set range(v: number[]);
    get range(): number[];
    /**
     * True for a task of unknown duration (the 'indeterminate' class name)
     */
    set indeterminate(v: boolean);
    get indeterminate(): boolean;
}

/**
 *  @class
 *  A TextArea is a multi-line text input. Its value is notified on each
 *  change (the 'input' event); the 'commit' event is emitted when the user
 *  commits the text. It loses the focus when a pointer goes down outside.
 *
 *  @example
 *  const area = new TextArea({ value: 'Hello' });
 *  area.init();
 *  area.on('commit', (area, value) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.TextArea
 */
declare class TextArea extends View<TextInputEvents> {
    #private;
    view: HTMLTextAreaElement | null;
    protected htmlTemplate: string;
    protected initComponent(): void;
    protected destructor(): void;
    protected didEnable(): void;
    /**
     * Gives the focus to the text area
     */
    setFocus(): void;
    /**
     * Removes the focus from the text area
     */
    setBlur(): void;
    /**
     * The text (a number or an object is converted to text)
     */
    set value(v: string);
    get value(): string;
}

/**
 * The type of an InputField
 */
type InputFieldType = 'text' | 'password' | 'search';
/**
 *  @class
 *  An InputField is a one line text input, with a clear button. It can be
 *  a text field, a password field (the characters are replaced by dots) or
 *  a search field.
 *  Its value is notified on each change (the 'input' event); the 'commit'
 *  event is emitted when the user commits the text. It has the 'focus'
 *  class name while it has the focus, and loses it when a pointer goes
 *  down outside.
 *
 *  @example
 *  const input = new InputField({ id: 'input' });
 *  input.init();
 *  input.placeholder = 'Type your password...';
 *  input.type = InputField.PASSWORD;
 *
 * @extends vs.ui.View
 * @name vs.ui.InputField
 */
declare class InputField extends View<TextInputEvents> {
    #private;
    /** a text input */
    static TEXT: "text";
    /** a password input: the characters are replaced by dots */
    static PASSWORD: "password";
    /** a search input */
    static SEARCH: "search";
    protected htmlTemplate: string;
    /** the input node */
    protected textField: HTMLInputElement | null;
    /** the clear button node */
    protected clearButton: HTMLElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    protected didEnable(): void;
    /**
     * Gives the focus to the input
     */
    setFocus(): void;
    /**
     * Removes the focus from the input
     */
    setBlur(): void;
    /**
     * Clears the text, as the user did (with the clear button): notifies the
     * value and emits the 'input' and 'commit' events.
     */
    clear(): void;
    /**
     * The text (a number or an object is converted to text)
     */
    set value(v: string);
    get value(): string;
    /**
     * The type: InputField.TEXT, PASSWORD or SEARCH (also a class name)
     */
    set type(v: InputFieldType);
    get type(): InputFieldType;
    /**
     * A hint to help the user fill the input
     */
    set placeholder(v: string);
    get placeholder(): string;
}

/**
 *  @class
 *  A SVGView displays a svg document: a file (href), an element of a file
 *  (href 'file.svg#id'), or svg data (contentData). A file is loaded once,
 *  and shared by the views.
 *
 *  @example
 *  const svg = new SVGView({ href: 'image.svg' });
 *  svg.init();
 *  // or
 *  svg.href = 'image.svg#id';
 *  // or
 *  svg.contentData = '<svg>…</svg>';
 *
 * @extends vs.ui.View
 * @name vs.ui.SVGView
 */
declare class SVGView extends View {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /**
     * The url of a svg file, or of an element of the file ('file.svg#id')
     */
    set href(v: string | null);
    get href(): string | null;
    /**
     * The svg data to display
     */
    set contentData(v: string | null);
    get contentData(): string | null;
    /**
     * The view box of the svg [x, y, width, height]
     */
    set viewBox(v: number[] | null);
    get viewBox(): number[] | null;
}

/**
 * The events of a ComboBox
 */
type ComboBoxEvents = {
    /** the user selected an item (formerly 'change') */
    select: [item: string];
};
/**
 *  @class
 *  A ComboBox lets the user select an item in a drop-down list (a native
 *  select).
 *
 *  @example
 *  const combo = new ComboBox({ data: ['item1', 'item2', 'item3'] });
 *  combo.init();
 *  combo.on('select', (combo, item) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.ComboBox
 */
declare class ComboBox extends View<ComboBoxEvents> {
    #private;
    protected htmlTemplate: string;
    /** the select node */
    protected select: HTMLSelectElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    protected didEnable(): void;
    /**
     * Gives the focus to the combo box
     */
    setFocus(): void;
    /**
     * Removes the focus from the combo box
     */
    setBlur(): void;
    /**
     * The selected item (the first item by default)
     */
    set selectedItem(v: string | null);
    get selectedItem(): string | null;
    /**
     * The items of the list (converted to text)
     */
    set data(v: string[]);
    get data(): string[];
}

/**
 * The events of a SegmentedButton
 */
type SegmentedButtonEvents = {
    /** the user selected a button */
    select: [index: number, item: string];
};
/**
 *  @class
 *  A SegmentedButton displays a set of buttons, horizontally or vertically.
 *  Only one button is selected (the 'selected' class name); a 'select'
 *  event is emitted when the user presses another button.
 *  Without toggle buttons (isToggleButtons false), the buttons are
 *  momentary: the selection is cleared after a short delay.
 *
 *  @example
 *  const segmented = new SegmentedButton({
 *    items: ['test1', 'test2', 'test3'],
 *    type: SegmentedButton.BAR_TYPE,
 *  });
 *  segmented.init();
 *  segmented.on('select', (segmented, index, item) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.SegmentedButton
 */
declare class SegmentedButton extends View<SegmentedButtonEvents> {
    #private;
    static DEFAULT_TYPE: string;
    static BAR_TYPE: string;
    static HORIZONTAL: number;
    static VERTICAL: number;
    protected htmlTemplate: string;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     * The texts of the buttons
     */
    set items(v: string[]);
    get items(): string[];
    /**
     * The index of the selected button, -1 without selection
     */
    set selectedIndex(v: number);
    get selectedIndex(): number;
    /**
     * The type: a class name (SegmentedButton.DEFAULT_TYPE, BAR_TYPE)
     */
    set type(v: string);
    get type(): string;
    /**
     * True (default) for toggle buttons, false for momentary buttons
     */
    set isToggleButtons(v: boolean);
    get isToggleButtons(): boolean;
    /**
     * The orientation: SegmentedButton.HORIZONTAL or VERTICAL (the
     * 'horizontal' or 'vertical' class name)
     */
    set orientation(v: number);
    get orientation(): number;
}

/**
 *  @class
 *  A Canvas draws arbitrary content in a canvas element. Override draw()
 *  (called once initialized and when the size changes), and draw with the
 *  2d context (context), or the helpers (drawRect, polygon, ellipse).
 *
 *  @example
 *  class Drawing extends Canvas {
 *    override draw(x = 0, y = 0, width = this.size[0], height = this.size[1]) {
 *      const context = this.context!;
 *      context.clearRect(x, y, width, height);
 *      context.fillStyle = 'rgb(200, 0, 0)';
 *      context.fillRect(10, 10, 55, 50);
 *      this.drawRect(30, 30, 55, 50, 5);
 *    }
 *  }
 *  const drawing = new Drawing({ size: [200, 100] });
 *  drawing.init();
 *
 * @extends vs.ui.View
 * @name vs.ui.Canvas
 */
declare class Canvas extends View {
    #private;
    protected htmlTemplate: string;
    /** the canvas node */
    canvasNode: HTMLCanvasElement | null;
    /** the 2d context of the canvas */
    context: CanvasRenderingContext2D | null;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     * Returns the 2d context of the canvas
     */
    getContext(): CanvasRenderingContext2D | null;
    /**
     * The size of the view and of the canvas [width, height], in px; the
     * canvas is drawn again
     */
    set size(v: number[]);
    get size(): number[];
    /**
     * Draws the content of the rectangle (all the canvas by default). Clears
     * it by default: override it.
     */
    draw(x?: number, y?: number, width?: number, height?: number): void;
    /**
     * Strokes a rectangle, with rounded corners (radius) and rotated
     * (rotation, in radians) [optional]
     */
    drawRect(x: number, y: number, w: number, h: number, radius?: number, rotation?: number): this;
    /**
     * Returns the point rotated around the origin (angle in radians)
     */
    rotatePoint(x: number, y: number, angle: number): [number, number];
    /**
     * Strokes a polygon: x1, y1, x2, y2, x3, y3… With an odd number of
     * arguments, the last one is the radius of the rounded corners.
     */
    polygon(...args: number[]): this;
    /**
     * Strokes an ellipse (or an arc of ellipse); the angles in radians
     */
    ellipse(cx: number, cy: number, rx: number, ry: number, rotation?: number, startAngle?: number, endAngle?: number, anticlockwise?: boolean): this;
}

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
declare class PopOver extends View {
    #private;
    static BELOW: number;
    static ABOVE: number;
    static LEFT: number;
    static RIGHT: number;
    protected htmlTemplate: string;
    /** the arrow node */
    protected arrow: HTMLElement | null;
    protected initComponent(): void;
    /**
     * A popover is hidden until shown (unless the visible option is true)
     */
    protected componentDidInitialize(): void;
    protected destructor(): void;
    /**
     *  Displays the popover, pointing at the point [x, y] of the window, in
     *  the direction (PopOver.BELOW, ABOVE, LEFT, RIGHT; chosen according to
     *  the space by default); clb is called at the end.
     *  Without point, the popover is displayed where it is.
     */
    show(clb?: Function): void;
    show(point: number[] | null, direction?: number, clb?: Function): void;
    hide(clb?: Function): void;
    /**
     * Displays the header (the 'withHeader' class name)
     */
    set hasHeader(v: boolean);
    get hasHeader(): boolean;
    /**
     * Displays the footer (the 'withFooter' class name)
     */
    set hasFooter(v: boolean);
    get hasFooter(): boolean;
}

/**
 * The delegate of a SplitView: notified when the second view moves
 */
interface SplitViewDelegate {
    /** the second view is displayed in its panel */
    willShowView?(view: ViewChild, popOver: PopOver): void;
    /** the second view is moved into the popover */
    willHideView?(view: ViewChild, popOver: PopOver): void;
}
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
declare class SplitView extends View {
    #private;
    static TABLET_MODE: string;
    static MOBILE_MODE: string;
    static VERTICAL: string;
    static HORIZONTAL: string;
    static RIGHT: string;
    static LEFT: string;
    static BOTTOM: string;
    static TOP: string;
    protected htmlTemplate: string;
    /** notified when the second view moves */
    delegate: SplitViewDelegate | null;
    /** the popover of the second view, in the tablet vertical orientation */
    protected readonly popOver: PopOver;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     *  Adds a child: to the second panel (the 'second_panel' hole, or the
     *  popover), else to the main panel
     */
    add(child: ViewChild, extension?: string, view?: HTMLElement): void;
    remove(child: ViewChild): void;
    removeAllChildren(shouldDestroy?: boolean, extension?: string): ViewChild[] | undefined;
    refresh(): void;
    /**
     *  Changes the orientation (an angle: -90 or 90 for the horizontal
     *  orientation), called when the device orientation changes
     */
    orientationWillChange(orientation: number): void;
    orientationDidChange(): void;
    /**
     *  Displays the popover of the second view (in the tablet vertical
     *  orientation), see PopOver.show
     */
    showPopOver(point: number[], direction?: number): void;
    /**
     *  Hides the popover of the second view
     */
    hidePopOver(): void;
    /**
     *  Displays the main view over the second view (in mobile mode)
     */
    showMainView(): void;
    /**
     *  Hides the main view (in mobile mode)
     */
    hideMainView(): void;
    /**
     * The button which hides the main view (in mobile mode)
     */
    set hideMainPanelButton(button: Button | null);
    get hideMainPanelButton(): Button | null;
    /**
     * The button which displays the popover (in tablet mode)
     */
    set showPopOverButton(button: Button | null);
    get showPopOverButton(): Button | null;
    /**
     * The mode: SplitView.TABLET_MODE (default) or MOBILE_MODE (also a class
     * name)
     */
    set mode(v: string);
    get mode(): string;
    /**
     * The orientation: SplitView.VERTICAL or HORIZONTAL (also a class name),
     * the window orientation by default
     */
    set orientation(v: string);
    get orientation(): string;
    /**
     * The position of the second panel: SplitView.LEFT (default), RIGHT, TOP
     * or BOTTOM (also a class name)
     */
    set secondPanelPosition(v: string);
    get secondPanelPosition(): string;
}

/**
 * The events of a Switch
 */
type SwitchEvents = {
    /** the user toggled the switch (formerly 'change') */
    toggle: [toggled: boolean];
};
/**
 *  @class
 *  A Switch displays a boolean value (toggled, the 'on' class name); the
 *  user taps it to change the value. It has the 'pressed' class name while
 *  it is pressed.
 *
 *  @example
 *  const toggle = new Switch({ textOn: 'I', textOff: 'O' });
 *  toggle.init();
 *  toggle.on('toggle', (toggle, toggled) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Switch
 */
declare class Switch extends View<SwitchEvents> implements TapDelegate {
    #private;
    protected htmlTemplate: string;
    /** the theme (see theme.ts) */
    protected mode: number;
    protected initComponent(): void;
    protected destructor(): void;
    viewDidAdd(): void;
    refresh(): void;
    /**
     * The height of a switch is given by its theme
     */
    protected didUpdateSizeAndPosition(): void;
    /**
     * True while the switch is pressed
     */
    get selected(): boolean;
    /*****************************************************************
     *  Tap delegate
     ****************************************************************/
    didTouch(): void;
    didUntouch(): void;
    didTap(): void;
    /**
     * The text of the 'on' state
     */
    set textOn(v: string);
    get textOn(): string;
    /**
     * The text of the 'off' state
     */
    set textOff(v: string);
    get textOff(): string;
    /**
     * The value of the switch, true (on) by default
     */
    set toggled(v: boolean);
    get toggled(): boolean;
}

/**
 * The events of a Slider
 */
type SliderEvents = {
    /** the user changed the value: on each move (formerly 'continuous_change') */
    input: [value: number];
    /** the user released the slider (formerly 'change') */
    commit: [value: number];
};
/**
 *  @class
 *  A Slider selects a value in a continuous range ([0, 100] by default).
 *  It is horizontal or vertical. The user taps or drags it: the value is
 *  notified on each move (the 'input' event), and the 'commit' event is
 *  emitted when the slider is released.
 *
 *  @example
 *  const slider = new Slider({ orientation: Slider.HORIZONTAL, value: 10 });
 *  slider.init();
 *  slider.on('commit', (slider, value) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Slider
 */
declare class Slider extends View<SliderEvents> implements DragDelegate {
    #private;
    static HORIZONTAL: number;
    static VERTICAL: number;
    protected htmlTemplate: string;
    /** the handle node */
    protected handle: HTMLElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    refresh(): void;
    /*****************************************************************
     *  Drag delegate
     ****************************************************************/
    didDragStart(event: PointerEvent): void;
    didDrag(_delta: {
        dx: number;
        dy: number;
    }, event: PointerEvent): void;
    didDragEnd(): void;
    /**
     * The size of the slider [width, height], in px
     */
    set size(v: number[]);
    get size(): number[];
    /**
     * The value, in the range
     */
    set value(v: number);
    get value(): number;
    /**
     * The range of the value [min, max], [0, 100] by default
     */
    set range(v: number[]);
    get range(): number[];
    /**
     * The orientation: Slider.HORIZONTAL or VERTICAL (the 'horizontal' or
     * 'vertical' class name)
     */
    set orientation(v: number);
    get orientation(): number;
}

/**
 * The values of a slot: an object (key → displayed value) or an array
 */
type PickerValues = Record<string, string | number> | (string | number)[];
/**
 * A slot (a wheel) of a picker
 */
interface PickerSlot {
    values: PickerValues;
    /** the class names of the slot: 'right', 'shrink', 'readonly'… */
    style?: string;
    /** the key selected by default */
    defaultValue?: string | number;
}
/**
 * The selected keys and values of the slots
 */
interface PickerSelection {
    keys: string[];
    values: (string | number)[];
}
/**
 * The delegate of a Picker
 */
interface PickerDelegate {
    /** the user selected a row */
    pickerViewSelectRow?(picker: Picker): void;
}
/**
 * The events of a Picker
 */
type PickerEvents = {
    /** the user selected a row (formerly 'change') */
    select: [selection: PickerSelection];
};
/**
 *  @class
 *  A Picker shows one or more sets of values on spinning wheels (slots);
 *  the user rotates the wheels to align the values with the selection
 *  indicator. With the Android theme, the slots have + and - buttons.
 *
 *  @example
 *  const sizePicker = new Picker();
 *  sizePicker.init();
 *  sizePicker.addSlot(Picker.NUMBERS, 'right');
 *  sizePicker.addSlot(Picker.NUMBERS, 'right');
 *  sizePicker.addSlot({ separator: ',' }, 'readonly');
 *  sizePicker.addSlot(Picker.NUMBERS, 'right');
 *  sizePicker.addSlot({ cm: 'Cm', ft: 'Feet' }, 'shrink');
 *  sizePicker.on('select', (picker, { keys, values }) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.Picker
 */
declare class Picker extends View<PickerEvents> {
    #private;
    static NUMBERS: Record<string, number>;
    protected htmlTemplate: string;
    /** notified when the user selects a row */
    delegate: PickerDelegate | null;
    /** the theme (see theme.ts) */
    protected mode: number;
    /** the height of a row, in px */
    protected cellHeight: number;
    /** the deceleration of a thrown slot */
    protected friction: number;
    protected initComponent(): void;
    protected destructor(): void;
    /*****************************************************************
     *  Slots
     ****************************************************************/
    /**
     * Adds a slot: its values (key → displayed value), its class names
     * ('right', 'shrink', 'readonly'…) and its key selected by default
     */
    addSlot(values: PickerValues, style?: string, defaultValue?: string | number): void;
    /**
     * Removes all the slots
     */
    removeAllSlots(): void;
    /**
     * The lowest position of the slot (its last row selected)
     */
    getSlotMaxScroll(slot: number): number;
    /**
     * Selects the row of the key in the slot, without animation. Returns
     * false for an unknown slot or key.
     */
    scrollToValue(slot: number, key: string | number): boolean;
    /**
     * Returns the selected keys and values. The animations are stopped, and
     * the slots put back within their boundaries.
     */
    getSelectedValues(): PickerSelection;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The slots (see addSlot)
     */
    set data(v: PickerSlot[]);
    get data(): PickerSlot[];
    /**
     * The selected key of each slot; setting them selects the rows
     */
    set selectedKeys(v: (string | number)[]);
    get selectedKeys(): string[];
    /**
     * The selected value of each slot
     */
    get selectedValues(): (string | number)[];
}

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
declare abstract class AbstractList<Item = unknown, Events extends ModelEvents = {}> extends View<Events> implements TapDelegate {
    #private;
    /** the node of the items */
    protected itemsView: HTMLElement | null;
    protected initComponent(): void;
    protected destructor(): void;
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
    protected touchItemFeedback(_index: number): void;
    /** removes the feedback of a touched item */
    protected untouchItemFeedback(_index: number): void;
    /** the user tapped the item */
    protected didSelectItem(_index: number): void;
    /*****************************************************************
     *  Tap delegate
     ****************************************************************/
    didTouch(_target: unknown, _element: HTMLElement, event: PointerEvent): void;
    didUntouch(): void;
    didTap(): void;
    /**
     * Scrolls to the item at the index, animated during time ms (200 by
     * default, 0 for no animation)
     */
    scrollToElementAt(index: number, time?: number): void;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The items of the list
     */
    set data(v: Item[]);
    get data(): Item[];
    /**
     * The items, without copy (for the subclasses)
     */
    protected get items(): readonly Item[];
    /**
     * The items scroll (vertically, natively), false by default
     */
    set scroll(v: boolean);
    get scroll(): boolean;
    /**
     * The items give a touch feedback and are selected when tapped (true by
     * default)
     */
    set itemsSelectable(v: boolean);
    get itemsSelectable(): boolean;
}

/**
 *  @class
 *  The base of the items of a List: the 'pressed' class name while it is
 *  touched, its index in the data, and didSelect called when it is
 *  selected.
 *
 * @extends vs.ui.View
 * @name vs.ui.AbstractListItem
 */
declare class AbstractListItem extends View {
    #private;
    /** the index of the item in the list data */
    index: number;
    /**
     * The item is touched (the 'pressed' class name)
     */
    set pressed(v: boolean);
    get pressed(): boolean;
    /**
     * Called when the user selects the item
     */
    didSelect(): void;
}
/**
 *  @class
 *  The default item of a List: a title, and a label (in a span).
 *
 * @extends vs.ui.AbstractListItem
 * @name vs.ui.DefaultListItem
 */
declare class DefaultListItem extends AbstractListItem {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /**
     * The title of the item
     */
    set title(v: string);
    get title(): string;
    /**
     * The label of the item (displayed after the title)
     */
    set label(v: string);
    get label(): string;
}
/**
 *  @class
 *  A simple item of a List: a title.
 *
 * @extends vs.ui.AbstractListItem
 * @name vs.ui.SimpleListItem
 */
declare class SimpleListItem extends AbstractListItem {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /**
     * The title of the item
     */
    set title(v: string);
    get title(): string;
}
/**
 * The events of a List
 */
type ListEvents = {
    /** the user selected an item */
    itemselect: [index: number, item: unknown];
};
/**
 * A filter of the List items: the items whose property does not match the
 * value are hidden
 */
interface ListFilter {
    property: string;
    value: string;
    /** List.FILTER_EXACTS (default), FILTER_CONTAINS or FILTER_STARTS_WITH */
    matching?: number;
    /** false for a case insensitive filter */
    strict?: boolean;
}
/**
 * The template of the List items: a class, or an item which is cloned
 */
type ListItemTemplate = (new () => AbstractListItem) | AbstractListItem;
/**
 *  @class
 *  A List draws its data with list items (DefaultListItem by default, see
 *  setItemTemplate), and lets the user select an item (the 'itemselect'
 *  event).
 *  <p>
 *  An item is configured with the data item: its model properties are set
 *  from the properties of an object, and follow the changes of a Model.
 *  <p>
 *  A BLOCK_LIST or TAB_LIST displays sections: a string in the data is the
 *  title of the next items. A TAB_LIST has a bar to access the sections by
 *  their first letter.
 *  <p>
 *  The items can be filtered:
 *  list.filters = [{
 *    property: 'title', value: 'o', matching: List.FILTER_CONTAINS, strict: false
 *  }];
 *
 *  @example
 *  const list = new List({ data: [{ title: 'one' }, { title: 'two', label: '2' }] });
 *  list.init();
 *  list.on('itemselect', (list, index, item) => { … });
 *
 * @extends vs.ui.AbstractList
 * @name vs.ui.List
 */
declare class List extends AbstractList<unknown, ListEvents> {
    #private;
    static FILTER_EXACTS: number;
    static FILTER_CONTAINS: number;
    static FILTER_STARTS_WITH: number;
    static BLOCK_LIST: string;
    static TAB_LIST: string;
    static DEFAULT_LIST: string;
    protected htmlTemplate: string;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     *  Sets the template of the items (see setItemTemplate)
     */
    add(child: ViewChild): void;
    /**
     *  Sets the template of the items: a class of item, or an item which is
     *  cloned (destroyed with the list)
     */
    setItemTemplate(template: ListItemTemplate): void;
    /**
     *  Sets the template of the items from a registered component (see
     *  View.createAndAddComponent)
     */
    setItemTemplateName(name: string): View<any> | undefined;
    /**
     * Returns the items
     */
    getItems(): AbstractListItem[];
    protected renderData(): void;
    protected itemIndexOf(node: Node | null): number;
    protected itemNodeAt(index: number): HTMLElement | undefined;
    protected touchItemFeedback(index: number): void;
    protected untouchItemFeedback(index: number): void;
    protected didSelectItem(index: number): void;
    /**
     * Hides the items which do not match all the filters
     */
    applyFilters(): void;
    /**
     * Returns the section of the title at the index (BLOCK_LIST, TAB_LIST)
     */
    getTitleItem(index: number): HTMLElement | undefined;
    /**
     * Returns the position of the section of the title at the index
     */
    getTitlePosition(index: number): number;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The index of the selected item, -1 without selection
     */
    set selectedIndex(v: number);
    get selectedIndex(): number;
    /**
     * The selected item (of the data)
     */
    set selectedItem(v: unknown);
    get selectedItem(): unknown;
    /**
     * The type: List.DEFAULT_LIST, BLOCK_LIST or TAB_LIST (also a class
     * name)
     */
    set type(v: string);
    get type(): string;
    /**
     * The items have an arrow (the 'arrow' class name), false by default
     */
    set hasArrow(v: boolean);
    get hasArrow(): boolean;
    /**
     * The filters of the items (see ListFilter)
     */
    set filters(v: ListFilter[] | null);
    get filters(): ListFilter[] | null;
}

/**
 * The events of a CheckBox
 */
type CheckBoxEvents = {
    /** the user checked or unchecked an item (formerly 'change') */
    select: [indexes: number[], items: string[]];
};
/**
 *  @class
 *  A CheckBox is a vertical list of check boxes: the user selects one or
 *  more items. Use a RadioButton to select only one item.
 *
 *  @example
 *  const checkBox = new CheckBox({ data: ['item1', 'item2', 'item3'] });
 *  checkBox.init();
 *  checkBox.on('select', (checkBox, indexes, items) => { … });
 *
 * @extends vs.ui.AbstractList
 * @name vs.ui.CheckBox
 */
declare class CheckBox extends AbstractList<string, CheckBoxEvents> {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    protected destructor(): void;
    protected didEnable(): void;
    protected renderData(): void;
    protected itemIndexOf(node: Node | null): number;
    protected itemNodeAt(index: number): HTMLElement | undefined;
    protected touchItemFeedback(index: number): void;
    protected untouchItemFeedback(index: number): void;
    /**
     * Checks the item at the index, or unchecks it if it is checked
     */
    selectItem(index: number): void;
    /**
     * The indexes of the checked items (kept until the items are set)
     */
    set selectedIndexes(v: number[]);
    get selectedIndexes(): number[];
}

/**
 * The events of a RadioButton
 */
type RadioButtonEvents = {
    /** the user selected an item (formerly 'change') */
    select: [index: number, item: string];
};
/**
 *  @class
 *  A RadioButton is a vertical list of radio buttons: the user selects one,
 *  and only one, item. Use a CheckBox to select several items.
 *
 *  @example
 *  const radio = new RadioButton({ data: ['item1', 'item2', 'item3'] });
 *  radio.init();
 *  radio.on('select', (radio, index, item) => { … });
 *
 * @extends vs.ui.AbstractList
 * @name vs.ui.RadioButton
 */
declare class RadioButton extends AbstractList<string, RadioButtonEvents> {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    protected destructor(): void;
    protected didEnable(): void;
    protected renderData(): void;
    protected itemIndexOf(node: Node | null): number;
    protected itemNodeAt(index: number): HTMLElement | undefined;
    protected touchItemFeedback(index: number): void;
    protected untouchItemFeedback(index: number): void;
    /**
     * The index of the selected item, -1 without selection (kept until the
     * items are set)
     */
    set selectedIndex(v: number);
    get selectedIndex(): number;
}

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
declare class ScrollView<Events extends ModelEvents = {}> extends View<Events> {
    #private;
    static NO_SCROLL: number;
    static VERTICAL_SCROLL: number;
    static HORIZONTAL_SCROLL: number;
    static SCROLL: number;
    protected htmlTemplate: string;
    /** the node of the content, which scrolls */
    protected contentView: HTMLElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     *  Adds a child; a child class with a static scrollViewHole is added to
     *  that hole (a NavigationBar to the top bar, a ToolBar to the bottom
     *  bar)
     */
    add(child: ViewChild, extension?: string, view?: HTMLElement): void;
    /**
     *  The node which scrolls: the content node (between the bars) by
     *  default
     */
    protected scrollContainer(): HTMLElement | null;
    /**
     * Scrolls the content to (x, y), animated during time ms (0, no
     * animation, by default)
     */
    scrollTo(x: number, y: number, time?: number): void;
    /**
     * The scroll position of the content [x, y]
     */
    get scrollPosition(): [number, number];
    /**
     * The scroll: ScrollView.NO_SCROLL (default), VERTICAL_SCROLL,
     * HORIZONTAL_SCROLL or SCROLL (both); true for SCROLL, false for
     * NO_SCROLL
     */
    set scroll(v: number | boolean);
    get scroll(): number;
    /**
     * The layout of the content (see View.layout)
     */
    set layout(v: string | null);
    get layout(): string | null;
    /**
     * The HTML content of the content node
     */
    set innerHTML(v: string);
}

/**
 * The events of a ScrollImageView
 */
type ScrollImageViewEvents = {
    /** the image is loaded */
    load: [];
};
/**
 *  @class
 *  A ScrollImageView displays an image, stretched to fit the view
 *  (stretch), and scrolls it (scroll) when it is bigger than the view.
 *  <ul>
 *    <li/>STRETCH_NONE: the image at its natural size
 *    <li/>STRETCH_FILL (default): the image fills the view (distorted)
 *    <li/>STRETCH_UNIFORM: the whole image, centered, its ratio kept
 *    <li/>STRETCH_UNIFORM_FILL: the image covers the view, its ratio kept
 *  </ul>
 *
 *  @example
 *  const image = new ScrollImageView({
 *    src: 'http://xxx/xxx/img.png',
 *    stretch: ScrollImageView.STRETCH_UNIFORM_FILL,
 *    scroll: ScrollImageView.SCROLL,
 *  });
 *  image.init();
 *  image.on('load', () => { … });
 *
 * @extends vs.ui.ScrollView
 * @name vs.ui.ScrollImageView
 */
declare class ScrollImageView extends ScrollView<ScrollImageViewEvents> {
    #private;
    static STRETCH_NONE: number;
    static STRETCH_FILL: number;
    static STRETCH_UNIFORM: number;
    static STRETCH_UNIFORM_FILL: number;
    protected htmlTemplate: string;
    /** the image node */
    protected get image(): HTMLImageElement | null;
    protected initComponent(): void;
    protected destructor(): void;
    /**
     * The view scrolls the image
     */
    protected scrollContainer(): HTMLElement | null;
    refresh(): void;
    show(clb?: Function): void;
    /**
     * The size of the view [width, height], in px; the image is stretched
     * again
     */
    set size(v: number[]);
    get size(): number[];
    /**
     * The url of the image
     */
    set src(v: string | null);
    get src(): string | null;
    /**
     * The stretch mode: ScrollImageView.STRETCH_NONE, STRETCH_FILL (default),
     * STRETCH_UNIFORM or STRETCH_UNIFORM_FILL
     */
    set stretch(v: number);
    get stretch(): number;
    /**
     * True once the image is loaded
     */
    get isLoaded(): boolean;
}

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
declare class NavigationBar extends View {
    #private;
    static DEFAULT_STYLE: string;
    static BLACK_TRANSLUCIDE_STYLE: string;
    static BLACK_STYLE: string;
    /** added to the top bar of a ScrollView */
    static scrollViewHole: string;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /*****************************************************************
     *  States
     ****************************************************************/
    /**
     *  Sets the children of a state (added to the bar if needed)
     */
    setStateItems(state: string, items: ViewChild[]): void;
    /**
     *  Returns the children of a state
     */
    getStateItems(state: string): ViewChild[] | undefined;
    /**
     *  Shows the children of the state, and hides the others. The children
     *  can be configured: { [child id]: { property: value } }
     */
    changeState(state: string, configuration?: Record<string, Record<string, unknown>>): void;
    /**
     *  The current state
     */
    get currentState(): string | null;
    /**
     *  Removes a child, also from the states
     */
    remove(child: ViewChild): void;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The style: a class name (NavigationBar.DEFAULT_STYLE…)
     */
    set style(v: string);
    get style(): string;
    /**
     * The size of the bar is given by its theme: the size of the node
     */
    set size(_v: number[]);
    get size(): number[];
    /**
     * The position of the bar is given by its parent: the position of the
     * node
     */
    set position(_v: number[]);
    get position(): number[];
}

/**
 *  @class
 *  A text item of a ToolBar.
 *
 *  @example
 *  const info = new ToolBarText({ id: 'info', text: 'Information' });
 *  info.init();
 *  bar.addItem(info);
 *
 * @extends vs.ui.View
 * @name vs.ui.ToolBar.Text
 */
declare class ToolBarText extends View {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /**
     * The text of the item
     */
    set text(v: string);
    get text(): string;
}
/**
 *  @class
 *  A button item of a ToolBar: an icon (its name, a class name of the
 *  theme: ToolBar.BUTTON_ADD…, or an image) and a label.
 *
 *  @example
 *  const back = new ToolBarButton({ id: 'back' });
 *  back.init();
 *  back.setImage('resources/images/back_icon.png');
 *  bar.addItem(back);
 *
 * @extends vs.ui.View
 * @name vs.ui.ToolBar.Button
 */
declare class ToolBarButton extends View {
    #private;
    protected htmlTemplate: string;
    protected initComponent(): void;
    /**
     * Sets the icon image of the button
     */
    setImage(path: string): void;
    /**
     * The icon of the button: a class name (ToolBar.BUTTON_ADD…)
     */
    set name(v: string);
    get name(): string;
    /**
     * The label of the button
     */
    set label(v: string);
    get label(): string;
}
/**
 * The events of a ToolBar
 */
type ToolBarEvents = {
    /** the user selected an item */
    itemselect: [id: string];
};
/**
 * A button of the configuration of a ToolBar: [id, name, label]
 */
type ToolBarButtonSpec = [id: string, name: string, label?: string];
/**
 *  @class
 *  A ToolBar is displayed at the bottom of a view (the bottom bar of a
 *  ScrollView): a set of items (buttons, texts…). The user selects an item
 *  (the 'select' class name, and the 'itemselect' event with its id); it
 *  has the 'active' class name while it is pressed.
 *
 *  @example
 *  const bar = new ToolBar({ id: 'bar' });
 *  bar.init();
 *  bar.addButton('right', ToolBar.BUTTON_ARROW_RIGHT, 'Right panel');
 *  bar.addButton('attach', ToolBar.BUTTON_ATTACH);
 *  bar.on('itemselect', (bar, id) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.ToolBar
 */
declare class ToolBar extends View<ToolBarEvents> implements TapDelegate {
    #private;
    static DEFAULT_STYLE: string;
    static BLACK_TRANSLUCIDE_STYLE: string;
    static BLUE_STYLE: string;
    static Text: typeof ToolBarText;
    static Button: typeof ToolBarButton;
    /** added to the bottom bar of a ScrollView */
    static scrollViewHole: string;
    protected htmlTemplate: string;
    protected initComponent(): void;
    protected destructor(): void;
    /*****************************************************************
     *  Items
     ****************************************************************/
    /**
     *  Creates and adds a button: its id, its icon name (ToolBar.BUTTON_ADD…)
     *  and its label. Returns undefined if an item has the id.
     */
    addButton(id: string, name: string, label?: string): ToolBarButton | undefined;
    /**
     *  Adds an item (a ToolBarButton, a ToolBarText or any view)
     */
    addItem(item: View<any>): void;
    /**
     *  Removes the item (a button created by addButton is destroyed)
     */
    removeItem(id: string): void;
    /**
     *  Returns the item of the id
     */
    getItem(id: string): View<any> | undefined;
    remove(child: ViewChild): void;
    didTouch(_target: unknown, _element: HTMLElement, event: PointerEvent): void;
    didUntouch(): void;
    didTap(): void;
    /*****************************************************************
     *  Properties
     ****************************************************************/
    /**
     * The style: a class name (ToolBar.DEFAULT_STYLE…)
     */
    set style(v: string);
    get style(): string;
    /**
     * The buttons: [id, name, label] (the former buttons are removed)
     */
    set configuration(v: ToolBarButtonSpec[]);
    get configuration(): ToolBarButtonSpec[];
    /**
     * True (default) for toggle buttons (the selected item keeps the
     * 'select' class name), false for momentary buttons
     */
    set isToggleButtons(v: boolean);
    get isToggleButtons(): boolean;
    /**
     * The id of the selected item
     */
    set selectedId(v: string | null);
    get selectedId(): string | null;
    /*****************************************************************
     *  The button icons (class names of the themes)
     ****************************************************************/
    static BUTTON_ADD: string;
    static BUTTON_ARROW_DOWN: string;
    static BUTTON_ARROW_LEFT: string;
    static BUTTON_ARROW_RIGHT: string;
    static BUTTON_ARROW_UP: string;
    static BUTTON_ATTACH: string;
    static BUTTON_AUCTION: string;
    static BUTTON_BELL_OFF: string;
    static BUTTON_BELL: string;
    static BUTTON_BLOG: string;
    static BUTTON_BOOK_MARKED: string;
    static BUTTON_BOOK: string;
    static BUTTON_BOOKMARK_ADD: string;
    static BUTTON_BOOKMARK: string;
    static BUTTON_BOX_FULL: string;
    static BUTTON_BOX_MAIL: string;
    static BUTTON_BOX: string;
    static BUTTON_BRIGHTNESS: string;
    static BUTTON_BRUSH: string;
    static BUTTON_BULB_OFF: string;
    static BUTTON_BULB_ON: string;
    static BUTTON_BUZZER: string;
    static BUTTON_CALCULATOR: string;
    static BUTTON_CALENDAR: string;
    static BUTTON_CALL: string;
    static BUTTON_CANCEL: string;
    static BUTTON_CASE: string;
    static BUTTON_CHECKMARK: string;
    static BUTTON_CIRCLE_ARROW_LEFT: string;
    static BUTTON_CIRCLE_ARROW_RIGHT: string;
    static BUTTON_COMMAND_LINE: string;
    static BUTTON_COMMENT_ADD: string;
    static BUTTON_COMMENT_DELETE: string;
    static BUTTON_COMMENT_OK: string;
    static BUTTON_COMPUTER_OFF: string;
    static BUTTON_COMPUTER_ON: string;
    static BUTTON_CONTRAST: string;
    static BUTTON_CONTROL_1: string;
    static BUTTON_CONTROL_2: string;
    static BUTTON_CONTROL_3: string;
    static BUTTON_CONTROL_4: string;
    static BUTTON_CONTROL_5: string;
    static BUTTON_CONTROL_6: string;
    static BUTTON_CONTROL_7: string;
    static BUTTON_CONTROL_8: string;
    static BUTTON_COPY: string;
    static BUTTON_COURT: string;
    static BUTTON_CREDIT_CARD: string;
    static BUTTON_CUT: string;
    static BUTTON_DANGER: string;
    static BUTTON_DELETE: string;
    static BUTTON_DISK: string;
    static BUTTON_DOCUMENT_BLANK: string;
    static BUTTON_DOCUMENT: string;
    static BUTTON_DOLLAR: string;
    static BUTTON_DOWNLOAD: string;
    static BUTTON_ERROR: string;
    static BUTTON_FAVORITIES_ADD: string;
    static BUTTON_FAVORITIES_REMOVE: string;
    static BUTTON_FAVORITIES: string;
    static BUTTON_FILM: string;
    static BUTTON_FILMING: string;
    static BUTTON_FIRST_AID: string;
    static BUTTON_FLAG_BIS: string;
    static BUTTON_FLAG: string;
    static BUTTON_FLASH_ARROW: string;
    static BUTTON_FLASH: string;
    static BUTTON_FOLDER_BOOKMARK: string;
    static BUTTON_FOLDER_GOTO: string;
    static BUTTON_FOLDER: string;
    static BUTTON_FONT_CAPITAL: string;
    static BUTTON_FONT_ITALIC: string;
    static BUTTON_FONT_REGULAR: string;
    static BUTTON_FONT_UNDERLINE: string;
    static BUTTON_FONT: string;
    static BUTTON_FONTS: string;
    static BUTTON_FORUM: string;
    static BUTTON_FRAME: string;
    static BUTTON_GRAPH_AREAS: string;
    static BUTTON_GRAPH_BARS_DOWN: string;
    static BUTTON_GRAPH_BARS_UP: string;
    static BUTTON_GRAPH_BARS: string;
    static BUTTON_GRAPH_DOWN: string;
    static BUTTON_GRAPH_LINES: string;
    static BUTTON_GRAPH_UP: string;
    static BUTTON_HAT: string;
    static BUTTON_HELP: string;
    static BUTTON_HOME: string;
    static BUTTON_INFORMATION: string;
    static BUTTON_KEY: string;
    static BUTTON_KEYBOARD: string;
    static BUTTON_LAPTOP: string;
    static BUTTON_LINK: string;
    static BUTTON_LIST_BULLETS: string;
    static BUTTON_LIST_NUMBERS: string;
    static BUTTON_LOCK: string;
    static BUTTON_MAGNIFY_GLASS: string;
    static BUTTON_MAIL: string;
    static BUTTON_MANAGE: string;
    static BUTTON_MEASURE: string;
    static BUTTON_MEASURES: string;
    static BUTTON_MIC_BIS: string;
    static BUTTON_MIC: string;
    static BUTTON_MINUS: string;
    static BUTTON_MUTE: string;
    static BUTTON_PAINT: string;
    static BUTTON_PAPER_PLANE: string;
    static BUTTON_PAPER_TRASH: string;
    static BUTTON_PAPERCLIO: string;
    static BUTTON_PARAGRAPH: string;
    static BUTTON_PENCIL: string;
    static BUTTON_PHOTO: string;
    static BUTTON_PIECHART: string;
    static BUTTON_POST: string;
    static BUTTON_PROFILE: string;
    static BUTTON_REFRESH: string;
    static BUTTON_RESIZE: string;
    static BUTTON_RSS: string;
    static BUTTON_SAD_FACE: string;
    static BUTTON_SAFE: string;
    static BUTTON_SAVE: string;
    static BUTTON_SETTINGS: string;
    static BUTTON_SHOPPING_BAG: string;
    static BUTTON_SHOPPING_CART: string;
    static BUTTON_SHOPPING_HEAVY: string;
    static BUTTON_SIM: string;
    static BUTTON_SMILE_FACE: string;
    static BUTTON_SORT_AZ: string;
    static BUTTON_SORT_ZA: string;
    static BUTTON_STAR: string;
    static BUTTON_STORAGE: string;
    static BUTTON_SWITCH: string;
    static BUTTON_TAG_ADD: string;
    static BUTTON_TAG_CANCEL: string;
    static BUTTON_TAG_DELETE: string;
    static BUTTON_TAG: string;
    static BUTTON_TEXT_ALIGN_CENTER: string;
    static BUTTON_TEXT_ALIGN_JUSTIFY: string;
    static BUTTON_TEXT_ALIGN_LEFT: string;
    static BUTTON_TEXT_ALIGN_RIGHT: string;
    static BUTTON_TIME: string;
    static BUTTON_TIMER: string;
    static BUTTON_TRASH: string;
    static BUTTON_TWG: string;
    static BUTTON_UNLOCK: string;
    static BUTTON_UPLOAD: string;
    static BUTTON_USER: string;
    static BUTTON_USERS: string;
    static BUTTON_VOLUME_DOWN: string;
    static BUTTON_VOLUME_UP: string;
    static BUTTON_VOLUME: string;
    static BUTTON_WALLET: string;
    static BUTTON_WARNING: string;
    static BUTTON_WIFI: string;
    static BUTTON_WINDOW_ERROR: string;
    static BUTTON_WINDOW_GLOBE: string;
    static BUTTON_WINDOW_LOCK: string;
    static BUTTON_WINDOW: string;
    static BUTTON_ZOOM_IN: string;
    static BUTTON_ZOOM_OUT: string;
}

/**
 * The events of an Application
 */
type ApplicationEvents = {
    /** the orientation of the window changed (0: portrait, 90 or -90: landscape) */
    orientationchange: [orientation: number];
    /** a script loaded by loadScript is loaded */
    scriptloaded: [path: string];
    /** a style sheet loaded by loadCSS is loaded */
    cssloaded: [path: string];
};
/**
 *  @class
 *  The root view of an application: by default the body of the page (an
 *  html node is replaced by its body).
 *  <p>
 *  It notifies the orientation changes of the window: the 'orientationchange'
 *  event, and the orientationWillChange / orientationDidChange methods of
 *  the application and of its views (SplitView…). It loads scripts and style
 *  sheets.
 *  <p>
 *  Application.start() starts the applications: applicationStarted is
 *  called once.
 *
 *  @example
 *  class MyApplication extends Application {
 *    override applicationStarted() { … }
 *  }
 *  const app = new MyApplication({ id: 'app' });
 *  app.init();
 *  Application.start();
 *
 * @extends vs.ui.View
 * @name vs.ui.Application
 */
declare class Application<Events extends ModelEvents = {}> extends View<ApplicationEvents & Events> {
    #private;
    constructor(options?: ViewOptions);
    protected initComponent(): void;
    protected destructor(): void;
    /**
     *  Called once, when the applications start (see Application.start)
     */
    applicationStarted(): void;
    /**
     *  Called before the views follow the new orientation
     */
    orientationWillChange(_orientation: number): void;
    /**
     *  Called once the views follow the new orientation
     */
    orientationDidChange(_orientation: number): void;
    /**
     * The current orientation (0: portrait, 90 or -90: landscape)
     */
    get orientation(): number;
    /**
     * The position and size of an application are in px
     */
    protected didUpdateSizeAndPosition(): void;
    /*****************************************************************
     *  Loading
     ****************************************************************/
    /**
     *  Loads a script; the 'scriptloaded' event is emitted once loaded
     */
    loadScript(path: string): Promise<void>;
    /**
     *  Loads a style sheet; the 'cssloaded' event is emitted once loaded
     */
    loadCSS(path: string): Promise<void>;
    /*****************************************************************
     *  Applications
     ****************************************************************/
    /**
     *  Returns the initialized applications
     */
    static getApplications(): Application<any>[];
    /**
     *  Starts the applications: applicationStarted is called, then they are
     *  refreshed
     */
    static start(): void;
    /**
     *  Destroys the applications
     */
    static stop(): void;
    /**
     *  Closes the window
     */
    static exit(): void;
    /**
     *  Returns the orientation of the window (0: portrait, 90 or -90:
     *  landscape)
     */
    static getOrientation(): number;
    /**
     *  Preloads images (in the browser cache)
     */
    static preloadImages(paths: string[]): void;
}

export { ANIMATION_DELAY, ANIMATION_DURATION, ANIMATION_END, ANIMATION_FILL_MODE, ANIMATION_NAME, ANIMATION_TIMING_FUNC, AbstractList, AbstractListItem, Animation, Application, BLANK_IMAGE, Button, CSS_ANDROID, CSS_BLACKBERRY, CSS_DEFAULT, CSS_FLAT, CSS_HOLO, CSS_IOS, CSS_IOS7, CSS_MEEGO, CSS_PURE, CSS_SYMBIAN, CSS_WP7, Canvas, CheckBox, ComboBox, DefaultListItem, DragRecognizer, GestureRecognizer, ITERATION_COUNT, ImageView, InputField, KEY_FRAMES, List, MOVE_THRESHOLD, MULTI_TAP_DELAY, NavigationBar, OpacityAnimation, Picker, PinchRecognizer, PointerRecognizer, PopOver, ProgressBar, RadioButton, RotateAnimation, RotateXYZAnimation, RotationRecognizer, SVGView, ScaleAnimation, ScrollImageView, ScrollView, SegmentedButton, SimpleListItem, SkewAnimation, Slider, SplitView, Switch, TRANSFORM, TRANSFORM_ORIGIN, TRANSITION_DELAY, TRANSITION_DURATION, TRANSITION_END, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNC, TapRecognizer, Template, TextArea, TextLabel, ToolBar, ToolBarButton, ToolBarText, TranslateAnimation, View, getDeviceCSSCode, toText };
export type { AnimationOptions, AnimationProperty, AnimationTarget, ApplicationEvents, ButtonEvents, CheckBoxEvents, ComboBoxEvents, DragDelegate, InputFieldType, KeyFrameValues, ListEvents, ListFilter, ListItemTemplate, PickerDelegate, PickerEvents, PickerSelection, PickerSlot, PickerValues, PinchDelegate, RadioButtonEvents, RecognizerTarget, RotationDelegate, ScrollImageViewEvents, SegmentedButtonEvents, SliderEvents, SplitViewDelegate, SwitchEvents, TapDelegate, TextInputEvents, ToolBarButtonSpec, ToolBarEvents, ViewChild, ViewClass, ViewOptions };
