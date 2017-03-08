'use strict';

var fs = require('fs'),
    path = require('path'),
    testTemplatedStylesheet = require('./testTemplatedStylesheet'),
    expected = {
        prefix: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/stylus/with-prefix.stylus')),
        nameMapping: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/stylus/with-nameMapping.stylus')),
        pixelRatio: fs.readFileSync(path.join(__dirname, '../../fixtures/stylesheets/stylus/with-pixelRatio.stylus'))
    };

testTemplatedStylesheet('stylus', expected);
