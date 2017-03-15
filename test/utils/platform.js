'use strict';

var R = require('ramda');

module.exports = {
    inNode: function (func) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof window === 'undefined') {
            func.apply(null, R.tail(args));
        }
    }
};