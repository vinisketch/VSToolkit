Button.prototype.html_template = "<div class='vs_ui_button'><div></div></div>";

Canvas.prototype.html_template = "<div class='vs_ui_canvas'><canvas class='canvas_inner'></canvas></div>";

CheckBox.prototype.html_template = "<div class='vs_ui_checkbox'><fieldset x-hag-hole='item_children' /></div>";

ComboBox.prototype.html_template = "<div class='vs_ui_combobox'></div>";

ImageView.prototype.html_template = "<img class='vs_ui_imageview'></img>";

InputField.prototype.html_template = "<div class='vs_ui_inputfield'><input type='text' value='' placeholder='type ...' incremental='incremental'/><div class='clear_button'/> \
</div>";

List.prototype.html_template = "<div class='vs_ui_list'><ul x-hag-hole='item_children'/></div>";

NavigationBar.prototype.html_template = "<div class='vs_ui_navigationbar' x-hag-hole='children'></div>";

Picker.prototype.html_template = "<div class='vs_ui_picker'> \
  <div class='slots'></div> \
  <div class='frame'></div> \
</div>";

PopOver.prototype.html_template = "<div class='vs_ui_popover'> \
  <div class='header' x-hag-hole='header'></div> \
  <div class='center' x-hag-hole='children'></div> \
  <div class='footer' x-hag-hole='footer'></div> \
  <div class='arrow'></div> \
</div>";

ProgressBar.prototype.html_template = "<div class='vs_ui_progressbar'><div></div></div>";

RadioButton.prototype.html_template = "<div class='vs_ui_radiobutton'><fieldset x-hag-hole='item_children' /></div>";

ScrollImageView.prototype.html_template = "<div class='vs_ui_scrollimageview'><img class='content'/></div> \
";

ScrollView.prototype.html_template = "<div class='vs_ui_scrollview'> \
  <div x-hag-hole='top_bar'></div> \
  <div class='content' x-hag-hole='children'></div> \
  <div x-hag-hole='bottom_bar'></div> \
</div>";

SegmentedButton.prototype.html_template = "<div class='vs_ui_segmentedbutton'></div>";

Slider.prototype.html_template = "<div class='vs_ui_slider'><div class='handle'></div></div>";

SplitView.prototype.html_template = "<div class='vs_ui_splitview'> \
  <div x-hag-hole='second_panel'></div> \
  <div x-hag-hole='main_panel'></div> \
</div>";

SVGView.prototype.html_template = "<div class='vs_ui_svgview'></div> \
";

Switch.prototype.html_template = "<div class='vs_ui_switch'> \
  <div> \
    <div class='toggle_on'></div> \
    <div class='toggle_off'></div>  \
    <div class='switch'></div>  \
  </div> \
</div>";

TextArea.prototype.html_template = "<textarea class='vs_ui_textarea'></textarea>";

TextLabel.prototype.html_template = "<div class='vs_ui_textlabel'></div> \
 \
";

ToolBar.prototype.html_template = "<div class='vs_ui_toolbar'> \
  <div x-hag-hole='children'></div> \
</div>";

View.prototype.html_template = "<div class='vs_ui_view' x-hag-hole='children'></div>";
