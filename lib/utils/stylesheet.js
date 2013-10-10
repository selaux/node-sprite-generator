'use strict';

var path = require('path'),

    _ = require('underscore');

function prefixString(str, options) {
    return options.prefix ? options.prefix + '-' + str : str;
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

    renderImageTemplatesForLayout: function (layout, template, options) {
        var self = this;
        return _(layout.images).map(function (image) {
            return self.renderTemplateForImage(image, template, options, layout);
        }).join('');
    },

    renderTemplateForImage: function (image, template, options, layout) {
        var imageName = options.nameMapping(image.path),
            className = prefixString(imageName, options);

        return template({
            className: className,
            layout: layout,
            image: image,
            options: options
        });
    },

    getRelativeSpriteDir: function (spritePath, stylesheetPath) {
        var stylesheetDir = path.dirname(path.resolve(stylesheetPath)),
            spriteDir = path.resolve(spritePath),
            relativePath = path.relative(stylesheetDir, spriteDir);

        if (relativePath.slice(0, 3) !== '../') {
            relativePath = './' + relativePath;
        }

        return relativePath;
    }
};