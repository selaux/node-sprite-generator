module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint');

    grunt.initConfig({

        jslint: {
            files: [
                'Gruntfile.js',
                'lib/**/*.js',
                'test/**/*.js'
            ],
            directives: {
                node: true,
                nomen: true
            },
            options: {
                errorsOnly: false
            }
        }
    });
};