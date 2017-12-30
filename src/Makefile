##############################################################
##                    COPYRIGHT NOTICE
##
##  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and
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

###                     Declaration
##############################################################

SHELL = /bin/sh
CHMOD = chmod
CP = cp
CD = cd
MV = mv
NOOP = $(SHELL) -c true
RM_F = rm -f
RM_RF = rm -rf
TEST_F = test -f
TOUCH = touch
UMASK_NULL = umask 0
DEV_NULL = > /dev/null 2>&1
MKPATH = mkdir -p
CAT = cat
MAKE = make
OPEN = open
ECHO = echo
ECHO_N = echo -n
JAVA = java
export TOOLS_PATH = $(PWD)/../tools/ext
COMPILE = $(JAVA) -jar $(TOOLS_PATH)/closurecompiler/compiler.jar --language_in=ECMASCRIPT5
GENDOC = $(JAVA) -jar $(TOOLS_PATH)/jsdoc-toolkit/jsrun.jar $(TOOLS_PATH)/jsdoc-toolkit/app/run.js

###                         RELEASE
##############################################################

all :: release

Debug :: debug
Release :: release

release :: clean makedirs extern_libs core ui fx data ext av ext_fx doc ../lib_debug/js/vs_webcomponent.js ../lib_debug/js/vs.js themes_release
	-$(COMPILE) --js=../lib_debug/js/vs_util.js --js_output_file=../lib/js/vs_util.js
	-$(COMPILE) --js=../lib_debug/js/vs_webcomponent.js --js_output_file=../lib/js/vs_webcomponent.js
	-$(COMPILE) --js=../lib_debug/js/vs.js --js_output_file=../lib/js/vs.js

debug :: clean_debug makedirs extern_libs core_debug ui_debug fx_debug data_debug ext_debug ext_fx_debug av_debug ../lib_debug/js/vs_webcomponent.js ../lib_debug/js/vs.js themes_debug

themes_release:
	-$(CD) themes;make

themes_debug:
	-$(CD) themes;make DEBUG=1

clean :: clean_debug_libs clean_libs clean_docs
clean_debug :: clean_debug_libs clean_docs

clean_debug_libs:
	-$(RM_RF)  ../lib_debug/js/*.js
	-$(CD) themes;make clean

clean_libs:
	-$(RM_RF)  ../lib/js/*.js
	-$(CD) themes;make clean

clean_docs:
	-$(RM_RF) ../docs/*.html
	-$(RM_RF) ../docs/symbols/*.html

makedirs:
	-$(MKPATH) ../lib_debug/
	-$(MKPATH) ../lib_debug/js/
	-$(MKPATH) ../lib/
	-$(MKPATH) ../lib/js/
	-$(MKPATH) ../docs/symbols/

doc:
	-$(GENDOC) -c=../docs/conf/vs-jsdoc.conf
	-$(RM_F) ../docs/files.html
	-$(CP) ../docs/conf/index.html ../docs/index.html
