'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

gulp.task('watch', function () {
  gulp.watch(path.join(conf.paths.src, '/app/**/*.scss'), ['styles']);
  gulp.watch(path.join(conf.paths.src, '/app/**/*.js'), ['scripts:watch']);
  gulp.watch(path.join(conf.paths.src, '/app/**/*.html'), ['partials']);
});
