"use strict";

const mongoose = require("mongoose");

// save reference to Schema constructor
const Schema = mongoose.Schema;

// use Schema constructor to create new ArticlesSchema object
// similar to Sequelize model
const ArticlesSchema = new Schema({
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
  // set `link` as type String and make it required
  summary: {
    type: String,
    required: false
  },
  // `note` is an object that stores a Note id
  // ref property links ObjectId to notes model
  // enables `populate` to pull in article's associated note(s)
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Notes"
  }]
});

// mongoose model method creates model from ArticlesSchema above
const Articles = mongoose.model("Articles", ArticlesSchema);

// export Articles model
module.exports = Articles;
