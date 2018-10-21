import React from 'react'

class HomePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      randomIndex: -1
    }
  }

  getRandomVideo (previousId) {
    let newRandomIndex = getRandomIntInclusive(
      0,
      this.props.videoList.length - 1
    )
    if (this.props.videoList[newRandomIndex]._id !== previousId) {
      this.setState({ randomIndex: newRandomIndex })
    } else {
      this.getRandomVideo(previousId)
    }
  }

  render () {
    let video = null
    if (
      this.props.videoList &&
      this.props.videoList.length > 0 &&
      this.state.randomIndex === -1
    ) {
      this.getRandomVideo(this.state.randomIndex)
    }
    if (this.props.videoList[this.state.randomIndex]) {
      video = this.props.videoList[this.state.randomIndex]
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
              onEnded={event => this.getRandomVideo(event.target.id)}
              id={video._id}
              autoPlay
              key={video._id}
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
              preload="metadata"
              controls
              src={'https://video.laaksonen.me/' + video.path}
            />
          </div>
          <div>
            {video.fileName} {video.streams[0].width}x{video.streams[0].height}{' '}
            {video.streams[0].codec_name} {video.streams[0].r_frame_rate}{' '}
            {video.streams[0].display_aspect_ratio}
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default HomePage
