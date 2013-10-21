'use strict';

var path = require('path'),
    fs = require('fs'),
    utils = require('../utils/stylesheet'),
    _ = require('underscore');

module.exports = function getTemplatedStylesheet(name) {
    var template = _.template(fs.readFileSync(path.join(__dirname, '/templates/', name + '.tpl')).toString());

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

        fs.writeFile(filePath, template({
            getCSSValue: utils.getCSSValue,
            spriteName: utils.prefixString('sprite', options),
            options: options,
            layout: scaledLayout
        }), callback);
    };
};