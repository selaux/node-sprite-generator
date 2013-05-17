/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

(function () {
    'use strict';

    var path = require('path'),
        buster = require('buster'),
        testUtils = require('../../utils/test.js'),
        _ = require('underscore'),
        stylus = require('../../../lib/stylesheet/stylus.js');

    buster.spec.expose();

    describe('Stylesheet/Stylus', function () {
        var spritePath = path.join(__dirname, '../../fixtures/stylesheets/stylus/images/png/sprite.png'),
            layout = {
                width: 150,
                height: 156,
                images: [
                    { path: '/bla/foo.png', x: 0, y: 0, width: 150, height: 12 },
                    { path: '/foo/bar.png', x: 0, y: 12, width: 150, height: 24 },
                    { path: '/images/test.png', x: 0, y: 36, width: 150, height: 12 }
                ]
            };

        it('should generate the correct stylus without any options', function (done) {
            var expectedStylesheetPath = path.join(__dirname, '../../fixtures/stylesheets/stylus/no-options.stylus');
            testUtils.testStylesheetGeneration(stylus, layout, expectedStylesheetPath, {}, done);
        });

        it('should generate the correct stylus with a prefix specified', function (done) {
            var expectedStylesheetPath = path.join(__dirname, '../../fixtures/stylesheets/stylus/with-prefix.stylus');
            testUtils.testStylesheetGeneration(stylus, layout, expectedStylesheetPath, { prefix: 'sprite' }, done);
        });

        it('should generate the correct stylus with a spritePath specified', function (done) {
            var expectedStylesheetPath = path.join(__dirname, '../../fixtures/stylesheets/stylus/with-spritePath.stylus');
            testUtils.testStylesheetGeneration(stylus, layout, expectedStylesheetPath, { spritePath: '/this/is/my/spritepath.png' }, done);
        });

        it('should generate the correct stylus with a custom nameMapping specified', function (done) {
            var expectedStylesheetPath = path.join(__dirname, '../../fixtures/stylesheets/stylus/with-nameMapping.stylus'),
                nameMapping = function (imagePath) {
                    return path.basename(imagePath, path.extname(imagePath)).split("").reverse().join("");
                };
            testUtils.testStylesheetGeneration(stylus, layout, expectedStylesheetPath, { nameMapping: nameMapping }, done);
        });
    });

}());