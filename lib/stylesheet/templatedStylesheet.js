'use strict';

var fs = require('fs'),
    mkdirp = require('mkdirp'),
    utils = require('../utils/stylesheet'),
    _ = require('underscore');

module.exports = function getTemplatedStylesheet(templatePath) {
    var template = _.template(fs.readFileSync(templatePath).toString());

    return function generateSpritesheet(layout, filePath, spritePath, options, callback) {
        var scaledLayout,
            defaults = {
                prefix: '',
                nameMapping: utils.nameToClass,
                spritePath: utils.getRelativeSpriteDir(spritePath, filePath),
                pixelRatio: 1
            };

        options = _.extend({}, defaults, options);

        scaledLayout = utils.getScaledLayoutForPixelRatio(layout, options.pixelRatio);

        scaledLayout.images = scaledLayout.images.map(function (image) {
            var imageName = options.nameMapping(image.path),
                className = utils.prefixString(imageName, options);

            return _.extend(image, { className: className });
        });

        mkdirp(fs.dirname(filePath), function (error) {
            if (error) {
                return callback(error);
            }

            fs.writeFile(filePath, template({
                getCSSValue: utils.getCSSValue,
                spriteName: utils.prefixString('sprite', options),
                options: options,
                layout: scaledLayout
            }), callback);

        });
    };
};
