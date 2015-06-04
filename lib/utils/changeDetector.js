'use strict';

var fs = require('fs'),

    async = require('async'),
    glob = require('glob'),
    _ = require('underscore');

function stat(path, callback) {
    fs.stat(path, function (err, fileStat) {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, null);
            }
            return callback(err);
        }
        return callback(null, fileStat);
    });
}

function generateTimestamps(patterns, callback) {
    var timestamps = {};

    async.map(patterns, glob, function (globErr, fileNames) {
        if (globErr) {
            return callback(globErr);
        }

        fileNames = _(fileNames).chain().flatten().uniq().value();

        async.map(fileNames, stat, function (statError, stats) {
            if (statError) {
                return callback(statError);
            }

            _(stats).each(function (fStat, it) {
                var timestamp = fStat ? fStat.mtime.getTime() : null;
                timestamps[fileNames[it]] = timestamp;
            });

            callback(null, timestamps);
        });
    });
}

module.exports = function (options) {
    var timestamps,
        filesToWatch = _.clone(options.src);

    filesToWatch.push(options.stylesheetPath);
    filesToWatch.push(options.spritePath);

    return {
        detect: function (callback) {
            // always generate the sprite the first time after startup
            if (!timestamps) {
                return callback(null, true);
            }

            generateTimestamps(filesToWatch, function (err, newTimestamps) {
                callback(err, !_(newTimestamps).isEqual(timestamps));
            });
        },

        register: function (callback) {
            generateTimestamps(filesToWatch, function (err, newTimestamps) {
                timestamps = newTimestamps;
                callback(err);
            });
        }
    };
};
