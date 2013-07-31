/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

'use strict';

var path = require('path'),
    buster = require('buster'),
    testUtils = require('../../utils/test.js'),
    _ = require('underscore'),
    css = require('../../../lib/stylesheet/css.js');

buster.spec.expose();

describe('Stylesheet/CSS', function () {
    var layout = {
            width: 150,
            height: 156,
            images: [
                { path: '/bla/foo.png', x: 0, y: 0, width: 150, height: 12 },
                { path: '/foo/bar.png', x: 0, y: 12, width: 150, height: 24 },
                { path: '/images/test.png', x: 0, y: 36, width: 150, height: 12 }
            ]
        };

    it('should generate the correct css without any options', function (done) {
        var expectedStylesheetPath = 'test/fixtures/stylesheets/css/no-options.css';
        testUtils.testStylesheetGeneration(css, layout, expectedStylesheetPath, {}, done);
    });

    it('should generate the correct css with a prefix specified', function (done) {
        var expectedStylesheetPath = 'test/fixtures/stylesheets/css/with-prefix.css';
        testUtils.testStylesheetGeneration(css, layout, expectedStylesheetPath, { prefix: 'sprite' }, done);
    });

    it('should generate the correct css with a spritePath specified', function (done) {
        var expectedStylesheetPath = 'test/fixtures/stylesheets/css/with-spritePath.css';
        testUtils.testStylesheetGeneration(css, layout, expectedStylesheetPath, { spritePath: '/this/is/my/spritepath.png' }, done);
    });

    it('should generate the correct css with a custom nameMapping specified', function (done) {
        var expectedStylesheetPath = 'test/fixtures/stylesheets/css/with-nameMapping.css',
            nameMapping = function (imagePath) {
                return path.basename(imagePath, path.extname(imagePath)).split("").reverse().join("");
            };
        testUtils.testStylesheetGeneration(css, layout, expectedStylesheetPath, { nameMapping: nameMapping }, done);
    });
});
