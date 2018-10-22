import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { MDBDataTable } from 'mdbreact'

class VideoPage extends React.Component {
  render () {
    return (
      <div>
        <DatatablePage
          rows={this.props.videoList
            .map(video => {
              return {
                fileName: video.fileName,
                link: (
                  <Link to={{ pathname: '/videos/' + video._id, state: video }}>
                    ▶
                  </Link>
                ),
                width: video.streams[0].width,
                height: video.streams[0].height,
                codec_name: video.streams[0].codec_name,
                r_frame_rate: video.streams[0].r_frame_rate,
                pix_fmt: video.streams[0].pix_fmt
              }
            })
            .reverse()}
        />
      </div>
    )
  }
}
const DatatablePage = props => {
  const data = {
    columns: [
      {
        label: 'Filename',
        field: 'fileName',
        sort: 'asc',
        width: 150
      },
      {
        label: '',
        field: 'link',
        sort: 'asc',
        width: 150
      },
      {
        label: 'Width',
        field: 'width',
        sort: 'asc',
        width: 150
      },
      {
        label: 'Height',
        field: 'height',
        sort: 'asc',
        width: 150
      },
      {
        label: 'Codec',
        field: 'codec_name',
        sort: 'asc',
        width: 150
      },
      {
        label: 'Framerate',
        field: 'r_frame_rate',
        sort: 'asc',
        width: 150
      },
      {
        label: 'Pixel format',
        field: 'pix_fmt',
        sort: 'asc',
        width: 150
      }
    ],
    rows: props.rows
  }

  return (
    <MDBDataTable
      info={true}
      paging={false}
      striped
      bordered
      hover
      data={data}
    />
  )
}

export default VideoPage
