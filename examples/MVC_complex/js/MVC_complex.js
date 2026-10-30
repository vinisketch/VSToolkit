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

var Contact = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Model,

  properties: {
    firstname: vs_core.VSObject.PROPERTY_IN_OUT,
    lastname: vs_core.VSObject.PROPERTY_IN_OUT,
    companie: vs_core.VSObject.PROPERTY_IN_OUT,
    tels: vs_core.VSObject.PROPERTY_IN_OUT,
    addresses: vs_core.VSObject.PROPERTY_IN_OUT
  }
});


var MVC = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,

  applicationStarted : function (event)
  {
    var tmp = new vs_ui.Template (contact_tmp_str);
    var view = tmp.compileView ();
    
    view.tel_tmp = new vs_ui.Template (tel_tmp_str);
    view.address_tmp = new vs_ui.Template (address_tmp_str);
    view.removeTels = function () {
      this._tels = [];
      this.removeAllChildren ('tels');
    };
    
    view.removeAddresses = function () {
      this._addresses = [];
      this.removeAllChildren ('addresses');
    };
    
    vs_utils.defineProperty (view, 'tels', {
      set : function (a) {
        this.removeTels ();
        if (!a) return;
        this._tels = a.slice ();
        var l = a.length;
        while (l--) {
          var view = this.tel_tmp.compileView ();
          view.tel = a [l];
          this.add (view, 'tels');
        }
      }
    });
    
    vs_utils.defineProperty (view, 'addresses', {
      set : function (a) {
        this.removeAddresses ();
        if (!a) return;
        this._addresses = a.slice ();
        var l = a.length;
        while (l--) {
          var view = this.address_tmp.compileView ();
          view.address = a [l];
          this.add (view, 'addresses');
        }
      }
    });
    
    this.add (view);
    
    window.c = new Contact ();
    c.firstname = 'John';
    c.lastname = 'Doe';
    c.companie = 'IBM';
    c.tels = ['34 8984 4389'];
    c.addresses = ['123 bd Saint Michel, 67000 Toulouse'];
    
    view.link (c);

//return;
    var cloned_view = view.clone ();
    
    this.add (cloned_view);

    var cc = c.clone ();
    cloned_view.link (cc);

    c.tels.push ('34 8984 4380');
    c.addresses.push ('145 bd Saint George, 67000 Toulouse');
    c.propertyChange ('addresses');
    c.propertyChange ('tels');
  }
});

function loadApplication ()
{
  new MVC ({id:"mvc"}).init ();

  vs_ui.Application.start ();
}
