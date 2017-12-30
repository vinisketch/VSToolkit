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

import { isString, importFile } from 'vs_utils';
import EventSource from './EventSource';

/**
 *  The AjaxJSONP class
 *
 * @extends vs.core.EventSource
 * @name vs.core.AjaxJSONP
 * @events jsonload, loaderror
 * @class
 * It performs a JSONP request to fetch data from another domain.
 *
 *  @constructor
 *   Creates a new AjaxJSONP.
 *
 *  <p>
 *  Events:
 *  <ul>
 *    <li/> jsonload: data [Object]: propagate when data are loaded
 *    <li/> loaderror: data [error information]: propagate when an error occured
 *  </ul>
 *  <p>
 * @example
 *  var xhr = new vs.core.AjaxJSONP ({url: "http..."}).init ();
 *  xhr.bind ('jsonload', this, this.processRSS);
 *  xhr.send ();
 *
 * @param {Object} config the configuration structure
 */
var AjaxJSONP = core.createClass ({

  parent: EventSource,

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
  _clb_param_name: 'callback',

  /**
   *
   * @private
   * @type {number}
   */
  __index: 0,

  /*********************************************************
  *                  Properties
  *********************************************************/

  properties : {
    "url": {
      /**
       * Setter for the url
       * @name vs.core.AjaxJSONP#url
       * @type String
       */
      set : function (v)
      {
        if (!isString (v)) { return; }

        this._url = v;
      }
    },
    "clbParamName": {
      /**
       * Setter for the name of the callback parameter in jsonp payload
       * By default the value is 'callback'
       * @name vs.core.AjaxJSONP#clbParamName
       * @type String
       */
      set : function (v)
      {
        if (!isString (v)) { return; }

        this._clb_param_name = v;
      }
    },

    'responseJson': {
      /**
       * Return request result as Javascript Object
       * @name vs.core.AjaxJSONP#responseJson
       * @type Document
       */
      get : function ()
      {
        return this._response_json;
      }
    }
  },

 /*********************************************************
 *                   management
 *********************************************************/

  /**
   *
   * @name vs.core.AjaxJSONP#send
   * @function
   */
  send : function ()
  {
    var
      self = this,
      callbackName = 'jsonp' + self._id + (self.__index++),
      urlCallback = this._clb_param_name + "=" + callbackName,
      script_src = self._url, lastIndex = script_src.length - 1;

    if (script_src [lastIndex] === '?')
      script_src += urlCallback;
    else if (script_src.indexOf ('?') !== "-1")
      script_src += "&" + urlCallback;
    else if (script_src [lastIndex] === '/')
      script_src = script_src.substr (0, lastIndex) + "?" + urlCallback;
    else
      script_src += "?" + urlCallback;

    var
      script = importFile (script_src, null, null, 'js'),
      removeScript = function ()
      {
        if (script)
        {
          script.parentElement.removeChild (script);
          script = undefined;
        }
      },
      abortTimeout = setTimeout (function ()
      {
        removeScript ();
        if (callbackName in window) delete (window [callbackName]);
        self.propagate ('loaderror', 'Impossible to load data');
      }, 3000);

    window [callbackName] = function (data)
    {
      clearTimeout (abortTimeout)
      removeScript ();
      delete window[callbackName];

      if (!data) return;
      if (data.error)
      {
        self.propagate ('loaderror', data.error);
        return;
      }
      self._response_json = data;
      self.outPropertyChange ();
      self.propagate ('jsonload', data);
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default AjaxJSONP;
