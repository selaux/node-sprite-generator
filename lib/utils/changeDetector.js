'use strict';

var fs = require('fs'),

    async = require('async'),
    glob = require('glob'),
    _ = require('underscore');

function stat(path, callback) {
    fs.stat(path, function (err, stat) {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, null);
            }
            return callback(err);
        }
        return callback(null, stat);
    });
}

function generateTimestamps(patterns, callback) {
    var timestamps = {};

    async.map(patterns, glob, function (err, fileNames) {
        if (err) {
            return callback(err);
        }

        fileNames = _(fileNames).chain().flatten().uniq().value();

        async.map(fileNames, stat, function (err, stats) {
            if (err) {
                return callback(err);
            }

            _(stats).each(function (stat, it) {
                timestamps[fileNames[it]] = stat ? stat.mtime.getTime() : null;
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