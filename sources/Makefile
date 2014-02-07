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
XTEMP = ../tools/manage_template.sh
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
COMPILE_ADV = $(JAVA) -jar $(TOOLS_PATH)/closurecompiler/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS
COMPILE_YUI = $(JAVA) -cp $(TOOLS_PATH)/yuicompressor/jargs-1.0.jar:$(TOOLS_PATH)/yuicompressor/rhino-1.6R7.jar -jar $(TOOLS_PATH)/yuicompressor/yuicompressor-2.4.2.jar
GENDOC = $(JAVA) -jar $(TOOLS_PATH)/jsdoc-toolkit/jsrun.jar $(TOOLS_PATH)/jsdoc-toolkit/app/run.js
COMPILE_LESS = lessc

###                         RELEASE
##############################################################

all :: release

Debug :: debug
Release :: release

release :: clean makedirs extern_libs core ui fx data ext av ext_fx doc ../lib_debug/js/vs_webcomponent.js
	-$(COMPILE) --js=../lib_debug/js/vs_util.js --js_output_file=../lib/js/vs_util.js
	-$(COMPILE) --js=../lib_debug/js/vs_webcomponent.js --js_output_file=../lib/js/vs_webcomponent.js
	-$(CD) themes;make

debug :: clean_debug makedirs extern_libs core_debug ui_debug fx_debug data_debug ext_debug ext_fx_debug av_debug ../lib_debug/js/vs_webcomponent.js
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

###                     Core
##############################################################

core: core_debug
	-$(COMPILE) --js=../lib_debug/js/vs_core.js --js_output_file=../lib/js/vs_core.js

core_debug: ../lib_debug/js/vs_core.js

../lib_debug/js/vs_core.js:
	$(CAT) Header.js >> $@
	$(CAT) core/core.js >> $@
	$(CAT) core/Point.js >> $@
	$(CAT) core/Object.js >> $@
	$(CAT) core/Class.js >> $@
	$(CAT) core/MainLoop.js >> $@
	$(CAT) core/Event.js >> $@
	$(CAT) core/EventSource.js >> $@
	$(CAT) core/Model.js >> $@
	$(CAT) core/Keyboard.js >> $@
	$(CAT) core/FSM.js >> $@
	$(CAT) core/Dataflow.js >> $@
	$(CAT) core/Scheduler.js >> $@
	$(CAT) core/DeviceConfiguration.js >> $@
	$(CAT) core/HTTPRequest.js >> $@
	$(CAT) core/AjaxJSONP.js >> $@
	$(CAT) core/Array.js >> $@
	$(CAT) core/DataStorage.js >> $@
	$(CAT) core/LocalStorage.js >> $@
	$(CAT) core/RestStorage.js >> $@
	$(CAT) Footer.js >> $@

###                         GUI
##############################################################

ui: ui_debug
	-$(COMPILE) --js=../lib_debug/js/vs_ui.js --js_output_file=../lib/js/vs_ui.js

ui_debug: copy_ui_html ../lib_debug/js/vs_ui.js

../lib_debug/js/vs_ui.js: ui/View/View.js ui/Application/Application.js ui/SplitView/SplitView.js ui/TextArea/TextArea.js ui/Button/Button.js ui/List/AbstractList.js ui/List/List.js ui/NavigationBar/NavigationBar.js ui/ToolBar/ToolBar.js ui/Canvas/Canvas.js ui/ProgressBar/ProgressBar.js ui/RadioButton/RadioButton.js ui/ComboBox/ComboBox.js ui/CheckBox/CheckBox.js ui/Slider/Slider.js ui/InputField/InputField.js ui/ScrollView/ScrollView.js ui/TextLabel/TextLabel.js ui/ImageView/ImageView.js ui/PopOver/PopOver.js ui/Switch/Switch.js ui/Picker/Picker.js ui/SVGView/SVGView.js ui/SegmentedButton/SegmentedButton.js
	$(CAT) Header.js >> $@
	$(CAT) ui/UI.js >> $@
	$(CAT) ui/Template.js >> $@
	$(CAT) ui/Recognizers/PointerRecognizer.js >> $@
	$(CAT) ui/Recognizers/RecognizerManager.js >> $@
	$(CAT) ui/Recognizers/TapRecognizer.js >> $@
	$(CAT) ui/Recognizers/DragRecognizer.js >> $@
	$(CAT) ui/Recognizers/PinchRecognizer.js >> $@
	$(CAT) ui/Recognizers/RotationRecognizer.js >> $@
	$(CAT) ui/View/View.js >> $@
	$(CAT) ui/View/ScrollBar.js >> $@
	$(CAT) ui/Application/Application.js >> $@
	$(CAT) ui/SplitView/SplitView.js >> $@
	$(CAT) ui/ScrollView/ScrollManagement.js >> $@
	$(CAT) ui/ScrollView/iscroll4.js >> $@
	$(CAT) ui/ScrollView/ScrollView.js >> $@
	$(CAT) ui/ScrollImageView/ScrollImageView.js >> $@
	$(CAT) ui/TextArea/TextArea.js >> $@
	$(CAT) ui/Button/Button.js >> $@
	$(CAT) ui/List/AbstractList.js >> $@
	$(CAT) ui/List/List.js >> $@
	$(CAT) ui/ComboBox/ComboBox.js >> $@
	$(CAT) ui/RadioButton/RadioButton.js >> $@
	$(CAT) ui/CheckBox/CheckBox.js >> $@
	$(CAT) ui/NavigationBar/NavigationBar.js >> $@
	$(CAT) ui/ToolBar/ToolBar.js >> $@
	$(CAT) ui/TextLabel/TextLabel.js >> $@
	$(CAT) ui/Canvas/Canvas.js >> $@
	$(CAT) ui/ProgressBar/ProgressBar.js >> $@
	$(CAT) ui/Slider/Slider.js >> $@
	$(CAT) ui/ImageView/ImageView.js >> $@
	$(CAT) ui/InputField/InputField.js >> $@
	$(CAT) ui/PopOver/PopOver.js >> $@
	$(CAT) ui/Switch/Switch.js >> $@
	$(CAT) ui/Picker/Picker.js >> $@
	$(CAT) ui/SVGView/SVGView.js >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton.js >> $@
	$(CAT) template.js >> $@
	$(RM_F) template.js
	$(CAT) ui/UI_footer.js >> $@

