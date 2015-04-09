var CKS = require('../lib/cks');
var HDNode = require('bitcoinjs-lib/src/hdnode');
var should = require('chai').should();

describe('CKS', function() {
  var seed = new Buffer(512 / 8);
  seed.fill(0); // the seed for testing purposes is all 0s
  var hdnode = HDNode.fromSeedBuffer(seed);
  var xprv = hdnode.toBase58();
  var xpub = hdnode.neutered().toBase58();
  var cks = CKS({
    xpub: xpub
  });

  describe('derive', function() {
    
    it('should derive the 0th xpub correctly', function() {
      cks.derive(0).should.equal('xpub69Kk9nrHX5qoe1Vx7eC4aiFSH6tTPghhkC278qz4sCBumPiNn6CTEYNugh5HD7qVPiHtRYE9wosY96K3DEcefGK1gn54fhgvnhV4BPQtUxi');
    });

  });

  describe('routeDerive', function() {

    it('should return the 0th xpub correctly', function(done) {
      var json;
      var req = {
        params: {index: '0'}
      };
      var res = {
        send: function(obj) {
         json = obj;
        }
      };
      var next = function() {
        json.xpub.should.equal('xpub69Kk9nrHX5qoe1Vx7eC4aiFSH6tTPghhkC278qz4sCBumPiNn6CTEYNugh5HD7qVPiHtRYE9wosY96K3DEcefGK1gn54fhgvnhV4BPQtUxi');
        done();
      };
      cks.routeDerive(req, res, next);
    });

  });

});
