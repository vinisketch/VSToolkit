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


/**
 * The codes of the themes: a theme gives its code as the margin-top (in px)
 * of the '.device_test' elements (see getDeviceCSSCode).
 */
export const CSS_DEFAULT = 0;
export const CSS_IOS = 5;
export const CSS_WP7 = 6;
export const CSS_BLACKBERRY = 7;
export const CSS_SYMBIAN = 8;
export const CSS_ANDROID = 9;
export const CSS_MEEGO = 10;
export const CSS_PURE = 100;
export const CSS_FLAT = 101;
export const CSS_HOLO = 102;
export const CSS_IOS7 = 103;

/**
 * Returns the code of the theme of the page (CSS_IOS, CSS_ANDROID…),
 * CSS_DEFAULT without theme
 */
export function getDeviceCSSCode(): number {
  const element = document.createElement('div');
  element.className = 'device_test';
  document.body.appendChild(element);
  const value = getComputedStyle(element).getPropertyValue('margin-top');
  element.remove();
  return parseInt(value || '0', 10) || CSS_DEFAULT;
}
