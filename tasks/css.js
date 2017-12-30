module.exports = function (grunt) {
  grunt.registerTask('css', [
    'concat:less',
    'less:debug',
    'less:release',
    // 'clean'
  ]);
};