'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    glob = Promise.promisify(require('glob')),
    mkdirp = Promise.promisify(require('mkdirp')),
    providedCompositors = require('./compositor'),
    spriteGenerator = require('./spriteGenerator'),
    changeDetector = require('./utils/changeDetector'),
    readFile = Promise.promisify(fs.readFile),
    writeFile = Promise.promisify(fs.writeFile),
    stat = Promise.promisify(fs.stat);

function generateSpriteNode(userOptions, callback) {
    return spriteGenerator({
        glob,
        readFile,
        writeFile,
        mkdirp,
        stat,
        providedCompositors
    }, userOptions, callback);
}

generateSpriteNode.middleware = function (options) {
    const changes = changeDetector({ stat, glob }, options);

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