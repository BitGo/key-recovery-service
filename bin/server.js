var restify = require('restify');
var cks = require('../lib/cks');

var server = restify.createServer({
  name: 'Cold Key Service',
});

function getxpub(req, res, next) {
  var index = parseInt(req.params.index);
  var xpub = cks.derivexpub(index);
  res.send({xpub: xpub});
  return next();
};

server.get('/xpub/:index', getxpub);

var port = 8080;
server.listen(port);
console.log('listening on ' + port);

