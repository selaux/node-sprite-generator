'use strict';

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    sandboxedModule = require('sandboxed-module'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

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

    it('should read the files correctly', function (done) {
        var fs = {
                readFile: sinon.stub()
            },
            ImageStub = function () {
                /*jshint -W105 */
                var self = this;
                self.__defineSetter__("src", function (src) {
                    var image = _.find(imageData, function (img) { return img.data === src; });
                    self.width = image.width;
                    self.height = image.height;
                });
            },
            nodeCanvas = {
                Image: ImageStub
            },
            canvasCompositor = sandboxedModule.require('../../../lib/compositor/canvas', {
                requires: {
                    fs: fs,
                    canvas: nodeCanvas
                }
            });

        _.each(imageData, function (data, path) {
            fs.readFile.withArgs(path).yieldsAsync(null, data.data);
        });


        canvasCompositor.readImages(_.keys(imageData), function (err, images) {
            var houseImage = images[0],
                lenaImage = images[1],
                lockImage = images[2];

            expect(err).to.equal(null);

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

            done();
        });
    });

    function testRender (options, callback) {
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
                writeFile: sinon.stub().yieldsAsync(null)
            },
            fileBuffer = 'some buffer',
            canvas2dContext = {
                drawImage: sinon.stub()
            },
            canvasInstance = {
                getContext: sinon.stub().returns(canvas2dContext),
                toBuffer: sinon.stub().yieldsAsync(null, fileBuffer)
            },
            Canvas = sinon.stub().returns(canvasInstance),
            canvasCompositor = sandboxedModule.require('../../../lib/compositor/canvas', {
                requires: {
                    fs: fs,
                    canvas: Canvas
                }
            });

        canvasCompositor.render(layout, 'some/path', options, function (err) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal(optionsClone);

            expect(Canvas).to.have.been.calledOnce;
            expect(Canvas).to.have.been.calledWith(layout.width, layout.height);

            expect(canvas2dContext.drawImage).to.have.been.calledThrice;
            expect(canvas2dContext.drawImage.getCall(0).args).to.deep.equal([ 'house data', 0, 0, 15, 15 ]);
            expect(canvas2dContext.drawImage.getCall(1).args).to.deep.equal([ 'lock data', 1, 15, 26, 31 ]);
            expect(canvas2dContext.drawImage.getCall(2).args).to.deep.equal([ 'lena data', 2, 183, 300, 168 ]);

            expect(canvasInstance.toBuffer).to.have.been.calledOnce;

            expect(fs.writeFile).to.have.been.calledOnce;
            expect(fs.writeFile).to.have.been.calledWith('some/path', fileBuffer);

            callback({
                Canvas: Canvas,
                canvasInstance: canvasInstance,
                canvas2dContext: canvas2dContext,
                fs: fs
            });
        });
    }

    it('should render the sprite correctly', function (done) {
        testRender({}, function (stubs) {
            expect(stubs.canvasInstance.toBuffer.getCall(0).args[1]).to.equal(6);
            done();
        });
    });

    it('should render the sprite correctly with a different compression level', function (done) {
        testRender({
            compressionLevel: 9
        }, function (stubs) {
            expect(stubs.canvasInstance.toBuffer.getCall(0).args[1]).to.equal(9);
            done();
        });
    });

});