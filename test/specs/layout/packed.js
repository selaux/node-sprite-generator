'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),
    packed = require('../../../lib/layout/packed.js');

describe('Layout/Packed', function () {
    var images = [
        { path: 'foo', width: 20, height: 20, data: 'image1' },
        { path: 'bar', width: 10, height: 10, data: 'image2' },
        { path: 'bla', width: 10, height: 10, data: 'image3' }
    ];

    it('should generate the correct layout when a padding is specified', function () {
        var options = { scaling: 1, padding: 10 };

        return packed(images, options).then(function (layout) {
            expect(layout).to.deep.equal({
                width: 50,
                height: 50,
                images: [
                    _({ x: 5, y: 5 }).extend(images[0]),
                    _({ x: 35, y: 5 }).extend(images[1]),
                    _({ x: 5, y: 35 }).extend(images[2])
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
        });
    });

    it('should generate the correct layout when a scaling is specified', function () {
        var options = { scaling: 0.5, padding: 0 };

        return packed(images, options).then(function (layout) {
            expect(layout).to.deep.equal({
                width: 15,
                height: 10,
                images: [
                    _.extend({}, images[0], { x: 0, y: 0, width: 10, height: 10 }),
                    _.extend({}, images[1], { x: 10, y: 0, width: 5, height: 5 }),
                    _.extend({}, images[2], { x: 10, y: 5, width: 5, height: 5 })
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
        });
    });

});
