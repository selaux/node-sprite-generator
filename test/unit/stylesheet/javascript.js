'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/javascript/with-prefix.js')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/javascript/with-nameMapping.js')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/javascript/with-pixelRatio.js'))
    };

testTemplatedStylesheet('javascript', expected);
