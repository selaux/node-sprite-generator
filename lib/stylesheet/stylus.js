'use strict';

var path = require('path'),
    fs = require('fs'),
    utils = require('../utils/stylesheet'),
    _ = require('underscore'),
    // template that defines a stylus variable for every sprite
    imageTemplate = _.template("<%= className %> = <%= -image.x %>px <%= -image.y %>px <%= image.width %>px <%= image.height %>px\n"),
    // template that defines the sprite mixin
    spriteFunctionTemplate = _.template("<%= spriteName %>($sprite)\n    background-image url('<%= options.spritePath %>')\n    background-position $sprite[0] $sprite[1]\n    width $sprite[2]\n    height $sprite[3]\n");

module.exports = function generateStylus(layout, filePath, spritePath, options, callback) {
    var buffer = '',
        defaults = {
            prefix: '',
            nameMapping: utils.nameToClass,
            spritePath: ''
        };

    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    options.spritePath = options.spritePath || path.relative(path.resolve(filePath), path.resolve(spritePath));
    _.defaults(options, defaults);

    // define variable for each sprite
    _(layout.images).each(function (image) {
        buffer += utils.renderTemplateForImage(image, imageTemplate, options);
    });

    // define sprite mixin
    buffer += spriteFunctionTemplate({
        spriteName: utils.prefixString('sprite', options),
        options: options
    });

    fs.writeFile(filePath, buffer, callback);
};