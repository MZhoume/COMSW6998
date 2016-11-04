var gulp = require('gulp');
var typescript = require('gulp-typescript');
var del = require('del');
var zip = require('gulp-zip');

var paths = {
    src: ['src/**/*.ts'],
    out: ['out/**', '!out', '!out/node_modules', '!out/node_modules/**'],
    zip: ['out/**']
};

gulp.task('default', ['build']);

gulp.task('build', function () {
    return gulp.src(paths.src)
        .pipe(typescript({}))
        .js
        .pipe(gulp.dest('./out/'));
});

gulp.task('clean', function () {
    return del(paths.out);
});
 
gulp.task('zip', function() {
    return gulp.src(paths.zip)
        .pipe(zip('lambda.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('deploy', function() {
    gulp.task('clean');
    gulp.task('build');
    gulp.task('zip');
});

gulp.task('watch', function () {
    gulp.watch(paths.src, ['build']);
});