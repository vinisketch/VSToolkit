/**
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
 *  The vs.ui.ToolBar class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ToolBar class implements a control for selecting buttons.
 *  The vs.ui.ToolBar class provides the ability for the user to customize the tab bar
 *  by reordering, removing, and adding items to the bar.
 *  <p>
 *  When a tabbar button is selected the tabbar send an event named
 *  'itemselect'.
 *  The event data contains the id of the selected button.
 *
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var bar = vs.ui.ToolBar ({id: "bar"}).init ();
 *
 *  bar.addButton (
 *    "right", 
 *    vs.ui.ToolBar.BUTTON_ARROW_RIGHT,
 *    "Right panel");
 *
 *  bar.addButton ("attach", vs.ui.ToolBar.BUTTON_ATTACH);
 *
 *  bar.addButton (
 *    "left",
 *    vs.ui.ToolBar.BUTTON_ARROW_LEFT,
 *    "Left panel");
 *
 *  bar.bind ("itemselect", this);
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function ToolBar (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ToolBar;
  
  this._items = {};
}

/**
 * Black style tab bar (defaut)
 * @name vs.ui.ToolBar.DEFAULT_STYLE
 * @const
 */
ToolBar.DEFAULT_STYLE = 'black_style';

/**
 * Black translucide style tab bar
 * @name vs.ui.ToolBar.BLACK_TRANSLUCIDE_STYLE
 * @const
 */
ToolBar.BLACK_TRANSLUCIDE_STYLE = 'black_translucide_style';

/**
 * Blue style tab bar
 * @name vs.ui.ToolBar.BLUE_STYLE
 * @const
 */
ToolBar.BLUE_STYLE = 'blue_style';

ToolBar.prototype = {
  
/********************************************************************
                  protected members declarations
********************************************************************/

  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _hide_animation: null,
  
  /**
   *  @protected
   *  @const
   *  @type vs.fx.Animation
   */
  _show_animation: null,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _style: ToolBar.DEFAULT_STYLE,

  /**
   * The configuration of the tab bar (list of button, type)
   * @private
   * @type {Array.<Array>}
   */
  _configuration: [],

  /**
   * The reference array on tabbar's items
   * @private
   * @type {object.<string>}
   */
  _items: null,
  
  /**
   *
   * @protected
   * @type {number}
   */
  _is_toggle_buttons: true,

  /**
   *
   * @private
   * @type {View}
   */
  __select_item: null,
  __active_item: null,

/********************************************************************
                general initialisation declarations
********************************************************************/
    
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    util.free (this._show_animation);
    util.free (this._hide_animation);

    this.removePointerRecognizer (this.recognizer);
    util.free (this.recognizer);

    View.prototype.destructor.call (this);
  },

    /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    View.prototype.initComponent.call (this);

    this._hide_animation = new vs.fx.Animation (['translateY', '44px']);
    this._show_animation = new vs.fx.Animation (['translateY', '0px']);

//     util.setElementStyle (this.view, {
//       left: '0px', top: 'auto', bottom: '0px', 
//       width: '100%', height: '44px'
//     });
//     
    this.style = this._style;

    this.recognizer = new TapRecognizer (this);
    this.addPointerRecognizer (this.recognizer);
  },
  
/********************************************************************
                  events management
********************************************************************/

  didTouch : function (comp, elem, e) {
    var item = e.target._comp_;
    if (!item) return;
    
    if (item === this.__select_item) return;
    
    this.__active_item = item;
    this.__active_item.addClassName ("active");
  },
  
  didUntouch : function (comp, elem, e) {
    if (!this.__active_item) return;
    
    this.__active_item.removeClassName ("active");
    this.__active_item = null;
  },
  
  didTap : function (nb_tap, comp, elem, e) {
    var item = e.target._comp_;
    if (!item) return;
    
    this.selectedId = item.id;
    this.outPropertyChange ();
  },
  
