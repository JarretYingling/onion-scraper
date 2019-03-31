"use strict";
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");

// scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// require models directory
const db = require("./models");

const PORT = 3000;

// initialize Express
const app = express();

// configure middleware

// log requests with Morgan
app.use(logger("dev"));
// parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// make public directory a static folder
app.use(express.static("public"));

// connect to Mongo DB
mongoose.connect("mongodb://localhost/onion-scraper", { useNewUrlParser: true });

// routes

// GET route - scrape theonion.com
app.get("/scrape", function(req, res) {
  // Axios API request for html body
  axios.get("http://www.theonion.com/").then(function(response) {
    // load Axios API response (html body) into cheerio and save as $ for shorthand selector
    const $ = cheerio.load(response.data);
    // grab every h2 within an article tag, and do the following:
    $("article header h1").each(function(i, element) {
      // save empty result object
      const result = {};

      // add text of every link as properties of `result` object
      result.title = $(this)
        .children("a")
        .text();
      // and href of every link as properties of `result` object
      result.link = $(this)
        .children("a")
        .attr("href");

      // create new MongoDB article using `result` object
      db.articles.create(result)
        .then(function(dbArticles) {
          // view added result in console
          console.log(dbArticles);
        })
        .catch(function(err) {
          // if error, log it
          console.log(err);
        });
    });

    // send message to client
    res.send("Scrape Complete");
  });
});

// GET route - return all articles from db
app.get("/articles", function(req, res) {
  // find every document in articles collection
  db.articles.find({})
    .then(function(dbArticles) {
      // if Articles found, send back to client
      res.json(dbArticles);
    })
    .catch(function(err) {
      // if error, send error to client
      res.status(500).json(err);
    });
});

// GET route - return specific Article by id, populate with note
app.get("/articles/:id", function(req, res) {
  // find article with id parameter
  db.articles.findOne({ _id: req.params.id })
    // populate all notes associated with specific article
    .populate("notes")
    .then(function(dbArticle) {
      // if article with id found, send to client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // if error, send error to client
      res.status(500).json(err);
    });
});

// POST route - save/update article's associated note
app.post("/articles/:id", function(req, res) {
  // create new note and pass req.body to entry
  db.notes.create(req.body)
    .then(function(dbNote) {
      // if note created, find one Article with `_id` equal to `req.params.id`
      // update Article with new Note association
      // { new: true } tells query to return updated Article -- returns original by default
      // chain mongoose query promise with another `.then` that receives result of query
      return db.articles.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // if article updated, send to client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // if error, send error to client
      res.status(500).json(err);
    });
});

// start Express server
app.listen(PORT, function() {
  console.log(`Express App listening on port ${PORT}`);
});
