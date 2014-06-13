'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),
    path = require('path'),
    fs = require('fs');

module.exports = {
    testStylesheetGeneration: function (generator, layout, expectedPath, options, done) {

        var expectedOptions = _.clone(options),
            spritePath = 'test/fixtures/images/png/sprite.png',
            stylesheetPath =  'test/fixtures/test.file';

        generator(layout, stylesheetPath, spritePath, options, function (err) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal(expectedOptions);
            expect(fs.readFileSync(expectedPath).toString()).to.equal(fs.readFileSync(stylesheetPath).toString());
            fs.unlinkSync(stylesheetPath);
            done();
        });

    }
};