'use strict';

var fs = require('fs'),
    expect = require('chai').expect,
    changeDetector = require('../../../lib/utils/changeDetector');

describe('Utils/ChangeDetector', function () {
    var options = {
        src: [
            'test/fixtures/images/src/*.png'
        ],
        stylesheetPath: 'test/fixtures/stylesheet.styl',
        spritePath: 'test/fixtures/sprite.png'
    };

    beforeEach(function () {
        fs.writeFileSync(options.stylesheetPath, 'Foo');
        fs.writeFileSync(options.spritePath, 'Bar');
    });

    afterEach(function () {
        try {
            fs.unlinkSync(options.spritePath);
            fs.unlinkSync(options.stylesheetPath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
    });

    it('should always return true the first time detect is called', function (done) {
        var changes = changeDetector(options);

        changes.detect(function (err, changesDetected) {
            expect(err).not.to.be.ok;
            expect(changesDetected).to.be.true;
            done();
        });
    });

    it('should return false if detect is called after register', function (done) {
        var changes = changeDetector(options);

        changes.register(function (err) {
            expect(err).not.to.be.ok;

            changes.detect(function (err, changesDetected) {
                expect(err).not.to.be.ok;
                expect(changesDetected).to.be.false;
                done();
            });
        });
    });

    it('should return true if any of the files have changed', function (done) {
        var changes = changeDetector(options),
            oldDate = new Date((new Date()).getTime() - 10000);

        changes.register(function (err) {
            expect(err).not.to.be.ok;

            fs.utimesSync('test/fixtures/images/src/house.png', oldDate, oldDate);

            changes.detect(function (err, changesDetected) {
                expect(err).not.to.be.ok;
                expect(changesDetected).to.be.true;
                done();
            });
        });
    });

    it('should return true if any of the files are deleted', function (done) {
        var changes = changeDetector(options);

        changes.register(function (err) {
            expect(err).not.to.be.ok;

            fs.unlinkSync(options.stylesheetPath);

            changes.detect(function (err, changesDetected) {
                expect(err).not.to.be.ok;
                expect(changesDetected).to.be.true;

                done();
            });
        });
    });
});