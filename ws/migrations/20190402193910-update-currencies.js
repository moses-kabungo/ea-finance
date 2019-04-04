"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  // unique currency code
  function createUniqueSymbolsIndex(err) {
    if (err) {
      return callback(err);
    }
    return db.addIndex(
      "currencies",
      "idx_unique_currency_code",
      ["code"],
      true,
      callback
    );
  }
  // unique currency name
  return db.addIndex(
    "currencies",
    "idx_unique_currency_name",
    ["name"],
    true,
    createUniqueSymbolsIndex
  );
};

exports.down = function(db, callback) {
  function dropUniqueSymbolsIndex(err) {
    if (err) {
      callback(err);
    }
    return db.removeIndex("currencies", "idx_unique_currency_code", callback);
  }

  return db.removeIndex(
    "currencies",
    "idx_unique_currency_name",
    dropUniqueSymbolsIndex
  );
};

exports._meta = {
  version: 1
};
