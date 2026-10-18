// import Component from "./Component";

// /**
//  *  @extends core.EventSource
//  *  @class core.DataStorage
//  *  is an abstract class for managing data save and laod.
//  *  <br/><br/> >>>> THIS CODE IS STILL UNDER BETA AND
//  *  THE API MAY CHANGE IN THE FUTURE <<< <p>
//  *
//  *  @author David Thevenin
//  *
//  *  @constructor
//  *  Main constructor
//  *
//  * @name core.DataStorage
//  * @see core.LocalStorage
//  *
//  * @param {Object} config the configuration structure
//  */
// export class DataStorage extends Component {

//   private models = new Map<string, Model>();

//   constructor(config) {
//     super(config)
//   }

//   /**
//    * Register a model into the sync service.
//    *
//    * @name core.DataStorage#registerModel
//    * @function
//    * @param {String} name model name
//    * @param {core.Model} model the model to register
//    */
//   registerModel(name, model) {
//     if (!name || !model) return;

//     if (this.__models__ [name])
//       error.log("Model with the name already registered.");

//     this.__models__ [name] = model;

//     model._sync_service_ = this;
//   }

//   /**
//    * Remove a model from the sync service. <br/>
//    * If the you want also delete delete data you have to call before the
//    * delete methode
//    *
//    * @name core.DataStorage#removeModel
//    * @function
//    * @param {String} name model name
//    */
//   removeModel(name) {
//     if (!name) return;

//     if (!this.__models__ [name]) return;

//     delete (this.__models__ [name]);
//   }

//   /*****************************************************************
//    *
//    ****************************************************************/

//   /**
//    * Save models. If a name is specified, it save only the model
//    * associated to the name.
//    *
//    * @name core.DataStorage#save
//    * @function
//    * @param {String} name model name to save [optional]
//    */
//   save(name) {
//   }

//   /**
//    * Load models. If a name is specified, it load only the model
//    * associated to the name.
//    *
//    * @name core.DataStorage#load
//    * @function
//    * @param {String} name model name to save [optional]
//    */
//   load(name) {
//   }

//   /*****************************************************************
//    *
//    ****************************************************************/
// }