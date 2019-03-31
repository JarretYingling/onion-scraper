"use strict";

const mongoose = require("mongoose");

// save reference to Schema constructor
const Schema = mongoose.Schema;

// use Schema constructor to create new articlesSchema object
// similar to Sequelize model
const articlesSchema = new Schema({
  // set `title` as type String and make it required
  title: {
    type: String,
    required: true
  },
  // set `link` as type String and make it required
  link: {
    type: String,
    required: true
  },
  // `note` is an object that stores a Note id
  // ref property links ObjectId to notes model
  // enables `populate` to pull in article's associated note(s)
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// mongoose model method creates model from articlesSchema above
const articles = mongoose.model("articles", articlesSchema);

// export articles model
module.exports = articles;
