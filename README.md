# Flow Runtime UI

> A browser-based framework for running applications built using the [Boomi Flow](https://boomi.com/platform/flow/) platform.

## Installing Dependencies

If dependencies have not been installed yet, install them in the top level
monorepo `ui-runtime` with:

```shell-script
# top level monorepo
npm install
```

## **IMPORTANT** Notice About `localhost`

Node.js versions 17.x and later no longer prioritise IPv4 addresses when resolving the `localhost` hostname; it might resolve it to `127.0.0.1` (IPv4), `::1` (IPv6), or something else -- see <https://github.com/chimurai/http-proxy-middleware#nodejs-17-econnrefused-issue-with-ipv6-and-localhost-705>.

Therefore, when specifying a URL containing the `localhost` hostname that will eventually be used in a Node.js network operation, you may need to specify the literal IP address instead, which should be either `127.0.0.1` (IPv4) or `::1` (IPv6); try the IPv4 address first if unsure. It's possible that the `localhost` hostname may resolve to the IPv4 addresses in some cases, but this should not be relied upon.

Navigating to a `localhost` URL in a web browser should work as expected.

## Development

### Run `ui-runtime` in development mode

To run `ui-runtime` on a local dev server, use the following command:

```shell-script
npm start
```

### Dev Server

The dev server will run at <http://localhost:3000>

Flows can be accessed with the same structure of url as they run in production.

For example, `http://localhost:3000/<TENANT_ID>/play/default?flow-id=<FLOW_ID>&flow-version-id=<FLOW_VERSION_ID>`

### Files Served by the Dev Server

To see the list with links to all files served by the webpack dev server go to:

<http://localhost:3000/webpack-dev-server>

## Tests and Linting

All listed commands are defined in the top-level `package.json`, and should be
executed from the top-level directory.

### Tests

To run tests on all subrepos use:

```shell
npm test
```

To run tests on ui-core only use:

```shell
# ui-core
npm run test:core
```

Other subrepos don't have or need tests because they are either just HTML, CSS or 3rd party scripts.

### Code Linting

To run code linting on all subrepos use:

```shell-script
npm run lint
```

To run test linting on all subrepos use:

```shell-script
npm run lint:test
```

To run code linting on individual subrepos use:

```shell-script
# ui-bootstrap
npm run lint:bootstrap

# ui-core
npm run lint:core

# ui-offline
npm run lint:offline
```

To run test linting on individual subrepos use:

```shell-script
# ui-bootstrap
npm run lint:bootstrap:test

# ui-core
npm run lint:core:test

# ui-offline
npm run lint:offline:test
```

### Style Linting

To run style linting on all subrepos use:

```shell-script
npm run stylelint
```

To run style linting on individual subrepos use:

```shell-script
# ui-bootstrap
npm run stylelint:bootstrap

# ui-offline
npm run stylelint:offline

# ui-themes
npm run stylelint:themes
```

Other subrepos don't have linting because they don't contain any styles.

## Production

### Building for Production

This command is used by Bamboo to build the `ui-runtime` project for deployment.

Running it manually isn't required, but can done to test the build process locally.

### Changing the Output Directory

By default all files will be emitted into the `runtime_build` directory.

To change the default build output directory you can edit the `repoPaths`
object in `config/paths.js`. You will also need to manually update the `outDir` property in `tsconfig.json`.
