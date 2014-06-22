var sw = require('site_watcher').SiteWatcher;
var _ = require('lodash');
var config = require('../config');
var mail = require('./mail');
var db = require('./db');

// Check config file
if (!('URL' in config &&
  'parse' in config &&
  'TO_EMAIL' in config)) {
  throw 'Missing parameters in config file';
}

var prev_length = -1;

db.init(function() {
  // Create a new watcher
  var w = new sw(config.URL,
    // Run every 5 min
    '*/5 * * * *', {
      parse: config.parse,
      save: function(item, cb) {
        // This example assumes that item has an id field
        // and subject + html fields for the email

        // Store the item
        db.save(item, function(err, isNew) {
          if (err) {
            return cb(err);
          }
          // Send an email if it is a new item
          if (isNew) {
            console.log('Sending mail', item.id);
            return mail.send(config.TO_EMAIL, item.subject, item.html, cb);
          }
          // Otherwise just return
          return cb(null);
        });
      },
      cleanup: function(items, cb) {
        var ids = _.pluck(items, 'id');
        db.deleteInactive(ids, function(err) {
          // Also pass the items to the callback
          cb(err, items);
        });
      }
    }, function(err, items) {
      if (err || items.length !== prev_length) {
        console.log('Update done ' + new Date(), err, items.length);
        prev_length = items.length;
      }
    });
  // Start the watcher
  w.start();
});
