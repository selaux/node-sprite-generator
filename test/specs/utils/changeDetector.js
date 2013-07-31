/*global describe: false, buster: false, it: false, expect: false, beforeAll: false, afterAll: false */
/*jslint stupid: true */

'use strict';

var fs = require('fs'),

    changeDetector = require('../../../lib/utils/changeDetector');

buster.spec.expose();

describe('Utils/ChangeDetector', function () {
    var options = {
        src: [
            'test/fixtures/images/src/*.png'
        ],
        stylesheetPath: 'test/fixtures/stylesheet.styl',
        spritePath: 'test/fixtures/sprite.png'
    };

    beforeAll(function () {
        fs.writeFileSync(options.stylesheetPath, 'Foo');
        fs.writeFileSync(options.spritePath, 'Bar');
    });

    afterAll(function () {
        fs.unlinkSync(options.stylesheetPath);
        fs.unlinkSync(options.spritePath);
    });

    it('should always return true the first time detect is called', function (done) {
        var changes = changeDetector(options);

        changes.detect(function (err, changesDetected) {
            expect(err).toBe(null);
            expect(changesDetected).toBe(true);
            done();
        });
    });

    it('should return false if detect is called after register', function (done) {
        var changes = changeDetector(options);

        changes.register(function (err) {
            expect(err).toBe(null);

            changes.detect(function (err, changesDetected) {
                expect(err).toBe(null);
                expect(changesDetected).toBe(false);
                done();
            });
        });
    });

    it('should return true if any of the files have changed', function (done) {
        var changes = changeDetector(options),
            oldDate = new Date((new Date()).getTime() - 10000);

        changes.register(function (err) {
            expect(err).toBe(null);

            fs.utimesSync('test/fixtures/images/src/house.png', oldDate, oldDate);

            changes.detect(function (err, changesDetected) {
                expect(err).toBe(null);
                expect(changesDetected).toBe(true);
                done();
            });
        });
    });

    it('should return true if any of the files are deleted', function (done) {
        var changes = changeDetector(options);

        changes.register(function (err) {
            expect(err).toBe(null);

            fs.unlinkSync(options.stylesheetPath);

            changes.detect(function (err, changesDetected) {
                expect(err).toBe(null);
                expect(changesDetected).toBe(true);

                fs.writeFileSync(options.stylesheetPath, 'Bar');

                done();
            });
        });
    });
});