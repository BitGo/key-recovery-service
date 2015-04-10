var CKS = require('../lib/cks');
var HDNode = require('../lib/hdnode');
var should = require('chai').should();

describe('CKS', function() {
  var seed = new Buffer(512 / 8);
  seed.fill(0); // the seed for testing purposes is all 0s
  var hdnode = HDNode.fromSeedBuffer(seed);
  var masterxprv = hdnode.toBase58();
  var masterxpub = hdnode.neutered().toBase58();
  var cks = CKS({
    masterxpub: masterxpub
  });

  describe('deriveFromPath', function() {
    
    it('should derive the 0th xpub correctly', function() {
      cks.deriveFromPath('m/0').should.equal('xpub69Kk9nrHX5qoe1Vx7eC4aiFSH6tTPghhkC278qz4sCBumPiNn6CTEYNugh5HD7qVPiHtRYE9wosY96K3DEcefGK1gn54fhgvnhV4BPQtUxi');
    });

  });

});
