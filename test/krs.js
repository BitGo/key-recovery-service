var KRS = require('../lib/krs');
var HDNode = require('../lib/hdnode');
var should = require('chai').should();

describe('KRS', function() {
  var seed = new Buffer(512 / 8);
  seed.fill(0); // the seed for testing purposes is all 0s
  var hdnode = HDNode.fromSeedBuffer(seed);
  var masterxprv = hdnode.toBase58();
  var masterxpub = hdnode.neutered().toBase58();
  var config = {
    masterxpub: masterxpub
  };
  var krs = KRS(config);

  describe('KRS', function() {
    
    it('should not accept invalid configuration', function() {
      (function() {
        KRS({masterxpub: 'ypub'});
      }).should.throw('masterxpub must start with "xpub"');
    });

  });

  describe('routePostM', function() {

    it('should should return an error is the save fails', function(done) {
      var Modelxpub = function() {
        this.save = function(callback) {
          return callback(true);
        }
      };
      var krs = KRS(config, Modelxpub);
      var req = {params: []};
      var res = {
        send: function(errnum, err) {
          errnum.should.equal(400);
          err.toString().should.equal('Error: error creating xpub');
        }
      };
      krs.routePostM(req, res, function() {
        done();
      });
    });

  });

  describe('routeGetM', function() {

    it('should not get an invalid path', function(done) {
      var req = {
        params: ["n", "0"]
      };
      var res = {
        send: function(errnum, err) {
          errnum.should.equal(400);
          err.toString().should.equal('Error: invalid path');
        }
      };
      krs.routeGetM(req, res, function() {
        done();
      });
    });

    it('should not get a path that does not exist in the db', function(done) {
      var Modelxpub = {
        findOne: function(query, callback) {
          return callback(null, null);
        }
      };
      var krs = KRS(config, Modelxpub);
      var req = {
        params: ["m", "words"]
      };
      var res = {
        send: function(errnum, err) {
          errnum.should.equal(400);
          err.toString().should.equal('Error: invalid path');
        }
      };
      krs.routeGetM(req, res, function() {
        done();
      });
    });

    it('should not get a path if there is a db error', function(done) {
      var Modelxpub = {
        findOne: function(query, callback) {
          return callback(true);
        }
      };
      var krs = KRS(config, Modelxpub);
      var req = {
        params: ["m", "/0/1/2/3/4"]
      };
      var res = {
        send: function(errnum, err) {
          errnum.should.equal(400);
          err.toString().should.equal('Error: error getting xpub');
        }
      };
      krs.routeGetM(req, res, function() {
        done();
      });
    });

  });

  describe('deriveFromPath', function() {
    
    it('should derive the 0th xpub correctly', function() {
      krs.deriveFromPath('m/0').should.equal('xpub69Kk9nrHX5qoe1Vx7eC4aiFSH6tTPghhkC278qz4sCBumPiNn6CTEYNugh5HD7qVPiHtRYE9wosY96K3DEcefGK1gn54fhgvnhV4BPQtUxi');
    });

    it('should not derive invalid paths', function() {
      (function() {
        krs.deriveFromPath("word");
      }).should.throw('invalid path');
      (function() {
        krs.deriveFromPath("m/word'");
      }).should.throw('invalid path');
      (function() {
        krs.deriveFromPath("m/word'");
      }).should.throw('invalid path');
      (function() {
        krs.deriveFromPath("m/" + (Math.pow(2, 32) + 1));
      }).should.throw('value is out of bounds');
      (function() {
        krs.deriveFromPath("m/" + (Math.pow(2, 31) + 1));
      }).should.throw('Could not derive hardened child key');
    });

  });

  describe('randomPath', function() {

    it('should derive a random path', function() {
      krs.randomPath().substr(0, 2).should.equal('m/');
    });

    it('should allow deriving a deterministic path', function() {
      var buf = new Buffer(4);
      buf.fill(0);
      var opts = {buf: [buf, buf, buf, buf, buf]};
      krs.randomPath(opts).should.equal('m/0/0/0/0/0');
    });

    it('should zero out the first bit in the optional buffers', function() {
      var buf = new Buffer(4);
      buf.fill(0);
      buf[0] = 0x80;
      var opts = {buf: [buf, buf, buf, buf, buf]};
      krs.randomPath(opts).should.equal('m/0/0/0/0/0');
    });

  });

});
