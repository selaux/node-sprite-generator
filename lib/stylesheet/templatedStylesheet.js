'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    utils = require('../utils/stylesheet'),
    _ = require('underscore');

module.exports = function getTemplatedStylesheet(templateString) {
    var template = _.template(templateString);

    return function generateSpritesheet(layout, options) {
        var scaledLayout = utils.getScaledLayoutForPixelRatio(layout, options.pixelRatio);

        scaledLayout.images = scaledLayout.images.map(function (image) {
            var imageName = options.nameMapping(image.path),
                className = utils.prefixString(imageName, options);

            return _.extend(image, { className: className });
        });

        return Promise.resolve(template({
            getCSSValue: utils.getCSSValue,
            spriteName: utils.prefixString('sprite', options),
            options: options,
            layout: scaledLayout
        }));
    };
};
