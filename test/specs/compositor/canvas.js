'use strict';

var _ = require('underscore'),
    Canvas = require('canvas'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('Compositor/canvas', function () {
    var imageData = {
            'test/fixtures/images/src/house.png': {
                data: 'house data',
                width: 15,
                height: 15
            },
            'test/fixtures/images/src/lena.jpg': {
                data: 'lena data',
                width: 300,
                height: 168
            },
            'test/fixtures/images/src/lock.png': {
                data: 'lock data',
                width: 26,
                height: 31
            }
        };

    it('should read the files correctly', function () {
        var fs = {
                readFile: sinon.stub(),
                writeFile: sinon.stub()
            },
            ImageStub = function () {
                /*jshint -W105 */
                var self = this;
                self['__defineSetter__']('src', function (src) {
                    var image = _.find(imageData, function (img) { return img.data === src; });
                    self.width = image.width;
                    self.height = image.height;
                });
            },
            nodeCanvas = {
                Image: ImageStub
            },
            canvasCompositor = proxyquire('../../../lib/compositor/canvas', {
                fs: fs,
                canvas: nodeCanvas
            });

        _.each(imageData, function (data, path) {
            fs.readFile.withArgs(path).yieldsAsync(null, data.data);
        });


        return canvasCompositor.readImages(_.keys(imageData)).then(function (images) {
            var houseImage = images[0],
                lenaImage = images[1],
                lockImage = images[2];

            expect(fs.readFile).to.have.been.calledThrice;

            expect(lenaImage.path).to.equal('test/fixtures/images/src/lena.jpg');
            expect(lenaImage.width).to.equal(300);
            expect(lenaImage.height).to.equal(168);
            expect(lenaImage.data).to.be.an.instanceof(ImageStub);

            expect(lockImage.path).to.equal('test/fixtures/images/src/lock.png');
            expect(lockImage.width).to.equal(26);
            expect(lockImage.height).to.equal(31);
            expect(lockImage.data).to.be.an.instanceof(ImageStub);

            expect(houseImage.path).to.equal('test/fixtures/images/src/house.png');
            expect(houseImage.width).to.equal(15);
            expect(houseImage.height).to.equal(15);
            expect(houseImage.data).to.be.an.instanceof(ImageStub);
        });
    });

    it('should correctly callback with errors when reading', function () {
        var fs = {
                readFile: sinon.stub(),
                writeFile: sinon.stub()
            },
            canvasCompositor = proxyquire('../../../lib/compositor/canvas', {
                fs: fs,
                canvas: {
                    Image: sinon.stub()
                }
            }),
            error = new Error('Test Error');

        fs.readFile.yieldsAsync(error);

        return expect(canvasCompositor.readImages(_.keys(imageData)))
            .to.be.rejectedWith('Test Error');
    });

    function testRender (options) {
        var optionsClone = _.clone(options),
            layout = {
                width: 300,
                height: 214,
                images: [
                    _({ x: 0, y: 0 }).extend(imageData['test/fixtures/images/src/house.png']),
                    _({ x: 1, y: 15 }).extend(imageData['test/fixtures/images/src/lock.png']),
                    _({ x: 2, y: 183 }).extend(imageData['test/fixtures/images/src/lena.jpg'])
                ]
            },
            fs = {
                readFile: sinon.stub(),
                writeFile: sinon.stub().yieldsAsync(null)
            },
            fileBuffer = 'some buffer',
            canvas2dContext = {
                drawImage: sinon.stub()
            },
            canvasInstance = {
                getContext: sinon.stub().returns(canvas2dContext),
                toBuffer: sinon.stub().yieldsAsync(null, fileBuffer),
                PNG_FILTER_NONE: 8,
                PNG_ALL_FILTERS: 256
            },
            canvasStub = sinon.stub().returns(canvasInstance),
            canvasCompositor = proxyquire('../../../lib/compositor/canvas', {
                fs: fs,
                canvas: canvasStub
            });

        return canvasCompositor.render(layout, 'some/path', options).then(function () {
            expect(options).to.deep.equal(optionsClone);

            expect(canvasStub).to.have.been.calledOnce;
            expect(canvasStub).to.have.been.calledWith(layout.width, layout.height);

            expect(canvas2dContext.drawImage).to.have.been.calledThrice;
            expect(canvas2dContext.drawImage.getCall(0).args).to.deep.equal([ 'house data', 0, 0, 15, 15 ]);
            expect(canvas2dContext.drawImage.getCall(1).args).to.deep.equal([ 'lock data', 1, 15, 26, 31 ]);
            expect(canvas2dContext.drawImage.getCall(2).args).to.deep.equal([ 'lena data', 2, 183, 300, 168 ]);

            expect(canvasInstance.toBuffer).to.have.been.calledOnce;

            expect(fs.writeFile).to.have.been.calledOnce;
            expect(fs.writeFile).to.have.been.calledWith('some/path', fileBuffer);

            return {
                Canvas: canvasStub,
                canvasInstance: canvasInstance,
                canvas2dContext: canvas2dContext,
                fs: fs
            };
        });
    }

    it('should render the sprite correctly', function () {
        return testRender({
            filter: 'all',
            compressionLevel: 9
        }).then(function (stubs) {
            expect(stubs.canvasInstance.toBuffer.getCall(0).args[1]).to.equal(9);
            expect(stubs.canvasInstance.toBuffer.getCall(0).args[2]).to.equal(256);
        });
    });

    it('should render the sprite correctly when specifying different parameters', function () {
        return testRender({
            filter: 'none',
            compressionLevel: 6
        }).then(function (stubs) {
            expect(stubs.canvasInstance.toBuffer.getCall(0).args[1]).to.equal(6);
            expect(stubs.canvasInstance.toBuffer.getCall(0).args[2]).to.equal(8);
        });
    });

    describe('filterToParam', function () {
        var canvasCompositor = require('../../../lib/compositor/canvas'),
            canvasInstance = new Canvas(0, 0);

        [
            { filter: 'none', expected: canvasInstance.PNG_FILTER_NONE },
            { filter: 'sub', expected: canvasInstance.PNG_FILTER_SUB },
            { filter: 'up', expected: canvasInstance.PNG_FILTER_UP },
            { filter: 'average', expected: canvasInstance.PNG_FILTER_AVG },
            { filter: 'paeth', expected: canvasInstance.PNG_FILTER_PAETH },
            { filter: 'all', expected: canvasInstance.PNG_ALL_FILTERS }
        ].forEach(function (testCase) {
            it('should return ' + testCase.expected + ' for ' + testCase.filter, function () {
                expect(canvasCompositor.filterToParam(testCase.filter, canvasInstance)).to.deep.equal(testCase.expected);
            });
        });
    });

});
