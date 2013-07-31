module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint');

    grunt.initConfig({

        jslint: {
            files: [
                '**/*.js',
                '!node_modules/**/*.js'
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