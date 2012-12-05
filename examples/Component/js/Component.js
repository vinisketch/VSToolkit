var Component = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  applicationStarted : function (event)
  {
    // Selector creation
    // GUI is defined in index.html file
    this.selector = this.createAndAddComponent ('Selector');
    this.selector.items = ['2','3','4'];
    this.selector.text = "Selection one of these 3 values";
    
    this.listItems = new vs.ui.List ({id: 'list_items', scroll: true});
    this.listItems.init ();
    this.add (this.listItems);
    
    // ListItem component will be instanciated foreach data list items
    // GUI is defined in ListItem.xthml file
    this.listItems.setItemTemplateName ("ListItem");
    
    // Set the data list items
    this.listItems.data = [
      {title: 'Strange image', url: "resources/image1.jpeg"},
      {title: 'Strange image Bis', url: "resources/image2.jpeg"},
      {title: 'The dream house', url: "resources/image3.jpeg"}
    ];
  }
});

function loadApplication ()
{
  new Component ({id:"component", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}
