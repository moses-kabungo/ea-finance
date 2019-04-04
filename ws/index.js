require("dotenv").config();

const express = require("express");
const http = require("http");

const bodyParser = require("body-parser");

const app = express();

// apis
const api = require("./routes");
const db = require("./db");

// middlewares
const { errorResponse } = require("./middlewares");

// setting up application
app.set("PORT", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", api({ db }));
app.use(errorResponse);

const server = http.createServer(app);

server.on("listening", () => {
  console.time("up time");
  console.log(
    "Application is listening on port %s...",
    app.get("PORT")
  );
});

server.listen(app.get("PORT"));

// process.stdin.setRawMode(true);
// process.stdin.resume();
// process.stdin.on("data", data => {
//   data = data.toString("utf8");
//   if (data && data.match(/q/i)) {
//     console.timeEnd("up time");
//     process.exit(0);
//   }
// });
