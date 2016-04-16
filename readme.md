# Webpack devmiddleware

This is featured version of the out-of-the-box [webpack-dev-middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
also flavoured by the [kriasoft webpack-middleware](https://github.com/kriasoft/webpack-middleware/) version.
Compatible with 4.0/5.0+ node.js (not tested for <4.0).

```sh
$ npm i hinell/webpack-middware --production
```
```js
var   compiler  = new Webpack(/* your config */)
    , Middware  = require('webpack-middware')
    , app       = require('express')();
      app.use((builder = new Middware({
        compiler    : compiler, // compiler property is required!
        pablickPath :'/public'  // by default - '/'
      , headers     : {         // sets custom headers for each requiest
        , files :               // and per unique file as well
              {'vendor':'Cache-control: max-age=3600 '} // vendor string turns into the regexp instance
                                                        // so when it matches to the webpack
                                                        // entry file then specified respond header is set
      , fs          : new require('memory-fs') // you are also allowed to change file system (node fs by default)
      , watch       : {}  // watch config
      })).middleware)     // ⚠ don't forget to provide the middleware callback to the .use()!
      app.listen(3000);
```
```js
      // Miscellaneous
      builder.watching              // access watching, except case when lazy option is false
      builder.watching.invalidate() // invalidate bundle
      builder.fs                    // file system
```
Additional standart options available [here](http://webpack.github.io/docs/webpack-dev-middleware.html#options).
