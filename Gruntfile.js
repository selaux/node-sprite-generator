module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({

        jshint: {
            options: {
                node: true,
                nomen: true
            },
            lib: {
                files: {
                    src: [
                        '**/*.js',
                        '!node_modules/**/*.js',
                        '!test/**/*.js'
                    ]
                }
            },
            test: {
                files: {
                    src: ['test/**/*.js']
                },
                options: {
                    expr: true,
                    globals: {
                        describe: false,
                        it: false,
                        before: false,
                        after: false,
                        beforeEach: false,
                        afterEach: false
                    }
                }
            }
        },

        mochaTest: {
            unit: {
                options: {
                    reporter: 'spec',
                    ui: 'bdd'
                },

                src: [
                    'test/specs/**/*.js'
                ]
            }
        }
    });

    grunt.registerTask('default', [ 'jshint', 'mochaTest' ]);
};