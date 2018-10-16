// Import React FilePond
import { FilePond, File, registerPlugin } from 'react-filepond'
import React, { Component, PropTypes } from 'react'

// Import FilePond styles
import 'filepond/dist/filepond.css'

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      files: [],
      media: []
    }
  }

  handleInit () {
    console.log('FilePond instance has initialised', this.pond)
  }

  componentDidMount () {
    fetch ('https://video.laaksonen.me/api/videos').then(response => response.json()).then(json => {
      this.setState({ media: json })
      console.log(json)
    })
  }

  render () {
    return (
      <div className="App">
        <div style={{ 'width': '50%', 'margin': 'auto', 'marginTop': '2em' }}>
          <FilePond ref={ref => { this.pond = ref }}
            allowMultiple={false}
            allowRevert={false}
            maxFiles={5}
            server={{ url: 'https://video.laaksonen.me/api/videos/', process: { onload: response => { setTimeout(() => this.setState({ files: [] }), 5000); this.setState(prevState => ({ media: [...prevState.media, JSON.parse(response)] })) } } } }
            oninit={() => this.handleInit()}
            onupdatefiles={(fileItems) => {
              this.setState({
                files: fileItems.map(fileItem => fileItem.file)
              })
            }}>
            {this.state.files.map(file => (
              <File key={file} src={file} origin="local" />
            ))}
          </FilePond>
        </div>
        <div>
          {this.state.media.map(media => (
            <div style={ { display: 'inline' } } className="videos" key={media._id}><video controls src={'https://video.laaksonen.me/' + media.path}></video></div>
          ))}
        </div>
      </div>
    )
  }
}
export default App
