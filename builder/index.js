'use strict';

var vinylSourceStream = require('vinyl-source-stream');
var browserify = require('browserify');
var parcelMap = require('parcel-map');
var watchify = require('watchify');
var gutil = require('gulp-util');
var path = require('path');
var es = require('event-stream');
var _ = require('lodash');

var gulpFileAssets = require('gulp-file-assets');
var gulpReplace = require('gulp-replace');
var gulpRename = require('gulp-rename');
var gulpConcat = require('gulp-concat');
var gulp = require('gulp');

function browserifyFactory(config) {
    var br = browserify({
        entries: config.entries,
        debug: true
    });

    return br;
}

function getCssAssets(brInstance, cb) {
    var opts = {
        keys: ['style'],
        defaults: {
            style: 'images/*.jpg'
        }
    };

    var ee = parcelMap(brInstance, opts);

    ee.on('done', function(graph) {
        var cssFilesPaths = [];
        for (var assetPath in graph.assets) {
            if (assetPath.match(/.css$/)) {
                cssFilesPaths.push(path.normalize(assetPath));
            }
        }
        cb(cssFilesPaths);
    });

    brInstance.bundle();
}

// options.entries - browserify files
module.exports = function(gulp, options) {
    gulp.task('watchjs', function() {
        var b = watchify(browserifyFactory(options));

        // add transformations here
        // i.e. b.transform(coffeeify);

        function bundle() {
            return b.bundle()
                // log errors if they happen
                .on('error', function() {
                    gutil.log('error')
                })
                .pipe(vinylSourceStream('bundle.js'))
                .pipe(gulp.dest('./dist'));
        }

        b.on('update', bundle); // on any dep update, runs the bundler
        b.on('log', gutil.log); // output build logs to terminal

        bundle();
    });

    gulp.task('css', function(cb) {
        getCssAssets(browserifyFactory(options), function(cssFilesPaths) {
            var urlsStreams = cssFilesPaths.map(function(cssFilePath) {
                return gulp.src(cssFilePath)
                    .pipe(gulpFileAssets())
                    .pipe(gulpRename(function(pth) {
                        pth.dirname = path.relative(
                            options.cwd,
                            path.join(path.dirname(cssFilePath), pth.dirname)
                        );
                    }))
                    .pipe(gulp.dest('dist'));
            });

            var cssStreams = cssFilesPaths.map(function(cssFilePath) {
                return gulp.src(cssFilePath)
                    .pipe(gulpReplace(/url\(['"]*([^\'\"\)]*)['"]*\)/ig, function(match, p1, offset, str) {
                        var pth = path.relative(
                            options.cwd,
                            path.join(path.dirname(cssFilePath), p1)
                        );
                        return 'url(\'' + pth.replace(/\\/ig, '/') + '\')';
                    }))
            });

            var cssStream = es.merge.apply(null, cssStreams)
                .pipe(gulpConcat('bundle.css'))
                .pipe(gulp.dest('dist'));

            es.merge.apply(null, [].concat(urlsStreams, cssStream))
                .pipe(es.through(null, cb));
        });
    });

    gulp.task('watchcss', ['css'], function(cb) {
        getCssAssets(browserifyFactory(options), function(cssFilesPaths) {
            gulp.watch(cssFilesPaths, ['css']);
            cb();
        });
    });

    gulp.task('default', ['watchjs', 'watchcss']);
}