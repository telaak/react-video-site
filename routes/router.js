const fs = require('fs')
const express = require('express')
const router = express.Router()
const Video = require('../models/video.js')
const User = require('../models/user.js')
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')
const multer = require('multer')
const path = require('path')

const parseQuery = query => {
  for (let key in query) {
    if (query[key].includes('{lt}')) {
      query[key] = { $lt: query[key].replace('{lt}', '') }
    } else if (query[key].includes('{gt}')) {
      query[key] = { $gt: query[key].replace('{gt}', '') }
    } else if (query[key].includes('{ne}')) {
      query[key] = { $ne: query[key].replace('{ne}', '') }
    }
  }
}

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      let path = `./uploads/`
      callback(null, path)
    },
    filename: (req, file, callback) => {
      callback(null, new Date().getTime() + file.originalname)
    }
  }),
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname)
    if (ext !== '.webm' && ext !== '.mp4') {
      return callback(new Error('Only .mp4 and .webm are allowed.'))
    }
    callback(null, true)
  }
})

router
  .route('/videos')
  .post(upload.single('filepond'), (req, res, next) => {
    console.log('Received file: ' + req.file.originalname)
    ffprobe(req.file.path, { path: ffprobeStatic.path }, function (err, info) {
      if (err) {
        console.log(err)
        res.status(415).send()
        fs.unlink('/var/www/react-video-site/' + req.file.path, error => {
          if (error) console.log(error)
        })
        return err
      } else {
        if (!info.streams.find(stream => stream.codec_type === 'video')) {
          console.log('no video stream in ' + req.file.originalname)
          fs.unlink('/var/www/react-video-site/' + req.file.path, error => {
            if (error) console.log(error)
          })
          res.status(415).send()
          return
        }
        let video = new Video({
          title: req.body.title,
          fileName: req.file.originalname,
          path: req.file.path,
          uploaderId: req.sessionID,
          ...info
        })
        if (req.user) {
          User.updateOne(
            { _id: req.user._id },
            { $push: { videos: video._id } },
            (err, raw) => {
              if (err) {
                console.log(err)
              } else {
                console.log(raw)
              }
            }
          )
        } else {
          if (!req.session.videos) req.session.videos = []
          req.session.videos.push(video._id)
        }
        video.save(err => {
          if (err) {
            res.status(400).send(err)
          } else {
            req.app.io.emit('newVideo', video)
            res.setHeader('content-type', 'text/plain')
            res.status(201).send(String(video._id))
          }
        })
      }
    })
  })
  .get((req, res) => {
    parseQuery(req.query)
    Video.find(req.query, (err, videos) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.json(videos)
      }
    })
  })
  .delete((req, res) => {
    console.log('Trying to delete video id: ' + req.body)
    if (
      (req.session.videos && req.session.videos.includes(req.body)) ||
      (req.user &&
        (Object.values(req.user.videos).includes(req.body) ||
          req.user._doc.admin))
    ) {
      Video.findById(req.body, (err, video) => {
        if (err) {
          res.send(err)
        } else {
          fs.unlink(video.path, err => {
            if (err) {
              res.send(err)
            } else {
              video.remove()
              User.updateMany({}, { $pull: { videos: req.body } }, (err, raw) => {
                if (err) {
                  console.log(err)
                } else {
                  console.log(raw)
                }
              })
              if (req.session.videos) {
                req.session.videos = req.session.videos.filter(
                  video => video !== req.body
                )
              }
              req.app.io.emit('videoDeleted', video)
              res.status(200).send('Deleted')
            }
          })
        }
      })
    } else {
      res.status(403).send()
    }
  })

router
  .route('/videos/:id')
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
    console.log('Trying to delete')
    if (
      (req.session.videos && req.session.videos.includes(req.params.id)) ||
      (req.user &&
        (Object.values(req.user.videos).includes(req.params.id) ||
          req.user._doc.admin))
    ) {
      Video.findById(req.params.id, (err, video) => {
        if (err) {
          res.send(err)
        } else {
          fs.unlink(video.path, err => {
            if (err) {
              res.send(err)
            } else {
              video.remove()
              User.update(
                {},
                { $pull: { videos: req.params.id } },
                (err, raw) => {
                  if (err) {
                    console.log(err)
                  } else {
                    console.log(raw)
                  }
                }
              )
              if (req.session.videos) {
                req.session.videos = req.session.videos.filter(
                  video => video !== req.params.id
                )
              }
              req.app.io.emit('videoDeleted', video)
              res.status(200).send('Deleted')
            }
          })
        }
      })
    } else {
      res.status(403).send()
    }
  })
  .patch((req, res) => {
    if (
      (req.session.videos && req.session.videos.includes(req.params.id)) ||
      (req.user &&
        (Object.values(req.user.videos).includes(req.params.id) ||
          req.user._doc.admin))
    ) {
      delete req.body.path
      delete req.body.fileName
      delete req.body._id
      Video.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true },
        (err, doc) => {
          if (err) {
            res.status(400).send(err)
          } else {
            req.app.io.emit('videoChanged', doc)
            res.status(200).send(doc)
          }
        }
      )
    } else {
      res.status(403).send('Unauthorized')
    }
  })

router.all('/logout', function (req, res) {
  req.logout()
  res.status(200).send({ success: true })
})

router.get('/current', (req, res) => {
  if (req.user) {
    delete req.user._doc.password
    res.status(200).send(req.user)
  } else if (req.session.videos) {
    res.send({ sessionId: req.sessionID, videos: req.session.videos })
  } else {
    res.status(401).send({ sessionId: req.sessionID, videos: [] })
  }
})

router.post('/register', (req, res, next) => {
  const { username, password } = req.body
  User.create({ username, password })
    .then(user => {
      req.login(user, err => {
        if (err) {
          next(err)
        } else {
          let videoList = []
          if (req.session.videos) {
            req.sessions.forEach(video => {
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
          res.status(201).send(req.user)
        }
      })
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(500).send(err)
      } else next(err)
    })
})

module.exports = router
