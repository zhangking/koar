var request = require('supertest');
var koa = require('koa');
var route = require('..');


describe('route params', function(){
  methods.forEach(function(method){
    var app = koa();

    app.use(route[method]('/:user(tj)', function*(user, next){
      yield next;
    }))

    app.use(route[method]('/:user(tj)', function*(user, next){
      this.body = user;
      yield next;
    }))

    app.use(route[method]('/:user(tj)', function*(user, next){
      this.status = 201;
    }))

    it('should work with method ' + method, function(done){
      request(app.listen())
        [method]('/tj')
        .expect(201)
        .expect(method === 'head' ? '' : 'tj', done);
    })
  })

  it('should work with method head when get is defined', function(done){
    var app = koa();

    app.use(route.get('/tj', function *(name){
      this.body = 'foo';
    }));

    request(app.listen())
    ['head']('/tj')
    .expect(200, done)
  })

  it('should be decoded', function(done){
    var app = koa();

    app.use(route.get('/package/:name', function *(name){
      name.should.equal('http://github.com/component/tip');
      done();
    }));

    request(app.listen())
    .get('/package/' + encodeURIComponent('http://github.com/component/tip'))
    .end(function(){});
  })

  it('should be null if not matched', function(done){
    var app = koa();

    app.use(route.get('/api/:resource/:id?', function *(resource, id){
      resource.should.equal('users');
      (id == null).should.be.true;
      done();
    }));

    request(app.listen())
    .get('/api/users')
    .end(function(){});
  })

  it('should use the given options', function(done){
    var app = koa();

    app.use(route.get('/api/:resource/:id', function *(resource, id){
      resource.should.equal('users');
      id.should.equal('1')
      done();
    }, { end: false }));

    request(app.listen())
      .get('/api/users/1/posts')
      .end(function(){});
  })
})
