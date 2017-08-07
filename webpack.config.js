var path = require('path');

var config = {
    entry: {
        'ui-core': './js/index.ts'
    },
    output: {
        filename: 'ui-core.js',
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    watch: true,
    module: {
        loaders: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true,
                    fix: true
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/,
                query: {
                    declaration: false,
                }
            }
        ]
    }
}

module.exports = function(env) {
    var dir = 'build';

    if (env && env.build)
        dir = env.build;

    config.output.path = path.resolve(__dirname, dir, 'js');
    return config;
};