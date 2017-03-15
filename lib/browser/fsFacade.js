'use strict';

var rejectWithNotInBrowser = require('./function');

module.exports = {
    readFile: rejectWithNotInBrowser,
    writeFile: rejectWithNotInBrowser
};