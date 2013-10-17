'use strict';

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    gm = require('gm'),
    expect = require('chai').expect;

module.exports = function testCompositor(name, module) {
    describe('Compositor/' + name, function () {
        var imagePaths = [
                'test/fixtures/images/src/house.png',
                'test/fixtures/images/src/lena.jpg',
                'test/fixtures/images/src/lock.png'
            ],
            spritePath = 'test/fixtures/images/test_out.png';

        it('should read the files correctly', function (done) {
            module.readImages(imagePaths, function (err, images) {
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
            var options = {},
                expectedPath = 'test/fixtures/images/expected/nsg.png';

            module.readImages(imagePaths, function (err, images) {
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

                module.render(layout, spritePath, options, function (err) {
                    expect(err).not.to.be.ok;
                    expect(options).to.deep.equal({});
                    gm.compare(expectedPath, spritePath, function (err, isEqual, equality, raw) {
                        expect(err).not.to.be.ok;
                        expect(isEqual).to.be.ok;

                        fs.unlinkSync(spritePath);

                        done();
                    });
                });
            });
        });

        it('should write the sprites correctly when specifying a different compression level', function(done) {
            var options = { compressionLevel: 9 },
                expectedPath = 'test/fixtures/images/expected/nsg_compression_level_9.png';

            module.readImages(imagePaths, function (err, images) {
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

                module.render(layout, spritePath, options, function (err) {
                    expect(err).not.to.be.ok;
                    expect(options).to.deep.equal({ compressionLevel: 9 });
                    gm.compare(expectedPath, spritePath, function (err, isEqual, equality, raw) {
                        expect(err).not.to.be.ok;
                        expect(isEqual).to.be.ok;

                        fs.unlinkSync(spritePath);

                        done();
                    });
                });
            });
        });

    });
};