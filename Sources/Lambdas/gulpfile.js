var gulp = require('gulp');
var typescript = require('gulp-typescript');
var merge2 = require('merge2');

var paths = {
  src: ['./src/**/*.ts']
};

gulp.task('default', ['scripts']);

gulp.task('scripts', function () {
    var tsResult = gulp.src(paths.src)
        .pipe(typescript({}))
        .js
        .pipe(gulp.dest('./out/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.src, ['scripts']);
});
