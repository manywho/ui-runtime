const path = require('path');
const configCommon = require('./webpack.config.common');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackStringReplacePlugin = require('html-webpack-string-replace-plugin');

module.exports = (env) => {
    // generate the common config object
    const common = configCommon(env);

    // build and return the development config object by combining
    // common config and development specific bits within the standard
    // webpack config scaffolding
    // (using `...` operator makes it easier to combine objects
    // without accidentally overwriting any properties and to add new custom
    // ones down the line)
    return {
        ...common,

        plugins: [
            ...common.plugins,
            new CopyPlugin([
                // copy the development vendor scripts
                {
                    from: 'js/vendor-dev/**/*.*',
                    to: 'js/vendor',
                    flatten: true,
                },
                {
                    from: 'bundles.template.json',
                    to: 'bundles.json',
                    // The `content` argument is a [`Buffer`](https://nodejs.org/api/buffer.html) object, it could be converted to a `String` to be processed using `content.toString()`
                    // The `absoluteFrom` argument is a `String`, it is absolute path from where the file is being copied
                    transform(content) {
                        return content.toString().replace(/\$\{PATH_PREFIX\}/g, '');
                    },
                },
            ]),
            new HtmlWebpackPlugin({
                template: 'index.html',
                filename: 'index.html',
                inject: false,
            }),
            new HtmlWebpackStringReplacePlugin({
                '\\$\\{CDN_URL\\}': process.env.CDN_URL,
                '\\$\\{PLATFORM_URI\\}': process.env.PLATFORM_URI,
            }),
        ],

        module: {
            rules: [
                ...common.module.rules,
                { test: /\.html$/, loader: 'html-loader' },
            ],
        },

        devtool: 'eval-source-map',

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
