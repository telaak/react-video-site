const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const router = require('./routes/router.js')

app.use(cors())
app.use(express.json())
app.use('/api/', router)
app.use('/videos/', express.static('uploads'))
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true })

server.listen(4000, () => {
  console.log('listening on *:4000')
})
