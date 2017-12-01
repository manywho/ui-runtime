var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;

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
                test: /\.ts$/,
                include: [
                    path.resolve(__dirname, 'js/services'),
                ],
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true,
                    fix: true,
                    typeCheck: true,
                    configFile: 'tslint.docs.json',
                    tsConfigFile: 'tsconfig.list.json'
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
    plugins: [
        new BundleAnalyzerPlugin(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new LicenseWebpackPlugin({
            pattern: /.*/,
            unacceptablePattern: /GPL|MPL|CC|EPL|CDDL|Artistic|OFL|Ms-RL|BSL|AFL|APSL|FDL|CPOL|AML|IPL|W3C|QPL/gi,
            abortOnUnacceptableLicense: true
        })
    ],
    externals: {
        'react': 'React',
        'react-dom' : 'ReactDOM',
        'jquery': 'jQuery',
        'numbro': 'numbro',
        'moment': 'moment',
        'socket.io-client': 'io'
    }
}

module.exports = function(env) {
    var dir = 'build';

    if (env && env.build)
        dir = env.build;

    config.output.path = path.resolve(__dirname, dir, 'js');
    return config;
};