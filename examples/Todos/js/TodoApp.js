var TodoApp = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function ()
  {
    this._super ();
    
    // GUI component declaration
    this.listView = new vs.ui.List (
      {id:"todos_list", type:"DefaultList", hasArrow:false, scroll:true});
    this.listView.init ();
    this.add (this.listView);
    
    this.textlabel = new vs.ui.TextLabel ({id:"main_label", text:"Todos"});
    this.textlabel.init ();
    this.add (this.textlabel);
    
    this.textfield = new vs.ui.InputField (
      {id:"todo_text_field", placeholder: "What needs to be done?"});
    this.textfield.init ();
    this.add (this.textfield);
    
    this.deleteButton = new vs.ui.Button (
      {id:"delete_button", type:"nav", style:"blue_ios_style",
      text:"Remove completed items"});
    this.deleteButton.init ();
    this.add (this.deleteButton);

    // Todos items model
    this.todosList = new vs.core.Array ({modelClass: Todo});
    this.todosList.init ();
    
    // Set globale local storage init and configuration
    TodoApp.localStorage = new vs.core.LocalStorage ();
    TodoApp.localStorage.init ();
    TodoApp.localStorage.registerModel ("_todoslist_", this.todosList);
    TodoApp.localStorage.load ();

    // configure the list view to use the Todo View and the model
    this.listView.setItemTemplateName ('TodoView');
    this.listView.model = this.todosList;

    this.textfield.bind ('change', this, this.addItem);
    this.deleteButton.bind ('select', this, this.deleteItem);
  },

  applicationStarted : function (event)
  {
  },
  
  addItem : function (e)
  {
    if (!e.data) { return; }
    this.todosList.add ({content: e.data});
    this.textfield.value = "";
    TodoApp.localStorage.save ();
  },
  
  deleteItem : function (e)
  {
    this.todosList.stopPropagation ();
    var i = this.todosList.length;
    while (i--)
    {
      var item = this.todosList.item (i);
      if (item.done)
      {
        this.todosList.remove (i);
        vs.util.free (item);
      }
    }
    this.todosList.change ();
    
    TodoApp.localStorage.save ();
  }
});

function loadApplication ()
{
 new TodoApp ({id:"todo_app"}).init ();

  vs.ui.Application.start ();
}
