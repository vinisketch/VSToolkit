/** @license
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

(function (window, undefined) {

var document = window.document;

/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/********************************************************************
                   
*********************************************************************/
/** @private */
var vs = window.vs,
  util = vs.util,
  core = vs.core,
  data = vs.data;

/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
 
  Use code from Canto.js Copyright 2010 Steven Levithan <stevenlevithan.com>
*/

/**
 *  The URL class
 *  URL splits any URI into its parts, all of which are optional.<br/>
 *  This code is based on parseUri, Copyright 2010 Steven Levithan 
 *  <stevenlevithan.com>
 *
 *  @extends vs.core.Object
 * @name vs.data.URL
 *  @class
 *
 *  @example
 *  var url = new vs.data.URL ();
 *  url.parse ('http://test.com/dir1/dir2/index.html#top');
 *  console.log (url.path);
 *
 *  @example
 *  var url = new ABURL ();
 *  url.src = 'http://test.com/dir1/dir2/index.html#top';
 *  console.log (url.path);
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.data.URL.
 *
 * @param {Object} config The configuration structure [mandatory]
*/
function URL (config)
{
  this.parent = core.Object;
  this.parent (config);
  this.constructor = URL;
}

URL.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @protected
   * @type {string}
   */
  _src: "",
  
  /**
   * @protected
   * @type {string}
   */
  _anchor: "",
  
  /**
   * @protected
   * @type {string}
   */
  _query: "",
  
  /**
   * @protected
   * @type {string}
   */
  _file: "",
  
  /**
   * @protected
   * @type {string}
   */
  _directory: "",
  
  /**
   * @protected
   * @type {string}
   */
  _path: "",
  
  /**
   * @protected
   * @type {string}
   */
  _relative: "",
  
  /**
   * @protected
   * @type {number}
   */
  _port: 0,
  
  /**
   * @protected
   * @type {string}
   */
  _host: "",
  
  /**
   * @protected
   * @type {string}
   */
  _password: "",
  
  /**
   * @protected
   * @type {string}
   */
  _user: "",
  
  /**
   * @protected
   * @type {string}
   */
  _authority: "",
  
  /**
   * @protected
   * @type {string}
   */
  _protocol: "",
  
  /**
   * @protected
   * @type {object}
   */
  _query_key: null,
  

  /*****************************************************************
   *              
   ****************************************************************/

  /**
   * @private
   * @type {object}
   */
  __options : {
    strictMode: false,
    key: ["_source","_protocol","_authority","_userInfo","_user","_password","_host","_port","_relative","_path","_directory","_file","_query","_anchor"],
    q:   {
      name:   "_query_key",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  },
  
  /*****************************************************************
   *              
   ****************************************************************/

  /**
   *  Parse a url.
   *
   * @name vs.data.URL#parse
   * @function
   * @param {String} str the url to parse
   */
  parse : function (str)
  {
    if (!util.isString (str)) { return; }
    
    this._src = str;
    
    var	o   = this.__options,
      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      i   = 14, self = this;
  
    while (i--) { this [o.key[i]] = m[i] || ""; }
  
    this [o.q.name] = {};
    this [o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) self [o.q.name][$1] = $2;
    });
    
    this.propertyChange ('src');
  }
};
util.extendClass (URL, core.Object);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (URL, {
  "src" : {
    /** 
     * The url src
     * @example
     * http://test.com/index.html#top
     *
     * @name vs.data.URL#src
     * @type {string}
     */ 
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      this.parse (v);
    },
  
    get : function ()
    {
      return this._src;
    },
  },
  "anchor" : {
    /**
     * The url anchor
     * @example
     * top in http://test.com/index.html#top
     *
     * @name vs.data.URL#anchor 
     * @type {string}
     */
    get : function ()
    {
      return this._anchor;
    }
  },
  "query" : {
    /** 
     * The query query
     *
     * @name vs.data.URL#query
     * @type {string}
     */ 
    get : function ()
    {
      return this._query;
    }
  },
  "queryKey" : {
    /** 
     * The url query as object of <key, value>
     *
     * @name vs.data.URL#queryKey
     * @type {object}
     */ 
    get : function ()
    {
      return this._query_key;
    }
  },
  "file" : {
    /** 
     * The url file name
     * @example
     * index.html in http://test.com/index.html#top 
     *
     * @name vs.data.URL#file
     * @type {string}
     */ 
    get : function ()
    {
      return this._file;
    }
  },
  "directory" : {
    /** 
     * The url anchor
     * @example
     * dir1/dir2/ in http://test.com/dir1/dir2/index.html#top 
     *
     * @name vs.data.URL#directory
     * @type {string}
     */ 
    get : function ()
    {
      return this._directory;
    }
  },
  "path" : {
    /** 
     * The url path
     * @example
     * dir1/dir2/index.html in http://test.com/dir1/dir2/index.html#top 
     *
     * @name vs.data.URL#path
     * @type {string}
     */ 
    get : function ()
    {
      return this._path;
    }
  },
  "port" : {
    /** 
     * The url port
     *
     * @name vs.data.URL#port
     * @type {number}
     */ 
    get : function ()
    {
      return this._port;
    }
  },
  "relative" : {
    /** 
     * The url relative
     * @example
     * dir1/dir2/index.html#top in http://test.com/dir1/dir2/index.html#top 
     *
     * @name vs.data.URL#relative
     * @type {string}
     */ 
    get : function ()
    {
      return this._relative;
    }
  },
  "host" : {
    /** 
     * The url host
     * @example
     * test.com in http://test.com/dir1/dir2/index.html#top 
     *
     * @name vs.data.URL#host
     * @type {string}
     */ 
    get : function ()
    {
      return this._host;
    }
  },
  "password" : {
    /** 
     * The url password
     *
     * @name vs.data.URL#password
     * @type {string}
     */ 
    get : function ()
    {
      return this._password;
    }
  },
  "user" : {
    /** 
     * The url user
     *
     * @name vs.data.URL#user
     * @type {string}
     */ 
    get : function ()
    {
      return this._user;
    }
  },
  "authority" : {
    /** 
     * The url authority
     * @example
     * usr:pwd@www.test.com:81
     *
     * @name vs.data.URL#authority
     * @type {string}
     */ 
    get : function ()
    {
      return this._authority;
    }
  },
  "protocol" : {
    /** 
     * The url protocol
     * @example
     * http in http://test.com/dir1/dir2/index.html#top 
     *
     * @name vs.data.URL#protocol
     * @type {string}
     */ 
    get : function ()
    {
      return this._protocol;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
data.URL = URL;
/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and
  contributors. All rights reserved

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * objects inside the RSSItem object
 *
 * @private
 */
function RSSEnclosure (encElement)
{
  if (!encElement)
  {
    this.url = null;
    this.length = null;
    this.type = null;
  }
  else
  {
    this.url = encElement.getAttribute ("url");
    this.length = encElement.getAttribute ("length");
    this.type = encElement.getAttribute ("type");
  }
}

/**
 * @private
 */
function RSSGuid (guidElement)
{
  if (!guidElement)
  {
    this.isPermaLink = null;
    this.value = null;
  }
  else
  {
    this.isPermaLink = guidElement.getAttribute ("isPermaLink");
    this.value = guidElement.childNodes[0].nodeValue;
  }
}

/**
 * @private
 */
function RSSSource (souElement)
{
  if (!souElement)
  {
    this.url = null;
    this.value = null;
  }
  else
  {
    this.url = souElement.getAttribute ("url");
    this.value = souElement.childNodes[0].nodeValue;
  }
}

/**
 *  @class
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 *  @memberOf vs.data
 *
 * @param {Object}
 */
function RSSItem (itemxml)
{
  var properties =
    ["title", "link", "description", "author", "comments", "pubDate"];
  var _properties =
    ["_title", "_link", "_description", "_author", "_comments", "_pub_date"];

  var tmpElement = null;
  for (var i = 0; i < properties.length; i++)
  {
    tmpElement = itemxml.getElementsByTagName (properties[i])[0];
    if (tmpElement)
    {
      this [_properties [i]] = tmpElement.childNodes[0].nodeValue;
    }
  }

  this._category =
    new RSSCategory (itemxml.getElementsByTagName ("category")[0]);

  this._enclosure =
    new RSSEnclosure (itemxml.getElementsByTagName ("enclosure")[0]);

  this._guid = new RSSGuid (itemxml.getElementsByTagName ("guid")[0]);
  this._source = new RSSSource (itemxml.getElementsByTagName ("source")[0]);
  this._image = new RSSImage (itemxml.getElementsByTagName ("content")[0]);

  if (this._image) {this._image_url = this.image.url};
}

RSSItem.prototype = {
  //required

  /**
   *
   * @protected
   * @type {String}
   */
  _title : '',

  /**
   *
   * @protected
   * @type {String}
   */
  _link : '',

  /**
   *
   * @protected
   * @type {String}
   */
  _description : '',

  //optional vars

  /**
   *
   * @protected
   * @type {String}
   */
  _author : '',

  /**
   *
   * @protected
   * @type {String}
   */
  _comments : '',

  /**
   *
   * @protected
   * @type {String}
   */
  _pub_date : '',

  //optional objects
  /**
   *
   * @protected
   * @type {RSSCategory}
   */
  _category : null,

  /**
   *
   * @protected
   * @type {RSSEnclosure}
   */
  _enclosure : null,

  /**
   *
   * @protected
   * @type {RSSGuid}
   */
  _guid : null,

  /**
   *
   * @protected
   * @type {RSSSource}
   */
  _source : null,

  /**
   *
   * @protected
   * @type {RSSImage}
   */
  _image: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _image_url: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _category: null,

  /**
   * @return {String}
   * @function
   * @private
   */
  toString : function ()
  {
    return this.title;
  }
};

util.defineClassProperties (RSSItem, {

'title': {
  /**
   * Getter for the item title
   * @name vs.data.RSSItem#title
   * @type string
   */
  get : function ()
  {
    return this._title;
  }
},
'link': {
  /**
   * Getter for the item link
   * @name vs.data.RSSItem#link
   * @type string
   */
  get : function ()
  {
    return this._link;
  }
},
'description': {
  /**
   * Getter for the item description
   * @name vs.data.RSSItem#description
   * @type string
   */
  get : function ()
  {
    return this._description;
  }
},

'author': {
  /**
   * Getter for the item author
   * @name vs.data.RSSItem#author
   * @type string
   */
  get : function ()
  {
    return this._author;
  }
},

'comments': {
  /**
   * Getter for the item comments
   * @name vs.data.RSSItem#comments
   * @type string
   */
  get : function ()
  {
    return this._comments;
  }
},

'pubDate': {
  /**
   * Getter for the item pubDate
   * @name vs.data.RSSItem#pubDate
   * @type string
   */
  get : function ()
  {
    return this._pub_date;
  }
},

'category': {
  /**
   * Getter for the item category
   * @name vs.data.RSSItem#category
   * @type RSSCategory
   */
  get : function ()
  {
    return this._category;
  }
},

'enclosure': {
  /**
   * Getter for the item enclosure
   * @name vs.data.RSSItem#enclosure
   * @type RSSEnclosure
   */
  get : function ()
  {
    return this._enclosure;
  }
},

'guid': {
  /**
   * Getter for the item guid
   * @name vs.data.RSSItem#guid
   * @type RSSGuid
   */
  get : function ()
  {
    return this._guid;
  }
},

'source': {
  /**
   * Getter for the item source
   * @name vs.data.RSSItem#source
   * @type RSSSource
   */
  get : function ()
  {
    return this._source;
  }
},

'image': {
  /**
   * Getter for the image information
   * @name vs.data.RSSItem#image
   * @type RSSImage
   */
  get : function ()
  {
    return this._image;
  }
},
'imageUrl': {
  /**
   * Getter for the image url
   * @name vs.data.RSSItem#imageUrl
   * @type string
   */
  get : function ()
  {
    return this._image_url;
  }
}
});

/**
 * objects inside the RSSChannel object
 *
 * @private
 */
function RSSCategory (catElement)
{
  if (!catElement)
  {
    this.domain = null;
    this.value = null;
  }
  else
  {
    this.domain = catElement.getAttribute ("domain");
    this.value = catElement.childNodes[0].nodeValue;
  }
}

/**
 * object containing RSS image tag info
 *
 * @private
 */
function RSSImage (imgElement)
{
  if (!imgElement)
  {
    this.url = null;
    this.link = null;
    this.width = null;
    this.height = null;
    this.description = null;
  }
  else
  {
    imgAttribs = ["url", "title", "link", "width", "height", "description"];

    for (var i = 0; i < imgAttribs.length; i++)
    {
      if (imgElement.getAttribute (imgAttribs[i]))
      {
        this [imgAttribs [i]] = imgElement.getAttribute (imgAttribs[i]);
      }
    }
  }
}

/**
 * object containing the parsed RSS 2.0 channel
 *
 * @private
 */
function RSSChannel (rssFeed, rssxml)
{
  rssFeed._items = [];

  if (!rssxml)
  {
    console.error ("Failed to parse rss document that is null.");
    return false;
  }

  var chanElement = rssxml.getElementsByTagName ("channel")[0];
  var itemElements = rssxml.getElementsByTagName ("item");

  for (var i = 0; i < itemElements.length; i++)
  {
    Item = new RSSItem (itemElements[i]);
    rssFeed._items.push (Item);
    //chanElement.removeChild(itemElements[i]);
  }

  var _properties = ["_title", "_link", "_description", "_language",
     "_copyright", "_managing_editor", "_web_master", "_pub_date",
     "_last_build_date", "_generator", "_docs", "_ttl", "_rating"];

  var properties = ["title", "link", "description", "language", "copyright",
     "managingEditor", "webMaster", "pubDate", "lastBuildDate", "generator",
     "docs", "ttl", "rating"];

  var tmpElement = null;

  for (var i = 0; i < properties.length; i++)
  {
    tmpElement = chanElement.getElementsByTagName (properties [i]) [0];

    if (tmpElement)
    {
      rssFeed [_properties [i]] = tmpElement.childNodes[0].nodeValue;
    }
  }

  rssFeed._category =
    new RSSCategory (chanElement.getElementsByTagName ("category")[0]);

  rssFeed._image =
    new RSSImage (chanElement.getElementsByTagName ("image")[0]);
};

/**
 *  The RSSFeed class
 *
 *  @extends vs.core.EventSource
 * @name vs.data.RSSFeed
 *
 *  @class
 *  An RSSFeed should not be instantiated. Its the output of RSSRequester
 *  object after a rss feed is loaded and parsed.
 *
 *  @author David Thevenin
 *  @see RSSRequester
 *  @constructor
 *   Creates a new vs.data.RSSFeed.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
RSSFeed = function (config)
{
  this.parent = vs.core.EventSource;
  this.parent (config);
  this.constructor = RSSFeed;
};

RSSFeed.prototype = {

 /*********************************************************
 *                  private data
 *********************************************************/

  /**
   *
   * @protected
   * @type {Array}
   */
  _items: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _title: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _link: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _description: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _language: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _copyright: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _managing_editor: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _web_master: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _pub_date: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _last_build_date: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _generator: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _docs: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _ttl: null,

  /**
   *
   * @protected
   * @type {string}
   */
  _rating: null,
};
util.extendClass (RSSFeed, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (RSSFeed, {
'items': {
   /**
   * Getter for the result RSS
   * @name vs.data.RSSFeed#items
   * @type Array
   */
  get : function ()
  {
    return this._items;
  }
},
'title': {
  /**
   * Getter for the feed language
   * @name vs.data.RSSFeed#title
   * @type string
   */
  get : function ()
  {
    return this._title;
  }
},
'link': {
  /**
   * Getter for the feed copyright
   * @name vs.data.RSSFeed#link
   * @type string
   */
  get : function ()
  {
    return this._link;
  }
},
'description': {
  /**
   * Getter for the feed managingEditor
   * @name vs.data.RSSFeed#description
   * @type string
   */
  get : function ()
  {
    return this._description;
  }
},
'language': {
  /**
   * Getter for the feed language
   * @name vs.data.RSSFeed#language
   * @type string
   */
  get : function ()
  {
    return this._language;
  }
},
'copyright': {
  /**
   * Getter for the feed copyright
   * @name vs.data.RSSFeed#copyright
   * @type string
   */
  get : function ()
  {
    return this._copyright;
  }
},
'managingEditor': {
  /**
   * Getter for the feed managingEditor
   * @name vs.data.RSSFeed#managingEditor
   * @type string
   */
  get : function ()
  {
    return this._managing_editor;
  }
},
'webMaster': {
  /**
   * Getter for the feed webMaster
   * @name vs.data.RSSFeed#webMaster
   * @type string
   */
  get : function ()
  {
    return this._web_master;
  }
},
'pubDate': {
  /**
   * Getter for the feed pubDate
   * @name vs.data.RSSFeed#pubDate
   * @type string
   */
  get : function ()
  {
    return this._pub_date;
  }
},
'lastBuildDate': {
  /**
   * Getter for the feed lastBuildDate
   * @name vs.data.RSSFeed#lastBuildDate
   * @type string
   */
  get : function ()
  {
    return this._last_build_date;
  }
},
'generator': {
  /**
   * Getter for the feed generator
   * @name vs.data.RSSFeed#generator
   * @type string
   */
  get : function ()
  {
    return this._generator;
  }
},
'docs': {
  /**
   * Getter for the feed docs
   * @name vs.data.RSSFeed#docs
   * @type string
   */
  get : function ()
  {
    return this._docs;
  }
},
'rating': {
  /**
   * Getter for the feed rating
   * @name vs.data.RSSFeed#rating
   * @type string
   */
  get : function ()
  {
    return this._rating;
  }
},
'image': {
  /**
   * Getter for the image information
   * @name vs.data.RSSFeed#image
   * @type Object
   */
  get : function ()
  {
    return this._image;
  }
},
'imageUrl': {
  /**
   * Getter for the image url
   * @name vs.data.RSSFeed#imageUrl
   * @type string
   */
  get : function ()
  {
    return this._image_url;
  }
},
'category': {
  /**
   * Getter for the feed rating
   * @name vs.data.RSSFeed#category
   * @type string
   */
  get : function ()
  {
    return this._category;
  }
}
});

/**
 *  The RSSRequester class
 *
 *  @extends RSSFeed
 * @name vs.data.RSSRequester
 *  @events rssload, rssloaderror
 *  @class
 *  Instantiate a RSSRequester when you want load a rss feeds.
 *  The system works asynchronously
 *
 * The delegate that should be implemented:
 *  <ul>
 *    <li/>performAlternateRequest : function ()
 *  </ul>
 *  This delegate make a request if the HTTpRequest failed for instance
 *  because of Cross Domain issue. The defautl delegate use Yahoo Pipes as
 *  alternate request.
 *
 *  @example
 *  var request = new RSSRequester ({});
 *  request.bind ('rssload', this, 'onRssload');
 *  request.bind ('rssloaderror', this, 'onError');
 *
 *  request.url = "http://feeds.arstechnica.com/arstechnica/index.xml";
 *  request.loadRSS ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new RSSRequester.
 *
 * @param {Object} config the configuration structure [mandatory]
*/
RSSRequester = function (config)
{
  this.parent = RSSFeed;
  this.parent (config);
  this.constructor = RSSRequester;

  this._rss = this;
};

RSSRequester.prototype = {

 /*********************************************************
 *                  private data
 *********************************************************/

  /**
   *
   * @protected
   * @type {string}
   */
  _url: '',

  /**
   *
   * @protected
   * @type {RSSFeed}
   */
  _rss: null,

 /*********************************************************
 *                  RSS management
 *********************************************************/

  /**
   * @protected
   * @name vs.data.RSSRequester#initComponent
   * @function
   */
  initComponent : function ()
  {
    RSSFeed.prototype.initComponent.call (this);

    this._xhr = new core.HTTPRequest ();
    this._xhr.init ();
    this._xhr.bind ('xmlload', this, this.processRSS);
    this._xhr.bind ('loaderror', this, this.processError);
  },

  /**
   * @protected
   * @name vs.data.RSSRequester#destructor
   * @function
   */
  destructor : function ()
  {
    this._xhr.unbind ('xmlload', this, this.processRSS);
    this._xhr.unbind ('loaderror', this, this.processError);
    free (this._xhr);

    RSSFeed.prototype.destructor.call (this);
  },

  /**
   * start RSS load
   *
   * @name vs.data.RSSRequester#loadRSS
   * @function
   */
  loadRSS : function ()
  {
    this._xhr.send ();
  },

  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#processRSS
   * @function
   *
   * @private
   * @param Text rsstxt
   * @param Document rssxml
   */
  processRSS: function (event)
  {
    var rssDocument = event.data;
    if (!rssDocument)
    {
      rssDocument = new DOMParser ().parseFromString
        (this._xhr.responseText, 'application/xml');

      if (!rssDocument)
      {
        console.error ("Failed to parse rss document that is null.");
        this.propagate ('rssloaderror', 'document null.');
        return false;
      }
    }

    RSSChannel (this, rssDocument);
    this.propagate ('rssload', this);
    this.propertyChange ();
  },

  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#processRSS
   * @function
   *
   * @private
   * @param Text rsstxt
   * @param Document rssxml
   */
  processError: function (event)
  {
    if (event && event.data && event.data.status === 'failed')
    {
      if (this.performAlternateRequest) this.performAlternateRequest ();
      else this.propagate ('rssloaderror');
    }
    else this.propagate ('rssloaderror');
  },

  /**
   * propertiesDidChange
   * @protected
   *
   * @name vs.data.RSSRequester#propertiesDidChange
   * @function
   */
  propertiesDidChange : function ()
  {
    this.loadRSS ();
  },

/********************************************************************
                  delegate implementation
********************************************************************/
  /**
   * @protected
   *
   */
   performAlternateRequest : _performAlternateYahooPipeRequest,
};
util.extendClass (RSSRequester, RSSFeed);

function _performAlternateYahooPipeRequest ()
{
  var ajaxp = new core.AjaxJSONP ().init ();
  ajaxp.url = "http://pipes.yahoo.com/pipes/pipe.run?" +
    "_id=9oyONQzA2xGOkM4FqGIyXQ&" +
    "_render=json&" +
    "feed=" + escape (this._url);

  ajaxp.clbParamName = '_callback';

  ajaxp.bind ('jsonload', this, function (event)
    {
      var data = event.data;
      if (!data || !data.value || !data.value.items)
      {
        this.propagate ('rssloaderror', 'document null.');
        return;
      }
      var value = data.value;

      this._pub_date = value.pubDate;
      this._items = [];

      itemElements = value.items;
      for (var i = 0; i < itemElements.length; i++)
      {
//        Item = new RSSItem (itemElements[i]);
        this._items.push (itemElements[i]);
      }
      this.propagate ('rssload', this);
      this.propertyChange ();
    });
  ajaxp.bind ('loaderror', this, function (data)
    {
      this.propagate ('rssloaderror');
    });

  ajaxp.send ();
}

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (RSSRequester, {
  "url": {

    /**
     * Setter for the rss's url
     * @name vs.data.RSSRequester#url
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._url = v;
      this._xhr.url = v;
    }
  },

  'rss': {

    /**
     * Getter for the result rss feeds
     * @name vs.data.RSSRequester#rss
     * @type RSSFeed
     */
    get : function ()
    {
      return this._rss;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
data.RSSFeed = RSSFeed;
data.RSSRequester = RSSRequester;
/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 *  The GoogleSearch class
 *
 *  @extends vs.core.EventSource
 *  @name vs.data.GoogleSearch
 *  @class vs.data.GoogleSearch
 *  provides an API to search information with the Google search engine.
 *  It allow to search using the local or the video search envines.
 *  <p>
 * Delegates:
 *  <ul>
 *  </ul>
 *  <p>
 * Events:
 *  <ul> engineload : after setSearchEngine call, when the engines are loaded
 *       and usable.
 *  </ul>
 *  <p>
 *  @example
 *  
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new GoogleSearch.
 *
 * @param {Object} config the configuration structure [mandatory]
 */
var GoogleSearch = function (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = GoogleSearch;
  
  GoogleSearch.loadService (this);

  this.ERROR_CODE = 0;
  this._addresses = [];
  this._position = [];
}

/** @private */
GoogleSearch.loadService = function (obj)
{
  if (!GoogleSearch.__google_loaded__)
  {
    if (!GoogleSearch.__google_wait_loaded__)
    {
      GoogleSearch.__google_wait_loaded__ = true;
      var url = "http://www.google.com/jsapi?key=" + GoogleSearch.key + "&callback=vs.data.GoogleSearch.__on_loaded";

      util.importFile (url, null, null, 'js');
    }
    
    if (obj)
    {
      GoogleSearch._to_finish_init.push (obj);
    }
  }
}

/**
 * @name vs.data.GoogleSearch.key
 * @type {String}
 */
GoogleSearch.key = " ABQIAAAAE4BGaIh0t-7l9PDR7PA0rRR6KW34AlT62yZeC298tyhOjAL-9hQQpk22pW6ZfaCFEr3zjz2Q8rjqAw";

GoogleSearch.__google_wait_loaded__ = false;
GoogleSearch.__google_loaded__ = false;
GoogleSearch._to_finish_init = new Array ();

/**
 * The Google Local Search allows you to execute map searches.
 * @name vs.data.GoogleSearch.LOCAL_SEARCH_ENGINE
 * @const
 */
GoogleSearch.LOCAL_SEARCH_ENGINE = 1;

/**
 * The Google Video Search allows you to execute searches and receive results 
 * from the Google Video Search service.
 * @name vs.data.GoogleSearch.VIDEO_SEARCH_ENGINE
 * @const
 */
GoogleSearch.VIDEO_SEARCH_ENGINE = 2;


/** @private */
GoogleSearch.__on_loaded = function ()
{
  google.load ('search', '1', 
    {nocss: true, callback:vs.data.GoogleSearch.__on_search_loaded});
}

/** @private */
GoogleSearch.__on_search_loaded = function ()
{
  var i, l; 
  
  GoogleSearch.__google_loaded__ = true;
  GoogleSearch.__google_wait_loaded__ = false;
  
  for (i = 0, l = GoogleSearch._to_finish_init.length; i < l; i ++)
  {
    GoogleSearch._to_finish_init [i].finishInit ();
  }
  
  GoogleSearch._to_finish_init = null;
}

/**
 * @name vs.data.GoogleSearch.ERROR_CODE_STR
 * @type {Array}
 */
GoogleSearch.ERROR_CODE_STR = [
 /*0  */ 'No error',
 /*1  */ 'Unknown error',
 /*2  */ 'Unvalid parameters data',
 /*3  */ 'Error with google server',
 /*4  */ 'Connexion error',
 /*5  */ 'Unvalid google response'
];

GoogleSearch.prototype = {
  
  __local_search : undefined,
  __video_search : undefined,
  __init_ok : false,
  __engine_to_init : 0,
  __end_init_clb : null,
  _engine_loaded : false,
  _str_address: '',
  _addresses: null,
  _position: null,
 
  /**
   * @private
   * @function
   */
  finishInit : function ()
  {
    this.__init_ok = true;
    if (this.__engine_to_init)
    {
      this.setSearchEngine (this.__engine_to_init);
      this.__engine_to_init = 0;
    }
  },
  
  /**
   * Initialize the Search Engine (local and/or video)
   *
   * @name vs.data.GoogleSearch#setSearchEngine
   * @function
   * @param {number} code the search engine code 
   * (GoogleSearch.VIDEO_SEARCH_ENGINE || GoogleSearch.LOCAL_SEARCH_ENGINE)
   */
  setSearchEngine : function (code)
  {
    if (!this.__init_ok)
    {
      this.__engine_to_init = code;
      return;
    }
    
    if ((code | GoogleSearch.LOCAL_SEARCH_ENGINE) && !this.__local_search)
    {
      this.__local_search = new google.search.LocalSearch ();
      this.__local_search.setResultSetSize 
        (google.search.Search.SMALL_RESULTSET);
      this.__local_search.setNoHtmlGeneration ();
    }
    if ((code | GoogleSearch.VIDEO_SEARCH_ENGINE) && !this.__video_search)
    {
      this.__video_search = new google.search.VideoSearch ();
      this.__video_search.setResultSetSize 
        (google.search.Search.SMALL_RESULTSET);
      this.__video_search.setNoHtmlGeneration ();
    }
    this._engine_loaded = true;
    this.propagate ('engineload');
    this.propertyChange ('engineLoaded');
  },
  
/********************************************************************
                   Video Method
********************************************************************/


/********************************************************************
                   Local Search methods
********************************************************************/

  /**
   * @private
   * @function
   */
  _newGoogleLocalSearch : function (data, clb)
  {
    var self = this;
    this.__local_search.setSearchCompleteCallback (this, function () {
      clb.call (self, self.__local_search.results);
    })
    
    if (!data || typeof (data) !== 'string')
    {
      this.ERROR_CODE = 2;
      clb.call (self, null);
      return;
    }
    
    // execute  search
    this.__local_search.execute (data);
  },
  
  /**
   * @private
   * @function
   */
  _googleLocalSearch : function (data, clb)
  {
    if (this.__local_search)
    {
      this._newGoogleLocalSearch (data, clb);
      return;
    }
    
    if (!data || typeof (data) !== 'string')
    {
      this.ERROR_CODE = 2;
      clb.call (this, null);
      return;
    }
    
    // 1) build request
    var url = "http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q=" + data;
    
    // 2) build XML HTTP object
    var xmlhttp = new XMLHttpRequest ();
    
    // 3) send the request
    xmlhttp.open ("GET", url, false);
    xmlhttp.send (null);
    
    // 4) parse the result.
    if (xmlhttp.readyState === 4)
    {
      var coord_data = eval ('(' + xmlhttp.responseText + ')');
      if (coord_data.responseStatus !== 200)
      {
        this.ERROR_CODE = 3;
        clb.call (this, null);
        return;
      }
      
      if (!coord_data.responseData)
      {
        this.ERROR_CODE = 5;
        clb.call (this, null);
        return;
      }
      
      clb.call (this, coord_data.responseData);
      return;
    }

    this.ERROR_CODE = 4;
    clb.call (this, null);
    return;
  },
  
  /*
   * This is a synchronous function.
   *
   * @name vs.data.GoogleSearch#GPSCoordinateToAddress
   * @function
   *
   * @param {array} coord the GPS coordinate
   * @return {object} the associated Address
   * {title, addressLine, streetAddress, city, region, country_code, postalCode}
   * @return {Object} ctx
   */
  GPSCoordinateToAddress : function (coord, clb, ctx)
  {
    if (!this.__local_search)
    {
      console.error ("The local search engine is not initialized");
      return;
    }
    if (!ctx) { ctx = this; }

    // 0) verify parameters
    if (!coord || !coord.length)
    {
      this.ERROR_CODE = 2;
      clb.call (ctx, null);
      return;
    }
    
    // 1) build request
//    var sep = "%2C%20";
    var sep = ",";
    var data = coord [0] + sep + coord [1];
    var self = this;
    var search_clb = function (results)
    {
      if (!results)
      {
        this.ERROR_CODE = 5;
        clb.call (ctx, null);
        return;
      }
      
      if (results.length === 0 || !results[0])
      {
        this.ERROR_CODE = 5;
        clb.call (ctx, null);
        return;
      }
      self._addresses = [];
      var result = {
        title: '',
        addressLine: '',
        streetAddress: '',
        city: '',
        region: '',
        country_code: '',
        postalCode: 0
      };
      result.title = results[0].titleNoFormatting;
      result.addressLine = results[0].addressLines.join (', ');
      result.streetAddress = results[0].streetAddress;
      result.city = results[0].city;
      result.region = results[0].region;
      result.country_code = results[0].country;
      result.postalCode = results[0].postalCode;
      result.locale = self.countryToLocal (result.country_code);
      
      self._addresses.push (result);
      clb.call (ctx, result);
      self.propertyChange ('addresses');
    };
    this._googleLocalSearch (data, search_clb);
  },
  
  /**
   * @private
   * @function
   */
  countryToLocal : function (code)
  {
    switch (code)
    {
      case 'US': return 'en_US';
      case 'GB': return 'en_GB';
      case 'FR': return 'fr_FR';
      case 'CA': return 'fr_CA';
      case undefined: return 'en_US'; 
      default: return code.toLowerCase ();
    }
  },
  
  /*
   *
   * @name vs.data.GoogleSearch#addressToGPSCoordinate
   * @function
   *
   * @param {string} the address
   * @return {array} the associated coord the GPS coordinate
   * @return {Object} ctx
   */
  addressToGPSCoordinate : function (address, clb, ctx)
  {
    if (!this.__local_search)
    {
      console.error ("The local search engine is not initialized");
      return;
    }
    var result = [0, 0];
    
    if (!ctx) { ctx = this; }
    
    // 0) verify parameters
    if (!address || typeof (address) !== 'string')
    {
      this.ERROR_CODE = 2;
      clb.call (ctx, null);
      return;
    }
    
    // 1) build request
    var data = '"' + address + '"';
    
    var self = this;
    var search_clb = function (results)
    {
      if (!results) {return;}
      
      if (!results[0])
      {
        this.ERROR_CODE = 5;
        clb.call (ctx, null);
        return;
      }
      
      result [0] = parseFloat (results[0].lat);
      result [1] = parseFloat (results[0].lng);
      
      self._position = result;
      
      clb.call (ctx, result.slice ());
      self.propertyChange ('position');
    }
    this._googleLocalSearch (data, search_clb);
  },
  
  /*
   *
   * @name vs.data.GoogleSearch#searchAddress
   * @function
   *
   * @param {string} the [incomplete] address
   * @return {array} the of address
   * @return {Object} ctx
   */
  searchAddress : function (info, clb, ctx)
  {
    if (!this.__local_search)
    {
      console.error ("The local search engine is not initialized");
      return;
    }
    if (!ctx) { ctx = this; }

    // 0) verify parameters
    if (!info || typeof (info) !== 'string')
    {
      this.ERROR_CODE = 2;
      clb.call (ctx, null);
      return;
    }
    
    // 1) build request
    var data = '"' + info + '"';
    var self = this;
    var search_clb = function (results) {
      self._addresses = [];
      
      if (!results)
      {
        clb.call (ctx, []);
        self.propertyChange ('addresses');
        return;
      }
      
      for (var i = 0; i < results.length; i++)
      {
        var entry = {};
        entry.title = results[i].titleNoFormatting;
        entry.addressLine = results[i].addressLines.join (', ');
        entry.streetAddress = results[i].streetAddress;
        entry.city = results[i].city;
        entry.region = results[i].region;
        entry.country_code = results[i].country;
        entry.postalCode = results[i].postalCode;
        
        self._addresses.push (entry);
      }
      
      clb.call (ctx, self._addresses.slice ());
      self.propertyChange ('addresses');
    }
    this._googleLocalSearch (data, search_clb);
  }
};
util.extendClass (GoogleSearch, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (GoogleSearch, {
  "strAddress": {

    /** 
     * Setter for the address to look for.
     * @name vs.data.GoogleSearch#strAddress 
     * @type String
     */ 
    set : function (v)
    {
      if (!util.isString (v)) return;
      
      this._str_address = v;
      var self = this;
      // Full address search
      this.searchAddress (v, function (result) {
        // GPS coordinate search
        self.addressToGPSCoordinate (v, function (coord) {
        }, this);
      }, this);
    }
  },
  
  "addresses": {
    /** 
     * Getter to retrieve addresses matching a strAddress or a coordinate
     * @name vs.data.GoogleSearch#addresses 
     * @type Array
     */ 
    get : function (v)
    {
      return this._addresses;
    }
  },
  
  'position': {
    /** 
     * Getter/setter to get a GPS coordinate associate to a strAddress or for
     * looking the address associate to this coordinate
     * @name vs.data.GoogleSearch#position 
     * @type Array
     */ 
    set : function (v)
    {
      if (!util.isArray (v) || v.length !== 2) return;
      if (!util.isNumber (v[0]) || !util.isNumber (v[1])) return;
      
      // Full address search
      this.GPSCoordinateToAddress (v, function (result) {}, this);
    },
    
    /** 
     */ 
    get : function ()
    {
      return this._position;
    }
  },
  
  'engineLoaded': {
    /** 
     * Return true if the Search Engine is loaded, false other wise.
     * The Component can be used only if the search engine is loaded.
     * @name vs.data.GoogleSearch#engineLoaded 
     * @type RSSFeed
     */ 
    get : function ()
    {
      return this._engine_loaded;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
data.GoogleSearch = GoogleSearch;

})(window);