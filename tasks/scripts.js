'use strict';

var path = require('path');
var gulp = require('gulp');
var Q = require('q');
var jetpack = require('fs-jetpack');
var conf = require('./conf');
var $ = require('gulp-load-plugins')();

//var browserSync = require('browser-sync');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');

gulp.task('lint', function () {
  return gulp.src([
    path.join(conf.paths.src, '**/*.js'),
    '!' + path.join(conf.paths.src, 'node_modules/**'),
    '!' + path.join(conf.paths.src, 'electron/jasmine/**')
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

var bundle = function (src, dest) {
  var deferred = Q.defer();

  rollup.rollup({
    entry: src,
    external: ['electron', 'fs-jetpack'],
    plugins: [
      babel({exclude: 'node_modules/**'})
    ]
  }).then(function (bundle) {
    var filename = path.basename(dest);
    var result = bundle.generate({
      format: 'cjs',
      sourceMap: true,
      sourceMapFile: filename
    });
    // Wrap code in self invoking function so the variables don't
    // pollute the global namespace.
    var isolatedCode = '(function () {' + result.code + '\n}());';
    return Q.all([
      jetpack.writeAsync(dest, isolatedCode + '\n//# sourceMappingURL=' + filename + '.map'),
      jetpack.writeAsync(dest + '.map', result.map.toString())
    ]);
  }).then(function () {
    deferred.resolve();
  }).catch(function (err) {
    console.error('Build: Error during rollup', err.stack);
  });

  return deferred.promise;
};

gulp.task('scripts', /*['lint'],*/ function () {
  return Q.all([
    bundle(path.join(conf.paths.src, '/electron/background.js'), path.join(conf.paths.tmp, 'serve/app/background.js')),
    bundle(path.join(conf.paths.src, '/app/index.module.js'), path.join(conf.paths.tmp, 'serve/app/index.module.js'))
  ]);
});

/*gulp.task('scripts:watch', ['scripts'], function (callback) {
  //return webpackWrapper(true, false, callback);
});

gulp.task('scripts:test', function () {
  //return webpackWrapper(false, true);
});

gulp.task('scripts:test-watch', ['scripts'], function (callback) {
  //return webpackWrapper(true, true, callback);
});*/
