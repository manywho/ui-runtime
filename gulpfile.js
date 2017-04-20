var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var argv = require('yargs').argv;
var path = require('path');

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, argv);
}

function getDeployTask(task, cacheControl, src) {
    return require('./gulp-tasks/deploy/' + task)(gulp, plugins, argv, cacheControl, src);
}

// Hooks
gulp.task('pre-commit', getTask('hooks/pre-commit'));   

// Dev
gulp.task('dev-ts', getTask('dev/ts'));

gulp.task('watch', ['dev-ts'], function() {
    gulp.watch(['js/**/*.*'], ['dev-ts']);
});

// Dist
gulp.task('dist-clean', function() {
    return del('./dist/**/*');
})

gulp.task('dist-hashes', function() {
    return gulp.src(['js/*.js'], { cwd: './dist' })
        .pipe(plugins.filelist('ui-core-hashes.json'))
        .pipe(plugins.jsonEditor(function(hashes) {
            return hashes.map(function(hash) {
                return '/' + hash;
            });
        }))
        .pipe(gulp.dest('./dist'));  
});

gulp.task('dist-ts', ['dist-clean'], getTask('dist/ts'));
gulp.task('dist', ['dist-hashes']);

// Deploy
gulp.task('deploy-assets', getDeployTask('cdn', 'max-age=315360000, no-transform, public', ['dist/js/*.js', 'dist/js/*.js.map']));
gulp.task('deploy-hashes', getDeployTask('cdn', 'no-cache', ['dist/ui-core-hashes.json']));
