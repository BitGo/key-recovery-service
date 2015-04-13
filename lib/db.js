var mongoose = require('mongoose');
var Modelxpub = require('./modelxpub');

// make a new database connection and define the collections
module.exports = function (config) {
  mongoose.connect('mongodb://localhost/' + config.dbname);
  mongoose.connection.model('xpub', Modelxpub);
  return mongoose;
};
