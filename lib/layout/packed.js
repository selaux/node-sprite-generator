'use strict';

var _ = require('underscore'),
    binPack = require('bin-pack'),
    defaultOptions = require('./utils/defaultOptions'),
    scaleImages = require('./utils/scaleImages');

module.exports = function generateLayout(images, options, callback) {
    var packed;

    options = _.extend({}, defaultOptions, options);

    images = scaleImages(images, options);
    images = _.map(images, function (image) {
        image.width += options.padding;
        image.height += options.padding;
        return image;
    });

    packed = binPack(images);
    images = _.map(packed.items, function (image) {
        return {
            x: image.x,
            y: image.y,
            width: image.width - options.padding,
            height: image.height - options.padding,
            path: image.item.path,
            data: image.item.data
        };
    });

    callback(null, {
        width: packed.width,
        height: packed.height,
        images: images
    });
};
