process.config = require('../config');

var db = require('../app/db');
var server = require('../app/app')();

var host = process.config.host;
var port = process.config.port;

db.connection.on('error', console.error.bind(console, 'database connection error: '));
db.connection.once('open', function () {
  server.listen(port);
  console.log("listening http://" + host + ":" + port);
});
