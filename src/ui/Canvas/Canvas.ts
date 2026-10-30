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


import { isArray, isNumber } from 'vs_utils';

import { View } from '../View/View';
import html_template from './Canvas.html';

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
export class Canvas extends View {
  protected override htmlTemplate = html_template;

  /** the canvas node */
  canvasNode: HTMLCanvasElement | null = null;
  /** the 2d context of the canvas */
  context: CanvasRenderingContext2D | null = null;

  protected override initComponent(): void {
    super.initComponent();
    this.canvasNode = this.view!.querySelector('canvas');
    if (!this.canvasNode) {
      throw new Error(`vs.ui.Canvas ${this.id}: no canvas node`);
    }
    this.context = this.canvasNode.getContext('2d');
    this.#resize();
  }

  protected override destructor(): void {
    this.canvasNode = null;
    this.context = null;
    super.destructor();
  }

  /**
   * Returns the 2d context of the canvas
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.context;
  }

  /**
   * The size of the view and of the canvas [width, height], in px; the
   * canvas is drawn again
   */
  override set size(v: number[]) {
    if (!isArray(v) || v.length !== 2 || !isNumber(v[0]) || !isNumber(v[1])) return;
    super.size = v;
    this.#resize();
  }
  override get size(): number[] {
    return super.size;
  }

  #resize(): void {
    const [width, height] = super.size;
    if (!this.canvasNode || width < 0 || height < 0) return;
    this.canvasNode.width = width;
    this.canvasNode.height = height;
    this.draw(0, 0, width, height);
  }

  /**
   * Draws the content of the rectangle (all the canvas by default). Clears
   * it by default: override it.
   */
  draw(x = 0, y = 0, width = this.size[0], height = this.size[1]): void {
    this.context?.clearRect(x, y, width, height);
  }

  /**
   * Strokes a rectangle, with rounded corners (radius) and rotated
   * (rotation, in radians) [optional]
   */
  drawRect(x: number, y: number, w: number, h: number, radius = 0, rotation = 0): this {
    if (!radius && !rotation) {
      if (this.context) {
        this.context.beginPath();
        this.context.rect(x, y, w, h);
        this.context.stroke();
      }
      return this;
    }
    const points = [x, y];
    for (const [px, py] of [[w, 0], [w, h], [0, h]]) {
      const [rx, ry] = this.rotatePoint(px, py, rotation);
      points.push(x + rx, y + ry);
    }
    if (radius) points.push(radius);
    return this.polygon(...points);
  }

  /**
   * Returns the point rotated around the origin (angle in radians)
   */
  rotatePoint(x: number, y: number, angle: number): [number, number] {
    return [
      x * Math.cos(angle) - y * Math.sin(angle),
      y * Math.cos(angle) + x * Math.sin(angle),
    ];
  }

  /**
   * Strokes a polygon: x1, y1, x2, y2, x3, y3… With an odd number of
   * arguments, the last one is the radius of the rounded corners.
   */
  polygon(...args: number[]): this {
    // at least 3 points
    if (args.length < 6) throw new Error('vs.ui.Canvas.polygon: not enough arguments');
    const context = this.context;
    if (!context) return this;

    context.beginPath();
    if (args.length % 2 === 0) {
      context.moveTo(args[0], args[1]);
      for (let i = 2; i < args.length; i += 2) context.lineTo(args[i], args[i + 1]);
    } else {
      const radius = args[args.length - 1];
      const n = (args.length - 1) / 2;
      // begins at the middle of the first and last points
      context.moveTo((args[n * 2 - 2] + args[0]) / 2, (args[n * 2 - 1] + args[1]) / 2);
      for (let i = 0; i < n - 1; i++) {
        context.arcTo(args[i * 2], args[i * 2 + 1], args[i * 2 + 2], args[i * 2 + 3], radius);
      }
      context.arcTo(args[n * 2 - 2], args[n * 2 - 1], args[0], args[1], radius);
    }
    context.closePath();
    context.moveTo(args[0], args[1]);
    context.stroke();
    return this;
  }

  /**
   * Strokes an ellipse (or an arc of ellipse); the angles in radians
   */
  ellipse(
    cx: number, cy: number, rx: number, ry: number,
    rotation = 0, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = false,
  ): this {
    const context = this.context;
    if (!context) return this;
    context.beginPath();
    context.ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle, anticlockwise);
    context.stroke();
    return this;
  }
}

export default Canvas;
