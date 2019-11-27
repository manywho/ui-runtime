function WriteBundleFile(options) { 
    this.options = options; 
}

WriteBundleFile.prototype.apply = function (compiler) {

    const options = this.options;

    // eslint-disable-next-line prefer-arrow-callback
    compiler.plugin('emit', function (compilation, callback) {

        const bundle = {};

        // we're only interested in main entries
        compilation.chunks
            .filter(chunk => options.bundleEntries[chunk.name])
            .forEach((chunk) => {
                const filteredFiles = chunk.files.filter(options.filenameFilter);
                const correctedPaths = filteredFiles.map(
                    filename => options.pathPrefix + filename,
                );
                // add to bundle file contents
                bundle[options.bundleEntries[chunk.name]] = correctedPaths;
            });

        const bundleFileContents = JSON.stringify(bundle, null, 4);

        compilation.assets[options.bundleFilename] = {
            source: function() { return Buffer.from(bundleFileContents); },
            size: function() { return Buffer.byteLength(bundleFileContents); }
        };

        callback();
    });
};

module.exports = WriteBundleFile;
