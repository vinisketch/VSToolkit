export default {
  external: ['vs_utils', 'vs_core'],
  input: 'src/av/index.js',
  output: [
    {
      file: './dist/js/vs_av.js',
      name: 'vs_av',
      globals: { vs_utils: 'vs_utils', vs_core: 'vs_core' },
      format: 'iife',
    },
    {
      file: './es/vs_av.js',
      name: 'vs_av',
      globals: { vs_utils: 'vs_utils', vs_core: 'vs_core' },
      format: 'es',
    },
    {
      file: './lib/vs_av.js',
      name: 'vs_av',
      globals: { vs_utils: 'vs_utils', vs_core: 'vs_core' },
      format: 'amd'
    }
  ],
  plugins: [
  ]
};
