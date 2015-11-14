'use strict';

var _ = require('underscore'),
    async = require('async'),
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
    new Jimp(path, function (err) {
        if (err) {
            return callback(err);
        }

        callback(err, {
            path: path,
            width: this.bitmap.width,
            height: this.bitmap.height,
            data: this
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

function filterToParam(filter) {
    return filterMap[filter];
}

function renderSprite(layout, filePath, options, callback) {
    var defaults = {
        compressionLevel: 6,
        filter: 'all'
    };

    options = _.extend({}, defaults, options);

    new Jimp(layout.width, layout.height, function (err) {
        var composed = this;

        if (err) {
            return callback(err);
        }

        _(layout.images).each(function (image) {
            var imageToDraw = image.data.resize(image.width, image.height);
            composed.composite(imageToDraw, image.x, image.y);
        });

        composed.deflateLevel(options.compressionLevel);
        composed.filterType(filterToParam(options.filter));

        composed.write(filePath, function (writeError) {
            callback(writeError);
        });
    });
}

module.exports = {
    readImages: readImages,
    render: renderSprite,
    filterToParam: filterToParam
};
