const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const intel = require('intel');

router.get('/', function(req, res, next) {
  res.send('Hello, World!');
  intel.info('HOME ROUTE');
});

// *** api routes *** //
router.get('/notes', findAllNotes);
router.get('/note/:id', findNoteById);
router.post('/notes', addNote);
router.put('/note/:id', updateNote);
router.delete('/note/:id', deleteNote);


// *** get ALL notes *** //
function findAllNotes(req, res) {
  Note.find(function(err, notes) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json(notes);
      intel.info("Take all notes ", notes);
    }
  });
}

// *** get SINGLE note *** //
function findNoteById(req, res) {
  Note.findById(req.params.id, function(err, note) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json(note);
      intel.info('Get single note ', note);
    }
  });
}

// *** post ALL notes *** //
function addNote(req, res) {
  var newNote = new Note({
    title: req.body.title,
    body: req.body.body
  });
  newNote.save(function(err, newNote) {
    if(err) {
      res.json({'ERROR': err});
      intel.error("ERROR ", err);
    } else {
      res.json({'SUCCESS': newNote});
      intel.info('Added new note ', newNote);
    }
  });
}

// *** put SINGLE note *** //
function updateNote(req, res) {
  Note.findById(req.params.id, function(err, note) {
    note.title = req.body.title;
    note.body = req.body.body;
    note.save(function(err) {
      if(err) {
        res.json({'ERROR': err});
        intel.error("ERROR ", err);
      } else {
        res.json({'UPDATED': note});
        intel.info('Updated note ', note);
      }
    });
  });
}

// *** delete SINGLE note *** //
function deleteNote(req, res) {
  Note.findById(req.params.id, function(err, note) {
    if(err) {
      res.json({'ERROR': err});
    } else {
      note.remove(function(err){
        if(err) {
          res.json({'ERROR': err});
          intel.error("ERROR ", err);
        } else {
          res.json({'REMOVED': note});
          intel.info('Deleted note ', note);
        }
      });
    }
  });
}

module.exports = router;