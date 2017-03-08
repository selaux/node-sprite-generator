'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/sass/with-prefix.sass')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/sass/with-nameMapping.sass')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/sass/with-pixelRatio.sass'))
    };

testTemplatedStylesheet('sass', expected);
