/**
  Copyright (C) 2009-2011. ViniSketch SARL (c) All rights reserved
  
  THIS SOURCE CODE, ALL THE INTELLECTUAL PROPERTY RIGHTS THAT IT
  CONTAINS, AND ALL COPYRIGHTS PERTAINING THERETO ARE THE EXCLUSIVE
  PROPERTY OF VINISKETCH SARL.
  
  THIS SOURCE CODE SHALL NOT BE COPIED OR REPRODUCED IN
  FULL OR IN PART.
  
  THE PRESENT COPYRIGHT NOTICE MAY NOT BE CHANGED NOR REMOVED FROM THE
  PRESENT FILE.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 *  The PageFlipAnimation class <br />
 *  @class
 *  Delegates:
 *  <ul>
 *    <li/>taskDidEnd : function (PageFlipAnimation)
 *  </ul>
 */
PageFlipAnimation = function (owner, mode)
{
  var node;
  
  this.parent = vs.core.Task;
  this.parent (vs.core.createId ());
  this.constructor = PageFlipAnimation;

  this._owner = owner;
  this._page_width = owner.size [0];
  this._page_height = owner.size [1];

  node = document.createElement ('div');
  node.style.position = "absolute";
  node.style.zIndex = 1002;
  node.style.webkitTransformStyle = "preserve-3d";
    
  this._flip_page = new vs.ui.View ({node: node});
  this._flip_page.init ();
  
  this._front_page = document.createElement ('div');
  this._front_page.className = 'front';
  this._front_page.style.webkitTransform = "rotateY(0)";
  this._front_page.style.position = "absolute";
  this._front_page.style.webkitBackfaceVisibility = 'hidden';
  this._front_page.style.overflow = "hidden";

  this._back_page = document.createElement ('div');
  this._back_page.className = 'back';
  this._back_page.style.position = "absolute";
  this._back_page.style.backgroundColor = "white";
  this._back_page.style.webkitBackfaceVisibility = 'hidden';
  this._back_page.style.overflow = "hidden";

  // add front and back pages to flip page
  this._flip_page.view.appendChild (this._back_page);
  this._flip_page.view.appendChild (this._front_page);
 
  node = document.createElement ('div');
  node.style.position = "absolute";
  node.style.backgroundColor = 'black';
  this._flip_shadow = new vs.ui.View ({node: node});
  this._flip_shadow.init ();

  node = document.createElement ('div');
  node.style.position = "absolute";
  node.style.backgroundColor = 'black';
  this._flip_shadow_bis = new vs.ui.View ({node: node});
  this._flip_shadow_bis.init ();

  this._owner.view.style.webkitPerspective = '2000';
  this._owner.view.style.webkitTransformStyle = 'preserve-3d';
  this._owner.view.style.overflow = 'visible';

  this.renderingModel = PageFlipAnimation.FLIP_BOTTOM_OUT;
}

PageFlipAnimation.FLIP_LEFT_OUT = 0;
PageFlipAnimation.FLIP_RIGHT_OUT = 1;
PageFlipAnimation.FLIP_TOP_OUT = 2;
PageFlipAnimation.FLIP_BOTTOM_OUT = 3;
PageFlipAnimation.FLIP_HORIZONTAL = 4;
PageFlipAnimation.FLIP_VERTICAL = 5;

