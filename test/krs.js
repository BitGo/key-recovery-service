var testutils = require('./testutils');
var should = require('chai').should();
var Q = require('q');

var KRS = require('../app/krs');
var HDNode = require('../app/lib/hdnode');
var Key = require('../app/models/key');

describe('KRS Controller', function() {
  var seed = new Buffer(512 / 8);
  seed.fill(0); // the seed for testing purposes is all 0s
  var hdnode = HDNode.fromSeedBuffer(seed);
  var masterxprv = hdnode.toBase58();
  var masterxpub = hdnode.neutered().toBase58();
  var config = {
    masterxpub: masterxpub
  };

  describe('provisionKey', function() {
    it('should return an error if the userEmail was missing', function() {
      return Q()
      .then(function() {
        return KRS.provisionKey({body: {}})
      })
      .then(function() {
        throw new Error("should not succeed");
      })
      .catch(function(error) {
        error.status.should.eql(400);
        error.result.should.eql('userEmail required');
      });
    });
  });

  describe('validateKey', function() {
    it('should return an error email and xpub not found', function() {
      return Q()
      .then(function() {
        return KRS.validateKey({params: {userEmail: 'invalid@other.com', xpub: 'abcdef'}})
      })
      .then(function() {
        throw new Error("should not succeed");
      })
      .catch(function(error) {
        error.status.should.eql(400);
        error.result.should.eql('userEmail and xpub required');
      });
    });
  });

  describe('deriveFromPath', function() {
    it('should derive the 0th xpub correctly', function() {
      KRS.deriveFromPath('m/0').should.equal('xpub6AfzaTPTLCnsBW1nPqW2pGweQUz8NEcWHaoQEu1jQtc35Rq8tbMQPgxo92gnYrbcGDbnaCSvyFNX1mZv2YTxroYU3ivK4WtTm9VcjADFtUM');
    });

    it('should derive the up to 4 levels correctly', function() {
      KRS.deriveFromPath('m/50/50/50/50').should.equal('xpub6GJrTAP2YkzYNV2vbLoBwoeiaAJ4zB36NUQM6X7dgrJmN4tfpip4tpckMEa3nAs7F1qHkZxZWJdnDfVrDE1yER6ZPAnpuajDZTv67zuvwBy');
    });

    it('should not derive invalid paths', function() {
      (function() {
        KRS.deriveFromPath("word");
      }).should.throw('invalid path');
      (function() {
        KRS.deriveFromPath("m/word'");
      }).should.throw('invalid path');
      (function() {
        KRS.deriveFromPath("m/word'");
      }).should.throw('invalid path');
      (function() {
        KRS.deriveFromPath("m/" + (Math.pow(2, 32) + 1));
      }).should.throw('value is out of bounds');
      (function() {
        KRS.deriveFromPath("m/" + (Math.pow(2, 31) + 1));
      }).should.throw('Could not derive hardened child key');
    });
  });

  describe('randomPath', function() {
    it('should derive a random path', function() {
      KRS.randomPath().substr(0, 2).should.equal('m/');
    });
  });
});
