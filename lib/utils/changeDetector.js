'use strict';

const Promise = require('bluebird');
const R = require('ramda');

function generateTimestamps(glob, stat, patterns) {
    return Promise.map(patterns, R.unary(glob))
        .then(R.flatten)
        .then(R.uniq)
        .then((fileNames) => Promise.map(fileNames, stat))
        .reduce(
            (timestamps, file) => R.pipe(
                R.ifElse(R.prop('stat'), () => file.stat.mtime.getTime(), R.always(null)),
                R.assoc(file.path, R.__, timestamps)
            )(file),
            {}
        );
}

module.exports = function (dependencies, options) {
    let timestamps;

    const { stat: fsStat, glob } = dependencies;
    const filesToWatch = R.filter(R.identity, options.src.concat([ options.stylesheetPath, options.spritePath ]));
    const stat = R.pipe(
        R.applySpec({
            path: R.identity,
            stat: R.pipe(
                R.unary(fsStat),
                R.unary(Promise.resolve),
                R.invoker(2, 'catch')(err => err.code === 'ENOENT', () => null)
            )
        }),
        Promise.props
    );

    return {
        detect: function () {
            if (!timestamps) {
                return Promise.resolve(true);
            }

            return generateTimestamps(glob, stat, filesToWatch).then((generated) => !R.equals(timestamps, generated));
        },

        register: function () {
            return generateTimestamps(glob, stat, filesToWatch).then((generated) => timestamps = generated).return();
        }
    };
};
