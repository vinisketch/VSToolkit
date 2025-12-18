/**
 * @private
 */
let idIndex = 0;

/**
 * Returns a local unique Id <p>
 * The algorithm is based on an index initialized when the page is loaded.
 *
 * @return {String}
 */
export function createId (): string {
  return `vs_id_${idIndex++}`;
}

/**
 * Returns a unique Id <p>
 * The algorithm uses a time stamp and a random number to generate the id.
 *
 * @return {String}
 */
export function createUniqueId(): string {
  return `vs_id_${Date.now()}_${Math.floor (Math.random() * 1000000)}`;
}
