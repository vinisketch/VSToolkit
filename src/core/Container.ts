import Component from './Component';
import { isObject } from 'vs_utils';

export default class Container extends Component {
  #parent: Container | undefined;
  #children: Container[] = [];

  protected destructor() {
    if (this.#parent) {
      this.#parent.remove(this);
    }

    this.#children.forEach(child => child.destructor());
    this.#children.length = 0;
    super.destructor();
  }

  get parent(): Container | undefined {
    return this.#parent;
  }

  /**
   *  Return true if the set component is a child o the current component
   *
   * @param {View} child The component to be removed.
   * @return {boolean}
   */
  isChild(child: Container): boolean {
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
  add(child: Container): void {
    if (this.isChild(child)) {
      return;
    }

    this.#children.push(child);

    child.#parent = this;
  }

  /**
   *  Remove the specified child component from this component.
   *
   *  @example
   *  myObject.remove (myButton);
   *
   *
   * @param {View} child The component to be removed.
   */
  remove(child: Container): void {
    if (!this.isChild(child)) {
      return;
    }

    const idx = this.#children.indexOf(child);
    if (idx === -1) {
      throw new Error('Not a child of this component');
    }
    this.#children.splice(idx, 1);
    child.#parent = undefined;
  }

  /**
   *  Remove all children components from this component
   *
   *  @example
   *  myObject.removeAllChildren ();
   *
   */
  removeAllChildren(): void {
    this.#children.forEach(child => {
      child.#parent = undefined;
    });
    this.#children.length = 0;
  }
}

export function isContainer(obj: unknown): obj is Container {
  if (obj instanceof Container) return true;
  return isObject(obj) && 'add' in obj && 'remove' in obj;
}
