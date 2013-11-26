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
    this.outPropertyChange ('engineLoaded');
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
      self.outPropertyChange ('addresses');
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
      self.outPropertyChange ('position');
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
        self.outPropertyChange ('addresses');
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
      self.outPropertyChange ('addresses');
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
     * @ignore
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
