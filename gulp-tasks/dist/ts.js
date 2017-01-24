module.exports = function(gulp, plugins, argv) {
    return function() {
        var tsProject = plugins.typescript.createProject('tsconfig.json', {
            typescript: require('typescript')
        });

        return gulp.src(['js/lib/*.*', 'js/services/*.*', '!js/services/ajaxproxy.js', '!js/services/ajaxproxy2.js'])
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.typescript(tsProject))
            .pipe(plugins.uglify({
                preserveComments: 'license'
            }).on('error', plugins.util.log))
            .pipe(plugins.rev())
            .pipe(plugins.rename(function(path) {
                if (argv.jsOrder)
                    path.basename = argv.jsOrder + '-' + path.basename;
            }))
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(argv.jsDir || './dist/js'))       
    }
}