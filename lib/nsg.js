'use strict';

var async = require('async'),
    glob = require('glob'),
    _ = require('underscore'),
    changeDetector = require('./utils/changeDetector'),
    providedLayouts = {
        'diagonal': require('./layout/diagonal'),
        'horizontal': require('./layout/horizontal'),
        'packed': require('./layout/packed'),
        'vertical': require('./layout/vertical')
    },
    providedCompositors = {},
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
} catch (e) {}

function generateSprite(options, callback) {
    var layout,
        stylesheet,
        compositor,
        generatedLayout;


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
    async.map(options.src, glob, function (globError, fileNames) {
        if (globError) {
            callback(globError);
            return;
        }

        // filter duplicates from glob pattern matching
        fileNames = _(fileNames).chain().flatten().uniq().value();

        async.waterfall([
            function (cb) {
                compositor.readImages(fileNames, cb);
            },
            function (images, cb) {
                layout(images, options.layoutOptions, cb);
            },
            function (newLayout, cb) {
                // store layout so it can be used for stylesheet generation
                generatedLayout = newLayout;
                compositor.render(generatedLayout, options.spritePath, options.compositorOptions, cb);
            },
            function (cb) {
                stylesheet(generatedLayout, options.stylesheetPath, options.spritePath, options.stylesheetOptions, cb);
            }
        ], function (pipelineError) {
            if (callback) {
                callback(pipelineError);
            }
        });
    });
}

generateSprite.middleware = function (options) {
    var changes = changeDetector(options);

    return function (req, res, next) {
        changes.detect(function (err, changesDetected) {
            if (changesDetected) {
                generateSprite(options, function () {
                    changes.register(function () {
                        return next(err);
                    });
                });
            } else {
                return next();
            }
        });
    };
};

module.exports = generateSprite;
