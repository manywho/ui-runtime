const common = require('./webpack.common');

const config = {
    ...common,
    mode: 'production',
    devtool: 'source-map',
};

module.exports = config;
