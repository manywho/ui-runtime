/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { repoPaths } = require('./config/paths');
const dotenv = require('dotenv').config();
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = (env) => ({
    entry: {
        'js/flow-ui-bootstrap': `${repoPaths.uiBootstrap}/js/index.js`,
        'js/flow-ui-core': `${repoPaths.uiCore}/js/index.ts`,
        'js/flow-offline': `${repoPaths.uiOffline}/js/index.js`,
        'js/loader.min': './js/loader.js', // using loader.min so we get loader.min.js as output
        'ui-themes': `${repoPaths.uiThemes}/ui-themes.js`,
    },
    output: {
        // virtual path on the dev-server
        publicPath: '/',
        libraryTarget: 'umd',
        library: ['manywho', 'core'],
        umdNamedDefine: true,
        filename: '[name].js',
        // path on the disk
        path: path.resolve(__dirname, repoPaths.build),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    // load these externally (don't bundle them)
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        jquery: 'jQuery',
        numbro: 'numbro',
        moment: 'moment',
        bootstrap: 'bootstrap',
        'socket.io-client': 'io',
    },
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
        // // set the maximum number of modules to be shown
        // maxModules: 15,
        // show performance hint when file size exceeds
        // `performance.maxAssetSize`
        performance: true,
        // add warnings
        warnings: true,
    },
    performance: {
        hints: 'warning',
        assetFilter: (assetFilename) => assetFilename.endsWith('.js'),
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(dotenv.parsed),
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        new CopyPlugin({
            patterns: [
                // Copy the necessary tinymce files
                {
                    from: 'node_modules/tinymce/skins/**/*.*',
                    to: 'js/vendor',
                },
                {
                    from: 'node_modules/tinymce/plugins/**/*.*',
                    to: 'js/vendor',
                },
                // copy the favicons
                {
                    from: 'img/**/*.*',
                    // to: defaults to the output.path
                },
                // copy the index.html
                {
                    from: 'index.ejs',
                    to: 'players/[name].html',
                },
            ],
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: env && env.analyse ? 'server' : 'disabled',
            openAnalyzer: !!(env && env.analyse),
        }),
    ],
    module: {
        rules: [
            // bundle source code from ui-core and ui-bootstrap
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiCore}/js`),
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/js`),
                    path.resolve(__dirname, `${repoPaths.uiOffline}/js`),
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
            // bundle ui-offline styles
            {
                test: /\.less$/,
                include: [path.resolve(__dirname, `${repoPaths.uiOffline}/css`)],
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
            // bundle themes
            {
                test: /\.less$/,
                include: [path.resolve(__dirname, `${repoPaths.uiThemes}/styles`)],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                            outputPath: 'css/themes/',
                            publicPath: 'css/themes/',
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
                exclude: [
                    path.resolve(__dirname, `${repoPaths.uiOffline}/icons/Offline.svg`),
                    path.resolve(__dirname, `${repoPaths.uiOffline}/icons/Online.svg`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'css/fonts/',
                            publicPath: 'fonts/',
                        },
                    },
                ],
            },
            // bundle images
            {
                test: /\.(png|svg|jpg|gif)$/,
                exclude: [
                    path.resolve(__dirname, `${repoPaths.uiOffline}/icons/Offline.svg`),
                    path.resolve(__dirname, `${repoPaths.uiOffline}/icons/Online.svg`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/',
                        },
                    },
                ],
            },
            // bundle bootstrap styles
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/css/mw-bootstrap.less`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `flow-ui-bootstrap.css`,
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
                            search: '.mw-bs html|.mw-bs body',
                            replace: '.mw-bs',
                            flags: 'g',
                        },
                    },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
            // bundle components styles
            {
                test: /\.less$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiBootstrap}/css/mw-components.less`),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `flow-ui-bootstrap-components.css`,
                            outputPath: 'css/',
                            publicPath: 'css/',
                        },
                    },
                    { loader: 'extract-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
            // bundle offline icons
            {
                test: /\.svg$/,
                include: [
                    path.resolve(__dirname, `${repoPaths.uiOffline}/icons/Offline.svg`),
                    path.resolve(__dirname, `${repoPaths.uiOffline}/icons/Online.svg`),
                ],
                use: [
                    {
                        loader: 'react-svg-loader',
                    },
                ],
            },
        ],
    },
});
