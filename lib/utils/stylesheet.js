'use strict';

var path = require('path'),

    _ = require('underscore');

function prefixString(str, options) {
    return options.prefix ? options.prefix + str : str;
}

module.exports = {
    prefixString: prefixString,

    nameToClass: function (imagePath) {
        return path.basename(imagePath, path.extname(imagePath));
    },

    getScaledLayoutForPixelRatio: function (layout, pixelRatio) {
        var scaledLayout = _.clone(layout);

        if (pixelRatio !== 1) {
            scaledLayout.width = layout.width / pixelRatio;
            scaledLayout.height = layout.height / pixelRatio;

            scaledLayout.images = layout.images.map(function (image) {
                return _.extend({}, image, {
                    x: image.x / pixelRatio,
                    y: image.y / pixelRatio,
                    width: image.width / pixelRatio,
                    height: image.height / pixelRatio
                });
            });
        }

        return scaledLayout;
    },

    getCSSValue: function (pixelValue) {
        return pixelValue === 0 ? '0' : pixelValue + 'px';
    },

    getRelativeSpriteDir: function (spritePath, stylesheetPath) {
        var stylesheetDir = path.dirname(path.resolve(stylesheetPath)),
            spriteDir = path.resolve(spritePath),
            relativePath = path.relative(stylesheetDir, spriteDir);

        /* To prevent putting platform-dependent delimeter (e.g. '\\')
           in the sprite's url in CSS, replace all of them to slashes here.
           We don't use replace by RegExp with 'g' as path.sep may contain
           characters which should be escaped in regex. */
        relativePath = relativePath.split(path.sep).join('/');

        if (relativePath.slice(0, 3) !== '../') {
            relativePath = './' + relativePath;
        }

        return relativePath;
    }
};
