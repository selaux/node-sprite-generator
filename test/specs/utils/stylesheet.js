/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

'use strict';

var buster = require('buster'),
    _ = require('underscore'),

    utils = require('../../../lib/utils/stylesheet');

buster.spec.expose();

describe('Utils/Stylesheet', function () {
    it('prefixString should return the prefixed string', function () {
        var str = 'bar',
            options = {
                prefix: 'foo'
            };

        expect(utils.prefixString(str, options)).toBe('foo-bar');
    });

    describe('nameToClass', function () {
        var cases = [
            [ '/home/user/test/images/FooBar.jpg', 'FooBar' ],
            [ '/home/user/test/images/FooBar.png', 'FooBar' ],
            [ '/home/user/test/images/foo-bar.png', 'foo-bar' ]
        ];

        _.each(cases, function (c) {
            it('should return ' + c[1] + ' for ' + c[0], function () {
                expect(utils.nameToClass(c[0])).toBe(c[1]);
            });
        });
    });

    it('renderTemplateForImage should return the rendered test for a given template and image', function () {
        var image = {
                path: '/home/user/image/bar.png'
            },
            template = _.template('<%= className %>'),
            options = {
                nameMapping: utils.nameToClass,
                prefix: 'foo'
            };

        expect(utils.renderTemplateForImage(image, template, options)).toEqual('foo-bar');
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
                expect(utils.getRelativeSpriteDir(c[0], c[1])).toBe(c[2]);
            });
        });
    });
});