copy_ui_html: ui/View/View.html ui/SplitView/SplitView.html ui/ScrollImageView/ScrollImageView.html ui/Button/Button.html ui/List/List.html ui/ToolBar/ToolBar.html ui/Canvas/Canvas.html ui/ProgressBar/ProgressBar.html ui/ComboBox/ComboBox.html ui/RadioButton/RadioButton.html ui/CheckBox/CheckBox.html ui/Slider/Slider.html ui/InputField/InputField.html ui/ScrollView/ScrollView.html ui/ImageView/ImageView.html ui/PopOver/PopOver.html ui/Switch/Switch.html ui/Picker/Picker.html ui/SVGView/SVGView.html ui/TextLabel/TextLabel.html ui/SegmentedButton/SegmentedButton.html
	$(RM_F) template.js
	$(XTEMP) View ui/View/View.html
	$(XTEMP) SplitView ui/SplitView/SplitView.html
	$(XTEMP) ScrollView ui/ScrollView/ScrollView.html
	$(XTEMP) ScrollImageView ui/ScrollImageView/ScrollImageView.html
	$(XTEMP) TextArea ui/TextArea/TextArea.html
	$(XTEMP) Button ui/Button/Button.html
	$(XTEMP) List ui/List/List.html
	$(XTEMP) NavigationBar ui/NavigationBar/NavigationBar.html
	$(XTEMP) ToolBar ui/ToolBar/ToolBar.html
	$(XTEMP) Canvas ui/Canvas/Canvas.html
	$(XTEMP) ProgressBar ui/ProgressBar/ProgressBar.html
	$(XTEMP) TextLabel ui/TextLabel/TextLabel.html
	$(XTEMP) RadioButton ui/RadioButton/RadioButton.html
	$(XTEMP) ComboBox ui/ComboBox/ComboBox.html
	$(XTEMP) CheckBox ui/CheckBox/CheckBox.html
	$(XTEMP) Slider ui/Slider/Slider.html
	$(XTEMP) ImageView ui/ImageView/ImageView.html
	$(XTEMP) InputField ui/InputField/InputField.html
	$(XTEMP) PopOver ui/PopOver/PopOver.html
	$(XTEMP) Switch ui/Switch/Switch.html
	$(XTEMP) Picker ui/Picker/Picker.html
	$(XTEMP) SegmentedButton ui/SegmentedButton/SegmentedButton.html
	$(XTEMP) SVGView ui/SVGView/SVGView.html

###                     FX
##############################################################

fx: fx_debug
	-$(COMPILE) --js=../lib_debug/js/vs_fx.js --js_output_file=../lib/js/vs_fx.js

fx_debug: ../lib_debug/js/vs_fx.js

../lib_debug/js/vs_fx.js: fx/FX.js fx/Animation.js
	$(CAT) Header.js >> $@
	$(CAT) fx/FX.js >> $@
	$(CAT) fx/Animation.js >> $@
	$(CAT) fx/Controller.js >> $@
	$(CAT) fx/StackController.js >> $@
	$(CAT) fx/SlideController.js >> $@
	$(CAT) fx/SwipeController.js >> $@
	$(CAT) fx/NavigationController.js >> $@
	$(CAT) fx/CardController.js >> $@
	$(CAT) fx/CubicController.js >> $@
	$(CAT) fx/OpacityController.js >> $@
	$(CAT) Footer.js >> $@

###                     Data
##############################################################

data: data_debug
	-$(COMPILE) --js=../lib_debug/js/vs_data.js --js_output_file=../lib/js/vs_data.js

data_debug: ../lib_debug/js/vs_data.js

../lib_debug/js/vs_data.js: data/Data.js data/URL.js data/GoogleSearch.js data/GoogleSearch.js
	$(CAT) Header.js >> $@
	$(CAT) data/Data.js >> $@
	$(CAT) data/URL.js >> $@
	$(CAT) data/RSSRequester.js >> $@
	$(CAT) data/GoogleSearch.js >> $@
	$(CAT) Footer.js >> $@

