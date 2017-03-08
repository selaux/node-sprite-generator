'use strict';

var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    glob = Promise.promisify(require('glob')),
    R = require('ramda'),
    stat = R.pipe(R.applySpec({
        path: R.identity,
        stat: function (path) {
            return fs.statAsync(path).catch(function (err) {
                return err.code === 'ENOENT';
            }, function () {
                return null;
            });
        }
    }), Promise.props);

function generateTimestamps(patterns) {
    return Promise.map(patterns, function (pattern) {
        return glob(pattern);
    }).then(R.flatten).then(R.uniq).then(function (fileNames) {
        return Promise.map(fileNames, stat).reduce(function (timestamps, file) {
            timestamps[file.path] = file.stat ? file.stat.mtime.getTime() : null;
            return timestamps;
        }, {});
    });
}

module.exports = function (options) {
    var timestamps,
        filesToWatch = R.clone(options.src);

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
                    return !R.equals(newTimestamps, timestamps);
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
