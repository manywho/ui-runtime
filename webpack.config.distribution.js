const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { repoPaths } = require('./config/paths');
const configProduction = require('./webpack.config.production');

module.exports = (env) => {

    // check if all required env arguments have been supplied
    // NOTE: to provide env arguments to webpack via npm commands use an
    // additional "--", for example: "npm run dist -- --env.tenant=sometenant"
    const tenant = (env && env.tenant) ? env.tenant : null;
    const player = (env && env.player) ? env.player : null;
    const cdnURL = (env && env.cdnurl) ? env.cdnurl : null;
    const platformURI = (env && env.platformuri) ? env.platformuri : null;

    if (!cdnURL || !platformURI || !tenant || !player) {
        const expected = ['tenant', 'player', 'cdnurl', 'platformuri'];
        const missing = expected.reduce(
            (acc, arg) => !env[arg] ? [...acc, `--env.${arg}`] : acc,
            []
        ).join(', ');

        throw new Error(`The "dist" command is missing arguments: ${missing}. Please supply all required arguments!`);
    }

    // generate the common config object
    const production = configProduction(env);

    // build and return the distribution config object by combining
    // production config and distribution specific bits within the standard
    // webpack config scaffolding
    // (using `...` operator makes it easier to combine objects
    // without accidentally overwriting any properties and to add new custom
    // ones down the line)
    return {
        mode: production.mode,

        entry: {
            ...production.entry,
            'loader': `${repoPaths.uiHtml5}/js/loader.js`,
            'player': `${repoPaths.uiHtml5}/js/player.js`,
        },

        output: {
            ...production.output,
            path: path.resolve(__dirname, `${repoPaths.dist}`),
        },

        resolve: {
            ...production.resolve,
        },

        plugins: [
            ...production.plugins,
            // copy the favicons from ui-html/ into dist/
            new CopyPlugin([
                {
                    context: './ui-html5/',
                    from: 'img/**/*.*',
                    // to: defaults to the output.path
                },
            ]),
        ],

        module: {
            rules: [
                ...production.module.rules,
                // export the loader.js as loader.min.js instead of
                // loader.min-<PACKAGE_VERSION>.js
                {
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, `${repoPaths.uiHtml5}/js/loader.js`),
                    ],
                    exclude: [
                        path.resolve(__dirname, `${repoPaths.uiHtml5}/js/player.js`),
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].min.js',
                                outputPath: 'js/',
                                publicPath: 'js/',
                            },
                        },
                    ],
                },
                // export the default.html file and replace some bits in it
                {
                    test: /\.html$/,
                    include: [
                        path.resolve(__dirname, repoPaths.uiHtml5),
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: `${tenant}.${player}.html`,
                                outputPath: 'players/',
                                publicPath: 'players/',
                            },
                        },
                        {
                            loader: 'string-replace-loader',
                            options: {
                                multiple: [
                                    { search: '{{cdnurl}}', replace: cdnURL, flags: 'g' },
                                    { search: '{{platformuri}}', replace: platformURI, flags: 'g' },
                                ],
                            },
                        },
                    ],
                },
            ],
        },

        externals: {
            ...production.externals,
        },

        devtool: production.devtool,

        stats: {
            ...production.stats,
        },

        performance: {
            ...production.performance,
        },
    };

};
