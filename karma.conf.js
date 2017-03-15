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
                        proxyquire: path.resolve(__dirname, './lib/browser/function.js'),
                        fs: path.resolve(__dirname, './lib/browser/fsFacade.js'),
                        canvas: path.resolve(__dirname, './lib/browser/canvasFacade.js'),
                        mkdirp: path.resolve(__dirname, './lib/browser/function.js'),
                        glob: path.resolve(__dirname, './lib/browser/function.js'),
                        gm: path.resolve(__dirname, './lib/browser/function.js'),
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