const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteBundleFilePlugin = require('./WriteBundleFilePlugin');

const pathsToClean = [
    'dist'
];

const config = {
    entry: {
        'ui-core': './js/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/ui-core-[chunkhash].js',
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
        new WriteBundleFilePlugin({
            bundleKey: 'core',
            pathPrefix: '/',
            // remove sourcemaps from the bundle list
            filenameFilter: filename => !filename.endsWith('.map'),
        }),
        new CleanWebpackPlugin(pathsToClean),
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
        'react-dom': 'ReactDOM',
        'jquery': 'jQuery',
        'numbro': 'numbro',
        'moment': 'moment',
        'socket.io-client': 'io'
    }
}

module.exports = config;