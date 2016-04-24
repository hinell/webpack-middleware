// Created by [Hinell](https://github.com/hinell) at 3/6/2016.
//
// Usage:
// ```javascript app.use(new Builder({compiler: webapckBundle}).middleware);```
//
// License:
// Copyright (c) 2016 Hinell@gihub.com
// Webpack-middware may be freely distributed [under the MIT license](https://opensource.org/licenses/MIT)

var join  = require('path').join
  , mime  = require('mime')
  , Err   = function (msg) { return {throw: function(){ throw msg }} };
    module.exports = Middware;
function Middware (compiler,cfg) {
  arguments.length    || (new Err('webpack-middleware: compiler or config is required!').throw());
  arguments.length == 1
    && (cfg = compiler)
    || (cfg && (cfg.compiler = compiler) || (cfg = {compiler: compiler}) );
  cfg.quiet           || (cfg.quiet   = cfg.noInfo);
  cfg.debug
  cfg.error
  cfg.headers
  cfg.compiler        || (new Err ('webpack-middleware: compiler is required!').throw());
  cfg.fs              || (cfg.fs = require('fs'));
  cfg.publicPath      || (cfg.publicPath = '/');
  cfg.stats           || (cfg.stats = {});
  cfg.stats.context   || (cfg.stats.context = process.cwd());
  cfg.watch           || (cfg.watch = {});
  cfg.watch.delay     || (cfg.watch.delay = 200);
  cfg.watch.poll
  cfg.lazy            && (cfg.filename || new Err('Target filename for lazy mode is required!'))
  cfg.lazy            && (typeof cfg.filename == 'string') &&
    (cfg.filename = cfg.filename
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
		  .replace(/\\\[[a-z]+\\\]/ig, ".+")
		,cfg.filename = new RegExp(cfg.filename+'$') );

  Object.assign(this,cfg);
  this.build            = {state: false ,enforce: false};   // compilation is not ready and not enforced (for lazy mode)
  this.responses        = new DelayedResponses(this.build); // used by middleware for a delayed server response handlers
  this.outputPath       = void 0;               // default output path, extracted from the compiler below
  this.middleware       = middleware.bind(this);// async, for a server request handling
  this.onDone_          = onDone.bind(this);    // async, for a successful compilation
  this.onFail_          = onFail.bind(this);    // async, for a failed/invalid compilation
  this.compiler.rebuild_= compilerRebuild.bind(this);
  this.compiler.plugin('done',this.onDone_);
  this.compiler.plugin(['invalid','failed'],this.onFail_);
  this.compiler.compilers || (this.outputPath = this.compiler.outputPath, this.compiler.outputFileSystem = this.fs);
  this.compiler.compilers && (
      // part of the response path, see below
      this.outputPath = this.compiler.compilers[0].outputPath
    , this.compiler.compilers.forEach(function (current) {
      // if the current compiler's target is a 'web',
      // then we config its file system and correct this.outputPath
      !!~['web','webworker'].indexOf(current.options.target)
      && (
          current.outputFileSystem = this.fs
         ,current.outputPath.indexOf(this.outputPath) !== 0 // if current.outputPath differs from this.outputPath
         && /[\/\\]/.test(this.outputPath)
         && (this.outputPath = this.outputPath.replace(/[\/\\][^\/\\]*$/, ""))
         ,this.debug
         && current.outputPath.indexOf(this.outputPath) !== 0
         && console.log('middleware-debug: default otputPath and compiler are still different! ',current.outputPath, this.outputPath)
      );

    }.bind(this))
  );
   this.fs.mkdirp  || (this.fs.mkdirp = require('mkdirp'));
   this.fs.join    || (this.fs.join   = join);

  this.lazy
    ? (this.build.state = true,this.compiler.rebuild_())
    : (this.watch.aggregateTimeout || (this.watch.aggregateTimeout = this.watch.delay)
      , (this.quiet || console.log('webpack-middleware: start watching'))
      , this.watching = this.compiler.watch(this.watch,
        function (err) { if (err) { throw err } }) );

  this.DelayedResponses = DelayedResponses;
  this.PathExtractor    = PathExtractor;
}

