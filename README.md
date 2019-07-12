# ManyWho UI Bootstrap

[Bootstrap](https://getbootstrap.com) implementation of the various UI components used by the [ManyWho](https://manywho.com) UI framework.

API docs for ui-bootstrap are generated by the excellent [Typedoc](http://typedoc.org/) and can be found [here](https://manywho.github.io/ui-bootstrap)

## Usage

### Building

To build the ui bootstrap components you will need to have [nodejs](http://nodejs.org/) installed.

Then install dependencies:

```
npm install
```

Then run the dev build:

```
npm run dev [env.build=<custom folder>] [env.assets=local|development|qa|staging|production] [env.watch] [env.analyze] [env.sourcemaps]
```

By default the compiled assets will be output to the 'build' folder, the assets will be set to `production`, 
files will not be monitored for changes, sourcemaps will be built and the bundle will not get analyzed, you can override this using 
the `env.build` , `env.assets`,  `env.watch`, `env.sourcemaps` and `env.analyze` args:

```
npm run dev -- --env.build="custom-folder" --env.assets=local --env.watch --env.analyze --env.sourcemaps=false
```

Or dist build:

```
PACKAGE_VERSION=<version_number> npm run dist
```

The compiled assets will be output to the 'dist' folder and the assets will be set to `production`.


### Running locally and watching files

You can run:

```
npm start
```

Which will rebuild the project whenever a change to the script or less files is made.

The compiled assets will be output to the ../ui-html5/build folder and the assets will be set to `development`.


### Running tests

To run Jest/Enzyme tests:

```
npm test
```

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-bootstrap is released under our shared source license: https://manywho.com/sharedsource