PageFlipAnimation.prototype =
{
   /**
   * @private
   * @type {vs.ui.View}
   */
  _owner : null,
  
   /**
   * @private
   * @type {Object}
   */
  _page_height : 0,
  
   /**
   * @private
   * @type {Object}
   */
  _page_width : 0,
      
   /**
   * @private
   * @type {Object}
   */
  _rendering_model: null,
  
   /**
   * @private
   * @type {Object}
   */
  progression : 0,
  
   /**
   * @private
   * @type {Object}
   */
  _animation_duration : 500,
  
   /**
   * @private
   * @type {Object}
   */
  _delegate : null,
  
  /**
   * @private
   * @type HTMLDivElement
   */
  _flip_page : null,

  /**
   * @private
   * @type vs.ui.View
   */
  _flip_shadow : null,

  /**
   * @private
   * @type vs.ui.View
   */
  _flip_shadow_bis : null,
  
  /**
   * @private
   * @type vs.ui.View
   */
  __page_to_anim : null,

/*********************************************************
 *                  
 *********************************************************/

  /** 
   * Set rendering model.
   * @name PageFlipAnimation#renderingModel 
   * @type {Object}
   */ 
  set renderingModel (v)
  {
    if (!vs.util.isNumber (v)) { return; }
    this._rendering_model = v;

    if (v === PageFlipAnimation.FLIP_HORIZONTAL ||
        v === PageFlipAnimation.FLIP_VERTICAL)
    {
      this.processNext = this.processNext_half_animation;
      this.processPrevious = this.processPrevious_half_animation;
    }
    else
    {
      this.processNext = this.processNext_full_animation;
      this.processPrevious = this.processPrevious_full_animation;
    }
  },

  /** 
   * Set the delegate.
   * It should implements following methods
   *  <ul>
   *    <li/>taskDidEnd : function (PageFlipAnimation)
   *  </ul>
   * @name PageFlipAnimation#delegate 
   * @type {Object}
   */ 
  set delegate (v)
  {
    this._delegate = v;
  },

/*********************************************************
 *                  
 *********************************************************/
 
  destructor: function ()
  {
    free (this._flip_page);
    delete (this._flip_page);
    free (this._flip_shadow);
    delete (this._flip_shadow);
    free (this._flip_shadow_bis);
    delete (this._flip_shadow_bis);
  },
  
  /**
   * @protected
   */
  __refresh: function ()
  { 
    // recalculate page with and height after orientation change
    this._page_width = this._owner.size [0];
    this._page_height = this._owner.size [1];
  },

  /**
   * @protected
   */
  setPageSize: function (w, h)
  { 
    // recalculate page with and height after orientation change
    this._page_width = w;
    this._page_height = h;
    this._flip_page.size = [w, h];
    this._flip_page.position = [0, 0];
    vs.util.setElementPos (this._back_page, 0, 0);
    vs.util.setElementPos (this._front_page, 0, 0);
    vs.util.setElementSize
      (this._back_page, this._page_width, this._page_height);
    vs.util.setElementSize
      (this._front_page, this._page_width, this._page_height);
  },

  /**
   * @protected
   *
   * @param {number} orientation = {0, 180, -90, 90}
   */
  orientationDidChange: function (orientation)
  { 
    this.refresh ();
  },

/*********************************************************
 *                  animation management
 *********************************************************/
    
  /**
   * @public
   */
  processNext : function (page, nextPage) {},

  /**
   * @public
   */
  processPrevious : function (page, previousPage) {},

/*********************************************************
 *                  Full page flip
 *********************************************************/

  /**
   * @private
   */
  processNext_full_animation : function (page)
  {
    if (this.__still_animating) { return; }
    
    var p = this.progression, a, anim,
      amimShadow = PageFlipAnimation._shadow_animation_disappear;
      
    this.progression = 2;
    
    // front page generation
    this._front_page.innerHTML = page.view.outerHTML;
         
    // back page generation
    this._back_page.innerHTML = "";
    
    this._flip_shadow.view.style.zIndex = parseInt (page.view.style.zIndex) -1;
    this._flip_shadow.view.style.opacity = 1;
    this._flip_shadow.size = [this._page_width, this._page_height];
    this._flip_shadow.position = [0, 0];

    // add flip and shodow pages to the view
    this._owner.view.appendChild (this._flip_page.view);    
    this._owner.view.appendChild (this._flip_shadow.view);
        
    a = Math.acos (1 - p);
    switch (this._rendering_model)
    {
      case PageFlipAnimation.FLIP_LEFT_OUT:
        anim = PageFlipAnimation._horizontal_animation;
        anim.origin = [0, 0];        
        anim.addKeyFrame (100, {a: -180});
        this._back_page.style.webkitTransform = "rotateY(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(0)";
      break;
    
      case PageFlipAnimation.FLIP_RIGHT_OUT:
        anim = PageFlipAnimation._horizontal_animation;
        anim.origin = [100, 0];        
        anim.addKeyFrame (100, {a: 180});
        this._back_page.style.webkitTransform = "rotateY(-180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(0)";
      break;
    
      case PageFlipAnimation.FLIP_TOP_OUT:
        anim = PageFlipAnimation._vertical_animation;
        anim.origin = [0, 0];        
        anim.addKeyFrame (100, {a: 180});
        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(0)";
      break;
    
      case PageFlipAnimation.FLIP_BOTTOM_OUT:
        anim = PageFlipAnimation._vertical_animation;
        anim.origin = [0, 100];        
        anim.addKeyFrame (100, {a: -180});
        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(0)";
      break;
    }
    
    anim.addKeyFrame (0, {a: 0});
    anim.duration = this._animation_duration + 'ms';

    amimShadow.duration = (this._animation_duration / 3) + 'ms';
    amimShadow.delay = 0;

    amimShadow.process (this._flip_shadow, this._end_anim_shadow, this);

    page.size = [0, 0];
    this.__page_to_remove = page;
    anim.process (this._flip_page, this._end_anim_full, this);
    
    this.__still_animating = 2;
  },

  /**
   * @private
   */
  processPrevious_full_animation : function (page)
  {
    if (this.__still_animating) { return; }

    var p = this.progression, a, anim,
      amimShadow = PageFlipAnimation._shadow_animation_appear;
      
    this.progression = 2;

    // front page generation
    this._front_page.innerHTML = page.view.outerHTML;
         
    // back page generation
    this._back_page.innerHTML = "";
    
    this._flip_shadow.view.style.zIndex = parseInt (page.view.style.zIndex) -1;
    this._flip_shadow.view.style.opacity = 0;
    this._flip_shadow.size = [this._page_width, this._page_height];
    this._flip_shadow.position = [0, 0];

    // add flip and shodow pages to the view
    this._owner.view.appendChild (this._flip_page.view);    
    this._owner.view.appendChild (this._flip_shadow.view);

    a = Math.acos (1 - p);
    switch (this._rendering_model)
    {
      case PageFlipAnimation.FLIP_LEFT_OUT:
        anim = PageFlipAnimation._horizontal_animation;
        anim.origin = [0, 0];        
        anim.addKeyFrame (0, {a: -180});
        this._back_page.style.webkitTransform = "rotateY(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(180deg)";
      break;
    
      case PageFlipAnimation.FLIP_RIGHT_OUT:
        anim = PageFlipAnimation._horizontal_animation;
        anim.origin = [100, 0];        
        anim.addKeyFrame (0, {a: 180});
        this._back_page.style.webkitTransform = "rotateY(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(-180deg)";
      break;
    
      case PageFlipAnimation.FLIP_TOP_OUT:
        anim = PageFlipAnimation._vertical_animation;
        anim.origin = [0, 0];        
        anim.addKeyFrame (0, {a: 180});
        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(180deg)";
      break;
    
      case PageFlipAnimation.FLIP_BOTTOM_OUT:
        anim = PageFlipAnimation._vertical_animation;
        anim.origin = [0, 100];        
        anim.addKeyFrame (0, {a: -180});
        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(-180deg)";
      break;
    }
    
    anim.addKeyFrame (100, {a: 0});
    anim.duration = this._animation_duration + 'ms';

    amimShadow.duration = (this._animation_duration / 3) + 'ms';
    amimShadow.delay = this._animation_duration / 2;

    amimShadow.process (this._flip_shadow, this._end_anim_shadow, this);

//    page.size = [0, 0];
//    this.__page_to_resize = page;
    anim.process (page, this._end_anim_full, this);

    this.__still_animating = 2;
  },

/*********************************************************
 *                  half page flip management
 *********************************************************/

  /**
   * @private
   */
  processNext_half_animation : function (page, nextPage)
  {
    if (this.__still_animating) { return; }
    
    this.__page_to_remove = page;
    this.__page_to_clean = page;
    
    var p = this.progression, anim,
      shadowAppear = PageFlipAnimation._shadow_animation_appear,
      shadowDesappear = PageFlipAnimation._shadow_animation_disappear;
      
    this.progression = 2;
    
    var zIndex = parseInt (page.view.style.zIndex);
    
    this._flip_shadow.view.style.zIndex = zIndex -1;
    this._flip_shadow.view.style.opacity = 0;

    this._flip_shadow_bis.view.style.zIndex = zIndex;
    this._flip_shadow_bis.view.style.opacity = 0;
    
    // front page generation
    this._front_page.innerHTML = page.view.outerHTML;
        
    // back page generation
    if (nextPage && nextPage.view)
    { this._back_page.innerHTML = nextPage.view.outerHTML; }
    else { this._back_page.innerHTML = ""; }
    
    // add flip and shodow pages to the view
    this._owner.view.appendChild (this._flip_page.view);    
    this._owner.view.appendChild (this._flip_shadow.view);
    this._owner.view.appendChild (this._flip_shadow_bis.view);

    switch (this._rendering_model)
    {
      case PageFlipAnimation.FLIP_VERTICAL:
        anim = PageFlipAnimation._horizontal_animation;
        anim.origin = [50, 0];        
        anim.addKeyFrame (100, {a: -179.9});

        this._flip_shadow.size = [this._page_width / 2, this._page_height];
        this._flip_shadow.position = [this._page_width / 2, 0];

        this._flip_shadow_bis.size = [this._page_width / 2, this._page_height];
        this._flip_shadow_bis.position = [0, 0];

        page.addClassName ("mask_right");
        
        this._back_page.style.webkitTransform = "rotateY(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(0)";
      break;

      case PageFlipAnimation.FLIP_HORIZONTAL:
        anim = PageFlipAnimation._vertical_animation;
        anim.origin = [0, 50];        
        anim.addKeyFrame (100, {a: 179.9});

        this._flip_shadow.size = [this._page_width, this._page_height / 2];
        this._flip_shadow.position = [0, this._page_height / 2];

        this._flip_shadow_bis.size = [this._page_width, this._page_height / 2];
        this._flip_shadow_bis.position = [0, 0];

        page.addClassName ("mask_bottom");

        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(0)";
      break;
    }
    
    anim.addKeyFrame (0, {a: 0});
    anim.duration = this._animation_duration + 'ms';

    shadowDesappear.duration = (this._animation_duration / 3) + 'ms';
    shadowDesappear.process (this._flip_shadow, this._end_anim_shadow, this);
    shadowDesappear.delay = 0;

    shadowAppear.duration = (this._animation_duration / 3) + 'ms';
    shadowAppear.delay = this._animation_duration / 2;
    shadowAppear.process (this._flip_shadow_bis);

    anim.process (this._flip_page, this._end_anim, this);
    
    this.__still_animating = 2;
  },

  /**
   * @private
   */
  processPrevious_half_animation : function (page, previousPage)
  {
    if (this.__still_animating) { return; }
    
    var p = this.progression, anim,
      shadowAppear = PageFlipAnimation._shadow_animation_appear,
      shadowDesappear = PageFlipAnimation._shadow_animation_disappear;
      
    this.__page_to_clean = page;

    this.progression = 2;
    
    var zIndex = parseInt (page.view.style.zIndex);

    this._flip_shadow.view.style.zIndex = zIndex;
    this._flip_shadow.view.style.opacity = 0;

    this._flip_shadow_bis.view.style.zIndex = zIndex + 1;
    this._flip_shadow_bis.view.style.opacity = 0;
    
    // front page generation
    this._front_page.innerHTML = page.view.outerHTML;
    this._front_page.firstElementChild.style.display = 'block';
    // back page generation
    if (previousPage && previousPage.view)
    { this._back_page.innerHTML = previousPage.view.outerHTML; }
    else { this._back_page.innerHTML = ""; }
        
    switch (this._rendering_model)
    {
      case PageFlipAnimation.FLIP_VERTICAL:
        anim = PageFlipAnimation._horizontal_animation;
        anim.origin = [50, 0];        
        anim.addKeyFrame (0, {a: -179});

        this._flip_shadow.size = [this._page_width / 2, this._page_height];
        this._flip_shadow.position = [this._page_width / 2, 0];

        this._flip_shadow_bis.size = [this._page_width / 2, this._page_height];
        this._flip_shadow_bis.position = [0, 0];

        page.addClassName ("mask_right");

        this._back_page.style.webkitTransform = "rotateY(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(-180deg)";;
      break;

      case PageFlipAnimation.FLIP_HORIZONTAL:
        anim = PageFlipAnimation._vertical_animation;
        anim.origin = [50, 0];        
        anim.addKeyFrame (0, {a: 179});

        this._flip_shadow.size = [this._page_width, this._page_height / 2];
        this._flip_shadow.position = [0, this._page_height / 2];

        this._flip_shadow_bis.size = [this._page_width, this._page_height / 2];
        this._flip_shadow_bis.position = [0, 0];

        page.addClassName ("mask_bottom");

        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(179deg)";
      break;
    }
    
    anim.addKeyFrame (100, {a: 0});
    anim.duration = this._animation_duration + 'ms';

    shadowDesappear.duration = (this._animation_duration / 3) + 'ms';
    shadowDesappear.delay = 0;
    shadowDesappear.process (this._flip_shadow_bis);

    shadowAppear.duration = (this._animation_duration / 2) + 'ms';
    shadowAppear.delay = this._animation_duration / 3;
    shadowAppear.process (this._flip_shadow, this._end_anim_shadow, this);

    this._owner.view.appendChild (this._flip_shadow.view);
    this._owner.view.appendChild (this._flip_shadow_bis.view);
    this._owner.view.appendChild (this._flip_page.view);    
    page.view.style.display = 'block';

 //   amimShadow.process (this._flip_shadow, this._end_anim_shadow, this);
    anim.process (this._flip_page, this._end_anim, this);
    
    this.__still_animating = 2;
  },

/*********************************************************
 *                  animation end events
 *********************************************************/

  /**
   * @private
   */
  _end_anim : function ()
  {
// remove the page, and reset its size
    if (this.__page_to_clean)
    {
      this.__page_to_clean.removeClassName ("mask_bottom");
      this.__page_to_clean.removeClassName ("mask_right");
      this.__page_to_clean = null;
    }
    if (this.__page_to_remove)
    {
      this.__page_to_remove.view.style.display = 'none';
      this.__page_to_remove.size = [this._page_width, this._page_height];
      this.__page_to_remove = null;
    }

    this._owner.view.removeChild (this._flip_shadow_bis.view);
    this._owner.view.removeChild (this._flip_page.view);    
    
    if (this._delegate && this._delegate.taskDidEnd)
    { this._delegate.taskDidEnd (this); }
    
    this.__still_animating --;
  },

  /**
   * @private
   */
  _end_anim_full : function ()
  {
    // remove the page, and reset its size
    if (this.__page_to_remove)
    {
      this.__page_to_remove.view.style.display = 'none';
      this.__page_to_remove.size = [this._page_width, this._page_height];
      this.__page_to_remove = null;
    }
    if (this._delegate && this._delegate.taskDidEnd)
    { this._delegate.taskDidEnd (this); }
    
    this.__still_animating --;
  },

  /**
   * @private
   */
  _end_anim_shadow : function ()
  {
    this._owner.view.removeChild (this._flip_shadow.view);
    this._flip_shadow.view.style.opacity = 0;
    
    this.__still_animating --;
  },

/*********************************************************
 *                  utility functions
 *********************************************************/
  
  /**
   * @private
   */
  _calculateProgression : function ()
  {
    var time, animDur, p;
    
    animDur = (new Date ().getTime () - this._start_time);
    // end the animation
    if (animDur > this._animation_duration) { return 2; }
    if (animDur === 0 ) { animDur = 10; }
    
    p = 2 * animDur / this._animation_duration;
    
    return p;
  },
  
  renderFlip_half : function (p, page, nextPage)
  {
    if (this.__still_animating) { return; }
    
    var p = this.progression, anim,
      shadowAppear = PageFlipAnimation._shadow_animation_appear,
      shadowDesappear = PageFlipAnimation._shadow_animation_disappear;
      
    this.progression = p;
     var a = Math.acos (1 - p);
    
    var zIndex = parseInt (page.view.style.zIndex);
    
    this._flip_shadow.view.style.zIndex = zIndex -1;
    this._flip_shadow.view.style.opacity = 0;

    this._flip_shadow_bis.view.style.zIndex = zIndex;
    this._flip_shadow_bis.view.style.opacity = 0;
    
    // front page generation
    this._front_page.innerHTML = page.view.outerHTML;
        
    // back page generation
    if (nextPage && nextPage.view)
    { this._back_page.innerHTML = nextPage.view.outerHTML; }
    else { this._back_page.innerHTML = ""; }
    
    // add flip and shodow pages to the view
    this._owner.view.appendChild (this._flip_page.view);    
    this._owner.view.appendChild (this._flip_shadow.view);
    this._owner.view.appendChild (this._flip_shadow_bis.view);

    switch (this._rendering_model)
    {
      case PageFlipAnimation.FLIP_VERTICAL:
//         this._flip_shadow.size = [this._page_width / 2, this._page_height];
//         this._flip_shadow.position = [this._page_width / 2, 0];
// 
//         this._flip_shadow_bis.size = [this._page_width / 2, this._page_height];
//         this._flip_shadow_bis.position = [0, 0];

        page.addClassName ("mask_right");
        
        this._back_page.style.webkitTransform = "rotateY(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateY(0)";
      break;

      case PageFlipAnimation.FLIP_HORIZONTAL:
//         this._flip_shadow.size = [this._page_width, this._page_height / 2];
//         this._flip_shadow.position = [0, this._page_height / 2];
// 
//         this._flip_shadow_bis.size = [this._page_width, this._page_height / 2];
//         this._flip_shadow_bis.position = [0, 0];

        page.addClassName ("mask_bottom");

        this._back_page.style.webkitTransform = "rotateX(180deg)";
        this._flip_page.view.style.webkitTransform = "rotateX(0)";
      break;
    }
    
//     shadowDesappear.duration = (this._animation_duration / 3) + 'ms';
//     shadowDesappear.process (this._flip_shadow, this._end_anim_shadow, this);
//     shadowDesappear.delay = 0;
// 
//     shadowAppear.duration = (this._animation_duration / 3) + 'ms';
//     shadowAppear.delay = this._animation_duration / 2;
//     shadowAppear.process (this._flip_shadow_bis);

//    anim.process (this._flip_page, this._end_anim, this);
   this._flip_page.view.style.webkitTransform = "rotateY(-" + a + "rad)";
    
//    this.__still_animating = 2;
  },

  /**
   * @private
   */
  renderFlip : function (p, page)
  {
    this.renderFlip_half (p, page);
    return;
    
    page.style.webkitTransformOrigin = '50% 0%';

    this.progression = p;
  
    var a = Math.acos (1 - p);
    
    page.style.webkitTransform = "rotateY(-" + a + "rad)";
    
    console.log (p);
  },
    
/********************************************************************
                  Task implementation
********************************************************************/
 
  /**
   *  Starts the animation
  */
  start: function (param)
  {
    this.processLeftOut (param);
  }
};
PageFlipAnimation.prototype.__proto__ = vs.core.Task.prototype;
window.PageFlipAnimation = PageFlipAnimation;

PageFlipAnimation._horizontal_animation = 
  new vs.fx.Animation (['rotateY', '${a}deg']);

PageFlipAnimation._vertical_animation = 
  new vs.fx.Animation (['rotateX', '${a}deg']);
  
PageFlipAnimation._shadow_animation_appear =
  new vs.fx.Animation (['opacity', '${o}']);
PageFlipAnimation._shadow_animation_appear.addKeyFrame (0, {o: 0});
PageFlipAnimation._shadow_animation_appear.addKeyFrame (100, {o: 0.7});
PageFlipAnimation._shadow_animation_appear.timing = vs.fx.Animation.EASE_IN;

PageFlipAnimation._shadow_animation_disappear = 
  new vs.fx.Animation (['opacity', '${o}']);
PageFlipAnimation._shadow_animation_disappear.addKeyFrame (0, {o: 0.7});
PageFlipAnimation._shadow_animation_disappear.addKeyFrame (100, {o: 0});
PageFlipAnimation._shadow_animation_disappear.timing = vs.fx.Animation.EASE_OUT;
