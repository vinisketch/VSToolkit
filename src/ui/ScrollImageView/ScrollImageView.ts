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
import { InOut } from 'vs_toolkit/vs_core';

import { ScrollView } from '../ScrollView/ScrollView';
import { BLANK_IMAGE } from '../helpers';
import html_template from './ScrollImageView.html';

/**
 * The events of a ScrollImageView
 */
export type ScrollImageViewEvents = {
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
export class ScrollImageView extends ScrollView<ScrollImageViewEvents> {
  static STRETCH_NONE = 0;
  static STRETCH_FILL = 1;
  static STRETCH_UNIFORM = 2;
  static STRETCH_UNIFORM_FILL = 3;

  protected override htmlTemplate = html_template;

  #src: string | null = null;
  #stretch = ScrollImageView.STRETCH_FILL;
  #isLoaded = false;
  #loadListener = () => this.#didLoad();

  /** the image node */
  protected get image(): HTMLImageElement | null {
    return this.contentView instanceof HTMLImageElement ? this.contentView : null;
  }

  protected override initComponent(): void {
    super.initComponent();
    const image = this.image;
    if (!image) {
      throw new Error(`vs.ui.ScrollImageView ${this.id}: no image node`);
    }
    image.ondragstart = (event) => { event.preventDefault(); return false; };
    image.addEventListener('load', this.#loadListener);

    // the src of the node, if any (as written: a relative path)
    const src = image.getAttribute('src');
    if (src) {
      this.#src = src;
      if (image.complete && image.naturalWidth) this.#didLoad();
    } else if (this.#src) {
      image.src = this.#src;
    }
    this.#applyStretch();
  }

  protected override destructor(): void {
    const image = this.image;
    if (image) {
      image.removeEventListener('load', this.#loadListener);
      // frees the image
      image.src = BLANK_IMAGE;
    }
    this.#isLoaded = false;
    super.destructor();
  }

  /**
   * The view scrolls the image
   */
  protected override scrollContainer(): HTMLElement | null {
    return this.view;
  }

  override refresh(): void {
    super.refresh();
    this.#applyStretch();
  }

  override show(clb?: Function): void {
    super.show(clb);
    // the view size is known once displayed
    this.#applyStretch();
  }

  #didLoad(): void {
    const image = this.image;
    // the blank image of a destroyed view
    if (!image || image.src === BLANK_IMAGE) return;
    this.#isLoaded = true;
    this.#applyStretch();
    this.emit('load');
  }

  /**
   * The image size according to the stretch mode
   */
  #applyStretch(): void {
    const view = this.view, image = this.image;
    if (!view || !image) return;
    const style = image.style;
    style.removeProperty('object-fit');

    switch (this.#stretch) {
      case ScrollImageView.STRETCH_NONE:
        style.width = style.height = '';
        break;

      case ScrollImageView.STRETCH_FILL:
      case ScrollImageView.STRETCH_UNIFORM:
        style.width = style.height = '100%';
        style.objectFit = this.#stretch === ScrollImageView.STRETCH_FILL ? 'fill' : 'contain';
        break;

      case ScrollImageView.STRETCH_UNIFORM_FILL: {
        // the image covers the view: 100% of its narrowest side, the other
        // side overflows (and scrolls)
        const [width, height] = view.clientWidth && view.clientHeight
          ? [view.clientWidth, view.clientHeight]
          : this.size;
        const imageRatio = image.naturalWidth / image.naturalHeight;
        if (!this.#isLoaded || !(width > 0 && height > 0) || !Number.isFinite(imageRatio)) {
          style.width = '100%';
          style.height = '';
        } else if (width / height > imageRatio) {
          style.width = '100%';
          style.height = '';
        } else {
          style.width = '';
          style.height = '100%';
        }
        break;
      }
    }
  }

  /**
   * The size of the view [width, height], in px; the image is stretched
   * again
   */
  override set size(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    super.size = v;
    this.#applyStretch();
  }
  override get size(): number[] {
    return super.size;
  }

  /**
   * The url of the image
   */
  @InOut set src(v: string | null) {
    if (!isString(v)) return;
    this.#src = v;
    this.#isLoaded = false;
    if (this.image) this.image.src = v;
  }
  get src(): string | null {
    return this.#src;
  }

  /**
   * The stretch mode: ScrollImageView.STRETCH_NONE, STRETCH_FILL (default),
   * STRETCH_UNIFORM or STRETCH_UNIFORM_FILL
   */
  @InOut set stretch(v: number) {
    if (v !== ScrollImageView.STRETCH_NONE && v !== ScrollImageView.STRETCH_FILL &&
        v !== ScrollImageView.STRETCH_UNIFORM && v !== ScrollImageView.STRETCH_UNIFORM_FILL) return;
    this.#stretch = v;
    this.#applyStretch();
  }
  get stretch(): number {
    return this.#stretch;
  }

  /**
   * True once the image is loaded
   */
  get isLoaded(): boolean {
    return this.#isLoaded;
  }
}

export default ScrollImageView;