// Utils
function DelayedResponses (build /*{state: bool}*/) {
  this.arr = []; this.build = build;
  this.add      = function (fn) { this.build.state && fn() ||  this.arr.push(fn) };
  this.proceed  = function ()   { this.arr.length && this.arr.forEach(function (fn) { fn() }); return this};
  this.empty    = function ()   { this.arr = [] };
}

function PathExtractor(outputpath, publicpath, url) {
  this.path         = ''; // no result path now
  this.httpreg      = /^(https?:)?\/\//;
  this.httpregRepl  = /^(https?:)?\/\/[^\/]+\//;
  // correct public path
  this.httpreg.test(publicpath) && (publicpath = "/" + publicpath.replace(this.httpregRepl, ""));
  url.indexOf(publicpath) == 0
    && ((this.path = url.substr(publicpath.length), !!~this.path.indexOf("?"))
      && (this.path = this.path.split("?")[0]) // todo: check out here if not working well!
    // && (this.path = this.path.substr(0, this.path.indexOf("?")))
    , this.path = this.path && join(outputpath,this.path) || outputpath
    )
}

function compilerRebuild () {
  this.quiet || console.log('webpack-middleware: start building');
  this.debug && console.log('middleware-debug: this.build=', this.build);
  this.build.state
  ? (this.build.state = false
   , this.compiler.run(function (err,stats) {
        this.error && err.stack && console.log('middleware-error: building is failed ', stats.toString(this.stats), err.stack);
    }.bind(this)))
  : (this.build.enforce = true);

}

function middleware (req,res,next) {
// request listener, ENTRY POINT, if not in the lazy mode, by default here
  // required path
  this.reqpath = new PathExtractor(this.outputPath,this.publicPath,req.url).path;
  this.debug   && console.log('middleware-debug: required path = ',this.outputPath,this.publicPath,req.url,' => ',this.reqpath);

  this.reqpath || next(); // next if NO path or filename is extracted
  this.reqpath && this.responses.add(function (reqpath) { // otherwise delay request until compilation is done
    if(res.finished) return next();
    try {
    this.debug && (console.log('middleware-debug: this.fs.data '),console.dir(this.fs.data,{depth:4 }));
    this.stat = this.fs.statSync(reqpath);
    this.stat.isDirectory()
      && (reqpath  = join(reqpath,'index.html')
        , this.stat= this.fs.statSync(reqpath) )
    } catch (err) {
      this.error && err.stack && console.log('middleware-error: this.fs.statSync',err.stack);
      return next();
    }
    this.stat.isFile() || next(); // if required path is not a file, then next
    this.stat.isFile() && (function () {
      var content = this.fs.readFileSync(reqpath);
          res.setHeader('Access-Control-Allow-Origin','*');
          res.setHeader('Content-Type'  ,mime.lookup(reqpath));
          res.setHeader('Content-Length',Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content));
          if (this.headers &&  this.headers.files) {
            for (var file in this.headers.files) {
              var headers = this.headers.files[file];
              if(!new RegExp(file).test(reqpath)) continue;
              for (var header in headers) { res.setHeader(header, headers[header]) }
            }
            delete this.headers.files
          }
          if (this.headers && !this.headers.files) {
            for (header in this.headers) { res.setHeader(header,this.headers[header]) };
          }

          res.end(content);
    }).call(this)

  }.bind(this,this.reqpath));
  this.debug && console.log('middleware-debug: this.lazy= ',this.lazy);

}
// Compiler's event listeners:
function onDone (stats) {
  this.build.state = true; // it is now true, but may still be failed
  process.nextTick(function() {

    if (!this.build.state) return;
    this.quiet // not in quiet logging mode
      || stats.hasErrors() || stats.hasWarnings()  // and while compiling there are no errors occurred
      || console.log(stats.toString(this.stats)); // then just show stats up

    this.quiet || console.log('webpack-middleware: bundle ready');
    this.responses.proceed().empty(); // proceed the sever response
  }.bind(this));

  // in lazy mode, we may issue another rebuild
  this.build.enforce && (this.build.enforce = false, this.compiler.rebuild_());

}
function onFail (err) {
  this.quiet || console.log('webpack-middleware: bundle is failed ');
  this.error && err.stack && console.log('middleware-error: bundle is failed ', err.stack);
  this.build.state = false;
  var next = [].slice.call(arguments).pop();  // this is for compilers' async plugins parameters, see webpack plugins api
      next && next.bind && next();
}