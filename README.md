# node-sprite-generator

Generates image sprites and their stylesheets from sets of images. Development is at a very early stage and APIs are subject to change.

## Installation

Note: __Cairo__ needs to be installed because [node-canvas](https://github.com/LearnBoost/node-canvas) depends on it. For more information how to do this on your system go to the [node-canvas page](https://github.com/LearnBoost/node-canvas/wiki/_pages).

```bash
npm install node-sprite-generator
```

## Usage

### Standalone

```javascript
var nsg = require('node-sprite-generator');

nsg({
    src: [
        'images/sprite/1.png',
        'images/sprite/2.png'
    ],
    spritePath: 'images/sprite.png',
    stylesheetPath: 'stylus/sprite.styl'
});
```

This will generate a sprite.png file and the corresponding stylus stylesheet, with can then be included from your stylus files.

### With express.jss

node-sprite-generator provides a middleware to use with [express.js](https://github.com/visionmedia/express).

```javascript
var nsg = require('node-sprite-generator'),
    express = require('express'),
    app = express();
    
app.use(nsg.middleware({
    src: [
        'images/sprite/1.png',
        'images/sprite/2.png'
    ],
    spritePath: 'images/sprite.png',
    stylesheetPath: 'stylus/sprite.styl'
}));
```

Make sure that the node-sprite-generator middleware is used before any css preprocessors that use the generated stylesheet.

### With grunt

TODO

## Options

node-sprite-generator tries to be very modular, so you can use the options we provide or write your own functions/modules to further customize your sprites.

#### options.src
Type: `String`
Default value: `[]`  
Specifies the images that will be combined to the sprite.

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
Specifies the stylesheet generator (and therefore the format) that is used. The built-in formats are `'stylus'` and `'css'`. You can also specify a function that writes a custom stylesheet (see more at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator)).

#### options.stylesheetOptions
Type: `Object`
Default value: `'{}'`  
Options that will be passed on to the stylesheet generator. The built-in stylesheet generators support the following options:  
&nbsp;&nbsp;&nbsp;&nbsp;__prefix__ (Type: `String` Default: `''`): A prefix that will be prepended to all classes/functions that are generated  
&nbsp;&nbsp;&nbsp;&nbsp;__nameMapping__ (Type: `Function` Default: Filename): A function that specifies how filenames are mapped to class names in the stylesheet  
&nbsp;&nbsp;&nbsp;&nbsp;__spritePath__ (Type: `String` Default: Relative Path): Defines which URL is used as the image path for the image sprite.

#### options.layout
Type: `String|Function`
Default value: `'vertical'`  
The layout that is used to generate the sprite. The built-in layouts are `'vertical'`, `'horizontal'` and `'diagonal'`. You can also specify a function that generates a custom layout  (see more at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator)).

#### options.layoutOptions
Type: `Object`
Default value: `{}`  
Options that will be passed on to the layout generation. The built-in layouters support the following options.  
&nbsp;&nbsp;&nbsp;&nbsp;__padding__ (Type: `Integer` Default: `0`): Specifies the padding between the images in the layout. 

#### options.compositor
Type: `String|Function`
Default value: `'canvas'`  
If you don't want node-canvas to read and render the images, you can specify your own module that implements this functionality. Have a look at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator) to see how it's done.

#### options.compositorOptions
Type: `Object`
Default value: `{}`  
Options that will be passed on to the compositor. ATM the built-in compositor does not support any options.

## A more advanced example

```javascript
var nsg = require('node-sprite-generator');

nsg({
    src: [
        'images/all-icons/home.png',
        'images/all-icons/profile.png'
    ],
    spritePath: 'images/all-icons.png',
    stylesheetPath: 'stylus/all-icons.css',
    layout: 'diagonal',
    layoutOptions: {
        padding: 30
    },
    stylesheet: 'css',
    stylesheetOptions: {
        prefix: 'all-icons',
        spritePath: 'http://static.your-server.org/images/all-icons.png'
    }
});
```

This will generate a diagonally layouted sprite that can be accessed using classes like ```all-icons-home```. The sprite will then be loaded from your static asset server.

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

## License

(The MIT License)

Copyright (c) 2013 Stefan Lau <github@stefanlau.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.