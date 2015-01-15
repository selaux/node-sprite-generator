'use strict';

var _ = require('underscore'),
    defaultOptions = require('./utils/defaultOptions'),
    scaleImages = require('./utils/scaleImages');

function sumUp(sum, value) {
    return sum + value;
}

module.exports = function generateLayout(images, options, callback) {
    options = _.extend({}, defaultOptions, options);

    images = scaleImages(images, options);
    images = _(images).map(function (image, it) {
        return _.extend({
            x: 0,
            y: it === 0 ? 0 : _(images).chain().pluck('height').first(it).reduce(sumUp).value() + options.padding * it
        }, image);
    });

    callback(null, {
        width: _(images).chain().pluck('width').max().value(),
        height: _(images).chain().pluck('height').reduce(sumUp).value() + options.padding * (images.length - 1),
        images: images
    });
};
