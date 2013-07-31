/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

'use strict';

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    buster = require('buster'),
    canvas = require('../../../lib/compositor/canvas');

buster.spec.expose();

describe('Compositor/Canvas', function () {
    var imagePaths = [
            'test/fixtures/images/src/house.png',
            'test/fixtures/images/src/lena.jpg',
            'test/fixtures/images/src/lock.png'
        ];

    it('should read the files correctly', function (done) {
        canvas.readImages(imagePaths, done(function (err, images) {
            var houseImage = images[0],
                lenaImage = images[1],
                lockImage = images[2];

            expect(lenaImage.width).toBe(300);
            expect(lenaImage.height).toBe(168);

            expect(lockImage.width).toBe(26);
            expect(lockImage.height).toBe(31);

            expect(houseImage.width).toBe(15);
            expect(houseImage.height).toBe(15);
        }));
    });

    it('should write the sprites correctly', function (done) {
        var spritePath = 'test/fixtures/images/test_out.png',
            expectedPath = 'test/fixtures/images/expected/nsg.png';

        canvas.readImages(imagePaths, function (err, images) {
            var layout = {
                width: 300,
                height: 214,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 0, y: 15 }).extend(images[1]),
                    _({ x: 0, y: 183 }).extend(images[2])
                ]
            };

            canvas.render(layout, spritePath, {}, done(function (err) {
                expect(err).toEqual(null);
                expect(fs.readFileSync(expectedPath).toString()).toEqual(fs.readFileSync(spritePath).toString());

                fs.unlinkSync(spritePath);
            }));
        });
    });
});