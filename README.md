# node-sprite-generator

[![NPM Version](https://img.shields.io/npm/v/node-sprite-generator.svg?style=flat-square)](https://www.npmjs.org/package/node-sprite-generator)
[![Build Status](https://img.shields.io/travis/selaux/node-sprite-generator/master.svg?style=flat-square)](https://travis-ci.org/selaux/node-sprite-generator)
[![Coverage Status](https://img.shields.io/coveralls/selaux/node-sprite-generator/master.svg?style=flat-square)](https://coveralls.io/r/selaux/node-sprite-generator?branch=master)
[![Dependencies](https://img.shields.io/david/selaux/node-sprite-generator.svg?style=flat-square)](https://david-dm.org/selaux/node-sprite-generator)

Generates image sprites and their spritesheets (css, stylus, sass, scss or less) from sets of images. Supports retina sprites. Provides express middleware and grunt task.

## Installation

```bash
npm install node-sprite-generator
```

Note:
node-sprite-generator cen either use native libraries or pure javascript to build sprites which requires no native dependencies. To use the pure javascript compositor use `'jimp'` as the compositor module.

- __Cairo__ needs to be installed when using the `'canvas'` compositor because [node-canvas](https://github.com/LearnBoost/node-canvas) depends on it. For more information how to do this on your system go to the [node-canvas page](https://github.com/LearnBoost/node-canvas/wiki/_pages). If you have issues installing node-canvas on OSX, please read [Issue 23](https://github.com/selaux/node-sprite-generator/issues/23).
- __ImageMagick/GraphicsMagick__ needs to be installed when using the `'gm'` compositor

## Usage

### Standalone

```javascript
var nsg = require('node-sprite-generator');

nsg({
    src: [
        'images/sprite/*.png'
    ],
    spritePath: 'images/sprite.png',
    stylesheetPath: 'stylus/sprite.styl'
}, function (err) {
    console.log('Sprite generated!');
});
```

This will generate a sprite.png file and the corresponding stylus stylesheet, with can then be included from your stylus files.

### With express.js

node-sprite-generator provides a middleware to use with [express.js](https://github.com/visionmedia/express).

```javascript
var nsg = require('node-sprite-generator'),
    express = require('express'),
    app = express();

app.use(nsg.middleware({
    src: [
        'images/sprite/*.png'
    ],
    spritePath: 'images/sprite.png',
    stylesheetPath: 'stylus/sprite.styl'
}));
```

Make sure that the node-sprite-generator middleware is used before any css preprocessors that use the generated stylesheet.

### With grunt

node-sprite-generator also provides a grunt plugin. It takes the same options as the other two methods.

```javascript
module.exports = function (grunt)  {

    grunt.initConfig({

        spriteGenerator: {
            sprite: {
                src: [
                    'images/sprite/*.png'
                ],
                spritePath: 'images/sprite.png',
                stylesheetPath: 'stylus/sprite.styl'
            }
        }

    });

    grunt.loadNpmTasks('node-sprite-generator');
};
```

## Options

node-sprite-generator tries to be very modular, so you can use the options we provide or write your own functions/modules to further customize your sprites.

#### options.src
Type: `String`
Default value: `[]`  
Specifies the images that will be combined to the sprite. node-sprite-generator uses glob pattern matching, so paths with wildcards are valid as well.

#### options.spritePath
Type: `String`
Default value: `''`  
The path your image sprite will be written to. ATM we only support the PNG format for the image sprite.

#### options.stylesheetPath
Type: `String`
Default value: `''`  
The path your stylesheet will be written to.

#### options.stylesheet
Type: `String|Function`
Default value: `'stylus'`  
Specifies the sylesheet generator (and therefore the stylesheet format) that is used either by using one of the built-in formats or specifying a path to a custom template. It is also possible to specify a function that writes a custom stylesheet (see more at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator)).

Built-in formats: 
- `'stylus'`: https://learnboost.github.io/stylus/
- `'less'`: http://lesscss.org/
- `'sass'`, `'scss'`: http://sass-lang.com/
- `'css'`: http://www.w3.org/Style/CSS/
- `'prefixed-css'`: A version of `'css'` that generates a smaller stylesheet but requires the use of the `'prefix'` stylesheet option

#### options.stylesheetOptions
Type: `Object`
Default value: `'{}'`  
Options that will be passed on to the stylesheet generator. The built-in stylesheet generators support the following options:  
__prefix__ (Type: `String` Default: `''`): A prefix that will be prepended to all classes/functions that are generated  
__nameMapping__ (Type: `Function` Default: Filename): A function that specifies how filenames are mapped to class names in the stylesheet  
__spritePath__ (Type: `String` Default: Relative Path): Defines which URL is used as the image path for the image sprite.  
__pixelRatio__ (Type: `Integer` Default: `1`): Specifies the pixelRatio for retina sprites.  

#### options.layout
Type: `String|Function`
Default value: `'vertical'`  
Specifies the layout that is used to generate the sprite by using one of the built-in layouts or using a function that generates a custom layout (see more at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator)).

Built-in layouts:
- `'packed'`: Bin-packing Layout
- `'vertical'`: Vertically aligned layout
- `'horizontal'`: Horizontally aligned layout
- `'diagonal'`: Diagonally aligned layout

#### options.layoutOptions
Type: `Object`
Default value: `{}`  
Options that will be passed on to the layout generation. The built-in layouters support the following options.  
__padding__ (Type: `Integer` Default: `0`): Specifies the padding between the images in the layout.  
__scaling__ (Type: `Number` Default: `1`): Specifies the factor that the images are scaled with in the layout. This allows generating multiple, scaled versions of the same sprites using a single image set.  

#### options.compositor
Type: `String|Function`
Default value: `'canvas'`  
The compositor is used to read and render the images. Your can use one of the built-in options or specify your own module that implements this functionality. Have a look at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator) to see how it's done.

Built-in compositors:
- `'canvas'`: Uses [libcairo](http://cairographics.org/). If you have issues installing node-canvas on OSX, please read [Issue 23](https://github.com/selaux/node-sprite-generator/issues/23).
- `'gm'`: Uses [GraphicsMagick](http://www.graphicsmagick.org/)/[ImageMagick](http://www.imagemagick.org/) 
- `'jimp'`: [A pure javascript compositor](https://github.com/oliver-moran/jimp)

#### options.compositorOptions
Type: `Object`
Default value: `{}`  
Options that will be passed on to the compositor. The built-in compositor supports the following options:  
__compressionLevel__ (Type: `Integer` Default: `6`): Specifies the compression level for the generated png file (compression levels range from 0-9).  
__filter__ (Type: `String` Default: `all`): Specifies the filter used for the generated png file. Possible values: `all`, `none`, `sub`, `up`, `average`, `paeth`.

## A more advanced example

```javascript
var nsg = require('node-sprite-generator');

nsg({
    src: [
        'public/images/sprite/*.png'
    ],
    spritePath: 'public/images/all-icons.png',
    stylesheetPath: 'public/stylesheets/all-icons.css',
    layout: 'diagonal',
    layoutOptions: {
        padding: 30
    },
    stylesheet: 'app/assets/sprites/template.tpl',
    stylesheetOptions: {
        prefix: 'all-icons',
        spritePath: 'http://static.your-server.org/images/all-icons.png',
        pixelRatio: 2
    }
});
```

This will generate a diagonally layouted retina-enabled sprite that can be accessed using classes like ```all-icons-home```. The sprite will then be loaded from your static asset server.

## Extending node-sprite-generator

The internal pipeline for node-sprite-generator is

 - ```compositor.readImages(files, callback)``` -> ```callback(error, images)```
 - ```layout(images, options, callback)``` -> ```callback(error, layout)```
 - ```compositor.render(layout, spritePath, options, callback)``` -> ```callback(error)```
 - ```stylesheet(layout, stylesheetPath, spritePath, options, callback)``` -> ```callback(error)```

The used data formats are:

#### images
```
var images = [
   {
       width: Integer,
       height: Integer,
       data: compositor-specific
   }
]
```

#### layout
```
var layout = {
    width: Integer,
    height: Integer,
    images: [
        {
            x: Integer,
            y: Integer,
            width: Integer,
            height: Integer,
            data: compositor-specific
        }
    ]
}
```

For more information of how to write your own modules/functions have a look at the existing ones :-D.

## Changelog

See [CHANGELOG.md](https://github.com/selaux/node-sprite-generator/blob/master/CHANGELOG.md)

## License

(The MIT License)

Copyright (c) 2013 Stefan Lau <github@stefanlau.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
