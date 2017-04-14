'use strict';

const R = require('ramda');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const createChangeDetector = require('../../../lib/utils/changeDetector');

chai.use(require('chai-as-promised'));

describe('Utils/ChangeDetector', function () {
    const defaultPath = 'test/fixtures/images/src/*.png';
    const options = {
        src: [
            defaultPath
        ]
    };

    function buildDefaultDependencies() {
        return {
            glob: sinon.stub().resolves(),
            stat: sinon.stub().rejects()
        };
    }

    it('should always return true the first time detect is called', function () {
        const dependencies = buildDefaultDependencies();
        const detector = createChangeDetector(dependencies, options);

        return expect(detector.detect()).to.eventually.be.true;
    });

    it('should return false if nothing changed', function () {
        const dependencies = buildDefaultDependencies();

        dependencies.glob.withArgs(defaultPath).resolves([ 'myfile', 'myfile2' ]);
        dependencies.stat.withArgs('myfile').resolves({ mtime: new Date(0) });
        dependencies.stat.withArgs('myfile2').resolves({ mtime: new Date(10) });

        const detector = createChangeDetector(dependencies, options);

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.false;
    });

    it('should return true if any of the files have changed', function () {
        const dependencies = buildDefaultDependencies();

        dependencies.glob.withArgs(defaultPath).resolves([ 'myfile', 'myfile2' ]);
        dependencies.stat.withArgs('myfile').resolves({ mtime: new Date(0) });
        dependencies.stat.withArgs('myfile2').onFirstCall().resolves({ mtime: new Date(10) });
        dependencies.stat.withArgs('myfile2').onSecondCall().resolves({ mtime: new Date(20) });

        const detector = createChangeDetector(dependencies, options);

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.true;
    });

    it('should return true if any of the files are deleted', function () {
        const dependencies = buildDefaultDependencies();

        dependencies.glob.withArgs(defaultPath).resolves([ 'myfile3', 'myfile4' ]);
        dependencies.stat.withArgs('myfile3').resolves({ mtime: new Date(0) });
        dependencies.stat.withArgs('myfile4').onFirstCall().resolves({ mtime: new Date(10) });
        dependencies.stat.withArgs('myfile4').onSecondCall().rejects({ code: 'ENOENT' });

        const detector = createChangeDetector(dependencies, options);

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.true;
    });

    it('should return detect when stylesheet is changed', function () {
        const stylesheetPath = 'stylesheet';
        const dependencies = buildDefaultDependencies();

        dependencies.glob.withArgs(stylesheetPath).resolves([ 'mystylesheetfile' ]);
        dependencies.glob.withArgs(defaultPath).resolves([ 'myOtherfile' ]);
        dependencies.stat.withArgs('myOtherfile').resolves({ mtime: new Date(0) });
        dependencies.stat.withArgs('mystylesheetfile').onFirstCall().resolves({ mtime: new Date(10) });
        dependencies.stat.withArgs('mystylesheetfile').onSecondCall().resolves({ mtime: new Date(100) });

        const detector = createChangeDetector(dependencies, R.merge(options, { stylesheetPath }));

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.true;
    });

    it('should return detect when stylesheet is changed', function () {
        const spritePath = 'sprite';
        const dependencies = buildDefaultDependencies();

        dependencies.glob.withArgs(spritePath).resolves([ 'myspritefile' ]);
        dependencies.glob.withArgs(defaultPath).resolves([ 'myOtherfile' ]);
        dependencies.stat.withArgs('myOtherfile').resolves({ mtime: new Date(0) });
        dependencies.stat.withArgs('myspritefile').onFirstCall().resolves({ mtime: new Date(10) });
        dependencies.stat.withArgs('myspritefile').onSecondCall().resolves({ mtime: new Date(100) });

        const detector = createChangeDetector(dependencies, R.merge(options, { spritePath }));

        return expect(detector.register().then(function() {
            return detector.detect();
        })).to.eventually.be.true;
    });
});
