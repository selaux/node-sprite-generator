'use strict';

var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    gm = require('gm');

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
    async.map(filePaths, readImage, function (err, result) {
        callback(err, result);
    });
}

function renderSprite(layout, filePath, options, callback) {
    var img = gm(layout.width, layout.height, '#FFFFFFFF'),
        defaults = {
            compressionLevel: 6
        };

    options = _.extend({}, defaults, options);

    _(layout.images).each(function (image) {
        img.in('-geometry', image.width + 'x' + image.height).in('-page', '+' + image.x + '+' + image.y).in(path.resolve(image.path));
    });

    img.mosaic().quality(options.compressionLevel).write(path.resolve(filePath), function (err) {
        callback(err);
    });
}

module.exports = {
    readImages: readImages,
    render: renderSprite
};