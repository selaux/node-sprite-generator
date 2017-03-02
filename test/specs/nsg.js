'use strict';

var fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    R = require('ramda'),
    _ = require('underscore'),
    resemble = require('node-resemble-v2'),
    expect = require('chai').expect,
    mkdirp = require('mkdirp'),
    nsg = require('../../lib/nsg'),
    providedCompositors = require('../../lib/compositor'),
    providedLayouts = require('../../lib/layout'),
    providedStylesheets = require('../../lib/stylesheet'),
    stylesheetUtils = require('../../lib/utils/stylesheet');

require('sinon-as-promised');

describe('NSG', function () {
    function mergeDefaultOptions(options) {
        return R.merge({
            src: [ __filename ],
            compositor: { readImage: sinon.stub().resolves({}), render: sinon.stub().resolves() },
            layout: sinon.stub().resolves([]),
            stylesheet: sinon.stub().resolves()
        }, options);
    }

    it('should pass on default options to compositor, layout and stylesheet', function () {
        var options = mergeDefaultOptions({});

        return nsg(options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledOnce;
            expect(options.compositor.readImage).to.have.been.calledWith(__filename);
            expect(options.compositor.render).to.have.been.calledOnce;
            expect(options.compositor.render).to.have.been.calledWith([], null, { filter: 'all', compressionLevel: 6 });

            expect(options.layout).to.have.been.calledOnce;
            expect(options.layout).to.have.been.calledWith([ {} ], { padding: 0, scaling: 1 });

            expect(options.stylesheet).to.have.been.calledOnce;
            expect(options.stylesheet).to.have.been.calledWith(
                [],
                { spritePath: null, nameMapping: stylesheetUtils.nameToClass, prefix: '', pixelRatio: 1 }
            );
        });
    });

    it('should pass on custom options to compositor, layout and stylesheet', function () {
        var options = mergeDefaultOptions({
            compositorOptions: { filter: 'none' },
            layoutOptions: { padding: 50 },
            stylesheetOptions: { spritePath: 'abc', prefix: 'test' }
        });

        return nsg(options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledOnce;
            expect(options.compositor.readImage).to.have.been.calledWith(__filename);
            expect(options.compositor.render).to.have.been.calledOnce;
            expect(options.compositor.render).to.have.been.calledWith([], null, { filter: 'none', compressionLevel: 6 });

            expect(options.layout).to.have.been.calledOnce;
            expect(options.layout).to.have.been.calledWith([ {} ], { padding: 50, scaling: 1 });

            expect(options.stylesheet).to.have.been.calledOnce;
            expect(options.stylesheet).to.have.been.calledWith(
                [],
                { spritePath: 'abc', nameMapping: stylesheetUtils.nameToClass, prefix: 'test', pixelRatio: 1 }
            );
        });
    });

    it('should use default compositors, layout and stylesheet functions', sinon.test(function (done) {
        this.stub(providedCompositors.canvas, 'readImage').resolves([]);
        this.stub(providedCompositors.canvas, 'render').resolves();
        this.stub(providedLayouts, 'vertical').resolves({ width: 0, height: 0, images: [] });
        this.stub(providedStylesheets, 'stylus').resolves();

        nsg({ src: [ __filename ] }).then(function () {
            expect(providedCompositors.canvas.readImage).to.have.been.calledOnce;
            expect(providedCompositors.canvas.render).to.have.been.calledOnce;
            expect(providedLayouts.vertical).to.have.been.calledOnce;
            expect(providedStylesheets.stylus).to.have.been.calledOnce;
        }).nodeify(done);
    }));

    it('should pass the relative sprite to the stylesheet if it is not set manually', sinon.test(function () {
        var stubs = {
                writeFile: sinon.stub().yieldsAsync(),
                mkdirp: sinon.stub().yieldsAsync()
            },
            nsgProxy = proxyquire('../../lib/nsg', {
                mkdirp: stubs.mkdirp,
                fs: { writeFile: stubs.writeFile }
            }),
            options = mergeDefaultOptions({
                spritePath: 'test/sprite/path/sprite.png',
                stylesheetPath: 'test/styl/sprite.styl'
            });

        return nsgProxy(options).then(function () {
            expect(options.stylesheet).to.have.been.calledWithMatch([], {
                spritePath: '../sprite/path/sprite.png'
            });
        });
    }));

    it('should create stylesheet path and write stylesheet if specified', function () {
        var stubs = {
                writeFile: sinon.stub().yieldsAsync(),
                mkdirp: sinon.stub().yieldsAsync()
            },
            nsgProxy = proxyquire('../../lib/nsg', {
                mkdirp: stubs.mkdirp,
                fs: { writeFile: stubs.writeFile }
            }),
            options = mergeDefaultOptions({
                stylesheetPath: 'test/styl/sprite.styl'
            });

        options.stylesheet.resolves('my data');

        return nsgProxy(options).then(function () {
            expect(stubs.mkdirp).to.have.been.calledOnce;
            expect(stubs.mkdirp).to.have.been.calledWith('test/styl');

            expect(stubs.writeFile).to.have.been.calledOnce;
            expect(stubs.writeFile).to.have.been.calledWith('test/styl/sprite.styl', 'my data');
        });
    });

    it('should create sprite path and write sprite if specified', function () {
        var stubs = {
                writeFile: sinon.stub().yieldsAsync(),
                mkdirp: sinon.stub().yieldsAsync()
            },
            nsgProxy = proxyquire('../../lib/nsg', {
                mkdirp: stubs.mkdirp,
                fs: { writeFile: stubs.writeFile }
            }),
            options = mergeDefaultOptions({
                spritePath: 'test/sprite/path/sprite.png'
            });

        options.compositor.render.resolves('my sprite data');

        return nsgProxy(options).then(function () {
            expect(stubs.mkdirp).to.have.been.calledOnce;
            expect(stubs.mkdirp).to.have.been.calledWith('test/sprite/path');

            expect(stubs.writeFile).to.have.been.calledOnce;
            expect(stubs.writeFile).to.have.been.calledWith('test/sprite/path/sprite.png', 'my sprite data');
        });
    });

    it('should use a builtin compositor, stylesheet and layout when specified', sinon.test(function (done) {
        this.stub(providedCompositors.gm, 'readImage').resolves([]);
        this.stub(providedCompositors.gm, 'render').resolves();
        this.stub(providedLayouts, 'horizontal').resolves({ width: 0, height: 0, images: [] });
        this.stub(providedStylesheets, 'css').resolves();

        nsg({
            src: [ __filename ],
            compositor: 'gm',
            layout: 'horizontal',
            stylesheet: 'css'
        }).then(function () {
            expect(providedCompositors.gm.readImage).to.have.been.calledOnce;
            expect(providedCompositors.gm.render).to.have.been.calledOnce;
            expect(providedLayouts.horizontal).to.have.been.calledOnce;
            expect(providedStylesheets.css).to.have.been.calledOnce;
        }).nodeify(done);
    }));

    it('should use a provided string for stylesheet as a template', sinon.test(function (done) {
        var options = mergeDefaultOptions({ stylesheet: 'test template' });

        options.layout.resolves({ images: [] });

        nsg(options).spread(function (stylesheet) {
            expect(stylesheet).to.equal('test template');
        }).nodeify(done);
    }));
});

