'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    R = require('ramda'),
    resemble = require('resemblejs'),
    chai = require('chai'),
    expect = chai.expect,
    base64 = require('base64-arraybuffer'),
    nsg = require('../../lib/indexBrowser');

chai.use(require('chai-as-promised'));

function toArrayBuffer(array) {
    var uintArray = new Uint8Array(array);
    return uintArray.buffer;
}

function toDataUrl(arrayBuffer) {
    return 'data:image/png;base64,' + base64.encode(arrayBuffer);
}

describe('browser functional tests', function () {
    var images = [
            { path: 'house.png', data: toArrayBuffer(fs.readFileSync(path.join(__dirname, '../fixtures/images/src/house.png'))) },
            { path: 'lena.jpg', data: toArrayBuffer(fs.readFileSync(path.join(__dirname, '../fixtures/images/src/lena.jpg'))) },
            { path: 'lock.png', data: toArrayBuffer(fs.readFileSync(path.join(__dirname, '../fixtures/images/src/lock.png'))) }
        ],
        expectedStylesheet = fs.readFileSync(path.join(__dirname, '../fixtures/stylesheets/stylus/nsg-test.styl')).toString(),
        expectedSprite = toArrayBuffer(fs.readFileSync(path.join(__dirname, '../fixtures/images/expected/nsg.png'))),
        defaults = {
            compositor: 'jimp',
            src: images,
            stylesheetOptions: {
                spritePath: './sprite.png'
            }
        };

    it('should render correctly using the jimp compositor', function () {
        return nsg(R.merge(defaults, { compositor: 'jimp' })).then(function (results) {
            var stylesheet = results[0],
                expectedSpritePngUrl = toDataUrl(expectedSprite),
                spritePngUrl = toDataUrl(results[1].buffer);

            expect(stylesheet).to.deep.equal(expectedStylesheet);
            return Promise.fromCallback(function (callback) {
                resemble(spritePngUrl).compareTo(expectedSpritePngUrl).onComplete(function(result) {
                    expect(result).to.have.property('isSameDimensions', true);
                    expect(result).to.have.property('rawMisMatchPercentage').that.is.lessThan(0.5);
                    callback();
                });
            });
        });
    });

    it('should render correctly using the canvas compositor', function () {
        return nsg(R.merge(defaults, { compositor: 'canvas' })).then(function (results) {
            var stylesheet = results[0],
                expectedSpritePngUrl = toDataUrl(expectedSprite),
                spritePngUrl = toDataUrl(results[1].buffer);

            expect(stylesheet).to.deep.equal(expectedStylesheet);
            return Promise.fromCallback(function (callback) {
                resemble(spritePngUrl).compareTo(expectedSpritePngUrl).onComplete(function(result) {
                    expect(result).to.have.property('isSameDimensions', true);
                    expect(result).to.have.property('rawMisMatchPercentage').that.is.lessThan(0.5);
                    callback();
                });
            });
        });
    });

    it('should render correctly when passing a template string', function () {
        return nsg(R.merge(defaults, { stylesheet: 'width: <%= layout.width %>' })).then(function (results) {
            var stylesheet = results[0];
            expect(stylesheet).to.deep.equal('width: 300');
        });
    });

    it('should throw on passing strings as source', function () {
        return expect(nsg(R.merge(defaults, { src: [ 'somewhere' ] })))
            .to.be.rejectedWith('Referencing files by path is not supported in the browser');
    });

    it('should throw on passing spritePath', function () {
        return expect(nsg(R.merge(defaults, { spritePath: 'somewhere' })))
            .to.be.rejectedWith('Creating directories is not supported in the browser');
    });

    it('should throw on passing stylesheetPath', function () {
        return expect(nsg(R.merge(defaults, { stylesheetPath: 'somewhere' })))
            .to.be.rejectedWith('Creating directories is not supported in the browser');
    });
});