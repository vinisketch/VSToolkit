var template_str = 
"<div class='contact'>\
  <img src='' />\
  <div class='name'>${firstname} ${lastname}</div>\
  <div class='comp'>${companie}</div>\
  <div class='tel'>${tel}</div>\
  <div class='address'>${address}</div>\
</div>"

var Contact = vs_core.createClass ({

  /** parent class */
  parent: vs_core.Model,

  properties: {
    firstname: vs_core.VSObject.PROPERTY_IN_OUT,
    lastname: vs_core.VSObject.PROPERTY_IN_OUT,
    companie: vs_core.VSObject.PROPERTY_IN_OUT,
    tel: vs_core.VSObject.PROPERTY_IN_OUT,
    address: vs_core.VSObject.PROPERTY_IN_OUT
  }
});


var MVC = vs_core.createClass ({

  /** parent class */
  parent: vs_ui.Application,

  applicationStarted : function (event)
  {
    var tmp = new vs_ui.Template (template_str);
    var view = tmp.compileView ();
    
    this.add (view);
    
    window.c = new Contact ();
    c.firstname = 'John';
    c.lastname = 'Doe';
    c.companie = 'IBM';
    c.tel = '34 8984 4389';
    c.address = '123 bd Saint Michel, 67000 Toulouse';
    
    view.link (c);
    
    var cloned_view = view.clone ();
    
    this.add (cloned_view);

    c.stopPropagation ();
    c.firstname = "huhu";
    c.lastname = "hihi";
    c.change ();

  //  var cc = c.clone ();
  //  cloned_view.link (cc);
  //  cloned_view.unlink ();

    c.lastname = "hoho";
  }
});

function loadApplication ()
{
  new MVC ({id:"mvc"}).init ();

  vs_ui.Application.start ();
}
