var co = require('co');

var before = function *(next){
	var a = yield work;
	var s = yield [a];

	console.log(s);

	console.log('before');
}

var after = function *(){
	console.log('after');
}

var show = function *(name){
	this.body = 'hello ' + name;
}

function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}

function *work() {
  yield sleep(5000);
  return 'yay';
}


exports.show = show;
exports.before = before;
exports.after = after;
