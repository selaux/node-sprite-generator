# Changelog

#### 0.10.2
- fixes sprite path when using Windows

#### 0.10.1
- fixes target directories not being created if they don't exist

#### 0.10.0
- adds pure-javascript compositor jimp that has no native dependencies
- adds support for node 4.x and 5.x

#### 0.9.0
- adds support for box-packing layout (`packed`)
- adds support for node 0.12 and iojs
- removes support for node 0.8 (though it might still work)
- fix error in documentation regarding using a custom stylesheet template

#### 0.8.1
- fix less variables being strings instead of numbers

#### 0.8.0
- adds additional mixins to spritesheets (sprite-position, sprite-width, etc.)
- adds support for global grunt task options
- adds support to scale images before generating sprites and spritesheets

#### 0.7.0
- adds support for templatePath in stylesheetOptions

#### 0.6.0
- adds support for prefixed-css
- fix issues with errors being absorbed before callbacks

#### 0.5.0
- **BREAKING CHANGE**: prefixes are not prepended with a hyphen (`-`) anymore (`prefix-sprite` will become `prefixsprite`)
- adds support for scss syntax

#### 0.4.0
- adds png filter parameter
- fixes sass support

#### 0.3.1
- fix "Fatal error: spawn EMFILE" issue with too many open files for large sprites
- fixes compositor options not being passed to the compositor (oops)
- fixes compression level for gm compositor

#### 0.3.0
- adds sass support
- adds less support

#### 0.2.1
- fixes default options leaking into options objects
- replaces occurences of "0px" in stylesheets with "0"

#### 0.2.0
- adds gm compositor to provide an alternative where node-canvas cannot be installed
- adds pixelRatio stylesheet option to allow to downscale sprites for retina displays
- adds compressionLevel compositor option to allow to set the image quality for the generated sprite image

#### 0.1.0
- Initial Release
