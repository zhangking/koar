
var before = function *(next){
	console.log('before');
}

var after = function *(){
	console.log('after');
}

var show = function *(name){
	this.body = 'hello ' + name;
}


exports.show = show;
exports.before = before;
exports.after = after;
