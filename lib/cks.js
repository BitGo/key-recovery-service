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

CKS.prototype.routePostM = function(req, res, next, opts) {
  var email = req.params.email;
  var path = this.randomPath(opts);
  this.post[path] = email;
  var xpub = this.deriveFromPath(path);
  res.send({
    path: path,
    xpub: xpub,
    email: email
  });
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
  var xpub = this.deriveFromPath(path);
  res.send({
    xpub: xpub,
    email: this.post[path]
  });
  return next();
};

CKS.prototype.deriveFromPath = function(path) {
  return this.hdnode.deriveFromPath(path).toBase58();
};

CKS.prototype.randomPath = function(opts) {
  function random(i) {
    var buf = (opts && opts.buf && opts.buf[i]) ? opts.buf[i] : crypto.randomBytes(4);
    // zero out first bit, since non-hardened indexes can be between 0 and 2^31
    buf[0] = buf[0] & 0x7f;
    return buf.readUInt32BE(0);
  };
  // in order to get at least 128 bits of entropy, we need 5 31 bit numbers
  return "m/" + random(0) + "/" + random(1) + "/" + random(2) + "/" + random(3) + "/" + random(4);
};
