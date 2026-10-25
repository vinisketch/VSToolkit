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


import { isArray, isString } from 'vs_utils';
import { InOut } from 'vs_toolkit/vs_core';

import { View, type ViewChild } from '../View/View';
import TapRecognizer, { type TapDelegate } from '../Recognizers/TapRecognizer';
import { toText } from '../helpers';
import html_template from './ToolBar.html';

/**
 *  @class
 *  A text item of a ToolBar.
 *
 *  @example
 *  const info = new ToolBarText({ id: 'info', text: 'Information' });
 *  info.init();
 *  bar.addItem(info);
 *
 * @extends vs.ui.View
 * @name vs.ui.ToolBar.Text
 */
export class ToolBarText extends View {
  protected override htmlTemplate = '<div class="vs_ui_toolbar_text"><div class="text_view"></div></div>';

  #text = '';
  #textView: HTMLElement | null = null;

  protected override initComponent(): void {
    super.initComponent();
    this.#textView = this.view!.querySelector('.text_view');
    if (this.#textView) this.#textView.textContent = this.#text;
  }

  /**
   * The text of the item
   */
  @InOut set text(v: string) {
    const text = toText(v);
    if (text === undefined) return;
    this.#text = text;
    if (this.#textView) this.#textView.textContent = text;
  }
  get text(): string {
    return this.#text;
  }
}

/**
 *  @class
 *  A button item of a ToolBar: an icon (its name, a class name of the
 *  theme: ToolBar.BUTTON_ADD…, or an image) and a label.
 *
 *  @example
 *  const back = new ToolBarButton({ id: 'back' });
 *  back.init();
 *  back.setImage('resources/images/back_icon.png');
 *  bar.addItem(back);
 *
 * @extends vs.ui.View
 * @name vs.ui.ToolBar.Button
 */
export class ToolBarButton extends View {
  protected override htmlTemplate = '<div class="vs_ui_toolbar_button"></div>';

  #name = '';
  #label = '';

  protected override initComponent(): void {
    super.initComponent();
    if (this.#name) this.addClassName(this.#name);
    this.#renderLabel();
  }

  /**
   * Sets the icon image of the button
   */
  setImage(path: string): void {
    if (this.view) this.view.style.backgroundImage = `url(${path})`;
  }

  #renderLabel(): void {
    if (!this.view) return;
    this.view.textContent = this.#label;
    // the icon above the label
    this.setStyle('background-position', this.#label ? 'center 0px' : 'center');
  }

  /**
   * The icon of the button: a class name (ToolBar.BUTTON_ADD…)
   */
  @InOut set name(v: string) {
    if (!isString(v)) return;
    if (this.#name) this.removeClassName(this.#name);
    this.#name = v;
    if (v) this.addClassName(v);
  }
  get name(): string {
    return this.#name;
  }

  /**
   * The label of the button
   */
  @InOut set label(v: string) {
    if (!isString(v)) return;
    this.#label = v;
    this.#renderLabel();
  }
  get label(): string {
    return this.#label;
  }
}

/**
 * The events of a ToolBar
 */
export type ToolBarEvents = {
  /** the user selected an item */
  itemselect: [id: string];
};

/**
 * A button of the configuration of a ToolBar: [id, name, label]
 */
export type ToolBarButtonSpec = [id: string, name: string, label?: string];

/**
 *  @class
 *  A ToolBar is displayed at the bottom of a view (the bottom bar of a
 *  ScrollView): a set of items (buttons, texts…). The user selects an item
 *  (the 'select' class name, and the 'itemselect' event with its id); it
 *  has the 'active' class name while it is pressed.
 *
 *  @example
 *  const bar = new ToolBar({ id: 'bar' });
 *  bar.init();
 *  bar.addButton('right', ToolBar.BUTTON_ARROW_RIGHT, 'Right panel');
 *  bar.addButton('attach', ToolBar.BUTTON_ATTACH);
 *  bar.on('itemselect', (bar, id) => { … });
 *
 * @extends vs.ui.View
 * @name vs.ui.ToolBar
 */
export class ToolBar extends View<ToolBarEvents> implements TapDelegate {
  static DEFAULT_STYLE = 'black_style';
  static BLACK_TRANSLUCIDE_STYLE = 'black_translucide_style';
  static BLUE_STYLE = 'blue_style';

  static Text = ToolBarText;
  static Button = ToolBarButton;

  /** added to the bottom bar of a ScrollView */
  static scrollViewHole = 'bottom_bar';

  protected override htmlTemplate = html_template;

  #style = ToolBar.DEFAULT_STYLE;
  #items = new Map<string, View<any>>();
  /** the buttons created by addButton */
  #buttons = new Set<View<any>>();
  #isToggleButtons = true;
  #selectedId: string | null = null;
  #activeItem: View<any> | undefined;
  #tapRecognizer: TapRecognizer | undefined;

  protected override initComponent(): void {
    super.initComponent();
    // slides down to hide
    this.setHideAnimation([['translateY', '44px']]);
    this.setShowAnimation([['translateY', '0px']]);
    if (this.#style) this.addClassName(this.#style);

    this.#tapRecognizer = new TapRecognizer(this);
    this.addPointerRecognizer(this.#tapRecognizer);
  }

  protected override destructor(): void {
    if (this.#tapRecognizer) {
      this.removePointerRecognizer(this.#tapRecognizer);
      this.#tapRecognizer = undefined;
    }
    this.#items.clear();
    this.#buttons.clear();
    super.destructor();
  }

  /*****************************************************************
   *  Items
   ****************************************************************/

  /**
   *  Creates and adds a button: its id, its icon name (ToolBar.BUTTON_ADD…)
   *  and its label. Returns undefined if an item has the id.
   */
  addButton(id: string, name: string, label?: string): ToolBarButton | undefined {
    if (this.#items.has(id)) return undefined;
    const button = new ToolBarButton({ id });
    button.init();
    button.name = name;
    if (label) button.label = label;
    this.#buttons.add(button);
    this.addItem(button);
    return button;
  }

  /**
   *  Adds an item (a ToolBarButton, a ToolBarText or any view)
   */
  addItem(item: View<any>): void {
    if (!item || this.#items.has(item.id)) return;
    this.add(item, 'children');
    this.#items.set(item.id, item);
  }

  /**
   *  Removes the item (a button created by addButton is destroyed)
   */
  removeItem(id: string): void {
    const item = this.#items.get(id);
    if (!item) return;
    this.remove(item);
    if (this.#buttons.delete(item)) item.destroy();
  }

  /**
   *  Returns the item of the id
   */
  getItem(id: string): View<any> | undefined {
    return this.#items.get(id);
  }

  override remove(child: ViewChild): void {
    super.remove(child);
    for (const [id, item] of this.#items) {
      if (item !== child) continue;
      this.#items.delete(id);
      if (this.#selectedId === id) this.#selectedId = null;
    }
  }

  /*****************************************************************
   *  Tap delegate
   ****************************************************************/

  #itemOf(node: Node | null): View<any> | undefined {
    for (let n: Node | null = node; n && n !== this.view; n = n.parentNode) {
      const component = n instanceof Element ? View.componentOf(n) : undefined;
      if (component && this.#items.get(component.id) === component) return component;
    }
    return undefined;
  }

  didTouch(_target: unknown, _element: HTMLElement, event: PointerEvent): void {
    this.#activeItem?.removeClassName('active');
    const item = this.#itemOf(event.target as Node | null);
    // the selected toggle button
    if (!item || (this.#isToggleButtons && item.id === this.#selectedId)) {
      this.#activeItem = undefined;
      return;
    }
    this.#activeItem = item;
    item.addClassName('active');
  }

  didUntouch(): void {
    // the touched item is selected on tap
    this.#activeItem?.removeClassName('active');
  }

  didTap(): void {
    const item = this.#activeItem;
    this.#activeItem = undefined;
    if (!item) return;
    this.selectedId = item.id;
    this.emit('itemselect', item.id);
  }

  /*****************************************************************
   *  Properties
   ****************************************************************/

  /**
   * The style: a class name (ToolBar.DEFAULT_STYLE…)
   */
  @InOut set style(v: string) {
    if (!isString(v)) return;
    if (this.#style) this.removeClassName(this.#style);
    this.#style = v;
    this.addClassName(v);
  }
  get style(): string {
    return this.#style;
  }

  /**
   * The buttons: [id, name, label] (the former buttons are removed)
   */
  @InOut set configuration(v: ToolBarButtonSpec[]) {
    if (!isArray(v)) return;
    for (const id of [...this.#items.keys()]) this.removeItem(id);
    for (const [id, name, label] of v) this.addButton(id, name, label);
  }
  get configuration(): ToolBarButtonSpec[] {
    return [...this.#items.values()]
      .filter((item): item is ToolBarButton => item instanceof ToolBarButton)
      .map(button => (button.label ? [button.id, button.name, button.label] : [button.id, button.name]));
  }

  /**
   * True (default) for toggle buttons (the selected item keeps the
   * 'select' class name), false for momentary buttons
   */
  @InOut set isToggleButtons(v: boolean) {
    this.#isToggleButtons = !!v;
    if (!this.#isToggleButtons && this.#selectedId) {
      this.#items.get(this.#selectedId)?.removeClassName('select');
    }
  }
  get isToggleButtons(): boolean {
    return this.#isToggleButtons;
  }

  /**
   * The id of the selected item
   */
  @InOut set selectedId(v: string | null) {
    const item = v === null ? undefined : this.#items.get(v);
    if (v !== null && !item) return;
    if (this.#selectedId) this.#items.get(this.#selectedId)?.removeClassName('select');
    this.#selectedId = v;
    if (item && this.#isToggleButtons) item.addClassName('select');
  }
  get selectedId(): string | null {
    return this.#selectedId;
  }

  /*****************************************************************
   *  The button icons (class names of the themes)
   ****************************************************************/

  static BUTTON_ADD = 'add';
  static BUTTON_ARROW_DOWN = 'arrow_down';
  static BUTTON_ARROW_LEFT = 'arrow_left';
  static BUTTON_ARROW_RIGHT = 'arrow_right';
  static BUTTON_ARROW_UP = 'arrow_up';
  static BUTTON_ATTACH = 'attach';
  static BUTTON_AUCTION = 'auction';
  static BUTTON_BELL_OFF = 'bell_off';
  static BUTTON_BELL = 'bell';
  static BUTTON_BLOG = 'blog';
  static BUTTON_BOOK_MARKED = 'book_marked';
  static BUTTON_BOOK = 'book';
  static BUTTON_BOOKMARK_ADD = 'bookmark_add';
  static BUTTON_BOOKMARK = 'bookmark';
  static BUTTON_BOX_FULL = 'box_full';
  static BUTTON_BOX_MAIL = 'box_mail';
  static BUTTON_BOX = 'box';
  static BUTTON_BRIGHTNESS = 'brightness';
  static BUTTON_BRUSH = 'brush';
  static BUTTON_BULB_OFF = 'bulb_off';
  static BUTTON_BULB_ON = 'bulb_on';
  static BUTTON_BUZZER = 'buzzer';
  static BUTTON_CALCULATOR = 'calculator';
  static BUTTON_CALENDAR = 'calendar';
  static BUTTON_CALL = 'call';
  static BUTTON_CANCEL = 'cancel';
  static BUTTON_CASE = 'case';
  static BUTTON_CHECKMARK = 'checkmark';
  static BUTTON_CIRCLE_ARROW_LEFT = 'circle_arrow_left';
  static BUTTON_CIRCLE_ARROW_RIGHT = 'circle_arrow_right';
  static BUTTON_COMMAND_LINE = 'command_line';
  static BUTTON_COMMENT_ADD = 'command_add';
  static BUTTON_COMMENT_DELETE = 'command_delete';
  static BUTTON_COMMENT_OK = 'command_ok';
  static BUTTON_COMPUTER_OFF = 'computer_off';
  static BUTTON_COMPUTER_ON = 'computer_on';
  static BUTTON_CONTRAST = 'contrast';
  static BUTTON_CONTROL_1 = 'controls_1';
  static BUTTON_CONTROL_2 = 'controls_2';
  static BUTTON_CONTROL_3 = 'controls_3';
  static BUTTON_CONTROL_4 = 'controls_4';
  static BUTTON_CONTROL_5 = 'controls_5';
  static BUTTON_CONTROL_6 = 'controls_6';
  static BUTTON_CONTROL_7 = 'controls_7';
  static BUTTON_CONTROL_8 = 'controls_8';
  static BUTTON_COPY = 'copy';
  static BUTTON_COURT = 'court';
  static BUTTON_CREDIT_CARD = 'credit_card';
  static BUTTON_CUT = 'cut';
  static BUTTON_DANGER = 'danger';
  static BUTTON_DELETE = 'delete';
  static BUTTON_DISK = 'disk';
  static BUTTON_DOCUMENT_BLANK = 'document_blank';
  static BUTTON_DOCUMENT = 'document';
  static BUTTON_DOLLAR = 'dollar';
  static BUTTON_DOWNLOAD = 'download';
  static BUTTON_ERROR = 'error';
  static BUTTON_FAVORITIES_ADD = 'favorities_add';
  static BUTTON_FAVORITIES_REMOVE = 'favorities_remove';
  static BUTTON_FAVORITIES = 'favorities';
  static BUTTON_FILM = 'film';
  static BUTTON_FILMING = 'filming';
  static BUTTON_FIRST_AID = 'first_aid';
  static BUTTON_FLAG_BIS = 'flag_1';
  static BUTTON_FLAG = 'flag';
  static BUTTON_FLASH_ARROW = 'flash_arrow';
  static BUTTON_FLASH = 'flash';
  static BUTTON_FOLDER_BOOKMARK = 'folder_bookmark';
  static BUTTON_FOLDER_GOTO = 'folder_goto';
  static BUTTON_FOLDER = 'folder';
  static BUTTON_FONT_CAPITAL = 'font_capital';
  static BUTTON_FONT_ITALIC = 'font_italic';
  static BUTTON_FONT_REGULAR = 'font_regular';
  static BUTTON_FONT_UNDERLINE = 'font_undeline';
  static BUTTON_FONT = 'font';
  static BUTTON_FONTS = 'fonts';
  static BUTTON_FORUM = 'forum';
  static BUTTON_FRAME = 'frame';
  static BUTTON_GRAPH_AREAS = 'graph_areas';
  static BUTTON_GRAPH_BARS_DOWN = 'graph_bars_down';
  static BUTTON_GRAPH_BARS_UP = 'graph_bars_up';
  static BUTTON_GRAPH_BARS = 'graph_bars';
  static BUTTON_GRAPH_DOWN = 'graph_down';
  static BUTTON_GRAPH_LINES = 'graph_lines';
  static BUTTON_GRAPH_UP = 'graph_up';
  static BUTTON_HAT = 'hat';
  static BUTTON_HELP = 'help';
  static BUTTON_HOME = 'home';
  static BUTTON_INFORMATION = 'information';
  static BUTTON_KEY = 'key';
  static BUTTON_KEYBOARD = 'keyboard';
  static BUTTON_LAPTOP = 'laptop';
  static BUTTON_LINK = 'links';
  static BUTTON_LIST_BULLETS = 'bullets';
  static BUTTON_LIST_NUMBERS = 'list_numbers';
  static BUTTON_LOCK = 'lock';
  static BUTTON_MAGNIFY_GLASS = 'magnify_glass';
  static BUTTON_MAIL = 'mail';
  static BUTTON_MANAGE = 'manage';
  static BUTTON_MEASURE = 'measure';
  static BUTTON_MEASURES = 'measures';
  static BUTTON_MIC_BIS = 'mic_bis';
  static BUTTON_MIC = 'mic';
  static BUTTON_MINUS = 'minus';
  static BUTTON_MUTE = 'mute';
  static BUTTON_PAINT = 'pain';
  static BUTTON_PAPER_PLANE = 'paper_plane';
  static BUTTON_PAPER_TRASH = 'paper_trash';
  static BUTTON_PAPERCLIO = 'paperclio';
  static BUTTON_PARAGRAPH = 'paragraph';
  static BUTTON_PENCIL = 'pencil';
  static BUTTON_PHOTO = 'photo';
  static BUTTON_PIECHART = '113';
  static BUTTON_POST = 'post';
  static BUTTON_PROFILE = 'profile';
  static BUTTON_REFRESH = 'refresh';
  static BUTTON_RESIZE = 'resize';
  static BUTTON_RSS = 'rss';
  static BUTTON_SAD_FACE = 'sade_face';
  static BUTTON_SAFE = 'safe';
  static BUTTON_SAVE = 'save';
  static BUTTON_SETTINGS = 'settings';
  static BUTTON_SHOPPING_BAG = 'shopping_bag';
  static BUTTON_SHOPPING_CART = 'shopping_cart';
  static BUTTON_SHOPPING_HEAVY = 'shopping_heavy';
  static BUTTON_SIM = 'sim';
  static BUTTON_SMILE_FACE = 'smile_face';
  static BUTTON_SORT_AZ = 'sort_az';
  static BUTTON_SORT_ZA = 'sort_za';
  static BUTTON_STAR = 'star';
  static BUTTON_STORAGE = 'storage';
  static BUTTON_SWITCH = 'switch';
  static BUTTON_TAG_ADD = 'tag_add';
  static BUTTON_TAG_CANCEL = 'tag_cancel';
  static BUTTON_TAG_DELETE = 'tag_delete';
  static BUTTON_TAG = 'tag';
  static BUTTON_TEXT_ALIGN_CENTER = 'text_align_center';
  static BUTTON_TEXT_ALIGN_JUSTIFY = 'text_align_justify';
  static BUTTON_TEXT_ALIGN_LEFT = 'text_align_left';
  static BUTTON_TEXT_ALIGN_RIGHT = 'text_align_right';
  static BUTTON_TIME = 'time';
  static BUTTON_TIMER = 'timer';
  static BUTTON_TRASH = 'trash';
  static BUTTON_TWG = 'twg';
  static BUTTON_UNLOCK = 'unlock';
  static BUTTON_UPLOAD = 'upload';
  static BUTTON_USER = 'user';
  static BUTTON_USERS = 'users';
  static BUTTON_VOLUME_DOWN = 'volume_down';
  static BUTTON_VOLUME_UP = 'volume_up';
  static BUTTON_VOLUME = 'volume';
  static BUTTON_WALLET = 'wallet';
  static BUTTON_WARNING = 'warning';
  static BUTTON_WIFI = 'wifi';
  static BUTTON_WINDOW_ERROR = 'window_error';
  static BUTTON_WINDOW_GLOBE = 'window_globe';
  static BUTTON_WINDOW_LOCK = 'window_lock';
  static BUTTON_WINDOW = 'window';
  static BUTTON_ZOOM_IN = 'zoom_in';
  static BUTTON_ZOOM_OUT = 'zoom_out';
}

export default ToolBar;
