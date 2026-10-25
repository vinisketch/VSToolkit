/**
 * The html templates of the components are imported as strings
 * (rollup-plugin-html for the build, tests/html-loader.mjs for the tests)
 */
declare module '*.html' {
  const template: string;
  export default template;
}
