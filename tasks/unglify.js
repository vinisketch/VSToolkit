
module.exports = function (grunt) {

  grunt.config.set('uglify', {
      release: {
        files: {
          'lib/js/vs_core.js': ['lib_debug/js/vs_core.js'],
          'lib/js/vs_ui.js': ['lib_debug/js/vs_ui.js'],
          'lib/js/vs_data.js': ['lib_debug/js/vs_data.js'],
          'lib/js/vs_av.js':['lib_debug/js/vs_av.js'],
          'lib/js/vs_fx.js': ['lib_debug/js/vs_fx.js'],
          'lib/js/vs_ext.js': ['lib_debug/js/vs_ext.js'],
          'lib/js/vs_ext_fx.js': ['lib_debug/js/vs_ext_fx.js'],
          'lib/js/vs_webcomponent.js': ['lib_debug/js/vs_webcomponent.js']
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};
