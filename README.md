# ManyWho UI Core

Core JavaScript services used by the [Boomi Flow](https://boomi.com/flow/) UI framework to do the heavy lifting.

API docs ui-core are generated by the excellent [Typedoc](http://typedoc.org/) and can be found [here](https://manywho.github.io/ui-core)

## Running

First install dependencies with `npm install` then

```
npm run start
``` 

Which will start the webpack dev server and re-compile the typescript on changes.

By default the compiled assets will be output to the `build` folder, you can override this using the `--env.build` arg:

```
npm start -- --env.build="custom-folder"
or
npm run dev -- --env.build="custom-folder"
```

Or dist build:

```
PACKAGE_VERSION=<version_number> npm run dist
```

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

ui-core is released under our shared source license: https://manywho.com/sharedsource