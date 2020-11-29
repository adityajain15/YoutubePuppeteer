require('dotenv').config()
const express = require('express')
const bodyParser= require('body-parser')
const path = require('path')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectID
const initDb = require('./dbFunctions')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

initDb().then(db => {
  app.listen(8000, function() {
    console.log('listening on 8000')
  })

  app.get('/videos', async (req, res) => {
    const limitResults = req.query.limit ? req.query.limit : 0
    const skipResults = req.query.skip ? req.query.skip : 0
    const videos = await db.collection('Videos').find().limit(limitResults).skip(skipResults).toArray()
    res.send(videos)
  })

  app.get('/recommendations/:id', async (req, res) => {
    const recommendations = await db.collection('Recommendations').find({video: new ObjectId(req.params.id)}).toArray()
    res.send(recommendations)
  })
})
