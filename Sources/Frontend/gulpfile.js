var gulp = require('gulp');
var concat = require('gulp-concat');
var typescript = require('gulp-typescript');
var merge2 = require('merge2');

var paths = {
  app: ['./src/app.ts'],
  src: ['./src/www/**/*.ts']
};

gulp.task('default', ['app', 'scripts']);

gulp.task('app', function () {
    var tsResult = gulp.src(paths.app)
        .pipe(typescript({}));
 
    return merge2([
        tsResult.js
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./'))
    ]);
});

gulp.task('scripts', function () {
    var tsResult = gulp.src(paths.src)
        .pipe(typescript({}));
 
    return tsResult.js
        .pipe(gulp.dest('./www/js/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.src, ['scripts']);
  gulp.watch(paths.app, ['app']);
});
