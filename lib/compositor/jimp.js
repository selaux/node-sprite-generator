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

function readImage(rawImage) {
    return Promise.resolve(Jimp.read(rawImage.data))
        .then(function (image) {
            return {
                path: rawImage.path,
                width: image.bitmap.width,
                height: image.bitmap.height,
                data: image
            };
        });
}

function filterToParam(filter) {
    return filterMap[filter];
}

function renderSprite(layout, filePath, options) {
    return Promise.fromCallback(function (cb) {
        new Jimp(layout.width, layout.height, function (err) {
            cb(err, this);
        });
    }).then(function (composed) {
        var getBuffer = Promise.promisify(composed.getBuffer, { context: composed });

        _(layout.images).each(function (image) {
            var imageToDraw = image.data.resize(image.width, image.height);
            composed.composite(imageToDraw, image.x, image.y);
        });

        composed.deflateLevel(options.compressionLevel);
        composed.filterType(filterToParam(options.filter));

        return getBuffer(Jimp.AUTO);
    });
}

module.exports = {
    readImage: readImage,
    render: renderSprite,
    filterToParam: filterToParam
};
