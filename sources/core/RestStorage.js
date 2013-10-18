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
 *  @extends vs.core.DataStorage
 *  @class vs.core.RestStorage
 *  is an implementation of DataStorage for REST service
 *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND
 *  THE API MAY CHANGE IN THE FUTURE <<< <p>
 *  SUPPORT only load for now.
 *
 *  @example
 *   var todoList = new vs.core.Array ();
 *   todoList.init ();
 *
 *   var restSource = new vs.core.RestStorage ({
 *     url: "https://xxx"
 *   }).init ();
 *   restSource.registerModel ("todoslistOne", todosList);
 *   restSource.registerModel ("todoslistTwo", todosList);
 *   // Load all models
 *   restSource.load ();
 *   // Load only todoslistOne model
 *   restSource.load ("todoslistOne");
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.RestStorage
 *
 * @param {Object} config the configuration structure
 */
function RestStorage (config)
{
  this.parent = DataStorage;
  this.parent (config);
  this.constructor = RestStorage;

  this._xhrs = {};
  this._headers = {};
}

/**
 * Configure the RestStorage to use HttpRequest. Default configuration.
 * @name vs.core.RestStorage.XHR
 * @see vs.core.RestStorage#mode
 * @const
 */
RestStorage.XHR = 0;

/**
 * Configure the RestStorage to use JSONP
 * @name vs.core.RestStorage.JSONP
 * @see vs.core.RestStorage#mode
 * @const
 */
RestStorage.JSONP = 1;

RestStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/

  /**
   *
   * @protected
   * @type {Object}
   */
  _xhrs: null,

  /**
   *
   * @protected
   * @type {}
   */
  _mode: 0,

  /**
   *
   * @protected
   * @type {Object}
   */
  _headers: null,

  /**
   *
   * @protected
   * @type {String}
   */
  _url: '',

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    DataStorage.prototype.initComponent.call (this);
  },

  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    DataStorage.prototype.destructor.call (this);
  },

  /**
   *
   * @name vs.core.RestStorage#setHeaders
   * @function
   * An object of additional header key/value pairs to send along with the
   * HTTP request.
   *
   * @param {Object} obj A <key/string> object
   */
  setHeaders : function (obj)
  {
    if (!obj) return;

    this._headers = {};

    for (var key in obj)
    {
      this._headers [key] = obj [key];
    }
  },

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * Save models. If a name is specified, it saves only the model
   * associated to the name.
   *
   * @name vs.core.RestStorage#save
   * @function
   * @param {String} name model name to save [optional]
   */
  save : function (name)
  {
    var self = this;
    function _save (name)
    {
      var json, model = self.__models__ [name];
      if (!model) return;

      try
      {
        if (model.toJSON) json = model.toJSON ();
        else json = JSON.stringify (model);
      }
      catch (e)
      {
        error.log (e);
        self.propagate ("error", e);
      }

      RestStorage.setItem (name, json);
    }
    if (name) _save (name);
    else for (var name in this.__models__) _save (name);

    self.propagate ("save");
  },

  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.RestStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name)
  {
    if (this._mode === RestStorage.XHR) this._load_xhr (name);
    if (this._mode === RestStorage.JSONP) this._load_jsonp (name);
  },

  /**
   * @private
   */
  _load_xhr : function (name)
  {
    var type = "GET";

    var dataType = 'xml';

    var self = this;
    function _load (name)
    {
      try {
        var model = self.__models__ [name];
        if (!model) return;

//        var url = self._url + name + '.json';
        var url = self._url + name;

        var ps = model.getModelProperties (), j = 0;
        if (ps && ps.length)
        {
          url += '?';
          for (var i = 0; i < ps.length; i ++)
          {
            var prop_name = ps[i], value = model ['_' + prop_name];
            if (prop_name === "id" || prop_name === 'modelClass') continue
            if (!util.isString (value) && !util.isNumber (value)) continue;
            if (j++) url += '&';
            url += prop_name + '=' + escape (value);
          }
        }

        var xhr = new HTTPRequest ().init ();
        self._xhrs [xhr.id] = name;
        xhr.bind ('textload', self, self._process_xhr_result);
        xhr.setHeaders (self._headers);
        xhr.url = url;
        xhr.method = "GET";
        xhr.contentType = "application/json";
        xhr.send ();
      }
      catch (e)
      {
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
  },

 /**
   * @private
   */
  _load_jsonp : function (name)
  {
    var type = "GET";

    var dataType = 'xml';

    var self = this;
    function _load (name)
    {
      try {
        var model = self.__models__ [name];
        if (!model) return;

        var url = self._url + name + '.json';

        var ps = model.getModelProperties (), j = 0;
        if (ps && ps.length)
        {
          url += '?';
          for (var i = 0; i < ps.length; i ++)
          {
            var prop_name = ps[i], value = model ['_' + prop_name];
            if (prop_name === "id" || prop_name === 'modelClass') continue
            if (!util.isString (value) && !util.isNumber (value)) continue;
            if (j++) url += '&';
            url += prop_name + '=' + escape (value);
          }
        }

        var xhr = new AjaxJSONP ().init ();
        self._xhrs [xhr.id] = name;
        xhr.bind ('jsonload', self, self._process_json_result);
        xhr.url = url;
        xhr.send ();
      }
      catch (e)
      {
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
  },

  _sync : function (method, url, specific_data)
  {
//     var params = {}, data = '';
//
//     // Ensure that we have the appropriate request data.
//     if (method == 'POST' || method == 'PUT')
//     {
//       this._xhr.contentType = 'application/json';
//       if (!specific_data)
//       { data = this.toJSON (); }
//       else
//       { data = specific_data; }
//     }
//
//     this._xhr.method = method;
//     this._xhr.url = url;
//
//     // Make the request.
//     this._xhr.send (data);
  },

  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#_process_xhr_result
   * @function
   *
   * @private
   * @param Text rsstxt
   * @param Document rssxml
   */
  _process_xhr_result : function (event)
  {
    var data = event.data, xhr = event.src;
    var model_name = this._xhrs [xhr.id];
    xhr.unbind ('textload', this, this._process_xhr_result);
    vs.util.free (xhr);
    delete (this._xhrs [xhr.id]);

    if (!data)
    {
      console.error ("Failed to parse rss document that is null.");
      return false;
    }

    var model = this.__models__ [model_name];
    if (!model) return;

    model.parseJSON (data);
    model.change ();
    this.propagate ('load', model);
  },

  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#_process_json_result
   * @function
   *
   * @private
   * @param Text rsstxt
   * @param Document rssxml
   */
  _process_json_result : function (event)
  {
    var data = event.data, xhr = event.src;
    var model_name = this._xhrs [xhr.id];
    xhr.unbind ('textload', this, this._process_json_result);
    vs.util.free (xhr);
    delete (this._xhrs [xhr.id]);

    var model = this.__models__ [model_name];
    if (!model) return;

    model.parseData (data);
    model.change ();
    this.propagate ('load', model);
  }
};
vs.util.extendClass (RestStorage, DataStorage);

/********************************************************************
                  Define class properties
********************************************************************/

vs.util.defineClassProperties (RestStorage, {
  "url": {
    /**
     * Setter for the url
     * @name vs.core.RestStorage#url
     * @type String
     */
    set : function (v)
    {
      if (!vs.util.isString (v)) { return; }

      this._url = v;
    },

    /**
     * Getter for the url
     * @name vs.core.RestStorage#url
     * @type String
     */
    get : function (v)
    {
      return this._url;
    }
  },

  "mode": {
    /**
     * Setter request mode
     * @name vs.core.RestStorage#mode
     * @type XHR | JSONP
     */
    set : function (v)
    {
      if (v === 0 || v === 1) this._mode = v;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.core.RestStorage = RestStorage;
