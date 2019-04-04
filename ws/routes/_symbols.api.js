const symbols = require("express").Router();

module.exports = ({ db }) => {
  symbols.get("/", async (req, res, next) => {
    try {
      const { rows } = await db.query(
        "SELECT name, code, digitsInfo FROM currencies"
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  });

  return symbols;
};
