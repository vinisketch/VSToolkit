import { SupportMixins } from 'vs_utils';
import { BaseIdentifiable, ObjectId } from './BaseIdentifiable';
import { EventSource } from './event';
export type InitFunction = () => void;
/**
 *  @class Object
 *  core.Object is the root class of most class hierarchies. Through
 *  core.Object, objects inherit a basic interface for configuration
 *  and clone mechanism. It provides a unique identifier for objects.
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @param {Object} config the configuration structure
*/
declare class Component extends SupportMixins implements BaseIdentifiable {
    #private;
    static instances: {
        [id: string]: Component;
    };
    readonly id: string;
    constructor(id?: ObjectId);
    /**
     *  Object default init. <p>
     *
     *  @example
     *  myObject = new core.Object (core.createId ());
     *  myObject.init ();
     *  @return {Object} this
     */
    init(): this;
    protected initComponent(): void;
    protected componentDidInitialize(): void;
    protected destructor(): void;
    isDeleted(): boolean;
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     *
     * @return {Object} the object value for stringify
     */
    toJSON(): string;
    /**
     *  Set objet's properties from JSON stringification.<p/>
     *  This can be used when retrieve data from serialization.
     *
     * @param {String} json The JSON String
     */
    parseJSON(json: string): void;
    /**
     *  Returns a copy of the objet's properties for JSON stringification.<p/>
     *  This can be used for persistence or serialization.
     */
    protected serialize(): any;
    protected deserialize(data: any): void;
}
interface Component extends BaseIdentifiable, EventSource {
}
export default Component;
//# sourceMappingURL=Component.d.ts.map