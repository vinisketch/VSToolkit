function initSelectorsPanel () {
  var view = buildPanel();
  view.layout = vs.ui.View.FLOW_LAYOUT;
  
  var label = new vs.ui.TextLabel ({
    text: 'Radio button:'
  }).init ();
  view.add (label);

  var radio = new vs.ui.RadioButton ({
    data: ['value 1', 'value 2', 'value 3', 'value 4']
  }).init ();
  view.add (radio);

  label = new vs.ui.TextLabel ({
    text: 'Check Box:'
  }).init ();
  view.add (label);

  var check = new vs.ui.CheckBox ({
    data: ['value 1', 'value 2', 'value 3', 'value 4']
  }).init ();
  view.add (check);

  return view;
}
