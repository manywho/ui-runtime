const path = require('path');
const { repoPaths } = require('./config/paths');
const configCommon = require('./webpack.config.common');

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
        mode: common.mode,

        entry: common.entry,

        output: common.output,

        resolve: common.resolve,

        plugins: common.plugins,

        module: common.module,

        externals: common.externals,

        devtool: common.devtool,

        stats: common.stats,

        performance: common.performance,

        devServer: {
            hot: true,
            open: true,
            inline: true,
            overlay: true,
            stats: 'normal',
            // if no HOST is defined it will default to localhost
            host: process.env.HOST,
            port: process.env.PORT || 3000,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            // since we are not creating an index page fallback
            // and load debug.html
            historyApiFallback: { index: `${repoPaths.uiHtml5}/debug.html`},
        },
        // NOTE: To see a list of all the files built and loaded by the
        // dev server go to the following url in the browser:
        // http://localhost:3000/webpack-dev-server
    };

};
