# koa_r

 a simple route middleware for koa.


## Installation

npm install koa_r

## Example

  Contrived resource-oriented example:

```js
var r = require('./');
var koa = require('koa');
var app = koa();


app.use(r.create({
  folder:'./Controllers/',
  before:function*(){},
  after:function*(){},
  error:function*(){this.body = 'error'},
  map:{
    '/user/:name':'/user/show'
  }
}));

app.use(function*(){
  console.log(1);
});


app.listen(3000);
console.log('listening on port 3000');
```

## License

  MIT
