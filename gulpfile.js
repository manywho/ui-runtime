var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var argv = require('yargs').argv;
var path = require('path'); 

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, argv);
}

// Dev
gulp.task('dev-ts', getTask('dev/ts'));

gulp.task('watch', ['dev-ts'], function() {
    gulp.watch(['js/**/*.*'], ['dev-ts']);
});

// Dist
gulp.task('dist', getTask('dist/ts'));
