'use strict';

var Promise = require('bluebird'),
    _ = require('underscore');

module.exports = function createCanvasCompositor(window) {
    function readImage(rawImg) {
        const image = new window.Image();

        return new Promise(function (resolve, reject) {
            image.onload = function () {
                resolve({
                    path: rawImg.path,
                    width: image.width,
                    height: image.height,
                    data: image
                });
            };
            image.onerror = function (e) {
                reject(e);
            };
            image.src = window.URL.createObjectURL(new window.Blob([rawImg.data]));
        });
    }

    function renderSprite(layout) {
        const canvasEl = window.document.createElement('canvas');

        canvasEl.width = layout.width;
        canvasEl.height = layout.height;

        const ctx = canvasEl.getContext('2d');

        // render images to canvas
        _(layout.images).each(function (image) {
            ctx.drawImage(image.data, image.x, image.y, image.width, image.height);
        });

        return Promise.fromCallback(function (callback) {
            canvasEl.toBlob((blob) => {
                const reader = new window.FileReader();
                reader.onloadend = () => callback(null, new Uint8Array(reader.result));
                reader.readAsArrayBuffer(blob);
            });
        });
    }

    return {
        readImage: readImage,
        render: renderSprite
    };
};
