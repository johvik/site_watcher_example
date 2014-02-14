var nodemailer = require('nodemailer');
var config = require('../config');

// Check config file
if (!('EMAIL_ACCOUNT' in config &&
  'EMAIL_PASSWORD' in config)) {
  throw 'Missing parameters in config file';
}

var smtpTransport = nodemailer.createTransport('SMTP', {
  auth: {
    user: config.EMAIL_ACCOUNT,
    pass: config.EMAIL_PASSWORD
  }
});

exports.send = function(to, subject, html, callback) {
  var mailOptions = {
    from: 'Site watcher <' + config.EMAIL_ACCOUNT + '>',
    to: to,
    subject: subject,
    generateTextFromHTML: true,
    html: html
  };
  smtpTransport.sendMail(mailOptions, callback);
};
