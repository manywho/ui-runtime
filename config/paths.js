const repoPaths = {
    dist: `./runtime_dist`,
    build: `./runtime_build`,
    uiCore: './ui-core',
    uiHtml5: './ui-html5',
    uiThemes: './ui-themes',
    uiVendor: './ui-vendor',
    uiBootstrap: './ui-bootstrap',
};

const publicPaths = {
    LOCAL: 'http://localhost:3000/build/',
    DEVELOPMENT: 'https://manywho-ui-development.s3.eu-west-2.amazonaws.com/',
    QA: 'https://s3.amazonaws.com/manywho-cdn-react-qa/',
    STAGING: 'https://s3.amazonaws.com/manywho-cdn-react-staging/',
    PRODUCTION: 'https://assets.manywho.com/',
};

const mapPublicPath = (assets) => {
    const assetsKey = (typeof assets === 'string')
        ? assets.toLocaleLowerCase()
        : null;

    switch (assetsKey) {
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

module.exports = {
    repoPaths,
    publicPaths,
    mapPublicPath,
};
