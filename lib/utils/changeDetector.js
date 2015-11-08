'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    fsStat = Promise.promisify(fs.stat),
    glob = Promise.promisify(require('glob')),
    _ = require('underscore');

function stat(path) {
    return fsStat(path).catch(function (err) {
        return err.code === 'ENOENT';
    }, function () {
        return null;
    });
}

function generateTimestamps(patterns) {
    var timestamps = {};

    return Promise.map(patterns, function (pattern) {
        return glob(pattern);
    }).then(function (fileNames) {
            fileNames = _(fileNames).chain().flatten().uniq().value();

            return Promise.map(fileNames, stat).then(function (stats) {
                _(stats).each(function (fStat, it) {
                    var timestamp = fStat ? fStat.mtime.getTime() : null;
                    timestamps[fileNames[it]] = timestamp;
                });

                return timestamps;
            });
    });
}

module.exports = function (options) {
    var timestamps,
        filesToWatch = _.clone(options.src);

    filesToWatch.push(options.stylesheetPath);
    filesToWatch.push(options.spritePath);

    return {
        detect: function () {
            return Promise.try(function () {
                // always generate the sprite the first time after startup
                if (!timestamps) {
                    return true;
                }

                return generateTimestamps(filesToWatch).then(function (newTimestamps) {
                    return !_(newTimestamps).isEqual(timestamps);
                });
            });
        },

        register: function () {
            return generateTimestamps(filesToWatch).then(function (newTimestamps) {
                timestamps = newTimestamps;
            });
        }
    };
};
