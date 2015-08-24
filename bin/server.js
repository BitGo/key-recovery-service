var argumentParser = require('argparse').ArgumentParser;
var fs = require('fs');
var http = require('http');
var https = require('https');
var pjson = require('../package.json');

process.config = require('../config');
var db = require('../app/db');

// Handle arguments
var getArgs = function () {
  var parser = new argumentParser({
    version: pjson.version,
    addHelp: true,
    description: 'Key Recovery Service'
  });

  parser.addArgument(
  ['-p', '--port'], {
    help: 'Port to listen on'
  });

  parser.addArgument(
  ['-b', '--bind'], {
    help: 'Bind to given address to listen for connections (default: localhost)'
  });

  parser.addArgument(
  ['-d', '--debug'], {
    action: 'storeTrue',
    help: 'Debug logging'
  });

  parser.addArgument(
  ['-k', '--keypath'], {
    help: 'Path to the SSL Key file (required if running production)'
  });

  parser.addArgument(
  ['-c', '--crtpath'], {
    help: 'Path to the SSL Crt file (required if running production)'
  });

  parser.addArgument(
  ['-l', '--logfile'], {
    help: 'Filepath to write the access log'
  });

  return parser.parseArgs();
};

var args = getArgs();
var app = require('../app/app')(args);

var baseUri = "http";
if (args.keypath && args.crtpath) {
  // Run in SSL mode
  var privateKey  = fs.readFileSync(args.keypath, 'utf8');
  var certificate = fs.readFileSync(args.crtpath, 'utf8');
  var credentials = {key: privateKey, cert: certificate};
  baseUri += "s";
  server = https.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

var host = args.bind || process.config.host || 'localhost';
var port = args.port || process.env.PORT || process.config.port || 80;

db.connection.on('error', console.error.bind(console, 'database connection error: '));
db.connection.once('open', function () {
  server.listen(port, host);

  baseUri += "://" + host;
  if (!((port == 80 && !args.keypath) || (port == 443 && args.keypath))) {
    baseUri += ":" + port;
  }
  console.log('Listening on: ' + baseUri);
});
