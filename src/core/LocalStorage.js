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

import {
  isFunction, isString, extendClass, defineClassProperty
} from 'vs_utils';

/**
 *  @extends vs.core.DataStorage
 *  @class vs.core.LocalStorage 
 *  is an implementation of DataStorage for storing data into HTML5 LocalStorage
 *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND 
 *  THE API MAY CHANGE IN THE FUTURE <<< <p>
 * 
 *  @example
 *   var todoList = vs.core.Array ();
 *   todoList.init ();
 *
 *   var localStorage = new vs.core.LocalStorage ();
 *   localStorage.init ();
 *   localStorage.registerModel ("todoslist", todosList);
 *   localStorage.load ();
 *   ...
 *   // model modification
 *   localStorage.save ();
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.LocalStorage
 *
 * @param {Object} config the configuration structure
 */
function LocalStorage (config)
{
  this.parent = DataStorage;
  this.parent (config);
  this.constructor = LocalStorage;
}

LocalStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
  /*****************************************************************
   *              
   ****************************************************************/
   
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Save models. If a name is specified, it saves only the model
   * associated to the name.
   *
   * @name vs.core.LocalStorage#save
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
        json = JSON.stringify (model);
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        error.log (e);
        self.propagate ("error", e);
      }
      
      localStorage.setItem (name, json);
    }
    if (name) _save (name);
    else for (var name in this.__models__) _save (name);
    
    self.propagate ("save");
  },
  
  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.LocalStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name)
  {
    var self = this;
    function _load (name)
    {
      try {
        var json, model = self.__models__ [name];
        if (!model) return;
        
        var store = localStorage.getItem (name);
        model.parseJSON (store);
      }
      catch (e)
      {
        if (e.stack) console.log (e.stack)
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
    
    self.propagate ("load");
  }
};
extendClass (LocalStorage, DataStorage);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
export default LocalStorage;
