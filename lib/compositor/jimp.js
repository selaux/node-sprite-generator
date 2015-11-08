'use strict';

var Promise = require('bluebird'),
    _ = require('underscore'),
    Jimp = require('jimp'),

    filterMap = {
        none: Jimp.PNG_FILTER_NONE,
        sub: Jimp.PNG_FILTER_SUB,
        up: Jimp.PNG_FILTER_UP,
        average: Jimp.PNG_FILTER_AVERAGE,
        paeth: Jimp.PNG_FILTER_PAETH,
        all: Jimp.PNG_FILTER_AUTO
    };

function readImage(path, callback) {
    return Promise.fromCallback(function (cb) {
        new Jimp(path, function (err) {
            cb(err, this);
        });
    }).then(function (image) {
        return {
            path: path,
            width: image.bitmap.width,
            height: image.bitmap.height,
            data: image
        };
    }).nodeify(callback);
}

function readImages(filePaths, callback) {
    return Promise.map(filePaths, readImage, { concurrency: 80 }).then(function (result) {
        // NOTE: async.mapLimit() apparently does not guarantee output order will match input order.
        // Restore the expected order before executing callback.
        return _(filePaths).map(function(filePath) {
            return _(result).findWhere({ path: filePath });
        });
    }).nodeify(callback);
}

function filterToParam(filter) {
    return filterMap[filter];
}

function renderSprite(layout, filePath, options, callback) {
    var defaults = {
            compressionLevel: 6,
            filter: 'all'
        };

    options = _.extend({}, defaults, options);

    return Promise.fromCallback(function (cb) {
        new Jimp(layout.width, layout.height, function (err) {
            cb(err, this);
        });
    }).then(function (composed) {
        var write = Promise.promisify(composed.write, { context: composed });

        _(layout.images).each(function (image) {
            var imageToDraw = image.data.resize(image.width, image.height);
            composed.composite(imageToDraw, image.x, image.y);
        });

        composed.deflateLevel(options.compressionLevel);
        composed.filterType(filterToParam(options.filter));

        return write(filePath);
    }).nodeify(callback);
}

module.exports = {
    readImages: readImages,
    render: renderSprite,
    filterToParam: filterToParam
};
