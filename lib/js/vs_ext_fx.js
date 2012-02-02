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
(function(e){var e=e.vs,p=e.util,a=e.fx;e.ext.fx.Animation={};var c=new a.Animation(["translateY","0px"]);c.addKeyFrame(0,["0px"]);c.addKeyFrame(20,["0px"]);c.addKeyFrame(40,["-30px"]);c.addKeyFrame(50,["0px"]);c.addKeyFrame(60,["-15px"]);c.addKeyFrame(80,["0px"]);c.duration="1s";var b=new a.Animation(["translateX","0px"]);b.addKeyFrame(0,["0px"]);b.addKeyFrame(10,["-10px"]);b.addKeyFrame(20,["10px"]);b.addKeyFrame(30,["-10px"]);b.addKeyFrame(40,["10px"]);b.addKeyFrame(50,["-10px"]);b.addKeyFrame(60,
["10px"]);b.addKeyFrame(70,["-10px"]);b.addKeyFrame(80,["10px"]);b.addKeyFrame(90,["0px"]);b.duration="1s";var d=new a.Animation(["rotate","0deg"]);d.addKeyFrame(0,["0deg"]);d.addKeyFrame(20,["15deg"]);d.addKeyFrame(40,["-10deg"]);d.addKeyFrame(60,["5deg"]);d.addKeyFrame(80,["-5deg"]);d.duration="1s";d.origin=[50,0];var f=new a.Animation(["scale","1"]);f.addKeyFrame(0,["1"]);f.addKeyFrame(50,["1.1"]);f.addKeyFrame(80,["0.97"]);f.duration="1s";var g=new a.Animation(["perspective","400px"],["rotateX",
"0deg"],["opacity","1"]);g.addKeyFrame(0,["400px","90deg","0"]);g.addKeyFrame(40,["400px","-10deg"]);g.addKeyFrame(70,["400px","10deg"]);g.duration="1s";var i=new a.Animation(["perspective","400px"],["rotateX","90deg"],["opacity","0"]);i.addKeyFrame(0,["400px","0deg","1"]);i.duration="1s";var h=new a.Animation(["perspective","400px"],["rotateY","0deg"],["opacity","1"]);h.addKeyFrame(0,["400px","90deg","0"]);h.addKeyFrame(40,["400px","-10deg"]);h.addKeyFrame(70,["400px","10deg"]);h.duration="1s";var j=
new a.Animation(["perspective","400px"],["rotateY","90deg"],["opacity","0"]);j.addKeyFrame(0,["400px","0deg","1"]);j.duration="1s";var k=new a.Animation(["translateY","0px"],["opacity","1"]);k.addKeyFrame(0,["20px","0"]);k.duration="1s";var l=new a.Animation(["translateY","-20px"],["opacity","0"]);l.addKeyFrame(0,["0px","1"]);l.duration="1s";var m=new a.Animation(["translateY","0px"],["opacity","1"]);m.addKeyFrame(0,["-20px","0"]);m.duration="1s";var n=new a.Animation(["translateY","20px"],["opacity",
"0"]);n.addKeyFrame(0,["0px","1"]);n.duration="1s";var o=new a.Animation(["translateX","0px"],["opacity","1"]);o.addKeyFrame(0,["-20px","0"]);o.duration="1s";a=new a.Animation(["translateX","20px"],["opacity","0"]);a.addKeyFrame(0,["0px","1"]);a.duration="1s";p.extend(e.ext.fx.Animation,{Bounce:c,Shake:b,Swing:d,Pulse:f,FlipInX:g,FlipOutX:i,FlipInY:h,FlipOutY:j,FadeInUp:k,FadeOutUp:l,FadeInDown:m,FadeOutDown:n,FadeInLeft:o,FadeOutLeft:a})})(window);
