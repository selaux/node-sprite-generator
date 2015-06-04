'use strict';

var expect = require('chai').expect,
    _ = require('underscore'),
    horizontal = require('../../../lib/layout/horizontal.js');

describe('Layout/Horizontal', function () {
    var images = [
        { path: 'foo', width: 150, height: 12 },
        { path: 'bar', width: 32, height: 32 },
        { path: 'bla', width: 112, height: 112 }
    ];

    it('should generate the correct layout without any options', function (done) {
        var options = {};

        horizontal(images, options, function (err, layout) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal({});
            expect(layout).to.deep.equal({
                width: 294,
                height: 112,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 150, y: 0 }).extend(images[1]),
                    _({ x: 182, y: 0 }).extend(images[2])
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
            done();
        });
    });

    it('should generate the correct layout when a padding is specified', function (done) {
        var options = { padding: 50 };

        horizontal(images, options, function (err, layout) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal({ padding: 50 });
            expect(layout).to.deep.equal({
                width: 394,
                height: 112,
                images: [
                    _({ x: 0, y: 0 }).extend(images[0]),
                    _({ x: 200, y: 0 }).extend(images[1]),
                    _({ x: 282, y: 0 }).extend(images[2])
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
            done();
        });
    });

    it('should generate the correct layout when a scaling is specified', function (done) {
        var options = { scaling: 0.7 };

        horizontal(images, options, function (err, layout) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal({ scaling: 0.7 });
            expect(layout).to.deep.equal({
                width: 205,
                height: 78,
                images: [
                    { x: 0, y: 0, width: 105, height: 8, path: 'foo' },
                    { x: 105, y: 0, width: 22, height: 22, path: 'bar' },
                    { x: 127, y: 0, width: 78, height: 78, path: 'bla' }
                ]
            });
            expect(layout.images[0]).not.to.equal(images[0]);
            done();
        });
    });

});
