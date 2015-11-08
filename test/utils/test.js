'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),
    fs = require('fs');

module.exports = {
    testStylesheetGeneration: function (generator, layout, expectedPath, options) {

        var expectedOptions = _.clone(options),
            spritePath = 'test/fixtures/images/png/sprite.png',
            stylesheetPath = 'test/fixtures/test.file';

        return generator(layout, stylesheetPath, spritePath, options).then(function () {
            expect(options).to.deep.equal(expectedOptions);
            expect(fs.readFileSync(stylesheetPath).toString()).to.equal(fs.readFileSync(expectedPath).toString());
            fs.unlinkSync(stylesheetPath);
        });

    }
};
