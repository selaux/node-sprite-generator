'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/scss/with-prefix.scss')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/scss/with-nameMapping.scss')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/scss/with-pixelRatio.scss'))
    };

testTemplatedStylesheet('scss', expected);