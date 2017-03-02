module.exports = function(gulp, plugins) {
    var guppy = require('git-guppy')(gulp);

    var tsProject = plugins.typescript.createProject('tsconfig.json', {
        typescript: require('typescript')
    });

    return  guppy.src('pre-commit', function (files) {
        return gulp.src(files)
            .pipe(plugins.filter(['js/services/*.tsx', 'js/services/*.ts']))
            .pipe(plugins.tslint({
                formatter: 'verbose',
            }))
            .pipe(plugins.tslint.report({
                summarizeFailureOutput: true
            }));
    });
}