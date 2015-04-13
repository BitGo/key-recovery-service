var restify = require('restify');
var CKS = require('../lib/cks');

// make a new http server with the correct name and routes
module.exports = function(config) {
  var cks = CKS(config);
  
  var server = restify.createServer({
    name: config.name,
  });

  server.use(restify.bodyParser());

  server.get('/', function(req, res, next) {
    res.send(config.name);
    next();
  });

  server.get(/^\/([a-zA-Z0-9_\.~-]+)\/(.*)/, cks.routeGetM.bind(cks));
  server.post('/m', cks.routePostM.bind(cks));

  return server;
};
