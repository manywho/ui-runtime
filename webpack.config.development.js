const path = require('path');
const { repoPaths } = require('./config/paths');
const configCommon = require('./webpack.config.common');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackStringReplacePlugin = require('html-webpack-string-replace-plugin');

module.exports = (env) => {
    // generate the common config object
    const common = configCommon(env);

    const cdnURL = (env && env.cdnurl) ? env.cdnurl : 'http://localhost:3000';
    const platformURI = (env && env.platformuri) ? env.platformuri : 'https://development.manywho.net';

    // build and return the development config object by combining
    // common config and development specific bits within the standard
    // webpack config scaffolding
    // (using `...` operator makes it easier to combine objects
    // without accidentally overwriting any properties and to add new custom
    // ones down the line)
    return {
        mode: common.mode,

        entry: {
            ...common.entry,
        },

        output: {
            filename: '[name].js',
            ...common.output,
        },

        resolve: {
            ...common.resolve,
        },

        plugins: [
            ...common.plugins,
            new CopyPlugin([
                // copy the development vendor scripts
                {
                    context: './ui-vendor/',
                    from: 'vendor-dev/**/*.*',
                    to: 'js/vendor',
                    flatten: true,
                }
            ]),
            new HtmlWebpackPlugin({
                template: path.resolve(repoPaths.uiHtml5, 'index.html'),
                filename: 'index.html',
                inject: false,
            }),
            new HtmlWebpackStringReplacePlugin({
                '\\$\\{CDN_URL\\}': cdnURL,
                '\\$\\{PLATFORM_URI\\}': platformURI,
            }),
        ],

        module: {
            rules: [
                ...common.module.rules,
                { test: /\.html$/, loader: 'html-loader' },
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
                                name: 'flow-ui-bootstrap.css',
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
                {
                    test: /\.less$/,
                    include: [
                        path.resolve(__dirname, `${repoPaths.uiBootstrap}/css/mw-components.less`),
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'flow-ui-bootstrap-components.css',
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

        externals: {
            ...common.externals,
        },

        devtool: common.devtool,

        stats: {
            ...common.stats,
        },

        performance: {
            ...common.performance,
        },

        devServer: {
            hot: true,
            inline: true,
            overlay: true,
            // if no HOST is defined it will default to localhost
            host: process.env.HOST,
            port: process.env.PORT || 3000,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            historyApiFallback: true,
        },
        // NOTE: To see a list of all the files built and loaded by the
        // dev server go to the following url in the browser:
        // http://localhost:3000/webpack-dev-server
    };

};
