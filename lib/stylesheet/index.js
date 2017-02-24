'use strict';

var getTemplatedStylesheet = require('./templatedStylesheet'),
    path = require('path');

module.exports = {
    css: getTemplatedStylesheet(path.join(__dirname, '/templates/css.tpl')),
    javascript: getTemplatedStylesheet(path.join(__dirname, '/templates/javascript.tpl')),
    less: getTemplatedStylesheet(path.join(__dirname, '/templates/less.tpl')),
    'prefixed-css': require('./prefixed-css'),
    sass: getTemplatedStylesheet(path.join(__dirname, '/templates/sass.tpl')),
    scss: getTemplatedStylesheet(path.join(__dirname, '/templates/scss.tpl')),
    stylus: getTemplatedStylesheet(path.join(__dirname, '/templates/stylus.tpl'))
};