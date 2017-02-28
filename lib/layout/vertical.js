'use strict';

var Promise = require('bluebird'),
    _ = require('underscore'),
    scaleImages = require('./utils/scaleImages');

function sumUp(sum, value) {
    return sum + value;
}

module.exports = function generateLayout(images, options) {
    images = scaleImages(images, options);
    images = _(images).map(function (image, it) {
        return _.extend({
            x: 0,
            y: it === 0 ? 0 : _(images).chain().pluck('height').first(it).reduce(sumUp).value() + options.padding * it
        }, image);
    });

    return Promise.resolve({
        width: _(images).chain().pluck('width').max().value(),
        height: _(images).chain().pluck('height').reduce(sumUp).value() + options.padding * (images.length - 1),
        images: images
    });
};
