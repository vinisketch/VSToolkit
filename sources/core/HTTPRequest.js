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
 *  The HTTPRequest class
 *
 * @extends vs.core.EventSource
 * @name vs.core.HTTPRequest
 * @events textload, xmlload, loaderror
 * @class
 * It provides scripted client functionality for transferring data between
 * a client and a server.
 *
 *  @constructor
 *   Creates a new HTTPRequest.
 *
 *  <p>
 *  Events:
 *  <ul>textload
 *    <li/> xmlload: data [xml doc]; propagate when data are loaded
 *    <li/> textload: data [text]: propagate when data are loaded
 *    <li/> loaderror: data [error information]: propagate when an error occured
 *  </ul>
 *  <p>
 * @example
 *  var xhr = new vs.core.HTTPRequest ({url: "http..."});
 *  xhr.init ();
 *  xhr.bind ('xmlload', this, this.processRSS);
 *  xhr.send ();
 *
 * @param {Object} config the configuration structure
 */
HTTPRequest = function (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = HTTPRequest;

  this._headers = {};
};

HTTPRequest.prototype = {

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
   * @type {string}
   */
  _method: 'GET',

  /**
   *
   * @protected
   * @type {string}
   */
  _login: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _password: '',

  /**
   *
   * @protected
   * @type {string}
   */
  _content_type: '',

  /**
   *
   * @protected
   * @type {Object}
   */
  _headers: null,

 /*********************************************************
 *                   management
 *********************************************************/

  /**
   *
   * @name vs.core.HTTPRequest#setHeaders
   * @function
   * An object of additional header key/value pairs to send along with the
   * request.
   *
   * @param {Object} obj A <key/string> object
   */
  setHeaders : function (obj)
  {
    if (!obj) return;

    for (var key in obj)
    {
      this._headers [key] = obj [key];
    }
  },

  /**
   *
   * @name vs.core.HTTPRequest#send
   * @function
   *
   * @param {String} data The data to send [optional]
   */
  send : function (data)
  {
    var xhr = new XMLHttpRequest ();

    try
    {
      this._response_text = null;
      this._response_xml = null;

      //prepare the xmlhttprequest object
      xhr.open (this._method, this._url, true, this._login || null, this._password || null);

      xhr.setRequestHeader ("Cache-Control", "no-cache");
      xhr.setRequestHeader ("Pragma", "no-cache");

      for (var key in this._headers)
      {
        xhr.setRequestHeader (key, this._headers [key]);
      }
      this._headers = {};

      if (this._content_type)
      { xhr.setRequestHeader('Content-Type', this._content_type); }

      var self = this;
      xhr.onabort = function (e)
      {
        xhr.onload = xhr.onerror = xhr.onabort = null;
        delete (xhr);
        self.propagate ('loaderror', {'status': 'aborted'});
      }
      xhr.onerror = function (e)
      {
        xhr.onload = xhr.onerror = xhr.onabort = null;
        delete (xhr);
        self.propagate ('loaderror', {'status': 'failed', 'response':e});
      }
      xhr.onload = function ()
      {
        xhr.onload = xhr.onerror = xhr.onabort = null;
        
        function endWithError (message) {
          self.propagate ('loaderror', message);
          delete (xhr);
          return false;
        }
        
        // manage possible errors
        if (xhr.readyState !== 4) return endWithError (xkr.statusText); 
        
        else if (xhr.status === 200)
        {
          self._response_text = xhr.responseText;
          self._response_xml = xhr.responseXML;

          self.propagateChange ();

          self.propagate ('textload', self._response_text);
          if (self._response_xml)
            self.propagate ('xmlload', self._response_xml);
          delete (xhr);
          return true;
        }
        
        else
        {
          return endWithError ({
            'status': xhr.statusText,
            'response':xhr.response
          });
        }
      }

      //send the request
      xhr.send (data);
    }
    catch (e)
    {
      xhr.onload = xhr.onerror = xhr.onabort = null;
      delete (xhr);
      this.propagate ('loaderror', e);
      return;
    }
  }
};
util.extendClass (HTTPRequest, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (HTTPRequest, {
  "url": {
    /**
     * Setter for the url
     * @name vs.core.HTTPRequest#url
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._url = v;
    }
  },

  'method': {
    /**
     * Set request method (GET | POST)
     * @name vs.core.HTTPRequest#method
     * @type String
     */
    set : function (v)
    {
      if (v != 'GET' && v != 'POST') { return; }

      this._method = v;
    }
  },

  'login': {
    /**
     * Set request login
     * @name vs.core.HTTPRequest#login
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._login = v;
    }
  },

  'password': {
    /**
     * Set request password
     * @name vs.core.HTTPRequest#password
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._password = v;
    }
  },

  'contentType': {
    /**
     * Set request content type
     * @name vs.core.HTTPRequest#contentType
     * @type String
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }

      this._content_type = v;
    }
  },

  'responseText': {
    /**
     * Return request result as Text
     * @name vs.core.HTTPRequest#responseText
     * @type String
     */
    get : function ()
    {
      return this._response_text;
    }
  },

  'responseXML': {
    /**
     * Return request result as XML document
     * @name vs.core.HTTPRequest#responseXML
     * @type Document
     */
    get : function ()
    {
      return this._response_xml;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.HTTPRequest = HTTPRequest;
