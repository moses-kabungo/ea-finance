'use strict';

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
  return db.createTable('currencies', {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      length: 58,
      notNull: true
    },
    code: {
      type: 'string',
      length: 3,
      notNull: true
    },
    digitsInfo: {
      type: 'string',
      notNull: true
    }
  }, callback);
};

exports.down = function(db) {
  return db.dropTable('currencies');
};

exports._meta = {
  "version": 1
};
