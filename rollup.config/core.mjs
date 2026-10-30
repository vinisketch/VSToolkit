import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

export default [{
    external: ['vs_utils', 'winston'],
    input: 'src/core/index.ts',
    plugins: [esbuild({
      include: /\.[jt]sx?$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      sourceMap: true, // default
      tsconfig: 'src/tsconfig.json'
    })],
    output: [
      {
        file: 'dist/vs_core.es.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/vs_core.amd.js',
        format: 'amd',
        sourcemap: true,
        name: 'vs_core',
        exports: 'named',
      },
    ],
  },
  {
    input: `build/core/index.d.ts`,
    plugins: [dts()],
    output: {
      file: `dist/vs_core.d.ts`,
      format: 'es',
    },
  }
]
