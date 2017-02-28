'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),
    fs = require('fs');

module.exports = {
    testStylesheetGeneration: function (generator, layout, expectedPath, options) {
        var expectedOptions = _.clone(options);

        return generator(layout, options).then(function (stylesheet) {
            expect(options).to.deep.equal(expectedOptions);
            expect(stylesheet).to.equal(fs.readFileSync(expectedPath).toString());
        });

    }
};
