export default {
  external: ['vs_utils', 'vs_core', 'vs_ui', 'vs_gesture'],
  input: 'src/fx/index.js',
  output: [
    {
      file: './dist/js/vs_fx.js',
      name: 'vs_fx',
      globals: {
        vs_utils: 'vs_utils',
        vs_core: 'vs_core',
        vs_ui: 'vs_ui',
        vs_gesture: 'vs_gesture'
      },
      format: 'iife',
    }
  ],
  plugins: [
  ]
};
