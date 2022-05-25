const { src, dest } = require('gulp');
const sassPlugin = require('gulp-sass')(require('sass'));
const uglifyPlugin = require('gulp-uglify');
const renamePlugin = require('gulp-rename');
const minifyCssPlugin = require('gulp-clean-css');

var copyCss = function (callback) {
    src('./css/*.css')
        .pipe(dest('./dist/css'));

    callback();
}

var copyJs = function (callback) {
    src('./lib/*.js')
        .pipe(dest('./dist/js'));

    callback();
}

var minifyCss = function (callback) {
    src('./css/*.css')
        .pipe(sassPlugin())
        .pipe(minifyCssPlugin())
        .pipe(renamePlugin(function (path) {
            path.basename += '.min';
        }))
        .pipe(dest('./dist/css'));

    callback();
}

var minifyJs = function (callback) {
    src('./lib/*.js')
        .pipe(uglifyPlugin())
        .pipe(renamePlugin(function (path) {
            path.basename += '.min';
        }))
        .pipe(dest('./dist/js'));

    callback();
}

var defaultTask = function (callback) {
    copyCss(callback);
    copyJs(callback);
    minifyCss(callback);
    minifyJs(callback);

    callback();
}

exports.default = defaultTask;
exports.minifyJs = minifyJs;
exports.minifyCss = minifyCss;