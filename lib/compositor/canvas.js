'use strict';

var _ = require('underscore'),
    fs = require('fs'),
    async = require('async'),
    Canvas = require('canvas'),
    Image = Canvas.Image;

function readImage(path, callback) {
    fs.readFile(path, function (err, data) {
        // create image using node-canvas so the data can be used when rendering the sprite image
        var image = new Image();

        if (err) {
            return callback(err);
        }

        image.src = data;

        callback(err, {
            path: path,
            width: image.width,
            height: image.height,
            data: image
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

function filterToParam(filter, canvasInstance) {
    var filterMap = {
            none: canvasInstance.PNG_FILTER_NONE,
            sub: canvasInstance.PNG_FILTER_SUB,
            up: canvasInstance.PNG_FILTER_UP,
            average: canvasInstance.PNG_FILTER_AVG,
            paeth: canvasInstance.PNG_FILTER_PAETH,
            all: canvasInstance.PNG_ALL_FILTERS
        };

    return filterMap[filter];
}

function renderSprite(layout, filePath, options, callback) {
    var canvas = new Canvas(layout.width, layout.height),
        ctx = canvas.getContext('2d'),
        defaults = {
            compressionLevel: 6,
            filter: 'all'
        };

    options = _.extend({}, defaults, options);

    // render images to canvas
    _(layout.images).each(function (image) {
        ctx.drawImage(image.data, image.x, image.y, image.width, image.height);
    });

    // store canvas to file
    canvas.toBuffer(function (bufferError, buffer) {
        if (bufferError) {
            return callback(bufferError);
        }

        fs.writeFile(filePath, buffer, function (writeError) {
            callback(writeError);
        });
    }, options.compressionLevel, filterToParam(options.filter, canvas));
}

module.exports = {
    readImages: readImages,
    render: renderSprite,
    filterToParam: filterToParam
};
