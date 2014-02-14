exports.EMAIL_ACCOUNT = 'some@email.com';
exports.EMAIL_PASSWORD = 'email password';
exports.DB = 'site_watcher_example';
exports.USER = 'mysql user';
exports.PASSWORD = 'mysql password';

exports.URL = 'http://www.site.to.watch';
exports.TO_EMAIL = 'news.receiver@email.com';

var cheerio = require('cheerio');

exports.parse = function(data, cb) {
  // cheerio will let you use jQuery!
  var $ = cheerio.load(data);
  var items = [];

  // This example gets all <p> tags
  $('p').each(function() {
    var item = {};
    item.id = $(this).text();
    item.subject = $(this).text();
    item.html = '<h1>Test ' + $(this).text() + '</h1>';
    items.push(item);
  });
  cb(null, items);
};
