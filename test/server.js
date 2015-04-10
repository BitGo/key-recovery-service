var request = require('q-supertest');
var should = require('chai').should();
var server = require('../lib/server');

describe('server', function() {
  
  describe('POST /m', function() {
    
    it('should return a new path', function() {
      return request(server)
      .post('/m')
      .send({email: 'test@example.com'})
      .then(function(res) {
        should.exist(res.body.path);
        res.body.path.substr(0, 2).should.equal('m/');
        should.exist(res.body.xpub);
        res.body.xpub.substr(0, 4).should.equal('xpub');
        res.body.email.should.equal('test@example.com');
      });
    });

  });

  describe('GET /m', function() {
    var path;
    var xpub;
    var email;

    before(function() {
      return request(server)
      .post('/m')
      .send({email: 'test@example.com'})
      .then(function(res) {
        path = res.body.path;
        xpub = res.body.xpub;
        email = res.body.email;
      });
    });
    
    it('should the path after creating it', function() {
      return request(server)
      .get('/' + path)
      .then(function(res) {
        should.exist(res.body.xpub);
        res.body.xpub.should.equal(xpub);
        should.exist(res.body.email);
        res.body.email.should.equal(email);
      });
    });

  });

});
