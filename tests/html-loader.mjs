// Node module hooks (see .mocharc.json): an imported .html file is a module
// exporting its content as a string, as rollup-plugin-html does for the build
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.html')) {
      const content = readFileSync(new URL(url), 'utf8');
      return { format: 'module', source: `export default ${JSON.stringify(content)};`, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
