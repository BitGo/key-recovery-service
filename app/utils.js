var Q = require('q');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jsrender = require('node-jsrender');

if (process.config.mail) {
  // create reusable transporter object using SMTP transport
  var mailTransport = nodemailer.createTransport(smtpTransport(process.config.mail));
  var sendMail = Q.nbind(mailTransport.sendMail, mailTransport);
}

// prepare templates using jsrender
jsrender.loadFileSync('newkeytemplate', './app/templates/newkeytemplate.html');
jsrender.loadFileSync('recoveryusertemplate', './app/templates/recoveryusertemplate.html');
jsrender.loadFileSync('recoveryadmintemplate', './app/templates/recoveryadmintemplate.html');

// Error response container for handling by the promise wrapper
exports.ErrorResponse = function(status, result) {
  var err = new Error('');
  err.status = status;
  err.result = result;
  return err;
};

// Promise handler wrapper to handle sending responses and error cases
exports.promiseWrapper = function(promiseRequestHandler) {
  return function (req, res, next) {
    Q.fcall(promiseRequestHandler, req, res, next)
    .then(function (result) {
      var status = 200;
      if (result.__redirect) {
        res.redirect(result.url);
        status = 302;
      } else if (result.__render) {
        res.render(result.template, result.params);
      } else {
        res.status(status).send(result);
      }
    })
    .catch(function(caught) {
      var err;
      if (caught instanceof Error) {
        err = caught;
      } else if (typeof caught === 'string') {
        err = new Error("(string_error) " + caught);
      } else {
        err = new Error("(object_error) " + JSON.stringify(caught));
      }

      var message = err.message || 'local error';
      // use attached result, or make one
      var result = err.result || {error: message};
      var status = err.status || 500;
      if (!(status >= 200 && status < 300)) {
        // console.log('error %s: %s', status, err.message);
      }
      if (status == 500) {
        console.log(err.stack);
      }
      res.status(status).send(result);
    })
    .done();
  };
};

exports.sendMailQ = function(toEmail, subject, template, templateParams, attachments) {
  // If mail not configured, don't send
  if (!process.config.mail) {
    return false;
  }

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: process.config.mail.fromemail,
    to: toEmail,
    subject: subject, // Subject line
    attachments: attachments
  };

  mailOptions.html = jsrender.render[template](templateParams);

  // send mail with defined transport object
  return sendMail(mailOptions);
};