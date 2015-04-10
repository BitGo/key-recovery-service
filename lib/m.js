var mongoose = require('mongoose');
var mongooseq = require('mongoose-q')(mongoose);

var mSchema = new mongoose.Schema({
  path: {type: String},
  xpub: {type: String},
  email: {type: String}
});

mSchema.index({path: 1}, {unique: true});
mSchema.index({xpub: 1}, {unique: true});
mSchema.index({email: 1});
