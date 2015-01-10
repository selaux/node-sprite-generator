'use strict';

var _ = require('underscore');

module.exports = function scaleImages(images, options) {
    return _(images).map(function (image) {
        return _.extend({}, image, {
            width: Math.round(image.width * options.scaling),
            height: Math.round(image.height * options.scaling)
        });
    });
};
