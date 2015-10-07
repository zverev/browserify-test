var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var parcelify = require('parcelify');
var watchify = require('watchify');

gulp.task('default', function() {
    var b = browserify();
    var p = parcelify(b, {});
    p.on('done', function() {
        gutil.log('parcelify done');
    });

    p.on('error', function(err) {
        gutil.log('parcelify error');
    });

    p.on('packageCreated', function(package) {
        gutil.log('parcelify package created');
        console.log(package.getAssets());
    });

    p.on('assetUpdated', function(eventType, asset) {
        gutil.log('parcelify asset updated');
    });

    b.add('./app/entry.js');
    b.bundle();
});
