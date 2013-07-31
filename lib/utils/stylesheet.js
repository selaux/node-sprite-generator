'use strict';

var path = require('path');

function prefixString(str, options) {
    return options.prefix ? options.prefix + '-' + str : str;
}

module.exports = {
    prefixString: prefixString,

    nameToClass: function (imagePath) {
        return path.basename(imagePath, path.extname(imagePath));
    },

    renderTemplateForImage: function (image, template, options) {
        var imageName = options.nameMapping(image.path),
            className = prefixString(imageName, options);

        return template({
            className: className,
            image: image,
            options: options
        });
    }
};