import html from 'rollup-plugin-html';
import visualizer from 'rollup-plugin-visualizer';

export default {
  external: ['vs_utils', 'vs_core', 'vs_gesture'],
  input: 'src/ui/index.js',
  output: [
    {
      file: './dist/js/vs_ui.js',
      name: 'vs_ui',
      globals: {
        vs_utils: 'vs_utils',
        vs_core: 'vs_core',
        vs_gesture: 'vs_gesture'
      },
      format: 'iife',
    }
  ],
  plugins: [
    html({
      include: 'src/ui/**/*.html'
    }),
    // visualizer({
    //   filename: './stats/ui.html'
    // })
  ]
};
