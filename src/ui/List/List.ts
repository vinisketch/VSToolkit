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


import { isArray, isFunction, isString } from 'vs_utils';
import { InOut, Model, Out } from 'vs_toolkit/vs_core';

import { View, type ViewChild } from '../View/View';
import { AbstractList } from './AbstractList';
import { toText } from '../helpers';
import { CSS_MEEGO, CSS_SYMBIAN, getDeviceCSSCode } from '../theme';
import html_template from './List.html';

/**
 *  @class
 *  The base of the items of a List: the 'pressed' class name while it is
 *  touched, its index in the data, and didSelect called when it is
 *  selected.
 *
 * @extends vs.ui.View
 * @name vs.ui.AbstractListItem
 */
export class AbstractListItem extends View {
  #pressed = false;

  /** the index of the item in the list data */
  index = 0;

  /**
   * The item is touched (the 'pressed' class name)
   */
  set pressed(v: boolean) {
    this.#pressed = !!v;
    this.view?.classList.toggle('pressed', this.#pressed);
  }
  get pressed(): boolean {
    return this.#pressed;
  }

  /**
   * Called when the user selects the item
   */
  // eslint-disable-next-line class-methods-use-this
  didSelect(): void {}
}

/**
 *  @class
 *  The default item of a List: a title, and a label (in a span).
 *
 * @extends vs.ui.AbstractListItem
 * @name vs.ui.DefaultListItem
 */
export class DefaultListItem extends AbstractListItem {
  protected override htmlTemplate = '<li></li>';

  #title = '';
  #label = '';
  #labelView: HTMLSpanElement | null = null;

  protected override initComponent(): void {
    super.initComponent();
    this.#labelView = document.createElement('span');
    this.#render();
  }

  #render(): void {
    const view = this.view;
    if (!view || !this.#labelView) return;
    this.#labelView.textContent = this.#label;
    view.replaceChildren(this.#title, ...(this.#label ? [this.#labelView] : []));
  }

  /**
   * The title of the item
   */
  @InOut set title(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#title = text;
    this.#render();
  }
  get title(): string {
    return this.#title;
  }

  /**
   * The label of the item (displayed after the title)
   */
  @InOut set label(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#label = text;
    this.#render();
  }
  get label(): string {
    return this.#label;
  }
}

/**
 *  @class
 *  A simple item of a List: a title.
 *
 * @extends vs.ui.AbstractListItem
 * @name vs.ui.SimpleListItem
 */
export class SimpleListItem extends AbstractListItem {
  protected override htmlTemplate = '<div class="simplelist_item"><div class="title"></div></div>';

  #title = '';
  #titleView: HTMLElement | null = null;

