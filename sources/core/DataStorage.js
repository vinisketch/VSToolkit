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
 *  @extends vs.core.EventSource
 *  @class vs.core.DataStorage 
 *  is an abstract class for managing data save and laod.
 *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND 
 *  THE API MAY CHANGE IN THE FUTURE <<< <p>
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.DataStorage
 * @see vs.core.LocalStorage
 *
 * @param {Object} config the configuration structure
 */
function DataStorage (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = vs.core.DataStorage;

  this.__models__ = {};
}

DataStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
   __models__: null,
  
  /*****************************************************************
   *              
   ****************************************************************/
   
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Register a model into the sync service.
   *
   * @name vs.core.DataStorage#registerModel
   * @function
   * @param {String} name model name
   * @param {vs.core.Model} model the model to register
   */
  registerModel : function (name, model)
  {
    if (!name || !model) return;
    
    if (this.__models__ [name])
      error.log ("Model with the name already registered.");
      
    this.__models__ [name] = model;
    
    model._sync_service_ = this;
  },
  
  /**
   * Remove a model from the sync service. <br/>
   * If the you want also delete delete data you have to call before the 
   * delete methode
   *
   * @name vs.core.DataStorage#removeModel
   * @function
   * @param {String} name model name
   */
  removeModel : function (name)
  {
    if (!name) return;
    
    if (!this.__models__ [name]) return;
      
    delete (this.__models__ [name]);
  },
  
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Save models. If a name is specified, it save only the model
   * associated to the name.
   *
   * @name vs.core.DataStorage#save
   * @function
   * @param {String} name model name to save [optional]
   */
  save : function (name) {},
  
  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.DataStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name) {},
  
  /*****************************************************************
   *              
   ****************************************************************/
};
util.extendClass (DataStorage, core.EventSource);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.DataStorage = DataStorage;
