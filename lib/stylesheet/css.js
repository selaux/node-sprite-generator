module.exports = (function () {
    'use strict';

    var path = require('path'),
        fs = require('fs'),
        utils = require('../utils/stylesheet'),
        _ = require('underscore'),

        template = _.template(".<%= className %> { background-image: url('<%= options.spritePath %>'); background-position: <%= -image.x %>px <%= -image.y %>px; width: <%= image.width %>px; height: <%= image.height %>px; }\n");

    return function generateCSS(layout, filePath, spritePath, options, callback) {
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
            buffer += utils.renderTemplateForImage(image, template, options);
        });

        fs.writeFile(filePath, buffer, callback);
    };

}());