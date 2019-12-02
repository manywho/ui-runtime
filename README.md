# Flow Runtime UI

> A browser-based framework for running applications built using the [Boomi Flow](https://boomi.com/platform/flow/) platform.

## Development

### Run ui-runtime in development mode
```shell script
$ npm start
```

### Change the public path

All files will be served by webpack dev server from its `debug/` public path 
by default. 

To change the default public path "on the fly" pass a custom path via the 
optional `--env.assets` argument.

```shell script
$ npm start -- --env.assets=<path>
```

The value of `--env.assets` can be: `local`, `development`, `qa`, `staging` or 
`production`.

To change where each of these point edit the `publicPath` object in 
`config/paths.js`.

NOTE: The `debug.html` uses the `debug/` path to load dependencies so using any 
of the custom asset paths will break in the `debug.html`. If you still need 
the `debug.html` to work properly you will need to edit it. The file is located 
in `ui-html5/debug.html`. 

### List of all files served by the dev server

To see the list with links to all files served go to:
```shell script
http://localhost:3000/webpack-dev-server
```

## Production

### Build ui-runtime for production

```shell script
# define the PACKAGE_VERSION:
$ export PACKAGE_VERSION=x.y.z

# run the build task with required arguments:
$ npm run build -- --env.cdnurl=<cdnurl> --env.platformuri=<platformuri> --env.tenant=<tenant> --env.player=<player>
```

Required arguments:
- `--env.cdnurl` (ex.: `https://cdnjs.cloudflare.com`)
- `--env.platformuri` (ex.: `https://development.manywho.net`)
- `--env.tenant`
- `--env.player`

### Change the build output directory

By default all files will be emitted into the `runtime_build` directory. 

To change the default build output directory you can edit the `repoPaths` 
object in `config/paths.js`.

To change the default build output directory "on the fly" pass a custom output 
directory via the optional `--env.build` argument

```shell script
$ npm run build -- --env.cdnurl=<cdnurl> ... --env.build=<output_dir>
```

### Show the analysis of the emitted packages

```shell script
$ npm run build -- --env.cdnurl=<cdnurl> ... --env.analyse
```

Note: There is no need to assign any value to the `--env.analyse` argument.
