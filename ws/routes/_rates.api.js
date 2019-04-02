const rates = require("express").Router();
const strftime = require("strftime");

module.exports = ({ db }) => {
  rates.get("/", async (req, res, next) => {
    const { currencies, latest } = req.query;
    let statement = "SELECT * FROM rates",
      params = [],
      client,
      done;
    if (currencies && currencies.length) {
      // currencies are in format BASE1:TARGET1:BASE2:TARGET2,...,BASEN:TARGETN
      const pairs = currencies.split(",").map(val => val.split(":"));
      const hash = new Map(pairs);

      const baseArr = pairs.map(pair => pair[0]);
      const targetArr = pairs.map(pair => pair[1]);

      console.log(baseArr, targetArr);

      statement +=
        " WHERE base IN (" +
        [...Array(baseArr.length).keys()].map((_, i) => `$${i + 1}`).join(",") +
        ") AND target IN (" +
        [...Array(targetArr.length).keys()]
          .map((_, i) => `$${i + baseArr.length + 1}`)
          .join(",") +
        ")";
      params.push([...baseArr, ...targetArr].join(','));
      // should include most recent only?
      if (latest && latest.match(/true/)) {
        statement += " GROUP BY id ORDER BY DATE(tsp) DESC";
      }
    } else {
      // should include most recent only?
      if (latest && latest.match(/true/)) {
        statement += " GROUP BY id ORDER BY DATE(tsp) DESC";
      }
    }

    console.log(params[0].split(','));
    console.log(statement);

    try {
      const obj = await db.getClient();
      client = obj.client;
      done = obj.done;
      client.query("BEGIN");
      const { rows } = await client.query(statement, params[0].split(','));
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
      // return rows
      await client.query("COMMIT");
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