###                     AV
##############################################################

av: av_debug
	-$(COMPILE) --js=../lib_debug/js/vs_av.js --js_output_file=../lib/js/vs_av.js

av_debug: copy_av_html ../lib_debug/js/vs_av.js

../lib_debug/js/vs_av.js: av/AV.js av/Video/Video.js av/Audio.js
	$(CAT) Header.js >> $@
	$(CAT) av/AV.js >> $@
	$(CAT) av/Video/Video.js >> $@
	$(CAT) av/Audio.js >> $@
	$(CAT) template.js >> $@
	$(RM_F) template.js
	$(CAT) Footer.js >> $@

copy_av_html: av/Video/Video.html
	$(RM_F) template.js
	$(XTEMP) Video av/Video/Video.html

###                     Extension
##############################################################

ext: ext_debug
	-$(COMPILE) --js=../lib_debug/js/vs_ext.js --js_output_file=../lib/js/vs_ext.js

ext_debug: copy_ext_ui_html ../lib_debug/js/vs_ext.js

../lib_debug/js/vs_ext.js: ext/Ext.js ext/ui/GMap/GMap.js ext/ui/Carousel/Carousel.js
	$(CAT) Header.js >> $@
	$(CAT) ext/Ext.js >> $@
	$(CAT) ext/ui/GMap/GMap.js >> $@
	$(CAT) ext/ui/Carousel/Carousel.js >> $@
	$(CAT) ext/ui/Accordion/Accordion.js >> $@
	$(CAT) template.js >> $@
	$(RM_F) template.js
	$(CAT) Footer.js >> $@
	
copy_ext_ui_html: ext/ui/GMap/GMap.html
	$(RM_F) template.js
	$(XTEMP) GMap ext/ui/GMap/GMap.html
	$(XTEMP) Carousel ext/ui/Carousel/Carousel.html
	$(XTEMP) Accordion ext/ui/Accordion/Accordion.html

ext_fx: ext_fx_debug
	-$(COMPILE) --js=../lib_debug/js/vs_ext_fx.js --js_output_file=../lib/js/vs_ext_fx.js

ext_fx_debug: ../lib_debug/js/vs_ext_fx.js

../lib_debug/js/vs_ext_fx.js: ext/Ext.js ext/fx/Animation.js
	$(CAT) Header.js >> $@
	$(CAT) ext/Ext.js >> $@
	$(CAT) ext/fx/Animation.js >> $@
	$(CAT) Footer.js >> $@

###                    libs
##############################################################

extern_libs: ../lib_debug/js/vs_util.js ../lib_debug/js/vs_transform.js ../lib_debug/js/vs_gesture.js
	$(CAT) VS.js >> ../lib_debug/js/vs_tmp.js
	$(CAT) ../lib_debug/js/firminCSSMatrix.js >> ../lib_debug/js/vs_tmp.js
	$(CAT) ../lib_debug/js/vs_util.js >> ../lib_debug/js/vs_tmp.js
	$(CAT) ../lib_debug/js/vs_transform.js >> ../lib_debug/js/vs_tmp.js
	$(CAT) ../lib_debug/js/vs_gesture.js >> ../lib_debug/js/vs_tmp.js
	$(RM) ../lib_debug/js/firminCSSMatrix.js
	$(RM) ../lib_debug/js/vs_util.js
	$(RM) ../lib_debug/js/vs_transform.js
	$(RM) ../lib_debug/js/vs_gesture.js
	$(MV) ../lib_debug/js/vs_tmp.js ../lib_debug/js/vs_util.js

../lib_debug/js/vs_util.js:
	-$(MKPATH) tmp/
	git clone https://github.com/dthevenin/Util.git tmp
	-$(CP) tmp/build/vs_util.js ../lib_debug/js/vs_util.js
	-$(CP) tmp/build/firminCSSMatrix.js ../lib_debug/js/firminCSSMatrix.js
	-$(RM_RF) tmp

../lib_debug/js/vs_transform.js:
	-$(MKPATH) tmp/
	git clone https://github.com/dthevenin/Transform.git tmp
	-$(CP) tmp/build/vs_transform.js ../lib_debug/js/vs_transform.js
	-$(RM_RF) tmp

../lib_debug/js/vs_gesture.js:
	-$(MKPATH) tmp/
	git clone https://github.com/dthevenin/Gesture.git tmp
	-$(CP) tmp/build/vs_gesture.js ../lib_debug/js/vs_gesture.js
	-$(RM_RF) tmp

###                    WebComponent
##############################################################

../lib_debug/js/vs_webcomponent.js:
	$(CAT) web_comp/polymer/Scope.js >> $@
	$(CAT) web_comp/polymer/Boot.js >> $@
	$(CAT) web_comp/polymer/Observer.js >> $@
	$(CAT) web_comp/polymer/Parser.js >> $@
	$(CAT) web_comp/polymer/CustomElements.js >> $@
	$(CAT) web_comp/CustonElements.js >> $@
