require('./builder')(require('gulp'), {
    entries: ['./app/entry.js'],
    cwd: __dirname
});