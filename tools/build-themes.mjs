#!/usr/bin/env node
/**
 * Builds the CSS themes into lib/css (npm run build:css).
 *
 * For each src/themes/<theme>/files.json:
 *  - concat: { "<output>": [<sources>] } the sources (relative to the theme)
 *    are concatenated; a .less output is compiled to .css
 *  - copy: [<glob>] the assets (images, fonts…) are copied, relative to the
 *    folder of the glob ('ui/*.png' → lib/css/<name>.png,
 *    'ui/toolbar_icons/**' → lib/css/toolbar_icons/…)
 */
import fs from 'node:fs';
import path from 'node:path';
import less from 'less';

const THEMES = 'src/themes';
const OUTPUT = 'lib/css';

/**
 * The folder the files of a glob are copied relative to: the folder of its
 * first wildcard ('ui/*.png' → its files), the parent folder for a whole
 * folder ('ui/toolbar_icons/**' → the toolbar_icons folder)
 */
function globBase(pattern) {
  if (pattern.endsWith('/**')) return path.dirname(pattern.slice(0, -3));
  const index = pattern.search(/[*?[{]/);
  return index === -1 ? path.dirname(pattern) : path.dirname(pattern.slice(0, index) + 'x');
}

async function buildFile(themeDir, output, sources) {
  const content = sources
    .map(source => fs.readFileSync(path.join(themeDir, source), 'utf8'))
    .join('\n');
  if (!output.endsWith('.less')) return { file: output, css: content };

  const { css } = await less.render(content, {
    filename: path.resolve(themeDir, output),
    paths: [themeDir],
    // the themes predate less 4: divisions without parentheses, and lesshat
    // (inline javascript)
    math: 'always',
    javascriptEnabled: true,
  });
  return { file: output.replace(/\.less$/, '.css'), css };
}

function copyAssets(themeDir, patterns) {
  let count = 0;
  for (const pattern of patterns) {
    const base = globBase(pattern);
    for (const file of fs.globSync(pattern, { cwd: themeDir })) {
      const source = path.join(themeDir, file);
      if (!fs.statSync(source).isFile()) continue;
      const target = path.join(OUTPUT, path.relative(base, file));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target);
      count++;
    }
  }
  return count;
}

let failures = 0;
fs.mkdirSync(OUTPUT, { recursive: true });

for (const theme of fs.readdirSync(THEMES).sort()) {
  const themeDir = path.join(THEMES, theme);
  const manifest = path.join(themeDir, 'files.json');
  if (!fs.existsSync(manifest)) continue;
  const { concat = {}, copy = [] } = JSON.parse(fs.readFileSync(manifest, 'utf8'));

  for (const [output, sources] of Object.entries(concat)) {
    try {
      const { file, css } = await buildFile(themeDir, output, sources);
      fs.writeFileSync(path.join(OUTPUT, file), css);
      console.log(`${theme}: ${file} (${Math.round(css.length / 1024)} kB)`);
    } catch (error) {
      failures++;
      const where = error.line ? ` line ${error.line}` : '';
      console.error(`${theme}: ${output} failed${where}: ${error.message}`);
    }
  }
  const assets = copyAssets(themeDir, copy);
  if (assets) console.log(`${theme}: ${assets} assets`);
}

if (failures) {
  console.error(`${failures} theme file(s) failed`);
  process.exit(1);
}
