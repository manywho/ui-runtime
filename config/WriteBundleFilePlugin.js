function WriteBundleFile(options) { 
    this.options = options; 
}

WriteBundleFile.prototype.apply = function (compiler) {

    const options = this.options;

    // eslint-disable-next-line prefer-arrow-callback
    compiler.plugin('emit', function (compilation, callback) {

        // build the bundle based on assets as chunks don't contain some of the
        // emitted styles that we want listed in the bundle file
        const buildAssets = Object.keys(compilation.assets);
        const buildBundleEntries = Object.keys(options.bundleEntries);

        const buildBundle = buildAssets
            .filter(asset => asset.endsWith('.js') || asset.endsWith('.css'))
            .reduce(
                (bundle, asset) => {
                    // check assets against required bundle entries...
                    buildBundleEntries
                        .forEach((entry) => {
                            const bundleAssetKey = options.bundleEntries[entry];
                            const bundleAssetPath = `${options.pathPrefix}${asset}`;
                            const bundleAssetValues = bundle[bundleAssetKey] || [];

                            // ...and add matching assets to the bundle object
                            if (asset.startsWith(entry) && !bundleAssetValues.includes(bundleAssetPath)) {
                                bundle[bundleAssetKey] = [...bundleAssetValues, bundleAssetPath];
                            }
                        });
                    return bundle;
                },
                {}, // bundle = {}
            );

        const bundleFileContents = JSON.stringify(buildBundle, null, 4);

        compilation.assets[options.bundleFilename] = {
            source: function() { return Buffer.from(bundleFileContents); },
            size: function() { return Buffer.byteLength(bundleFileContents); }
        };

        callback();
    });
};

module.exports = WriteBundleFile;
