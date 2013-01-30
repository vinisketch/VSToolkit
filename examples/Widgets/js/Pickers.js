function initPickersPanel () {
  var view = buildPanel();
  view.layout = vs.ui.View.VERICAL_LAYOUT;
  
  var picker1 = new vs.ui.Picker ().init ();
  view.add (picker1);
  picker1.addSlot (vs.ui.Picker.NUMBERS, 'right');
  picker1.addSlot ({ separator: ','}, 'readonly');
  picker1.addSlot (vs.ui.Picker.NUMBERS, 'right');
 
  var picker2 = new vs.ui.Picker ().init ();
  view.add (picker2);
  picker2.addSlot (vs.ui.Picker.NUMBERS, 'right');
  picker2.addSlot ({ 1: 'un', 2: 'deux', 3: 'trois'}, 'right');
  picker2.addSlot (vs.ui.Picker.NUMBERS, 'right');

  return view;
}
