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
import {
  addCssRule as addCssRuleTo, addCssRules as addCssRulesTo, getElementAbsolutePosition,
  setElementStyle, setElementTransform, setElementVisibility,
} from 'vs_ui_utils';
import { Component, Model, InOut, In, type ModelEvents } from 'vs_toolkit/vs_core';

import { Animation, type AnimationOptions } from '../Animation';
import { MOVE_THRESHOLD, type PointerRecognizer } from '../Recognizers/PointerRecognizer';
import Template from '../Template';
import html_template from './View.html';

/**
 * The options of a view: how to get its DOM node, and the initial values of
 * its model properties (assigned once initialized, see init)
 */
export interface ViewOptions {
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

/** the options which are not model properties */
const NODE_OPTIONS = new Set(['id', 'node', 'nodeId', 'nodeRef', 'rootRef', 'templateRef', 'template']);

export type ViewClass = new (options?: ViewOptions) => View<any>;

/** something which can be a child of a view: a view, or a non graphical component */
export type ViewChild = Component;

/** the node of a child, if it is graphical */
function nodeOfChild(child: ViewChild): HTMLElement | undefined {
  return (child as unknown as { view?: HTMLElement | null }).view ?? undefined;
}

/** the pointer events a view can bind (see bind) */
const POINTER_EVENT_TYPES = new Set(['pointerdown', 'pointermove', 'pointerup', 'pointercancel']);

/** the view (component) of each view node */
const componentOfNode = new WeakMap<Element, View<any>>();

/** the templates of the application (.application_templates), once found */
let applicationTemplates: Element | null | undefined;

/** cache of the component templates loaded by createAndAddComponent */
const loadedTemplates = new Map<string, string>();

function later(func: () => void): void {
  setTimeout(func, 0);
}

function findNodeRef(node: Element | null, ref: string): Element | undefined {
  if (!node?.getAttribute) return undefined;
  if (node.getAttribute('x-hag-ref') === ref || node.getAttribute('x-hag-comp') === ref) return node;

  for (let child = node.firstElementChild; child; child = child.nextElementSibling) {
    const result = findNodeRef(child, ref);
    if (result) return result;
  }
  return undefined;
}

function copyAnimationOptions(animation: Animation, options?: AnimationOptions): void {
  if (!options) return;
  animation.setOptions(options);
}

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
export class View<Events extends ModelEvents = {}> extends Model<Events> {
  /********************************************************************
                    Constants
  *********************************************************************/

  static DEFAULT_LAYOUT: string | null = null;
  static HORIZONTAL_LAYOUT = 'horizontal';
  static LEGACY_HORIZONTAL_LAYOUT = 'horizontal_layout';
  static VERTICAL_LAYOUT = 'vertical';
  static LEGACY_VERTICAL_LAYOUT = 'vertical_layout';
  static ABSOLUTE_LAYOUT = 'absolute';
  static LEGACY_ABSOLUTE_LAYOUT = 'absolute_layout';
  static FLOW_LAYOUT = 'flow';
  static LEGACY_FLOW_LAYOUT = 'flow_layout';

  /** threshold, in px, of a pointer move unselecting an item */
  static MOVE_THRESHOLD = MOVE_THRESHOLD;

  static MAGNET_NONE = 0;
  static MAGNET_TOP = 1;
  static MAGNET_BOTTOM = 2;
  static MAGNET_LEFT = 3;
  static MAGNET_RIGHT = 4;
  static MAGNET_CENTER = 5;

  /** the hole of the non graphical children */
  static NON_G_OBJECT = '_non_g_object';
  /** the default hole */
  static ANY_PLACE = 'children';

  static readonly #registry = new Map<string, ViewClass>();

  /**
   *  Registers a component class, for createAndAddComponent
   */
  static registerComponent(name: string, Class: ViewClass): void {
    View.#registry.set(name, Class);
  }

  /**
   *  The view (component) of a view node
   */
  static componentOf(node: Element | null | undefined): View<any> | undefined {
    return node ? componentOfNode.get(node) : undefined;
  }

  /********************************************************************
                    Fields
  *********************************************************************/

  /** the DOM node of the view, once initialized */
  view: HTMLElement | null = null;

  /** the HTML template of the view, used without node in the options */
  protected htmlTemplate: string = html_template;

  readonly #options: ViewOptions;

  #pos = [-1, -1];
  #size = [-1, -1];
  #autosizing = [4, 4];
  #magnet = View.MAGNET_NONE;
  #layout: string | null = null;

  #translation = [0, 0, 0];
  #rotation = [0, 0, 0];
  #transformOrigin = [0, 0];
  #scaling = 1;
  #minScale = 0.5;
  #maxScale = 3;
  #transformsStack: DOMMatrix | undefined;

  #visible = true;
  #enable = true;
  #opacity = 1;
  #bubbling = false;

  #showAnimation: Animation | undefined;
  #showCallback: Function | undefined;
  #hideAnimation: Animation | undefined;
  #hideCallback: Function | undefined;
  #isShowing = false;
  #isHiding = false;
  /** set by the visible setter, which notifies the change itself */
  #isSettingVisible = false;
  #viewDisplay: string | undefined;

