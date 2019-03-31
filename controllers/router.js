"use strict";

const mongoose = require("mongoose");
const logger = require("morgan");

// scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// require models directory
const db = require("./models");

// routes

// GET route - scrape theonion.com
app.get("/scrape", function (req, res) {
  // Axios API request for html body
  axios.get("http://www.theonion.com/").then(function (response) {
    // load Axios API response (html body) into cheerio and save as $ for shorthand selector
    const $ = cheerio.load(response.data);

    // grab every h2 within an article tag, and do the following:
    $("div h3").each(function (i, element) {
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

      // create new MongoDB Article using `result` object
      db.Article.create(result)
        .then(function (dbArticle) {
          // view added result in console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // if error, log it
          console.log(err);
        });
    });

    // send message to client
    res.send("Scrape Complete");
  });
});

// GET route - return all Articles from db
app.get("/articles", function (req, res) {
  // find every document in Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // if Articles found, send back to client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // if error, send error to client
      res.status(500).json(err);
    });
});

// GET route - return specific Article by id, populate with note
app.get("/articles/:id", function (req, res) {
  // find Article with id parameter
  db.Article.findOne({ _id: req.params.id })
    // populate all notes associated with specific Article
    .populate("note")
    .then(function (dbArticle) {
      // if Article with id found, send to client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // if error, send error to client
      res.status(500).json(err);
    });
});

// POST route - save/update Article's associated Note
app.post("/articles/:id", function (req, res) {
  // create new note and pass req.body to entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // if Note created, find one Article with `_id` equal to `req.params.id`
      // update Article with new Note association
      // { new: true } tells query to return updated Article -- returns original by default
      // chain mongoose query promise with another `.then` that receives result of query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // if Article updated, send to client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // if error, send error to client
      res.status(500).json(err);
    });
});