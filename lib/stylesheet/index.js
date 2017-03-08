'use strict';

var getTemplatedStylesheet = require('./templatedStylesheet'),
    fs = require('fs'),
    path = require('path');

function readTemplatedStylesheetFromFile(file) {
    return getTemplatedStylesheet(file.toString());
}

module.exports = {
    css: readTemplatedStylesheetFromFile(fs.readFileSync(path.join(__dirname, '/templates/css.tpl'))),
    javascript: readTemplatedStylesheetFromFile(fs.readFileSync(path.join(__dirname, '/templates/javascript.tpl'))),
    less: readTemplatedStylesheetFromFile(fs.readFileSync(path.join(__dirname, '/templates/less.tpl'))),
    'prefixed-css': require('./prefixed-css'),
    sass: readTemplatedStylesheetFromFile(fs.readFileSync(path.join(__dirname, '/templates/sass.tpl'))),
    scss: readTemplatedStylesheetFromFile(fs.readFileSync(path.join(__dirname, '/templates/scss.tpl'))),
    stylus: readTemplatedStylesheetFromFile(fs.readFileSync(path.join(__dirname, '/templates/stylus.tpl')))
};