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


import { createId, isArray, isNumber, isString } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View } from '../View/View';
import html_template from './SVGView.html';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** the loaded documents, by path */
const documents = new Map<string, Promise<SVGSVGElement | undefined>>();

/** the hidden defs of the loaded documents */
let defs: SVGDefsElement | null = null;

function svgDefs(): SVGDefsElement {
  if (!defs?.isConnected) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    document.body.appendChild(svg);
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.appendChild(defs);
  }
  return defs;
}

/**
 * Loads a svg document once, into the hidden defs of the page (where the
 * views use its elements). Resolves undefined if it can not be loaded.
 */
function loadDocument(path: string): Promise<SVGSVGElement | undefined> {
  let promise = documents.get(path);
  if (promise) return promise;

  promise = fetch(path)
    .then(response => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response.text();
    })
    .then(text => {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;
      if (svg?.nodeName !== 'svg' || doc.querySelector('parsererror')) {
        throw new Error('not a svg document');
      }
      return document.importNode(svg, true) as unknown as SVGSVGElement;
    })
    .catch(error => {
      console.error(`vs.ui.SVGView: impossible to load '${path}'`, error);
      documents.delete(path);
      return undefined;
    });
  documents.set(path, promise);
  return promise;
}

function createUse(id: string): SVGUseElement {
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#${id}`);
  return use;
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
export class SVGView extends View {
  protected override htmlTemplate = html_template;

  #href: string | null = null;
  #contentData: string | null = null;
  #viewBox: number[] | null = null;

  protected override initComponent(): void {
    super.initComponent();
    if (this.#href) this.#load(this.#href);
    else if (this.#contentData) this.view!.innerHTML = this.#contentData;
  }

  #load(href: string): void {
    const index = href.indexOf('#');
    const path = index === -1 ? href : href.slice(0, index);
    const id = index === -1 ? undefined : href.slice(index + 1);

    loadDocument(path).then(svgDocument => {
      // the href could have changed meanwhile
      if (svgDocument && this.view && this.#href === href) this.#setDocument(svgDocument, id);
    });
  }

  /**
   * Displays the element of the document, or all its elements
   */
  #setDocument(svgDocument: SVGSVGElement, id?: string): void {
    if (!svgDocument.isConnected) svgDefs().appendChild(svgDocument);

    const svg = document.createElementNS(SVG_NS, 'svg');
    this.view!.replaceChildren(svg);
    this.#applyViewBox();

    if (id) {
      svg.appendChild(createUse(id));
      return;
    }
    for (const node of svgDocument.children) {
      if (node.nodeName === 'defs') continue;
      if (!node.id) node.id = createId();
      svg.appendChild(createUse(node.id));
    }
  }

  #applyViewBox(): void {
    const svg = this.view?.querySelector('svg');
    if (!svg || !this.#viewBox) return;
    const [, , width, height] = this.#viewBox;
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', this.#viewBox.join(' '));
  }

  /**
   * The url of a svg file, or of an element of the file ('file.svg#id')
   */
  @InOut set href(v: string | null) {
    if (!isString(v)) return;
    this.#href = v;
    this.#contentData = null;
    if (this.view) this.#load(v);
  }
  get href(): string | null {
    return this.#href;
  }

  /**
   * The svg data to display
   */
  @InOut set contentData(v: string | null) {
    if (!isString(v)) return;
    this.#contentData = v;
    this.#href = null;
    if (!this.view) return;
    this.view.innerHTML = v;
    this.#applyViewBox();
  }
  get contentData(): string | null {
    return this.#contentData;
  }

  /**
   * The view box of the svg [x, y, width, height]
   */
  @InOut set viewBox(v: number[] | null) {
    if (!isArray(v) || v.length !== 4 || !v.every(value => isNumber(value))) return;
    this.#viewBox = v.slice();
    this.#applyViewBox();
  }
  get viewBox(): number[] | null {
    return this.#viewBox?.slice() ?? null;
  }
}

export default SVGView;
