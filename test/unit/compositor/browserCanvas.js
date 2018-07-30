'use strict';

var _ = require('underscore'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    createCanvasCompositor = require('../../../lib/compositor/browserCanvas');

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('Compositor/browserCanvas', function () {
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

    it('should read a buffer correctly', function () {
        var ImageStub = function ImageStub() {
                var self = this;

                setTimeout(function () {
                    self.width = 20;
                    self.height = 30;
                    self.onload();
                }, 25);
                self['__defineSetter__']('src', function (src) {
                    expect(src).to.equal('url');
                });
            },
            BlobStub = sinon.stub().returns('blob'),
            createObjectUrlStub = sinon.stub().withArgs('blob').returns('url'),
            windowStub = { Image: ImageStub, Blob: BlobStub, URL: { createObjectURL: createObjectUrlStub } },
            canvasCompositor = createCanvasCompositor(windowStub);

        return canvasCompositor.readImage({ path: 'test/path', data: 'my data' }).then(function (image) {
            expect(image).to.have.property('path', 'test/path');
            expect(image).to.have.property('width', 20);
            expect(image).to.have.property('height', 30);
            expect(image).to.have.property('data').that.is.an.instanceOf(ImageStub);
        });
    });

    it('should reject when reading correctly', function () {
        var ImageStub = function ImageStub() {
                var self = this;

                setTimeout(function () {
                    self.onerror(new Error('Test Error'));
                }, 25);
            },
            BlobStub = sinon.stub().returns('blob'),
            createObjectUrlStub = sinon.stub().withArgs('blob').returns('url'),
            windowStub = { Image: ImageStub, Blob: BlobStub, URL: { createObjectURL: createObjectUrlStub } },
            canvasCompositor = createCanvasCompositor(windowStub);

        return expect(canvasCompositor.readImage({
            path: 'test/path',
            data: 'my data'
        })).to.be.rejectedWith('Test Error');
    });

    it('should render the sprite correctly', function () {
        var layout = {
                width: 300,
                height: 214,
                images: [
                    _({ x: 0, y: 0 }).extend(imageData['test/fixtures/images/src/house.png']),
                    _({ x: 1, y: 15 }).extend(imageData['test/fixtures/images/src/lock.png']),
                    _({ x: 2, y: 183 }).extend(imageData['test/fixtures/images/src/lena.jpg'])
                ]
            },
            canvas2dContext = {
                drawImage: sinon.stub()
            },
            canvasInstance = {
                getContext: sinon.stub().withArgs('2d').returns(canvas2dContext),
                toBlob: sinon.stub().yieldsAsync('blob')
            },
            FileReaderStub = function () {
                this.readAsArrayBuffer = () => setTimeout(() => {
                    this.result = [ 1, 2, 3 ];
                    this.onloadend();
                }, 10);
            },
            documentStub = { createElement: sinon.stub().withArgs('canvas').returns(canvasInstance) },
            canvasCompositor = createCanvasCompositor({ document: documentStub, FileReader: FileReaderStub });

        return canvasCompositor.render(layout).then(function (result) {
            expect(canvasInstance.width).to.equal(300);
            expect(canvasInstance.height).to.equal(214);

            expect(canvas2dContext.drawImage).to.have.been.calledThrice;
            expect(canvas2dContext.drawImage.getCall(0).args).to.deep.equal([ 'house data', 0, 0, 15, 15 ]);
            expect(canvas2dContext.drawImage.getCall(1).args).to.deep.equal([ 'lock data', 1, 15, 26, 31 ]);
            expect(canvas2dContext.drawImage.getCall(2).args).to.deep.equal([ 'lena data', 2, 183, 300, 168 ]);

            expect(result).to.deep.equal(new Uint8Array([ 1, 2, 3 ]));
        });
    });
});
