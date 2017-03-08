'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/less/with-prefix.less')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/less/with-nameMapping.less')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/less/with-pixelRatio.less'))
    };

testTemplatedStylesheet('less', expected);
