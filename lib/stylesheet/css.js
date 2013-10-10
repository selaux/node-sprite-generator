'use strict';

var path = require('path'),
    fs = require('fs'),
    utils = require('../utils/stylesheet'),
    _ = require('underscore'),
    // template that defines a single line in the css
    template = _.template(".<%= className %> { background-image: url('<%= options.spritePath %>'); <% if (options.pixelRatio !== 1) { %>background-size: <%= layout.width %>px <%= layout.height %>px; <% } %>background-position: <%= -image.x %>px <%= -image.y %>px; width: <%= image.width %>px; height: <%= image.height %>px; }\n");

module.exports = function generateCSS(layout, filePath, spritePath, options, callback) {
    var scaledLayout,
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

    fs.writeFile(filePath, utils.renderImageTemplatesForLayout(scaledLayout, template, options), callback);
};