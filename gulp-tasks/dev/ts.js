module.exports = function(gulp, plugins, argv) {
    return function() {
        var tsProject = plugins.typescript.createProject('tsconfig.json', {
            typescript: require('typescript')
        });

        return gulp.src(['js/services/*.tsx', 'js/services/*.ts'], { base: 'js' })
            .pipe(plugins.tslint({
                formatter: 'verbose',
            }))
            .pipe(plugins.tslint.report({
                summarizeFailureOutput: true,
                emitError: false
            }))
            .pipe(plugins.addSrc(['js/services/*.js', 'js/lib/*.*', '!js/services/loader.js', '!js/services/ajaxproxy.js', '!js/services/ajaxproxy2.js']))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.typescript(tsProject))
            .pipe(plugins.sourcemaps.write('.', {
                sourceMappingURL: function(file) {
                    return argv.sourceMapUrlPrefixJs + file.relative + '.map';
                },
                includeContent: true
            }))
            .pipe(gulp.dest(argv.jsDir || 'build/js'));
    }
};