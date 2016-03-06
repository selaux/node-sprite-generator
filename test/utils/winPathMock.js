'use strict';

var path = require('path'),
    pathWin;

function processArgs() {
    // Replace all backslashes in arguments by slashes, so that posix-path
    // module method can handle Windows style path.

    var args = Array.prototype.slice.call(arguments);
    args = args.map(function(p) {
        if (typeof p !== 'string') {
            return p;
        }
        return p.replace(/\\/g, '/');
    });

    return args;
}

function processReturn(ret) {
    // Replace slashes by slash, so that the returned value turned into
    // Windows style path.

    return ret.replace(/\//g, '\\');
}

function wrap(fn) {
    return function() {
        var processedArgs = processArgs.apply(this, arguments),
            ret = fn.apply(this, processedArgs);

        return processReturn(ret);
    };
}

if (path.win32) {
    module.exports = path.win32;
}
else {
    // Fallback for older node (<= 0.10), which does not have path.win32.
    // We emulate relative()'s behavior on Windows by simply replace slashes by
    // backspace.

    // Create new object with functions of `path` not to break the original one.
    pathWin = Object.create(path),
    pathWin.sep = '\\';

    pathWin.dirname = wrap(path.dirname);
    pathWin.resolve = wrap(path.resolve);
    pathWin.relative = wrap(path.relative);

    module.exports = pathWin;
}
