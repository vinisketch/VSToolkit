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
COMPILE = $(JAVA) -jar ../tools/ext/closurecompiler/compiler.jar --language_in=ECMASCRIPT5
COMPILE_ADV = $(JAVA) -jar ../tools/ext/closurecompiler/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS
COMPILE_YUI = $(JAVA) -cp ../../../lib/yuicompressor/jargs-1.0.jar:../tools/ext/yuicompressor/rhino-1.6R7.jar -jar ../tools/ext/yuicompressor/yuicompressor-2.4.2.jar
GENDOC = $(JAVA) -jar ../tools/ext/jsdoc-toolkit/jsrun.jar ../tools/ext/jsdoc-toolkit/app/run.js
COMPILE_LESS = lessc

###                         RELEASE
##############################################################

all :: release

Debug :: debug
Release :: release

release :: clean makedirs extern_libs core ui fx data ext av ext_fx doc
	-$(COMPILE) --js=../lib_debug/js/vs_util.js --js_output_file=../lib/js/vs_util.js
	-$(CP) ../lib_debug/css/*.png ../lib/css/
	-$(CP) ../lib_debug/css/*.ttf ../lib/css/
	-$(CP) ../lib_debug/css/*.eot ../lib/css/
	-$(MKPATH) ../lib/css/toolbar_icons
	-$(CP) ../lib_debug/css/toolbar_icons/*.png ../lib/css/toolbar_icons/

debug :: clean_debug makedirs extern_libs core_debug ui_debug fx_debug data_debug ext_debug ext_fx_debug av_debug

clean :: clean_debug_libs clean_libs clean_docs
clean_debug :: clean_debug_libs clean_docs

clean_debug_libs:
	-$(RM_RF)  ../lib_debug/css/*.css
	-$(RM_RF)  ../lib_debug/css/*.png
	-$(RM_RF)  ../lib_debug/css/*.ttf
	-$(RM_RF)  ../lib_debug/css/*.eot
	-$(RM_RF)  ../lib_debug/css/toolbar_icons
	-$(RM_RF)  ../lib_debug/js/*.js

clean_libs:
	-$(RM_RF)  ../lib/css/*.css
	-$(RM_RF)  ../lib/css/*.png
	-$(RM_RF)  ../lib/css/*.ttf
	-$(RM_RF)  ../lib/css/*.eot
	-$(RM_RF)  ../lib/css/toolbar_icons
	-$(RM_RF)  ../lib/js/*.js

clean_docs:
	-$(RM_RF) ../docs/*.html
	-$(RM_RF) ../docs/symbols/*.html

makedirs:
	-$(MKPATH) ../lib_debug/
	-$(MKPATH) ../lib_debug/js/
	-$(MKPATH) ../lib_debug/css/
	-$(MKPATH) ../lib/
	-$(MKPATH) ../lib/js/
	-$(MKPATH) ../lib/css/
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

../lib_debug/js/vs_core.js: core/dataflow.js core/MainLoop.js core/Event.js core/EventSource.js core/Object.js core/Class.js core/Model.js core/Keyboard.js core/FSM.js core/Scheduler.js core/HTTPRequest.js core/AjaxJSONP.js core/DeviceConfiguration.js core/Array.js core/DataStorage.js core/LocalStorage.js
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
	-$(COMPILE_YUI) ui/view/ie10.css -o ../lib/css/ie10.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui.css -o ../lib/css/vs_ui.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui_ios.css -o ../lib/css/vs_ui_ios.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui_android.css -o ../lib/css/vs_ui_android.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui_pure.css -o ../lib/css/vs_ui_pure.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui_bb.css -o ../lib/css/vs_ui_bb.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui_pure.css -o ../lib/css/vs_ui_pure.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ui_ios7.css -o ../lib/css/vs_ui_ios7.css --type css --charset UTF8

ui_debug: copy_ui_html ../lib_debug/js/vs_ui.js ../lib_debug/css/vs_ui.css ../lib_debug/css/vs_ui_ios.css ../lib_debug/css/vs_ui_android.css ../lib_debug/css/vs_ui_pure.less ../lib_debug/css/vs_ui_bb.css ../lib_debug/css/vs_ui_ios7.less copy_ui_img copy_widgets_font
	-$(CP) ui/view/ie10.css ../lib_debug/css/ie10.css
	-$(COMPILE_LESS) ../lib_debug/css/vs_ui_pure.less ../lib_debug/css/vs_ui_pure.css
	-$(RM_F) ../lib_debug/css/vs_ui_pure.less
	-$(COMPILE_LESS) ../lib_debug/css/vs_ui_ios7.less ../lib_debug/css/vs_ui_ios7.css
	-$(RM_F) ../lib_debug/css/vs_ui_ios7.less

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

../lib_debug/css/vs_ui.css: ui/View/View.css ui/SplitView/SplitView.css ui/ScrollImageView/ScrollImageView.css ui/Button/Button.css ui/List/List.css ui/NavigationBar/NavigationBar.css ui/TextLabel/TextLabel.css ui/ToolBar/ToolBar.css ui/Canvas/Canvas.css ui/ProgressBar/ProgressBar.css ui/Application/Application.css ui/View/ScrollBar.css ui/ComboBox/ComboBox.css ui/RadioButton/RadioButton.css ui/CheckBox/CheckBox.css ui/Slider/Slider.css ui/InputField/InputField.css ui/ScrollView/ScrollView.css ui/ImageView/ImageView.css ui/PopOver/PopOver.css  ui/Switch/Switch.css ui/Picker/Picker.css ui/SVGView/SVGView.css ui/SegmentedButton/SegmentedButton.css
	$(CAT) ui/Application/Application.css >> $@
	$(CAT) ui/View/View.css >> $@
	$(CAT) ui/SplitView/SplitView.css >> $@
	$(CAT) ui/ScrollView/ScrollView.css >> $@
	$(CAT) ui/ScrollImageView/ScrollImageView.css >> $@
	$(CAT) ui/TextLabel/TextLabel.css >> $@
	$(CAT) ui/TextArea/TextArea.css >> $@
	$(CAT) ui/View/ScrollBar.css >> $@
	$(CAT) ui/Button/Button.css >> $@
	$(CAT) ui/List/List.css >> $@
	$(CAT) ui/ComboBox/ComboBox.css >> $@
	$(CAT) ui/RadioButton/RadioButton.css >> $@
	$(CAT) ui/CheckBox/CheckBox.css >> $@
	$(CAT) ui/NavigationBar/NavigationBar.css >> $@
	$(CAT) ui/ToolBar/ToolBar.css >> $@
	$(CAT) ui/Canvas/Canvas.css >> $@
	$(CAT) ui/ProgressBar/ProgressBar.css >> $@
	$(CAT) ui/Slider/Slider.css >> $@
	$(CAT) ui/ImageView/ImageView.css >> $@
	$(CAT) ui/InputField/InputField.css >> $@
	$(CAT) ui/PopOver/PopOver.css >> $@
	$(CAT) ui/Switch/Switch.css >> $@
	$(CAT) ui/Picker/Picker.css >> $@
	$(CAT) ui/SVGView/SVGView.css >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton.css >> $@

../lib_debug/css/vs_ui_ios.css: ui/Application/Application_ios.css ui/Button/Button_ios.css ui/List/List_ios.css ui/NavigationBar/NavigationBar_ios.css ui/RadioButton/RadioButton_ios.css ui/CheckBox/CheckBox_ios.css ui/Slider/Slider_ios.css ui/ProgressBar/ProgressBar_ios.css ui/InputField/InputField_ios.css ui/TextArea/TextArea_ios.css ui/Picker/Picker_ios.css ui/Switch/Switch_ios.css ui/ComboBox/ComboBox_ios.css ui/PopOver/PopOver_ios.css ui/SegmentedButton/SegmentedButton_ios.css
	$(CAT) ui/Application/Application_ios.css >> $@
	$(CAT) ui/Button/Button_ios.css >> $@
	$(CAT) ui/List/List_ios.css >> $@
	$(CAT) ui/RadioButton/RadioButton_ios.css >> $@
	$(CAT) ui/NavigationBar/NavigationBar_ios.css >> $@
	$(CAT) ui/CheckBox/CheckBox_ios.css >> $@
	$(CAT) ui/Slider/Slider_ios.css >> $@
	$(CAT) ui/ProgressBar/ProgressBar_ios.css >> $@
	$(CAT) ui/InputField/InputField_ios.css >> $@
	$(CAT) ui/Picker/Picker_ios.css >> $@
	$(CAT) ui/Switch/Switch_ios.css >> $@
	$(CAT) ui/TextArea/TextArea_ios.css >> $@
	$(CAT) ui/ComboBox/ComboBox_ios.css >> $@
	$(CAT) ui/PopOver/PopOver_ios.css >> $@
	$(CAT) ui/ToolBar/ToolBar_ios.css >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton_ios.css >> $@

../lib_debug/css/vs_ui_android.css: ui/Application/Application_android.css ui/Button/Button_android.css ui/List/List_android.css ui/NavigationBar/NavigationBar_android.css ui/RadioButton/RadioButton_android.css ui/CheckBox/CheckBox_android.css ui/Slider/Slider_android.css ui/ProgressBar/ProgressBar_android.css ui/InputField/InputField_android.css ui/Picker/Picker_android.css ui/Switch/Switch_android.css ui/ComboBox/ComboBox_android.css ui/PopOver/PopOver_android.css ui/TextArea/TextArea_android.css ui/SegmentedButton/SegmentedButton_android.css
	$(CAT) ui/Application/Application_android.css >> $@
	$(CAT) ui/Button/Button_android.css >> $@
	$(CAT) ui/List/List_android.css >> $@
	$(CAT) ui/RadioButton/RadioButton_android.css >> $@
	$(CAT) ui/NavigationBar/NavigationBar_android.css >> $@
	$(CAT) ui/CheckBox/CheckBox_android.css >> $@
	$(CAT) ui/Slider/Slider_android.css >> $@
	$(CAT) ui/ProgressBar/ProgressBar_android.css >> $@
	$(CAT) ui/InputField/InputField_android.css >> $@
	$(CAT) ui/Picker/Picker_android.css >> $@
	$(CAT) ui/ComboBox/ComboBox_android.css >> $@
	$(CAT) ui/Switch/Switch_android.css >> $@
	$(CAT) ui/TextArea/TextArea_android.css >> $@
	$(CAT) ui/PopOver/PopOver_android.css >> $@
	$(CAT) ui/ToolBar/ToolBar_android.css >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton_android.css >> $@

../lib_debug/css/vs_ui_pure.less: ui/View/lesshat.less ui/View/View.less ui/Application/Application_pure.less ui/Button/Button_pure.less ui/List/List_pure.less ui/InputField/InputField_pure.less ui/Switch/Switch_pure.less ui/TextArea/TextArea_pure.less ui/SegmentedButton/SegmentedButton_pure.less ui/Slider/Slider_pure.less ui/ProgressBar/ProgressBar_pure.less ui/NavigationBar/NavigationBar_pure.less ui/Picker/Picker_pure.less
	$(CAT) ui/View/lesshat.less >> $@
	$(CAT) ui/View/lesshat-ext.less >> $@
	$(CAT) ui/View/View.less >> $@
	$(CAT) ui/SplitView/SplitView.less >> $@
	$(CAT) ui/Application/Application_pure.less >> $@
	$(CAT) ui/Button/Button_pure.less >> $@
	$(CAT) ui/List/List_pure.less >> $@
	$(CAT) ui/InputField/InputField_pure.less >> $@
	$(CAT) ui/Switch/Switch_pure.less >> $@
	$(CAT) ui/TextArea/TextArea_pure.less >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton_pure.less >> $@
	$(CAT) ui/Slider/Slider_pure.less >> $@
	$(CAT) ui/ProgressBar/ProgressBar_pure.less >> $@
	$(CAT) ui/RadioButton/RadioButton_pure.less>> $@
	$(CAT) ui/NavigationBar/NavigationBar_pure.less >> $@
	$(CAT) ui/CheckBox/CheckBox_pure.less >> $@
	$(CAT) ui/Picker/Picker_pure.less >> $@
	$(CAT) ui/ComboBox/ComboBox_pure.less >> $@
#	$(CAT) ui/PopOver/PopOver_android.css >> $@
#	$(CAT) ui/ToolBar/ToolBar_android.css >> $@

../lib_debug/css/vs_ui_bb.css: ui/Application/Application_bb.css ui/Button/Button_bb.css ui/List/List_bb.css  ui/RadioButton/RadioButton_bb.css ui/CheckBox/CheckBox_bb.css ui/Slider/Slider_bb.css ui/Switch/Switch_bb.css ui/ProgressBar/ProgressBar_bb.css ui/InputField/InputField_bb.css ui/ComboBox/ComboBox_bb.css ui/SegmentedButton/SegmentedButton_bb.css ui/TextArea/TextArea_bb.css ui/Picker/Picker_bb.css ext/ui/Accordion/Accordion_bb.css
	$(CAT) ui/Application/Application_bb.css >> $@
	$(CAT) ui/Button/Button_bb.css >> $@
	$(CAT) ui/List/List_bb.css >> $@
	$(CAT) ui/RadioButton/RadioButton_bb.css >> $@
	$(CAT) ui/CheckBox/CheckBox_bb.css >> $@
	$(CAT) ui/Slider/Slider_bb.css >> $@
	$(CAT) ui/Switch/Switch_bb.css >> $@
	$(CAT) ui/TextArea/TextArea_bb.css >> $@
	$(CAT) ui/ProgressBar/ProgressBar_bb.css >> $@
	$(CAT) ui/InputField/InputField_bb.css >> $@
	$(CAT) ui/ComboBox/ComboBox_bb.css >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton_bb.css >> $@
	$(CAT) ui/Picker/Picker_bb.css >> $@
	$(CAT) ext/ui/Accordion/Accordion_bb.css >> $@

copy_ui_img:
	$(CP) ui/ComboBox/iOS* ../lib_debug/css
	$(CP) ui/Button/bb* ../lib_debug/css
	$(CP) ui/List/SimpleList* ../lib_debug/css
	$(CP) ui/List/PanelTitle.png ../lib_debug/css
	$(CP) ui/ToolBar/ToolBarG* ../lib_debug/css
	$(CP) ui/RadioButton/android* ../lib_debug/css
	$(CP) ui/RadioButton/iOS* ../lib_debug/css
	$(CP) ui/CheckBox/android* ../lib_debug/css
	$(CP) ui/CheckBox/iOS* ../lib_debug/css
	$(CP) ui/List/DefaultTabListTitle.png ../lib_debug/css
	$(CP) ui/List/SimpleListNext.png ../lib_debug/css
	$(CP) ui/List/SimpleListNextSel.png ../lib_debug/css
	$(CP) ui/List/DefaultListAndroid.png ../lib_debug/css
	$(CP) ui/InputField/FieldCancel.png ../lib_debug/css
	$(CP) ui/PopOver/iOS* ../lib_debug/css
	$(CP) ui/Picker/iOS* ../lib_debug/css
	-$(MKPATH) ../lib_debug/css/toolbar_icons/
	$(CP) -r ui/ToolBar/toolbar_icons/*.png ../lib_debug/css/toolbar_icons/

copy_widgets_font:
	$(CP) ui/Application/*.ttf ../lib_debug/css/
	$(CP) ui/Application/*.eot ../lib_debug/css/

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
	-$(COMPILE_YUI) ../lib_debug/css/vs_av.css -o ../lib/css/vs_av.css --type css --charset UTF8

av_debug: copy_av_html ../lib_debug/js/vs_av.js ../lib_debug/css/vs_av.css

../lib_debug/js/vs_av.js: av/AV.js av/Video/Video.js av/Audio.js
	$(CAT) Header.js >> $@
	$(CAT) av/AV.js >> $@
	$(CAT) av/Video/Video.js >> $@
	$(CAT) av/Audio.js >> $@
	$(CAT) template.js >> $@
	$(RM_F) template.js
	$(CAT) Footer.js >> $@

../lib_debug/css/vs_av.css:
	$(CAT) av/Video/Video.css >> $@

copy_av_html: av/Video/Video.html
	$(RM_F) template.js
	$(XTEMP) Video av/Video/Video.html

###                     Extension
##############################################################

ext: ext_debug
	-$(COMPILE) --js=../lib_debug/js/vs_ext.js --js_output_file=../lib/js/vs_ext.js
	-$(COMPILE_YUI) ../lib_debug/css/vs_ext.css -o ../lib/css/vs_ext.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ext_ios.css -o ../lib/css/vs_ext_ios.css --type css --charset UTF8
	-$(COMPILE_YUI) ../lib_debug/css/vs_ext_android.css -o ../lib/css/vs_ext_android.css --type css --charset UTF8

ext_debug: copy_ext_ui_html ../lib_debug/js/vs_ext.js ../lib_debug/css/vs_ext.css ../lib_debug/css/vs_ext_ios.css ../lib_debug/css/vs_ext_android.css copy_ext_ui_img

../lib_debug/js/vs_ext.js: ext/Ext.js ext/ui/GMap/GMap.js ext/ui/Carousel/Carousel.js
	$(CAT) Header.js >> $@
	$(CAT) ext/Ext.js >> $@
	$(CAT) ext/ui/GMap/GMap.js >> $@
	$(CAT) ext/ui/Carousel/Carousel.js >> $@
	$(CAT) ext/ui/Accordion/Accordion.js >> $@
	$(CAT) template.js >> $@
	$(RM_F) template.js
	$(CAT) Footer.js >> $@

../lib_debug/css/vs_ext.css:
	$(CAT) ext/ui/GMap/GMap.css >> $@
	$(CAT) ext/ui/Carousel/Carousel.css >> $@
	$(CAT) ext/ui/Accordion/Accordion.css >> $@

../lib_debug/css/vs_ext_ios.css:
	$(CAT) ext/ui/GMap/GMap_ios.css >> $@
	$(CAT) ext/ui/Accordion/Accordion_ios.css >> $@

../lib_debug/css/vs_ext_android.css:
	$(CAT) ext/ui/GMap/GMap_android.css >> $@
	$(CAT) ext/ui/Accordion/Accordion_android.css >> $@

copy_ext_ui_html: ext/ui/GMap/GMap.html
	$(RM_F) template.js
	$(XTEMP) GMap ext/ui/GMap/GMap.html
	$(XTEMP) Carousel ext/ui/Carousel/Carousel.html
	$(XTEMP) Accordion ext/ui/Accordion/Accordion.html

copy_ext_ui_img:
	$(CP) ext/ui/GMap/ios_marker.png ../lib_debug/css

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






ios7: ../lib_debug/css/vs_ui_ios7.less
	-$(COMPILE_LESS) ../lib_debug/css/vs_ui_ios7.less ../lib_debug/css/vs_ui_ios7.css
	-$(RM_F) ../lib_debug/css/vs_ui_ios7.less


../lib_debug/css/vs_ui_ios7.less:
	$(CAT) ui/View/lesshat.less >> $@
	$(CAT) ui/View/lesshat-ext.less >> $@
	$(CAT) ui/View/View.less >> $@
	$(CAT) ui/SplitView/SplitView.less >> $@
	$(CAT) ui/Application/Application_ios7.less >> $@
	$(CAT) ui/Button/Button_ios7.less >> $@
	$(CAT) ui/List/List_ios7.less >> $@
	$(CAT) ui/InputField/InputField_ios7.less >> $@
	$(CAT) ui/Switch/Switch_ios7.less >> $@
	$(CAT) ui/TextArea/TextArea_ios7.less >> $@
	$(CAT) ui/SegmentedButton/SegmentedButton_ios7.less >> $@
	$(CAT) ui/Slider/Slider_ios7.less >> $@
	$(CAT) ui/ProgressBar/ProgressBar_ios7.less >> $@
	$(CAT) ui/RadioButton/RadioButton_ios7.less>> $@
	$(CAT) ui/NavigationBar/NavigationBar_ios7.less >> $@
	$(CAT) ui/CheckBox/CheckBox_ios7.less >> $@
	$(CAT) ui/Picker/Picker_ios7.less >> $@
	$(CAT) ui/ComboBox/ComboBox_ios7.less >> $@
#	$(CAT) ui/PopOver/PopOver_android.css >> $@
#	$(CAT) ui/ToolBar/ToolBar_android.css >> $@
