'use strict';

var getTemplatedStylesheet = require('./templatedStylesheet'),
    fs = require('fs'),
    path = require('path');

function readTemplatedStylesheetFromFile(file) {
    return getTemplatedStylesheet(fs.readFileSync(file).toString());
}

module.exports = {
    css: readTemplatedStylesheetFromFile(path.join(__dirname, '/templates/css.tpl')),
    javascript: readTemplatedStylesheetFromFile(path.join(__dirname, '/templates/javascript.tpl')),
    less: readTemplatedStylesheetFromFile(path.join(__dirname, '/templates/less.tpl')),
    'prefixed-css': require('./prefixed-css'),
    sass: readTemplatedStylesheetFromFile(path.join(__dirname, '/templates/sass.tpl')),
    scss: readTemplatedStylesheetFromFile(path.join(__dirname, '/templates/scss.tpl')),
    stylus: readTemplatedStylesheetFromFile(path.join(__dirname, '/templates/stylus.tpl')),
    readTemplatedStylesheetFromFile: readTemplatedStylesheetFromFile
};
