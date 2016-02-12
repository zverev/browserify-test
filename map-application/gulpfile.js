require('gmx-builder')(require('gulp'), {
    cwd: __dirname,
    debug: true,
    bundles: {
        'dist/bundle.js': 'index.js'
    }
});
