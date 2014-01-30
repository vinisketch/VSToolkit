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
COMPILE_YUI = $(JAVA) -cp $(TOOLS_PATH)/yuicompressor/jargs-1.0.jar:$(TOOLS_PATH)/yuicompressor/rhino-1.6R7.jar -jar $(TOOLS_PATH)/yuicompressor/yuicompressor-2.4.2.jar
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
	$(CP) $(TARGET)/lib_debug/css/*.png $(TARGET)/lib/css/
	$(CP) -r $(TARGET)/lib_debug/css/toolbar_icons $(TARGET)/lib/css/
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

ui:$(TARGET)/lib_debug/css/vs_ui.less copy_widgets_font
	-$(COMPILE_LESS) $(TARGET)/lib_debug/css/vs_ui.less $(TARGET)/lib_debug/css/vs_ui.css
	-$(RM_F)  $(TARGET)/lib_debug/css/vs_ui.less
	-$(CP) ui/ie10.css $(TARGET)/lib_debug/css/ie10.css

$(TARGET)/lib_debug/css/vs_ui.less: 
	$(CAT) lesshat.less >> $@
	$(CAT) lesshat-ext.less >> $@
	$(CAT) ui/Application.less >> $@
	$(CAT) ui/View.less >> $@
	$(CAT) ui/SplitView.less >> $@
	$(CAT) ui/ScrollView.less >> $@
	$(CAT) ui/ScrollImageView.less >> $@
	$(CAT) ui/TextLabel.less >> $@
	$(CAT) ui/TextArea.less >> $@
	$(CAT) ui/ScrollBar.less >> $@
	$(CAT) ui/Button.less >> $@
	$(CAT) ui/List.less >> $@
	$(CAT) ui/ComboBox.less >> $@
	$(CAT) ui/RadioButton.less >> $@
	$(CAT) ui/CheckBox.less >> $@
	$(CAT) ui/NavigationBar.less >> $@
	$(CAT) ui/ToolBar.less >> $@
	$(CAT) ui/Canvas.less >> $@
	$(CAT) ui/ProgressBar.less >> $@
	$(CAT) ui/Slider.less >> $@
	$(CAT) ui/ImageView.less >> $@
	$(CAT) ui/InputField.less >> $@
	$(CAT) ui/PopOver.less >> $@
	$(CAT) ui/Switch.less >> $@
	$(CAT) ui/Picker.less >> $@
	$(CAT) ui/SVGView.less >> $@
	$(CAT) ui/SegmentedButton.less >> $@

copy_widgets_font:
	$(CP) ui/*.ttf $(TARGET)/lib_debug/css/
	$(CP) ui/*.eot $(TARGET)/lib_debug/css/
	$(CP) ui/*.png $(TARGET)/lib_debug/css/
	$(CP) -r ui/toolbar_icons $(TARGET)/lib_debug/css/

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
