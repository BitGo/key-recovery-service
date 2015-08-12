var HDNode = require('./lib/hdnode');
var crypto = require('crypto');
var assert = require('assert');
var mongoose = require('mongoose');
var moment = require('moment');
var validator = require('validator');
var Q = require('q');
var _ = require('lodash');

var utils = require('./utils');
var Key = require('./models/key');
var RecoveryRequest = require('./models/recoveryrequest');

if (process.config.masterxpub.substr(0, 4) !== 'xpub') {
  throw new Error('masterxpub must start with "xpub"');
}

exports.provisionKey = function(req) {
  var userEmail = req.body.userEmail;
  if (!userEmail) {
    throw utils.ErrorResponse(400, 'userEmail required');
  }
  if (!validator.isEmail(userEmail)) {
    throw utils.ErrorResponse(400, 'email invalid');
  }

  var custom = req.body.custom || {};
  custom.created = new Date();

  var path = exports.randomPath();
  var xpub = exports.deriveFromPath(path);
  var key = new Key({
    path: path,
    xpub: xpub,
    userEmail: userEmail,
    custom: custom,
    masterxpub: process.config.masterxpub
  });

  return key.saveQ()
  .then(function(result) {
    return utils.sendMailQ(
      userEmail,
      "Information about your backup key",
      "newkeytemplate",
      {
        xpub: xpub,
        servicename: process.config.name,
        serviceurl: process.config.serviceurl,
        adminemail: process.config.adminemail,
        useremail: userEmail
      }
    )
    .catch(function(e) {
      throw utils.ErrorResponse(503, "Problem sending email");
    });
  })
  .then(function() {
    return key;
  });
};

exports.validateKey = function(req) {
  var userEmail = req.query && req.query.userEmail;
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

  var recoveryRequest = {
    xpub: xpub,
    userEmail: userEmail,
    transactionHex: transactionHex,
    inputs: inputs,
    custom: custom
  };

  var sendEmailToUser = function() {
    return utils.sendMailQ(
      userEmail,
      "Bitcoin Recovery request initiated on " + process.config.name + " using your backup key",
      "recoveryusertemplate",
      {
        xpub: xpub,
        servicename: process.config.name,
        serviceurl: process.config.serviceurl,
        adminemail: process.config.adminemail,
        useremail: userEmail,
        message: custom && custom.message
      }
    );
  };

  var sendEmailToAdmin = function() {
    return utils.sendMailQ(
      process.config.adminemail,
      "Bitcoin Recovery request initiated on " + process.config.name + " for " + userEmail,
      "recoveryadmintemplate",
      {
        xpub: xpub,
        servicename: process.config.name,
        serviceurl: process.config.serviceurl,
        useremail: userEmail,
        message: custom && custom.message
      },
      // The attachments
      [
        {
          filename: 'recovery_' + xpub + '_' + moment().format('YYYYMDHm') + '.json',
          content: JSON.stringify(recoveryRequest)
        }
      ]
    );
  };

  var result;
  return Key.findOneQ({userEmail: userEmail, xpub: xpub})
  .then(function(key) {
    if (!key) {
      // no matching key found, return a fake result to throw spammers off
      result = {
        _id: mongoose.Types.ObjectId().toString(),
        created: new Date()
      };
      return result;
    }
    recoveryRequest.masterxpub = key.masterxpub;
    recoveryRequest.chainPath = key.path; // the chain path of this user
    return Q.all([RecoveryRequest.createQ(recoveryRequest), sendEmailToAdmin(), sendEmailToUser()])
    .spread(function(saveResult, emailToAdminResult, emailToUserResult) {
      result = saveResult;
    });
  })
  .then(function() {
    return {
      id: result._id,
      created: result.created
    };
  });
};

exports.deriveFromPath = function(path) {
  var masterHDNode = HDNode.fromBase58(process.config.masterxpub);
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
