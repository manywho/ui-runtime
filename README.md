# ManyWho UI Core

Core JavaScript services used by the [ManyWho](https://manywho.com) UI framework to do the heavy lifting.

## Usage

### Building

To build the ui core you will need to have [nodejs](http://nodejs.org/), [gulp](http://gulpjs.com/) and [typings](https://github.com/typings/typings) installed.

Then install dependencies:

```
npm install
typings install
```

Then run the dev build:

```
gulp dev-ts
```

Or dist build:

```
gulp dist-ts
```

### Running

You can run:

```
gulp watch
``` 

Which will re-run the `dev-ts` task whenever a change to the JavaScript files is made.

## Contributing

Contribution are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

This service is released under the [MIT license](https://opensource.org/licenses/MIT).