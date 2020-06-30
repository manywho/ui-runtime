/* eslint-disable @typescript-eslint/no-var-requires */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');

const config = {
    entry: './js/index.js',
    devtool: 'inline-source-map',
    module: {
        noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'eslint-loader',
                options: {
                    emitError: true,
                    failOnError: true,
                },
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'react-svg-loader',
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'flow-offline.js',
    },
    plugins: [
        new BundleAnalyzerPlugin(),
    ],
    watch: true,
    watchOptions: {
        poll: true,
    },
};

module.exports = (env) => {
    let defaultDirectory = 'build';

    if (env && env.build) defaultDirectory = env.build;

    config.output.path = path.resolve(__dirname, defaultDirectory, 'js');
    // config.output.publicPath = 'build/js/';
    return config;
};