  #parent: View<any> | undefined;
  readonly #holes = new Map<string, HTMLElement>();
  readonly #children = new Map<string, ViewChild[]>();
  /** the children added during the initialization (see clone) */
  readonly #initChildren = new Set<ViewChild>();
  #isInitializing = false;

  readonly #recognizers: PointerRecognizer<any>[] = [];
  readonly #pointerHandlers = new Map<string, EventListener>();

  constructor(options: ViewOptions = {}) {
    super(options.id);
    this.#options = options;
  }

  /********************************************************************
                    Life cycle
  *********************************************************************/

  /**
   *  Builds the DOM node of the view (see ViewOptions), finds its holes and
   *  attaches its recognizers.
   */
  protected override initComponent(): void {
    super.initComponent();
    this.#isInitializing = true;

    const node = this.#getNode(this.#options);
    if (!node) {
      throw new Error(`vs.ui.View ${this.id}: no view node`);
    }
    this.view = node;
    node.id = this.id;
    node.setAttribute('x-hag-comp', this.id);
    componentOfNode.set(node, this);

    this.#parseHoles(node);
    this.#recognizers.forEach(recognizer => recognizer.attach(this));
  }

  /**
   *  Applies the magnet, then assigns the initial values of the options
   *  (once the subclasses are initialized)
   */
  protected override componentDidInitialize(): void {
    super.componentDidInitialize();
    this.#isInitializing = false;

    if (this.#magnet) {
      this.view?.style.setProperty('position', 'absolute');
    }
    if (this.#magnet === View.MAGNET_CENTER) {
      this.#updateSizeAndPos();
      this.#applyTransformation();
    }

    const values: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.#options)) {
      if (!NODE_OPTIONS.has(key)) values[key] = value;
    }
    this.assign(values);
  }

  protected override destructor(): void {
    this.#parent?.remove(this);

    for (const children of this.#children.values()) {
      for (const child of children) {
        if (child instanceof View && child.#parent === this) child.#parent = undefined;
        child.destroy();
      }
    }
    this.#children.clear();
    this.#recognizers.forEach(recognizer => recognizer.detach());
    this.#recognizers.length = 0;

    if (this.view) {
      for (const [key, handler] of this.#pointerHandlers) {
        this.view.removeEventListener(key.slice(key.lastIndexOf(':') + 1), handler);
      }
      componentOfNode.delete(this.view);
    }
    this.#pointerHandlers.clear();
    this.view = null;
    this.clearTransformStack();

    super.destructor();
  }

  /**
   *  Updates the size and position from the DOM, and refreshes the children
   */
  refresh(): void {
    const view = this.view;
    if (view?.parentElement) {
      this.#size[0] = view.offsetWidth;
      this.#size[1] = view.offsetHeight;
      this.#pos[0] = view.offsetLeft;
      this.#pos[1] = view.offsetTop;
    }
    for (const children of this.#children.values()) {
      for (const child of children) {
        (child as unknown as { refresh?(): void }).refresh?.();
      }
    }
  }

  /**
   *  Notifies that the view node was added to the DOM. Override it to
   *  perform tasks when the view is presented; call the parent method.
   */
  viewDidAdd(): void {
    const view = this.view;
    if (!view?.parentElement) return;

    // the real size and position, once laid out
    later(() => {
      this.#size[0] = view.offsetWidth;
      this.#size[1] = view.offsetHeight;
      this.#pos[0] = view.offsetLeft;
      this.#pos[1] = view.offsetTop;
    });
  }

  /********************************************************************
                    View node
  *********************************************************************/

  #getNode(options: ViewOptions): HTMLElement | undefined {
    const node = this.#findNode(options);
    if (node) return node;

    if (options.template) {
      const templateNode = Template.parseHTML(options.template);
      if (templateNode) return templateNode;
    }
    if (this.htmlTemplate) {
      const templateNode = Template.parseHTML(this.htmlTemplate);
      if (templateNode) return templateNode;
    }

    console.warn(`Impossible to instance view of component '${this.constructor.name}', id [${this.id}]. A default one is created`);
    return document.createElement('div');
  }

  /**
   * An existing node: options.node, nodeId, nodeRef, templateRef, or the
   * DOM node with the component id
   */
  #findNode(options: ViewOptions): HTMLElement | undefined {
    if (options.node) return options.node;

    if (options.nodeId) {
      const node = document.getElementById(options.nodeId);
      if (node) return node;
    }

    if (options.nodeRef) {
      let ref: string = options.nodeRef;
      let rootId = options.rootRef;
      const match = /(\w+)#(\w+)/.exec(ref);
      if (match) {
        [, rootId, ref] = match;
      }
      if (rootId) {
        const root = (Component.instances.get(rootId) as View<any> | undefined)?.view ?? document.getElementById(rootId);
        const node = findNodeRef(root, ref);
        if (node) return node as HTMLElement;
      }
    }

    if (options.templateRef) {
      const node = View.templateNode(options.templateRef);
      if (node) return node;
    }

