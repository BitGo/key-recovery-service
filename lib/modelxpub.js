var mongoose = require('mongoose');

var xpubschema = new mongoose.Schema({
  path: {type: String},
  xpub: {type: String},
  email: {type: String}
});

xpubschema.index({path: 1}, {unique: true});
xpubschema.index({xpub: 1}, {unique: true});
xpubschema.index({email: 1});

module.exports = mongoose.model('xpub', xpubschema);
