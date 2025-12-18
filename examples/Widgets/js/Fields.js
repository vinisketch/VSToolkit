function initFieldsPanel () {
  var view = buildPanel();
  view.layout = vs_ui.View.VERTICAL_LAYOUT;
  
  view.setStyles ({margin: "10px"});
  
  // All children have a margin
  view.addCssRule ('>*', "margin: 5px");
  
  var label = new vs_ui.TextLabel ({
    text: 'Select a value:'
  }).init ();
  view.add (label);

  var combo = new vs_ui.ComboBox ({
    data: ['value 1', 'value 2', 'value 3', 'value 4'],
    size: [150, 43]
  }).init ();
  view.add (combo);

  var area = new vs_ui.TextArea ({
  }).init ();
  view.add (area);

  var textField = new vs_ui.InputField ({
    type: vs_ui.InputField.TEXT
  }).init ();
  view.add (textField);

  var searchField = new vs_ui.InputField ({
    type: vs_ui.InputField.SEARCH
  }).init ();
  view.add (searchField);

  var passwordField = new vs_ui.InputField ({
    type: vs_ui.InputField.PASSWORD
  }).init ();
  view.add (passwordField);

  var switch1 = new vs_ui.Switch ().init ();
  view.add (switch1);

  var switch2 = new vs_ui.Switch ({
    textOn : 'ON',
    textOff : 'OFF',
    size: [80, 28]
  }).init ();
  view.add (switch2);

  var switch3 = new vs_ui.Switch ({
    textOn : 'I',
    textOff : 'O',
    size: [80, 28]
  }).init ();
  view.add (switch3);

  return view;
}
