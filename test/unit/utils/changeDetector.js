'use strict';

var proxyquire = require('proxyquire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    inNode = require('../../utils/platform').inNode;

inNode(describe, 'Utils/ChangeDetector', function () {
    var options = {
        src: [
            'test/fixtures/images/src/*.png'
        ],
        stylesheetPath: 'test/fixtures/stylesheet.styl',
        spritePath: 'test/fixtures/sprite.png'
    };

    it('should always return true the first time detect is called', function () {
        var stubs = { glob: sinon.stub.yieldsAsync(null, []) },
            createChangeDetector = proxyquire('../../../lib/utils/changeDetector', stubs),
            detector = createChangeDetector(options);

        return expect(detector.detect()).to.eventually.be.true;
    });

    it('should return false if nothing changed', function () {
        var stubs = {
                glob: sinon.stub().yieldsAsync(null, [ 'myfile', 'myfile2' ]),
                fs: { stat: sinon.stub() }
            },
            createChangeDetector = proxyquire('../../../lib/utils/changeDetector', stubs),
            detector = createChangeDetector(options);

        stubs.fs.stat.withArgs('myfile').yieldsAsync(null, { mtime: new Date(0) });
        stubs.fs.stat.withArgs('myfile2').yieldsAsync(null, { mtime: new Date(10) });

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.false;
    });

    it('should return true if any of the files have changed', function () {
        var stubs = {
                glob: sinon.stub().yieldsAsync(null, [ 'myfile', 'myfile2' ]),
                fs: { stat: sinon.stub() }
            },
            createChangeDetector = proxyquire('../../../lib/utils/changeDetector', stubs),
            detector = createChangeDetector(options);

        stubs.fs.stat.withArgs('myfile').onFirstCall().yieldsAsync(null, { mtime: new Date(0) });
        stubs.fs.stat.withArgs('myfile').onSecondCall().yieldsAsync(null, { mtime: new Date(10) });
        stubs.fs.stat.withArgs('myfile2').yieldsAsync(null, { mtime: new Date(10) });

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.true;
    });

    it('should return true if any of the files are deleted', function () {
        var stubs = {
                glob: sinon.stub().yieldsAsync(null, [ 'myfile', 'myfile2' ]),
                fs: { stat: sinon.stub() }
            },
            createChangeDetector = proxyquire('../../../lib/utils/changeDetector', stubs),
            detector = createChangeDetector(options),
            error = { code: 'ENOENT' };

        stubs.fs.stat.withArgs('myfile').yieldsAsync(null, { mtime: new Date(10) });
        stubs.fs.stat.withArgs('myfile2').onFirstCall().yieldsAsync(null, { mtime: new Date(0) });
        stubs.fs.stat.withArgs('myfile2').onSecondCall().yieldsAsync(error);

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.true;
    });
});
