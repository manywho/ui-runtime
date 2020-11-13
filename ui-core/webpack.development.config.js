const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');

const config = {
    entry: {
        'ui-core': './js/index.ts',
    },
    mode: 'development',
    output: {
        filename: 'flow-core.js',
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    devtool: 'source-map',
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
                options: {
                    declaration: false,
                },
            },
        ],
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$|moment$/ }),
        new LicenseWebpackPlugin({
            pattern: /.*/,
            unacceptablePattern: /GPL|MPL|CC|EPL|CDDL|Artistic|OFL|Ms-RL|BSL|AFL|APSL|FDL|CPOL|AML|IPL|W3C|QPL/gi,
            abortOnUnacceptableLicense: true,
        }),
    ],
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        jquery: 'jQuery',
        moment: 'moment',
        numbro: 'numbro',
        'socket.io-client': 'io',
    },
};

module.exports = function (env) {
    let dir = '../ui-html5/build';

    if (env && env.build) dir = env.build;

    if (env && env.watch) {
        config.watch = true;
        config.watchOptions = {
            poll: true,
        };
    }

    if (env && env.analyze) {
        config.plugins.push(
            new BundleAnalyzerPlugin(),
        );
    }

    config.output.path = path.resolve(__dirname, dir, 'js');
    return config;
};
