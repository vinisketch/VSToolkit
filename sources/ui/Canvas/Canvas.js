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
 
 Use code from Canto.js Copyright 2010 David Flanagan
*/

/**
 *  The vs.ui.Canvas class
 *
 *  @extends vs.ui.View
 *  @class
 *  The vs.ui.Canvas class is a subclass of vs.ui.View that allows you to easily draw
 *  arbitrary content within your HTML content.
 *  <p>
 *  When you instantiate the vs.ui.Canvas class you should reimpletement the draw method.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.ui.Canvas.
 * @name vs.ui.Canvas
 *
 *  @example
 *  var myCanvas = new vs.ui.Canvas (config);
 *  myCanvas.init ();
 *
 *  myCanvas.draw = function (x, y, width, height)
 *  {
 *    this.canvas_ctx.clearRect (x, y, width, height)
 *    // <=> this.clearRect (x, y, width, height)
 *      
 *    this.canvas_ctx.fillStyle = "rgb(200,0,0)";
 *    // <=> this.fillRect (10, 10, 55, 50);
 *   
 *    this.canvas_ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
 *    // <=> this.fillRect (30, 30, 55, 50);
 *
 *    ...
 *    
 *  };
 *
 *  // other way to use vs.ui.Canvas
 *  myCanvas.moveTo(100,100).lineTo(200,200,100,200).closePath().stroke();
 *
 * @param {Object} config The configuration structure [mandatory]
*/
function Canvas (config)
{
  this.parent = View;
  this.parent (config);
  this.constructor = Canvas;
}

