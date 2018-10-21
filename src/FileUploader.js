import React from 'react'
import { FilePond, File, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import 'filepond/dist/filepond.css'

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
)

class FileUploader extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
      media: [],
      id: ''
    }
    this.handleRevert = this.handleRevert.bind(this)
  }

  handleRevert () {
    fetch('https://video.laaksonen.me/api/videos/' + this.state.id, {
      method: 'delete'
    }).then(() => {
      this.setState(prevState => ({
        media: prevState.media.filter(value => value._id !== this.state.id)
      }))
    })
  }

  componentDidMount () {
    fetch('https://video.laaksonen.me/api/videos')
      .then(response => response.json())
      .then(json => {
        this.setState({ media: json })
      })
  }

  render () {
    return (
      <div style={{ width: '50%', margin: 'auto', marginTop: '2em' }}>
        <FilePond
          ref={ref => {
            this.pond = ref
          }}
          allowMultiple={true}
          acceptedFileTypes={['video/mp4', 'video/webm']}
          server={{
            url: 'https://video.laaksonen.me/api/videos/'
          }}
          onupdatefiles={fileItems => {
            this.setState({
              files: fileItems.map(fileItem => fileItem.file)
            })
          }}
        >
          {this.state.files.map(file => (
            <File key={file} src={file} origin="local" />
          ))}
        </FilePond>
      </div>
    )
  }
}

export default FileUploader
