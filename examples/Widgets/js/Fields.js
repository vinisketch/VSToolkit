function initFieldsPanel () {
  var view = buildPanel();
  view.layout = vs.ui.View.VERTICAL_LAYOUT;
  
  view.setStyles ({margin: "10px"});
  
  // All children have a margin
  view.addCssRule ('>*', "margin: 5px");
  
  var label = new vs.ui.TextLabel ({
    text: 'Select a value:'
  }).init ();
  view.add (label);

  var combo = new vs.ui.ComboBox ({
    data: ['value 1', 'value 2', 'value 3', 'value 4']
  }).init ();
  view.add (combo);

  var area = new vs.ui.TextArea ({
  }).init ();
  view.add (area);

  var textField = new vs.ui.InputField ({
    type: vs.ui.InputField.TEXT
  }).init ();
  view.add (textField);

  var searchField = new vs.ui.InputField ({
    type: vs.ui.InputField.SEARCH
  }).init ();
  view.add (searchField);

  var passwordField = new vs.ui.InputField ({
    type: vs.ui.InputField.PASSWORD
  }).init ();
  view.add (passwordField);

  var switch1 = new vs.ui.Switch ().init ();
  view.add (switch1);

  var switch2 = new vs.ui.Switch ({
    textOn : 'I',
    textOff : 'O'
  }).init ();
  view.add (switch2);

  return view;
}
