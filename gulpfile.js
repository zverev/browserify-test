'use strict';

var browserify = require('browserify');
var parcelMap = require('parcel-map');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var path = require('path');
var gulp = require('gulp');
var es = require('event-stream');
var _ = require('lodash');

var browserifyConfig = {
    entries: ['./app/entry.js'],
    debug: true
};

function getCssAssets(cb) {
    var b = browserify(browserifyConfig);

    var opts = {
        keys: ['style'],
        defaults: {
            style: 'images/*.jpg'
        }
    };

    var ee = parcelMap(b, opts);

    ee.on('done', function(graph) {
        var cssFilesPaths = [];
        for (var assetPath in graph.assets) {
            if (assetPath.match(/.css$/)) {
                cssFilesPaths.push(path.normalize(assetPath));
            }
        }
        cb(cssFilesPaths);
    });

    b.bundle();
}

gulp.task('watchjs', function() {
    var b = watchify(browserify(browserifyConfig));

    // add transformations here
    // i.e. b.transform(coffeeify);

    function bundle() {
        return b.bundle()
            // log errors if they happen
            .on('error', function() {
                gutil.log('error')
            })
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('./dist'));
    }

    b.on('update', bundle); // on any dep update, runs the bundler
    b.on('log', gutil.log); // output build logs to terminal

    bundle();
});

gulp.task('css', function(cb) {
    getCssAssets(function(cssFilesPaths) {
        gulp.src(cssFilesPaths)
            .pipe(concat('bundle.css'))
            .pipe(gulp.dest('dist'))
            .pipe(es.through(null, function() {
                gutil.log('css built');
                cb();
            }));
    });
});

gulp.task('watchcss', ['css'], function(cb) {
    getCssAssets(function(cssFilesPaths) {
        gulp.watch(cssFilesPaths, ['css']);
        cb();
    });
});

gulp.task('default', ['watchjs', 'watchcss']);
