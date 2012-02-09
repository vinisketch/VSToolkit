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
 *  The vs.ui.PopOver class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.PopOver view allows you to present information temporarily on top of
 *  your existing views. This view should not be draw over the entire screen.
 *  <p/>
 *  To display properly (with the arrow) the popover you have to use the method 
 *  how" with 2 following parameters:
 *  <ul>
 *    <li/>The coordinate [x, y] on screen, specify the point
 *         which is pointed by the popover
 *    <li/>The popover position related the to first parameter
 *           (ABOVE, BELOW, RIGHT, LEFT). 
 *  </ul>
 * 
 *  The popover is composed of tree views.
 *  <ul>
 *    <li/>The main subView (vs.ui.View). This is the main view in which you can
 *         add any widgets you want to present. The insertion peg is name
 *         'children'. This view should presents information associate to the
 *         user task. <br/>For adding view, you should use the method "add" of the 
 *         popover
 *    <li/>The second and third views are the header and footer views. They are
 *         deactivated by default. These views are usefull to presents 
 *         information related to navigation, for instance navigation buttons,
 *         cancel/validation button, etc. 
 *  </ul>
 *
 * @example
 *   // PopOver creation
 *   var popOver = new vs.ui.PopOver ();
 *   popOver.init ();
 *
 *   // PopOver main view construction
 *   var list = new vs.ui.List ();
 *   list.init ();
 *   list.data = data;
 *   popOver.add (list, 'children');
 *
 *   // PopOver footer view activation and init
 *   popOver.hasFooter = true;
 *   var cancelButton = new vs.ui.Button ();
 *   cancelButton.init ();
 *   cancelButton.text = "Cancel";
 *   popOver.add (cancelButton, 'footer');
 *
 *   // PopOver draw
 *   popOver.show ([300, 100], vs.ui.PopOver.RIGHT);
 *
 *  @author David Thevenin
 * @name vs.ui.PopOver
 *
 *  @constructor
 *   Creates a new vs.ui.PopOver.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
function PopOver (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = PopOver;
}

/**
 * The popover is positioned below the reference point
 * @name vs.ui.PopOver.BELOW
 * @const
 */
PopOver.BELOW = 0;

/**
 * The popover is positioned above the reference point
 * @name vs.ui.PopOver.ABOVE
 * @const
 */
PopOver.ABOVE = 1;

/**
 * The popover is positioned at left of the reference point
 * @name vs.ui.PopOver.LEFT
 * @const
 */
PopOver.LEFT = 2;

/**
 * The popover is positioned at right of the reference point
 * @name vs.ui.PopOver.RIGHT
 * @const
 */
PopOver.RIGHT = 3;

