'use strict';

module.exports = {
    jimp: require('./jimp')(require('jimp')),
    canvas: require('./browserCanvas')(window) // eslint-disable-line no-undef
};
