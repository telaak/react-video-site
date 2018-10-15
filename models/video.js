const mongoose = require('mongoose')
const Schema = mongoose.Schema

let VideoSchema = new Schema({
  title: String,
  fileName: String,
  path: String,
  streams: [
    {
      index: Number,
      codec_name: String,
      codec_long_name: String,
      profile: String,
      codec_type: String,
      codec_time_base: String,
      codec_tag_string: String,
      codec_tag: String,
      width: Number,
      height: Number,
      coded_width: Number,
      coded_height: Number,
      has_b_frames: String,
      sample_aspect_ratio: String,
      display_aspect_ratio: String,
      pix_fmt: String,
      level: Number,
      color_range: String,
      color_space: String,
      color_transfer: String,
      color_primaries: String,
      chroma_location: String,
      refs: Number,
      is_avc: Boolean,
      nal_length_size: Number,
      r_frame_rate: String,
      avg_frame_rate: String,
      time_base: String,
      start_pts: Number,
      start_time: Number,
      duration_ts: Number,
      duration: Number,
      bit_rate: Number,
      bits_per_raw_sample: Number,
      nb_frames: Number,
      disposition: {
        default: Number,
        dub: Number,
        original: Number,
        comment: Number,
        lyrics: Number,
        karaoke: Number,
        forced: Number,
        hearing_impaired: Number,
        visual_impaired: Number,
        clean_effects: Number,
        attached_pic: Number,
        timed_thumbnails: Number
      },
      tags: {
        creation_time: String,
        language: String,
        handler_name: String,
        encoder: String
      }
    },
    {
      index: Number,
      codec_name: String,
      codec_long_name: String,
      profile: String,
      codec_type: String,
      codec_time_base: String,
      codec_tag_string: String,
      codec_tag: String,
      sample_fmt: String,
      sample_rate: Number,
      channels: Number,
      channel_layout: String,
      bits_per_sample: Number,
      r_frame_rate: String,
      avg_frame_rate: String,
      time_base: String,
      start_pts: Number,
      start_time: Number,
      duration_ts: Number,
      duration: Number,
      bit_rate: Number,
      max_bit_rate: Number,
      nb_frames: Number,
      disposition: {
        default: Number,
        dub: Number,
        original: Number,
        comment: Number,
        lyrics: Number,
        karaoke: Number,
        forced: Number,
        hearing_impaired: Number,
        visual_impaired: Number,
        clean_effects: Number,
        attached_pic: Number,
        timed_thumbnails: Number
      },
      tags: {
        creation_time: String,
        language: String,
        handler_name: String
      }
    }
  ]
})

module.exports = mongoose.model('Video', VideoSchema)
