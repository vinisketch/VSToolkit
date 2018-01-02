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

import vs_utils from 'vs_utils';
import vs_core from 'vs_core';

/** @preserve

  The code include code from :
  
  Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
  Released under MIT license
  http://cubiq.org/dropbox/mit-license.txt
  Version 3.4.5 - Last updated: 2010.07.04
*/

/**
 * @private
 * @name Scrollbar
 */
function Scrollbar (dir, wrapper, fade, shrink)
{
	this.dir = dir;
	this.fade = fade;
	this.shrink = shrink;
	this.id = vs_core.createId ();

	// Create main scrollbar
	this.bar = document.createElement ('div');

	var size, ctx;
	this.bar.className = 'scrollbar ' + dir;

	// Create scrollbar wrapper
	this.wrapper = document.createElement ('div');
	this.wrapper.className = 'wrapper_scrollbar ' + dir;

	this.wrapper.style.position = 'absolute';
	this.wrapper.style ['-webkit-mask'] = '-webkit-canvas(' + this.id + ')';
	this.wrapper.style ['-webkit-transition-duration'] = fade ? '300ms' : '0';

	// Add scrollbar to the DOM
	this.wrapper.appendChild (this.bar);
	
	wrapper.appendChild (this.wrapper);
	
	if (this.dir === 'horizontal')
	{
		size = this.wrapper.offsetWidth;
		ctx = document.getCSSCanvasContext ("2d", this.id, size, 5);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath ();
		ctx.arc (2.5, 2.5, 2.5, Math.PI/2, -Math.PI/2, false);
		ctx.lineTo (size-2.5, 0);
		ctx.arc (size-2.5, 2.5, 2.5, -Math.PI/2, Math.PI/2, false);
		ctx.closePath ();
		ctx.fill ();
	} 
	else
	{
		size = this.wrapper.offsetHeight;
		ctx = document.getCSSCanvasContext ("2d", this.id, 5, size);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.arc (2.5, 2.5, 2.5, Math.PI, 0, false);
		ctx.lineTo (5, size-2.5);
		ctx.arc (2.5, size-2.5, 2.5, 0, Math.PI, false);
		ctx.closePath();
		ctx.fill();
	}
}

Scrollbar.prototype = {

	init: function (scroll, size)
	{
		this.maxSize = this.dir === 'horizontal' ? this.wrapper.clientWidth : this.wrapper.clientHeight;
		this.size = Math.round(this.maxSize * this.maxSize / size);
		this.maxScroll = this.maxSize - this.size;
		this.toWrapperProp = this.maxScroll / (scroll - size);
		this.bar.style[this.dir === 'horizontal' ? 'width' : 'height'] = this.size + 'px';
	},
	
	setPosition: function (pos)
	{
		pos = this.toWrapperProp * pos;
		
		if (pos < 0)
		{
			pos = this.shrink ? pos + pos * 3 : 0;
			if (this.size + pos < 5)
			{
				pos = -this.size + 5;
			}
		}
		else if (pos > this.maxScroll)
		{
			pos = this.shrink ? pos + (pos-this.maxScroll)*3 : this.maxScroll;
			if (this.size + this.maxScroll - pos < 5) {
				pos = this.size + this.maxScroll - 5;
			}
		}

    if (vs_utils.SUPPORT_3D_TRANSFORM)
      pos = this.dir === 'horizontal' ? 'translate3d(' + Math.round(pos) + 'px,0,0)' : 'translate3d(0,' + Math.round(pos) + 'px,0)';
    else
      pos = this.dir === 'horizontal' ? 'translate(' + Math.round(pos) + 'px,0)' : 'translate(0,' + Math.round(pos) + 'px)';
		
    vs_utils.setElementTransform (this.bar, pos);
  },

	show: function ()
	{
		this.wrapper.style.webkitTransitionDelay = '0';
		this.wrapper.style.opacity = '1';
	},

	hide: function ()
	{
		this.wrapper.style.webkitTransitionDelay = '200ms';
		this.wrapper.style.opacity = '0';
	},
	
	remove: function ()
	{
		this.wrapper.parentNode.removeChild (this.wrapper);
		return null;
	}
};