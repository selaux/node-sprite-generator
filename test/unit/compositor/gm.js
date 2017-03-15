'use strict';

var path = require('path'),
    _ = require('underscore'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai'),
    inNode = require('../../utils/platform').inNode,

    createGmCompositor = require('../../../lib/compositor/gm');

chai.use(sinonChai);

inNode(describe, 'Compositor/gm', function () {
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
        gmCompositor;

    beforeEach(function () {
        gmStub = sinon.stub();
        gmCompositor = createGmCompositor(gmStub);
    });

    it('should read a file correctly', function () {
        var imgStub = {
                size: sinon.stub().yieldsAsync(null, {
                    width: 10,
                    height: 50
                })
            };

        gmStub.withArgs('test data').returns(imgStub);

        return expect(gmCompositor.readImage({ path: 'test path', data: 'test data' }))
            .to.eventually.deep.equal({
                path: 'test path',
                width: 10,
                height: 50,
                data: 'test data'
            });
    });

    it('should callback with errors from gm', function () {
        var error = new Error('Test Error'),
            imgStub = {
                size: sinon.stub().yieldsAsync(error)
            };

        gmStub.withArgs('my data').returns(imgStub);

        return expect(gmCompositor.readImage({ path: 'path', data: 'my data' }))
            .to.be.rejectedWith('Test Error');
    });

    function testRender(options) {
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
        gmInstanceStub.toBuffer = sinon.stub().yieldsAsync(null, 'png file');

        return gmCompositor.render(layout, spritePath, options).then(function (result) {
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

            expect(gmInstanceStub.toBuffer).to.have.been.calledOnce;
            expect(gmInstanceStub.toBuffer).to.have.been.calledWith('PNG');

            expect(result).to.equal('png file');

            return {
                gmStub: gmStub,
                gmInstanceStub: gmInstanceStub
            };
        });
    }

    it('should write the sprites correctly', function() {
        return testRender({ filter: 'all', compressionLevel: 9 }).then(function (stubs) {
            expect(stubs.gmInstanceStub.quality).to.have.been.calledWith(99);
        });
    });

    it('should write the sprites correctly when specifying different parameters', function() {
        return testRender({ filter: 'none', compressionLevel: 6 }).then(function (stubs) {
            expect(stubs.gmInstanceStub.quality).to.have.been.calledWith(60);
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
