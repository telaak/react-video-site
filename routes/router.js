const fs = require('fs')
const express = require('express')
const router = express.Router()
const Video = require('../models/video.js')
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
  .post(upload.single('video'), (req, res, next) => {
    ffprobe(req.file.path, { path: ffprobeStatic.path }, function (err, info) {
      if (err) {
        return err
      } else {
        let video = new Video({ title: req.body.title, fileName: req.file.originalname, path: req.file.path, ...info })
        video.save(err => {
          if (err) {
            res.send(err)
          } else {
            res.send({ id: video.id })
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
    Video.findById(req.params.id, (err, video) => {
      if (err) {
        res.send(err)
      } else {
        fs.unlink(video.path, err => {
          if (err) {
            res.send(err)
          } else {
            video.remove()
            res.send('Deleted')
          }
        })
      }
    })
  })
  .patch((req, res) => {
    Video.updateOne({ '_id': req.params.id }, req.body, (err, raw) => {
      if (err) {
        res.send(err)
      } else {
        res.send(raw)
      }
    })
  })

module.exports = router
