# Flow Runtime UI

> A browser-based framework for running applications built using the [Boomi Flow](https://boomi.com/platform/flow/) platform.

## Development

### Run ui-runtime in development mode
```shell script
$ npm start
```
Optional arguments:

* `--env.cdnurl (default: http://localhost:3000)`
* `--env.platformuri (default: https://development.manywho.net)`

### Dev Server

The dev server will run at http://localhost:3000

Flows can be accessed with the same structure of url as they run in production. 

Eg. `http://localhost:3000/<TENANT_ID>/play/default?flow-id=<FLOW_ID>&flow-version-id=<FLOW_VERSION_ID>`

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
