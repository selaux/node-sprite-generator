'use strict';

var _ = require('underscore');
var binpacker = require('binpacking/js');
var GrowingPacker = binpacker.GrowingPacker;

module.exports = function generateLayout(images, options, callback) {
    var defaults = {
            padding: 0
        };

    options = _.extend({}, defaults, options);

    // We need to map width/height attribute to w/h for the binpacker
    images = _(images).map(function (image) {
        return _.extend({
            w: image.width + options.padding,
            h: image.height + options.padding,
        }, image);
    });

    var packer = new GrowingPacker;
    packer.fit(images);

    var width = 0, height = 0;
    images = _(images).map(function(image) {
        width = Math.max(width, image.fit.w);
        height = Math.max(height, image.fit.h);

        // remove uneccesary data by buiding a new object
        return {
           width: image.width,
           height: image.height,
           x: image.fit.x,
           y: image.fit.y,
           data: image.data,
           path: image.path
        }
    });


    callback(undefined, {
        width: width,
        height: height,
        images: images
    });
    
};
