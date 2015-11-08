'use strict';

var name = 'prefixed-css',
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    testUtils = require('../../utils/test.js'),
    stylesheetGenerator = require('../../../lib/stylesheet/' + name + '.js');

testTemplatedStylesheet(name, 'css', function () {
    var layoutCommon = {
        width: 150,
        height: 156,
        images: [
            { path: '/bla/foo.png', x: 0, y: 0, width: 150, height: 12 },
            { path: '/foo/bar.png', x: 0, y: 12, width: 150, height: 12 },
            { path: '/images/test.png', x: 0, y: 24, width: 150, height: 12 }
        ]
    };

    it('should generate the correct ' + name + ' with common width/height', function () {
        var expectedStylesheetPath = 'test/fixtures/stylesheets/' + name + '/with-common-wh.css';
        return testUtils.testStylesheetGeneration(stylesheetGenerator, layoutCommon, expectedStylesheetPath, { prefix: 'sprite-' });
    });
});
