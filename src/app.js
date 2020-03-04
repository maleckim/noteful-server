require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const foldersRouter = require('./folders/folders-router.js')
const notesRouter = require('./notes/notes-router.js')
const bodyParser = require('body-parser')
const { NODE_ENV } = require('./config')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))
app.use(helmet())
app.use(cors())

app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)



app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})



app.get('/pythondata', (req, res) => {

const PATH = '/Users/matthewmalecki/Desktop/Python/python-web-scraper/RosalindNews.py'
const spawn = require('child_process').spawn;
const pythonProcess = spawn('python3',[`${PATH}`]);

pythonProcess.stdout.on('data', function(data) {
  // let obj = JSON.parse(data)
  // console.log(obj)
  res.send(data);
  res.end();
})
  
})



module.exports = app