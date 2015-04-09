var HDNode = require('bitcoinjs-lib/src/hdnode');
var crypto = require('crypto');
var assert = require('assert');

var CKS = function CKS(config) {
  if (!(this instanceof CKS))
    return new CKS(config);

  this.config = config;
  var xpub = config.xpub;
  if (xpub.substr(0, 4) !== 'xpub') {
    throw new Error('xpub must start with "xpub"');
  }
  this.hdnode = HDNode.fromBase58(config.xpub);
};

module.exports = CKS;

CKS.prototype.routeDerive = function(req, res, next) {
  var index = parseInt(req.params.index);
  var xpub = this.derive(index);
  res.send({xpub: xpub});
  return next();
};

CKS.prototype.derive = function (index) {
  return this.hdnode.derive(index).toBase58();
};