/********************************************************************
                  add / remove buttons
********************************************************************/

  /**
   *  Add a button to the ToolBar
   *
   * @name vs.ui.ToolBar#addButton
   * @function
   *
   * @param {string} id An unique identifier for the button. This id will be
   *                 send as event data if the button is pressed.
   * @param {string} name The identifier of the button to add.
   * @param {string} label An optional text to put under the button
   * @return {vs.ui.ToolBar.Button}
   */
  addButton : function (id, name, label)
  {
    if (this._items [id]) { return; }
    
    var button = new ToolBar.Button ({id: id});
    button.init ();
    if (label) { button.label = label; }
    button.name = name;
    
    this.add (button, 'children')
    
    this._items [id] = button;
    return button;
  },
  
  /**
   *  Add a generic vs.ui.ToolBar item to the ToolBar
   *
   * @name vs.ui.ToolBar#addItem
   * @function
   *
   * @param {vs.ui.ToolBar.item} obj the item to add.
   */
  addItem : function (item)
  {
    if (!item || this._items [item.id]) { return; }
    
    this.add (item, 'children')
    
    this._items [item.id] = item;
  },

  /**
   *  Remove an item from the ToolBar
   *
   * @name vs.ui.ToolBar#removeItem
   * @function
   *
   * @param {string} id the identifier for the item to remove.
   */
  removeItem : function (id)
  {
    var item = this._items [id];
    if (!item) { return; }
    
    try { this.remove (item); } catch (e) {if (e.stack) console.log (e.stack);}
    
    delete (this._items [id]);
  }
};
util.extendClass (ToolBar, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ToolBar, {
  'style': {
    /** 
     * Getter|Setter for the tab bar style
     * @name vs.ui.ToolBar#style 
     * @type String
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      if (this._style)
      {
        this.removeClassName (this._style);
      }
      this._style = v;
      this.addClassName (this._style);
    },
  
    /** 
     * @ignore
     * @return {String}
     */ 
    get : function ()
    {
      return this._style;
    }
  }, 
  'configuration': {
    /**
     * Set a vs.ui.ToolBar configuration
     * <p>
     * A configuration is an array of button specification.<br/>
     * Q button specification is a array of 2 or 3 values:
     * <ol>
     *   <li>The button id (a String)
     *   <li>The button type (a String).
     *       <br/>Ex: vs.ui.ToolBar.BUTTON_BLOG, vs.ui.ToolBar.BUTTON_ARROW_RIGHT
     *   <li> A optional label.
     * </ol>   
     * @name vs.ui.ToolBar#configuration 
     *
     * @type {Array.<Array>}
     */
    set : function (v)
    {
      if (!util.isArray (v)) { return; }
      
      var id, i, spec;
      
      this._configuration = v;
      
      // 1) remove all previous buttons
      for (id in this._items)
      {
        this.removeItem (id);
      }    
  
      // 2) add new buttons
      for (i = 0; i < v.length; i++)
      {
        spec = v [i];
        this.addButton (spec[0], spec[1], spec[2]);
      }    
    }
  },
  'isToggleButtons': {
    /** 
     * Getter|Setter to configure the buttons as toggle buttons or not.
     * By default ToolBar are toggle buttons
     * @name vs.ui.ToolBar#isToggleButtons 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v) this._is_toggle_buttons = true;
      else this._is_toggle_buttons = false;
    },
  
    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._is_toggle_buttons;
    }
  },
  'selectedId': {
    /** 
     * Getter|Setter for select one of button
     * @name vs.ui.ToolBar#selectedId 
     * @type number
     */ 
    set : function (v)
    {
      var item = this._items [v];
      if (!item) return;
      
      if (this.__select_item === item) return;

      if (this.__select_item) {
        this.__select_item.removeClassName ("select");
      }
      this.__select_item = item;
      item.addClassName ("select");
     
      this.propagate ("itemselect", v);
      
      this._selected_id = v;
    },
  
    /** 
     * @ignore
     * @return {number}
     */ 
    get : function ()
    {
      return this._selected_id;
    }
  }
});

