function initStandardList () {
  var view = buildPanel　();
  view.layout = vs.ui.View.FLOW_LAYOUT;

  var listItems = new vs.ui.List ({
    scroll: true,
    hasArrow: true
  });
  listItems.init ();
  view.add (listItems);
      
  // Set the data list items
  listItems.data = [
    {title: 'Strange image'},
    {title: 'Strange image Bis', label: "label1"},
    {title: 'The dream house'},
    {title: 'Strange image', label: "label2"},
    {title: 'Strange image Bis'},
    {title: 'The dream house'},
    {title: 'Strange image'},
    {title: 'Strange image Bis', label: "label3"},
    {title: 'The dream house'},
    {title: 'Strange image'},
    {title: 'Strange image Bis'},
    {title: 'The dream house'},
    {title: 'Strange image'},
    {title: 'Strange image Bis', label: "label4"},
    {title: 'The dream house'},
    {title: 'Strange image'},
    {title: 'Strange image Bis', label: "label5"},
    {title: 'The dream house'},
    {title: 'Strange image', label: "label6"},
    {title: 'Strange image Bis'},
    {title: 'The dream house'},
    {title: 'Strange image'},
    {title: 'Strange image Bis', label: "label7"},
    {title: 'The dream house'},
    {title: 'Strange image', label: "label8"},
    {title: 'Strange image Bis', label: "label9"},
  ];
  
  return view;
}

function initTabList () {
  var view = buildPanel　();
  view.layout = vs.ui.View.VERTICAL_LAYOUT;

  var listItems = new vs.ui.List ({
    scroll: true,
    type: vs.ui.List.TAB_LIST
  });
  listItems.init ();
  view.add (listItems);
      
  // Set the data list items
  listItems.data = [
    'a',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'b',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'c',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    'd',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'e',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'f',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'g',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    'h',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    'i',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'j',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'k',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'l',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'm',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    'n',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'o',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'p',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'q',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    'r',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    's',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    't',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'u',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'v',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'w',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    'x',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'y',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'z',
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
  ];
  
  return view;
}

function initBlockList () {
  var view = buildPanel　();
  view.layout = vs.ui.View.VERTICAL_LAYOUT;

  var listItems = new vs.ui.List ({
    scroll: true,
    type: vs.ui.List.BLOCK_LIST
  });
  listItems.init ();
  view.add (listItems);
      
  // Set the data list items
  listItems.data = [
    'Config 1',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'Config 2',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    'Config 3',
    {title: 'Strange image', url: "resources/image1.jpeg"},
    {title: 'Strange image Bis', url: "resources/image2.jpeg"},
    {title: 'The dream house', url: "resources/image3.jpeg"},
    {title: 'Strange image', url: "resources/image1.jpeg"}
  ];
  
  return view;
}
