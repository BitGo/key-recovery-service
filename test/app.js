var testutils = require('./testutils');
var request = require('supertest-as-promised');
var should = require('chai').should();
var server = require('../app/app')();

describe('Application Server', function() {
  var agent;
  before(function() {
    testutils.clearDatabase();
    agent = request.agent(server);
  });

  describe('GET /', function() {
    it('should return the name', function() {
      return agent
      .get('/')
      .then(function(res) {
        res.status.should.eql(200);
        res.body.name.should.equal(process.config.name);
      });
    });
  });
  
  describe('Provision new key', function() {
    it('no useruserEmail specified', function() {
      return agent
      .post('/key')
      .then(function(res) {
        res.status.should.eql(400);
      });
    });
    it('should return a new key', function() {
      return agent
      .post('/key')
      .send({userEmail: 'test@example.com'})
      .then(function(res) {
        res.status.should.eql(200);
        should.exist(res.body.path);
        res.body.path.substr(0, 2).should.equal('m/');
        should.exist(res.body.xpub);
        res.body.xpub.substr(0, 4).should.equal('xpub');
        res.body.userEmail.should.equal('test@example.com');
      });
    });
  });

  describe('Validate key', function() {
    var path;
    var xpub;
    var userEmail;

    before(function() {
      return agent
      .post('/key')
      .send({userEmail: 'test@example.com'})
      .then(function(res) {
        res.status.should.eql(200);
        path = res.body.path;
        xpub = res.body.xpub;
        userEmail = res.body.userEmail;
      });
    });

    it('invalid: user specified but not xpub', function() {
      return agent
      .get('/key/')
      .query({ userEmail: userEmail })
      .then(function(res) {
        res.status.should.not.eql(200);
      });
    });

    it('should validate the xpub after creating it', function() {
      return agent
      .get('/key/' + xpub)
      .query({ userEmail: userEmail })
      .then(function(res) {
        res.status.should.eql(200);

        res.body.path.should.eql(path);
        res.body.xpub.should.eql(xpub);
        res.body.userEmail.should.eql(userEmail);
      });
    });

    it('should not validate the xpub with incorrect userEmail', function() {
      return agent
      .get('/key/' + xpub)
      .query({ userEmail: 'otherEmail@mail.com' })
      .then(function(res) {
        res.status.should.eql(404);
      });
    });

    it('should not validate the xpub with incorrect xpub', function() {
      return agent
      .get('/key/xpub6J3LqcP2o8s2QhczVUUUWVKgRJpH594zeLt4AZ3Uvy5t73rtvKeEkhmUY4cauXbmHreNMGXbR6QRYZeqs1U77j4cmaW5JQa1zpEKdS9Uivn')
      .query({ userEmail: userEmail })
      .then(function(res) {
        res.status.should.eql(404);
      });
    });
  });
});
