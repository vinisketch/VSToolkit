export default {
  external: ['vs_utils', 'vs_gesture'],
  input: 'src/core/index.js',
  output: [
    {
      file: './dist/js/vs_core.js',
      name: 'vs_core',
      globals: { vs_utils: 'vs_utils', vs_gesture: 'vs_gesture' },
      format: 'iife',
    }
  ],
  plugins: [
  ]
};
