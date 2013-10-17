'use strict';

var _ = require('underscore');

function sumUp(sum, value) {
    return sum + value;
}

module.exports = function generateLayout(images, options, callback) {
    var defaults = {
            padding: 0
        };

    if (_(options).isFunction()) {
        callback = options;
        options = {};
    }

    options = _.extend({}, defaults, options);

    images = _(images).map(function (image, it) {
        return _.extend({
            x: 0,
            y: it === 0 ? 0 : _(images).chain().pluck('height').first(it).reduce(sumUp).value() + options.padding * it
        }, image);
    });

    callback(undefined, {
        width: _(images).chain().pluck('width').max().value(),
        height: _(images).chain().pluck('height').reduce(sumUp).value() + options.padding * (images.length - 1),
        images: images
    });
};