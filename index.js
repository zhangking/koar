var debug = require('debug')('koar');
var pathToRegexp = require('path-to-regexp');
var co = require('co');
var noop = function*(){};

exports.create = create;

function create(options) {
    var folder = options.folder || './Controllers/';

    return function *(next){
      var map = options.map || '',match,args = [],path = this.path;
      if(map){
        var re;
        for(var i in map){
          re = pathToRegexp(i);
          if(match = re.exec(path)){
            args = match.slice(1).map(decode);
            path = map[i];
          }
        }
      }

      args.push(next);

      path = path.split('/');

      var action = (path[1] || '').toLowerCase(),
          method = (path[2] || '').toLowerCase(),
          filepath = folder+action,
          self = this;
      // path
      try{
        var file = require(filepath);
        if(file[method]){

          var list = [];
          if(options.after)list.push(options.after);
          if(file['after']){list.push(file['after'])};
          list.push(file[method]);
          if(file['before'])list.push(file['before']);
          if(options.before)list.push(options.before);

          var iter = function*(){
            var i = list.length;
            var curr;

            while(i--){
                curr = list[i];
                var ret = yield* curr.apply(self,args);
                if(ret === false){
                  return ;
                }
            }
          }

          co(iter).catch(function(e){console.log(e)});

        }else{
          console.log('no match method');
          var errorhandle = options.error || noop;
          return yield * errorhandle.apply(self,args);  
        }
      }catch(e){
        console.log(e);
        var errorhandle = options.error || noop;
        return yield * errorhandle.apply(self,args);
      }

      return yield* next;
    }
}

function decode(val) {
  if (val) return decodeURIComponent(val);
}