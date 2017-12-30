const includeAll = require('include-all');

module.exports = function (grunt) {

  const themes = includeAll({
    dirname: require('path').resolve(__dirname, '../sources/themes/'),
    filter: /files\.json$/,
    excludeDirs: /^(ui|ext|av)$/
  }) || {};

  const lessDebugConfig = {};
  const lessReleaseConfig = {};
  for (const device in themes) {
    const config = themes[device]['undefined'];
    if (config.concat) {
      for (const fileName in config.concat) {
        const cssFileName = fileName.replace('.less', '.css');
        const fullLessPath = `lib_debug/css/${fileName}`;
        lessDebugConfig[`lib_debug/css/${cssFileName}`] = `lib_debug/css/${fileName}`;
        lessReleaseConfig[`lib/css/${cssFileName}`] = `lib_debug/css/${fileName}`;
      }
    }
  }

  const cleanCssOptions = {
    level: {
      2: {
        all: false, // sets all values to `false`
        removeDuplicateRules: true, // turns on removing duplicate rules
        removeEmpty: true
      }
    }
  }

  grunt.config.set("less", {
    debug: {
      options: {
        paths: ['lib_debug/css/']
      },
      files: lessDebugConfig
    },
    release: {
      options: {
        paths: ['lib_debug/css/'],
        plugins: [
          new (require('less-plugin-autoprefix'))({ browsers: ["last 2 versions"] }),
          new (require('less-plugin-clean-css'))(cleanCssOptions)
        ]
      },
      files: lessReleaseConfig
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
};


