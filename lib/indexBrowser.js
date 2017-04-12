'use strict';

var spriteGenerator = require('./spriteGenerator');

function generateSpriteBrowser(userOptions, callback) {
    return spriteGenerator({
        glob: () => Promise.reject(new Error('Referencing files by path is not supported in the browser')),
        readFile: () => Promise.reject(new Error('Reading files from path is not supported in the browser')),
        writeFile: () => Promise.reject(new Error('Writing files is not supported in the browser')),
        mkdirp: () => Promise.reject(new Error('Creating directories is not supported in the browser'))
    }, userOptions, callback);
}

module.exports = generateSpriteBrowser;
