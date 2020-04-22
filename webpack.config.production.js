const CopyPlugin = require('copy-webpack-plugin');
const configCommon = require('./webpack.config.common');

module.exports = (env) => {
    const common = configCommon(env);

    return {
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

};