  protected override initComponent(): void {
    super.initComponent();
    this.#titleView = this.view!.querySelector('.title');
    if (this.#titleView) this.#titleView.textContent = this.#title;
  }

  /**
   * The title of the item
   */
  @InOut set title(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#title = text;
    if (this.#titleView) this.#titleView.textContent = text;
  }
  get title(): string {
    return this.#title;
  }
}

/**
 * The events of a List
 */
export type ListEvents = {
  /** the user selected an item */
  itemselect: [index: number, item: unknown];
};

/**
 * A filter of the List items: the items whose property does not match the
 * value are hidden
 */
export interface ListFilter {
  property: string;
  value: string;
  /** List.FILTER_EXACTS (default), FILTER_CONTAINS or FILTER_STARTS_WITH */
  matching?: number;
  /** false for a case insensitive filter */
  strict?: boolean;
}

/**
 * The template of the List items: a class, or an item which is cloned
 */
export type ListItemTemplate = (new () => AbstractListItem) | AbstractListItem;

/**
 *  @class
 *  A List draws its data with list items (DefaultListItem by default, see
 *  setItemTemplate), and lets the user select an item (the 'itemselect'
 *  event).
 *  <p>
 *  An item is configured with the data item: its model properties are set
 *  from the properties of an object, and follow the changes of a Model.
 *  <p>
 *  A BLOCK_LIST or TAB_LIST displays sections: a string in the data is the
 *  title of the next items. A TAB_LIST has a bar to access the sections by
 *  their first letter.
 *  <p>
 *  The items can be filtered:
 *  list.filters = [{
 *    property: 'title', value: 'o', matching: List.FILTER_CONTAINS, strict: false
 *  }];
 *
 *  @example
 *  const list = new List({ data: [{ title: 'one' }, { title: 'two', label: '2' }] });
 *  list.init();
 *  list.on('itemselect', (list, index, item) => { … });
 *
 * @extends vs.ui.AbstractList
 * @name vs.ui.List
 */
export class List extends AbstractList<unknown, ListEvents> {
  static FILTER_EXACTS = 0;
  static FILTER_CONTAINS = 1;
  static FILTER_STARTS_WITH = 2;

  static BLOCK_LIST = 'BlockList';
  static TAB_LIST = 'TabList';
  static DEFAULT_LIST = 'DefaultList';

  protected override htmlTemplate = html_template;

  #type = List.DEFAULT_LIST;
  #listItems: AbstractListItem[] = [];
  #unbindItems: (() => void)[] = [];
  #template: ListItemTemplate | undefined;
  #selectedIndex = -1;
  #selectedItem: unknown = undefined;
  #filters: ListFilter[] | null = null;
  #hasArrow = false;

  #directAccess: HTMLElement | null = null;
  #directAccessValue: HTMLElement | null = null;
  #letters: string[] = [];
  #accessIndex = -1;
  #accessStartListener = (event: PointerEvent) => this.#accessStart(event);
  #accessMoveListener = (event: PointerEvent) => this.#accessMove(event);
  #accessEndListener = () => this.#accessEnd();

  protected override initComponent(): void {
    super.initComponent();
    this.addClassName(this.#type);
    this.view!.classList.toggle('arrow', this.#hasArrow);
  }

  protected override destructor(): void {
    this.#freeListItems();
    this.#removeDirectAccessBar();
    if (this.#template instanceof View) this.#template.destroy();
    this.#template = undefined;
    super.destructor();
  }

  /**
   *  Sets the template of the items (see setItemTemplate)
   */
  override add(child: ViewChild): void {
    if (child instanceof AbstractListItem) this.setItemTemplate(child);
  }

  /**
   *  Sets the template of the items: a class of item, or an item which is
   *  cloned (destroyed with the list)
   */
  setItemTemplate(template: ListItemTemplate): void {
    if (!template) return;
    if (!isFunction(template) && !(template instanceof AbstractListItem)) return;
    if (this.#template instanceof View && this.#template !== template) this.#template.destroy();
    this.#template = template;
    if (this.view) this.renderData();
  }

  /**
   *  Sets the template of the items from a registered component (see
   *  View.createAndAddComponent)
   */
  setItemTemplateName(name: string): View<any> | undefined {
    return this.createAndAddComponent(name, {}, 'item_children');
  }

  /**
   * Returns the items
   */
  getItems(): AbstractListItem[] {
    return this.#listItems.slice();
  }

  /*****************************************************************
   *  Rendering
   ****************************************************************/

  #freeListItems(): void {
    this.#unbindItems.forEach(unbind => unbind());
    this.#unbindItems = [];
    this.#listItems.forEach(item => item.destroy());
    this.#listItems = [];
  }

  /**
   * Sets the model properties of the list item from the data item
   */
  #configureItem(listItem: AbstractListItem, item: unknown): void {
    const properties = new Set(listItem.modelProperties);
    const copy = (source: object, names: string[]) => {
      const values: Record<string, unknown> = {};
      for (const name of names) {
        if (properties.has(name)) values[name] = (source as Record<string, unknown>)[name];
      }
      listItem.assign(values);
    };

    if (item instanceof Model) {
      copy(item, item.modelProperties);
      this.#unbindItems.push(item.on('change', (_model, names) => copy(item, names)));
    } else if (isString(item) || typeof item === 'number') {
      if (properties.has('title')) listItem.assign({ title: String(item) });
    } else if (item && typeof item === 'object') {
      copy(item, Object.keys(item));
    }
  }

  #createItem(index: number): AbstractListItem {
    const template = this.#template;
    let listItem: AbstractListItem;
    if (template instanceof AbstractListItem) {
      listItem = template.clone();
    } else {
      listItem = template ? new template() : new DefaultListItem();
      listItem.init();
    }
    this.#configureItem(listItem, this.items[index]);
    listItem.index = index;
    this.#listItems.push(listItem);
    return listItem;
  }

  /**
   * A section: its title (if any), and the items until the next title
   */
  #buildSection(title: string | null, index: number): [HTMLLIElement, number] {
    const section = document.createElement('li');
    const content = document.createElement('ul');
    const items = this.items;
    for (; index < items.length && !isString(items[index]); index++) {
      content.appendChild(this.#createItem(index).view!);
    }

    if (title !== null) {
      const titleView = document.createElement('div');
      const mode = getDeviceCSSCode();
      if (mode === CSS_MEEGO || mode === CSS_SYMBIAN) {
        const text = document.createElement('div');
        text.textContent = title;
        titleView.append(document.createElement('div'), text);
      } else {
        titleView.textContent = title;
      }
      section.appendChild(titleView);
    }
    if (content.childElementCount) section.appendChild(content);
    return [section, index];
  }

  protected override renderData(): void {
    const itemsView = this.itemsView;
    if (!itemsView) return;
    this.#freeListItems();
    itemsView.scrollTop = 0;

    const items = this.items;
    const nodes: HTMLElement[] = [];
    if (this.#type === List.DEFAULT_LIST) {
      items.forEach((_item, index) => nodes.push(this.#createItem(index).view!));
    } else {
      this.#letters = [];
      let index = 0;
      while (index < items.length) {
        let title: string | null = null;
        if (isString(items[index])) {
          title = items[index] as string;
          this.#letters.push(title[0] ?? '');
          index++;
        }
        const [section, next] = this.#buildSection(title, index);
        nodes.push(section);
        index = next;
      }
    }
    itemsView.replaceChildren(...nodes);
    this.#renderDirectAccessBar();
    this.applyFilters();

    // new items: no selection
    if (this.#selectedIndex !== -1) {
      this.batch(() => {
        this.#selectedIndex = -1;
        this.#selectedItem = undefined;
        this.propertyChange('selectedIndex');
        this.propertyChange('selectedItem');
      });
    }
  }

  /*****************************************************************
   *  Selection
   ****************************************************************/

  #listItemOf(node: Node | null): AbstractListItem | undefined {
    for (let n: Node | null = node; n && n !== this.itemsView; n = n.parentNode) {
      const component = n instanceof Element ? View.componentOf(n) : undefined;
      if (component instanceof AbstractListItem && this.#listItems.includes(component)) return component;
    }
    return undefined;
  }

  protected override itemIndexOf(node: Node | null): number {
    return this.#listItemOf(node)?.index ?? -1;
  }

  protected override itemNodeAt(index: number): HTMLElement | undefined {
    return this.#listItems.find(item => item.index === index)?.view ?? undefined;
  }

  protected override touchItemFeedback(index: number): void {
    const item = this.#listItems.find(item => item.index === index);
    if (item) item.pressed = true;
  }

  protected override untouchItemFeedback(index: number): void {
    const item = this.#listItems.find(item => item.index === index);
    if (item) item.pressed = false;
  }

  protected override didSelectItem(index: number): void {
    this.#listItems.find(item => item.index === index)?.didSelect();
    this.batch(() => {
      this.selectedIndex = index;
    });
    this.emit('itemselect', index, this.#selectedItem);
  }

  /*****************************************************************
   *  Filters
   ****************************************************************/

  static #matches(filter: ListFilter, item: unknown): boolean {
    if (!filter.property || !filter.value) return true;
    let source = toText((item as Record<string, unknown> | null)?.[filter.property]) ?? '';
    let value = String(filter.value);
    if (filter.strict === false) {
      source = source.toLowerCase();
      value = value.toLowerCase();
    }
    switch (filter.matching) {
      case List.FILTER_STARTS_WITH: return source.startsWith(value);
      case List.FILTER_CONTAINS: return source.includes(value);
      default: return source === value;
    }
  }

  /**
   * Hides the items which do not match all the filters
   */
  applyFilters(): void {
    const filters = this.#filters ?? [];
    for (const listItem of this.#listItems) {
      const item = this.items[listItem.index];
      if (filters.every(filter => List.#matches(filter, item))) listItem.show();
      else listItem.hide();
    }
  }

  /*****************************************************************
   *  Direct access bar (TAB_LIST)
   ****************************************************************/

  #renderDirectAccessBar(): void {
    if (this.#type !== List.TAB_LIST) {
      this.#removeDirectAccessBar();
      return;
    }
    if (!this.#directAccess) {
      this.#directAccess = document.createElement('div');
      this.#directAccess.className = 'direct_access';
      this.#directAccess.style.touchAction = 'none';
      this.#directAccess.addEventListener('pointerdown', this.#accessStartListener);
      this.#directAccessValue = document.createElement('div');
      this.#directAccessValue.className = 'direct_access_value';
      this.view!.append(this.#directAccess, this.#directAccessValue);
    }
    this.#directAccess.replaceChildren(...this.#letters.map(letter => {
      const element = document.createElement('div');
      element.textContent = letter;
      return element;
    }));
  }

  #removeDirectAccessBar(): void {
    this.#accessEnd();
    this.#directAccess?.removeEventListener('pointerdown', this.#accessStartListener);
    this.#directAccess?.remove();
    this.#directAccessValue?.remove();
    this.#directAccess = this.#directAccessValue = null;
  }

  /**
   * The index of the letter at the y position of the bar
   */
  #letterIndexAt(y: number): number {
    const rect = this.#directAccess!.getBoundingClientRect();
    const top = rect.top + 5, height = rect.height - 10;
    const count = this.#letters.length;
    if (height <= 0 || !count) return 0;
    const dy = Math.min(Math.max(y - top, 0), height - 1);
    return Math.floor(dy * count / height);
  }

  #accessStart(event: PointerEvent): void {
    if (!event.isPrimary || !this.#directAccess) return;
    event.stopPropagation();
    event.preventDefault();
    document.addEventListener('pointermove', this.#accessMoveListener, true);
    document.addEventListener('pointerup', this.#accessEndListener, true);
    document.addEventListener('pointercancel', this.#accessEndListener, true);

    const letter = [...this.#directAccess.children].indexOf(event.target as Element);
    this.#accessIndex = -1;
    this.#scrollToTitle(letter !== -1 ? letter : this.#letterIndexAt(event.clientY));
    if (this.#directAccessValue) this.#directAccessValue.style.opacity = '1';
  }

  #accessMove(event: PointerEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.#scrollToTitle(this.#letterIndexAt(event.clientY));
  }

  #accessEnd(): void {
    document.removeEventListener('pointermove', this.#accessMoveListener, true);
    document.removeEventListener('pointerup', this.#accessEndListener, true);
    document.removeEventListener('pointercancel', this.#accessEndListener, true);
    if (this.#directAccessValue) this.#directAccessValue.style.opacity = '0';
  }

  #scrollToTitle(index: number): void {
    if (index === this.#accessIndex) return;
    const title = this.getTitleItem(index), container = this.itemsView;
    if (!title || !container) return;
    this.#accessIndex = index;
    container.scrollTop += title.getBoundingClientRect().top - container.getBoundingClientRect().top;
    if (this.#directAccessValue) this.#directAccessValue.textContent = this.#letters[index] ?? '';
  }

  /**
   * Returns the section of the title at the index (BLOCK_LIST, TAB_LIST)
   */
  getTitleItem(index: number): HTMLElement | undefined {
    const titles = this.itemsView?.querySelectorAll<HTMLElement>(':scope > li > div') ?? [];
    return titles[index]?.parentElement ?? undefined;
  }

  /**
   * Returns the position of the section of the title at the index
   */
  getTitlePosition(index: number): number {
    return this.getTitleItem(index)?.offsetTop ?? 0;
  }

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The index of the selected item, -1 without selection
   */
  @Out set selectedIndex(v: number) {
    if (!Number.isInteger(v) || v < -1 || v >= this.items.length) return;
    const previous = this.#selectedItem;
    this.#selectedIndex = v;
    this.#selectedItem = v === -1 ? undefined : this.items[v];
    if (!Object.is(previous, this.#selectedItem)) this.propertyChange('selectedItem');
  }
  get selectedIndex(): number {
    return this.#selectedIndex;
  }

  /**
   * The selected item (of the data)
   */
  @Out set selectedItem(v: unknown) {
    // the index and the item notified once
    this.batch(() => {
      this.selectedIndex = this.items.indexOf(v);
    });
  }
  get selectedItem(): unknown {
    return this.#selectedItem;
  }

  /**
   * The type: List.DEFAULT_LIST, BLOCK_LIST or TAB_LIST (also a class
   * name)
   */
  @InOut set type(v: string) {
    if (v !== List.BLOCK_LIST && v !== List.TAB_LIST && v !== List.DEFAULT_LIST) return;
    this.removeClassName(this.#type);
    this.#type = v;
    this.addClassName(v);
    if (this.view) this.renderData();
  }
  get type(): string {
    return this.#type;
  }

  /**
   * The items have an arrow (the 'arrow' class name), false by default
   */
  @InOut set hasArrow(v: boolean) {
    this.#hasArrow = !!v;
    this.view?.classList.toggle('arrow', this.#hasArrow);
  }
  get hasArrow(): boolean {
    return this.#hasArrow;
  }

  /**
   * The filters of the items (see ListFilter)
   */
  @InOut set filters(v: ListFilter[] | null) {
    if (v !== null && !isArray(v)) return;
    this.#filters = v ? v.slice() : null;
    this.applyFilters();
  }
  get filters(): ListFilter[] | null {
    return this.#filters?.slice() ?? null;
  }
}

export default List;
