var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var _ = require('lodash');

var keySchema = new mongoose.Schema({
  path: {type: String},
  xpub: {type: String},
  userEmail: {type: String},
  notificationURL: {type: String},
  custom: {},
  requesterId: {type: String},
  masterxpub: {type: String} // support future cases where we may use more than one master xpub
});

keySchema.methods = {
  toJSON: function() {
    return _.pick(this, ['path', 'xpub', 'userEmail', 'custom']);
  }
};

keySchema.index({path: 1}, {unique: true});
keySchema.index({xpub: 1}, {unique: true});
keySchema.index({email: 1});

module.exports = mongoose.connection.model('key', keySchema);
