# Flow Runtime UI

> A browser-based framework for running applications built using the [Boomi Flow](https://boomi.com/platform/flow/) platform.

## Installing dependencies

If dependencies have not been installed yet, install them in the top level 
monorepo `ui-runtime` and in each of the subrepos (`ui-core`, `ui-bootstrap`, ...)
with:

```shell script
# top level monorepo
npm install

# for each subrepo
cd <subrepo>
npm install
```

## Development

### Run `ui-runtime` in development mode

Before running the `ui-runtime` create a `.env` file in the root directory containing the following environment variables (`.env.example` can be used as a basis):

```shell script
CDN_URL=""
PLATFORM_URI="https://development.manywho.net"
```

Then use the following command:

```shell script
npm start
```

### Dev Server

The dev server will run at http://localhost:3000

Flows can be accessed with the same structure of url as they run in production. 

Eg. `http://localhost:3000/<TENANT_ID>/play/default?flow-id=<FLOW_ID>&flow-version-id=<FLOW_VERSION_ID>`

### List of files served by the dev server

To see the list with links to all files served by the webpack dev server go to:

```shell script
http://localhost:3000/webpack-dev-server
```

## Tests

To run tests on all subrepos use:

```shell script
npm test
```

To run tests on individual subrepos use:

```shell script
# ui-bootstrap
npm run test:bootstrap

# ui-core
npm run test:core

# ui-offline
npm run test:offline
```

All listed commands are defined in the top-level `package.json` and should be 
executed from the top-level directory. 

Other subrepos don't have/need tests because they are either just HTML, CSS or 
3rd party scripts.

## Code linting

To run code linting on all subrepos use:

```shell script
npm run lint
```

To run test linting on all subrepos use:

```shell script
npm run lint:test
```

To run code linting on individual subrepos use:

```shell script
# ui-bootstrap
npm run lint:bootstrap

# ui-core
npm run lint:core

# ui-offline
npm run lint:offline
```

To run test linting on individual subrepos use:

```shell script
# ui-bootstrap
npm run lint:bootstrap:test

# ui-core
npm run lint:core:test

# ui-offline
npm run lint:offline:test
```

All listed commands are defined in the top-level `package.json` and should be 
executed from the top-level directory. 

## Style linting

To run style linting on all subrepos use:

```shell script
npm run stylelint
```

To run style linting on individual subrepos use:

```shell script
# ui-bootstrap
npm run stylelint:bootstrap

# ui-offline
npm run stylelint:offline

# ui-themes
npm run stylelint:themes
```

All listed commands are defined in the top-level `package.json` and should be 
executed from the top-level directory.

Other subrepos don't have/need linting because they don't contain any styles.

## Production

### Build `ui-runtime` for production

This command is meant to be used by Bamboo to build the ui-runtime for deployment.
Running it manually by the developer is no longer required.

### Change the build output directory

By default all files will be emitted into the `runtime_build` directory. 

To change the default build output directory you can edit the `repoPaths` 
object in `config/paths.js`.

To change the default build output directory "on the fly" pass a custom output 
directory via the optional `--env.build` argument

```shell script
npm run build -- --env.build=<output_dir>
```

### Show the analysis of the emitted packages

```shell script
npm run build -- --env.analyse
```

Note: There is no need to assign any value to the `--env.analyse` argument.
