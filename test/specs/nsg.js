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
        var lenaImagePath = path.normalize(path.join(__dirname, '../fixtures/images/lena.jpg')),
            lockImagePath = path.normalize(path.join(__dirname, '../fixtures/images/lock.png')),
            houseImagePath = path.normalize(path.join(__dirname, '../fixtures/images/house.png')),
            imagePaths = [
                lenaImagePath,
                lockImagePath,
                houseImagePath
            ],
            stylesheetPath = path.normalize(path.join(__dirname, '../fixtures/stylesheet.styl')),
            expectedStylesheetPath = path.normalize(path.join(__dirname, '../fixtures/stylesheets/stylus/nsg-test.styl')),
            spritePath = path.normalize(path.join(__dirname, '../fixtures/sprite.png')),
            expectedSpritePath = path.normalize(path.join(__dirname, '../fixtures/images/expected.png'));


        it('should correctly write sprite image and stylesheets when using directly', function (done) {
            nsg({
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            }, done(function (err) {
                expect(err).toBe(null);

                expect(fs.readFileSync(expectedStylesheetPath).toString()).toEqual(fs.readFileSync(stylesheetPath).toString());
                expect(fs.readFileSync(expectedSpritePath).toString()).toEqual(fs.readFileSync(spritePath).toString());

                fs.unlinkSync(stylesheetPath);
                fs.unlinkSync(spritePath);
            }));
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