var server = require('../lib/server');
var config = require('../config');

var host = config.host;
var port = config.port;
server.listen(port);
console.log("listening http://" + host + ":" + port);

