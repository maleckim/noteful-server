const path = require('path')
const express = require('express');
const jsonParser = express.json();
const xss = require('xss');
const FoldersService = require('./folders-service.js');
const foldersRouter = express.Router()

const serializeFolders = folder => ({
  id: folder.id,
  name: xss(folder.name),
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.status(200).json(folders.map(serializeFolders))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400).send('Folder name is required');
    }

    const newFolder = { name }

    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder)
      .then(result => {
        res
          .status(201)
          .location(`/api/folders/${result.id}`)
          .json(serializeFolders(result))
      })
      .catch(next)
  })


foldersRouter
  .route('/:id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getById(knexInstance, req.params.id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeFolders(folder))
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(
      req.app.get('db'),
      req.params.id
    )
      .then(deleted => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400).send('Folder name is required');
    }

    const newFolder = { name }

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.id,
      newFolder
    )
      .then(updated => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter