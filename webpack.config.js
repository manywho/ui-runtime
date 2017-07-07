var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');

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
    plugins: [
        new UglifyJSPlugin({
            minimize: true,
            sourceMap: true,
            include: /\.min\.js$/,
        }),
        new ManifestPlugin()
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
                exclude: /node_modules/,
                query: {
                    declaration: false,
                }
            }
        ]
    }
}

module.exports = config;