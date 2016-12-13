module.exports = function(gulp, plugins, argv) {
    return function() {
        var tsProject = plugins.typescript.createProject('tsconfig.json', {
            typescript: require('typescript')
        });

        return gulp.src(['js/services/*.tsx', 'js/services/*.ts'])
            .pipe(plugins.tslint({
                formatter: 'verbose'
            }))
            .pipe(plugins.tslint.report({
                summarizeFailureOutput: true
            }))
            .pipe(plugins.addSrc(['js/services/*.js', 'js/lib/*.*', '!js/services/loader.js', '!js/services/ajaxproxy.js', '!js/services/ajaxproxy2.js']))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.typescript(tsProject))
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(argv.jsDir || 'build/js'));
    }
};