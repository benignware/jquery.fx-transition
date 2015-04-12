module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), 
    clean: {
      tmp: ["tmp"], 
      dist: ["dist"]
    }, 
    concat: {
      options: {
        stripBanners: false,
        banner: '/*!\n' + 
          ' * <%= pkg.name %> - v<%= pkg.version %> - \n' + 
          ' * build: <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
          ' */\n\n',
      },
      dist: {
        src: [
          'src/<%= pkg.name %>.js'
        ],
        dest: 'tmp/<%= pkg.name %>.js',
      },
    }, 
    // Lint definitions
    jshint: {
      all: ["src/**.js"],
      options: {
        jshintrc: ".jshintrc"
      }
    },
    uglify: {
      options: {
        stripBanners: false
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': [ 'dist/<%= pkg.name %>.js']
        }
      }
    }, 
    copy: {
      build: {
        expand: true,
        cwd: 'tmp',
        src: ['<%= pkg.name %>.js', '<%= pkg.name %>.js'], 
        dest: 'dist',
        flatten: true,
        filter: 'isFile'
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'copy', 'uglify', ]);
  
};