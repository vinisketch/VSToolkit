let idIndex = 1;
/**
 * Returns a local unique Id <p>
 * The algorithm is based on an index initialized when the page is loaded.
 */
// eslint-disable-next-line no-plusplus
export const createUniqueId = () => `vs_id_${idIndex++}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
//# sourceMappingURL=helpers.js.map