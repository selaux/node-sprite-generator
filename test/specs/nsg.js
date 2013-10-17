'use strict';

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    expect = require('chai').expect,
    async = require('async'),
    nsg = require('../../lib/nsg');

describe('NSG', function () {
    var imagePaths = [
            'test/fixtures/images/src/house.png',
            'test/fixtures/images/src/lena.jpg',
            'test/fixtures/images/src/lock.png'
        ],
        stylesheetPath = 'test/fixtures/stylesheet.styl',
        expectedStylesheetPath = 'test/fixtures/stylesheets/stylus/nsg-test.styl',
        spritePath = 'test/fixtures/sprite.png',
        expectedSpritePath = 'test/fixtures/images/expected/nsg.png';

    function testSpriteGenerationWithOptions(options, done) {
        var expectedOptions,
            defaults = {
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            };

        options = _.extend({}, defaults, options);
        expectedOptions = _.clone(options);

        nsg(options, function (err) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal(expectedOptions);

            expect(fs.readFileSync(expectedStylesheetPath).toString()).to.equal(fs.readFileSync(stylesheetPath).toString());
            expect(fs.readFileSync(expectedSpritePath).toString()).to.equal(fs.readFileSync(spritePath).toString());

            fs.unlinkSync(stylesheetPath);
            fs.unlinkSync(spritePath);

            done();
        });
    }

    before(function () {
        this.timeout = 500;
    });

    it('should correctly write sprite image and stylesheets when using directly', function (done) {
        testSpriteGenerationWithOptions({}, done);
    });

    it('should correctly write sprite image and stylesheets using glob pattern matching', function (done) {
        testSpriteGenerationWithOptions({
            src: [ 'test/fixtures/images/src/*' ]
        }, done);
    });

    it('should correctly write sprite image and stylesheets using express.js middleware', function (done) {
        var middleware = nsg.middleware({
            src: imagePaths,
            spritePath: spritePath,
            stylesheetPath: stylesheetPath
        });

        middleware(undefined, undefined, function (err) {
            expect(err).not.to.be.ok;

            expect(fs.readFileSync(expectedStylesheetPath).toString()).to.equal(fs.readFileSync(stylesheetPath).toString());
            expect(fs.readFileSync(expectedSpritePath).toString()).to.equal(fs.readFileSync(spritePath).toString());

            fs.unlinkSync(stylesheetPath);
            fs.unlinkSync(spritePath);

            done();
        });
    });

    it('should not write the sprite image twice if nothing has changed when using connect middleware', function (done) {
        var middleware = nsg.middleware({
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            }),
            middlewareWithTimeout = function (callback) {
                setTimeout(function () {
                    middleware(null, null, callback);
                }, 500);
            };

        // increase timeout
        this.timeout = 3000;

        // it should always be rendered the first time
        middleware(null, null, function () {
            var firstTime = fs.statSync(spritePath).ctime;

            middlewareWithTimeout(function () {
                var secondTime = fs.statSync(spritePath).ctime;

                // it should not have been changed because no files have been changed
                expect(firstTime.getTime()).to.equal(secondTime.getTime());

                // induce new sprite creation
                fs.unlinkSync(spritePath);

                middlewareWithTimeout(function () {
                    var thirdTime = fs.statSync(spritePath).ctime;

                    expect(thirdTime.getTime()).to.be.above(firstTime.getTime());

                    fs.unlinkSync(stylesheetPath);
                    fs.unlinkSync(spritePath);
                    done();
                });
            });
        });
    });

});
