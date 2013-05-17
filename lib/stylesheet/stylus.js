module.exports = (function () {
    'use strict';

    var path = require('path'),
        fs = require('fs'),
        utils = require('../utils/stylesheet'),
        _ = require('underscore'),

        imageTemplate = _.template("<%= className %> = <%= -image.x %>px <%= -image.y %>px <%= image.width %>px <%= image.height %>px\n"),
        spriteFunctionTemplate = _.template("<%= spriteName %>($sprite)\n    background-image: url('<%= options.spritePath %>')\n    background-position: $sprite[0] $sprite[1]\n    width: $sprite[2]\n    height: $sprite[3]\n");

    return function generateStylus(layout, filePath, spritePath, options, callback) {
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

        options.spritePath = options.spritePath || path.relative(filePath, spritePath);
        _.defaults(options, defaults);

        _(layout.images).each(function (image) {
            buffer += utils.renderTemplateForImage(image, imageTemplate, options);
        });

        buffer += spriteFunctionTemplate({
            spriteName: utils.prefixString('sprite', options),
            options: options
        });

        fs.writeFile(filePath, buffer, callback);
    };

}());