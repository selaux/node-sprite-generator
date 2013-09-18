'use strict';

var expect = require('chai').expect,
    path = require('path'),
    fs = require('fs');

module.exports = {
    testStylesheetGeneration: function (generator, layout, expectedPath, options, done) {

        var spritePath = 'test/fixtures/images/png/sprite.png',
            stylesheetPath =  'test/fixtures/test.file';

        generator(layout, stylesheetPath, spritePath, options, function () {
            expect(fs.readFileSync(expectedPath).toString()).to.equal(fs.readFileSync(stylesheetPath).toString());
            fs.unlinkSync(stylesheetPath);
            done();
        });

    }
};