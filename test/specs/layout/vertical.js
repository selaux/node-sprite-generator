'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),
    vertical = require('../../../lib/layout/vertical.js');

describe('Layout/Vertical', function () {
    var images = [
        { path: 'foo', width: 150, height: 12 },
        { path: 'bar', width: 32, height: 32 },
        { path: 'bla', width: 112, height: 112 }
    ];

    it('should generate the correct layout without any options', function () {
        var options = {};

        return vertical(images, {}).then(function (layout) {
            expect(options).to.deep.equal({});
            expect(layout).to.deep.equal({
                width: 150,
                height: 156,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 0, y: 12 }).extend(images[1]),
                    _({ x: 0, y: 44 }).extend(images[2])
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
        });
    });

    it('should generate the correct layout when a padding is specified', function () {
        var options = { padding: 50 };

        return vertical(images, { padding: 50 }).then(function (layout) {
            expect(options).to.deep.equal({ padding: 50 });
            expect(layout).to.deep.equal({
                width: 150,
                height: 256,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 0, y: 62 }).extend(images[1]),
                    _({ x: 0, y: 144 }).extend(images[2])
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
        });
    });

    it('should generate the correct layout when a scaling is specified', function () {
        var options = { scaling: 0.7 };

        return vertical(images, options).then(function (layout) {
            expect(options).to.deep.equal({ scaling: 0.7 });
            expect(layout).to.deep.equal({
                width: 105,
                height: 108,
                images: [
                    { x: 0, y: 0, width: 105, height: 8, path: 'foo' },
                    { x: 0, y: 8, width: 22, height: 22, path: 'bar' },
                    { x: 0, y: 30, width: 78, height: 78, path: 'bla' }
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
        });
    });

});
