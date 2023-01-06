const CopyPlugin = require('copy-webpack-plugin');
const configCommon = require('./webpack.config.common');
const RemovePlugin = require('remove-files-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { repoPaths } = require('./config/paths');

module.exports = (env) => {
    const common = configCommon(env);

    return {
        ...common,
        mode: 'production',
        devtool: 'source-map',
        plugins: [
            ...common.plugins,
            new CopyPlugin({
                patterns: [
                    // copy the production vendor scripts
                    {
                        from: 'js/vendor/**/*.*',
                    },
                    {
                        // placeholders substituted during deployment
                        from: 'bundles.template.json',
                        to: 'bundles.template.json',
                    },
                ],
            }),
            new CleanWebpackPlugin(),
            // remove unnecessary files from the build folder
            new RemovePlugin({
                after: {
                    test: [
                        {
                            folder: repoPaths.build,
                            method: (filePath) => {
                                return new RegExp(/\.(js|map|txt)$/, 'm').test(filePath);
                            },
                        },
                    ],
                },
            }),
        ],
    };
};
