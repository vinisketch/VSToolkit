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


import { Animation, type View } from 'vs_toolkit/vs_ui';

/**
 * Sets the transform of a view, without animation
 */
export function place(view: View<any>, transform: string): void {
  if (view.view) view.view.style.transform = transform;
}

/**
 * Animates properties of a view ([property, value] pairs, see Animation)
 * during duration ms; the transforms replace the current one
 */
export function animate(view: View<any>, properties: [string, string][], duration: number): Promise<unknown> {
  return new Animation(properties, { duration, additive: false }).start(view);
}
