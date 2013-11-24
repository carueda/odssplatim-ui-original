
module.exports = function(grunt) {

 // load required Grunt tasks:
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),

    ngtemplates: {
      "odssPlatimApp.templates": {
        cwd: 'app',
        src: "views/**/*.html",
        dest: "bin/js/templates.js",
        options: {
            // bootstrap as a workaround to ngtemplates bug: add missing [] argument:
            bootstrap: function(module, script) {
                return "angular.module('" +module+ "', []).run(['$templateCache', " +
                    "function($templateCache) {" + script+ "}]);";
            }
        }
      }
    },

    copy: {
      vendor_bootstrap: {
        files: [
          {
            cwd: 'app/vendor/bootstrap/img',
            src: [ '**' ],
            dest: 'bin/img',
            expand: true
          }
        ]
      },
      vendor_font_awesome: {
        files: [
          {
            cwd: 'app/vendor/font-awesome/font',
            src: [ '**' ],
            dest: 'bin/font',
            expand: true
          }
        ]
      },
      vendor_underscore: {
        files: [
          {
            cwd: 'app/vendor/underscore',
            src: [ '*.map' ],
            dest: 'bin/js',
            expand: true
          }
        ]
      },

      common_links: {
        files: [
          {
            cwd: 'app/scripts/links/',
            src: [ 'img/**' ],
            dest: 'bin/css',
            expand: true
          }
        ]
      },

      platim_img: {
        files: [
          {
            cwd: 'app/',
            src: 'img/**',
            dest: 'bin/',
            expand: true
          }
        ]
      },

      platim_views: {  // in case of not using the templates file
        files: [
          {
            cwd: 'app/',
            src: 'views/**',
            dest: 'bin/',
            expand: true
          }
        ]
      }
    },

    concat: {
      vendor_js: {
        src: [
          'app/vendor/moment/moment.js',
          'app/vendor/underscore/underscore-min.js',
          'app/vendor/angular/angular.js',
          'app/vendor/angular-sanitize/angular-sanitize.js',
          'app/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
        ],
        dest: 'bin/js/odssplatim_vendor.js'
      },
      vendor_css: {
        src: [
          'app/vendor/bootstrap-css/css/bootstrap.min.css',
          'app/vendor/font-awesome/css/font-awesome.min.css'
        ],
        dest: 'bin/css/odssplatim_vendor.css'
      },

      js: {
        src: [
          'app/scripts/links/**/*.js',
          'app/scripts/**/*.js',
          '<%= ngtemplates["odssPlatimApp.templates"].dest %>',
          '!bin/js/odssplatim.js'
        ],
        dest: 'bin/js/odssplatim.js'
      },
      css: {
        src: [
          'app/scripts/links/timeline.css',
          'app/styles/**/*.css'
        ],
        dest: 'bin/css/odssplatim.css'
      }
    }
  };

  // project configuration:
  grunt.initConfig(taskConfig);

  grunt.registerTask('default', ['concat', 'copy']);

};
