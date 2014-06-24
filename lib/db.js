var mysql = require('mysql');
var config = require('../config');

// Check config file
if (!('USER' in config &&
  'PASSWORD' in config &&
  'DB' in config)) {
  throw 'Missing parameters in config file';
}

var pool = mysql.createPool({
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB
});

// Wrapper to get a pool connection and release before callback
function poolQuery(query, callback) {
  // callback(err, res)
  pool.getConnection(function(err, connection) {
    if (err) {
      if (connection) {
        connection.release();
      }
      return callback(err);
    }
    connection.query(query, function(err, res) {
      connection.release();
      return callback(err, res);
    });
  });
}

function createDB(callback) {
  var connection = mysql.createConnection({
    user: config.USER,
    password: config.PASSWORD
  });
  connection.connect(function(err) {
    if (err) {
      throw err;
    }
    connection.query('CREATE DATABASE IF NOT EXISTS ' + config.DB, function(err) {
      if (err) {
        throw err;
      }
      connection.end(callback);
    });
  });
}

function createTables(callback) {
  pool.getConnection(function(err, connection) {
    if (err) {
      throw err;
    }
    // A table to store unique keys
    connection.query('CREATE TABLE IF NOT EXISTS data(' +
      'id VARCHAR(255) NOT NULL PRIMARY KEY,' +
      'data TEXT NOT NULL)', function(err) {
        if (err) {
          throw err;
        }
        // Nothing went wrong release connection
        connection.release();
        callback();
      });
  });
}

var mustCall = setTimeout(function() {
  throw 'Must call init in DB';
}, 1000);

// Exported functions
exports.init = function(callback) {
  clearTimeout(mustCall);
  createDB(function(err) {
    if (err) {
      throw err;
    }
    createTables(callback);
  });
};
exports.getAll = function(callback) {
  // callback(err, res)
  poolQuery('SELECT id, data FROM data', callback);
};
exports.save = function(item, callback) {
  var escaped = pool.escape({
    id: item.id,
    data: JSON.stringify(item.data)
  });
  poolQuery('INSERT INTO data SET ' + escaped, function(err) {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Not new
        return callback(null, false);
      }
      return callback(err, false);
    }
    // Not a duplicate, its new!
    callback(err, true);
  });
};
exports.deleteInactive = function(active, callback) {
  if (active.length > 0) {
    poolQuery('DELETE FROM data WHERE id NOT IN (' +
      pool.escape(active) + ')', callback);
  } else {
    callback(null);
  }
};
