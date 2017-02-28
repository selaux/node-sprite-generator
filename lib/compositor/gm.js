'use strict';

var Promise = require('bluebird'),
    _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    readFile = Promise.promisify(fs.readFile),
    gm = require('gm'),

    filterMap = {
        none: 0,
        sub: 1,
        up: 2,
        average: 3,
        paeth: 4,
        all: 9
    };

function readImage(filePath) {
    return readFile(filePath).then(function (data) {
        var gmObject = gm(data),
            getSize = Promise.promisify(gmObject.size, { context: gmObject });

        return getSize().then(function (size) {
            return {
                path: filePath,
                width: size.width,
                height: size.height,
                data: data
            };
        });
    });
}

function readImages(filePaths) {
    return Promise.map(filePaths, readImage, { concurrency: 80 });
}

function filterToQuality(filter) {
    return filterMap[filter];
}

function renderSprite(layout, filePath, options) {
    return Promise.fromCallback(function (callback) {
        var img = gm(layout.width, layout.height, '#FFFFFFFF');

        _(layout.images).each(function (image) {
            img.in('-geometry', image.width + 'x' + image.height).in('-page', '+' + image.x + '+' + image.y).in(path.resolve(image.path));
        });

        img.mosaic().quality(options.compressionLevel * 10 + filterToQuality(options.filter));

        img.toBuffer('PNG', callback);
    });
}

module.exports = {
    readImages: readImages,
    render: renderSprite,
    filterToQuality: filterToQuality
};
