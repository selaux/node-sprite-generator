'use strict';

var expect = require('chai').expect,
    R = require('ramda');

function testStylesheetGeneration(generator, layout, expected, options) {
    var expectedOptions = R.clone(options);

    return generator(layout, options).then(function (stylesheet) {
        expect(options).to.deep.equal(expectedOptions);
        expect(stylesheet).to.equal(expected.toString());
    });

}

module.exports = function (name, expected, additionalTests) {
    var R = require('ramda'),
        path = require('path'),
        nameToClass = require('../../../lib/utils/stylesheet').nameToClass,
        stylesheetGenerator = require('../../../lib/stylesheet')[name],
        defaultOptions = R.merge({
            prefix: '',
            nameMapping: nameToClass,
            spritePath: './images/png/sprite.png',
            pixelRatio: 1
        });

    describe('Stylesheet/' + name, function () {
        var layout = {
                width: 150,
                height: 156,
                images: [
                    { path: '/bla/foo.png', x: 0, y: 0, width: 150, height: 12 },
                    { path: '/foo/bar.png', x: 0, y: 12, width: 150, height: 24 },
                    { path: '/images/test.png', x: 0, y: 36, width: 150, height: 12 }
                ]
            };

        it('should generate the correct ' + name + ' with a prefix specified', function () {
            return testStylesheetGeneration(stylesheetGenerator, layout, expected.prefix, defaultOptions({ prefix: 'prefix-' }));
        });

        it('should generate the correct ' + name + ' with a custom nameMapping specified', function () {
            var nameMapping = function (imagePath) {
                    return path.basename(imagePath, path.extname(imagePath)).split('').reverse().join('');
                };
            return testStylesheetGeneration(stylesheetGenerator, layout, expected.nameMapping, defaultOptions({ nameMapping: nameMapping }));
        });

        it('should generate the correct ' + name + ' with a pixelRatio specified', function () {
            return testStylesheetGeneration(stylesheetGenerator, layout, expected.pixelRatio, defaultOptions({ pixelRatio: 2 }));
        });

        if (additionalTests) {
            additionalTests();
        }
    });
};
module.exports.testStylesheetGeneration = testStylesheetGeneration;
