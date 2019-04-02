const { Pool, Client, Query } = require("pg");
const pool = Pool();

module.exports = {
  query: (text, params) =>
    new Promise((resolve, reject) => {
      pool.query(text, params, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    }),

  /** Get client object used to perform db transactions.
   *
   * @return {Promise<{client: Client, done: Function}>}
   *   a promise object holding client and the done function
   *   which should be invoked in order to commit the transaction.
   */
  getClient: () =>
    new Promise((resolve, reject) => {
      pool.connect((err, client, done) => {
        if (err) {
          return reject(err);
        }
        // monkey patch: query method to keep track of the last executed query
        const clientProxy = {};
        clientProxy.query = (...args) => {
          clientProxy.lastQuery = args;
          return client.query.apply(client, args);
        };
        // handle cases where client forgets to close the database.
        const doneProxy = () => {
          // clear timeout
          clearTimeout(timeout);
          done(resolve, reject);
        };
        const timeout = setTimeout(() => {
          console.error(
            "A client has been checked out for more than 5 seconds!"
          );
          console.error("Qry: %s", clientProxy.lastQuery);
          release(new Error("Query timeout!"));
        }, 5000);

        const release = err => {
          done(null);
          reject(err);
          // clear timeout
          clearTimeout(timeout);
        };

        if (err) {
          return reject(err);
        }

        resolve({ client: clientProxy, done: doneProxy });
      });
    })
};