    if (options.id) {
      const node = document.getElementById(options.id);
      if (node) return node;
    }

    return undefined;
  }

  /**
   *  Returns a copy of a template of the application: the node of class ref
   *  in the .application_templates node (removed from the document once
   *  read)
   */
  static templateNode(ref: string): HTMLElement | undefined {
    if (applicationTemplates === undefined || !applicationTemplates?.isConnected) {
      applicationTemplates = document.querySelector('.application_templates');
      applicationTemplates?.remove();
    }
    const node = applicationTemplates?.querySelector(`.${ref}`);
    return node ? document.importNode(node, true) as HTMLElement : undefined;
  }

  #parseHoles(node: Element): void {
    const hole = node.getAttribute?.('x-hag-hole');
    if (hole) {
      this.#holes.set(hole, node as HTMLElement);
      return; // a hole can not include holes
    }
    for (let child = node.firstElementChild; child; child = child.nextElementSibling) {
      this.#parseHoles(child);
    }
  }

  /**
   *  Returns the node of the view with the x-hag-ref (or x-hag-comp)
   *  attribute ref
   */
  findNodeRef(ref: string): Element | undefined {
    return findNodeRef(this.view, ref);
  }

  /********************************************************************
                    Children
  *********************************************************************/

  /**
   * The parent view, once added (see add)
   */
  get parent(): View<any> | undefined {
    return this.#parent;
  }

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
  createAndAddComponent(name: string, options: ViewOptions = {}, extension?: string): View<any> | undefined {
    const Class = View.#registry.get(name) ?? (globalThis as Record<string, unknown>)[name] as ViewClass | undefined;
    if (!isFunction(Class)) {
      console.error(`Impossible to find component '${name}'.`);
      return undefined;
    }

    const config: ViewOptions = { ...options };
    let node = this.#findNode(config) ?? View.templateNode(name);

    if (!node) {
      const template = (Class as { template?: string }).template ?? (Class.prototype as { template?: string }).template;
      if (template) node = Template.parseHTML(template);
    }

    if (!node) {
      const path = `${name}.xhtml`;
      let data = loadedTemplates.get(path);
      if (data === undefined) {
        const request = new XMLHttpRequest();
        request.open('GET', path, false);
        request.send(null);
        // without template file, the component uses its html template
        data = request.status === 200 || request.status === 0 ? request.responseText : '';
        loadedTemplates.set(path, data);
      }
      if (data) node = Template.parseHTML(data);
    }
    if (node) config.node = node;

    let component: View<any>;
    try {
      component = new Class(config);
      component.init();
    } catch (e) {
      console.error(`Impossible to instantiate the component ${name}`, e);
      return undefined;
    }

    this.add(component, extension);
    component.refresh();
    return component;
  }

  /**
   *  Returns true if the component is a child of this view
   */
  isChild(child: ViewChild | null | undefined): boolean {
    if (!child) return false;
    for (const children of this.#children.values()) {
      if (children.includes(child)) return true;
    }
    return false;
  }

  /**
   *  Returns the children of a hole (all the children without hole)
   */
  getChildren(extension?: string): ViewChild[] {
    if (extension) return [...(this.#children.get(extension) ?? [])];
    return [...this.#children.values()].flat();
  }

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
  add(child: ViewChild, extension?: string, view?: HTMLElement): void {
    if (!child || this.isChild(child)) return;

    const node = view ?? nodeOfChild(child);
    const key = !node ? View.NON_G_OBJECT : (extension || View.ANY_PLACE);

    let children = this.#children.get(key);
    if (!children) {
      children = [];
      this.#children.set(key, children);
    }
    children.push(child);
    if (this.#isInitializing) this.#initChildren.add(child);

    const hole = this.#holes.get(key);
    if (!node || !hole) return;

    if (node.parentElement !== hole) {
      node.remove();
      hole.appendChild(node);
    }
    if (child instanceof View) {
      child.#parent = this;
      child.viewDidAdd();
    }
  }

  /**
   *  Removes a child: its node is removed from the DOM
   */
  remove(child: ViewChild): void {
    if (!child) return;

    for (const [key, children] of this.#children) {
      const index = children.indexOf(child);
      if (index === -1) continue;

      children.splice(index, 1);
      if (children.length === 0) this.#children.delete(key);
      this.#initChildren.delete(child);
      nodeOfChild(child)?.remove();
      if (child instanceof View && child.#parent === this) child.#parent = undefined;
      return;
    }
  }

  /**
   *  Removes all the children (of a hole), and destroys them or returns
   *  them
   *
   * @param {Boolean} shouldDestroy destroy the removed children
   * @param {String} extension the hole [optional]
   * @return {Array} the removed children, if not destroyed
   */
  removeAllChildren(shouldDestroy = false, extension?: string): ViewChild[] | undefined {
    const removed = this.getChildren(extension);
    removed.forEach(child => {
      this.remove(child);
      if (shouldDestroy) child.destroy();
    });
    return shouldDestroy ? undefined : removed;
  }

  /**
   *  Returns a new view of the same class: its model properties, show and
   *  hide animations are copied, and its children (except the ones it
   *  created while initializing, created again by the clone) are cloned in
   *  the same holes. The clone is initialized.
   *
   * @param {ViewOptions} options the options of the clone [optional]
   * @return {View} the clone
   */
  clone(options: ViewOptions = {}): this {
    const Class = this.constructor as new (options?: ViewOptions) => this;
    const copy = new Class({ ...this.#nodeOptions(), ...options });
    copy.init();

    const values: Record<string, unknown> = {};
    for (const name of this.modelProperties) {
      if (name in options) continue;
      const descriptor = this.getPropertyDescriptor(name);
      if (!descriptor?.get) continue;
      const value = (this as unknown as Record<string, unknown>)[name];
      if (value !== undefined) values[name] = value;
    }
    copy.assign(values);

    if (this.#showAnimation) copy.setShowAnimation(this.#showAnimation, undefined, this.#showCallback);
    if (this.#hideAnimation) copy.setHideAnimation(this.#hideAnimation, undefined, this.#hideCallback);

    for (const [key, children] of this.#children) {
      for (const child of children) {
        if (this.#initChildren.has(child)) continue;
        if (!(child instanceof View)) continue;
        copy.add(child.clone(), key === View.ANY_PLACE ? undefined : key);
      }
    }
    return copy;
  }

  /** the options giving the node (a template), for a clone */
  #nodeOptions(): ViewOptions {
    const { template } = this.#options;
    return template ? { template } : {};
  }

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
  override bind(spec: string, obj: Component, func: Function | string = 'notify'): void {
    if (!POINTER_EVENT_TYPES.has(spec)) {
      super.bind(spec, obj, func);
      return;
    }
    if (!this.view) return;

    const callback = isFunction(func) ? func : (obj as unknown as Record<string, unknown>)[func];
    if (!isFunction(callback)) {
      throw new Error(`Invalid bind arguments. Unknown func: ${String(func)}`);
    }

    const handler = (event: Event) => {
      callback.call(obj, event);
    };
    const key = `${obj.id}:${spec}`;
    const previous = this.#pointerHandlers.get(key);
    if (previous) this.view.removeEventListener(spec, previous);
    this.#pointerHandlers.set(key, handler);
    this.view.addEventListener(spec, handler);
  }

  /**
   *  Unbinds an event (see bind)
   */
  override unbind(spec: string, obj: Component, func?: Function | string): void {
    if (!POINTER_EVENT_TYPES.has(spec)) {
      super.unbind(spec, obj, func);
      return;
    }
    const key = `${obj.id}:${spec}`;
    const handler = this.#pointerHandlers.get(key);
    if (!handler) return;
    this.view?.removeEventListener(spec, handler);
    this.#pointerHandlers.delete(key);
  }

  /**
   *  Default handler of the bound pointer events (see bind)
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  notify(event: Event): void {}

  /**
   *  Receives the events of the children (see notifyToParent): forwards
   *  them to the parent when bubbling is set
   */
  handleEvent(event: Event): void {
    if (this.#bubbling) this.#parent?.handleEvent(event);
  }

  /**
   *  Gives an event to the parent: to its handleEvent, else to its notify
   */
  notifyToParent(event: Event): void {
    const parent = this.#parent;
    if (!parent) return;
    if (isFunction(parent.handleEvent)) parent.handleEvent(event);
    else if (isFunction((parent as Partial<View<any>>).notify)) parent.notify(event);
  }

  /**
   *  Gets an event's pointer position relatively to the view
   */
  getPointerPosition(event: PointerEvent): { x: number; y: number } {
    const rect = this.view ? getElementAbsolutePosition(this.view) : { x: 0, y: 0 };
    return { x: event.pageX - rect.x, y: event.pageY - rect.y };
  }

  /********************************************************************
                    Pointer recognizers
  *********************************************************************/

  /**
   *  Adds a pointer recognizer (tap, drag, pinch, rotation…); it is attached
   *  to the view node once it exists
   */
  addPointerRecognizer(recognizer: PointerRecognizer<any>): void {
    if (this.#recognizers.includes(recognizer)) return;
    this.#recognizers.push(recognizer);
    if (this.view) recognizer.attach(this);
  }

  /**
   *  Removes a pointer recognizer
   */
  removePointerRecognizer(recognizer: PointerRecognizer<any>): void {
    const index = this.#recognizers.indexOf(recognizer);
    if (index === -1) return;
    this.#recognizers.splice(index, 1);
    recognizer.detach();
  }

  /********************************************************************
                    Layout
  *********************************************************************/

  /**
   * The size of the view [width, height], in px
   */
  @InOut set size(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    this.#size[0] = v[0];
    this.#size[1] = v[1];
    this.#updateSizeAndPos();
  }
  get size(): number[] {
    return this.#size.slice();
  }

  /**
   * The position of the view [x, y], in px
   */
  @InOut set position(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    this.#pos[0] = v[0];
    this.#pos[1] = v[1];
    this.#updateSizeAndPos();
  }
  get position(): number[] {
    return this.#pos.slice();
  }

  /**
   * The size and position behaviors according to the parent size
   * [horizontal, vertical]
   */
  @InOut set autosizing(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    if (this.#autosizing[0] === v[0] && this.#autosizing[1] === v[1]) return;
    this.#autosizing[0] = v[0];
    this.#autosizing[1] = v[1];
    this.#updateSizeAndPos();
  }
  get autosizing(): number[] {
    return this.#autosizing.slice();
  }

  /**
   * The magnet: View.MAGNET_NONE, TOP, BOTTOM, LEFT, RIGHT or CENTER
   */
  @InOut set magnet(code: number) {
    if (this.#magnet === code) return;
    if (!isNumber(code) || code < 0 || code > 5) return;

    this.#magnet = code;
    if (!this.view) return;
    if (code) this.view.style.setProperty('position', 'absolute');
    else this.view.style.removeProperty('position');
    this.#updateSizeAndPos();
    this.#applyTransformation();
  }
  get magnet(): number {
    return this.#magnet;
  }

  /**
   * The layout of the children: View.DEFAULT_LAYOUT, HORIZONTAL_LAYOUT,
   * VERTICAL_LAYOUT, ABSOLUTE_LAYOUT or FLOW_LAYOUT
   */
  @InOut set layout(v: string | null) {
    const layouts = [
      View.HORIZONTAL_LAYOUT, View.DEFAULT_LAYOUT, View.ABSOLUTE_LAYOUT, View.VERTICAL_LAYOUT,
      View.FLOW_LAYOUT, View.LEGACY_HORIZONTAL_LAYOUT, View.LEGACY_ABSOLUTE_LAYOUT,
      View.LEGACY_VERTICAL_LAYOUT, View.LEGACY_FLOW_LAYOUT,
    ];
    if (v && !layouts.includes(v)) {
      console.error(`Unsupported layout '${v}'!`);
      return;
    }
    if (this.#layout) this.removeClassName(this.#layout);
    this.#layout = !v || v.includes('_layout') ? v : `${v}_layout`;
    if (this.#layout) this.addClassName(this.#layout);
  }
  get layout(): string | null {
    return this.#layout;
  }

  /**
   * The CPU costly update of the node style from size, position,
   * autosizing and magnet
   */
  #updateSizeAndPos(): void {
    const view = this.view;
    if (!view) return;

    let x = this.#pos[0], y = this.#pos[1];
    const w = this.#size[0], h = this.#size[1];
    const [aH, aV] = this.#autosizing;
    let width: string, height: string;
    let left = 'auto', top = 'auto', right = 'auto', bottom = 'auto';

    const parent = view.parentElement;
    const pWidth = parent ? parent.offsetWidth : 0;
    const pHeight = parent ? parent.offsetHeight : 0;

    if (this.#magnet === View.MAGNET_LEFT) x = 0;
    if (this.#magnet === View.MAGNET_TOP) y = 0;

    if (w < 0) { width = ''; }
    else if (aH === 5 || aH === 7) { width = 'auto'; }
    else if (aH === 4 || aH === 1) { width = `${w}px`; }
    else if (aH === 2 || aH === 3 || aH === 6 || aH === 0) { width = pWidth ? `${w / pWidth * 100}%` : `${w}px`; }
    else { width = '100%'; }

    if (h < 0) { height = ''; }
    else if (aV === 5 || aV === 7) { height = 'auto'; }
    else if (aV === 4 || aV === 1) { height = `${h}px`; }
    else if (aV === 2 || aV === 3 || aV === 6 || aV === 0) { height = pHeight ? `${h / pHeight * 100}%` : `${h}px`; }
    else { height = '100%'; }

    if (aH === 4 || aH === 5 || aH === 6 || aH === 7 || (aH === 2 && !pWidth)) { left = `${x}px`; }
    else if ((aH === 2 || aH === 0) && pWidth) { left = `${x / pWidth * 100}%`; }

    if (w >= 0 && (aH === 1 || aH === 3 || aH === 5 || aH === 7)) {
      const r = pWidth - (x + w);
      right = r >= 0 ? `${r}px` : '0';
    }

    if (aV === 4 || aV === 5 || aV === 6 || aV === 7 || (aV === 2 && !pHeight)) { top = `${y}px`; }
    else if ((aV === 2 || aV === 0) && pHeight) { top = `${y / pHeight * 100}%`; }

    if (h >= 0 && (aV === 1 || aV === 3 || aV === 5 || aV === 7)) {
      const b = pHeight - (y + h);
      bottom = b >= 0 ? `${b}px` : '0';
    }

    if (this.#magnet === View.MAGNET_BOTTOM) { top = 'auto'; bottom = '0px'; }
    if (this.#magnet === View.MAGNET_RIGHT) { left = 'auto'; right = '0px'; }
    if (this.#magnet === View.MAGNET_CENTER) {
      top = '50%'; bottom = 'auto';
      left = '50%'; right = 'auto';
    }

    Object.assign(view.style, { left, right, top, bottom, width, height });
  }

  /********************************************************************
                    CSS
  *********************************************************************/

  /**
   *  Returns the inline value of a CSS property (undefined for 'auto'); a
   *  number for the opacity (1 by default)
   */
  getStyle(property: string): string | number | undefined {
    if (!this.view) return undefined;
    const value = this.view.style.getPropertyValue(property);
    if (property === 'opacity') return value ? parseFloat(value) : 1;
    return value === 'auto' ? undefined : value;
  }

  /**
   *  Returns the computed value of a CSS property (undefined for 'auto'); a
   *  number for the opacity
   */
  getComputedStyle(property: string): string | number | undefined {
    if (!this.view) return undefined;
    const view = this.view.ownerDocument?.defaultView ?? window;
    const value = view.getComputedStyle(this.view).getPropertyValue(property);
    if (property === 'opacity') return value ? parseFloat(value) : 1;
    return value === 'auto' ? undefined : value;
  }

  /**
   *  Sets an inline CSS property; undefined removes it
   */
  setStyle(property: string, value?: string | number): void {
    if (!property || !this.view) return;
    if (value === undefined) this.view.style.removeProperty(property);
    else this.view.style.setProperty(property, String(value));
  }

  /**
   *  Sets inline CSS properties (camelized names)
   */
  setStyles(style: Record<string, number | string | null | undefined>): void {
    if (!style || !this.view) return;
    setElementStyle(this.view, style);
  }

  /**
   *  Adds CSS rules for the elements of this view:
   *  addCssRules('.name', ['color: red']) <=> '#<id> .name { color: red }'
   */
  addCssRules(selector: string, rules: string[]): void {
    addCssRulesTo(`#${this.id} ${selector}`, rules);
  }

  /**
   *  Adds a CSS rule for the elements of this view (see addCssRules)
   */
  addCssRule(selector: string, rule: string): void {
    addCssRuleTo(`#${this.id} ${selector}`, rule);
  }

  hasClassName(className: string): boolean {
    return this.view?.classList.contains(className) ?? false;
  }

  addClassName(...classNames: string[]): void {
    this.view?.classList.add(...classNames);
  }

  removeClassName(...classNames: string[]): void {
    this.view?.classList.remove(...classNames);
  }

  toggleClassName(className: string): void {
    this.view?.classList.toggle(className);
  }

  /**
   *  Sets the CSS visibility of the view node (see also show and hide)
   */
  setVisible(visibility: boolean): void {
    if (this.view) setElementVisibility(this.view, visibility);
  }

  /**
   *  Forces the browser to render the view again, then calls clb
   */
  redraw(clb?: Function): void {
    if (!this.view) return;
    const node = this.view;
    const display = node.style.display;

    node.style.display = 'none';
    later(() => {
      if (display) node.style.display = display;
      else node.style.removeProperty('display');
      later(() => {
        this.refresh();
        if (isFunction(clb)) clb.call(this);
      });
    });
  }

  /**
   * The HTML content of the view node
   */
  @In set innerHTML(v: string) {
    if (this.view) this.view.innerHTML = v;
  }

  /********************************************************************
                    Visibility
  *********************************************************************/

  /**
   * Shows (true) or hides (false) the view, see show and hide
   */
  @InOut set visible(v: boolean) {
    this.#isSettingVisible = true;
    try {
      if (v) this.show();
      else this.hide();
    } finally {
      this.#isSettingVisible = false;
    }
  }
  get visible(): boolean {
    return this.#visible;
  }

  /**
   *  Displays the view, with its show animation; clb is called at the end
   */
  show(clb?: Function): void {
    if (!this.view || this.#visible) return;
    if (!isFunction(clb)) clb = undefined;

    if (this.#viewDisplay) this.view.style.display = this.#viewDisplay;
    else this.view.style.removeProperty('display');
    this.#viewDisplay = undefined;

    this.#isHiding = false;
    this.#isShowing = true;

    if (this.#hideAnimation && this.#hideAnimation.state !== 0) this.#hideAnimation.stop();
    if (this.#showAnimation) {
      const animation = this.#showAnimation;
      if (animation.state !== 0) animation.stop();
      animation.start(this).then(result => {
        if (result === 'ended') this.#showObject(clb);
      });
    } else {
      this.#showObject(clb);
    }
  }

  #showObject(clb?: Function): void {
    if (!this.view || !this.#isShowing) return;
    this.#isShowing = false;
    this.#visible = true;
    // the visibility changes now (at the end of the show animation)
    if (!this.#isSettingVisible) this.propertyChange('visible');

    for (const callback of [this.#showCallback, clb]) {
      if (!callback) continue;
      if (this.#showAnimation) callback.call(this);
      else later(() => callback.call(this));
    }
  }

  /**
   *  Hides the view, with its hide animation; clb is called at the end
   */
  hide(clb?: Function): void {
    if (!this.view) return;
    if (!this.#visible && !this.#isShowing) return;
    if (!isFunction(clb)) clb = undefined;

    this.#visible = false;
    this.#isShowing = false;
    this.#isHiding = true;
    // the visibility changes now (before the hide animation)
    if (!this.#isSettingVisible) this.propertyChange('visible');

    if (this.#showAnimation && this.#showAnimation.state !== 0) this.#showAnimation.stop();
    if (this.#hideAnimation) {
      const animation = this.#hideAnimation;
      if (animation.state !== 0) animation.stop();
      animation.start(this).then(result => {
        if (result === 'ended') this.#hideObject(clb);
      });
    } else {
      this.#hideObject(clb);
    }
  }

  #hideObject(clb?: Function): void {
    if (!this.view || this.#visible || !this.#isHiding) return;
    this.#isHiding = false;

    const display = this.view.style.display;
    this.#viewDisplay = display && display !== 'none' ? display : undefined;
    this.view.style.display = 'none';

    for (const callback of [this.#hideCallback, clb]) {
      if (!callback) continue;
      if (this.#hideAnimation) callback.call(this);
      else later(() => callback.call(this));
    }
  }

  /**
   *  Sets the animation used to show the view: an Animation (cloned), or
   *  [property, value] pairs; null removes it.
   *
   *  @example
   *  view.setShowAnimation([['translate', '0,0,0'], ['opacity', '1']]);
   *  view.setShowAnimation(Animation.FadeIn, { duration: '1s' });
   */
  setShowAnimation(animations?: [string, string][] | Animation | null, options?: AnimationOptions, clb?: Function): void {
    this.#showAnimation = this.#makeAnimation(animations, options, 'setShowAnimation') ?? undefined;
    this.#showCallback = isFunction(clb) ? clb : undefined;
  }

  /**
   *  Sets the animation used to hide the view (see setShowAnimation)
   */
  setHideAnimation(animations?: [string, string][] | Animation | null, options?: AnimationOptions, clb?: Function): void {
    this.#hideAnimation = this.#makeAnimation(animations, options, 'setHideAnimation') ?? undefined;
    this.#hideCallback = isFunction(clb) ? clb : undefined;
  }

  /**
   * The show animation (see setShowAnimation)
   */
  @InOut set showAnimation(v: Animation | [string, string][] | null | undefined) {
    this.setShowAnimation(v);
  }
  get showAnimation(): Animation | undefined {
    return this.#showAnimation;
  }

  /**
   * The hide animation (see setHideAnimation)
   */
  @InOut set hideAnimation(v: Animation | [string, string][] | null | undefined) {
    this.setHideAnimation(v);
  }
  get hideAnimation(): Animation | undefined {
    return this.#hideAnimation;
  }

  #makeAnimation(animations: [string, string][] | Animation | null | undefined,
    options: AnimationOptions | undefined, method: string): Animation | null {
    if (animations === undefined || animations === null) return null;

    let animation: Animation;
    if (animations instanceof Animation) {
      animation = animations.clone();
    } else if (isArray(animations)) {
      animation = new Animation(animations);
    } else {
      console.warn(`vs.ui.View.${method} invalid parameters!`);
      return null;
    }
    copyAnimationOptions(animation, options);
    return animation;
  }

  /**
   *  Animates the view, with an Animation or [property, value] pairs.
   *
   *  @example
   *  await view.animate([['translate', '100px,0,0'], ['opacity', '0']]);
   *
   * @return {Promise} the result of the animation ('ended' or 'stopped')
   */
  animate(animations: [string, string][] | Animation, options?: AnimationOptions, clb?: Function): Promise<'ended' | 'stopped'> | undefined {
    let animation: Animation;
    if (animations instanceof Animation) {
      animation = animations;
    } else if (isArray(animations)) {
      animation = new Animation(animations);
    } else {
      console.warn('vs.ui.View.animate invalid parameters!');
      return undefined;
    }
    copyAnimationOptions(animation, options);

    const run = animation.start(this);
    if (isFunction(clb)) {
      run.then(result => { if (result === 'ended') clb.call(this); });
    }
    return run;
  }

  /********************************************************************
                    State
  *********************************************************************/

  /**
   * Activates or deactivates the view (the 'disabled' class name; the
   * recognizers ignore a disabled view)
   */
  @InOut set enable(v: boolean) {
    if (v && !this.#enable) {
      this.#enable = true;
      this.removeClassName('disabled');
      this.didEnable();
    } else if (!v && this.#enable) {
      this.#enable = false;
      this.addClassName('disabled');
      this.didEnable();
    }
  }
  get enable(): boolean {
    return this.#enable;
  }

  /**
   *  Called when the view is enabled or disabled
   */
  // eslint-disable-next-line class-methods-use-this
  protected didEnable(): void {}

  /**
   * The opacity, in [0, 1]
   */
  @InOut set opacity(v: number) {
    if (!isNumber(v) || v < 0 || v > 1) return;
    if (this.view) this.view.style.opacity = String(v);
    this.#opacity = v;
  }
  get opacity(): number {
    return this.#opacity;
  }

  /**
   * Forwards the events to the parent (see handleEvent), false by default
   */
  @InOut set bubbling(v: boolean) {
    this.#bubbling = !!v;
  }
  get bubbling(): boolean {
    return this.#bubbling;
  }

  /********************************************************************
                    Transformations
  *********************************************************************/

  /**
   *  Moves the view by (x, y, z) px
   */
  translate(x: number, y: number, z = 0): void {
    if (!isNumber(x) || !isNumber(y)) return;
    if (!isNumber(z)) z = 0;
    this.#translation = [x, y, z];
    this.#applyTransformation();
  }

  /**
   *  Rotates the view, in degrees: around the z axis, or around the x, y
   *  and z axes
   */
  rotate(r: number | number[]): void {
    if (isNumber(r)) {
      this.#rotation = [0, 0, r];
    } else if (isArray(r)) {
      this.#rotation = [0, 1, 2].map(i => isNumber(r[i]) ? r[i] : 0);
    }
    this.#applyTransformation();
  }

  /**
   *  Scales the view, within [minScale, maxScale]
   */
  scale(s: number): void {
    if (!isNumber(s)) return;
    s = Math.min(Math.max(s, this.#minScale), this.#maxScale);
    if (this.#scaling === s) return;
    this.#scaling = s;
    this.#applyTransformation();
  }

  /**
   *  Starts a new transformation space, with a new origin: the current
   *  transformation goes into the transformation stack
   */
  setNewTransformOrigin(origin: { x: number; y: number }): void {
    if (!origin || !isNumber(origin.x) || !isNumber(origin.y)) return;
    this.flushTransformStack();
    this.#transformOrigin = [origin.x, origin.y];
  }

  /**
   *  Moves the current transformation into the transformation stack
   */
  flushTransformStack(): void {
    const [ox, oy] = this.#transformOrigin;
    const matrix = new DOMMatrix()
      .translate(ox, oy, 0)
      .translate(this.#translation[0], this.#translation[1], this.#translation[2])
      .rotate(this.#rotation[0], this.#rotation[1], this.#rotation[2])
      .scale(this.#scaling, this.#scaling, 1)
      .translate(-ox, -oy, 0);

    this.#transformsStack = this.#transformsStack ? matrix.multiply(this.#transformsStack) : matrix;

    this.#translation = [0, 0, 0];
    this.#rotation = [0, 0, 0];
    this.#scaling = 1;
    this.#transformOrigin = [0, 0];
  }

  /**
   *  Adds a matrix to the transformation stack
   */
  pushNewTransform(matrix: DOMMatrix): void {
    if (!matrix) return;
    this.#transformsStack = this.#transformsStack ? matrix.multiply(this.#transformsStack) : matrix;
  }

  /**
   *  Removes the previous transformations (the transformation stack)
   */
  clearTransformStack(): void {
    this.#transformsStack = undefined;
  }

  /**
   *  The current transformation matrix of the view
   */
  getCTM(): DOMMatrix {
    const [ox, oy] = this.#transformOrigin;
    const matrix = new DOMMatrix()
      .translate(ox + this.#translation[0], oy + this.#translation[1], this.#translation[2])
      .multiply(new DOMMatrix().rotate(this.#rotation[0], this.#rotation[1], this.#rotation[2]))
      .scale(this.#scaling, this.#scaling, 1)
      .translate(-ox, -oy, 0);

    return this.#transformsStack ? matrix.multiply(this.#transformsStack) : matrix;
  }

  /**
   *  The combined transformation matrix of the parents (identity without
   *  parent)
   */
  getParentCTM(): DOMMatrix {
    const parent = this.#parent;
    return parent ? parent.getParentCTM().multiply(parent.getCTM()) : new DOMMatrix();
  }

  #applyTransformation(): void {
    if (!this.view) return;
    let transform = this.getCTM().toString();
    if (this.#magnet === View.MAGNET_CENTER) transform += ' translate(-50%,-50%)';
    setElementTransform(this.view, transform);
  }

  /**
   * The translation [tx, ty, tz] (see translate)
   */
  @InOut set translation(v: number[]) {
    if (!isArray(v)) return;
    this.translate(v[0], v[1], v[2]);
  }
  get translation(): number[] {
    return this.#translation.slice();
  }

  /**
   * The rotation, in degrees (see rotate)
   */
  @InOut set rotation(v: number | number[]) {
    this.rotate(v);
  }
  get rotation(): number[] {
    return this.#rotation.slice();
  }

  /**
   * The scale (see scale)
   */
  @InOut set scaling(v: number) {
    this.scale(v);
  }
  get scaling(): number {
    return this.#scaling;
  }

  /**
   * The minimum scale (0.5 by default)
   */
  @InOut set minScale(v: number) {
    if (!isNumber(v)) return;
    this.#minScale = v;
    if (this.#scaling < v) this.scale(v);
  }
  get minScale(): number {
    return this.#minScale;
  }

  /**
   * The maximum scale (3 by default)
   */
  @InOut set maxScale(v: number) {
    if (!isNumber(v)) return;
    this.#maxScale = v;
    if (this.#scaling > v) this.scale(v);
  }
  get maxScale(): number {
    return this.#maxScale;
  }

  /**
   * The origin of the transformations [x, y], in px
   */
  @InOut set transformOrigin(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    this.#transformOrigin = [v[0], v[1]];
  }
  get transformOrigin(): number[] {
    return this.#transformOrigin.slice();
  }
}

export default View;
