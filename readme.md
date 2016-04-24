
# Webpack dev middleware
[Module API](#api) | [config](#config) | [Miscellaneous](#miscellaneous)<br>
Development webpack middleware for custom server.<br>
This is rethinked version of the standart [webpack-dev-middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
that brings multiple config support, few features, improvments and some tests.

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

      , fs          : new require('memory-fs') // you are free to choose the file system
                                               // (default is the built-in nodejs)
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
var   middware = new Middware(config)
var   middware = new Middware(webpack, config)
```
middware.**middleware** - (req,res,next) - server request listener (middleware)
## Config
**.compiler** - webpack instance, this option is **required**<br>
**.headers** -  *{header: value}* - headers to send on each request<br>
**.headers.files** - *{filename: {header: value} }* - headers to send along a specified file by its name,  <br>
**.filename** - *String* - filename on which request middware starts compilation (lazy mode only)<br>
**.lazy**    - *Boolean* - activates lazy mode so middware compiles bundle by request<br>
**.error**    - *Boolean* - show errors<br>
**.debug**    - *Boolean* - show debug info<br>
**.quiet**    - *Boolean* - log nothing

## Miscellaneous
Remaining options can be found [here](http://webpack.github.io/docs/webpack-dev-middleware.html#options).<br>
Webpack multiple configurations [info](http://webpack.github.io/docs/configuration.html#multiple-configurations).
