import { isObject } from 'vs_utils';
const childToParent = new WeakMap();
export default class Container {
    #children = [];
    static getParent(comp) {
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
    isChild(child) {
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
    add(child) {
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
    remove(child) {
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
    removeAllChildren() {
        this.#children.forEach(child => childToParent.delete(child));
        this.#children.length = 0;
    }
}
export function isContainer(obj) {
    if (obj instanceof Container)
        return true;
    return isObject(obj) && 'add' in obj && 'remove' in obj;
}
//# sourceMappingURL=Container.js.map