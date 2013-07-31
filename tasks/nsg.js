'use strict';

var nsg = require('../lib/nsg');

module.exports = function(grunt) {

    grunt.registerMultiTask('spriteGenerator', 'Generates image sprites and their stylesheets from sets of images.', function() {
        var done = this.async();

        this.files.forEach(function(f) {

            nsg(f, function (err) {
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