# Webpack dev middleware

It is just an enchanced fork of the standart [webpack-dev-middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
and mix with the middleware from the [kriasoft](https://github.com/kriasoft/webpack-middleware/).
Supports all the standart http servers implementations, works on 5.0+ node.js version, treat several configs

```sh
$ npm i hinell/webpack-middleware
```
```javascript
var   webpackCompiler = new Webpack(/* ur config here */)
    , express = require('express')
    , wbmd    = require('wbpck-middleware')
    , app     = express();
      app.use(new ({
        compiler    : webpackCompiler,  // compiler property is required!
        pablickPath :'/public'          // doesn't required, by default - '/'
      }).middleware)                    // don't forget to pass the middleware function to the .use()!

```
Rest of the configurations can be found [here](http://webpack.github.io/docs/webpack-dev-middleware.html#options).
####Improvments
```javascript
      app.use((multycompiler = new ({
          compiler  : webpackCompiler
        , headers   : { // custom headers, can be attached to the specified file
            files : {'vendor':'Cache-control: max-age=3600 '}
          }
        , fs        : new require('memory-fs')  // you are also able no to specify an fs config
      })).middleware)
      app.listen(3000);
      multycompiler.watching.invalidate()   // access watching
```
