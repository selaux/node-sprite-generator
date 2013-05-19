/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

(function () {
    'use strict';

    var path = require('path'),
        fs = require('fs'),
        _ = require('underscore'),
        buster = require('buster'),
        canvas = require('../../../lib/compositor/canvas');

    buster.spec.expose();

    describe('Compositor/Canvas', function () {
        var lenaImagePath = path.normalize(path.join(__dirname, '../../fixtures/images/lena.jpg')),
            lockImagePath = path.normalize(path.join(__dirname, '../../fixtures/images/lock.png')),
            houseImagePath = path.normalize(path.join(__dirname, '../../fixtures/images/house.png')),
            imagePaths = [
                lenaImagePath,
                lockImagePath,
                houseImagePath
            ];

        it('should read the files correctly', function (done) {
            canvas.readImages(imagePaths, done(function (err, images) {
                var lenaImage = images[0],
                    lockImage = images[1],
                    houseImage = images[2];

                expect(lenaImage.width).toBe(300);
                expect(lenaImage.height).toBe(168);

                expect(lockImage.width).toBe(26);
                expect(lockImage.height).toBe(31);

                expect(houseImage.width).toBe(15);
                expect(houseImage.height).toBe(15);
            }));
        });

        it('should write the sprites correctly', function (done) {
            var spritePath = path.join(__dirname, '../../fixtures/images/test_out.png'),
                expectedPath = path.join(__dirname, '../../fixtures/images/expected.png');

            canvas.readImages(imagePaths, function (err, images) {
                var layout = {
                    width: 300,
                    height: 214,
                    images: [
                        _({ x: 0, y: 0 }).extend(images[0]),
                        _({ x: 0, y: 168 }).extend(images[1]),
                        _({ x: 0, y: 199 }).extend(images[2])
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

}());