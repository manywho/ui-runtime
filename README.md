# Boomi Flow UI Offline

Services and components used by the [Boomi Flow](https://boomi.com/flow) UI framework to support running flows offline.

## How it Works

The offline functionality works by intercepting network requests that would have gone to the API, inspecting the metadata of the flow
(that is cached locally) then simulating a response. The rest of the UI framework is unaware of this and continues to function
as normal by interpretting the response and rendering components.

A build task, described further down, pulls down the package of the flow which contains all the metadata. This allows the offline
simulation to respond e.g. the user clicked a button and the next map element is a page so generate a page response etc.

As the user moves through the flow any request that would have gone to the API is saved to the client. When the user goes back
online the list of saved requests is displayed, the user can choose to replay all of the requests in sequence, replay requests
out of sequence, or delete the requests.

If the flow is protected with an authentication mechanism and the user's previous session has timed out they will be asked
to re-authenticate before they can replay the saved requests.

### Data Caching

If the flow contains any data loads either in load map elements or objectdata requests from a table (or other component) when
the user goes offline each data load is fired immediately when the flow is initialized to cache a local copy of the data.

Whilst the flow is online, each data load is fired every five minutes to refresh the cache. This can be overridden by modifying the
`offline.cache.objectDataCachingInterval` setting which accepts a numerical value in milliseconds.

By default 250 records from each data load will be cached on the client. This is controlled by the `offline.cache.requests.limit` setting.
If you want more granular control over limits per dataset then you can do so by adding the following to the `offline.cache.requests` setting:

```javascript
limitByType: {
    "<type ID>": 100,
    "<type ID>": 150,
}
```

The keys are the type ID associated to that data load and the values are the limits.

In addition, whilst the flow is online, state values are being cached in memory every 30 seconds. This is so that values persist
in the flow even when network connectivity is suddenly lost. This can be overridden by modifying the `offline.cache.pollInterval` setting which
excepts a numerical value in milliseconds.

State values are also being cached in memory as a user moves through the flow.

### Data Storage

By default cached data will be stored using the IndexedDB mechnaism, with a fallback to WebSQL. More information on these when
running in a cordova environment can be found here: https://cordova.apache.org/docs/en/latest/cordova/storage/storage.html

## Supported Functionality

A lot of functionality in flow is supported whist running a flow offline. Below describes
some caveats/unsupported features.

### Page Conditions

Currently, offline flows can support any page condition created with the basic page condition tool inside the Toolings page editor.
Page conditions with multiple page operations are also supported.
The only page condition metadatatypes that are supported at present are:

- Visibility
- Required
- Enabled

Whilst the only page condition criteria's supported are:

- Equal
- Not equal
- Is empty

### Macros

Macros are fully supported. However, you should not use macro's that create Date objects or evaluate data randomly
e.g. using `Math.random()`, as when requests get replayed, these values will differ from when the macro execution
was simulated offline.

## Unsupported Functionality

- Referencing system values e.g. `$State` in a step/presentation components text content
- Message Actions
- Swimlanes
- Delete map elements
- Listeners
- Realtime collaboration
- Scenarios where you want to set the isBound property on a page components column to equal true (e.g. when you have a object property of type string which is set based on the list value selection)

## Supported Browsers

- Chrome
- Firefox
- Edge
- Safari
- IOS (version 10+)
- Android (version 6+)

## Usage

### Building

To build the ui-offline you will need to have [nodejs](http://nodejs.org/) installed.

Then install dependencies:

```
npm install
```

Then run the dev build:

```
npm start
```

Or dist build:

```
PACKAGE_VERSION=<version_number> npm run dist
```

### Running locally

Before you can run a flow offline you will need to grab a copy of the flow's metadata:

Where `--tenant` is the id of the tenant that contains the flow, `--flow` is the flow id and `--flowVersionId` is the flow version id.

```
npm run offline -- --username=example@example.com --password=example --flow=abc123 --tenant=abc123 --flowVersionId=abc123
```

This will create a metadata.js file in `../ui-html5/build/js`.

To include the offline components you will need to add the following references to debug.html in the ui-html5 repo:

```
<script src="build/js/metadata.js"></script>
<script src="build/js/flow-offline.js"></script>
```

### Running Unit Tests

This project uses the [Jest](https://jestjs.io/) and [Enzyme](https://github.com/airbnb/enzyme) testing libraries. Run the tests with the following:

```
npm run test
```

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-offline is released under our shared source license: https://manywho.com/sharedsource
