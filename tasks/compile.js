module.exports = function(grunt) {
  grunt.registerTask('compile', [
    'concat:template',
    'concat:debug',
    'uglify:release'
  ]);
};