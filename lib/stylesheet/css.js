'use strict';

var getTemplatedStylesheet = require('./templatedStylesheet'),
    path = require('path');

module.exports = getTemplatedStylesheet(path.join(__dirname, '/templates/css.tpl'));
