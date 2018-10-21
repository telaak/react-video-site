import React from 'react'
import { Button } from 'mdbreact'

class VideoManager extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      video: null
    }
  }

  render () {
    if (this.props.user) {
      if (this.props.user.admin) {
        return (
          <div>
            <select
              className="form-control"
              onChange={event => {
                this.setState({
                  video: this.props.videoList.find(
                    video => video._id === event.target.value
                  )
                })
              }}
            >
              <option>Choose a video</option>
              {this.props.videoList.map(video => {
                return (
                  <option value={video._id} key={video._id}>
                    {video.fileName}
                  </option>
                )
              })}
            </select>
            <br />
            <EditForm video={this.state.video} />
          </div>
        )
      } else if (this.props.user.hasOwnProperty('videos')) {
        return (
          <div>
            <select
              className="form-control"
              onChange={event => {
                this.setState({
                  video: this.props.videoList.find(
                    video => video._id === event.target.value
                  )
                })
              }}
            >
              <option>Choose a video</option>
              {this.props.videoList.map(video => {
                return this.props.user.videos.includes(video._id) ? (
                  <option value={video._id} key={video._id}>
                    {video.fileName}
                  </option>
                ) : null
              })}
            </select>
            <br />
            <EditForm video={this.state.video} />
          </div>
        )
      }
    } else {
      return null
    }
  }
}

class EditForm extends React.Component {
  constructor (props) {
    super(props)
    this.EditForm = this.EditForm.bind(this)
    this.renderObject = this.renderObject.bind(this)
    this.patchChanges = this.patchChanges.bind(this)
    this.state = {
      changes: {}
    }
    this.id = 0
  }

  EditForm (video) {
    let inputArray = []
    for (let key in video) {
      if (typeof video[key] !== 'object') {
        inputArray.push(<h6>{key}</h6>)
        inputArray.push(
          <input
            className="form-control"
            key={video._id + '.' + video[key]}
            id={key}
            name={key}
            placeholder={key}
            defaultValue={video[key]}
          />
        )
      } else {
        let resultArray = this.renderObject(video[key], key, video._id)
        inputArray = [...inputArray, ...resultArray]
      }
    }
    return inputArray
  }

  renderObject (object, objectName, id, resultArray = []) {
    for (let key in object) {
      if (typeof object[key] === 'object') {
        if (!isNaN(key)) {
          resultArray.push(
            <h3 key={objectName + '.' + key}>{objectName + key}</h3>
          )
        } else {
          resultArray.push(<h5 key={objectName + '.' + key}>{key}</h5>)
        }
        this.renderObject(object[key], objectName + '.' + key, id, resultArray)
        resultArray.push(<br />)
        resultArray.push(<br />)
      } else {
        resultArray.push(<h6>{key}</h6>)
        resultArray.push(
          <input
            className="form-control"
            id={objectName + '.' + key}
            key={id + objectName + '.' + key + '.' + object[key]}
            name={objectName + '.' + key}
            placeholder={key}
            defaultValue={object[key]}
          />
        )
      }
    }
    return resultArray
  }

  patchChanges () {
    if (this.props.video) {
      fetch('https://video.laaksonen.me/api/videos/' + this.props.video._id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state.changes)
      })
    }
  }

  render () {
    return (
      <div>
        <form
          onChange={event => {
            let key = event.target.id
            let value = event.target.value
            let object
            if (this.id === this.props.video._id) {
              object = Object.assign({}, this.state.changes)
            } else {
              object = {}
              this.id = this.props.video._id
            }
            object[key] = value
            this.setState({ changes: object })
          }}
        >
          {this.props.video ? this.EditForm(this.props.video) : null}
        </form>
        <Button onClick={() => this.patchChanges()}>Save</Button>
      </div>
    )
  }
}

export default VideoManager
