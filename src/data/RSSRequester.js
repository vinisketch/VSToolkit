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

import vs_utils from 'vs_utils';
import vs_core from 'vs_core';

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
    this.value = guidElement.textContent;
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
    this.value = souElement.textContent;
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
      this [_properties [i]] = tmpElement.textContent;
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

vs_utils.defineClassProperties (RSSItem, {

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
    this.value = catElement.textContent;
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
      rssFeed [_properties [i]] = tmpElement.textContent;
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
var RSSFeed = function (config)
{
  this.parent = vs_core.EventSource;
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
vs_utils.extendClass(RSSFeed, vs_core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (RSSFeed, {
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
var RSSRequester = function (config)
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

    this._xhr = new vs_core.HTTPRequest ();
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
    this.outPropertyChange ();
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
    
    // stop the propagation, it will restart when RSS data will be loaded
    return true; 
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
vs_utils.extendClass (RSSRequester, RSSFeed);

function _performAlternateYahooPipeRequest ()
{
  var ajaxp = new vs_core.AjaxJSONP ().init ();
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
      this.outPropertyChange ();
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

vs_utils.defineClassProperties (RSSRequester, {
  "url": {

    /**
     * Setter for the rss's url
     * @name vs.data.RSSRequester#url
     * @type String
     */
    set : function (v)
    {
      if (!vs_utils.isString (v)) { return; }

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
export {
  RSSFeed,
  RSSRequester
};
