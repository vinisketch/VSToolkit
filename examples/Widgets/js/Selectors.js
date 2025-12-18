function initSelectorsPanel () {
  var view = buildPanel();
  view.layout = vs_ui.View.FLOW_LAYOUT;
  
  var label = new vs_ui.TextLabel ({
    text: 'Radio button:'
  }).init ();
  view.add (label);

  var radio = new vs_ui.RadioButton ({
    data: ['value 1', 'value 2', 'value 3', 'value 4']
  }).init ();
  view.add (radio);

  label = new vs_ui.TextLabel ({
    text: 'Check Box:'
  }).init ();
  view.add (label);

  var check = new vs_ui.CheckBox ({
    data: ['value 1', 'value 2', 'value 3', 'value 4']
  }).init ();
  view.add (check);

  return view;
}
