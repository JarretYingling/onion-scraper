"use strict";

const mongoose = require("mongoose");

// save reference to Schema constructor
const Schema = mongoose.Schema;

// use Schema constructor to create ew notesSchema object
// similar to Sequelize model
const notesSchema = new Schema({
  // set `title` as type String
  title: String,
  // set `body` as type String
  body: String
});

// mongoose model method creates model from notesSchema above
const notes = mongoose.model("Note", notesSchema);

// export notes model
module.exports = notes;
