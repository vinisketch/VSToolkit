export type ObjectId = string;

/**
 * Interface for objects that have an identifier
 */
export interface BaseIdentifiable {
  readonly id: ObjectId;
}
