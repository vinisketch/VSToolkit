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


import { type ModelEvents } from 'vs_toolkit/vs_core';

import { View, type ViewChild, type ViewOptions } from '../View/View';

/**
 * The events of an Application
 */
export type ApplicationEvents = {
  /** the orientation of the window changed (0: portrait, 90 or -90: landscape) */
  orientationchange: [orientation: number];
  /** a script loaded by loadScript is loaded */
  scriptloaded: [path: string];
  /** a style sheet loaded by loadCSS is loaded */
  cssloaded: [path: string];
};

/** the views which follow the orientation (SplitView…) */
interface OrientationObserver {
  orientationWillChange?(orientation: number): void;
  orientationDidChange?(orientation: number): void;
}

/** the applications, by id */
const applications = new Map<string, Application<any>>();

/**
 * The orientation of the window: the screen angle, else 90 (landscape) or
 * 0 (portrait) according to the window size
 */
function windowOrientation(): number {
  const angle = globalThis.screen?.orientation?.angle;
  if (typeof angle === 'number' && angle !== 0) return angle > 180 ? angle - 360 : angle;
  return window.innerWidth > window.innerHeight ? 90 : 0;
}

function hasNodeOption(options: ViewOptions): boolean {
  return ['node', 'nodeId', 'nodeRef', 'rootRef', 'templateRef', 'template'].some(key => options[key] !== undefined);
}

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
export class Application<Events extends ModelEvents = {}> extends View<ApplicationEvents & Events> {
  #orientation = 0;
  #orientationListener = () => this.#didChangeOrientation();

  constructor(options: ViewOptions = {}) {
    let node = options.node as Element | undefined;
    if (!hasNodeOption(options)) node = document.body;
    // the application of a page is its body
    if (node instanceof HTMLHtmlElement) node = node.querySelector('body') ?? undefined;
    super(node ? { ...options, node: node as HTMLElement } : options);
  }

  protected override initComponent(): void {
    super.initComponent();
    applications.set(this.id, this);
    this.view!.setAttribute('x-hag-ref', this.id);
    this.#orientation = windowOrientation();
    window.addEventListener('orientationchange', this.#orientationListener);
    window.addEventListener('resize', this.#orientationListener);
  }

  protected override destructor(): void {
    window.removeEventListener('orientationchange', this.#orientationListener);
    window.removeEventListener('resize', this.#orientationListener);
    applications.delete(this.id);
    super.destructor();
  }

  /**
   *  Called once, when the applications start (see Application.start)
   */
  // eslint-disable-next-line class-methods-use-this
  applicationStarted(): void {}

  /**
   *  Called before the views follow the new orientation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  orientationWillChange(_orientation: number): void {}

  /**
   *  Called once the views follow the new orientation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  orientationDidChange(_orientation: number): void {}

  /**
   * The current orientation (0: portrait, 90 or -90: landscape)
   */
  get orientation(): number {
    return this.#orientation;
  }

  #didChangeOrientation(): void {
    const orientation = windowOrientation();
    if (orientation === this.#orientation) return;
    this.#orientation = orientation;

    const views: OrientationObserver[] = [];
    const collect = (child: ViewChild) => {
      views.push(child as OrientationObserver);
      if (child instanceof View) child.getChildren().forEach(collect);
    };
    this.getChildren().forEach(collect);

    this.orientationWillChange(orientation);
    views.forEach(view => view.orientationWillChange?.(orientation));
    this.refresh();
    views.forEach(view => view.orientationDidChange?.(orientation));
    this.orientationDidChange(orientation);
    (this as Application).emit('orientationchange', orientation);
  }

  /**
   * The position and size of an application are in px
   */
  protected override didUpdateSizeAndPosition(): void {
    const view = this.view;
    if (!view) return;
    const [width, height] = this.size, [x, y] = this.position;
    if (width >= 0) view.style.width = `${width}px`;
    if (height >= 0) view.style.height = `${height}px`;
    if (x >= 0) view.style.left = `${x}px`;
    if (y >= 0) view.style.top = `${y}px`;
    view.style.right = view.style.bottom = 'auto';
  }

  /*****************************************************************
   *  Loading
   ****************************************************************/

  /**
   *  Loads a script; the 'scriptloaded' event is emitted once loaded
   */
  loadScript(path: string): Promise<void> {
    const script = document.createElement('script');
    script.src = path;
    return this.#load(script, path, 'scriptloaded');
  }

  /**
   *  Loads a style sheet; the 'cssloaded' event is emitted once loaded
   */
  loadCSS(path: string): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    return this.#load(link, path, 'cssloaded');
  }

  #load(element: HTMLElement, path: string, event: 'scriptloaded' | 'cssloaded'): Promise<void> {
    return new Promise((resolve, reject) => {
      element.addEventListener('load', () => {
        (this as Application).emit(event, path);
        resolve();
      }, { once: true });
      element.addEventListener('error', () => reject(new Error(`vs.ui.Application: impossible to load '${path}'`)), { once: true });
      document.head.appendChild(element);
    });
  }

  /*****************************************************************
   *  Applications
   ****************************************************************/

  /**
   *  Returns the initialized applications
   */
  static getApplications(): Application<any>[] {
    return [...applications.values()];
  }

  /**
   *  Starts the applications: applicationStarted is called, then they are
   *  refreshed
   */
  static start(): void {
    for (const application of applications.values()) {
      application.applicationStarted();
      setTimeout(() => application.refresh(), 0);
    }
  }

  /**
   *  Destroys the applications
   */
  static stop(): void {
    for (const application of [...applications.values()]) application.destroy();
    applications.clear();
  }

  /**
   *  Closes the window
   */
  static exit(): void {
    window.close?.();
  }

  /**
   *  Returns the orientation of the window (0: portrait, 90 or -90:
   *  landscape)
   */
  static getOrientation(): number {
    return windowOrientation();
  }

  /**
   *  Preloads images (in the browser cache)
   */
  static preloadImages(paths: string[]): void {
    for (const path of paths) new Image().src = path;
  }
}

export default Application;
