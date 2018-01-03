
module.exports = function (grunt) {

  grunt.config.set("clean", {
    options: { force: true },
    less: ["lib_debug/css/*.less"]
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
};
