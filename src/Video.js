import React from 'react'

class Video extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      video: null
    }
  }

  componentDidMount () {
    if (!this.props.location.state) {
      fetch(
        'https://video.laaksonen.me/api/videos/' +
          this.props.match.params.videoId
      )
        .then(response => response.json())
        .then(json => {
          this.setState({ video: json })
        })
    }
  }

  render () {
    let entryPoint = null
    if (this.props.location.state) {
      entryPoint = this.props.location.state
    } else if (this.state.video) {
      entryPoint = this.state.video
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
