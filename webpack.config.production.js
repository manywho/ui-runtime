const path = require('path');
const webpack = require('webpack');
const WriteBundleFilePlugin = require('./config/WriteBundleFilePlugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { repoPaths } = require('./config/paths');
const configCommon = require('./webpack.config.common');

// because of Bamboo we are using process.env instead of webpack env
// for PACKAGE_VERSION
const { PACKAGE_VERSION } = process.env;

if (!PACKAGE_VERSION) {
    throw new Error('A version number must be supplied for a production build. eg. 1.0.0');
}

module.exports = (env) => {
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
        },

        output: {
            filename: `[name]-${PACKAGE_VERSION}.js`,
            ...common.output,
        },

        resolve: {
            ...common.resolve,
        },

        plugins: [
            ...common.plugins,
            new CleanWebpackPlugin(),
            new WriteBundleFilePlugin({
                bundleEntries: {
                    // use `name : key` pairs
                    'js/flow-ui-bootstrap': 'bootstrap',
                    'js/flow-ui-core': 'core',
                },
                bundleFilename: 'bundle.json',
                pathPrefix: '/',
                // remove sourcemaps and theme css files from the bundle list
                filenameFilter: filename => !filename.endsWith('.map') && !/themes/.test(filename),
            }),
            // remove unnecessary .js files from /dist
            new RemovePlugin({
                after: {
                    test: [
                        {
                            folder: repoPaths.dist,
                            method: (filePath) => {
                                return new RegExp(/\.js$/, 'm').test(filePath);
                            },
                        },
                    ],
                },
            }),
        ],

        module: {
            rules: [
                ...common.module.rules,
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
                                name: `flow-ui-bootstrap-${PACKAGE_VERSION}.css`,
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
                                name: `flow-ui-bootstrap-components-${PACKAGE_VERSION}.css`,
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
    };

};
