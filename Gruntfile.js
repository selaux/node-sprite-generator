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
                    ui: 'bdd',
                    require: 'test/blanket'
                },

                src: [
                    'test/specs/**/*.js'
                ]
            },
            htmlCoverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: ['test/**/*.js']
            },
            coveralls: {
                options: {
                    reporter: 'mocha-lcov-reporter',
                    quiet: true,
                    captureFile: 'coverage.lcov'
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.registerTask('default', [ 'jshint', 'mochaTest:unit', 'mochaTest:htmlCoverage' ]);
};