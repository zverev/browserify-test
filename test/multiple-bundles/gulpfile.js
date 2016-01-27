require('gmx-builder')(require('gulp'), {
    cwd: __dirname,
    bundles: {
        'dist/common.js': '__common_bundle',
        'dist/app.js': 'src/app.js',
        'dist/help.js': 'src/help.js'
    }
});
