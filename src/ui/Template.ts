/*
  COPYRIGHT NOTICE
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

/**
 * Template tags: ${name} or ${name.sub.path}
 */
const TEMPLATE_TAG = /\$\{([\w-]+(?:\.[\w.]+)?)\}/g;

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
export default class Template {
  constructor(private readonly html: string) {}

  /**
   * The HTML string of the template
   */
  toString(): string {
    return this.html;
  }

  /**
   *  Returns the HTML string of the template, with its tags replaced by the
   *  values ('' for a missing value).
   *
   * @param {Object} values the values, by tag name
   * @return {String} the HTML string
   */
  apply(values?: Record<string, unknown>): string {
    if (!values) return this.html;

    return this.html.replace(TEMPLATE_TAG, (_tag, path: string) => {
      let value: unknown = values;
      for (const key of path.split('.')) {
        value = (value as Record<string, unknown> | undefined)?.[key];
      }
      return value === undefined || value === null ? '' : String(value);
    });
  }

  /**
   *  Parses the template into a new DOM node (see parseHTML).
   *
   * @return {HTMLElement} the node, undefined if the template has no element
   */
  node(): HTMLElement | undefined {
    return Template.parseHTML(this.html);
  }

  /**
   *  Parses an HTML string into a DOM node: its first element, detached.
   *
   * @param {String} html the HTML string
   * @return {HTMLElement} the node, undefined if the HTML has no element
   */
  static parseHTML(html: string): HTMLElement | undefined {
    const div = document.createElement('div');
    div.innerHTML = html.trim();

    const node = div.firstElementChild as HTMLElement | null;
    node?.remove();
    return node ?? undefined;
  }
}
