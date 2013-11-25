
module.exports = function(grunt) {

 // load required Grunt tasks:
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      vendor_bootstrap: {
        files: [
          {
            cwd: 'vendor/bootstrap/img',
            src: [ '**' ],
            dest: 'bin/img',
            expand: true
          }
        ]
      },
      vendor_font_awesome: {
        files: [
          {
            cwd: 'vendor/font-awesome/font',
            src: [ '**' ],
            dest: 'bin/font',
            expand: true
          }
        ]
      },
      vendor_underscore: {
        files: [
          {
            cwd: 'vendor/underscore',
            src: [ '*.map' ],
            dest: 'bin/js',
            expand: true
          }
        ]
      },

      common_links: {
        files: [
          {
            cwd: 'src/common/links/',
            src: [ 'img/**' ],
            dest: 'bin/css',
            expand: true
          }
        ]
      },

      platim_img: {
        files: [
          {
            cwd: 'src/img',
            src: '**',
            dest: 'bin/img',
            expand: true
          }
        ]
      },

      platim_views: {  // in case of not using the templates file
        files: [
          {
            cwd: 'src/app/',
            src: '**/*tpl.html',
            dest: 'bin',
            expand: true
          }
        ]
      }
    },

    concat: {
      vendor_js: {
        src: [
          'vendor/moment/moment.js',
          'vendor/underscore/underscore-min.js',
          'vendor/angular/angular.js',
          'vendor/angular-sanitize/angular-sanitize.js',
          'vendor/angular-bootstrap/ui-bootstrap-tpls.js'
        ],
        dest: 'bin/js/odssplatim_vendor.js'
      },
      vendor_css: {
        src: [
          'vendor/bootstrap-css/css/bootstrap.min.css',
          'vendor/font-awesome/css/font-awesome.min.css'
        ],
        dest: 'bin/css/odssplatim_vendor.css'
      },

      js: {
        src: [
          'src/common/**/*.js',
          'src/app/**/*.js',
          '!bin/js/odssplatim.js'
        ],
        dest: 'bin/js/odssplatim.js'
      },
      css: {
        src: [
          'src/common/links/timeline.css',
          'src/css/**/*.css'
        ],
        dest: 'bin/css/odssplatim.css'
      }
    }
  };

  // project configuration:
  grunt.initConfig(taskConfig);

  grunt.registerTask('default', ['concat', 'copy']);

};