Canvas.prototype = {

  /**
   *
   * @protected
   * @type {CanvasRenderingContext2D|null}
   */
  canvas_ctx: null,
  
  /**
   *
   * @protected
   * @type {HTMLCanvasElement|null}
   */
  canvas_node: null,
  
/*****************************************************************
 *
 ****************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    View.prototype.initComponent.call (this);
    
    this.canvas_node = this.view.firstChild;
    if (this.canvas_node)
    {
      this.canvas_ctx = this.canvas_node.getContext('2d');
      
      this.canvas_node.width = this._size [0];
      this.canvas_node.height = this._size [1];    
      this.draw (0, 0, this._size [0], this._size [1]);
    }
  },
  
  /**
   *
   * @name vs.ui.Canvas#getContext
   * @function
   * @return {CanvasRenderingContext2D} the canvas context
   */
  getContext: function ()
  {
    return this.canvas_ctx;
  },
  
  /**
   * This method draws a rectangle.
   * <p/>
   * With 4 arguments, it works just like the 2D method. An optional
   * 5th argument specifies a radius for rounded corners. An optional
   * 6th argument specifies a clockwise rotation about (x,y).
   *
   * @name vs.ui.Canvas#drawRect
   * @function
   *
   * @param {number} x The x position
   * @param {number} y The y position
   * @param {number} w The rectangle width
   * @param {number} h The rectangle height
   * @param {number} radius The rectangle radius
   * @param {number} rotation The rectangle rotation
   */
  drawRect : function (x, y, w, h, radius, rotation)
  {
    if (arguments.length === 4)
    {
      // square corners, no rotation
      this.rect (x, y, w, h).stroke ();
    }
    else
    {
      if (!rotation)
      {
        // Rounded corners, no rotation
        this.polygon (x, y, x + w, y, x + w, y + h, x, y + h, radius);
      }
      else
      {
        // Rotation with or without rounded corners
        var sr = Math.sin (rotation), cr = Math.cos (rotation),
          points = [x,y], p = this.rotatePoint (w, 0, rotation);
          
        points.push (x + p [0], y + p [1]);
        p = this.rotatePoint (w, h, rotation);
        points.push (x + p [0], y + p [1]);
        p = this.rotatePoint (0, h, rotation);
        points.push (x + p [0], y + p [1]);
        if (radius) { points.push (radius); }
        
        this.polygon.apply (this, points);
      }
    }
    // The polygon() method handles setting the current point
    return this;
  },
  
  /**
   * @protected
   * @function
   */
  rotatePoint : function (x, y, angle)
  {
    return [x * Math.cos (angle) - y * Math.sin (angle),
            y * Math.cos (angle) + x * Math.sin (angle)];
  },

  /**
   * This method connects the specified points as a polygon.  It requires
   * at least 6 arguments (the coordinates of 3 points).  If an odd 
   * number of arguments are passed, the last one is taken as a corner
   * radius.
   *
   * @example
   *  var myCanvas = new vs.ui.Canvas (config);
   *  myCanvas.init ();
   *
   *  // draw a triangle
   *  myCanvas.polygon (100, 100, 50, 150, 300, 300);
   *
   * @name vs.ui.Canvas#polygon
   * @function
   * @param {...number} list of number
   */
  polygon : function ()
  {
    // Need at least 3 points for a polygon
    if (arguments.length < 6) { throw new Error("not enough arguments"); }

    var i, radius, n, x0, y0;
    
    this.beginPath ();

    if (arguments.length % 2 === 0)
    {
      this.moveTo (arguments [0], arguments [1]);
     
      for (i = 2; i < arguments.length; i += 2)
      {
        this.lineTo (arguments [i], arguments [i + 1]);
      }
    }
    else
    {
      // If the number of args is odd, then the last is corner radius
      radius = arguments [arguments.length - 1];
      n = (arguments.length - 1) / 2;

      // Begin at the midpoint of the first and last points
      x0 = (arguments [n * 2 - 2] + arguments [0]) /2;
      y0 = (arguments [n * 2 - 1] + arguments [1]) /2;
      this.moveTo (x0, y0);
      
      // Now arcTo each of the remaining points
      for (i = 0; i < n - 1; i++)
      {
        this.arcTo
          (arguments [i * 2], arguments [i * 2 + 1],
           arguments [i * 2 + 2], arguments [i * 2 + 3], radius);
      }
      // Final arcTo back to the start
      this.arcTo
        (arguments [n * 2 - 2], arguments [n * 2 - 1],
         arguments [0], arguments [1], radius);
    }

    this.closePath ();
    this.moveTo (arguments [0], arguments [1]);
    this.stroke ();
    return this;
  },

  /**
   * This method draws elliptical arcs as well as circular arcs.
   *
   * @name vs.ui.Canvas#ellipse
   * @function
   * @example
   *  var myCanvas = new Canvas (config);
   *  myCanvas.init ();
   *
   *  myCanvas.ellipse (100, 100, 50, 150, Math.PI/5, 0, Math.PI);
   *
   * @param {number} cx The X coordinate of the center of the ellipse
   * @param {number} cy The Y coordinate of the center of the ellipse
   * @param {number} rx The X radius of the ellipse
   * @param {number} ry The Y radius of the ellipse
   * @param {number} rotation The clockwise rotation about (cx,cy).
   *       The default is 0.
   * @param {number} sa The start angle; defaults to 0
   * @param {number} ea The end angle; defaults to 2pi
   * @param {boolean} anticlockwise The arc direction. The default
   *        is false, which means clockwise
   */
  ellipse : function (cx, cy, rx, ry, rotation, sa, ea, anticlockwise)
  {
    if (rotation === undefined) { rotation = 0;}
    if (sa === undefined) { sa = 0; }
    if (ea === undefined) { ea = 2 * Math.PI; }
      
    if (anticlockwise === undefined) { anticlockwise = false; }

    // compute the start and end points
    var sp =
      this.rotatePoint (rx * Math.cos (sa), ry * Math.sin (sa), rotation),
      sx = cx + sp[0], sy = cy + sp[1],
      ep = this.rotatePoint (rx * Math.cos (ea), ry * Math.sin (ea), rotation),
      ex = cx + ep[0], ey = cy + ep[1];
    
    this.moveTo (sx, sy);

    this.translate (cx, cy);
    this.rotate (rotation);
    this.scale (rx / ry, 1);
    this.arc (0, 0, ry, sa, ea, anticlockwise);
    this.scale (ry / rx, 1);
    this.rotate (-rotation);
    this.translate (-cx, -cy);
    
    this.stroke ();
    
    return this;
  },
  
  /**
   * Load a web page and draw it in the canvas. (does not work in Webkit)
   *
   * @name vs.ui.Canvas#load
   * @function
   *
   * @param {string} url The web site url
   */
  load : function (url)
  {
    var windowWidth = window.innerWidth - 25;  
    this.__iframe = document.createElement ("iframe");  
    this.__iframe.id = "canvas_load_iframe";  
    this.__iframe.height = "10px";  
    this.__iframe.width = windowWidth + "px";  
    this.__iframe.style.visibility = "hidden";  
    this.__iframe.src = url;  
    // Here is where the magic happens... add a listener to the  
    // frame's onload event
    this.nodeBind (this.__iframe, "load", 'remotePageLoaded');
    //append to the end of the page  
    document.body.appendChild (this.__iframe);
    
    return;      
  },
  
  /**
   * @protected
   * @function
   */
  remotePageLoaded : function ()
  {  
    // Get a reference to the window object you need for the canvas  
    // drawWindow method  
    var remoteWindow = this.__iframe.contentWindow,
      windowWidth = window.innerWidth - 25,
      windowHeight = window.innerHeight;  

    //Draw canvas  
    this.clearRect (0, 0, this._size [0], this._size [1]);  
    this.save ();  
    this.scale (this._size [0] / windowWidth, this._size [1] / windowHeight);  
    this.canvas_ctx.drawWindow
      (remoteWindow, 0, 0, windowWidth, windowHeight, "rgb(255,255,255)");  
    this.restore();  
  },
  
  /**
   * vs.ui.Canvas draw method.
   * Should be reimplement when you instanciate a vs.ui.Canvas object.
   *
   * @name vs.ui.Canvas#draw
   * @function
   *
   * @param {number} x The top position of the canvas; Default = 0
   * @param {number} y The left position of the canvas; Default = 0
   * @param {number} width The width of the canvas; Default = canvas's width
   * @param {number} height The height of the canvas; Default = canvas's height
   */
  draw : function (x, y, width, height)
  {
    if (!x) { x = 0; }
    if (!y) { y = 0; }
    if (!width) { width = this._size [0]; }
    if (!height) { height = this._size [1]; }
    
    this.clearRect (x, y, width, height);
      
    this.lineWidth = 3;
    this.shadowColor = 'white';
    this.shadowBlur = 1;
    
    var i, x1, y1, x2, y2;
    
    for (i = 0; i < 10; i++)
    {
      this.strokeStyle = 'rgb(' + 
        Math.floor (Math.random () * 255) + ',' + 
        Math.floor (Math.random () * 255) + ',' + 
        Math.floor (Math.random () * 255) +')';
      
      x1 = Math.floor (Math.random() * width);
      y1 = Math.floor (Math.random() * height);
  
      x2 = Math.floor (Math.random() * width);
      y2 = Math.floor (Math.random() * height);
  
      this.beginPath ();
      this.moveTo (x1,y1);
      this.lineTo (x2,y2);
      this.closePath ();
      this.stroke ();
    }
  }
};
util.extendClass (Canvas, View);

