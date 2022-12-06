const configCommon = require('./webpack.config.common');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
        mode: 'development',
        plugins: [
            ...common.plugins,
            new CopyPlugin({
                patterns: [
                    // copy the development vendor scripts
                    {
                        from: 'js/vendor-dev/**/*.*',
                        to: 'js/vendor/[name][ext]',
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
                ],
            }),
            new HtmlWebpackPlugin({
                template: './index.ejs',
                inject: false,
                cdnUrl: process.env.CDN_URL,
                platformUri: process.env.PLATFORM_URI,
            }),
        ],
        module: {
            rules: [...common.module.rules, { test: /\.html$/, loader: 'html-loader' }],
        },
        devtool: 'eval-source-map',
        devServer: {
            // hot: true,
            // inline: true,
            client: {
                overlay: false,
            },
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
