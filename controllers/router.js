"use strict";

const mongoose = require("mongoose");
// connect to Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/onion-scraper", {
  useNewUrlParser: true
});

// scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// require models directory
const db = require("../models");

// const path = require("path");

// routes
const router = (app) => {

  // GET route - scrape theonion.com and render articles with handlebars
  app.get("/", function (req, res) {

    const titles = [];

    // get article titles
    db.Articles.find({},{"_id": false, "title": true})
      .then(function (articleTitles) {
        Object.keys(articleTitles).forEach(function (item){
          titles.push(articleTitles[item].title);
        });
        // Axios API request for html body
        return axios.get("http://www.theonion.com/")
          .then(function(htmlResponse){
            return htmlResponse;
          });
      })
      .then(function (htmlResponse) {
        // load Axios API response (html body) into cheerio and save as $ for shorthand selector
        const $ = cheerio.load(htmlResponse.data);
        const scrapedArticles = [];
        // with every article tag, do the following:
        $("article").each(function (i, element) {
          // save empty result object
          const scrapedArticle = {};
          // add text of every link as title key of scrapedArticle object
          scrapedArticle.title = $(this)
            .children("header")
            .children("h1")
            .children("a")
            .text();
          // check for existing article title
          if (titles.includes(scrapedArticle.title)) {
            // do nothing, article already in database
          } else {
            // add href of every link as link key of scrapedArticle object
            scrapedArticle.link = $(this)
              .children("header")
              .children("h1")
              .children("a")
              .attr("href");
            // add first paragraph of every div div as summary key of scrapedArticle object
            scrapedArticle.summary = $(this)
              .children("div")
              .children("div")
              .children("p")
              .text();
            // push article into array
            scrapedArticles.push(scrapedArticle);
          }
        })
        return scrapedArticles;
      })
      .then(function(scrapedArticles){
        // insert many scrapedArticles into database
        db.Articles.insertMany(scrapedArticles)
          .then(function(dbAddedArticles){
            return dbAddedArticles;
          });
        // redirect to populate Articles
        res.redirect("/articles");
      })
      .catch(function (err) {
        // if error, send error to client
        res.status(500).json(err);
      });
  });

  // GET route - return all articles from db
  app.get("/articles", function (req, res) {
    // find all documents in articles collection
    db.Articles.find({})
      .populate("Notes")
      .then(function (dbArticles) {
        // if Articles found, send back to client
        // console.log(`dbArticles: ${dbArticles}`);
        res.render("index", {
          articles: dbArticles
        });
      })
      .catch(function (err) {
        // if error, send error to client
        res.status(500).json(err);
      });
  });

  // GET route - return specific Article by id, populate with note
  app.get("/article/:id", function (req, res) {
    // find article with id parameter
    db.Articles.findOne({
        _id: req.params.id
      })
      // populate all notes associated with specific article
      .populate("notes")
      .then(function (dbArticle) {
        // if article with id found, send to client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // if error, send error to client
        res.status(500).json(err);
      });
  });

  // POST route - save/update article's associated note
  app.post("/article/:articleId", function (req, res) {
    // create new note and pass req.body to entry
    db.Notes.create(req.body)
      .then(function (dbNote) {
        // if note created, find one Article with `_id` equal to `req.params.id`
        // update Article with new Note association
        // { new: true } tells query to return updated Article -- returns original by default
        // chain mongoose query promise with another `.then` that receives result of query
        return db.Articles.findOneAndUpdate({
          _id: req.params.articleId
        }, {
          $push : {
            notes: dbNote._id
          }
        }, {
          new: true
        });
      })
      .then(function (dbArticle) {
        // if article updated, send to client
        res.json("dbArticle");
      })
      .catch(function (err) {
        // if error, send error to client
        res.status(500).json(err);
      });
  });

  // DELETE route - delete specific Note by id
  app.delete("/note/:noteId", function (req, res) {
    // delete note with id parameter
    db.Notes.findOneAndDelete({
        _id: req.params.noteId
      })
      .then(function (dbNote) {
        return db.Articles.findOneAndUpdate({
          _id: dbNote.article
        }, {
          $pull: {
            notes: dbNote._id
          }
        });
      })
      .then(function(dbArticle){
        //might be the note ???
        res.json(dbArticle);
      })
      .catch(function (err) {
        // if error, send error to client
        res.status(500).json(err);
      });
  });

}

//exports
module.exports = router;