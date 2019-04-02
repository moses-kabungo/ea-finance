const api = require("express").Router();

const rates = require('./_rates.api');

module.exports = ({ db }) => {
  api.use('/rates', rates({ db }));
  return api;
};
