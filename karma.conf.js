'use strict';

var path = require('path');

module.exports = function(config) {
    var grep = config.grep,
        cfg = {
            frameworks: ['mocha'],
            preprocessors: {},
            webpack: {
                devtool: 'inline-source-map',
                module: {
                    loaders: [
                        {
                            test: /\/stylesheet\/.*\.js$/,
                            exclude: /(node_modules|bower_components)/,
                            loader: 'babel-loader',
                            query: {
                                plugins: ['static-fs']
                            }
                        },
                        {
                            test: /\/test\/functional\/browser\.js$/,
                            exclude: /(node_modules|bower_components)/,
                            loader: 'babel-loader',
                            query: {
                                plugins: ['static-fs']
                            }
                        },
                        {
                            test: /jimp\/browser\/lib\/jimp\.js$/,
                            loader: 'exports-loader',
                            options: {
                                Jimp: true
                            }
                        }
                    ]
                },
                resolve: {
                    alias: {
                        jimp: path.resolve(__dirname, './node_modules/jimp/browser/lib/jimp.js')
                    }
                }
            },
            plugins: [
                'karma-webpack',
                'karma-mocha',
                'karma-sourcemap-loader',
                'karma-firefox-launcher'
            ]
        };

    cfg.files = [grep];
    cfg.preprocessors[grep] = ['webpack', 'sourcemap'];

    config.set(cfg);
};