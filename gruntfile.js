module.exports = function (grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {

      dist: {
        src: ['dist']
      }
    },

    uglify: {

      dist: {

        files: {

          'dist/js/app.min.js': [
            'src/js/config.js',
            'src/js/utils.js',
            'src/js/common.js',
            'src/js/tracking.js',
            'src/js/sharing.js',
            'src/js/dragging.js',
            'src/js/list.js',
            'src/js/lineup.js',
            'src/js/app.js'
          ]
        }
      }
    },

    sass: {

      dist: {

        files: {

          'dist/css/main.min.css' : 'src/scss/main.scss'
        }
      },

      dev: {

        files: {

          'src/css/main.css' : 'src/scss/main.scss'
        }
      }
    },

    postcss: {

      options: {

        processors: [

          require('autoprefixer-core')({

            browsers: ['> 5%', 'last 2 versions', 'IE 7', 'IE 9']
          })
        ],
        map: true
      },
      dist: {

        files: {

          'dist/css/main.min.css': 'dist/css/main.min.css'
        }
      },

      dev: {

        files: {

          'src/css/main.css' : 'src/css/main.css'
        }
      }
    },

    copy: {

      dist: {

        files: [

          { expand: true, flatten: true, src: ['src/index.html'], dest: 'dist/', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/favicon.ico'], dest: 'dist/', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/data/*'], dest: 'dist/data/', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/font/*'], dest: 'dist/font/', filter: 'isFile' },
          { expand: true, cwd: 'src/img/', src: ['**/*'], dest: 'dist/img/' },
          { expand: true,
            flatten: true,
            src: ['node_modules/interactjs/dist/interact.min.js'],
            dest: 'dist/js/lib/',
            filter: 'isFile'
          },
          { expand: true,
            flatten: true,
            src: ['node_modules/classlist-polyfill/src/index.js'],
            dest: 'dist/js/lib/', filter: 'isFile',
            rename: function (dest, src) {

              return dest + src.replace('index','classList.min');
            }
          }
        ]
      }
    },

    useminPrepare: {

      html: 'src/index.html'
    },

    usemin: {

      html: 'dist/index.html'
    },

    watch: {

      scripts: {

        options: {

          interrupt: true
        },
        files: ['src/scss/**/*.scss'],
        tasks: ['sass:dev', 'postcss:dev']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dist', ['clean', 'useminPrepare', 'uglify', 'sass:dist', 'postcss:dist', 'copy', 'usemin']);
};
