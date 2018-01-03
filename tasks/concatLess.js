
const includeAll = require('include-all')

module.exports = function (grunt) {

  const themes = includeAll({
    dirname: require('path').resolve(__dirname, '../sources/themes/'),
    filter: /files\.json$/,
    excludeDirs: /^(ui|ext|av)$/
  }) || {};

  const concatConfig = {};
  for (const device in themes) {
    const config = themes[device]['undefined'];
    if (config.concat) {
      for (const fileName in config.concat) {
        concatConfig[`lib_debug/css/${fileName}`] =
          config.concat[fileName].map(lessFileName => `sources/themes/${device}/${lessFileName}`)
      }
    }
  }

  grunt.config.merge({
    concat: {
      less: {
        files: concatConfig
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
};