PopOver.prototype = {
  
  /*****************************************************************
   *               public members
   ****************************************************************/
   
  /*****************************************************************
   *               private/protected members
   ****************************************************************/
   
  /**
   *
   * @protected
   * @type {Array}
   */
  _point_position: null,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _has_footer: false,

  /**
   *
   * @protected
   * @type {boolean}
   */
  _has_header: false,

  /*****************************************************************
   *               init methods
   ****************************************************************/
   
  /**
   * Object default init. <p>
   * Must be call after the new.
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this._arrow = this.view.querySelector ('.vs_ui_popover >.arrow');
    
    this.__show_clb = this._endShowConfiguration;
  },
        
  /*****************************************************************
   *               General methods
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  _endShowConfiguration : function ()
  {
    var envlop = {}, delta, endShowConfiguration, size = this.size,
      max_y = window.innerHeight, max_x = window.innerWidth, pos;
    
    if (typeof this.__direction !== "undefined" && this._point_position)
    {
      envlop.x = this._point_position [0] - (size [0] /2);
      envlop.y = this._point_position [1] - (size [1] /2);
      envlop.width = size [0];
      envlop.height = size [1];
      
      if (this.__direction !== PopOver.BELOW &&
          this.__direction !== PopOver.ABOVE &&
          this.__direction !== PopOver.RIGHT &&
          this.__direction !== PopOver.LEFT)
      {
        if (this._point_position [0] > max_x /2)
        { this.__direction = PopOver.RIGHT; }
        else
        { this.__direction = PopOver.LEFT; }
        
        if (this._point_position [1] + envlop.height + 30 < max_y)
        { this.__direction = PopOver.BELOW; }
        else if (this._point_position [1] - envlop.height - 30 > 0)
        { this.__direction = PopOver.ABOVE; }
      }
      
      switch (this.__direction)
      {
        case PopOver.BELOW:
          envlop.y = envlop.y + (size [1] /2) + 15;
          if (envlop.x < 5) { envlop.x = 5; }
          if (envlop.x + envlop.width > max_x)
          { envlop.x = max_x - envlop.width - 5; }
          
          this._arrow.className = "arrow top";
          delta = this._point_position [0] - envlop.x - 15 - 8;
          this._arrow.style.left = "5px";
          this._arrow.style.right = "5px";
          this._arrow.style["-webkit-mask-position-x"] = delta + "px";
          this._arrow.style["-webkit-mask-position-y"] = "0px";
        break;
      
        case PopOver.ABOVE:
          envlop.y = envlop.y - (size [1] /2) - 15;
          if (envlop.x < 5) { envlop.x = 5; }
          if (envlop.x + envlop.width > max_x)
          { envlop.x = max_x - envlop.width - 5; }
          
          this._arrow.className = "arrow bottom"
          delta = this._point_position [0] - envlop.x - 15 - 8;
          this._arrow.style.left = "5px";
          this._arrow.style.right = "5px";
          this._arrow.style["-webkit-mask-position-x"] = delta + "px";
          this._arrow.style["-webkit-mask-position-y"] = "0px";
        break;
          
        case PopOver.RIGHT:
          envlop.x = envlop.x - (size [0] /2) - 15;
          if (envlop.y < 5) { envlop.y = 5; }
          if (envlop.y + envlop.height > max_y - 20)
          { envlop.y = max_y - envlop.height - 20; }
          
          this._arrow.className = "arrow right"
          delta = envlop.height - (this._point_position [1] - envlop.y + 15) - 2;
          this._arrow.style.left = "auto";
          this._arrow.style.right = "-13px";
          this._arrow.style["-webkit-mask-position-x"] = "0px";
          this._arrow.style["-webkit-mask-position-y"] = delta + "px";
        break;
      
        case PopOver.LEFT:
          envlop.x = envlop.x + (size [0] /2) + 15;
          if (envlop.y < 5) { envlop.y = 5; }
          if (envlop.y + envlop.height > max_y - 20)
          { envlop.y = max_y - envlop.height - 20; }
          
          this._arrow.className = "arrow left"
          delta = this._point_position [1] - envlop.y - 15 - 2;
          this._arrow.style.left = "-13px";
          this._arrow.style.right = "auto";
          this._arrow.style["-webkit-mask-position-x"] = "0px";
          this._arrow.style["-webkit-mask-position-y"] = delta + "px";
        break;
      }
      
      pos = util.getElementAbsolutePosition (this.view.parentElement);
      if (pos)
      {
        this.position = [envlop.x - pos.x, envlop.y - pos.y];
      }
      else
      {
        this.position = [envlop.x, envlop.y];
      }
      this.size = [envlop.width, envlop.height];
    }
    
    // force redraw !!!! grrrr !!!!
    this.redraw ();
  },
 
 /** 
   *  Shows and positions the popover according a given coordinate.
   *  <p/>
   *  The position is defined by a coordinate and position of the popover
   *  related to the coordinate. can be vs.ui.PopOver.ABOVE, 
   *  vs.ui.PopOver.BELOW, vs.ui.PopOver.RIGHT, vs.ui.PopOver.LEFT
   * 
   * @name vs.ui.PopOver#show
   * @function
   *
   * @param coordinate [Array] the coordinate of screen for the popover position
   * @param position [number] the position of the popover related to the
   *     coordinate. 
   */ 
  show : function (pos, direction)
  {
    if (!this.view || this._visible) { return; }
    
    if (pos && util.isArray (pos) && pos.length === 2 &&
      util.isNumber (pos[0]) && util.isNumber(pos[1]))
    {
      this._point_position = pos.slice ();;
    }
    else
    {
      this._point_position = null;
    }

    this.__direction = direction;

    this.view.style.setProperty ("display", 'block');
    this.__view_display = undefined;

    if (this._show_animation)
    {
      this._show_animation.process (this, this._show_object, this);
    }
    else
    {
      this._show_object ();
    }
    
    document.addEventListener (core.POINTER_START, this, true); 
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent : function (e)
  {
    if (this.childOf (e.target, this.view))
    { return; }
    
    e.preventDefault ();
    e.stopPropagation ();
  
    this.hide ();
  },
  
  
  /**
   * @protected
   * @function
   */
  childOf : function (child, parent)
  {
    if (child === parent) { return true; }
    
    child = child.parentElement
    while (child)
    {
      if (child === parent) { return true; }
      child = child.parentElement
    }
    return false;
  },

  /**
   * Hides the popover
   * @name vs.ui.PopOver#hide 
   * @function
   */
  hide : function ()
  {
    if (!this.view) { return; }
    View.prototype.hide.call (this);
    
    document.removeEventListener (core.POINTER_START, this, true); 
    this.view.style.display = 'none';
  }
};
util.extendClass (PopOver, View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (PopOver, {
  'hasFooter': {
    /** 
     * Activate/deactivate the footer space. If its activate, you can
     * add child to this view.
     * @example
     *   myPopOver.hasFooter = true;
     *   button = new vs.ui.Button (...);
     *   myPopOver.add (button, 'footer');
     * @name vs.ui.PopOver#hasFooter 
     * @type boolean
     */ 
    set : function (v)
    {
      if (v) { this._has_footer = true; }
      else { this._has_footer = false; }
      
      if (this.view && this._has_footer)
      {
        this.addClassName ('withFooter');
      }
      if (this.view && !this._has_footer)
      {
        this.removeClassName ('withFooter');
      }
    },
  
    /** 
     * @ignore
     * @return boolean
     */ 
    get : function ()
    {
      return this._has_footer;
    }
  },
  'hasHeader': {
    /** 
     * Activate/deactivate the header space. If its activate, you can
     * add child to this view.
     * @example
     *   myPopOver.hasHeader = true;
     *   button = new vs.ui.Button (...);
     *   myPopOver.add (button, 'header');
     * @name vs.ui.PopOver#hasHeader 
     * @type boolean
     */ 
    set : function (v)
    {
      if (v) { this._has_header = true; }
      else { this._has_header = false; }
      
      if (this.view && this._has_header)
      {
        this.addClassName ('withHeader');
      }
      if (this.view && !this._has_header)
      {
        this.removeClassName ('withHeader');
      }
    },
  
    /** 
     * @ignore
     * @return {boolean}
     */ 
    get : function ()
    {
      return this._has_header;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.PopOver = PopOver;