/**
 *  The vs.ui.ToolBar.Text class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ToolBar.Text class implements a text control for the vs.ui.ToolBar.
 *  It provides the ability for the user to customize the tab bar with the
 *  you own text which is selectable.
 *
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'bar';
 *
 *  var bar = vs.ui.ToolBar (config);
 *  bar.init ();
 *
 *  var label = vs.ui.ToolBar.Text ({id:"info"});
 *  label.init ();
 *  label.text = "Information";
 *  bar.addItem (label);
 *
 *
 *  bar.bind ('itemselect', this);
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar.Text 
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.Text.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
ToolBar.Text = function (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ToolBar.Text;
}

ToolBar.Text.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/

  /**
   *
   * @private
   * @type {String}
   */
  _text: "",
  
  /*****************************************************************
  *               init methods
  ****************************************************************/

  /**
   * Object default init. <p>
   * Must be call after the new.
   * @ignore
   * @name vs.ui.ToolBar.Text#initComponent
   */
  initComponent : function ()
  {
    if (!this.__config__) { this.__config__ = {}; }
    this.__config__.id = this.id;
    if (!this.__config__.node)
    {
      this.__config__.node = document.createElement ('div');
      this.__config__.node.className = 'vs_ui_toolbar_text';
    }

    View.prototype.initComponent.call (this);

    this._text_view = document.createElement ('div');
    this._text_view.className = "text_view";
    this.view.appendChild (this._text_view);
  }
};
util.extendClass (ToolBar.Text, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (ToolBar.Text, "text", {

  /** 
   * The text of the item
   * @name vs.ui.ToolBar.Text#text 
   * @type String
   */ 
  set : function (v)
  {
    if (v === null || typeof (v) === "undefined") { v = ''; }
    else if (util.isNumber (v)) { v = '' + v; }
    else if (!util.isString (v))
    {
      if (!v.toString) { return; }
      v = v.toString ();
    }
    
    this._text = v;
    if (this._text_view)
    {
      util.setElementInnerText (this._text_view, this._text);
    }
  },

  /** 
   * @ignore
   * @return {string}
   */ 
  get : function ()
  {
    return this._text;
  }
});

/**
 *  The vs.ui.ToolBar.Button class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.ToolBar.Button class implements a button control for the vs.ui.ToolBar.
 *  It provides the ability for the user to customize the tab bar with the
 *  you own button image.
 *
 *  @example
 *  // Simple example: (the button will have the platform skin)
 *  var config = {}
 *  var config.id = 'bar';
 *
 *  var bar = vs.ui.ToolBar (config);
 *  bar.init ();
 *
 *  var button = vs.ui.ToolBar.Button ({id:"back"});
 *  button.init ();
 *  button.setImage ("resources/images/back_icon.png);
 *  bar.addItem (button);
 *
 *
 *  bar.bind ('itemselect', this);
 *
 *  @author David Thevenin
 *
 * @name vs.ui.ToolBar.Button
 *
 *  @constructor
 *   Creates a new vs.ui.ToolBar.Button.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
ToolBar.Button = function (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = ToolBar.Button;
}

ToolBar.Button.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/

  /**
   *
   * @protected
   * @type {String}
   */
  _name: "",
  
  /**
   *
   * @protected
   * @type {String}
   */
  _label: "",
  
  /*****************************************************************
   *               General methods
   ****************************************************************/
   
  /**
   * Object default init. <p>
   * Must be call after the new.
   * @ignore
   * @function
   * @name vs.ui.ToolBar.Text#initComponent
   */
  initComponent : function ()
  {
    if (!this.__config__) { this.__config__ = {}; }
    this.__config__.id = this.id;
    if (!this.__config__.node)
    {
      this.__config__.node = document.createElement ('div');
      this.__config__.node.className = 'vs_ui_toolbar_button';
    }

    View.prototype.initComponent.call (this);
  },
  
  /**
   * Allows to set a background image for the ToolBar button
   *
   * @name vs.ui.ToolBar.Button#setImage
   * @function
   *
   * @param {String} button image path
   */
  setImage : function (path)
  {
    this.view.style.backgroundImage = 'url(' + path + ')';
  }
};
util.extendClass (ToolBar.Button, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (ToolBar.Button, {
  "name": {
    /** 
     * The name of the button from the list (vs.ui.ToolBar.BUTTON_ADD,...)
     * If you want use you own button with your own image, you can set it
     * using "setImage" method.
     *
     * @name vs.ui.ToolBar.Button#name 
     *
     * @type String
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._name = v;
      this.addClassName (this._name);
    },

    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._name;
    }
  },

  "label": {
    /** 
     * @name vs.ui.ToolBar.Button#label 
     *
     * @type String
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._label = v;
      
      util.setElementInnerText (this.view, v);
      if (v) {
        this.setStyle ("background-position", "center 0px");
      }
      else {
        this.setStyle ("background-position", "center");
      }
    },

    /** 
     * @ignore
     * @return {string}
     */ 
    get : function ()
    {
      return this._label;
    }
  }
});


/** @name vs.ui.ToolBar.BUTTON_ADD */
ToolBar.BUTTON_ADD = 'add';
/** @name vs.ui.ToolBar.BUTTON_ARROW_DOWN */
ToolBar.BUTTON_ARROW_DOWN = 'arrow_down';
/** @name vs.ui.ToolBar.BUTTON_ARROW_LEFT */
ToolBar.BUTTON_ARROW_LEFT = 'arrow_left';
/** @name vs.ui.ToolBar.BUTTON_ARROW_RIGHT */
ToolBar.BUTTON_ARROW_RIGHT = 'arrow_right';
/** @name vs.ui.ToolBar.BUTTON_ARROW_UP */
ToolBar.BUTTON_ARROW_UP = 'arrow_up';
/** @name vs.ui.ToolBar.BUTTON_ATTACH */
ToolBar.BUTTON_ATTACH = 'attach';
/** @name vs.ui.ToolBar.BUTTON_AUCTION */
ToolBar.BUTTON_AUCTION = 'auction';
/** @name vs.ui.ToolBar.BUTTON_BELL_OFF */
ToolBar.BUTTON_BELL_OFF = 'bell_off';
/** @name vs.ui.ToolBar.BUTTON_BELL */
ToolBar.BUTTON_BELL = 'bell';
/** @name vs.ui.ToolBar.BUTTON_BLOG */
ToolBar.BUTTON_BLOG = 'blog';
/** @name vs.ui.ToolBar.BUTTON_BOOK_MARKED */
ToolBar.BUTTON_BOOK_MARKED = 'book_marked';
/** @name vs.ui.ToolBar.BUTTON_BOOK */
ToolBar.BUTTON_BOOK = 'book';
/** @name vs.ui.ToolBar.BUTTON_BOOKMARK_ADD */
ToolBar.BUTTON_BOOKMARK_ADD = 'bookmark_add';
/** @name vs.ui.ToolBar.BUTTON_BOORMARK */
ToolBar.BUTTON_BOORMARK = 'bookmark';
/** @name vs.ui.ToolBar.BUTTON_BOX_FULL */
ToolBar.BUTTON_BOX_FULL = 'box_full';
/** @name vs.ui.ToolBar.BUTTON_BOX_MAIL */
ToolBar.BUTTON_BOX_MAIL = 'box_mail';
/** @name vs.ui.ToolBar.BUTTON_BOX */
ToolBar.BUTTON_BOX = 'box';
/** @name vs.ui.ToolBar.BUTTON_BRIGHTNESS */
ToolBar.BUTTON_BRIGHTNESS = 'brightness';
/** @name vs.ui.ToolBar.BUTTON_BRUSH */
ToolBar.BUTTON_BRUSH = 'brush';
/** @name vs.ui.ToolBar.BUTTON_BULB_OFF */
ToolBar.BUTTON_BULB_OFF = 'bulb_off';
/** @name vs.ui.ToolBar.BUTTON_BULB_ON */
ToolBar.BUTTON_BULB_ON = 'bulb_on';
/** @name vs.ui.ToolBar.BUTTON_BUZZER */
ToolBar.BUTTON_BUZZER = 'buzzer';
/** @name vs.ui.ToolBar.BUTTON_CALCULATOR */
ToolBar.BUTTON_CALCULATOR = 'calculator';
/** @name vs.ui.ToolBar.BUTTON_CALENDAR */
ToolBar.BUTTON_CALENDAR = 'calendar';
/** @name vs.ui.ToolBar.BUTTON_CALL */
ToolBar.BUTTON_CALL = 'call';
/** @name vs.ui.ToolBar.BUTTON_CANCEL */
ToolBar.BUTTON_CANCEL = 'cancel';
/** @name vs.ui.ToolBar.BUTTON_CASE */
ToolBar.BUTTON_CASE = 'case';
/** @name vs.ui.ToolBar.BUTTON_CHECKMARK */
ToolBar.BUTTON_CHECKMARK = 'checkmark';
/** @name vs.ui.ToolBar.BUTTON_CIRCLE_ARROW_LEFT */
ToolBar.BUTTON_CIRCLE_ARROW_LEFT = 'circle_arrow_left';
/** @name vs.ui.ToolBar.BUTTON_CIRCLE_ARROW_RIGHT */
ToolBar.BUTTON_CIRCLE_ARROW_RIGHT = 'circle_arrow_right';
/** @name vs.ui.ToolBar.BUTTON_COMMAND_LINE */
ToolBar.BUTTON_COMMAND_LINE = 'command_line';
/** @name vs.ui.ToolBar.BUTTON_COMMENT_ADD */
ToolBar.BUTTON_COMMENT_ADD = 'command_add';
/** @name vs.ui.ToolBar.BUTTON_COMMENT_DELETE */
ToolBar.BUTTON_COMMENT_DELETE = 'command_delete';
/** @name vs.ui.ToolBar.BUTTON_COMMENT_OK */
ToolBar.BUTTON_COMMENT_OK = 'command_ok';
/** @name vs.ui.ToolBar.BUTTON_COMPUTER_OFF */
ToolBar.BUTTON_COMPUTER_OFF = 'computer_off';
/** @name vs.ui.ToolBar.BUTTON_COMPUTER_ON */
ToolBar.BUTTON_COMPUTER_ON = 'computer_on';
/** @name vs.ui.ToolBar.BUTTON_CONSTRAST */
ToolBar.BUTTON_CONSTRAST = 'contrast';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_1 */
ToolBar.BUTTON_CONTROL_1 = 'controls_1';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_2 */
ToolBar.BUTTON_CONTROL_2 = 'controls_2';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_3 */
ToolBar.BUTTON_CONTROL_3 = 'controls_3';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_4 */
ToolBar.BUTTON_CONTROL_4 = 'controls_4';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_5 */
ToolBar.BUTTON_CONTROL_5 = 'controls_5';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_6 */
ToolBar.BUTTON_CONTROL_6 = 'controls_6';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_7 */
ToolBar.BUTTON_CONTROL_7 = 'controls_7';
/** @name vs.ui.ToolBar.BUTTON_CONTROL_8 */
ToolBar.BUTTON_CONTROL_8 = 'controls_8';
/** @name vs.ui.ToolBar.BUTTON_COPY */
ToolBar.BUTTON_COPY = 'copy';
/** @name vs.ui.ToolBar.BUTTON_COURT */
ToolBar.BUTTON_COURT = 'court';
/** @name vs.ui.ToolBar.BUTTON_CREDIT_CARD */
ToolBar.BUTTON_CREDIT_CARD = 'credit_card';
/** @name vs.ui.ToolBar.BUTTON_CUT */
ToolBar.BUTTON_CUT = 'cut';
/** @name vs.ui.ToolBar.BUTTON_DANGER */
ToolBar.BUTTON_DANGER = 'danger';
/** @name vs.ui.ToolBar.BUTTON_DELETE */
ToolBar.BUTTON_DELETE = 'delete';
/** @name vs.ui.ToolBar.BUTTON_DISK */
ToolBar.BUTTON_DISK = 'disk';
/** @name vs.ui.ToolBar.BUTTON_DOCUMENT_BLANK */
ToolBar.BUTTON_DOCUMENT_BLANK = 'document_blank';
/** @name vs.ui.ToolBar.BUTTON_DOCUMENT */
ToolBar.BUTTON_DOCUMENT = 'document';
/** @name vs.ui.ToolBar.BUTTON_DOLLAR */
ToolBar.BUTTON_DOLLAR = 'dollar';
/** @name vs.ui.ToolBar.BUTTON_DOWNLAOD */
ToolBar.BUTTON_DOWNLAOD = 'download';
/** @name vs.ui.ToolBar.BUTTON_ERROR */
ToolBar.BUTTON_ERROR = 'error';
/** @name vs.ui.ToolBar.BUTTON_FAVORITIES_ADD */
ToolBar.BUTTON_FAVORITIES_ADD = 'favorities_add';
/** @name vs.ui.ToolBar.BUTTON_FAVORITIES_REMOVE */
ToolBar.BUTTON_FAVORITIES_REMOVE = 'favorities_remove';
/** @name vs.ui.ToolBar.BUTTON_FAVORITIES */
ToolBar.BUTTON_FAVORITIES = 'favorities';
/** @name vs.ui.ToolBar.BUTTON_FILM */
ToolBar.BUTTON_FILM = 'film';
/** @name vs.ui.ToolBar.BUTTON_FILMING */
ToolBar.BUTTON_FILMING = 'filming';
/** @name vs.ui.ToolBar.BUTTON_FIRST_AID */
ToolBar.BUTTON_FIRST_AID = 'first_aid';
/** @name vs.ui.ToolBar.BUTTON_FLAG_BIS */
ToolBar.BUTTON_FLAG_BIS = 'flag_1';
/** @name vs.ui.ToolBar.BUTTON_FLAG */
ToolBar.BUTTON_FLAG = 'flag';
/** @name vs.ui.ToolBar.BUTTON_FLASH_ARROW */
ToolBar.BUTTON_FLASH_ARROW = 'flash_arrow';
/** @name vs.ui.ToolBar.BUTTON_FLASH */
ToolBar.BUTTON_FLASH = 'flash';
/** @name vs.ui.ToolBar.BUTTON_FOLDER_BOOKMARCK */
ToolBar.BUTTON_FOLDER_BOOKMARCK = 'folder_bookmark';
/** @name vs.ui.ToolBar.BUTTON_FOLDER_GOTO */
ToolBar.BUTTON_FOLDER_GOTO = 'folder_goto';
/** @name vs.ui.ToolBar.BUTTON_FOLDER */
ToolBar.BUTTON_FOLDER = 'folder';
/** @name vs.ui.ToolBar.BUTTON_FONT_CAPITAL */
ToolBar.BUTTON_FONT_CAPITAL = 'font_capital';
/** @name vs.ui.ToolBar.BUTTON_FONT_ITALIC */
ToolBar.BUTTON_FONT_ITALIC = 'font_italic';
/** @name vs.ui.ToolBar.BUTTON_FONT_REGULAR */
ToolBar.BUTTON_FONT_REGULAR = 'font_regular';
/** @name vs.ui.ToolBar.BUTTON_FONT_UNDERLINE */
ToolBar.BUTTON_FONT_UNDERLINE = 'font_undeline';
/** @name vs.ui.ToolBar.BUTTON_FONT */
ToolBar.BUTTON_FONT = 'font';
/** @name vs.ui.ToolBar.BUTTON_FONTS */
ToolBar.BUTTON_FONTS = 'fonts';
/** @name vs.ui.ToolBar.BUTTON_FORUM */
ToolBar.BUTTON_FORUM = 'forum';
/** @name vs.ui.ToolBar.BUTTON_FRAME */
ToolBar.BUTTON_FRAME = 'frame';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_AREAS */
ToolBar.BUTTON_GRAPH_AREAS = 'graph_areas';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_BARS_DOWN */
ToolBar.BUTTON_GRAPH_BARS_DOWN = 'graph_bars_down';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_BARS_UP */
ToolBar.BUTTON_GRAPH_BARS_UP = 'graph_bars_up';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_BARS */
ToolBar.BUTTON_GRAPH_BARS = 'graph_bars';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_DOWN */
ToolBar.BUTTON_GRAPH_DOWN = 'graph_down';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_LINES */
ToolBar.BUTTON_GRAPH_LINES = 'graph_lines';
/** @name vs.ui.ToolBar.BUTTON_GRAPH_UP */
ToolBar.BUTTON_GRAPH_UP = 'graph_up';
/** @name vs.ui.ToolBar.BUTTON_HAT */
ToolBar.BUTTON_HAT = 'hat';
/** @name vs.ui.ToolBar.BUTTON_HELP */
ToolBar.BUTTON_HELP = 'help';
/** @name vs.ui.ToolBar.BUTTON_HOME */
ToolBar.BUTTON_HOME = 'home';
/** @name vs.ui.ToolBar.BUTTON_INFORMATION */
ToolBar.BUTTON_INFORMATION = 'information';
/** @name vs.ui.ToolBar.BUTTON_KEY */
ToolBar.BUTTON_KEY = 'key';
/** @name vs.ui.ToolBar.BUTTON_KEYBOARD */
ToolBar.BUTTON_KEYBOARD = 'keyboard';
/** @name vs.ui.ToolBar.BUTTON_LAPTOP */
ToolBar.BUTTON_LAPTOP = 'laptop';
/** @name vs.ui.ToolBar.BUTTON_LINK */
ToolBar.BUTTON_LINK = 'links';
/** @name vs.ui.ToolBar.BUTTON_LIST_BULLETS */
ToolBar.BUTTON_LIST_BULLETS = 'bullets';
/** @name vs.ui.ToolBar.BUTTON_LIST_NUMBERS */
ToolBar.BUTTON_LIST_NUMBERS = 'list_numbers';
/** @name vs.ui.ToolBar.BUTTON_LOCK */
ToolBar.BUTTON_LOCK = 'lock';
/** @name vs.ui.ToolBar.BUTTON_MAGNIFY_GLASS */
ToolBar.BUTTON_MAGNIFY_GLASS = 'magnify_glass';
/** @name vs.ui.ToolBar.BUTTON_MAIL */
ToolBar.BUTTON_MAIL = 'mail';
/** @name vs.ui.ToolBar.BUTTON_MANAGE */
ToolBar.BUTTON_MANAGE = 'manage';
/** @name vs.ui.ToolBar.BUTTON_MEASURE */
ToolBar.BUTTON_MEASURE = 'measure';
/** @name vs.ui.ToolBar.BUTTON_MEASURES */
ToolBar.BUTTON_MEASURES = 'measures';
/** @name vs.ui.ToolBar.BUTTON_MIC_BIS */
ToolBar.BUTTON_MIC_BIS = 'mic_bis';
/** @name vs.ui.ToolBar.BUTTON_MIC */
ToolBar.BUTTON_MIC = 'mic';
/** @name vs.ui.ToolBar.BUTTON_MINUS */
ToolBar.BUTTON_MINUS = 'minus';
/** @name vs.ui.ToolBar.BUTTON_MUTE */
ToolBar.BUTTON_MUTE = 'mute';
/** @name vs.ui.ToolBar.BUTTON_PAINT */
ToolBar.BUTTON_PAINT = 'pain';
/** @name vs.ui.ToolBar.BUTTON_PAPER_PLANE */
ToolBar.BUTTON_PAPER_PLANE = 'paper_plane';
/** @name vs.ui.ToolBar.BUTTON_PAPER_TRASH */
ToolBar.BUTTON_PAPER_TRASH = 'paper_trash';
/** @name vs.ui.ToolBar.BUTTON_PAPERCLIO */
ToolBar.BUTTON_PAPERCLIO = 'paperclio';
/** @name vs.ui.ToolBar.BUTTON_PARAGRAPH */
ToolBar.BUTTON_PARAGRAPH = 'paragraph';
/** @name vs.ui.ToolBar.BUTTON_PENCIL */
ToolBar.BUTTON_PENCIL = 'pencil';
/** @name vs.ui.ToolBar.BUTTON_PHOTO */
ToolBar.BUTTON_PHOTO = 'photo';
/** @name vs.ui.ToolBar.BUTTON_PIECHART */
ToolBar.BUTTON_PIECHART = '113';
/** @name vs.ui.ToolBar.BUTTON_POST */
ToolBar.BUTTON_POST = 'post';
/** @name vs.ui.ToolBar.BUTTON_PROFILE */
ToolBar.BUTTON_PROFILE = 'profile';
/** @name vs.ui.ToolBar.BUTTON_REFRESH */
ToolBar.BUTTON_REFRESH = 'refresh';
/** @name vs.ui.ToolBar.BUTTON_RESIZE */
ToolBar.BUTTON_RESIZE = 'resize';
/** @name vs.ui.ToolBar.BUTTON_RSS  */
ToolBar.BUTTON_RSS = 'rss';
/** @name vs.ui.ToolBar.BUTTON_SAD_FACE */
ToolBar.BUTTON_SAD_FACE = 'sade_face';
/** @name vs.ui.ToolBar.BUTTON_SAFE */
ToolBar.BUTTON_SAFE = 'safe';
/** @name vs.ui.ToolBar.BUTTON_SAVE */
ToolBar.BUTTON_SAVE = 'save';
/** @name vs.ui.ToolBar.BUTTON_SETTINGS */
ToolBar.BUTTON_SETTINGS = 'settings';
/** @name vs.ui.ToolBar.SHOPPING_BAG */
ToolBar.SHOPPING_BAG = 'shopping_bag';
/** @name vs.ui.ToolBar.SHOPPING_CART */
ToolBar.SHOPPING_CART = 'shopping_cart';
/** @name vs.ui.ToolBar.SHOPPING_HEAVY */
ToolBar.SHOPPING_HEAVY = 'shopping_heavy';
/** @name vs.ui.ToolBar.SIM */
ToolBar.SIM = 'sim';
/** @name vs.ui.ToolBar.SMILE_FACE */
ToolBar.SMILE_FACE = 'smile_face';
/** @name vs.ui.ToolBar.SORT_AZ */
ToolBar.SORT_AZ = 'sort_az';
/** @name vs.ui.ToolBar.SORT_ZA */
ToolBar.SORT_ZA = 'sort_za';
/** @name vs.ui.ToolBar.STAR */
ToolBar.STAR = 'star';
/** @name vs.ui.ToolBar.STORAGE */
ToolBar.STORAGE = 'storage';
/** @name vs.ui.ToolBar.SWITCH */
ToolBar.SWITCH = 'switch';
/** @name vs.ui.ToolBar.TAG_ADD */
ToolBar.TAG_ADD = 'tag_add';
/** @name vs.ui.ToolBar.TAG_CANCEL */
ToolBar.TAG_CANCEL = 'tag_cancel';
/** @name vs.ui.ToolBar.TAG_DELETE */
ToolBar.TAG_DELETE = 'tag_delete';
/** @name vs.ui.ToolBar.TAG */
ToolBar.TAG = 'tag';
/** @name vs.ui.ToolBar.TEXT_ALIGN_CENTER */
ToolBar.TEXT_ALIGN_CENTER = 'text_align_center';
/** @name vs.ui.ToolBar.TEXT_ALIGN_JUSTIFY */
ToolBar.TEXT_ALIGN_JUSTIFY = 'text_align_justify';
/** @name vs.ui.ToolBar.TEXT_ALIGN_LEFT */
ToolBar.TEXT_ALIGN_LEFT = 'text_align_left';
/** @name vs.ui.ToolBar.TEXT_ALIGN_RIGHT */
ToolBar.TEXT_ALIGN_RIGHT = 'text_align_right';
/** @name vs.ui.ToolBar.TIME */
ToolBar.TIME = 'time';
/** @name vs.ui.ToolBar.TIMER */
ToolBar.TIMER = 'timer';
/** @name vs.ui.ToolBar.TRASH */
ToolBar.TRASH = 'trash';
/** @name vs.ui.ToolBar.TWG */
ToolBar.TWG = 'twg';
/** @name vs.ui.ToolBar.UNLOCK */
ToolBar.UNLOCK = 'unlock';
/** @name vs.ui.ToolBar.UPLOAD */
ToolBar.UPLOAD = 'upload';
/** @name vs.ui.ToolBar.USER */
ToolBar.USER = 'user';
/** @name vs.ui.ToolBar.USERS */
ToolBar.USERS = 'users';
/** @name vs.ui.ToolBar.VOLUME_DOWN */
ToolBar.VOLUME_DOWN = 'volume_down';
/** @name vs.ui.ToolBar.VOLUME_UP */
ToolBar.VOLUME_UP = 'volume_up';
/** @name vs.ui.ToolBar.VOLUME */
ToolBar.VOLUME = 'volume';
/** @name vs.ui.ToolBar.WALLET */
ToolBar.WALLET = 'wallet';
/** @name vs.ui.ToolBar.WARNING */
ToolBar.WARNING = 'warning';
/** @name vs.ui.ToolBar.WIFI */
ToolBar.WIFI = 'wifi';
/** @name vs.ui.ToolBar.WINDOW_ERROR */
ToolBar.WINDOW_ERROR = 'window_error';
/** @name vs.ui.ToolBar.WINDOW_GLOBE */
ToolBar.WINDOW_GLOBE = 'window_globe';
/** @name vs.ui.ToolBar.WINDOW_LOCK */
ToolBar.WINDOW_LOCK = 'window_lock';
/** @name vs.ui.ToolBar.WINDOW */
ToolBar.WINDOW = 'window';
/** @name vs.ui.ToolBar.ZOOM_IN */
ToolBar.ZOOM_IN = 'zoom_in';
/** @name vs.ui.ToolBar.ZOMM_OUT */
ToolBar.ZOMM_OUT = 'zoom_out';

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.ToolBar = ToolBar;
