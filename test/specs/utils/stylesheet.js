'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),

    utils = require('../../../lib/utils/stylesheet');

describe('Utils/Stylesheet', function () {
    it('prefixString should return the prefixed string', function () {
        var str = 'bar',
            options = {
                prefix: 'foo'
            };

        expect(utils.prefixString(str, options)).to.equal('foo-bar');
    });

    describe('nameToClass', function () {
        var cases = [
            [ '/home/user/test/images/FooBar.jpg', 'FooBar' ],
            [ '/home/user/test/images/FooBar.png', 'FooBar' ],
            [ '/home/user/test/images/foo-bar.png', 'foo-bar' ]
        ];

        _.each(cases, function (c) {
            it('should return ' + c[1] + ' for ' + c[0], function () {
                expect(utils.nameToClass(c[0])).to.equal(c[1]);
            });
        });
    });

    it('getScaledLayoutForPixelRatio should return a version of the layout that is scaled by pixelRatio', function () {
        _([
            {
                layout: { width: 128, height: 64, images: [ { x: 0, y: 0, width: 128, height: 64 } ] },
                pixelRatio: 2,
                expected: { width: 64, height: 32, images: [ { x: 0, y:0, width: 64, height: 32 } ] }
            },
            {
                layout: { width: 75, height: 150, images: [ { x: 0, y: 0, width: 75, height: 75 }, { x: 0, y: 75, width: 75, height: 75 } ] },
                pixelRatio: 1.5,
                expected: { width: 50, height: 100, images: [ { x: 0, y:0, width: 50, height: 50 }, { x: 0, y: 50, width: 50, height: 50 } ] }
            }
        ]).each(function (testCase) {
            expect(utils.getScaledLayoutForPixelRatio(testCase.layout, testCase.pixelRatio)).to.deep.equal(testCase.expected);
        });
    });

    describe('getCSSValue', function () {
        [
            {  value: 0, expected: '0'},
            {  value: 10, expected: '10px'},
            {  value: 23, expected: '23px'},
            {  value: -10, expected: '-10px'},
            {  value: -122, expected: '-122px'}
        ].forEach(function (testCase) {
            it('should return ' + testCase.expected + ' for ' + testCase.value, function () {
                expect(utils.getCSSValue(testCase.value)).to.equal(testCase.expected);
            });
        });
    });

    describe('getRelativeSpriteDir', function () {
        var cases = [
            [ 'test/img/sprite.png', 'test/css/app.css', '../img/sprite.png' ],
            [ 'test/img/sprite.png', 'test/stylesheets/stylus/app.css', '../../img/sprite.png' ],
            [ 'test/sprite.png', 'test/app.css', './sprite.png' ],
            [ '/home/user/test/sprite.png', '/home/user/test/app.css', './sprite.png' ],
            [ '/home/user/test/sprite.png', '/home/user/test/css/app.css', '../sprite.png' ]
        ];

        _.each(cases, function (c) {
            it('should return ' + c[2] + ' for ' + c[0] + ' and ' + c[1], function () {
                expect(utils.getRelativeSpriteDir(c[0], c[1])).to.equal(c[2]);
            });
        });
    });
});