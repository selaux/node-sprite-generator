module.exports = (function () {
	'use strict';

	var async = require('async'),
		path = require('path'),
		_ = require('underscore');

	function generateSprite(options, callback) {
		var defaults = {
				src: [],
				spritePath: '',
				stylesheetPath: '',
				layout: 'vertical',
				stylesheet: 'stylus',
				compositor: 'canvas',
				layoutOptions: {},
				compositorOptions: {},
				stylesheetOptions: {}
			},
			layout,
			stylesheet,
			compositor,
			generatedLayout;


		options = options || {};
		callback = callback || function () {};

		_.defaults(options, defaults);

		// require the files if they are provided as strings
		layout = _.isString(options.layout) ? require(path.join(__dirname + '/layout', options.layout)) : options.layout;
		compositor = _.isString(options.compositor) ? require(path.join(__dirname + '/compositor', options.compositor)) : options.compositor;
		stylesheet = _.isString(options.stylesheet) ? require(path.join(__dirname + '/stylesheet', options.stylesheet)) : options.stylesheet;


		async.waterfall([
			function (callback) {
				compositor.readImages(options.src, callback);
			},
			function (images, callback) {
				layout(images, options.layoutOptions, callback);
			},
			function (newLayout, callback) {
				generatedLayout = newLayout;
				compositor.render(generatedLayout, options.spritePath, options.outputOptions, callback);
			},
			function (callback) {
				stylesheet(generatedLayout, options.stylesheetPath, options.spritePath, options.stylesheetOptions, callback);
			}
		], function (err) {
			callback(err);
		});
	}

	generateSprite.middleware = function (options) {
		return function (req, res, next) {
			generateSprite(options, next);
		};
	};

	return generateSprite;

}());