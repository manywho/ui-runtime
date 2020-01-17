const configCommon = require('./webpack.config.common');

module.exports = (env) => {
    const common = configCommon(env);
    const config = {
        ...common,
        mode: 'production',
        devtool: 'source-map',
    };
    return config;
}