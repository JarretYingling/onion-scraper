"use strict";

// onClick .btn-note class
$(document).on("click", ".btn-note", function() {
  // empty note section
  $("#notes").empty();
  // save id from #data-id
  const thisId = $(this).attr("data-id");

  // ajax call for article
  $.ajax({
    method: "GET",
    url: "/article/" + thisId
  })
    // add note to page
    .then(function(article) {
      // title of article
      $("#notes").append(`<h6>${article.title}</h6>`);
      // input for new note title
      $("#notes").append(`<input id="titleinput" name="title">`);
      // textarea for new note body
      $("#notes").append(`<textarea id="bodyinput" name="body"></textarea>`);
      // submit button for new note with id article saved to it
      $("#notes").append(`<button data-id="${article._id}" id="savenote" class="btn btn-save px-1 py-0 m-1">Save Note</button>`);

      // if article has notes
      if (article.notes.length > 0) {
        const notes = article.notes;
        $(`#notes-${article._id}`).empty();
        notes.forEach(note => {
          $(`#notes-${article._id}`).append(`
            <div id="${note._id}" class="note">
              <button data-id="${note._id}" class="btn btn-delete px-1 py-0 m-1">delete</button>  
              <h6>${note.title}</h6>
              <div>${note.body}</div>
            </div>
          `);
        });
        // place note title in title input
        $("#titleinput").val(article.notes[0].title);
        // place note body in body textarea
        $("#bodyinput").val(article.notes[0].body);
      }
    });
});

// onClick savenote button
$(document).on("click", "#savenote", function() {
  // get id associated with article from submit button
  const articleId = $(this).attr("data-id");
  // POST request to change note using inputs
  $.ajax({
    method: "POST",
    url: `/article/${articleId}`,
    data: {
      // value from note title input
      title: $("#titleinput").val(),
      // value from note body textarea
      body: $("#bodyinput").val(),
      // article id
      article: articleId
    }
  })
    // and then...
    .then(function(data) {
      // empty notes section
      $("#notes").empty();
    });
});

// onClick delete note button
$(document).on("click", ".btn-delete", function () {
  // get article id and associated note id
  const noteId = $(this).attr("data-id");
  // POST request to change note using inputs
  $.ajax({
      method: "DELETE",
      url: `/note/${noteId}`
    })
    .then(function (data) {
      $(`#${noteId}`).empty();
      $("#notes").empty();
    });
  });