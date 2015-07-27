var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var _ = require('lodash');

var keySchema = new mongoose.Schema({
  path: {type: String},
  xpub: {type: String},
  userEmail: {type: String},
  custom: {}
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
