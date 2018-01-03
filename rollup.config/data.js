export default {
  external: ['vs_utils', 'vs_core'],
  input: 'src/data/index.js',
  output: [
    {
      file: './dist/js/vs_data.js',
      name: 'vs_data',
      globals: { vs_utils: 'vs_utils', vs_core: 'vs_core' },
      format: 'iife',
    },
    {
      file: './es/vs_data.js',
      name: 'vs_data',
      globals: { vs_utils: 'vs_utils', vs_core: 'vs_core' },
      format: 'es',
    },
    {
      file: './lib/vs_data.js',
      name: 'vs_data',
      globals: { vs_utils: 'vs_utils', vs_core: 'vs_core' },
      format: 'amd'
    }
  ],
  plugins: [
  ]
};
