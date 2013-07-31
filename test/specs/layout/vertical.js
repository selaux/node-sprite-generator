/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

'use strict';

var buster = require('buster'),
    _ = require('underscore'),
    vertical = require('../../../lib/layout/vertical.js');

buster.spec.expose();

describe('Layout/Vertical', function () {
    var images = [
        { path: 'foo', width: 150, height: 12 },
        { path: 'bar', width: 32, height: 32 },
        { path: 'bla', width: 112, height: 112 }
    ];

    it('should generate the correct layout without any options', function (done) {
        vertical(images, done(function (err, layout) {
            expect(err).toBe(undefined);
            expect(layout).toEqual({
                width: 150,
                height: 156,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 0, y: 12 }).extend(images[1]),
                    _({ x: 0, y: 44 }).extend(images[2])
                ]
            });
        }));
    });

    it('should generate the correct layout when a padding is specified', function (done) {
        vertical(images, { padding: 50 }, done(function (err, layout) {
            expect(err).toBe(undefined);
            expect(layout).toEqual({
                width: 150,
                height: 256,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 0, y: 62 }).extend(images[1]),
                    _({ x: 0, y: 144 }).extend(images[2])
                ]
            });
        }));
    });
});