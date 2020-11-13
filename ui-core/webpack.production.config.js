const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteBundleFilePlugin = require('./WriteBundleFilePlugin');

const { PACKAGE_VERSION } = process.env;

if (!PACKAGE_VERSION) {
    throw new Error('A version number must be supplied for a production build. eg. 1.0.0');
}

const pathsToClean = [
    'dist',
];

const config = {
    entry: {
        'ui-core': './js/index.ts',
    },
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `js/flow-core-${PACKAGE_VERSION}.js`,
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    devtool: 'source-map',
    plugins: [
        new CleanWebpackPlugin(pathsToClean),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(PACKAGE_VERSION),
        }),
        new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$|moment$/ }),
        new UglifyJSPlugin({
            minimize: true,
            sourceMap: true,
            include: /\.min\.js$/,
        }),
        new WriteBundleFilePlugin({
            filename: 'core-bundle.json',
            bundleKey: 'core',
            pathPrefix: '/',
            // remove sourcemaps from the bundle list
            filenameFilter: (filename) => !filename.endsWith('.map'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true,
                    fix: true,
                },
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: [/node_modules/, /dist_test/],
                query: {
                    declaration: false,
                },
            },
        ],
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        jquery: 'jQuery',
        numbro: 'numbro',
        moment: 'moment',
        'socket.io-client': 'io',
    },
};

module.exports = config;
