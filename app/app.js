var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var utils = require('./utils');
var krs = require('./krs');

module.exports = function(args) {
  args = args || {};
  var app = express();

  // Set up morgan for logging, with optional logging into a file
  if (args.logfile) {
    // create a write stream (in append mode)
    var accessLogPath = path.resolve(args.logfile);
    var accessLogStream = fs.createWriteStream(accessLogPath, {flags: 'a'});
    console.log('Log location: ' + accessLogPath);
    // setup the logger
    app.use(morgan('combined', {stream: accessLogStream}))
  } else {
    app.use(morgan('combined'));
  }

  app.use(bodyParser.urlencoded({extended: false, limit: '1mb'}));
  app.use(bodyParser.json({limit: '1mb'}));

  app.get('/', function (req, res, next) {
    res.send({ name: process.config.name });
    next();
  });

  app.post('/key', utils.promiseWrapper(krs.provisionKey));
  app.get('/key/:xpub', utils.promiseWrapper(krs.validateKey));
  app.post('/recover', utils.promiseWrapper(krs.requestRecovery));

  return app;
};