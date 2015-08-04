var express = require('express');
var bodyParser = require('body-parser');

var utils = require('./utils');
var krs = require('./krs');

module.exports = function() {
  var app = express();

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