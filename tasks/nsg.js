'use strict';

var nsg = require('../lib/nsg'),
    _ = require('underscore');

module.exports = function(grunt) {

    grunt.registerMultiTask('spriteGenerator', 'Generates image sprites and their stylesheets from sets of images.', function() {
        var done = this.async(),
            options = this.options();

        this.files.forEach(function(f) {

            options = _.extend({}, options, f);
            nsg(options, function (err) {
                if (err) {
                    grunt.log.error('Failed to generate sprite ' + err);
                    return done(false);
                }

                grunt.log.writeln('Sprite "' + f.spritePath + '"and Stylesheet "' + f.stylesheetPath + '" created.');
                return done();
            });

        });
    });

};
