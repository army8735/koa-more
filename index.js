var path = require('path');
var fs = require('fs');
var More = require('more-css');

module.exports = function(dir, option) {
  dir = dir || process.cwd();
  option = option || {};

  var pkg = path.join(dir, 'package.json');

  return function * (next) {
    if(!fs.existsSync(pkg)) {
      yield * next;
    }

    var pkgJson = fs.readFileSync(pkg, { encoding: 'utf-8' });
    pkgJson = JSON.parse(pkgJson);

    var isCss = /\.css($|\?)/.test(this.url);
    if(isCss && pkgJson.spm && pkgJson.spm.moreOpts) {
      var content = this.body;
      if(!content) {
        var file = path.join(dir, this.url);
        if(!fs.existsSync(file)) {
          return yield * next;
        }
        content = fs.readFileSync(file, 'utf-8');
      }

      var more = new More();
      var moreOpts = pkgJson.spm.moreOpts;
      if(moreOpts.kw) {
        more.addKeyword(moreOpts.kw);
      }
      if(moreOpts.configFile) {
        var cf;
        if(moreOpts.configFile.charAt(0) === '.') {
          cf = path.join(dir, moreOpts.configFile);
        }
        else {
          cf = moreOpts.configFile;
        }
        more.configFile(cf);
      }

      var s = more.parse(content);
      this.body = s;

      if(option.next && option.next.call(this)) {
        yield * next;
      }
    }
    else {
      yield * next;
    }
  }
}