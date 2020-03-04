const path = require('path')
const express = require('express');
const jsonParser = express.json();
const xss = require('xss');
const NotesService = require('./notes-service.js');
const notesRouter = express.Router()

const serializeNotes = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  folderid: note.folderid,
  content: xss(note.content)
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNotes))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { name, modified, folderid, content } = req.body;
    const newNote = { name, modified, folderid, content }

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    newNote.name = name;
    newNote.modified = modified;
    newNote.folderid = folderid;
    newNote.content = content;

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(`/api/notes/${note.id}`)
          .json(serializeNotes(note))
      })
      .catch(next)
  })

notesRouter
  .route('/:id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getById(knexInstance, req.params.id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNotes(note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.id
    )
      .then(deleted => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, modified, folderid, content } = req.body;
    const newNote = { name, modified, folderid, content }

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    newNote.name = name;
    newNote.modified = modified;
    newNote.folderid = folderid;
    newNote.content = content;

    NotesService.updateNote(
      req.app.get('db'),
      req.params.id,
      newNote
    )
      .then(updated => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter