##############################################################
##                    COPYRIGHT NOTICE
##
##  Copyright (C) 2009-2014. David Thevenin, ViniSketch SARL (c), and
##  contributors. All rights reserved
##
##  This program is free software: you can redistribute it and/or modify
##  it under the terms of the GNU Lesser General Public License as published
##  by the Free Software Foundation, either version 3 of the License, or
##  (at your option) any later version.
##
##  This program is distributed in the hope that it will be useful,
##  but WITHOUT ANY WARRANTY; without even the implied warranty of
##  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
##  GNU Lesser General Public License for more details.
##
##  You should have received a copy of the GNU Lesser General Public License
##  along with this program. If not, see <http://www.gnu.org/licenses/>.
##############################################################

CD = cd
TARGET = ../..
RM_RF = rm -rf

all :: all_themes

Debug :: debug
debug ::
	make all_themes DEBUG=1
	
Release :: release
release ::
	make all_themes 

clean:
	-$(CD) generic;make clean
	-$(CD) ios;make clean
	-$(CD) ios7;make clean
	-$(CD) android;make clean
	-$(CD) blackberry;make clean
	-$(CD) pure;make clean
	-$(CD) flat;make clean
	-$(RM_RF)  $(TARGET)/lib_debug/css/*.png
	-$(RM_RF)  $(TARGET)/lib/css/*.png
	-$(RM_RF)  $(TARGET)/lib_debug/css/*.ttf
	-$(RM_RF)  $(TARGET)/lib/css/*.ttf
	-$(RM_RF)  $(TARGET)/lib_debug/css/*.eot
	-$(RM_RF)  $(TARGET)/lib/css/*.eot

all_themes:
	-$(CD) generic;make
	-$(CD) ios;make
	-$(CD) ios7;make
	-$(CD) android;make
	-$(CD) blackberry;make
	-$(CD) pure;make
	-$(CD) flat;make

