import React from 'react'

class Video extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      video: null
    }
  }

  render () {
    let entryPoint = null
    if (this.props && this.props.videoList) {
      let videoId = window.location.href.split('https://video.laaksonen.me/videos/')[1]
      entryPoint = this.props.videoList.find(videoObject => videoObject._id === videoId)
    }
    if (entryPoint) {
      let index = 0
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <div>
            <video
              autoPlay
              key={entryPoint._id}
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
              preload="metadata"
              controls
              src={'https://video.laaksonen.me/' + entryPoint.path}
            />
          </div>
          <div>
            {entryPoint.fileName} {entryPoint.streams[index].width}x
            {entryPoint.streams[index].height}{' '}
            {entryPoint.streams[index].codec_name}{' '}
            {entryPoint.streams[index].r_frame_rate}{' '}
            {entryPoint.streams[index].display_aspect_ratio}
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

export default Video
