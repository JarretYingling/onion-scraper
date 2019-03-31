"use strict";

// require path
const path = require("path");

// require express
const express = require("express");
// initialize Express
const app = express();
// configure middleware
// parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// set static root to public directory
app.use(express.static(path.join(__dirname, "/public")));

// require express-handlebars
const hdbrs = require("express-handlebars");
// configure express-handlebars
app.engine("handlebars", hdbrs({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts")
}));
app.set("view engine", "handlebars");

// require morgan
const logger = require("morgan");
// log requests with Morgan
app.use(logger("dev"));

// router
require("./controllers/router")(app);

// dynamic port or default
const PORT = process.env.PORT || 3000;

// start Express server
app.listen(PORT, function() {
  console.log(`Express App listening on port ${PORT}`);
});
