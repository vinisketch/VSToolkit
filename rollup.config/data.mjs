import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

export default [{
  external: ['vs_utils', 'vs_core'],
  input: 'src/data/index.ts',
  plugins: [esbuild({
    include: /\.[jt]sx?$/, // default, inferred from `loaders` option
    exclude: /node_modules/, // default
    sourceMap: true, // default
    tsconfig: 'src/tsconfig.json'
  })],
  output: [
    {
      file: 'dist/vs_data.es.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/vs_data.amd.js',
      format: 'amd',
      sourcemap: true,
      name: 'vs_data',
      exports: 'named',
    },
  ]},
  {
    input: `build/data/index.d.ts`,
    plugins: [dts()],
    output: {
      file: `dist/vs_data.d.ts`,
      format: 'es',
    }
  }
]
