var request = require('q-supertest');
var should = require('chai').should();
var config = require('../config');

config.dbname = "cold-key-service-test";

var server = require('../lib/server')(config);
var mongoose;

describe('server', function() {

  before(function(done) {
    mongoose = require('../lib/db')(config);
    mongoose.connection.on('error', function(err) {
      throw new Error(err);
    });
    mongoose.connection.once('open', function() {
      done();
    });
  });

  after(function() {
    mongoose.connection.db.dropDatabase();
  });

  describe('GET /', function() {

    it('should return the name', function() {
      return request(server)
      .get('/')
      .then(function(res) {
        res.body.should.equal(config.name);
      });
    });

  });
  
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
    
    it('should get the path after creating it', function() {
      return request(server)
      .get('/' + path)
      .then(function(res) {
        should.exist(res.body.xpub);
        res.body.xpub.should.equal(xpub);
        should.exist(res.body.email);
        res.body.email.should.equal(email);
      });
    });

    it('should not return a path that has not been created', function() {
      var path = "m/0/1/2/3/4";
      return request(server)
      .get(path)
      .then(function(res) {
        res.error.toString().substr(0, 17).should.equal('Error: cannot GET');
      });
    });

    it('should not return the master xpub on /m', function() {
      var path = "/m"
      return request(server)
      .get(path)
      .then(function(res) {
        res.body.message.should.equal('GET is not allowed');
      });
    });

    it('should not return the master xpub on /m/', function() {
      var path = "/m/";
      return request(server)
      .get(path)
      .then(function(res) {
        should.exist(res.error);
        res.error.toString().substr(0, 17).should.equal('Error: cannot GET');
      });
    });

    it('should not return an invalid path', function() {
      var path = '/w/0/1/2/3/4';
      return request(server)
      .get(path)
      .then(function(res) {
        should.exist(res.error);
        res.error.toString().substr(0, 17).should.equal('Error: cannot GET');
      });
    });

  });

});
