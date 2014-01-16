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

function readImage(path, callback) {
    fs.readFile(path, function (err, data) {
        gm(data).size(function (err, size) {
            callback(err, {
                path: path,
                width: size.width,
                height: size.height,
                data: data
            });
        });
    });
}

function readImages(filePaths, callback) {
    async.mapLimit(filePaths, 80, readImage, function (err, result) {
        // NOTE: async.mapLimit() apparently does not guarantee output order will match input order.
        // Restore the expected order before executing callback.
        var images = _(filePaths).map(function(filePath) {
           return _(result).findWhere({ path: filePath });
        });
        callback(err || null, images);
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