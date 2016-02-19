require('gmx-builder')(require('gulp'), {
    cwd: __dirname,
    debug: false,
    bundles: {
        'dist/bundle.js': 'index.js'
    }
});
