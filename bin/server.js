var config = require('../config');
var mongoose = require('../lib/db')(config);
var server = require('../lib/server')(config);

var host = config.host;
var port = config.port;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error:'));
db.once('open', function () {
  server.listen(port);
  console.log("listening http://" + host + ":" + port);
});
