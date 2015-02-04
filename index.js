var path = require('path');
var fs = require('fs');
var More = require('more-css');

module.exports = function (dir, option) {
  dir = dir || process.cwd();
  option = option || {};

  return function * (next) {
    var isCss = /\.css($|\?)/.test(this.url);
    if(isCss) {
      var content = this.body;
      if(!content) {
        var file = path.join(dir, this.url);
        if(!fs.existsSync(file)) {
          return yield * next;
        }
        content = fs.readFileSync(file, 'utf-8');
      }
      var more = new More();
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