/**
 * @private
 */
Canvas.methods =   
  ['arc','arcTo','beginPath','bezierCurveTo','clearRect','clip',  
  'closePath','createImageData','createLinearGradient','createRadialGradient',  
  'createPattern','drawFocusRing','drawImage','fill','fillRect','fillText',  
  'getImageData','isPointInPath','lineTo','measureText','moveTo','putImageData',  
  'quadraticCurveTo','rect','restore','rotate','save','scale','setTransform',  
  'stroke','strokeRect','strokeText','transform','translate'];
  
/**
 * @private
 */
Canvas.props =
  ['canvas','fillStyle','font','globalAlpha','globalCompositeOperation',  
  'lineCap','lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowOffsetY',  
  'shadowBlur','shadowColor','strokeStyle','textAlign','textBaseline'];

/**
 * @private
 */
Canvas.setup = function ()
{
  var i, m, p;
  for (i = 0; i < Canvas.methods.length; i++)
  {
    m = Canvas.methods [i];  
    Canvas.prototype [m] = (function (m)
    {
      return function (a, b, c, d, e, f, g, h, i)
      { // 9 args is most in API  
        this.canvas_ctx [m] (a, b, c, d, e, f, g, h, i);  
        return this;  
      };
    }(m));  
  }

  for (i = 0; i < Canvas.props.length; i++)
  {  
    p = Canvas.props [i];
    
    var d = {};
    
    d.enumerable = true; 
    d.set = (function (p)
    {
      return function (value)
      {
        this.canvas_ctx [p] = value;
      };
    }(p));
    
    d.get = (function (p)
    {
      return function ()
      {
        return this.canvas_ctx [p];
      };
    }(p));

    util.defineProperty (Canvas.prototype, p, d);
  }  
};

