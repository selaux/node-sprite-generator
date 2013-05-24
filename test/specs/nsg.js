/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

(function () {
    'use strict';

    var path = require('path'),
        fs = require('fs'),
        _ = require('underscore'),
        buster = require('buster'),
        nsg = require('../../lib/nsg');

    buster.spec.expose();

    describe('NSG', function () {
        var lenaImagePath = path.normalize(path.join(__dirname, '../fixtures/images/src/lena.jpg')),
            lockImagePath = path.normalize(path.join(__dirname, '../fixtures/images/src/lock.png')),
            houseImagePath = path.normalize(path.join(__dirname, '../fixtures/images/src/house.png')),
            imagePaths = [
                houseImagePath,
                lenaImagePath,
                lockImagePath
            ],
            stylesheetPath = path.normalize(path.join(__dirname, '../fixtures/stylesheet.styl')),
            expectedStylesheetPath = path.normalize(path.join(__dirname, '../fixtures/stylesheets/stylus/nsg-test.styl')),
            spritePath = path.normalize(path.join(__dirname, '../fixtures/sprite.png')),
            expectedSpritePath = path.normalize(path.join(__dirname, '../fixtures/images/expected/nsg.png'));

        function testSpriteGenerationWithOptions(options, done) {
            var defaults = {
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            };

            _.defaults(options, defaults);

            nsg(options, done(function (err) {
                expect(err).toBe(null);

                expect(fs.readFileSync(expectedStylesheetPath).toString()).toEqual(fs.readFileSync(stylesheetPath).toString());
                expect(fs.readFileSync(expectedSpritePath).toString()).toEqual(fs.readFileSync(spritePath).toString());

                fs.unlinkSync(stylesheetPath);
                fs.unlinkSync(spritePath);
            }));
        }


        it('should correctly write sprite image and stylesheets when using directly', function (done) {
            testSpriteGenerationWithOptions({}, done);
        });

        it('should correctly write sprite image and stylesheets using glob pattern matching', function (done) {
            testSpriteGenerationWithOptions({
                src: [ path.normalize(path.join(__dirname, '../fixtures/images/src/*')) ]
            }, done);
        });

        it('should correctly write sprite image and stylesheets using express.js middleware', function (done) {
            var middleware = nsg.middleware({
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            });

            middleware(undefined, undefined, done(function (err) {
                expect(err).toBe(null);

                expect(fs.readFileSync(expectedStylesheetPath).toString()).toEqual(fs.readFileSync(stylesheetPath).toString());
                expect(fs.readFileSync(expectedSpritePath).toString()).toEqual(fs.readFileSync(spritePath).toString());

                fs.unlinkSync(stylesheetPath);
                fs.unlinkSync(spritePath);
            }));
        });

    });

}());