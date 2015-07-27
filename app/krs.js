var HDNode = require('./lib/hdnode');
var crypto = require('crypto');
var assert = require('assert');
var _ = require('lodash');

var utils = require('./utils');
var Key = require('./models/key');
var RecoveryRequest = require('./models/recoveryrequest');

if (process.config.masterxpub.substr(0, 4) !== 'xpub') {
  throw new Error('masterxpub must start with "xpub"');
}

var masterHDNode = HDNode.fromBase58(process.config.masterxpub);

exports.provisionKey = function(req) {
  var userEmail = req.body.userEmail;
  if (!userEmail) {
    throw utils.ErrorResponse(400, 'userEmail required');
  }

  var custom = req.body.custom || {};
  custom.created = new Date();

  var path = exports.randomPath();
  var xpub = exports.deriveFromPath(path);
  var key = new Key({
    path: path,
    xpub: xpub,
    userEmail: userEmail,
    custom: custom
  });

  return key.saveQ();
};

exports.validateKey = function(req) {
  var userEmail = req.params.userEmail;
  var xpub = req.params.xpub;

  if (_.isEmpty(userEmail) || _.isEmpty(xpub)) {
    throw utils.ErrorResponse(400, 'userEmail and xpub required');
  }

  return Key.findOneQ({userEmail: userEmail, xpub: xpub})
  .then(function(key) {
    if (!key) {
      throw utils.ErrorResponse(404, 'key and username combination not found');
    }
    return key;
  });
};

exports.requestRecovery = function(req) {
  var xpub = req.body.xpub;
  var userEmail = req.body.userEmail;
  var transactionHex = req.body.transactionHex;
  var inputs = req.body.inputs;
  var custom = req.body.custom;

  if (_.isEmpty(xpub) || _.isEmpty(userEmail) || _.isEmpty(transactionHex) || _.isEmpty(inputs)) {
    throw utils.ErrorResponse(400, 'xpub, userEmail, transactionHex and inputs required');
  }

  var recoveryRequest = new RecoveryRequest({
    xpub: xpub,
    userEmail: userEmail,
    transactionHex: transactionHex,
    inputs: inputs,
    custom: custom
  });

  return recoveryRequest.saveQ()
  .then(function(result) {
    return {
      id: result._id,
      created: result.created
    }
  });
};

exports.deriveFromPath = function(path) {
  return masterHDNode.deriveFromPath(path).toBase58();
};

exports.randomPath = function() {
  function random(i) {
    var buf = crypto.randomBytes(4);
    // zero out first bit, since non-hardened indexes can be between 0 and 2^31
    buf[0] = buf[0] & 0x7f;
    return buf.readUInt32BE(0);
  };
  // in order to get at least 128 bits of entropy, we need 5 31 bit numbers
  return "m/" + random(0) + "/" + random(1) + "/" + random(2) + "/" + random(3) + "/" + random(4);
};
