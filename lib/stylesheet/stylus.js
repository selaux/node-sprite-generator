'use strict';

var path = require('path'),
    fs = require('fs'),
    utils = require('../utils/stylesheet'),
    _ = require('underscore'),
    // template that defines a stylus variable for every sprite
    imageTemplate = _.template("<%= className %> = <%= -image.x %>px <%= -image.y %>px <%= image.width %>px <%= image.height %>px\n"),
    // template that defines the sprite mixin
    spriteFunctionTemplate = _.template("<%= spriteName %>($sprite)\n    background-image url('<%= options.spritePath %>')\n<% if (options.pixelRatio !== 1) { %>    background-size <%= layout.width %>px <%= layout.height %>px\n<% } %>    background-position $sprite[0] $sprite[1]\n    width $sprite[2]\n    height $sprite[3]\n");

module.exports = function generateStylus(layout, filePath, spritePath, options, callback) {
    var buffer = '',
        scaledLayout,
        defaults = {
            prefix: '',
            nameMapping: utils.nameToClass,
            spritePath: '',
            pixelRatio: 1
        };

    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    options.spritePath = options.spritePath || utils.getRelativeSpriteDir(spritePath, filePath);
    _.defaults(options, defaults);

    scaledLayout = utils.getScaledLayoutForPixelRatio(layout, options.pixelRatio);

    buffer += utils.renderImageTemplatesForLayout(scaledLayout, imageTemplate, options);
    buffer += spriteFunctionTemplate({
        spriteName: utils.prefixString('sprite', options),
        options: options,
        layout: scaledLayout
    });

    fs.writeFile(filePath, buffer, callback);
};