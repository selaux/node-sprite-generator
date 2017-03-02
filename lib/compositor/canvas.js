'use strict';

var Promise = require('bluebird'),
    _ = require('underscore'),
    Canvas = require('canvas'),
    Image = Canvas.Image;

function readImage(rawImg) {
    var image = new Image();

    image.src = rawImg.data;

    return Promise.resolve({
        path: rawImg.path,
        width: image.width,
        height: image.height,
        data: image
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

function renderSprite(layout, spritePath, options) {
    var canvas = new Canvas(layout.width, layout.height),
        ctx = canvas.getContext('2d');

    // render images to canvas
    _(layout.images).each(function (image) {
        ctx.drawImage(image.data, image.x, image.y, image.width, image.height);
    });

    // store canvas to file, we need to use this new promise because of the weird signature of toBuffer
    return Promise.fromCallback(function (promiseCallback) {
        return canvas.toBuffer(promiseCallback, options.compressionLevel, filterToParam(options.filter, canvas));
    });
}

module.exports = {
    readImage: readImage,
    render: renderSprite,
    filterToParam: filterToParam
};
