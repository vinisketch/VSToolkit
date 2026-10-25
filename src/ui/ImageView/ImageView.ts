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

import { View } from '../View/View';
import html_template from './ImageView.html';

/** a transparent 1x1 image, to free the image of a destroyed view */
const BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

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
export class ImageView extends View {
  protected override htmlTemplate = html_template;

  #src: string | null = null;

  declare view: HTMLImageElement | null;

  protected override initComponent(): void {
    super.initComponent();
    const image = this.view!;
    image.ondragstart = (event) => { event.preventDefault(); return false; };

    // the src of the node, if any (as written: a relative path)
    if (image.getAttribute('src')) this.#src = image.getAttribute('src');
    else if (this.#src) image.src = this.#src;

    image.setAttribute('width', '100%');
    image.setAttribute('height', '100%');
  }

  protected override destructor(): void {
    // frees the image
    if (this.view) this.view.src = BLANK_IMAGE;
    super.destructor();
  }

  /**
   * The url of the image
   */
  @InOut set src(v: string | null) {
    if (!isString(v)) return;
    this.#src = v;
    if (this.view) this.view.src = v;
  }
  get src(): string | null {
    return this.#src;
  }

  /**
   * The size of the image [width, height], in px; once displayed, the
   * actual size of the node
   */
  override set size(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    this.view?.setAttribute('width', String(v[0]));
    this.view?.setAttribute('height', String(v[1]));
    super.size = v;
  }
  override get size(): number[] {
    if (this.view?.parentNode) {
      return [this.view.offsetWidth, this.view.offsetHeight];
    }
    return super.size;
  }
}

export default ImageView;
