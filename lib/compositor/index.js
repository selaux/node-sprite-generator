'use strict';

module.exports = {
    jimp: require('./jimp')
};

try {
    module.exports.canvas = require('./canvas');
} catch (e) {
    /*eslint no-empty: 0*/
}
try {
    module.exports.gm = require('./gm');
} catch (e) {
    /*eslint no-empty: 0*/
}