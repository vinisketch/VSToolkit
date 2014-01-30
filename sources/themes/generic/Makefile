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
TARGET = ../../..
XTEMP = ../../../tools/manage_template.sh
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
COMPILE_YUI = $(JAVA) -cp $(TARGET)/tools/ext/yuicompressor/jargs-1.0.jar:$(TARGET)/tools/ext/yuicompressor/rhino-1.6R7.jar -jar $(TARGET)/tools/ext/yuicompressor/yuicompressor-2.4.2.jar
COMPILE_LESS = lessc

###                         RELEASE
##############################################################

all :: clean makedirs ui ext av
ifneq ($(DEBUG), 1)
	-$(COMPILE_YUI) ui/ie10.css -o $(TARGET)/lib/css/ie10.css --type css --charset UTF8
	-$(COMPILE_YUI) $(TARGET)/lib_debug/css/vs_ui.css -o $(TARGET)/lib/css/vs_ui.css --type css --charset UTF8
	-$(COMPILE_YUI) $(TARGET)/lib_debug/css/vs_ext.css -o $(TARGET)/lib/css/vs_ext.css --type css --charset UTF8
	-$(COMPILE_YUI) $(TARGET)/lib_debug/css/vs_av.css -o $(TARGET)/lib/css/vs_av.css --type css --charset UTF8
	$(CP) $(TARGET)/lib_debug/css/*.ttf $(TARGET)/lib/css/
	$(CP) $(TARGET)/lib_debug/css/*.eot $(TARGET)/lib/css/
endif

clean:
	-$(RM_RF)  $(TARGET)/lib_debug/css/ie10.css
	-$(RM_RF)  $(TARGET)/lib/css/ie10.css
	-$(RM_RF)  $(TARGET)/lib_debug/css/vs_ui.css
	-$(RM_RF)  $(TARGET)/lib/css/vs_ui.css
	-$(RM_RF)  $(TARGET)/lib_debug/css/vs_av.css
	-$(RM_RF)  $(TARGET)/lib/css/vs_av.css
	-$(RM_RF)  $(TARGET)/lib_debug/css/vs_ext.css
	-$(RM_RF)  $(TARGET)/lib/css/vs_ext.css
	
makedirs:
	-$(MKPATH) $(TARGET)/lib_debug/
	-$(MKPATH) $(TARGET)/lib_debug/css/
	-$(MKPATH) $(TARGET)/lib/
	-$(MKPATH) $(TARGET)/lib/css/

###                         GUI
##############################################################

ui:$(TARGET)/lib_debug/css/vs_ui.css copy_widgets_font
	-$(CP) ui/ie10.css $(TARGET)/lib_debug/css/ie10.css

$(TARGET)/lib_debug/css/vs_ui.css: 
	$(CAT) ui/Application.css >> $@
	$(CAT) ui/View.css >> $@
	$(CAT) ui/SplitView.css >> $@
	$(CAT) ui/ScrollView.css >> $@
	$(CAT) ui/ScrollImageView.css >> $@
	$(CAT) ui/TextLabel.css >> $@
	$(CAT) ui/TextArea.css >> $@
	$(CAT) ui/ScrollBar.css >> $@
	$(CAT) ui/Button.css >> $@
	$(CAT) ui/List.css >> $@
	$(CAT) ui/ComboBox.css >> $@
	$(CAT) ui/RadioButton.css >> $@
	$(CAT) ui/CheckBox.css >> $@
	$(CAT) ui/NavigationBar.css >> $@
	$(CAT) ui/ToolBar.css >> $@
	$(CAT) ui/Canvas.css >> $@
	$(CAT) ui/ProgressBar.css >> $@
	$(CAT) ui/Slider.css >> $@
	$(CAT) ui/ImageView.css >> $@
	$(CAT) ui/InputField.css >> $@
	$(CAT) ui/PopOver.css >> $@
	$(CAT) ui/Switch.css >> $@
	$(CAT) ui/Picker.css >> $@
	$(CAT) ui/SVGView.css >> $@
	$(CAT) ui/SegmentedButton.css >> $@

copy_widgets_font:
	$(CP) ui/*.ttf $(TARGET)/lib_debug/css/
	$(CP) ui/*.eot $(TARGET)/lib_debug/css/

###                     AV
##############################################################

av: $(TARGET)/lib_debug/css/vs_av.css

$(TARGET)/lib_debug/css/vs_av.css:
	$(CAT) av/Video.css >> $@

###                     Extension
##############################################################

ext: $(TARGET)/lib_debug/css/vs_ext.css

$(TARGET)/lib_debug/css/vs_ext.css:
	$(CAT) ext/ui/GMap.css >> $@
	$(CAT) ext/ui/Carousel.css >> $@
	$(CAT) ext/ui/Accordion.css >> $@
