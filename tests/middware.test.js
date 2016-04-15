var DEBUG = false;
Config = {
    entry   : './tests/main.js'
  , output  : {filename: 'main.bundle.js',path: __dirname}
  , stats: !DEBUG ? void 0 : {
    colors: true,
    reasons: true,
    timings: true
  }
};
            require('colors');
Webpack   = require('webpack');
MemoryFS  = require('memory-fs');
Middware  = require('../');



/* Test stuff */
Server    = function (middlewareCallback) {
  this.middleware = middlewareCallback;
  this.mid        = function (middleware) { this.middleware = middleware; return this };
  this.req        = function () {
      this.middleware.apply(null,arguments);
    return this
  }
  
};
Request   = function (url) { typeof url === 'string' ? this.url = url : Object.assign(this,url) };
Response  = function (testName,test) {
  this.headers    = [];
  this.setHeader  = function (name,val) {
    this.headers.push({name: name, val: val});
  };
  this.end = function (content) {
    this.finished = true;
    this.content = content;
    console.log( (test.call(this,this))
      ? "PASSED: ".green+testName
      : "\r\n"+
        "FAILED: ".red  +testName );
  }
};
middconfig= {debug: DEBUG, quiet: !DEBUG };
compiler  = Webpack(Config);

// Lazy mode test
new Server()
  .mid(new Middware(Object.assign(middconfig,{
      filename: Config.output.filename
    , compiler: compiler
    , lazy    : true
  })).middleware)
  .req({url:'/'+Config.output.filename}
      ,new Response('Lazy mode test',function (res) { return res.content  })
      ,function somethingWrong(e) { console.log('Test: something went wrong!', e ? e : '' ) })