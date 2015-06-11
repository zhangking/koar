var debug = require('debug')('koar');
var pathToRegexp = require('path-to-regexp');
var co = require('co');
var fs = require('fs');
var noop = function*(){};

exports.create = create;

function create(options) {
    var folder = options.folder || './Controllers/';
    var router_map = {};

    fs.readdirSync(folder).forEach(function(filename){
      if(filename.indexOf('.js') > -1){
          var ctrl = require(folder + filename);
          filename = filename.replace('.js', '').toLowerCase();
          for(var i in ctrl){
            if(i!='before' && i!='after'){
              var list = router_map['/'+filename+'/'+i] = [];
              if(options.after)list.push(options.after);
              if(ctrl['after']){list.push(ctrl['after'])};
              list.push(ctrl[i]);
              if(ctrl['before'])list.push(ctrl['before']);
              if(options.before)list.push(options.before);
            }
          }
      }
    });

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

      var self = this;
      // path
      var handle = router_map[path];

      if(handle){

          var iter = function*(){
            var i = handle.length;
            var curr;

            while(i--){
                curr = handle[i];
                var ret = yield* curr.apply(self,args);
                if(ret === false){
                  return ;
                }
            }
          }

          yield co(iter).catch(function(e){console.log(e)});

          return yield* next;

      }else{
        var errorhandle = options.error || noop;
        return yield * errorhandle.apply(self,args);
      }
  }
}

function decode(val) {
  if (val) return decodeURIComponent(val);
}