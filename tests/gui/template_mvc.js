var contact_tmp_str = 
"<div class='contact'>\
  <img src='${photo}' />\
  <div class='name'>${firstname} ${lastname}</div>\
  <div class='comp'>${companie}</div>\
  <div class='tel' x-hag-hole='tels'><div data-iterate='tels'>${@}</div></div>\
  <div class='address' x-hag-hole='addresses'><div data-iterate='addresses'>${address}</div></div>\
</div>"

var Contact = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Model,

  properties: {
    photo: vs_core.VSObject.PROPERTY_IN_OUT,
    firstname: vs_core.VSObject.PROPERTY_IN_OUT,
    lastname: vs_core.VSObject.PROPERTY_IN_OUT,
    companie: vs_core.VSObject.PROPERTY_IN_OUT,
    tels: vs_core.VSObject.PROPERTY_IN_OUT,
    addresses: vs_core.VSObject.PROPERTY_IN_OUT
  }
});

function launchTest (test_view)
{
  var tmp = new vs_ui.Template (contact_tmp_str);
  var view = tmp.compileView ();
    
  test_view.appendChild (view.view);
  
  window.c = new Contact ();
  c.photo = 'https://data.whicdn.com/images/35834939/large.jpg';
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

  cc.photo = 'https://data.whicdn.com/images/39254141/large.jpg';
  cc.firstname = 'Jo';
  cc.tels.push ('34 8984 4389');
  cc.addresses.length = 0;
  cc.addresses.push ({address:'123 bd Saint Michel, 67000 Toulouse'});
  cc.propertyChange ('addresses');
  cc.propertyChange ('tels');
  
  cc.propertyChange ();
}
