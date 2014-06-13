'use strict';

var _ = require('underscore'),
    getTemplatedStylesheet = require('./templatedStylesheet'),
    generateSpriteSheet = getTemplatedStylesheet('prefixed-css');

module.exports = function(layout, filePath, spritePath, options, callback) {
    var localOptions = _.clone(options);
    localOptions.prefix = localOptions.prefix || 'sprite-';
    localOptions.commonWidth = layout.images[0].width;
    localOptions.commonHeight = layout.images[0].height;

    layout.images.every(function(image) {
        if (image.width != localOptions.commonWidth ||
            image.height != localOptions.commonHeight)
        {
            localOptions.commonWidth = localOptions.commonHeight = false;
            return false;
        }
        return true;
    });

    generateSpriteSheet(layout, filePath, spritePath, localOptions, callback);
};