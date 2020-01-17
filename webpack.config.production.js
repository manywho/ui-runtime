const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const configCommon = require('./webpack.config.common');
const { repoPaths } = require('./config/paths');

module.exports = (env) => {
    const common = configCommon(env);
    const config = {
        ...common,
        mode: 'production',
        plugins: [
            ...common.plugins,
            new CopyPlugin([
                // copy the production vendor scripts
                {
                    context: './ui-vendor/',
                    from: 'vendor/**/*.*',
                    to: 'js/',
                },
            ]),
        ],
        devtool: 'source-map',
    };

    return config;
}