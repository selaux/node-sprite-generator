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
    defaults = {
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
            spriteUrl: null,
            pixelRatio: 1
        }
    };

function generateSprite(options, callback) {
    var layout,
        stylesheet,
        compositor;

    options = R.merge(defaults, options);

    // require the files if they are provided as strings
    layout = R.propOr(options.layout, options.layout, providedLayouts);
    compositor = R.propOr(options.compositor, options.compositor, providedCompositors);
    stylesheet = R.cond([
        [ R.both(R.is(String), R.has(R.__, providedStylesheets)), R.prop(R.__, providedStylesheets) ],
        [ R.is(String), templatedStylesheet ],
        [ R.T, R.identity ]
    ])(options.stylesheet);

    if (!compositor) {
        return callback(new Error('Either you defined a bad compositor or you dont have the correct dependencies installed.'));
    }

    // do glob pattern matching
    return Promise.map(options.src, function (pattern) {
        return glob(pattern);
    }).then(function (fileNames) {
        // filter duplicates from glob pattern matching
        fileNames = R.pipe(R.flatten, R.uniq)(fileNames);

        return compositor.readImages(fileNames)
            .then(function generateLayout(images) {
                return layout(images, options.layoutOptions);
            })
            .tap(function createTargetDirectories() {
                return Promise.join(
                    mkdirp(path.dirname(options.spritePath)),
                    mkdirp(path.dirname(options.stylesheetPath))
                );
            })
            .tap(function writeStylesheetAndImage(generatedLayout) {
                return Promise.join(
                    stylesheet(generatedLayout, options.stylesheetPath, options.spritePath, options.stylesheetOptions),
                    compositor.render(generatedLayout, options.spritePath, options.compositorOptions)
                );
            });
    }).nodeify(callback);
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
