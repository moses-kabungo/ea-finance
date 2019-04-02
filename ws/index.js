const express = require("express");
const http = require("http");

const app = express();

// setting up application
app.set("PORT", process.env.PORT || 3000);

const server = http.createServer(app);

server.on("listening", () => {
  console.log(
    "Application is listening on port %s. Press [Q|q] to quit...",
    app.get("PORT")
  );
});

server.listen(app.get("PORT"));

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", data => {
  data = data.toString('utf8');
  if (data && data.match(/q/i)) {
    process.exit(0);
  }
});

server.emit("close");
