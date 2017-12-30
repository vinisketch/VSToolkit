
module.exports = function(grunt) {

  const regexp = /\/([\w]*).html/;

  grunt.config.init({
    concat: {

      template: {
        options: {
          // generate template import
          banner: "",
          process: function(src, filepath) {
            const matches = filepath.match(regexp);
            if (!matches || matches.length !== 2) {
              throw new Error("Template generation failed: wrong file name format: " + filepath + "\n");
            }
            return matches[1] + '.prototype.html_template = "' +
              src.replace(/"/g, "'").replace(/(\n)/g, " \\$1") +
              '";\n';
          },
        },
        files: {
          './tmp/ui_template.js': [ "sources/ui/**/*.html" ],
          './tmp/av_template.js': [ "sources/av/Video/Video.html" ],
          './tmp/ext_template.js': [ "sources/ext/ui/**/*.html" ]
        }
      },

      debug: {
        files: {
          'lib_debug/js/vs_core.js': [
            'sources/Header.js',
            'sources/core/Core.js',
            'sources/core/*.js',
            'sources/Footer.js'
          ],
          'lib_debug/js/vs_ui.js': [
            'sources/Header.js',
            'sources/ui/UI.js',
            'sources/ui/Template.js',
            'sources/ui/*/**/*.js',
            'tmp/ui_template.js',
            'sources/ui/UI_footer.js'
          ],
          'lib_debug/js/vs_data.js': [
            'sources/Header.js',
            'sources/data/Data.js',
            'sources/data/*.js',
            'sources/Footer.js'
          ],
          'lib_debug/js/vs_av.js': [
            'sources/Header.js',
            'sources/av/AV.js',
            'sources/av/**/*.js',
            'tmp/av_template.js',
            'sources/Footer.js'
          ],
          'lib_debug/js/vs_fx.js': [
            'sources/Header.js',
            'sources/fx/FX.js',
            'sources/fx/**/*.js',
            'sources/Footer.js'
          ],
          'lib_debug/js/vs_ext.js': [
            'sources/Header.js',
            'sources/ext/Ext.js',
            'sources/ext/ui/**/*.js',
            'tmp/ext_template.js',
            'sources/Footer.js'
          ],
          'lib_debug/js/vs_ext_fx.js': [
            'sources/Header.js',
            'sources/ext/Ext.js',
            'sources/ext/fx/FX.js',
            'sources/ext/fx/**/*.js',
            'tmp/ext_template.js',
            'sources/Footer.js'
          ],
          'lib_debug/js/vs_webcomponent.js': [
            'sources/customElement/**/*.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
};
