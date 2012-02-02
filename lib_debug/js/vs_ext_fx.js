/** @license
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

(function (window, undefined) {

var document = window.document;

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

/********************************************************************
                   
*********************************************************************/
/** @private */
var vs = window.vs,
  util = vs.util,
  core = vs.core,
  ui = vs.ui,
  fx = vs.fx,
  ext = vs.ext,
  ext_ui = ext.ui,
  ext_fx = ext.fx;
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
  
  Animations are inspired by http://daneden.me/animate 
  Copyright (c) 2011 Dan Eden
*/

/*************************************************************
                Predefined animation
*************************************************************/

/**
 *  Animation namespace
 *  @namespace
 */
vs.ext.fx.Animation = {};

/**
 *  Slide a object to right.
 *  @name Bounce
 *  @memberOf vs.ext.fx.Animation
 *  @type vs.fx.Animation
 */
var Bounce = new fx.Animation (['translateY', '0px']);
Bounce.addKeyFrame (0, ['0px']);
Bounce.addKeyFrame (20, ['0px']);
Bounce.addKeyFrame (40, ['-30px']);
Bounce.addKeyFrame (50, ['0px']);
Bounce.addKeyFrame (60, ['-15px']);
Bounce.addKeyFrame (80, ['0px']);
Bounce.duration = '1s';

/**
 *  Slide a object to right.
 *  @memberOf vs.ext.fx.Animation
 *  @type vs.fx.Animation
 */
var Shake = new fx.Animation (['translateX', '0px']);
Shake.addKeyFrame (0, ['0px']);
Shake.addKeyFrame (10, ['-10px']);
Shake.addKeyFrame (20, ['10px']);
Shake.addKeyFrame (30, ['-10px']);
Shake.addKeyFrame (40, ['10px']);
Shake.addKeyFrame (50, ['-10px']);
Shake.addKeyFrame (60, ['10px']);
Shake.addKeyFrame (70, ['-10px']);
Shake.addKeyFrame (80, ['10px']);
Shake.addKeyFrame (90, ['0px']);
Shake.duration = '1s';

/**
 *  Swing
 * @name vs.ext.fx.Animation.Swing
 *  @type vs.fx.Animation
 */
var Swing = new fx.Animation (['rotate', '0deg']);
Swing.addKeyFrame (0, ['0deg']);
Swing.addKeyFrame (20, ['15deg']);
Swing.addKeyFrame (40, ['-10deg']);
Swing.addKeyFrame (60, ['5deg']);
Swing.addKeyFrame (80, ['-5deg']);
Swing.duration = '1s';
Swing.origin = [50, 0];

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.Pulse
 *  @type vs.fx.Animation
 */
var Pulse = new fx.Animation (['scale', '1']);
Pulse.addKeyFrame (0, ['1']);
Pulse.addKeyFrame (50, ['1.1']);
Pulse.addKeyFrame (80, ['0.97']);
Pulse.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipInX
 *  @type vs.fx.Animation
 */
var FlipInX = new fx.Animation (['perspective', '400px'], ['rotateX', '0deg'], ['opacity', '1']);
FlipInX.addKeyFrame (0, ['400px','90deg','0']);
FlipInX.addKeyFrame (40, ['400px','-10deg']);
FlipInX.addKeyFrame (70, ['400px','10deg']);
FlipInX.duration = '1s';


/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipOutX
 *  @type vs.fx.Animation
 */
var FlipOutX = new fx.Animation (['perspective', '400px'], ['rotateX', '90deg'], ['opacity', '0']);
FlipOutX.addKeyFrame (0, ['400px','0deg','1']);
FlipOutX.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipInY
 *  @type vs.fx.Animation
 */
var FlipInY = new fx.Animation (['perspective', '400px'], ['rotateY', '0deg'], ['opacity', '1']);
FlipInY.addKeyFrame (0, ['400px','90deg','0']);
FlipInY.addKeyFrame (40, ['400px','-10deg']);
FlipInY.addKeyFrame (70, ['400px','10deg']);
FlipInY.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FlipOutY
 *  @type vs.fx.Animation
 */
var FlipOutY = new fx.Animation (['perspective', '400px'], ['rotateY', '90deg'], ['opacity', '0']);
FlipOutY.addKeyFrame (0, ['400px','0deg','1']);
FlipOutY.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeInUp
 *  @type vs.fx.Animation
 */
var FadeInUp = new fx.Animation (['translateY', '0px'], ['opacity', '1']);
FadeInUp.addKeyFrame (0, ['20px','0']);
FadeInUp.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeOutUp
 *  @type vs.fx.Animation
 */
var FadeOutUp = new fx.Animation (['translateY', '-20px'], ['opacity', '0']);
FadeOutUp.addKeyFrame (0, ['0px','1']);
FadeOutUp.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeInDown
 *  @type vs.fx.Animation
 */
var FadeInDown = new fx.Animation (['translateY', '0px'], ['opacity', '1']);
FadeInDown.addKeyFrame (0, ['-20px','0']);
FadeInDown.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeOutDown
 *  @type vs.fx.Animation
 */
var FadeOutDown = new fx.Animation (['translateY', '20px'], ['opacity', '0']);
FadeOutDown.addKeyFrame (0, ['0px','1']);
FadeOutDown.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeInLeft
 *  @type vs.fx.Animation
 */
var FadeInLeft = new fx.Animation (['translateX', '0px'], ['opacity', '1']);
FadeInLeft.addKeyFrame (0, ['-20px','0']);
FadeInLeft.duration = '1s';

/**
 *  Slide a object to right.
 * @name vs.ext.fx.Animation.FadeOutLeft
 *  @type vs.fx.Animation
 */
var FadeOutLeft = new fx.Animation (['translateX', '20px'], ['opacity', '0']);
FadeOutLeft.addKeyFrame (0, ['0px','1']);
FadeOutLeft.duration = '1s';

/********************************************************************
                      Export
*********************************************************************/
/** private */
util.extend (vs.ext.fx.Animation, {
  Bounce:     Bounce,
  Shake:      Shake,
  Swing:      Swing,
  Pulse:      Pulse,
  FlipInX:    FlipInX,
  FlipOutX:   FlipOutX,
  FlipInY:    FlipInY,
  FlipOutY:   FlipOutY,
  FadeInUp:    FadeInUp,
  FadeOutUp:   FadeOutUp,
  FadeInDown:    FadeInDown,
  FadeOutDown:   FadeOutDown,
  FadeInLeft:    FadeInLeft,
  FadeOutLeft:   FadeOutLeft
});

})(window);