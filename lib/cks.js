var bitcoin = require('bitcoinjs-lib');
var crypto = require('crypto');
var config = require('../config');

var hdnode = new bitcoin.HDNode.fromBase58(config.xpub);

var CKS = {};
module.exports = CKS;

CKS.derivexpub = function(index) {
  return hdnode.derive(index).neutered().toBase58();
};
