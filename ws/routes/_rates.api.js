const rates = require("express").Router();
const strftime = require("strftime");

module.exports = ({ db }) => {
  rates.get("/", async (req, res, next) => {
    const { currencies, latest } = req.query;

    let statement = "SELECT tsp, base, target, rate FROM rates",
      client,
      done;

    const options = { cache: {} };

    // Define a lazily computed value
    Object.defineProperty(options, "recent_date", {
      set(promise) {
        this.cache["recent_date"] = null;
      },
      async get() {
        if (this.cache["recent_date"] != null) {
          console.log("Using cache. Last date = %s", this.cache["recent_date"]);
          return Promise.resolve(this.cache["recent_date"]);
        }
        try {
          const {
            rows: [row]
          } = await db.query("SELECT DATE(MAX(tsp)) AS last_date FROM rates");
          this.cache["recent_date"] = strftime("%F", row.last_date);
          return Promise.resolve(this.cache["recent_date"]);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    });

    // Incrementally defined property
    Object.defineProperty(options, "params", {
      writable: true,
      value: []
    });

    if (currencies && currencies.length) {
      // currencies are in format BASE1:TARGET1:BASE2:TARGET2,...,BASEN:TARGETN
      const pairs = currencies.split(",").map(val => val.split(":"));

      // We're converting to set in order to filter out duplicates.
      const baseArr = new Set(pairs.map(pair => pair[0]));
      const targetArr = new Set(pairs.map(pair => pair[1]));
      const buildIn = (index0, indexN) =>
        [...Array(indexN).keys()].map((_, i) => `$${index0 + i + 1}`).join(",");

      // filter currencies
      statement +=
        " WHERE base IN (" +
        buildIn(0, baseArr.size) +
        ") AND target IN (" +
        buildIn(baseArr.size, targetArr.size) +
        ")";
      // create params we're going to use in binding
      options.params = [...baseArr, ...targetArr];
      // should include most recent only?
      if (latest && latest.match(/true/)) {
        statement += ` AND DATE(tsp) = '${await options.recent_date}'`;
      }
    } else {
      // should include most recent only?
      if (latest && latest.match(/true/)) {
        statement += ` WHERE DATE(tsp) = '${await options.recent_date}'`;
      } else {
        statement += " GROUP BY id ORDER BY date DESC";
      }
    }

    try {
      const obj = await db.getClient();
      client = obj.client;
      done = obj.done;
      client.query("BEGIN");
      const { rows } = await client.query(statement, options.params);
      await client.query("COMMIT");
      done();
      res.json(rows);
    } catch (err) {
      client && (await client.query("ROLLBACK")) && done();
      next(err);
    }
  });

  rates.post("/", async (req, res, next) => {
    const { date, base, data } = req.body;
    const today = strftime("%F", new Date(date));
    let client, done;

    /** take promise and combine rows
     * @param {Promise<any[]>} promise
     */
    const combine = field => promise => {
      return promise.then(rows =>
        rows
          .reduce((acc, row) => [...acc, ...row[field]], [])
          .map(row => {
            row["tsp"] = strftime("%F", row["tsp"]);
            return row;
          })
      );
    };

    try {
      const obj = await db.getClient();
      client = obj.client;
      done = obj.done;
      await client.query("BEGIN");
      // insert rates into the table
      const keys = Object.keys(data);
      // Accept daily changes or else ignore
      const updates = await combine("rows")(
        Promise.all(
          keys.map(key =>
            client.query(
              `UPDATE rates SET rate=$1::decimal
              WHERE tsp::date=$2
                AND base=$3::varchar
                AND target=$4::varchar
                AND rate::decimal<>$1::decimal
              RETURNING id, tsp::timestamp::date, base, target, rate`,
              [parseFloat(data[key]), today, base, key]
            )
          )
        )
      );
      // Insert first timers
      const insertions = await combine("rows")(
        Promise.all(
          keys.map(key =>
            client.query(
              `INSERT INTO rates(tsp, base, target, rate)
              SELECT $1::date, $2::varchar, $3::varchar, $4::decimal
                WHERE NOT EXISTS (
                  SELECT 1
                  FROM rates
                  WHERE tsp::date=$1::date
                    AND base=$2::varchar
                    AND target=$3::varchar
                )
            RETURNING id, tsp::timestamp::date, base, target, rate;`,
              [today, base, key, parseFloat(data[key])]
            )
          )
        )
      );

      // commit the transaction
      await client.query("COMMIT");

      // call done to release the database pool 
      done();
      res.json({
        updates,
        insertions
      });
    } catch (err) {
      client && (await client.query("ROLLBACK")) && done();
      next(err);
    }
  });

  return rates;
};
