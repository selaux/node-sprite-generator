'use strict';

var path = require('path'),
    _ = require('underscore'),
    sandboxedModule = require('sandboxed-module'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Compositor/gm', function () {
    var imageData = [
            {
                path: 'test/fixtures/images/src/house.png',
                data: 'house data',
                width: 15,
                height: 15
            },
            {
                path: 'test/fixtures/images/src/lena.jpg',
                data: 'lena data',
                width: 300,
                height: 168
            },
            {
                path: 'test/fixtures/images/src/lock.png',
                data: 'lock data',
                width: 26,
                height: 31
            }
        ],
        gmStub,
        fsStub = { readFile: sinon.stub() },
        gmCompositor;

    beforeEach(function () {
        gmStub = sinon.stub();
        gmCompositor = sandboxedModule.require('../../../lib/compositor/gm', {
            requires: {
                gm: gmStub,
                fs: fsStub
            }
        });
    });

    it('should read the files correctly', function (done) {
        _.each(imageData, function (image) {
            var imgStub = {
                size: sinon.stub().yieldsAsync(null, {
                    width: image.width,
                    height: image.height
                })
            };

            imgStub.size.returns(imgStub);

            fsStub.readFile.withArgs(image.path).yieldsAsync(null, image.data);
            gmStub.withArgs(image.data).returns(imgStub);
        });

        gmCompositor.readImages(_.pluck(imageData, 'path'), function (err, images) {
            expect(err).to.equal(null);
            expect(images).to.deep.equal(imageData);
            done();
        });
    });

    function testRender(options, callback) {
        var optionsClone = _.clone(options),
            spritePath = 'test/fixtures/images/expected/nsg.png',
            gmInstanceStub = {},
            layout = {
                width: 300,
                height: 214,
                images: [
                    _({ x: 0, y: 0 }).extend(imageData[0]),
                    _({ x: 0, y: 15 }).extend(imageData[1]),
                    _({ x: 0, y: 183 }).extend(imageData[2])
                ]
            };

        gmStub.returns(gmInstanceStub);
        gmInstanceStub.in = sinon.stub().returns(gmInstanceStub);
        gmInstanceStub.mosaic = sinon.stub().returns(gmInstanceStub);
        gmInstanceStub.quality = sinon.stub().returns(gmInstanceStub);
        gmInstanceStub.write = sinon.stub().yieldsAsync(null);

        gmCompositor.render(layout, spritePath, options, function (err) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal(optionsClone);

            expect(gmStub).to.have.been.calledOnce;
            expect(gmStub).to.have.been.calledWith(300, 214, '#FFFFFFFF');

            expect(gmInstanceStub.in.callCount).to.equal(9);
            expect(gmInstanceStub.in).to.have.been.calledWith('-geometry', '15x15');
            expect(gmInstanceStub.in).to.have.been.calledWith('-page', '+0+0');
            expect(gmInstanceStub.in).to.have.been.calledWith(path.resolve(imageData[0].path));
            expect(gmInstanceStub.in).to.have.been.calledWith('-geometry', '300x168');
            expect(gmInstanceStub.in).to.have.been.calledWith('-page', '+0+15');
            expect(gmInstanceStub.in).to.have.been.calledWith(path.resolve(imageData[1].path));
            expect(gmInstanceStub.in).to.have.been.calledWith('-geometry', '26x31');
            expect(gmInstanceStub.in).to.have.been.calledWith('-page', '+0+183');
            expect(gmInstanceStub.in).to.have.been.calledWith(path.resolve(imageData[2].path));

            expect(gmInstanceStub.mosaic).to.have.been.calledOnce;

            expect(gmInstanceStub.quality).to.have.been.calledOnce;

            expect(gmInstanceStub.write).to.have.been.calledOnce;
            expect(gmInstanceStub.write).to.have.been.calledWith(path.resolve(spritePath));

            callback({
                gmStub: gmStub,
                gmInstanceStub: gmInstanceStub
            });
        });
    }

    it('should write the sprites correctly', function (done) {
        testRender({}, function (stubs) {
            expect(stubs.gmInstanceStub.quality).to.have.been.calledWith(69);
            done();
        });
    });

    it('should write the sprites correctly when specifying a different compression level', function(done) {
        testRender({ compressionLevel: 9 }, function (stubs) {
            expect(stubs.gmInstanceStub.quality).to.have.been.calledWith(99);
            done();
        });
    });

    it('should write the sprites correctly when specifying a different filter', function(done) {
        testRender({ filter: 'none' }, function (stubs) {
            expect(stubs.gmInstanceStub.quality).to.have.been.calledWith(60);
            done();
        });
    });

    describe('filterToQualtiy', function () {
        [
            { filter: 'none', expected: 0 },
            { filter: 'sub', expected: 1 },
            { filter: 'up', expected: 2 },
            { filter: 'average', expected: 3 },
            { filter: 'paeth', expected: 4 },
            { filter: 'all', expected: 9 }
        ].forEach(function (testCase) {
            it('should return ' + testCase.expected + ' for ' + testCase.filter, function () {
                expect(gmCompositor.filterToQuality(testCase.filter)).to.equal(testCase.expected);
            });
        });
    });

});