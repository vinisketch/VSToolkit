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

  Copyright (c) 2010 Matteo Spinelli, http://cubiq.org/
  Released under MIT license
  http://cubiq.org/dropbox/mit-license.txt
*/

/**
 * @private
 */
var iScroll_prototype =
{
  currPageX: 0, currPageY: 0,
  pagesX: [], pagesY: [],
  offsetBottom: 0,
  offsetTop: 0,
  contentReady: true,
  
  /**
   * @protected
   * @function
   */
  _activate_scroll : function (wrapper, scroller, options)
  {
    var that = this, doc = document, div, i;
  
    that.wrapper = wrapper;
    that.wrapper.style.overflow = 'hidden';
    that.scroller = scroller;
    
    if (!util.isNumber (that.wrapper._ab_view_s))
    { that.wrapper._ab_view_s = 1; }
  
    // Default options
    that.options =
    {
      hScroll: true,
      vScroll: true,
      hScrollbar: true,
      vScrollbar: true,
      fixedScrollbar: false,
      fadeScrollbar: (has3d) || !core.EVENT_SUPPORT_TOUCH,
      hideScrollbar: true,
      scrollbarClass: '',
      bounce: has3d,
      bounceLock: false,
      momentum: has3d,
      lockDirection: true,
      snap: false,
      onScrollStart: null,
      onScrollEnd: null,
      checkDOMChange: false   // Experimental
    };
  
    // User defined options
    for (i in options) {
      that.options[i] = options[i];
    }
      
    that.scroller.style.cssText += '-webkit-transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);-webkit-transition-duration:0;';
  
    that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
    that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
    
    that._scroll_refresh ();
  
    that._bind (RESIZE_EV, window);
    that._bind (core.POINTER_START);
  
    if (!core.EVENT_SUPPORT_TOUCH) {
      that._bind('mousewheel');
    }
    
    if (that.options.checkDOMChange) {
      that.DOMChangeInterval = setInterval(function () { that._check_scroll_size(); }, 250);
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scrollbar_init : function (dir)
  {
    var that = this, doc = document, bar = that[dir + 'ScrollbarWrapper'];

    if (!that[dir + 'Scrollbar'])
    {
      if (bar)
      {
        // Should free some mem
        setElementTransform (that[dir + 'ScrollbarIndicator'], "");
        bar.parentNode.removeChild(bar);
        delete (that[dir + 'ScrollbarWrapper']);
        that[dir + 'ScrollbarIndicator'] = null;
      }

      return;
    }

    if (!bar)
    {
      // Create the scrollbar wrapper
      bar = doc.createElement('div');
      if (that.options.scrollbarClass)
      {
        bar.className = that.options.scrollbarClass + dir.toUpperCase();
      }
      else
      {
        bar.style.cssText = 'position:absolute;z-index:100;' + (dir === 'h' ? 'height:7px;bottom:1px;left:2px;right:7px' : 'width:7px;bottom:7px;top:2px;right:1px');
      }
      bar.style.cssText += 'pointer-events:none;-webkit-transition-property:opacity;-webkit-transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

      that.wrapper.appendChild (bar);
      that[dir + 'ScrollbarWrapper'] = bar;

      // Create the scrollbar indicator
      bar = doc.createElement('div');
      if (!that.options.scrollbarClass)
      {
        bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);-webkit-background-clip:padding-box;-webkit-box-sizing:border-box;' + (dir === 'h' ? 'height:100%;-webkit-border-radius:4px 3px;' : 'width:100%;-webkit-border-radius:3px 4px;');
      }
      bar.style.cssText += 'pointer-events:none;-webkit-transition-property:-webkit-transform;-webkit-transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);-webkit-transition-duration:0;-webkit-transform:' + trnOpen + '0,0' + trnClose;

      that[dir + 'ScrollbarWrapper'].appendChild(bar);
      that[dir + 'ScrollbarIndicator'] = bar;
    }

    if (dir === 'h')
    {
      that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
      that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
      that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
      that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
      that.hScrollbarProp =
        Math.abs (that.hScrollbarMaxScroll / that.maxScrollX);
    }
    else
    {
      that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
      that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
      that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
      that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
      that.vScrollbarProp = 
        Math.abs (that.vScrollbarMaxScroll / that.maxScrollY);
    }

    // Reset position
    that._scroll_indicator_pos (dir, true);
  },
  
//  _resize: function ()
//  {
//    var that = this;
// 
//    //if (that.options.momentum) that._unbind('webkitTransitionEnd');
// 
//    setTimeout(function () {
//      that._scroll_refresh();
//    }, 0);
//  },
  
  /**
   * @protected
   * @function
   */
  _check_scroll_size: function ()
  {
    var that = this,
      scrollerW,
      scrollerH;

    if (that.moved || !that.contentReady) return;

    scrollerW = m.round(that.scroller.offsetWidth * that._ab_view_s),
    scrollerH = m.round((that.scroller.offsetHeight - that.offsetBottom - that.offsetTop) * that._ab_view_s);

    if (scrollerW === that.scrollerW && scrollerH === that.scrollerH)
    { return; }

    that._scroll_refresh ();
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pos: function (x, y)
  {
    var that = this;

    that._ab_view_t_x = that.hScroll ? x : 0;
    that._ab_view_t_y = that.vScroll ? y : 0;

    that._applyInsideTransformation2D ();

    that._scroll_indicator_pos ('h');
    that._scroll_indicator_pos ('v');
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_indicator_pos: function (dir, hidden)
  {
    var that = this, pos, bar, rectS, rectP;
    
    if (!that[dir + 'Scrollbar']) return;
    
    bar = that[dir + 'ScrollbarWrapper'];
    
    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);
    pos = dir === 'h' ? rectP.left - rectS.left : rectP.top - rectS.top;
    pos = that[dir + 'ScrollbarProp'] * pos;

    if (pos < 0)
    {
      pos = that.options.fixedScrollbar ? 0 : pos + pos*3;
      if (that[dir + 'ScrollbarIndicatorSize'] + pos < 9) pos = -that[dir + 'ScrollbarIndicatorSize'] + 8;
    }
    else if (pos > that[dir + 'ScrollbarMaxScroll'])
    {
      pos = that.options.fixedScrollbar ? that[dir + 'ScrollbarMaxScroll'] : pos + (pos - that[dir + 'ScrollbarMaxScroll'])*3;
      if (that[dir + 'ScrollbarIndicatorSize'] + that[dir + 'ScrollbarMaxScroll'] - pos < 9) pos = that[dir + 'ScrollbarIndicatorSize'] + that[dir + 'ScrollbarMaxScroll'] - 8;
    }
    bar.style.webkitTransitionDelay = '0';
    bar.style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
    setElementTransform (that[dir + 'ScrollbarIndicator'], trnOpen + (dir === 'h' ? pos + 'px,0' : '0,' + pos + 'px') + trnClose);
  },

  /**
   * @protected
   * @function
   */
  _scroll_transition_time: function (time)
  {
    var that = this;
    
    time += 'ms';
    if (that.hScrollbar)
    {
      that.hScrollbarIndicator.style.webkitTransitionDuration = time;
    }
    if (that.vScrollbar)
    {
      that.vScrollbarIndicator.style.webkitTransitionDuration = time;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pointer_start: function (e, keepDefault)
  {
    if (core.EVENT_SUPPORT_TOUCH && e.changedTouches.length > 1)
    { return; }

    var that = this,
      point = core.EVENT_SUPPORT_TOUCH ? e.changedTouches[0] : e,
      matrix;

    that.moved = false;

    if (!keepDefault)
    {
      e.preventDefault ();
      e.stopPropagation ();
    }

    that.moved = false;
    that.distX = 0;
    that.distY = 0;
    that.absDistX = 0;
    that.absDistY = 0;
    that.dirX = 0;
    that.dirY = 0;
    that.returnTime = 0;
    
    that.animationDuration = 0;
    
    if (that.options.momentum)
    {
      if (that.scrollInterval)
      {
        clearInterval (that.scrollInterval);
        that.scrollInterval = null;
      }

      if (SUPPORT_3D_TRANSFORM)
      {
        matrix = new WebKitCSSMatrix (getElementTransform (that.scroller));
        if (matrix.m41 !== that._ab_view_t_x || matrix.m42 !== that._ab_view_t_y) {
          that._unbind ('webkitTransitionEnd');
          that._scroll_pos (matrix.m41, matrix.m42);
        }
      }
    }

    that.scroller.style.webkitTransitionTimingFunction = 
      'cubic-bezier(0.33,0.66,0.66,1)';
    if (that.hScrollbar)
    {
      that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 
        'cubic-bezier(0.33,0.66,0.66,1)';
    }
    if (that.vScrollbar) 
    {
      that.vScrollbarIndicator.style.webkitTransitionTimingFunction = 
        'cubic-bezier(0.33,0.66,0.66,1)';
    }
    that.startX = that._ab_view_t_x;
    that.startY = that._ab_view_t_y;
    that.pointX = point.pageX;
    that.pointY = point.pageY;
    
    that.startTime = e.timeStamp;

    if (that.options.onScrollStart)
    {
      that.options.onScrollStart.call(that);
    }

    // Registering/unregistering of events is done to preserve resources on 
    that._bind (core.POINTER_MOVE, document);
    that._bind (core.POINTER_END, document);
    that._bind (core.POINTER_CANCEL, document);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pointer_move: function (e, keepDefault)
  {
    if (core.EVENT_SUPPORT_TOUCH && e.changedTouches.length > 1)
    { return; }

    var that = this,
      point = core.EVENT_SUPPORT_TOUCH ? e.changedTouches[0] : e,
      deltaX = point.pageX - that.pointX,
      deltaY = point.pageY - that.pointY,
      newX, newY, rectS, rectP;

    if (!keepDefault)
    {
      e.preventDefault ();
      e.stopPropagation ();
    }

    that.pointX = point.pageX;
    that.pointY = point.pageY;
    
    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);
    
    newX = rectS.left + deltaX;
    newY = rectS.top + deltaY;

    // Slow down if outside of the boundaries
    if (newX > rectP.left || rectS.right + deltaX < rectP.right)
    {
      newX = that.options.bounce ? that._ab_view_t_x + (deltaX / 2.4) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
      newX = that.options.bounce ? that._ab_view_t_x + (deltaX / 2.4) : newX >= rectP.left || that.maxScrollX >= 0 ? that._ab_view_t_x : that._ab_view_t_x;
    }
    else
    {
      newX = that._ab_view_t_x + deltaX;
    }
    if (newY > rectP.top || rectS.bottom + deltaY < rectP.bottom)
    { 
      newY = that.options.bounce ? that._ab_view_t_y + (deltaY / 2.4) : newY >= rectP.top || that.maxScrollY >= 0 ? that._ab_view_t_y : that._ab_view_t_y;
    }
    else
    {
      newY = that._ab_view_t_y + deltaY;
    }

    if (that.absDistX < 4 && that.absDistY < 4)
    {
      that.distX += deltaX;
      that.distY += deltaY;
      that.absDistX = m.abs (that.distX);
      that.absDistY = m.abs (that.distY);
      return;
    }
    
    // Lock direction
    if (that.options.lockDirection)
    {
      if (that.absDistX > that.absDistY + 3)
      {
        newY = that._ab_view_t_y;
        deltaY = 0;
      }
      else if (that.absDistY > that.absDistX + 3)
      {
        newX = that._ab_view_t_x;
        deltaX = 0;
      }
    }
    
    that.moved = true;
    that._scroll_pos (newX, newY);
    that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
    that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

    if (e.timeStamp - that.startTime > 300)
    {
      that.startTime = e.timeStamp;
      that.startX = that._ab_view_t_x;
      that.startY = that._ab_view_t_y;
    }
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_pointer_end: function (e, keepDefault)
  {
    if (core.EVENT_SUPPORT_TOUCH && e.touches.length !== 0)
    { return; }

    if (!keepDefault)
    {
      e.preventDefault ();
      e.stopPropagation ();
    }

    var that = this,
      point = core.EVENT_SUPPORT_TOUCH ? e.changedTouches[0] : e,
      target, ev,
      momentumX = { dist:0, time:0 },
      momentumY = { dist:0, time:0 },
      duration = e.timeStamp - that.startTime,
      newPosX = that._ab_view_t_x, newPosY = that._ab_view_t_y,
      newDuration,
      snap, rectS, rectP;

    that._unbind (core.POINTER_MOVE, document);
    that._unbind (core.POINTER_END, document);
    that._unbind (core.POINTER_CANCEL, document);

    if (duration < 300 && that.options.momentum)
    {
      var maxDistUpper = that._ab_view_t_x + 500;
      var maxDistLower = that._ab_view_t_x + 500;
      
      rectS = util.getBoundingClientRect (that.scroller);
      rectP = util.getBoundingClientRect (that.wrapper);
      momentumX =
        that._scroll_momentum_x (newPosX - that.startX, duration, rectS, rectP);
      momentumY =
        that._scroll_momentum_y (newPosY - that.startY, duration, rectS, rectP);

      newPosX = that._ab_view_t_x + momentumX.dist;
      newPosY = that._ab_view_t_y + momentumY.dist;
    }

    if (momentumX.dist || momentumY.dist)
    {
      newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

      // Do we need to snap?
      if (that.options.snap)
      {
        snap = that._scroll_snap (newPosX, newPosY);
        newPosX = snap.x;
        newPosY = snap.y;
        newDuration = m.max(snap.time, newDuration);
      }
      
      that.scrollTo (newPosX, newPosY, newDuration);
      return;
    }
    
    // Do we need to snap?
    if (that.options.snap)
    {
      snap = that._scroll_snap (that._ab_view_t_x, that._ab_view_t_y);
      if (snap.x !== that._ab_view_t_x || snap.y !== that._ab_view_t_y)
      {
        that.scrollTo (snap.x, snap.y, snap.time);
      }
      return;
    }

    that._scroll_reset_pos ();
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_reset_pos: function (time)
  {
    var that = this,
      resetX = that._ab_view_t_x,
      resetY = that._ab_view_t_y,
      rectS, rectP;

    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);
    
    if (rectS.width < rectP.width)
    {
      resetX = that._ab_view_t_x;
    }
    else
    {
      if (rectS.left > rectP.left)
      {
        resetX = that._ab_view_t_x + (rectP.left - rectS.left);
      }
      else if (rectS.right < rectP.right)
      {
        resetX = that._ab_view_t_x + (rectP.right - rectS.right);
      }
    }
    
    if (rectS.height < rectP.height)
    {
      resetY = that._ab_view_t_y;
    }
    else
    {
      if (rectS.top > rectP.top)
      {
        resetY = that._ab_view_t_y + (rectP.top - rectS.top);
      }
      else if (rectS.bottom < rectP.bottom)
      {
        resetY = that._ab_view_t_y + (rectP.bottom - rectS.bottom);
      }
    }
        
    if (resetX === that._ab_view_t_x && resetY === that._ab_view_t_y)
    {
      if (that.moved)
      {
        // Execute custom code on scroll end
        if (that.options.onScrollEnd)
        { that.options.onScrollEnd.call (that); }
        that.moved = false;
      }

      if (that.hScrollbar && that.options.hideScrollbar)
      {
        that.hScrollbarWrapper.style.webkitTransitionDelay = '300ms';
        that.hScrollbarWrapper.style.opacity = '0';
      }
      if (that.vScrollbar && that.options.hideScrollbar)
      {
        that.vScrollbarWrapper.style.webkitTransitionDelay = '300ms';
        that.vScrollbarWrapper.style.opacity = '0';
      }

      return;
    }

    if (time === undefined)
    { time = 200; }

    // Invert ease
    if (time)
    {
      that.scroller.style.webkitTransitionTimingFunction = 
        'cubic-bezier(0.33,0.0,0.33,1)';
      if (that.hScrollbar) 
      {
        that.hScrollbarIndicator.style.webkitTransitionTimingFunction = 
          'cubic-bezier(0.33,0.0,0.33,1)';
      }
      if (that.vScrollbar)
      {
        that.vScrollbarIndicator.style.webkitTransitionTimingFunction =
          'cubic-bezier(0.33,0.0,0.33,1)';
      }
    }

    that.scrollTo (resetX, resetY, time);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_timed: function (destX, destY, runtime)
  {
    var that = this,
      startX = that._ab_view_t_x, startY = that._ab_view_t_y,
      startTime = (new Date).getTime(),
      easeOut;

    that.animationDuration = 0;
    
    if (that.scrollInterval)
    {
      clearInterval (that.scrollInterval);
      that.scrollInterval = null;
    }
    
    that.scrollInterval = setInterval (function ()
    {
      var now = (new Date).getTime(),
        newX, newY;
        
      if (now >= startTime + runtime)
      {
        clearInterval(that.scrollInterval);
        that.scrollInterval = null;

        that._scroll_pos (destX, destY);
        that._scroll_transition_end ();
        return;
      }
  
      now = (now - startTime) / runtime - 1;
      easeOut = m.sqrt(1 - now * now);
      newX = (destX - startX) * easeOut + startX;
      newY = (destY - startY) * easeOut + startY;
      that._scroll_pos (newX, newY);
    }, 20);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_transition_end : function (e)
  {
    var that = this;
    
    if (e) { e.stopPropagation(); }

    that._unbind ('webkitTransitionEnd');

    that._scroll_reset_pos (that.returnTime);
    that.returnTime = 0;
  },
    
  /**
   * @protected
   * @function
   */
  _scroll_wheel : function (e)
  {
    var that = this,
      deltaX = that._ab_view_t_x + e.wheelDeltaX / 12,
      deltaY = that._ab_view_t_y + e.wheelDeltaY / 12;

    if (deltaX > 0) deltaX = 0;
    else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

    if (deltaY > 0) deltaY = 0;
    else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;

    that.scrollTo(deltaX, deltaY, 0);
  },
  
  /**
   *
   * Utilities
   *
   */
  _scroll_momentum_x : function (dist, time, rectS, rectP)
  {
    var that = this,
      deceleration = 0.0006,
      speed = m.abs(dist) / time,
      newDist = (speed * speed) / (2 * deceleration),
      newTime = 0, outsideDist = 0;

    // Proportinally reduce speed if we are outside of the boundaries 
    if (dist > 0 && rectS.left - newDist < rectP.left)
    {
      outsideDist = rectS.width / (30 / (newDist / speed * deceleration));
      maxDistUpper = rectP.left - rectS.left + outsideDist;
      that.returnTime = 800 / rectS.width * outsideDist + 100;
      speed = speed * maxDistUpper / newDist;
      newDist = maxDistUpper;
    }
    else if (dist < 0 && rectS.right + newDist > rectP.right)
    {
      outsideDist = rectS.width / (30 / (newDist / speed * deceleration));
      maxDistLower = rectS.right - rectP.right + outsideDist;
      that.returnTime = 800 / rectS.width * outsideDist + 100;
      speed = speed * maxDistLower / newDist;
      newDist = - maxDistLower;
    }

    newTime = speed / deceleration;

    return { dist: newDist, time: m.round(newTime) };
  },

  /**
   * @protected
   * @function
   */
  _scroll_momentum_y: function (dist, time, rectS, rectP)
  {
    var that = this,
      deceleration = 0.0006,
      speed = m.abs(dist) / time,
      newDist = (speed * speed) / (2 * deceleration),
      newTime = 0, outsideDist = 0;

    // Proportinally reduce speed if we are outside of the boundaries 
    if (dist > 0 && rectS.top - newDist < rectP.top)
    {
      outsideDist = rectS.height / (30 / (newDist / speed * deceleration));
      maxDistUpper = rectP.top - rectS.top + outsideDist;
      that.returnTime = 800 / rectS.height * outsideDist + 100;
      speed = speed * maxDistUpper / newDist;
      newDist = maxDistUpper;
    }
    else if (dist < 0 && rectS.bottom + newDist > rectP.bottom)
    {
      outsideDist = rectS.height / (30 / (newDist / speed * deceleration));
      maxDistLower = rectS.bottom - rectP.bottom + outsideDist;
      that.returnTime = 800 / rectS.height * outsideDist + 100;
      speed = speed * maxDistLower / newDist;
      newDist = - maxDistLower;
    }

    newTime = speed / deceleration;

    return { dist: newDist, time: m.round(newTime) };
  },

  /**
   * @protected
   * @function
   */
  _scroll_offset: function (el, tree)
  {
    var left = -el.offsetLeft,
      top = -el.offsetTop;
      
    if (!tree) return { x: left, y: top };

    while (el = el.offsetParent)
    {
      left -= el.offsetLeft;
      top -= el.offsetTop;
    } 

    return { x: left, y: top };
  },

  /**
   * @protected
   * @function
   */
  _scroll_snap: function (x, y)
  {
    var that = this,
      i, l,
      page, time,
      sizeX, sizeY;

    // Check page X
    page = that.pagesX.length-1;
    for (i=0, l=that.pagesX.length; i<l; i++) {
      if (x >= that.pagesX[i]) {
        page = i;
        break;
      }
    }
    if (page === that.currPageX && page > 0 && that.dirX < 0)
    { page--; }
    x = that.pagesX[page];
    sizeX = m.abs(x - that.pagesX[that.currPageX]);
    sizeX = sizeX ? m.abs(that._ab_view_t_x - x) / sizeX * 500 : 0;
    that.currPageX = page;

    // Check page Y
    page = that.pagesY.length-1;
    for (i=0; i<page; i++) {
      if (y >= that.pagesY[i]) {
        page = i;
        break;
      }
    }
    if (page === that.currPageY && page > 0 && that.dirY < 0)
    { page--; }
    
    y = that.pagesY[page];
    sizeY = m.abs(y - that.pagesY[that.currPageY]);
    sizeY = sizeY ? m.abs(that._ab_view_t_y - y) / sizeY * 500 : 0;
    that.currPageY = page;

    // Snap with constant speed (proportional duration)
    time = m.round(m.max(sizeX, sizeY)) || 200;

    return { x: x, y: y, time: time };
  },

  /**
   * @protected
   * @function
   */
  _bind: function (type, el)
  {
    (el || this.scroller).addEventListener(type, this, false);
  },

  /**
   * @protected
   * @function
   */
  _unbind: function (type, el)
  {
    (el || this.scroller).removeEventListener(type, this, false);
  },

  /**
   *
   * Public methods
   *
   */
  _deactivate_scroll: function ()
  {
    var that = this;

    if (that.options.checkDOMChange) clearTimeout(that.DOMChangeInterval);

    // Remove the scrollbars
    that.hScrollbar = false;
    that.vScrollbar = false;
    that._scrollbar_init ('h');
    that._scrollbar_init ('v');

    // Free some mem
    setElementTransform (that.scroller, "");

    // Remove the event listeners
    that._unbind('webkitTransitionEnd');
    that._unbind (RESIZE_EV, window);
    that._unbind (core.POINTER_START);
    that._unbind (core.POINTER_MOVE, document);
    that._unbind (core.POINTER_END, document);
    that._unbind (core.POINTER_CANCEL, document);
  },
  
  /**
   * @protected
   * @function
   */
  _scroll_refresh: function (supportPinch)
  {
    var that = this,
      pos = 0, page = 0,
      i, l, els,
      oldHeight, offsets,
      loading, rectS, rectP;

    rectS = util.getBoundingClientRect (that.scroller);
    rectP = util.getBoundingClientRect (that.wrapper);

    that.wrapperW = rectP.width;
    that.wrapperH = rectP.height;

    that.scrollerW = rectS.width;
    that.scrollerH = rectS.height;
     
    that.maxScrollX = rectP.width - rectS.width;
    that.maxScrollY = rectP.height - rectS.height;
    that.dirX = 0;
    that.dirY = 0;
    
    that.animationDuration = 0;

    that.hScroll = that.options.hScroll && that.maxScrollX < 0;
    that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);
    that.hScrollbar = that.hScroll && that.options.hScrollbar;
    that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

    // Prepare the scrollbars
    that._scrollbar_init ('h');
    that._scrollbar_init ('v');

    // Snap
    if (util.isString (that.options.snap))
    {
      that.pagesX = [];
      that.pagesY = [];
      els = that.scroller.querySelectorAll(that.options.snap);
      for (i=0, l=els.length; i<l; i++)
      {
        pos = that._scroll_offset (els[i]);
        that.pagesX[i] = pos.x < that.maxScrollX ? that.maxScrollX : pos.x * that._ab_view_s;
        that.pagesY[i] = pos.y < that.maxScrollY ? that.maxScrollY : pos.y * that._ab_view_s;
      }
    }
    else if (that.options.snap)
    {
      that.pagesX = [];
      while (pos >= that.maxScrollX)
      {
        that.pagesX[page] = pos;
        pos = pos - that.wrapperW;
        page++;
      }
      if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

      pos = 0;
      page = 0;
      that.pagesY = [];
      while (pos >= that.maxScrollY)
      {
        that.pagesY[page] = pos;
        pos = pos - that.wrapperH;
        page++;
      }
      if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
    }
    
    // Recalculate wrapper offsets
    if (supportPinch)
    {
      offsets = that._scroll_offset (that.wrapper, true);
      that.wrapperOffsetLeft = -offsets.x;
      that.wrapperOffsetTop = -offsets.y;
    }

    if (oldHeight && that._ab_view_t_y === 0)
    {
      oldHeight = oldHeight - that.scrollerH + that._ab_view_t_y;
      that.scrollTo (0, oldHeight, 0);
    }
    
    that._scroll_reset_pos ();
  },

  /**
   * @function
   */
  scrollTo: function (x, y, time, relative)
  {
    var that = this;

    if (relative) {
      x = that._ab_view_t_x - x;
      y = that._ab_view_t_y - y;
    }

    time = !time || (m.round(that._ab_view_t_x) === m.round(x) && m.round(that._ab_view_t_y) === m.round(y)) ? 0 : time;

    that.moved = true;

    if (time)
    { that._bind('webkitTransitionEnd'); }
    
    that.animationDuration = time;
    that._scroll_pos (x, y);
    if (!time) setTimeout(function () { that._scroll_transition_end(); }, 0);
  },

  /**
   * @function
   */
  scrollToElement: function (el, time)
  {
    var that = this, pos;
    el = el.nodeType ? el : that.scroller.querySelector(el);
    if (!el) return;

    pos = that._scroll_offset (el);
    pos.x = pos.x > 0 ? 0 : pos.x < that.maxScrollX ? that.maxScrollX : pos.x;
    pos.y = pos.y > 0 ? 0 : pos.y < that.maxScrollY ? that.maxScrollY : pos.y;
    time = time === undefined ? m.max(m.abs(pos.x)*2, m.abs(pos.y)*2) : time;

    that.scrollTo (pos.x, pos.y, time);
  },

  /**
   * @function
   */
  scrollToPage: function (pageX, pageY, time)
  {
    var that = this, x, y;
    
    if (that.options.snap)
    {
      pageX = pageX === 'next' ? that.currPageX+1 : pageX === 'prev' ? that.currPageX-1 : pageX;
      pageY = pageY === 'next' ? that.currPageY+1 : pageY === 'prev' ? that.currPageY-1 : pageY;

      pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
      pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

      that.currPageX = pageX;
      that.currPageY = pageY;
      x = that.pagesX[pageX];
      y = that.pagesY[pageY];
    }
    else
    {
      x = -that.wrapperW * pageX;
      y = -that.wrapperH * pageY;
      if (x < that.maxScrollX) x = that.maxScrollX;
      if (y < that.maxScrollY) y = that.maxScrollY;
    }

    that.scrollTo (x, y, time || 400);
  }
};

var has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
  hasGesture = 'ongesturestart' in window,
  RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
  trnOpen = 'translate' + (has3d ? '3d(' : '('),
  trnClose = has3d ? ',0)' : ')',
  m = Math;