'use strict';

var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    gm = require('gm'),

    filterMap = {
        none: 0,
        sub: 1,
        up: 2,
        average: 3,
        paeth: 4,
        all: 9
    };

function readImage(filePath, callback) {
    fs.readFile(filePath, function (readError, data) {
        if (readError) {
            return callback(readError);
        }

        gm(data).size(function (sizeError, size) {
            if (sizeError) {
                return callback(sizeError);
            }
            callback(null, {
                path: filePath,
                width: size.width,
                height: size.height,
                data: data
            });
        });
    });
}

function readImages(filePaths, callback) {
    async.mapLimit(filePaths, 80, readImage, function (err, result) {
        if (err) {
            return callback(err);
        }
        // NOTE: async.mapLimit() apparently does not guarantee output order will match input order.
        // Restore the expected order before executing callback.
        callback(null, _(filePaths).map(function(filePath) {
            return _(result).findWhere({ path: filePath });
        }));
    });
}

function filterToQuality(filter) {
    return filterMap[filter];
}

function renderSprite(layout, filePath, options, callback) {
    var img = gm(layout.width, layout.height, '#FFFFFFFF'),
        defaults = {
            compressionLevel: 6,
            filter: 'all'
        };

    options = _.extend({}, defaults, options);

    _(layout.images).each(function (image) {
        img.in('-geometry', image.width + 'x' + image.height).in('-page', '+' + image.x + '+' + image.y).in(path.resolve(image.path));
    });

    img.mosaic().quality(options.compressionLevel * 10 + filterToQuality(options.filter)).write(path.resolve(filePath), function (err) {
        callback(err);
    });
}

module.exports = {
    readImages: readImages,
    render: renderSprite,
    filterToQuality: filterToQuality
};
