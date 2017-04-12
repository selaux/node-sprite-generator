'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    glob = Promise.promisify(require('glob')),
    mkdirp = Promise.promisify(require('mkdirp')),
    spriteGenerator = require('./spriteGenerator'),
    changeDetector = require('./utils/changeDetector'),
    readFile = Promise.promisify(fs.readFile),
    writeFile = Promise.promisify(fs.writeFile);

function generateSpriteNode(userOptions, callback) {
    return spriteGenerator({
        glob,
        readFile,
        writeFile,
        mkdirp
    }, userOptions, callback);
}

generateSpriteNode.middleware = function (options) {
    var changes = changeDetector(options);

    return function (req, res, next) {
        return changes.detect().then(function (changesDetected) {
            if (changesDetected) {
                return generateSpriteNode(options)
                    .then(changes.register.bind(changes))
                    .then(next);
            }
            return next();
        }).catch(next);
    };
};

module.exports = generateSpriteNode;