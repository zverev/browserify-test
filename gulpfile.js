'use strict';

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var gulp = require('gulp');
var _ = require('lodash');

gulp.task('js', function() {
    var b = watchify(browserify({
        entries: ['./app/entry.js'],
        debug: true
    }));

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

gulp.task('default', ['js']);
