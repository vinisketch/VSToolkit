var template_str = 
"<div class='contact'>\
  <img src='' />\
  <div class='name'>${firstname} ${lastname}</div>\
  <div class='comp'>${companie}</div>\
  <div class='tel'>${tel}</div>\
  <div class='address'>${address}</div>\
</div>"

var Contact = vs.core.createClass ({

  /** parent class */
  parent: vs.core.Model,

  properties: {
    firstname: vs.core.Object.PROPERTY_IN_OUT,
    lastname: vs.core.Object.PROPERTY_IN_OUT,
    companie: vs.core.Object.PROPERTY_IN_OUT,
    tel: vs.core.Object.PROPERTY_IN_OUT,
    address: vs.core.Object.PROPERTY_IN_OUT
  }
});


var MVC = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event)
  {
    var tmp = new vs.ui.Template (template_str);
    var view = tmp.compileView ();
    
    this.add (view);
    
    window.c = new Contact ();
    c.firstname = 'John';
    c.lastname = 'Doo';
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

//    var cc = c.clone ();
//    cloned_view.link (cc);
//    cloned_view.unlink ();

    c.lastname = "hoho";
  }
});

function loadApplication ()
{
  new MVC ({id:"mvc"}).init ();

  vs.ui.Application.start ();
}
