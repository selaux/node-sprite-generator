/*global describe: false, it: false, expect: false*/
/*jslint stupid: true */

'use strict';

var path = require('path'),
    fs = require('fs');

module.exports = {
    testStylesheetGeneration: function (generator, layout, expectedPath, options, done) {

        var spritePath = 'test/fixtures/images/png/sprite.png',
            stylesheetPath =  'test/fixtures/test.file';

        generator(layout, stylesheetPath, spritePath, options, done(function () {
            expect(fs.readFileSync(expectedPath).toString()).toEqual(fs.readFileSync(stylesheetPath).toString());
            fs.unlinkSync(stylesheetPath);
        }));

    }
};