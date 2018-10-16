const fs = require('fs')
const express = require('express')
const router = express.Router()
const Video = require('../models/video.js')
const User = require('../models/user.js')
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')
const multer = require('multer')

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      let path = `./uploads/`
      callback(null, path)
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname)
    }
  })
})

router.route('/videos')
  .post(upload.single('filepond'), (req, res, next) => {
    ffprobe(req.file.path, { path: ffprobeStatic.path }, function (err, info) {
      if (err) {
        return err
      } else {
        let video = new Video({ title: req.body.title, fileName: req.file.originalname, path: req.file.path, ...info })
        if (req.user) {
          User.update({ '_id': req.user._id }, { $push: { 'videos': video._id } }, (err, raw) => {
            if (err) {
              console.log(err)
            } else {
              console.log(raw)
            }
          })
        }
        video.save(err => {
          if (err) {
            res.send(err)
          } else {
            res.send(video)
          }
        })
      }
    })
  })
  .get((req, res) => {
    Video.find(req.query, (err, videos) => {
      if (err) {
        res.send(err)
      } else {
        res.json(videos)
      }
    })
  })

router.route('/videos/:id')
  .get((req, res) => {
    Video.findById(req.params.id, (err, video) => {
      if (err) {
        res.send(err)
      } else {
        res.json(video)
      }
    })
  })
  .delete((req, res) => {
    if (Object.values(req.user.videos).includes(req.params.id) || req.user._doc.admin) {
      Video.findById(req.params.id, (err, video) => {
        if (err) {
          res.send(err)
        } else {
          fs.unlink(video.path, err => {
            if (err) {
              res.send(err)
            } else {
              video.remove()
              User.update({}, { $pull: { 'videos': req.params.id } }, (err, raw) => {
                if (err) {
                  console.log(err)
                } else {
                  console.log(raw)
                }
              })
              res.send('Deleted')
            }
          })
        }
      })
    } else {
      res.status(403).send()
    }
  })
  .patch((req, res) => {
    if (Object.values(req.user.videos).includes(req.params.id) || req.user._doc.admin) {
      delete req.body.path
      delete req.body.fileName
      delete req.body._id
      Video.updateOne({ '_id': req.params.id }, req.body, (err, raw) => {
        if (err) {
          res.send(err)
        } else {
          res.send(raw)
        }
      })
    } else {
      res.status(403).send()
    }
  })

router.all('/logout', function (req, res) {
  req.logout()
  res.send('Logged out')
})

router.get('/test', (req, res) => {
  if (req.user) {
    delete req.user._doc.password
    res.send(req.user)
  } else {
    res.send('Not logged in')
  }
})

router.post('/register', (req, res, next) => {
  const { username, password } = req.body
  User.create({ username, password })
    .then(user => {
      req.login(user, err => {
        if (err) next(err)
        else res.send('Created user')
      })
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.send(err)
      } else next(err)
    })
})

module.exports = router
