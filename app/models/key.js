var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var _ = require('lodash');

var xpubSchema = new mongoose.Schema({
  path: {type: String},
  xpub: {type: String},
  userEmail: {type: String},
  custom: {}
});

xpubSchema.methods = {
  toJSON: function() {
    return _.pick(this, ['path', 'xpub', 'userEmail', 'custom']);
  }
};

xpubSchema.index({path: 1}, {unique: true});
xpubSchema.index({xpub: 1}, {unique: true});
xpubSchema.index({email: 1});

module.exports = mongoose.connection.model('xpub', xpubSchema);
