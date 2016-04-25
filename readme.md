
# Webpack dev middleware
[Module API](#api) | [config](#config) | [Miscellaneous](#miscellaneous)<br>
Facilitate webpack compilation by express.js-like middleware.<br>
This is rethinked version of the standart [webpack-dev-middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
that conveys multiple config support over standart middleware, few features, improvments and tests.

```sh
$ npm i hinell/webpack-middware --production
```
```js
var   compiler  = new Webpack(/* your configs, one or more.. */)
    , Middware  = require('webpack-middware')
    , app       = require('express')();
      app.use((middware = new Middware({
        compiler    : compiler, // compiler property is required!
        publickPath :'/public'  // by default '/'
      , headers     : {         // sets custom headers for each
        , files :               // requiest and specific file
              {'vendor':'Cache-control: max-age=3600 '} // header is sent along the response  when the name
                                                        // of any requested webpack file
                                                        // contains the 'vendor' string

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
var   middware = new Middware(compiler[, config]) // middware takes compiler yet config that is optional
var   middware = new Middware(config) //passs the compiler by the config property like {compiler: compiler}
```
middware.**middleware** - (req,res,next) - server request listener (middleware)
## Config
**.compiler** - webpack instance, this option is **required**<br>
**.fs**       - files system where compiled files are kept, by default it is equal to the ``require('fs')``<br>
**.headers** -  *{header: value}* - serve headers along the response on each request to the compiled bundle  <br>
**.headers.files** - *{filename:{header: value}}* - the same as **.headers** but only for a particular bundle<br>
**.filename** - *String* - filename on which request middware starts compilation (lazy mode only)<br>
**.publicPath** - *String* - by default  ``'/'``<br>
**.lazy**     - *Boolean* - activate lazy mode so middware compiles bundle by request, **false** by default<br>
**.error**    - *Boolean* - show errors, **false** by default<br>
**.debug**    - *Boolean* - show debug info, **false** by default<br>
**.quiet**    - *Boolean* - log nothing, **false** by default

## Miscellaneous
Rest of options can be found [here](http://webpack.github.io/docs/webpack-dev-middleware.html#options).<br>
Webpack multiple configurations [info](http://webpack.github.io/docs/configuration.html#multiple-configurations).
