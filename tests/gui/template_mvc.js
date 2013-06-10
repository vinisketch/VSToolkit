var tel_tmp_str = "<div>${tel}</div>"
var address_tmp_str = "<div>${address}</div>"

var contact_tmp_str = 
"<div class='contact'>\
  <img src='' />\
  <div class='name'>${firstname} ${lastname}</div>\
  <div class='comp'>${companie}</div>\
  <div class='tel' x-hag-hole='tels'></div>\
  <div class='address' x-hag-hole='addresses'></div>\
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
  
  view.tel_tmp = new vs.ui.Template (tel_tmp_str);
  view.address_tmp = new vs.ui.Template (address_tmp_str);
  view.removeTels = function () {
    this._tels = [];
    this.removeAllChildren ('tels');
  };
  
  view.removeAddresses = function () {
    this._addresses = [];
    this.removeAllChildren ('addresses');
  };
  
  vs.util.defineProperty (view, 'tels', {
    set : function (a) {
      this.removeTels ();
      this._tels = a;
      if (!a) return;
      var l = a.length;
      while (l--) {
        var view = this.tel_tmp.compileView ();
        view.tel = a [l];
        this.add (view, 'tels');
      }
    }
  });
  
  vs.util.defineProperty (view, 'addresses', {
    set : function (a) {
      this.removeAddresses ();
      this._addresses = a;
      if (!a) return;
      var l = a.length;
      while (l--) {
        var view = this.address_tmp.compileView ();
        view.address = a [l];
        this.add (view, 'addresses');
      }
    }
  });
  
  test_view.appendChild (view.view);
  
  window.c = new Contact ();
  c.firstname = 'John';
  c.lastname = 'Doe';
  c.companie = 'IBM';
  c.tels = ['34 8984 4389'];
  c.addresses = ['123 bd Saint Michel, 67000 Toulouse'];
  
  view.link (c);

  var cloned_view = view.clone ();
  
  test_view.appendChild (cloned_view.view);

  c.lastname = 'DoeDoe';

  var cc = c.clone ();
  cloned_view.link (cc);

  c.firstname = 'Jo';
  c.tels.push ('34 8984 4380');
  c.addresses.push ('145 bd Saint George, 67000 Toulouse');
  c.propertyChange ('addresses');
  c.propertyChange ('tels');
}
