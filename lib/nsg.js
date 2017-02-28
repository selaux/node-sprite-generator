'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    writeFile = Promise.promisify(fs.writeFile),
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
    isNotNull = R.complement(R.isNil),
    defaultOptions = {
        src: [],
        spritePath: null,
        stylesheetPath: null,
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
            spritePath: null,
            prefix: '',
            nameMapping: stylesheetUtils.nameToClass,
            pixelRatio: 1
        }
    };

function generateSprite(userOptions, callback) {
    var options = R.pipe(
            R.merge(defaultOptions),
            R.evolve({
                compositorOptions: R.merge(defaultOptions.compositorOptions),
                layoutOptions: R.merge(defaultOptions.layoutOptions),
                stylesheetOptions: R.merge(defaultOptions.stylesheetOptions)
            }),
            stylesheetUtils.getRelativeSpriteDir
        )(userOptions),
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
                R.when(isNotNull, R.pipe(path.dirname, mkdirp), options.stylesheetPath),
                R.when(isNotNull, R.pipe(path.dirname, mkdirp), options.spritePath)
            );
        })
        .then(function renderStylesheetAndImage(generatedLayout) {
            return Promise.all([
                renderStylesheet(generatedLayout, options.stylesheetOptions),
                renderSprite(generatedLayout, options.spritePath, options.compositorOptions)
            ]);
        })
        .tap(function writeStylesheetAndImage(args) {
            var stylesheet = args[0],
                sprite = args[1];

            return Promise.join(
                R.when(isNotNull, R.partialRight(writeFile, [ stylesheet ]), options.stylesheetPath),
                R.when(isNotNull, R.partialRight(writeFile, [ sprite ]), options.spritePath)
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
