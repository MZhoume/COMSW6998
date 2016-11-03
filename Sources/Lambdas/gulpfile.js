var gulp = require('gulp');
var typescript = require('gulp-typescript');
var merge2 = require('merge2');
var uglify = require('gulp-uglify')
var pump = require('pump')

var paths = {
    src: ['./src/**/*.ts'],
    out: ['./out/**/*.js']
};

gulp.task('default', ['scripts']);

gulp.task('scripts', function () {
    gulp.src(paths.src)
        .pipe(typescript({}))
        .js
        .pipe(gulp.dest('./out/upload/'));
});

gulp.task('watch', function () {
    gulp.watch(paths.src, ['scripts']);
});

gulp.task('compress', function (cb) {
    pump([
        gulp.src(paths.out),
        uglify(),
        gulp.dest('./out/compressed/')
    ])
})