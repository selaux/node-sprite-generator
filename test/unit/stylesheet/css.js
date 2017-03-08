'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/css/with-prefix.css')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/css/with-nameMapping.css')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/css/with-pixelRatio.css'))
    };

testTemplatedStylesheet('css', expected);
