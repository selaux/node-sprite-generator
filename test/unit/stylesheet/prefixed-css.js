'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    nameToClass = require('../../../lib/utils/stylesheet').nameToClass,
    stylesheetGenerator = require('../../../lib/stylesheet/prefixed-css'),
    expectedWithCommonWidth = fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/prefixed-css/with-common-wh.css')),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/prefixed-css/with-prefix.css')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/prefixed-css/with-nameMapping.css')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/prefixed-css/with-pixelRatio.css'))
    };

testTemplatedStylesheet('prefixed-css', expected, function () {
    var layoutCommon = {
        width: 150,
        height: 156,
        images: [
            { path: '/bla/foo.png', x: 0, y: 0, width: 150, height: 12 },
            { path: '/foo/bar.png', x: 0, y: 12, width: 150, height: 12 },
            { path: '/images/test.png', x: 0, y: 24, width: 150, height: 12 }
        ]
    };

    it('should generate the correct prefixed-css with common width/height', function () {
        return testTemplatedStylesheet.testStylesheetGeneration(stylesheetGenerator, layoutCommon, expectedWithCommonWidth, {
            prefix: 'sprite-',
            nameMapping: nameToClass,
            spritePath: './images/png/sprite.png',
            pixelRatio: 1
        });
    });
});
