var HDNode = require('./hdnode');
var crypto = require('crypto');
var assert = require('assert');

var CKS = function CKS(config) {
  if (!(this instanceof CKS))
    return new CKS(config);

  this.config = config;
  var xpub = config.masterxpub;
  if (xpub.substr(0, 4) !== 'xpub') {
    throw new Error('masterxpub must start with "xpub"');
  }
  this.hdnode = HDNode.fromBase58(xpub);
  this.post = {};
};

module.exports = CKS;

CKS.prototype.routeDerive = function(req, res, next) {
  var index = parseInt(req.params.index);
  var xpub = this.derive(index);
  res.send({xpub: xpub});
  return next();
};

CKS.prototype.routePostM = function(req, res, next) {
  res.send({error: "not supported yet"});
  return next();
};

CKS.prototype.routeGetM = function(req, res, next) {
  var path = req.params[0];
  if (path !== 'm') {
    res.send({error: 'invalid path'});
    return next();
  }
  if (req.params[1]) {
    path = path + '/' + req.params[1];
  }
  if (path === 'm/') {
    res.send({error: 'invalid path'});
    return next();
  }
  console.log('path: ' + path);
  var xpub = this.deriveFromPath(path);
  res.send({xpub: xpub});
  return next();
};

CKS.prototype.derive = function (index) {
  return this.hdnode.derive(index).toBase58();
};

CKS.prototype.deriveFromPath = function(path) {
  return this.hdnode.deriveFromPath(path).toBase58();
};
