var gulp = require('gulp');
var coffee = require("gulp-coffee");
var concat = require("gulp-concat");
var minifyHtml = require("gulp-minify-html");
var coffeelint = require("gulp-coffeelint");
var templateCache = require('gulp-angular-templatecache');
var merge = require('gulp-merge');
var gettext = require('gulp-angular-gettext');
var karma = require("karma");
var path = require('path');
var connect = require('gulp-connect');

var MODULE = "mv"

gulp.task('test', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.coffee',
    singleRun: true
  }, function(){
    done();
  }).start();
});

gulp.task('tdd', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.coffee'
  }, done).start();
});

gulp.task("all", function(){

  var main = gulp.src('./src/main.coffee')
    .pipe(coffee({bare: true}));

  var cof = gulp.src(['./src/coffee/**/*.coffee', '!./src/coffee/**/*_test.coffee'])
    .pipe(coffee({bare: true}));

  merge(main, cof)
    .pipe(concat(MODULE + '.js'))
    .pipe(gulp.dest('./'));

});

gulp.task("demo", function(){
  gulp.src('./demo/demo.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./demo/'))
});

gulp.task("watch", function(){
  gulp.watch(['./src/**'], ['all']);
  gulp.watch(['./demo/demo.coffee'], ['demo']);
});

gulp.task('connect', function() {
  connect.server({port: 8000});
});

gulp.task("default", ["connect", "watch"])
