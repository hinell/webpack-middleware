
# Webpack-middware
[![npm](https://img.shields.io/npm/v/webpack-middware.svg?maxAge=2592000&style=flat-square&label=NPM)]()
[![David](https://img.shields.io/david/hinell/webpack-middware.svg?maxAge=2592000&style=flat-square&label=Dependencies)]()
[![David](https://img.shields.io/david/dev/hinell/webpack-middware.svg?maxAge=2592000&style=flat-square&label=DevDeps)]()
[![GitHub tag](https://img.shields.io/github/tag/hinell/webpack-middware.svg?style=flat-square)](https://github.com/)
<br>
**JUMP TO**: [Class API](#api) | [Configuration](#config) | [Miscellaneous](#miscellaneous)<br>
Server middleware that manages your webpack compilation when in development.<br>
This completely rewritten and heavily tested the [webpack-dev-middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
brings a powerful support of multiple webpack configurations and some features enhancing basic functionality. See below.
```sh
$ npm i webpack-middware
$ npm i hinell/webpack-middware --production # latest version
```
```js
var   compiler  = new Webpack(/* your configs, one or more.. */)
    , Middware  = require('webpack-middware')
    , app       = require('express')();
      app.use((middware = new Middware({
        compiler    : compiler, // compiler property is required!
        publickPath :'/public'  // by default '/'
      , headers     : {         // headers to be served to
        , 'Cache-control': 'max-age=0' // every client requiest
        , files :                      // or for specific file request
            {'vendor':{'Cache-control': 'max-age=3600'}}// headers are sent with response  when the name
                                                        // of any requested webpack output bundle
                                                        // matches for instance to the 'vendor' regexp
      , fs          : new require('memory-fs') // feel free to choose the file system
      , watch       : {}  // watch config
      })).middleware)     // ⚠ don't forget to provide the middleware callback to the .use()!
      app.listen(3000);
```
```js
      // Miscellaneous
      middware.watching              // access watching, undefined in lazy mode (lazy option is specified)
      middware.watching.invalidate() // invalidate bundle
      middware.fs                    // file system access
```
## API
```js
var   middware = new Middware(compiler[, config]) // middware takes webpack compiler and optional config
var   middware = new Middware(config) // the compiler passed by the config property like {compiler: compiler}
```
middware.**middleware** - (req,res,next) - server request listener (middleware)
## Config
**.compiler** - webpack compiler instance, this option is **required**<br>
**.fs**       - files system where compiled files are kept, by default it is equal to the ``require('fs')``<br>
**.headers** -  *{header: value}* - serve headers along the response on each request to the webpack output bundle picked by name <br>
**.headers.files** - *{filename:{header: value}}* - the same as **.headers** but only for a particular webpack output bundle<br>
**.filename** - *String* - filename on which request middware starts compilation (lazy mode required)<br>
**.publicPath** - *String* - by default  ``'/'``<br>
**.lazy**     - *Boolean* - activate lazy mode so middware compiles bundle by request, **false** by default<br>
**.error**    - *Boolean* - log errors, **false** by default<br>
**.debug**    - *Boolean* - log debug info, **false** by default<br>
**.quiet**    - *Boolean* - log no info about compilation, except errors and debug, **false** by default

## Miscellaneous
Rest of options can be found [here](http://webpack.github.io/docs/webpack-dev-middleware.html#options).<br>
Webpack multiple [configurations](http://webpack.github.io/docs/configuration.html#multiple-configurations).
