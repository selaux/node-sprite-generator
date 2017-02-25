'use strict';

var Promise = require('bluebird'),
    glob = Promise.promisify(require('glob')),
    mkdirp = Promise.promisify(require('mkdirp')),
    path = require('path'),
    R = require('ramda'),
    changeDetector = require('./utils/changeDetector'),
    stylesheetUtils = require('./utils/stylesheet'),
    providedLayouts = require('./layout'),
    providedCompositors = require('./compositor'),
    providedStylesheets = require('./stylesheet'),
    templatedStylesheet = require('./stylesheet/templatedStylesheet'),
    defaultOptions = {
        src: [],
        spritePath: '',
        stylesheetPath: '',
        layout: 'vertical',
        stylesheet: 'stylus',
        compositor: 'canvas',
        layoutOptions: {
            padding: 0,
            scaling: 1
        },
        compositorOptions: {
            compressionLevel: 6,
            filter: 'all'
        },
        stylesheetOptions: {
            prefix: '',
            nameMapping: stylesheetUtils.nameToClass,
            pixelRatio: 1
        }
    };

function generateSprite(userOptions, callback) {
    var options = R.merge(defaultOptions, userOptions),
        generateLayout = R.propOr(options.layout, options.layout, providedLayouts),
        compositor = R.propOr(options.compositor, options.compositor, providedCompositors),
        renderStylesheet = R.cond([
            [ R.both(R.is(String), R.has(R.__, providedStylesheets)), R.prop(R.__, providedStylesheets) ],
            [ R.is(String), templatedStylesheet ],
            [ R.T, R.identity ]
        ])(options.stylesheet),
        readImages = R.propOr(null, 'readImages', compositor),
        renderSprite = R.propOr(null, 'render', compositor);

    return Promise.map(options.src, R.unary(glob))
        .then(R.flatten)
        .then(R.uniq)
        .then(readImages)
        .then(R.partialRight(generateLayout, [ options.layoutOptions ]))
        .tap(function createTargetDirectories() {
            return Promise.join(
                mkdirp(path.dirname(options.spritePath)),
                mkdirp(path.dirname(options.stylesheetPath))
            );
        })
        .tap(function writeStylesheetAndImage(generatedLayout) {
            return Promise.join(
                renderStylesheet(generatedLayout, options.stylesheetPath, options.spritePath, options.stylesheetOptions),
                renderSprite(generatedLayout, options.spritePath, options.compositorOptions)
            );
        })
        .nodeify(callback);
}

generateSprite.middleware = function (options) {
    var changes = changeDetector(options);

    return function (req, res, next) {
        return changes.detect().then(function (changesDetected) {
            if (changesDetected) {
                return generateSprite(options)
                    .then(changes.register.bind(changes))
                    .then(next);
            }
            return next();
        }).catch(next);
    };
};

module.exports = generateSprite;
