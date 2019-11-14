const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

const config = {
    entry: './js/index.js',
    devtool: 'inline-source-map',
    module: {
        noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true
                },
            },
            {
                test: /\.less$/,
                use: [
                    {loader: 'style-loader'}, 
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'flow-offline.js',
    },
    plugins: [
        new BundleAnalyzerPlugin()
    ],
    watch: true,
    watchOptions: {
        poll: true
    }
};

module.exports = (env) => {
    var defaultDirectory = 'build';

    if (env && env.build)
        defaultDirectory = env.build;

    config.output.path = path.resolve(__dirname, defaultDirectory, 'js');
    // config.output.publicPath = 'build/js/';
    return config;
};