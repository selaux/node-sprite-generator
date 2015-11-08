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

    it('should always return true the first time detect is called', function () {
        var changes = changeDetector(options);

        return expect(changes.detect())
            .to.eventually.be.true;
    });

    it('should return false if detect is called after register', function () {
        var changes = changeDetector(options);

        return changes.register().then(function () {
            return expect(changes.detect())
                .to.eventually.be.false;
        });
    });

    it('should return true if any of the files have changed', function () {
        var changes = changeDetector(options),
            oldDate = new Date((new Date()).getTime() - 10000);

        return changes.register().then(function () {
            fs.utimesSync('test/fixtures/images/src/house.png', oldDate, oldDate);

            return expect(changes.detect())
                .to.eventually.be.true;
        });
    });

    it('should return true if any of the files are deleted', function () {
        var changes = changeDetector(options);

        return changes.register().then(function () {
            fs.unlinkSync(options.stylesheetPath);

            return expect(changes.detect())
                .to.eventually.be.true;
        });
    });
});
