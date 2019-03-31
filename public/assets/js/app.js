"use strict";

// get articles as json
$.getJSON("/articles", function(data) {
  // for each article
  for (var i = 0; i < data.length; i++) {
    // display info on page
    $("#articles").append(`<div class="article"><p data-id="${data[i]._id}">${data[i].title}<button class="btn btn-primary p-1 mx-1">note</button><a href="${data[i].link}" target="_blank">link</a></p></div>`);
  }
});


// onClick p tag
$(document).on("click", "p", function() {
  // empty note section
  $("#notes").empty();
  // save id from p tag
  const thisId = $(this).attr("data-id");

  // ajax call for article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // add note to page
    .then(function(data) {
      console.log(data);
      
      // title of article
      $("#notes").append(`<h5>${data.title}</h5>`);
      // input for new note title
      $("#notes").append(`<input id="titleinput" name="title">`);
      // textarea for new note body
      $("#notes").append(`<textarea id="bodyinput" name="body"></textarea>`);
      // submit button for new note with id article saved to it
      $("#notes").append(`<button data-id="${data._id}" id="savenote">Save Note</button>`);

      // if article has note
      if (data.note) {
        // place note title in title input
        $("#titleinput").val(data.note.title);
        // place note body in body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// onClick savenote button
$(document).on("click", "#savenote", function() {
  // get id associated with article from submit button
  const thisId = $(this).attr("data-id");

  // POST request to change note using inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // value from note title input
      title: $("#titleinput").val(),
      // value from note body textarea
      body: $("#bodyinput").val()
    }
  })
    // and then...
    .then(function(data) {
      // log response
      console.log(data);
      // empty notes section
      $("#notes").empty();
    });

  // remove entered values from note input and textarea
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
