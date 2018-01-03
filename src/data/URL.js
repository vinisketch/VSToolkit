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

import vs_utils from 'vs_utils';
import vs_core from 'vs_core';

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
  this.parent = vs_core.VSObject;
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
    if (!vs_utils.isString (str)) { return; }
    
    this._src = str;
    
    var	o   = this.__options,
      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      i   = 14, self = this;
  
    while (i--) { this [o.key[i]] = m[i] || ""; }
  
    this [o.q.name] = {};
    this [o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) self [o.q.name][$1] = $2;
    });
    
    this.outPropertyChange ('src');
  }
};
vs_utils.extendClass(URL, vs_core.VSObject);

/********************************************************************
                  Define class properties
********************************************************************/

vs_utils.defineClassProperties (URL, {
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
      if (!vs_utils.isString (v)) { return; }
      
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
export default URL;
