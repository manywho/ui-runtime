var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var argv = require('yargs').argv;
var path = require('path');

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, argv);
}

// Hooks
gulp.task('pre-commit', getTask('hooks/pre-commit'));   

// Dev
gulp.task('dev-ts', getTask('dev/ts'));

gulp.task('watch', ['dev-ts'], function() {
    gulp.watch(['js/**/*.*'], ['dev-ts']);
});

// Dist
gulp.task('dist-ts', ['dist-clean'], getTask('dist/ts'));

gulp.task('dist-bundle', ['dist-ts'], function() {
    return gulp.src(['js/*.js'], { cwd: './dist' })
        .pipe(plugins.filelist('bundle.json'))
        .pipe(plugins.jsonEditor(resources => {
            return {
                'core': resources.map(resource => '/' + resource)
            }
        }))
        .pipe(gulp.dest('./dist'));  
});

gulp.task('dist-clean', function() {
    return del('./dist/**/*');
});

gulp.task('dist', ['dist-bundle']);
