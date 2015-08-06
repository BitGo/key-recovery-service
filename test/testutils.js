process.config = require('../config');
process.config.dbname = "key-recovery-service-test";
process.config.mail = undefined;

var mongoose = require('../app/db');
var Q = require('q');

mongoose.connection.on('error', function(err) {
  throw new Error(err);
});
mongoose.connection.once('open', function() {
  console.log('mongoose init successful');
});

exports.mongoose = mongoose;
exports.clearDatabaseQ = function() {
  var deferred = Q.defer();
  var connection = exports.mongoose.createConnection(process.config.dbname, function(err) {
    connection.db.dropDatabase(function() {
      connection.close();
      deferred.resolve();
    });
  });
  return deferred.promise;
};