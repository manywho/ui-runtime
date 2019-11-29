// Abandon all hope ye who tries to do anything with Webpack thinking that it
// will be easy and straightforward!

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const { repoPaths, mapPublicPath } = require('./config/paths');

module.exports = (env) => ({

    mode: (env && env.development) ? 'development' : 'production',

    entry: {
        'js/flow-ui-core': `${repoPaths.uiCore}/js/index.ts`,
        'js/flow-ui-bootstrap': `${repoPaths.uiBootstrap}/js/index.js`,
        'ui-themes': `${repoPaths.uiThemes}/ui-themes.js`,
    },

    output: {
        // virtual path on the dev-server
        publicPath: (env && env.assets) ? mapPublicPath(env.assets) : 'debug/',
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true,
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    plugins: [
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
    ],

    module: {
        rules: [
            // bundle source code from ui-core and ui-bootstrap
            {
                test: /\.(ts|tsx)$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiCore}/js`),
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/js`),
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

    devtool: (env && env.development) ? 'source-map' : false,

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
