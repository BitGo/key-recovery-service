var request = require('supertest');
var should = require('chai').should();
var server = require('../lib/server');

describe('server', function() {
  
  describe('GET /derive/:index', function() {
    
    it('should return the correct xpub for the 0th index', function(done) {
      request(server)
      .get('/derive/0')
      .end(function(err, res) {
        if (err) return done(err);
        res.body.xpub.should.equal('xpub6AfzaTPTLCnsBW1nPqW2pGweQUz8NEcWHaoQEu1jQtc35Rq8tbMQPgxo92gnYrbcGDbnaCSvyFNX1mZv2YTxroYU3ivK4WtTm9VcjADFtUM');
        done();
      });
    });

  });

  describe('POST /m', function() {
    
    it('should return a new path', function(done) {
      request(server)
      .post('/m')
      .send({email: 'test@example.com'})
      .end(function(err, res) {
        should.exist(res.body.path);
        res.body.path.substr(0, 2).should.equal('m/');
        should.exist(res.body.xpub);
        res.body.xpub.substr(0, 4).should.equal('xpub');
        res.body.email.should.equal('test@example.com');
        done();
      });
    });

  });

});
