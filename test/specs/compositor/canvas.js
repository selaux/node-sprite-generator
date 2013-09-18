'use strict';

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    expect = require('chai').expect,
    canvas = require('../../../lib/compositor/canvas');

describe('Compositor/Canvas', function () {
    var imagePaths = [
            'test/fixtures/images/src/house.png',
            'test/fixtures/images/src/lena.jpg',
            'test/fixtures/images/src/lock.png'
        ],
        spritePath = 'test/fixtures/images/test_out.png';

    it('should read the files correctly', function (done) {
        canvas.readImages(imagePaths, function (err, images) {
            var houseImage = images[0],
                lenaImage = images[1],
                lockImage = images[2];

            expect(err).to.equal(null);

            expect(lenaImage.width).to.equal(300);
            expect(lenaImage.height).to.equal(168);

            expect(lockImage.width).to.equal(26);
            expect(lockImage.height).to.equal(31);

            expect(houseImage.width).to.equal(15);
            expect(houseImage.height).to.equal(15);

            done();
        });
    });

    it('should write the sprites correctly', function (done) {
        var expectedPath = 'test/fixtures/images/expected/nsg.png';

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

            expect(err).not.to.be.ok;

            canvas.render(layout, spritePath, {}, function (err) {
                expect(err).not.to.be.ok;
                expect(fs.readFileSync(expectedPath).toString()).to.equal(fs.readFileSync(spritePath).toString());

                fs.unlinkSync(spritePath);

                done();
            });
        });
    });

    it('should write the sprites correctly when specifying a different compression level', function(done) {
        var expectedPath = 'test/fixtures/images/expected/nsg_compression_level_9.png';

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

            expect(err).not.to.be.ok;

            canvas.render(layout, spritePath, { compressionLevel: 9 }, function (err) {
                expect(err).not.to.be.ok;
                expect(fs.readFileSync(expectedPath).toString()).to.equal(fs.readFileSync(spritePath).toString());

                fs.unlinkSync(spritePath);

                done();
            });
        });
    });

});