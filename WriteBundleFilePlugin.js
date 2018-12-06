const path = require('path');
const writefile = require('write-file');

function WriteBundleFile() { }

WriteBundleFile.prototype.apply = function (compiler) {
    compiler.plugin('emit', function (compilation, callback) {

        // We're only emitting one chunk
        const [ chunk ] = compilation.chunks;

        // chunk.files contains the js file and a sourcemap (.map) file
        const uiCoreJSFilename = chunk.files.find(filename => filename.endsWith('.js'));

        // bundle file contents
        const bundle = {
            core: [path.join('/js/', uiCoreJSFilename)]
        };

        writefile(path.resolve(__dirname, 'dist', 'bundle.json'), bundle, callback);
    });
};

module.exports = WriteBundleFile;