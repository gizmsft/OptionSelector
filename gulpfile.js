const { src, dest } = require('gulp');
const sassPlugin = require('gulp-sass');
const uglifyPlugin = require('gulp-uglify');

var minifyCss = function (callback) {
    src('./css/*.css')
        .pipe(sassPlugin().on('error', sassPlugin.logError))
        .pipe(dest('./dist/css'));

    callback();
}

var minifyJs = function (callback) {
    src('./lib/*.js')
        .pipe(uglifyPlugin().on('error', uglifyPlugin.logError))
        .pipe(dest('./dist/js'));

    // place code for your default task here
    callback();
}

var defaultTask = function (callback) {
    minifyCss(callback);
    minifyJs(callback);

    callback();
}

exports.default = defaultTask;
exports.minifyJs = minifyJs;
exports.minifyCss = minifyCss;