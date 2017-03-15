'use strict';

var message = 'You are doing something that is not supported in the browser';

module.exports = function rejectWithNotInBrowser() {
    var callback = Array.prototype.slice.call(arguments).find(function (f) {
        return typeof f === 'function';
    });
    if (callback) {
        return callback(new Error(message));
    } else {
        throw new Error(message);
    }
};