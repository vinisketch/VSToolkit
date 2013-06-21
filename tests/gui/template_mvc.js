var contact_tmp_str = 
"<div class='contact'>\
  <img src='' />\
  <div class='name'>${firstname} ${lastname}</div>\
  <div class='comp'>${companie}</div>\
  <div class='tel' x-hag-hole='tels'><div data-iterate='tels'>${@}</div></div>\
  <div class='address' x-hag-hole='addresses'><div data-iterate='addresses'>${address}</div></div>\
</div>"

var Contact = vs.core.createClass ({

  /** parent class */
  parent: vs.core.Model,

  properties: {
    firstname: vs.core.Object.PROPERTY_IN_OUT,
    lastname: vs.core.Object.PROPERTY_IN_OUT,
    companie: vs.core.Object.PROPERTY_IN_OUT,
    tels: vs.core.Object.PROPERTY_IN_OUT,
    addresses: vs.core.Object.PROPERTY_IN_OUT
  }
});

function launchTest (test_view)
{
  var tmp = new vs.ui.Template (contact_tmp_str);
  var view = tmp.compileView ();
    
  test_view.appendChild (view.view);
  
  window.c = new Contact ();
  c.firstname = 'John';
  c.lastname = 'Doe';
  c.companie = 'IBM';
  c.tels = ['34 8984 4380'];
  c.addresses = [{address:'145 bd Saint George, 67000 Toulouse'}];
  
  view.link (c);

  var cloned_view = view.clone ();
  
  test_view.appendChild (cloned_view.view);

  c.lastname = 'DoeDoe';

  window.cc = c.clone ();
  cloned_view.link (cc);

  c.firstname = 'Jo';
  c.tels.push ('34 8984 4389');
  c.addresses.push ({address:'123 bd Saint Michel, 67000 Toulouse'});
  c.propertyChange ('addresses');
  c.propertyChange ('tels');
  
  c.propertyChange ();
}
