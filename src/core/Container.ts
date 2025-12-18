import { isObject } from 'vs_utils';
import Component from './Component';

const childToParent = new WeakMap<Component, Container>();

export default class Container {
  #children: Component[] = [];

  static getParent(comp: Component): Container | undefined {
    return childToParent.get(comp);
  }

  destructor() {
    this.removeAllChildren();
  }

  /**
   *  Return true if the set component is a child o the current component
   *
   * @param {Component} child The component to be removed.
   * @return {boolean}
   */
  isChild(child: Component): boolean {
    return this.#children.indexOf(child) !== -1;
  }

  /**
   *  Add the specified child component to this component.
   *  <p>
   *  The component can be a graphic component (vs.ui.Group) or
   *  a non graphic component (View).
   *  In case of vs.ui.Group its mandatory to set the extension.
   *  <p>
   *  The add is a lazy add! The child's view can be already in
   *  the HTML DOM. In that case, the add methode do not modify the DOM.
   *  <p>
   *  @example
   *  var myButton = new Button (conf);
   *  myObject.add (myButton, 'children');
   *
   */
  add(child: Component): void {
    if (childToParent.has(child)) {
      throw new Error('Component is already a child of another Container');
    }

    this.#children.push(child);

    childToParent.set(child, this);
  }

  /**
   *  Remove the specified child component from this component.
   *
   *  @example
   *  myObject.remove (myButton);
   *
   *
   * @param {Component} child The component to be removed.
   */
  remove(child: Component): void {
    if (!this.isChild(child)) {
      return;
    }

    const idx = this.#children.indexOf(child);
    if (idx === -1) {
      throw new Error('Not a child of this component');
    }
    this.#children.splice(idx, 1);
    childToParent.delete(child);
  }

  /**
   *  Remove all children components from this component
   *
   *  @example
   *  myObject.removeAllChildren ();
   *
   */
  removeAllChildren(): void {
    this.#children.forEach(child => childToParent.delete(child));
    this.#children.length = 0;
  }
}

export function isContainer(obj: unknown): obj is Container {
  if (obj instanceof Container) return true;
  return isObject(obj) && 'add' in obj && 'remove' in obj;
}