describe('NSG functional tests', function () {
    var imagePaths = [
            'test/fixtures/images/src/house.png',
            'test/fixtures/images/src/lena.jpg',
            'test/fixtures/images/src/lock.png'
        ],
        basePath = 'build/test/output/',
        stylesheetPath = path.join(basePath, 'stylesheet.styl'),
        expectedStylesheetPath = 'test/fixtures/stylesheets/stylus/nsg-test.styl',
        spritePath = path.join(basePath, 'sprite.png'),
        expectedSpritePath = 'test/fixtures/images/expected/nsg.png';

    function testSpriteGenerationWithOptions(options, done) {
        var expectedOptions,
            defaults = {
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            };

        options = _.extend({}, defaults, options);
        expectedOptions = _.clone(options);

        nsg(options, function (err) {
            expect(err).not.to.be.ok;
            expect(options).to.deep.equal(expectedOptions);

            expect(fs.readFileSync(expectedStylesheetPath).toString()).to.equal(fs.readFileSync(stylesheetPath).toString());
            resemble(expectedSpritePath).compareTo(spritePath).ignoreColors().onComplete(function(result) {
                expect(result).to.have.property('isSameDimensions', true);
                expect(result).to.have.property('rawMisMatchPercentage').that.is.lessThan(0.5);
                done();
            });
        });
    }

    this.timeout(10000);

    beforeEach(function (done) {
        function executeAndIgnoreEnoent(fn) {
            try {
                fn();
            } catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
            }
        }

        executeAndIgnoreEnoent(fs.unlinkSync.bind(null, stylesheetPath));
        executeAndIgnoreEnoent(fs.unlinkSync.bind(null, spritePath));
        executeAndIgnoreEnoent(fs.rmdirSync.bind(null, basePath));

        mkdirp(basePath, done);
    });

    afterEach(function () {
        expectedStylesheetPath = 'test/fixtures/stylesheets/stylus/nsg-test.styl';
    });

    it('should correctly write sprite image and stylesheets when using directly', function (done) {
        testSpriteGenerationWithOptions({}, done);
    });

    it('should correctly write sprite image and stylesheets when using directly with gm', function (done) {
        testSpriteGenerationWithOptions({ compositor: 'gm' }, done);
    });

    it('should correctly write sprite image and stylesheets when using directly with jimp', function (done) {
        testSpriteGenerationWithOptions({ compositor: 'jimp' }, done);
    });

    it('should correctly write sprite image and stylesheets using glob pattern matching', function (done) {
        testSpriteGenerationWithOptions({
            src: [ 'test/fixtures/images/src/*' ]
        }, done);
    });

    it('should correctly write sprite image and stylesheets when target directory does not exist', function (done) {
        fs.rmdirSync(basePath);

        testSpriteGenerationWithOptions({}, done);
    });

    it('should correctly write sprite image and stylesheets using express.js middleware', function (done) {
        var middleware = nsg.middleware({
            src: imagePaths,
            spritePath: spritePath,
            stylesheetPath: stylesheetPath
        });

        middleware(undefined, undefined, function (err) {
            expect(err).not.to.be.ok;

            expect(fs.readFileSync(expectedStylesheetPath).toString()).to.equal(fs.readFileSync(stylesheetPath).toString());
            expect(fs.readFileSync(expectedSpritePath).toString()).to.equal(fs.readFileSync(spritePath).toString());

            fs.unlinkSync(stylesheetPath);
            fs.unlinkSync(spritePath);

            done();
        });
    });

    it('should not write the sprite image twice if nothing has changed when using connect middleware', function (done) {
        var middleware = nsg.middleware({
                src: imagePaths,
                spritePath: spritePath,
                stylesheetPath: stylesheetPath
            }),
            middlewareWithTimeout = function (callback) {
                setTimeout(function () {
                    middleware(null, null, callback);
                }, 500);
            };

        // it should always be rendered the first time
        middleware(null, null, function () {
            var firstTime = fs.statSync(spritePath).ctime;

            middlewareWithTimeout(function () {
                var secondTime = fs.statSync(spritePath).ctime;

                // it should not have been changed because no files have been changed
                expect(firstTime.getTime()).to.equal(secondTime.getTime());

                // induce new sprite creation
                fs.unlinkSync(spritePath);

                middlewareWithTimeout(function () {
                    var thirdTime = fs.statSync(spritePath).ctime;

                    expect(thirdTime.getTime()).to.be.above(firstTime.getTime());

                    fs.unlinkSync(stylesheetPath);
                    fs.unlinkSync(spritePath);
                    done();
                });
            });
        });
    });

    it('should correctly write stylesheets when using custom template', function (done) {
        expectedStylesheetPath = 'test/fixtures/stylesheets/stylus/with-custom-template.stylus';

        testSpriteGenerationWithOptions({
            stylesheet: fs.readFileSync('test/fixtures/stylesheets/template.tpl').toString()
        }, done);
    });
});
