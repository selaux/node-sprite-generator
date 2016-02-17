'use strict';

var path = require('path'),
    pathWin;

if (path.win32) {
    module.exports = path.win32;
}
else {
    /* Fallback for older node (<= 0.10), which does not have path.win32.
       We emulate relative()'s behavior on Windows by simply replace slashes by
       backspace. */

    // Create new object with functions of `path` not to break the original module.

    pathWin = Object.create(path),

    pathWin.sep = '\\';

    pathWin.relative = function() {
        var relative = path.relative.apply(this, arguments),
            backslashedRelative = relative.replace(/\//g, '\\');

        return backslashedRelative;
    };

    module.exports = pathWin;
}

