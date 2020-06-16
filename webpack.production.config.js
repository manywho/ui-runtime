const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WriteBundleFilePlugin = require('./WriteBundleFilePlugin');

const { PACKAGE_VERSION } = process.env;

if (!PACKAGE_VERSION) {
    throw new Error('A version number must be supplied for a production build. eg. 1.0.0');
}

const pathsToClean = [
    'dist',
];

const publicPaths = {
    DEVELOPMENT: 'https://manywho-ui-development.s3.eu-west-2.amazonaws.com/',
    QA: 'https://s3.amazonaws.com/manywho-cdn-react-qa/',
    STAGING: 'https://s3.amazonaws.com/manywho-cdn-react-staging/',
    PRODUCTION: 'https://assets.manywho.com/',
};

const mapPublicPath = (assets, publicPaths) => {

    const assetsKey = typeof assets === 'string' ? assets.toLocaleLowerCase() : null;

    switch (assets) {

        case 'local':
            return publicPaths.LOCAL;

        case 'development':
            return publicPaths.DEVELOPMENT;

        case 'qa':
            return publicPaths.QA;

        case 'staging':
            return publicPaths.STAGING;

        case 'production':
            return publicPaths.PRODUCTION;

        default:
            return publicPaths.PRODUCTION;
    }
};


const config = {
    entry: './js/index.js',
    devtool: 'source-map',
    module: {
        noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
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
    plugins: [
        new CleanWebpackPlugin(pathsToClean),
        new UglifyJsPlugin({
            sourceMap: true,
        }),
        new WriteBundleFilePlugin({
            filename: 'offline-bundle.json',
            bundleKey: 'offline',
            pathPrefix: '/',
            // remove sourcemaps from the bundle list
            filenameFilter: (filename) => !filename.endsWith('.map'),
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: `js/flow-offline-${PACKAGE_VERSION}.js`,
    },
};

module.exports = (env) => {
    let defaultDirectory = 'dist';
    const assets = (env && env.assets) ? env.assets : 'production';
    const publicPath = mapPublicPath(assets, publicPaths);

    if (env && env.build) defaultDirectory = env.build;

    config.output.path = path.resolve(__dirname, defaultDirectory);
    config.output.publicPath = `${publicPath}js/`;
    return config;
};
