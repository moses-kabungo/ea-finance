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
  return db.createTable('rates', {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    tsp: {
      type: 'datetime',
      notNull: true
    },
    base: {
      type: 'string',
      length: 3,
      notNull: true
    },
    target: {
      type: 'string',
      length: 3,
      notNull: true
    },
    rate: {
      type: 'decimal',
      notNull: true
    }
  }, callback);
};

exports.down = function(db, callback) {
  return db.dropTable('rates', callback);
};

exports._meta = {
  "version": 1
};
