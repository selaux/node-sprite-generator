'use strict';

var sinon = require('sinon'),
    R = require('ramda'),
    chai = require('chai'),
    expect = chai.expect,
    spriteGenerator = require('../../lib/spriteGenerator'),
    providedCompositors = require('../../lib/compositor'),
    providedLayouts = require('../../lib/layout'),
    providedStylesheets = require('../../lib/stylesheet'),
    stylesheetUtils = require('../../lib/utils/stylesheet'),
    sinonTest = require('sinon-test').configureTest(sinon);

chai.use(require('sinon-chai'));

describe('spriteGenerator', function () {
    var defaultFilename = 'test',
        defaultFileContent = {
            path: defaultFilename,
            data: 'test'
        };

    function mergeDefaultOptions(options) {
        return R.merge({
            src: [ defaultFileContent ],
            compositor: { readImage: sinon.stub().resolves({}), render: sinon.stub().resolves() },
            layout: sinon.stub().resolves([]),
            stylesheet: sinon.stub().resolves()
        }, options);
    }

    function buildDefaultDependencies() {
        return {
            readFile: sinon.stub().rejects(),
            writeFile: sinon.stub().rejects(),
            glob: sinon.stub().rejects(),
            mkdirp: sinon.stub().rejects()
        };
    }

    it('should pass on default options to compositor, layout and stylesheet', function () {
        var options = mergeDefaultOptions({});

        return spriteGenerator(buildDefaultDependencies(), options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledOnce;
            expect(options.compositor.readImage).to.have.been.calledWith(defaultFileContent);
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

        return spriteGenerator(buildDefaultDependencies(), options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledOnce;
            expect(options.compositor.readImage).to.have.been.calledWith(defaultFileContent);
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

    it('should use default compositors, layout and stylesheet functions', sinonTest(function (done) {
        this.stub(providedCompositors.canvas, 'readImage').resolves([]);
        this.stub(providedCompositors.canvas, 'render').resolves();
        this.stub(providedLayouts, 'vertical').resolves({ width: 0, height: 0, images: [] });
        this.stub(providedStylesheets, 'stylus').resolves();

        spriteGenerator(buildDefaultDependencies(), { src: [ defaultFileContent ] }).then(function () {
            expect(providedCompositors.canvas.readImage).to.have.been.calledOnce;
            expect(providedCompositors.canvas.render).to.have.been.calledOnce;
            expect(providedLayouts.vertical).to.have.been.calledOnce;
            expect(providedStylesheets.stylus).to.have.been.calledOnce;
        }).nodeify(done);
    }));

    it('should pass the relative sprite to the stylesheet if it is not set manually', function () {
        var dependencies = buildDefaultDependencies(),
            options = mergeDefaultOptions({
                spritePath: 'test/sprite/path/sprite.png',
                stylesheetPath: 'test/styl/sprite.styl'
            });

        options.stylesheet.resolves('my data');
        options.compositor.render.resolves('my sprite data');
        dependencies.mkdirp.withArgs('test/styl').resolves();
        dependencies.writeFile.withArgs('test/styl/sprite.styl', 'my data').resolves();
        dependencies.mkdirp.withArgs('test/sprite/path').resolves();
        dependencies.writeFile.withArgs('test/sprite/path/sprite.png', 'my sprite data').resolves();

        return spriteGenerator(dependencies, options).then(function () {
            expect(options.stylesheet).to.have.been.calledWithMatch([], {
                spritePath: '../sprite/path/sprite.png'
            });
        });
    });

    it('should create stylesheet path and write stylesheet if specified', function () {
        var dependencies = buildDefaultDependencies(),
            options = mergeDefaultOptions({
                stylesheetPath: 'test/styl/sprite.styl'
            });

        options.stylesheet.resolves('my data');
        dependencies.mkdirp.withArgs('test/styl').resolves();
        dependencies.writeFile.withArgs('test/styl/sprite.styl', 'my data').resolves();

        return spriteGenerator(dependencies, options).then(function () {
            expect(dependencies.mkdirp).to.have.been.calledOnce;
            expect(dependencies.writeFile).to.have.been.calledOnce;
        });
    });

    it('should create sprite path and write sprite if specified', function () {
        var dependencies = buildDefaultDependencies(),
            options = mergeDefaultOptions({
                spritePath: 'test/sprite/path/sprite.png'
            });

        options.compositor.render.resolves('my sprite data');
        dependencies.mkdirp.withArgs('test/sprite/path').resolves();
        dependencies.writeFile.withArgs('test/sprite/path/sprite.png', 'my sprite data').resolves();

        return spriteGenerator(dependencies, options).then(function () {
            expect(dependencies.mkdirp).to.have.been.calledOnce;
            expect(dependencies.writeFile).to.have.been.calledOnce;
        });
    });

    it('should use a builtin compositor, stylesheet and layout when specified', sinonTest(function (done) {
        this.stub(providedCompositors.jimp, 'readImage').resolves([]);
        this.stub(providedCompositors.jimp, 'render').resolves();
        this.stub(providedLayouts, 'horizontal').resolves({ width: 0, height: 0, images: [] });
        this.stub(providedStylesheets, 'css').resolves();

        spriteGenerator(buildDefaultDependencies(), {
            src: [ defaultFileContent ],
            compositor: 'jimp',
            layout: 'horizontal',
            stylesheet: 'css'
        }).then(function () {
            expect(providedCompositors.jimp.readImage).to.have.been.calledOnce;
            expect(providedCompositors.jimp.render).to.have.been.calledOnce;
            expect(providedLayouts.horizontal).to.have.been.calledOnce;
            expect(providedStylesheets.css).to.have.been.calledOnce;
        }).nodeify(done);
    }));

    it('should use a provided string for stylesheet as a template', sinonTest(function (done) {
        var options = mergeDefaultOptions({ stylesheet: 'test template' });

        options.layout.resolves({ images: [] });

        spriteGenerator(buildDefaultDependencies(), options).spread(function (stylesheet) {
            expect(stylesheet).to.equal('test template');
        }).nodeify(done);
    }));

    it('should pass all directly passed in data to compositor', function () {
        var options = mergeDefaultOptions({
            src: [{path: 'somefile.png', data: 'somdata'}, {path: 'otherfile.png', data: 'otherdata'}]
        });

        return spriteGenerator(buildDefaultDependencies(), options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledTwice;
            expect(options.compositor.readImage).to.have.been.calledWith(options.src[0]);
            expect(options.compositor.readImage).to.have.been.calledWith(options.src[1]);
        });
    });

    it('should pass all directly passed in source data to compositor', function () {
        var options = mergeDefaultOptions({
            src: [ { path: 'somefile.png', data: 'somdata' }, { path: 'otherfile.png', data: 'otherdata' } ]
        });

        return spriteGenerator(buildDefaultDependencies(), options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledTwice;
            expect(options.compositor.readImage).to.have.been.calledWith(options.src[0]);
            expect(options.compositor.readImage).to.have.been.calledWith(options.src[1]);
        });
    });

    it('should glob for passed in source strings', function () {
        var dependencies = buildDefaultDependencies(),
            options = mergeDefaultOptions({
                src: [ 'glob1', 'glob2' ]
            });

        dependencies.glob.withArgs('glob1').resolves([ 'path11', 'path12' ]);
        dependencies.glob.withArgs('glob2').resolves([ 'path2' ]);
        dependencies.readFile.withArgs('path11').resolves('data11');
        dependencies.readFile.withArgs('path12').resolves('data12');
        dependencies.readFile.withArgs('path2').resolves('data2');

        return spriteGenerator(dependencies, options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledThrice;
            expect(options.compositor.readImage).to.have.been.calledWith({ path: 'path11', data: 'data11' });
            expect(options.compositor.readImage).to.have.been.calledWith({ path: 'path12', data: 'data12' });
            expect(options.compositor.readImage).to.have.been.calledWith({ path: 'path2', data: 'data2' });
        });
    });

    it('should support mixed string and buffer sources', function () {
        var dependencies = buildDefaultDependencies(),
            options = mergeDefaultOptions({
                src: [ 'glob1', { path: 'foobar.jpg', data: 'fob' } ]
            });

        dependencies.glob.withArgs('glob1').resolves([ 'path11', 'path12' ]);
        dependencies.readFile.withArgs('path11').resolves('data11');
        dependencies.readFile.withArgs('path12').resolves('data12');

        return spriteGenerator(dependencies, options).then(function () {
            expect(options.compositor.readImage).to.have.been.calledThrice;
            expect(options.compositor.readImage).to.have.been.calledWith({ path: 'path11', data: 'data11' });
            expect(options.compositor.readImage).to.have.been.calledWith({ path: 'path12', data: 'data12' });
            expect(options.compositor.readImage).to.have.been.calledWith({ path: 'foobar.jpg', data: 'fob' });
        });
    });

    it('should go through the pipeline correctly', function () {
        var sources = [
                { path: 'test', data: '1' },
                { path: 'test2', data: '2' }
            ],
            readResults = [
                { path: 'test', data: '1', width: 10, height: 30 },
                { path: 'test2', data: '2', width: 10, height: 30 }
            ],
            layoutResult = {
                width: 20,
                height: 30,
                images: [
                    { path: 'test', data: '1', width: 10, height: 30 },
                    { path: 'test2', data: '2', width: 10, height: 30 }
                ]
            },
            stylesheetResult = 'my stylesheet',
            renderResult = new Buffer('render result'),
            options = mergeDefaultOptions({
                src: sources
            });

        options.compositor.readImage.withArgs(sources[0]).resolves(readResults[0]);
        options.compositor.readImage.withArgs(sources[1]).resolves(readResults[1]);
        options.layout.withArgs(readResults).resolves(layoutResult);
        options.stylesheet.withArgs(layoutResult).resolves(stylesheetResult);
        options.compositor.render.withArgs(layoutResult).resolves(renderResult);

        return spriteGenerator(buildDefaultDependencies(), options).spread(function (stylesheet, sprite) {
            expect(stylesheet).to.equal(stylesheetResult);
            expect(sprite).to.equal(renderResult);
        });
    });
});
