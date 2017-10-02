var path = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

var config = {
    entry: {
        'ui-core': './js/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'ui-core-[chunkhash].js',
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    plugins: [
        new UglifyJSPlugin({
            minimize: true,
            sourceMap: true,
            include: /\.min\.js$/,
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new TypedocWebpackPlugin({
            mode: 'modules',
            module: 'commonjs',
            target: 'es2015',
            ignoreCompilerErrors: true,
            exclude: '**/{test,node_modules}/**/*.*',
            excludeExternals: true,
            excludePrivate: true,
            excludeNotExported: true
        }, './js/services')
    ],
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
                exclude: [/node_modules/, /dist_test/],
                query: {
                    declaration: false,
                }
            }
        ]
    },
    externals: {
        'react': 'React',
        'react-dom' : 'ReactDOM',
        'jquery': 'jQuery',
        'numbro': 'numbro',
        'moment': 'moment',
        'socket.io-client': 'io'
    }
}

module.exports = config;