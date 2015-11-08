'use strict';

var Promise = require('bluebird'),
    glob = Promise.promisify(require('glob')),
    mkdirp = Promise.promisify(require('mkdirp')),
    path = require('path'),
    _ = require('underscore'),
    changeDetector = require('./utils/changeDetector'),
    providedLayouts = {
        diagonal: require('./layout/diagonal'),
        horizontal: require('./layout/horizontal'),
        packed: require('./layout/packed'),
        vertical: require('./layout/vertical')
    },
    providedCompositors = {
        jimp: require('./compositor/jimp')
    },
    defaults = {
        src: [],
        spritePath: '',
        stylesheetPath: '',
        layout: 'vertical',
        stylesheet: 'stylus',
        compositor: 'canvas',
        layoutOptions: {},
        compositorOptions: {},
        stylesheetOptions: {}
    };

try {
    providedCompositors.canvas = require('./compositor/canvas');
} catch (e) {
    defaults.compositor = 'gm';
}
try {
    providedCompositors.gm = require('./compositor/gm');
} catch (e) {
    /*eslint no-empty: 0*/
}

function generateSprite(options, callback) {
    var layout,
        stylesheet,
        compositor;


    options = options || {};

    options = _.extend({}, defaults, options);

    // require the files if they are provided as strings
    layout = _.isString(options.layout) ? providedLayouts[options.layout] : options.layout;
    compositor = _.isString(options.compositor) ? providedCompositors[options.compositor] : options.compositor;

    if (_.isString(options.stylesheet)) {
        try {
            stylesheet = require('./stylesheet/' + options.stylesheet);
        } catch (e) {
            stylesheet = require('./stylesheet/templatedStylesheet')(options.stylesheet);
        }
    } else {
        stylesheet = options.stylesheet;
    }

    if (!compositor) {
        return callback(new Error('Either you defined a bad compositor or you dont have the correct dependencies installed.'));
    }

    // do glob pattern matching
    return Promise.map(options.src, function (pattern) {
        return glob(pattern);
    }).then(function (fileNames) {
        // filter duplicates from glob pattern matching
        fileNames = _(fileNames).chain().flatten().uniq().value();

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
