var restify = require('restify');
var KRS = require('../lib/krs');

// make a new http server with the correct name and routes
module.exports = function(config) {
  var krs = KRS(config);
  
  var server = restify.createServer({
    name: config.name,
  });

  server.use(restify.bodyParser());

  server.get('/', function(req, res, next) {
    res.send(config.name);
    next();
  });

  server.get(/^\/([a-zA-Z0-9_\.~-]+)\/(.*)/, krs.routeGetM.bind(krs));
  server.post('/m', krs.routePostM.bind(krs));

  return server;
};
