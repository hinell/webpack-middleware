            require('colors');
Webpack   = require('webpack');
MemoryFS  = require('memory-fs');
Middware  = require('../');

// Utils
Request   = function (url) { typeof url === 'string' ? this.url = url : Object.assign(this,url) };
Response  = function () {
  this.headers    = [];
  this.setHeader  = function (name,val) {
    this.headers.push({name: name, val: val});
  };
  this.end = function (content) {
    this.finished = true;
    this.content = content;
    this.onend.call(this)
  }
};

//Prepare testing stuff
Config    = {
    entry   : './tests/main.js'
  , resolve : {root: [process.cwd()]}
  , output  : {filename: 'main.bundle.js',path: __dirname}
  , stats   : {
      colors : true,
      reasons: true,
      assets : true
  }
};
var DEBUG = process.env.npm_config_DEBUG || process.env.DEBUG
middconfig  = {
   debug   : true
  ,quiet   : true
  ,error   : DEBUG
  ,stats   :(DEBUG ? false :  Config.stats)
};
Test      = function (name,cfg,test) {
  this.name       = name;
  this.usertest   = test;
  this.test       = function (next) {
    this.req       = new Request('/'+Config.output.filename);
    this.res       = new Response();
    this.res.onend = this.usertest.bind(this,next);
    cfg.compiler = Webpack(Config);
    this.middware || (this.middware  = new Middware(Object.assign(middconfig,cfg)));
    this.middleware = this.middware.middleware;
    this.middleware.call(null,this.req,this.res, function (err) { if(err) throw err });
    return true
  }.bind(this);
};
Tests     = function () {
  this.tests  = [{test: function (next) { next() }}];
  this.next   = function (nexttest,err) {
    // "this." context of this function is equal to one of the tests
    typeof err == 'string' && (err = new Error(err));
    var failed = err instanceof Error;
    var passed = !failed;

        passed &&  this.name && console.log('PASSED: '.green + this.name);
        failed &&  this.name && console.log('FAILED: '.red   + this.name,'\n'+err.stack);
       (failed || !nexttest) && (console.log('Testing finished!'.yellow), process.exit(0));
        nexttest && nexttest();
  };
  this.add    = function (test,reusePrevMiddleware) {
    test.reusePrev = reusePrevMiddleware;
    this.tests.push(test);
    return this;
  };
  this.start  = function () {     // current and next tests
    this.tests.reduceRight(function (previous,next,i,arr) {
      var ifPreviousFirst = i == arr.length -2;
          ifPreviousFirst && (previous.test = previous.test.bind(null,this.next.bind(previous,undefined) ));
          next.reusePrev && (next.middware = previous.middleware);
          next.test = next.test.bind(null,this.next.bind(next,previous.test));
          return next
    }.bind(this)).test()
  }
};

// Lazy mode test
new Server()
  .mid(new Middware(Object.assign(middconfig,{
      filename: Config.output.filename
    , compiler: compiler
    , lazy    : true
  })).middleware)
  .req(request
      ,new Response('Lazy mode test ',function (res) { return res.content })
      ,somethingWrong);

// Headers test
new Server()
  .mid((new Middware(Object.assign(middconfig,{
      compiler: compiler
    , debug   : false
    , headers : {files: {'main': {customheader: 'value'} }}
  }))).middleware)
  .req(request
      ,new Response('Headers test ',function (res) {
        return res.headers.some(function (header) {
          return header.name === 'customheader'
        })
      })
      ,somethingWrong);