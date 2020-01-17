const path = require('path');
const webpack = require('webpack');
const WriteBundleFilePlugin = require('./config/WriteBundleFilePlugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { repoPaths } = require('./config/paths');
const configCommon = require('./webpack.config.common');

module.exports = (env) => {

    const buildPath = (env && env.build) ? env.build : repoPaths.build;

    // generate the common config object
    const common = configCommon(env);

    // build and return the production config object by combining
    // common config and production specific bits within the standard
    // webpack config scaffolding
    // (using `...` operator makes it easier to combine objects
    // without accidentally overwriting any properties and to add new custom
    // ones down the line)
    return {
        mode: common.mode,

        entry: {
            ...common.entry,
            'loader': `${repoPaths.uiHtml5}/js/loader.js`,
            'player': `${repoPaths.uiHtml5}/js/player.js`,
        },

        output: {
            ...common.output,
            // path on the disk
            path: path.resolve(__dirname, buildPath),
        },

        resolve: common.resolve,

        plugins: [
            ...common.plugins,
            new CleanWebpackPlugin(),
            new WriteBundleFilePlugin({
                bundleEntries: {
                    // use `name : key` pairs
                    'js/flow-ui-bootstrap': 'bootstrap',
                    'js/flow-ui-core': 'core',
                    'js/flow-offline': 'offline',
                    'css/flow-ui-bootstrap': 'bootstrap',
                    'css/flow-ui-bootstrap-components': 'bootstrap',
                },
                bundleFilename: 'bundle.json',
                pathPrefix: '/',
                // remove sourcemaps and theme css files from the bundle list
                filenameFilter: filename => !filename.endsWith('.map') && !/themes/.test(filename),
            }),
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

        module: {
            rules: [
                ...common.module.rules,
                // export the default.html file
                {
                    test: /\.html$/,
                    include: [
                        path.resolve(__dirname, repoPaths.uiHtml5),
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                outputPath: 'players/',
                                publicPath: 'players/',
                            },
                        },
                    ],
                },
            ],
        },

        externals: common.externals,

        devtool: common.devtool,

        stats: common.stats,

        performance: common.performance,
    };

};