Canvas.setup ();

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperty (Canvas, "size", {
 /** 
   * Getter|Setter for size. Gives access to the size of the vs.ui.Canvas
   * @name vs.ui.Canvas#size 
   *
   * @type {Array.<number>}
   */ 
  set : function (v)
  {
    if (!v) { return; } 
    if (!util.isArray (v) || v.length !== 2) { return; }
    if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }

    this._size [0] = v [0];
    this._size [1] = v [1];
    
    if (!this.view) { return; }
    this._updateSizeAndPos ();

    if (!this.canvas_node)
    {
      this.canvas_node = this.view.firstChild;
      if (!this.canvas_node)
      {
        console.error ('Uncompatible canvas view');
        return;
      }
      this.canvas_ctx = this.canvas_node.getContext ('2d');
    }
   this.canvas_node.width = this._size [0];
   this.canvas_node.height = this._size [1];    
   this.draw (0, 0, this._size [0], this._size [1]);
  },

  /**
   * @ignore
   * @type {Array.<number>}
   */
  get : function ()
  {
    if (this.view && this.view.parentNode)
    {
      this._size [0] = this.view.offsetWidth;
      this._size [1] = this.view.offsetHeight;
    }
    return this._size.slice ();
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ui.Canvas = Canvas;

/********************************************************************
                   Documentation
********************************************************************/

/**
 * Adds points to the subpath such that the arc described by the circumference 
 * of the circle described by the arguments, starting at the given start angle 
 * and ending at the given end angle, going in the given direction (defaulting * 
 * to clockwise), is added to the path, connected to the previous point by a 
 * straight line.
 * @name vs.ui.Canvas#arc
 * @function
 */

/**
 * Adds an arc with the given control points and radius to the current subpath, 
 * connected to the previous point by a straight line.
 * @name vs.ui.Canvas#arcTo
 * @function
 */

/**
 * Resets the current path.
 * @name vs.ui.Canvas#beginPath
 * @function
 */

/**
 * Adds the given point to the current subpath, connected to the previous one by 
 * a cubic Bézier curve with the given control points.
 * @name vs.ui.Canvas#bezierCurveTo
 * @function
 */

/**
 * Clears all pixels on the canvas in the given rectangle to transparent black.
 * @name vs.ui.Canvas#clearRect
 * @function
 */

/**
 * Further constrains the clipping region to the given path.
 * @name vs.ui.Canvas#clip
 * @function
 */

/**
 * Marks the current subpath as closed, and starts a new subpath with a point 
 * the same as the start and end of the newly closed subpath.
 * @name vs.ui.Canvas#closePath
 * @function
 */

/**
 * Returns an ImageData object with the given dimensions in CSS pixels (which 
 * might map to a different number of actual device pixels exposed by the object 
 * itself). All the pixels in the returned object are transparent black.
 * @name vs.ui.Canvas#createImageData
 * @function
 */

/**
 * Returns a CanvasGradient object that represents a linear gradient that paints 
 * along the line given by the coordinates represented by the arguments.
 * If any of the arguments are not finite numbers, throws a NotSupportedError 
 * exception.
 * @name vs.ui.Canvas#createLinearGradient
 * @function
 */

/**
 * Returns a CanvasGradient object that represents a radial gradient that paints 
 * along the cone given by the circles represented by the arguments.
 * If any of the arguments are not finite numbers, throws a NotSupportedError 
 * exception. If either of the radii are negative, throws an IndexSizeError 
 * exception.
 * @name vs.ui.Canvas#createRadialGradient
 * @function
 */

/**
 * Returns a CanvasPattern object that uses the given image and repeats in the 
 * direction(s) given by the repetition argument.
 * @name vs.ui.Canvas#createPattern
 * @function
 */

/**
 * @name vs.ui.Canvas#drawFocusRing
 * @function
 */

/**
 * Draws the given image onto the canvas.
 * @name vs.ui.Canvas#drawImage
 * @function
 */

/**
 * @name vs.ui.Canvas#fill
 * @function
 */

/**
 * Paints the given rectangle onto the canvas, using the current fill style.
 * @name vs.ui.Canvas#fillRect
 * @function
 */

/**
 * Fills the given text at the given position. If a maximum width is provided, 
 * the text will be scaled to fit that width if necessary.
 * @name vs.ui.Canvas#fillText
 * @function
 */

/**
 * Returns an ImageData object containing the image data for the given rectangle 
 * of the canvas.
 * @name vs.ui.Canvas#getImageData
 * @function
 */

/**
 * Returns true if the given point is in the current path.
 * @name vs.ui.Canvas#isPointInPath
 * @function
 */

/**
 * Adds the given point to the current subpath, connected to the previous one by 
 * a straight line.
 * @name vs.ui.Canvas#lineTo
 * @function
 */

/**
 * Returns a TextMetrics object with the metrics of the given text in the 
 * current font.
 * @name vs.ui.Canvas#measureText
 * @function
 */

/**
 * Creates a new subpath with the given point.
 * @name vs.ui.Canvas#moveTo
 * @function
 */

/**
 * Paints the data from the given ImageData object onto the canvas. If a dirty 
 * rectangle is provided, only the pixels from that rectangle are painted.
 * @name vs.ui.Canvas#putImageData
 * @function
 */

/**
 * Adds the given point to the current subpath, connected to the previous one by 
 * a quadratic Bézier curve with the given control point.
 * @name vs.ui.Canvas#quadraticCurveTo
 * @function
 */

/**
 * Adds a new closed subpath to the path, representing the given rectangle.
 * @name vs.ui.Canvas#rect
 * @function
 */

/**
 * Pops the top state on the stack, restoring the context to that state.
 * @name vs.ui.Canvas#restore
 * @function
 */

/**
 * Changes the transformation matrix to apply a rotation transformation with the 
 * given characteristics. The angle is in radians.
 * @name vs.ui.Canvas#rotate
 * @function
 */

/**
 * Pushes the current state onto the stack.
 * @name vs.ui.Canvas#save
 * @function
 */

/**
 * Changes the transformation matrix to apply a scaling transformation with the 
 * given characteristics.
 * @name vs.ui.Canvas#scale
 * @function
 */

/**
 * Changes the transformation matrix to the matrix given by the arguments as 
 * described below.
 * @name vs.ui.Canvas#setTransform
 * @function
 */

/**
 * Strokes the subpaths with the current stroke style.
 * @name vs.ui.Canvas#stroke
 * @function
 */

/**
 * Paints the box that outlines the given rectangle onto the canvas, using the 
 * current stroke style.
 * @name vs.ui.Canvas#strokeRect
 * @function
 */

/**
 * Strokes the given text at the given position. If a maximum width is provided, 
 * the text will be scaled to fit that width if necessary.
 * @name vs.ui.Canvas#strokeText
 * @function
 */

/**
 * Changes the transformation matrix to apply the matrix given by the arguments 
 * as described below.
 * @name vs.ui.Canvas#transform
 * @function
 */

/**
 * Changes the transformation matrix to apply a translation transformation with 
 * the given characteristics.
 * @name vs.ui.Canvas#translate
 * @function
 */

/**
 * Returns the canvas element.
 * @name vs.ui.Canvas#canvas
 */

/**
 * Can be set, to change the fill style.
 * <br />
 * Returns the current style used for filling shapes.
 * @name vs.ui.Canvas#fillStyle
 */

/**
 * Can be set, to change the font. The syntax is the same as for the CSS 'font' 
 * property; values that cannot be parsed as CSS font values are ignored.
 * <br />
 * Returns the current font settings
 * @name vs.ui.Canvas#font
 */

/**
 * Can be set, to change the alpha value. Values outside of the range 0.0 .. 1.0 
 * are ignored.
 * <br />
 * Returns the current alpha value applied to rendering operations.
 * @name vs.ui.Canvas#globalAlpha
 */

/**
 * Can be set, to change the composition operation. Unknown values are ignored.
 * <br />
 * Returns the current composition operation, from the list below.
 * @name vs.ui.Canvas#globalCompositeOperation
 */

/**
 * Can be set, to change the line cap style.
 * <br />
 * Returns the current line cap style.
 * @name vs.ui.Canvas#lineCap
 */

/**
 * Can be set, to change the line join style.
 * <br />
 * Returns the current line join style.
 * @name vs.ui.Canvas#lineJoin
 */

/**
 * Can be set, to change the miter limit ratio. Values that are not finite 
 * values greater than zero are ignored.
 * <br />
 * Returns the current miter limit ratio.
 * @name vs.ui.Canvas#miterLimit
 */

/**
 * Can be set, to change the line width. Values that are not finite values 
 * greater than zero are ignored.
 * Returns the current line width.
 * @name vs.ui.Canvas#lineWidth
 */

/**
 * Can be set, to change the shadow offset. Values that are not finite numbers 
 * are ignored.
 * <br />
 * Returns the current shadow offset.
 * @name vs.ui.Canvas#shadowOffsetX
 */

/**
 * Can be set, to change the shadow offset. Values that are not finite numbers 
 * are ignored.
 * <br />
 * Returns the current shadow offset.
 * @name vs.ui.Canvas#shadowOffsetY
 */

/**
 * Can be set, to change the blur level. Values that are not finite numbers 
 * greater than or equal to zero are ignored.
 * <br />
 * Returns the current level of blur applied to shadows.
 * @name vs.ui.Canvas#shadowBlur
 */

/**
 * Can be set, to change the shadow color. Values that cannot be parsed as CSS 
 * colors are ignored.
 * <br />
 * Returns the current shadow color.
 * @name vs.ui.Canvas#shadowColor
 */

/**
 * Can be set, to change the stroke style.
 * <br />
 * Returns the current style used for stroking shapes.
 * @name vs.ui.Canvas#strokeStyle
 */

/**
 * Can be set, to change the alignment. The possible values are start, end, 
 * left, right, and center. Other values are ignored. The default is start.
 * Returns the current text alignment settings.
 * @name vs.ui.Canvas#textAlign
 */

/**
 * Can be set, to change the baseline alignment. The possible values and their 
 * meanings are given below. Other values are ignored. The default is 
 * alphabetic.
 * <br />
 * Returns the current baseline alignment settings.
 * @name vs.ui.Canvas#textBaseline
 */
 