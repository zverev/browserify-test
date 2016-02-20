require('gmx-builder')(require('gulp'), {
    cwd: __dirname,
    bundles: {
        'dist/bundle.js': 'index.js'
    }
});
