'use strict';

var _ = require('underscore');

module.exports = function generateLayout(images, options, callback) {
    var defaults = {
            padding: 0,
            width: 400
        },
        layout = {}, p, pp;

    options = _.extend({}, defaults, options);

    p = options.padding;
    pp = options.padding*2;

    layout = {
        index: 0,
        areas: [],
        height: 0,
        putLine: function(image) {
            image.x = p;
            image.y = this.height + p;

            this.areas.push({
                x: image.width + pp,
                y: this.height,
                w: options.width - image.width - pp,
                h: image.height + pp,
                i: ++this.index
            });

            this.height += image.height + pp;
        },
        putInArea: function(image, area) {
            var dw = area.w - image.width - pp,
                dh = area.h - image.height - pp;

            this.areas = _.filter(this.areas, function(a) {
                return a.i !== area.i;
            });

            image.x = area.x + p;
            image.y = area.y + p;

            if (dw) {
                this.areas.push({
                    x: area.x + image.width + pp,
                    y: area.y,
                    w: dw,
                    h: image.height + pp,
                    i: ++this.index
                });
            }

            if (dh) {
                this.areas.push({
                    x: area.x,
                    y: area.y + image.height + p,
                    w: area.w,
                    h: dh,
                    i: ++this.index
                });
            }
        },
        putMatched: function(image, matched) {
            var elite = _.filter(matched, function(area) {
                return area.w === image.width + pp || area.h === image.height + pp;
            });

            if (!elite.length) elite = matched;

            elite.sort(function(a, b) {
                return a.h + a.w - b.h - b.w;
            });

            this.putInArea(image, matched[0]);
        },
        put: function(image) {
            var matched = _.filter(this.areas, function(area) {
                return area.w >= image.width + pp && area.h >= image.height + pp;
            });

            if (!matched.length) this.putLine(image);
            else this.putMatched(image, matched);
        }
    };

    // sort images by heigth
    images.sort(function(a, b) {
        return b.height - a.height;
    });

    // find image bigest width
    _.each(images, function(image) {
        if (options.width < image.width) options.width = image.width;
    });

    _.each(images, function(image) {
        layout.put(image);
    });

    callback(undefined, {
        width: options.width,
        height: layout.height,
        images: images
    });
};