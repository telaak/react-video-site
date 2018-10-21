const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
app.set('io', io)
app.io = io
const router = require('./routes/router.js')
const session = require('express-session')
const passport = require('passport')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user.js')

mongoose.promise = global.Promise
mongoose.set('useCreateIndex', true)

app.use(cors())
app.use(express.json())
app.use('/uploads/', express.static('uploads'))
app.use(
  session({
    secret: 'seksiseppo',
    saveUninitialized: true,
    resave: true
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text())

passport.serializeUser(function (user, done) {
  done(null, user._id)
})

passport.deserializeUser(function (userId, done) {
  User.findById(userId, (err, user) => done(err, user))
})

const LocalStrategy = require('passport-local').Strategy
const local = new LocalStrategy((username, password, done) => {
  User.findOne({ username })
    .then(async user => {
      if (!user || !(await user.validPassword(password))) {
        done(null, false, { message: 'Invalid username/password' })
      } else {
        done(null, user)
      }
    })
    .catch(e => done(e))
})
passport.use('local', local)

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  if (req.user) {
    let videoList = []
    if (req.session.videos) {
      req.session.videos.forEach(video => {
        videoList.push(video)
      })
      User.updateOne(
        { _id: req.user._id },
        { $addToSet: { videos: { $each: [videoList] } } },
        { upsert: true },
        (err, raw) => {
          if (err) {
            console.log(err)
          } else {
            console.log(raw)
          }
        }
      )
    }
    delete req.user._doc.password
    req.user.videos = [...req.user.videos, ...videoList]
    req.user.sessionId = req.sessionID
    res.send(req.user)
  } else {
    res.send({ kys: true })
  }
})

app.use('/api/', router)

server.listen(4000, () => {
  console.log('listening on *:4000')
})
