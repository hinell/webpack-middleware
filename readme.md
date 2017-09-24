**WARNING STATEMENT:** This module is now considered _legacy_ and should be used with newer webpack 3.x versions with caution  due to possible bugs. Reconsider please to use [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) instead. If you stillt want to use features like custom file system and bundle specific headers please consider to open new PR to the original middleware repo.

# WEBPACK-MIDDWARE
[p]: #webpack-middware
[![npm](https://img.shields.io/npm/v/webpack-middware.svg?maxAge=2592000&style=flat-square&label=NPM)]()
[![David](https://img.shields.io/david/hinell/webpack-middware.svg?maxAge=2592000&style=flat-square&label=Dependencies)]()
[![David](https://img.shields.io/david/dev/hinell/webpack-middware.svg?maxAge=2592000&style=flat-square&label=DevDeps)]()
[![GitHub tag](https://img.shields.io/github/tag/hinell/webpack-middware.svg?style=flat-square)](https://github.com/)
<br>
**[Module API](#api) | [Configuration](#config) | [Miscellaneous](#miscellaneous) | [Credits][cl] | [License][cl]**<br>
>Server middleware that manages your webpack compilation easily. <br>
>Complete overhaul of the official [webpack-dev-middleware](http://webpack.github.io/docs/webpack-dev-middleware.html) version
>powered by a support of multiple webpack configurations and some handy features leveraging basic functionality.


```sh
$ npm i --no-optional webpack-middware
$ npm i --no-optional hinell/webpack-middware # latest version

```

```js
    , Middware  = require('webpack-middware')
    , app       = require('express')();
      app.use((middware = new Middware({
    //  webpack compiler is REQUIRED (except when you have passed it early by first argument)
        compiler : new Webpack({ entry: ... , output: , plugins: [...] }), 
        publicPath :'/public' // [default - '/'] 
      , headers : {// headers to be send along with script bundle
        , 'Cache-control': 'max-age=0'  // common header to be sent with every bundle response
        , files :{ // bundle specific headers
            // headers to be sent for 'vendor' bundle request
            'vendor': { 'Cache-control': 'max-age=3600'}
         }
      }
      , fs    : new require('memory-fs') // specify in-memory or local file system [default - in memory]
      , watch : {}  // configure watch settings [see webpack watch settings]
       // ⚠ don't forget to provide the middleware callback to the .use()!
      })).middleware)
      
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
var   middware = new Middware(config) // the compiler is provided by config property { compiler }

      middware.middleware // is of type of (req,res,next) server request listener (middleware)
```
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
Follow [here](http://webpack.github.io/docs/webpack-dev-middleware.html#options) for more options.<br>
More info about webpack multiple [configurations](http://webpack.github.io/docs/configuration.html#multiple-configurations).

## CREDITS & LICENSE 
[cl]: #credits--license
MIT

<hr>

[RETURN BACK][p]
