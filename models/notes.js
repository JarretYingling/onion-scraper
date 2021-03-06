"use strict";

const mongoose = require("mongoose");

// save reference to Schema constructor
const Schema = mongoose.Schema;

// use Schema constructor to create ew NotesSchema object
// similar to Sequelize model
const NotesSchema = new Schema({
  // set `title` as type String
  title: String,
  // set `body` as type String
  body: String,
  // `article` is an object that stores an article id
  // ref property links ObjectId to Articles model
  // enables `populate` to pull in article's associated note(s)
  article: {
    type: Schema.Types.ObjectId,
    ref: "Articles"
  }
});

// mongoose model method creates model from NotesSchema above
const Notes = mongoose.model("Notes", NotesSchema);

// export Notes model
module.exports = Notes;
