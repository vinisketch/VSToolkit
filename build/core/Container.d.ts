import Component from './Component';
export default class Container {
    #private;
    static getParent(comp: Component): Container | undefined;
    destructor(): void;
    /**
     *  Return true if the set component is a child o the current component
     *
     * @param {Component} child The component to be removed.
     * @return {boolean}
     */
    isChild(child: Component): boolean;
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
    add(child: Component): void;
    /**
     *  Remove the specified child component from this component.
     *
     *  @example
     *  myObject.remove (myButton);
     *
     *
     * @param {Component} child The component to be removed.
     */
    remove(child: Component): void;
    /**
     *  Remove all children components from this component
     *
     *  @example
     *  myObject.removeAllChildren ();
     *
     */
    removeAllChildren(): void;
}
export declare function isContainer(obj: unknown): obj is Container;
//# sourceMappingURL=Container.d.ts.map