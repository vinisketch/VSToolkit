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
 * Converts a value to the text of a component: '' for null or undefined,
 * the string form of the other values. Returns undefined for a value which
 * can not be converted.
 */
export function toText(value: unknown): string | undefined {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const text = (value as { toString?: () => string }).toString?.();
  return typeof text === 'string' ? text : undefined;
}

/**
 * Calls the callback when a pointer goes down outside the node (in the
 * capture phase, before the targets get the event). Returns the function
 * which stops watching.
 */
export function onPointerDownOutside(node: Node, callback: (event: PointerEvent) => void): () => void {
  const listener = (event: PointerEvent) => {
    if (event.target instanceof Node && node.contains(event.target)) return;
    callback(event);
  };
  document.addEventListener('pointerdown', listener, true);
  return () => document.removeEventListener('pointerdown', listener, true);
}

/**
 * The events of a text input (TextArea, InputField)
 */
export type TextInputEvents = {
  /** the user changed the text: on each change (formerly 'continuous_change') */
  input: [value: string];
  /** the user committed the text (formerly 'change') */
  commit: [value: string];
  /** the input got the focus */
  focus: [];
  /** the input lost the focus */
  blur: [];
};
