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
    async.map(filePaths, readImage, function (err, result) {
        callback(err, result);
    });
}

function renderSprite(layout, filePath, options, callback) {
    var canvas = new Canvas(layout.width, layout.height),
        ctx = canvas.getContext('2d'),
        defaults = {
            compressionLevel: 6
        };

    options = _.extend({}, defaults, options);

    // render images to canvas
    _(layout.images).each(function (image) {
        ctx.drawImage(image.data, image.x, image.y, image.width, image.height);
    });

    // store canvas to file
    canvas.toBuffer(function (err, buffer) {
        if (err) {
            throw err;
        }

        fs.writeFile(filePath, buffer, function (err) {
            callback(err);
        });
    }, options.compressionLevel);
}

module.exports = {
    readImages: readImages,
    render: renderSprite
};