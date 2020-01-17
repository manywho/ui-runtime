const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const { repoPaths, mapPublicPath } = require('./config/paths');

// because of Bamboo we are using process.env instead of webpack env
// for PACKAGE_VERSION (remember to use "export PACKAGE_VERSION=x.y.z." so the
// var is visible to all child processes)
const { PACKAGE_VERSION } = process.env;

module.exports = (env) => ({

    mode: (env && env.development) ? 'development' : 'production',

    entry: {
        'js/flow-ui-core': `${repoPaths.uiCore}/js/index.ts`,
        'js/flow-ui-bootstrap': `${repoPaths.uiBootstrap}/js/index.js`,
        'js/flow-offline': `${repoPaths.uiOffline}/js/index.js`,
        'ui-themes': `${repoPaths.uiThemes}/ui-themes.js`,
    },

    output: {
        // virtual path on the dev-server
        publicPath: (env && env.assets) ? mapPublicPath(env.assets) : 'debug/',
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true,
        filename: `[name]${PACKAGE_VERSION ? `-${PACKAGE_VERSION}` : null}.js`,
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    plugins: [
        new LicenseWebpackPlugin({
            pattern: /.*/,
            unacceptablePattern: /GPL|MPL|CC|EPL|CDDL|Artistic|OFL|Ms-RL|BSL|AFL|APSL|FDL|CPOL|AML|IPL|W3C|QPL/gi,
            abortOnUnacceptableLicense: true
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        }),
        new CopyPlugin([
            // copy the vendor scripts
            {
                context: './ui-vendor/',
                from: 'vendor/**/*.*',
                to: 'js/',
            },
            // copy the favicons
            {
                context: './ui-html5/',
                from: 'img/**/*.*',
                // to: defaults to the output.path
            },
        ]),
        new BundleAnalyzerPlugin({
            analyzerMode: !!(env && env.analyse) ? 'server' : 'disabled',
            openAnalyzer: !!(env && env.analyse),
        }),
    ],

    module: {
        rules: [
            // bundle source code from ui-core and ui-bootstrap
            {
                test: /\.(ts|tsx)$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiCore}/js`),
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/js`),
                    path.resolve(__dirname, `${repoPaths.uiOffline}/js`),
                ],
                use: [
                    { loader: 'babel-loader' },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    }
                ],
                enforce: 'pre',
            },
            // bundle ui-offline styles
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiOffline}/css`),
                ],
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            },
            // bundle themes
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiThemes}/styles`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                            outputPath: 'themes/',
                            publicPath: 'themes/',
                        },
                    },
                    { loader: 'extract-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
            // bundle fonts
            {
                test: /\.(woff|woff2|eot|ttf|svg|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                            publicPath: 'fonts/',
                        }
                    }
                ]
            },
            // bundle images
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/',
                        }
                    }
                ]
            },
            // bundle bootstrap styles
            // use `${PACKAGE_VERSION}` in file name
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/css/mw-bootstrap.less`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `flow-ui-bootstrap${PACKAGE_VERSION ? `-${PACKAGE_VERSION}` : null}.css`,
                            outputPath: 'css/',
                            publicPath: 'css/',
                        },
                    },
                    { loader: 'extract-loader' },
                    // Change all instances of `.mw-bs html` and `.mw-bs body`
                    // to `.mw-bs` because we are nesting the entire
                    // bootstrap.css file within mw-bootstrap.less.
                    {
                        loader: 'string-replace-loader',
                        options: {
                            search: '\.mw-bs html|\.mw-bs body',
                            replace: '.mw-bs',
                            flags: 'g',
                        }
                    },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ]
            },
            // bundle components styles
            // use `${PACKAGE_VERSION}` in file name
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/css/mw-components.less`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `flow-ui-bootstrap-components${PACKAGE_VERSION ? `-${PACKAGE_VERSION}` : null}.css`,
                            outputPath: 'css/',
                            publicPath: 'css/',
                        },
                    },
                    { loader: 'extract-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
        ],
    },

    // load these externally (don't bundle them)
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'jquery': 'jQuery',
        'numbro': 'numbro',
        'moment': 'moment',
        'bootstrap': 'bootstrap',
        'socket.io-client': 'io',
    },

    devtool: (env && env.development) ? 'inline-source-map' : 'source-map',

    stats: {
        // add asset Information
        assets: false,
        // add children information
        children: false,
        // add chunk information
        // (setting this to `false` allows for a less verbose output)
        chunks: false,
        // `webpack --colors` equivalent
        colors: true,
        // add errors
        errors: true,
        // set the maximum number of modules to be shown
        maxModules: 15,
        // show performance hint when file size exceeds
        // `performance.maxAssetSize`
        performance: true,
        // add warnings
        warnings: true,
    },

    performance: {
        hints: 'warning',
        assetFilter: assetFilename => assetFilename.endsWith('.js'),
    },

});
