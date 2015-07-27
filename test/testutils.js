process.config = require('../config');
process.config.dbname = "key-recovery-service-test";

var mongoose = require('../app/db');
mongoose.connection.on('error', function(err) {
  throw new Error(err);
});
mongoose.connection.once('open', function() {
  console.log('mongoose init successful');
});

exports.mongoose = mongoose;
exports.clearDatabase = function() {
  return exports.mongoose.connection.db.dropDatabase();
};