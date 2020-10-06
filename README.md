# React Video Site

Video site built using React. Uses MongoDB and Express as a backend. View random videos, specific videos from the global list or upload your own. Video data is parsed automatically by ffprobe and added to MongoDB. Video data can be edited or deleted if it was uploaded under your account or during your session.

![Screenshot](https://laaksonen.eu/react.png)

## Getting Started

### Prerequisites

```
ffmpeg
node
npm
MongoDB
```

### Installing

Clone or download the repository

```
git clone https://github.com/telaak/MPCHCRemote.git
```

Run npm install

```
npm i
```

## Running

React

```
npm start
```

Express

```
node express.js
```

## Configuration

Configure MongoDB for localhost access and create the following folders under project root, and give the express and mongod process read and write permissions

```
db
uploads
```

## REST API

### GET

The API https://video.laaksonen.me/api/videos supports query parameters e.g. to find all files using the h264 codec

```
https://video.laaksonen.me/api/videos?streams.codec_name=h264
```

The API also supports less than / greater than for numeric fields, e.g. all files whose first stream's width is less than 720

```
https://video.laaksonen.me/api/videos?streams.0.width={lt}720
```

### POST

Upload files as `multipart/form-data` with a single file using the key `filepond`. After uploading, ffprobe checks the files for valid video streams. If the file contains no video streams or isn't a valid media file, the API will return a 415 Unsupported Media Type response.

## Updating and deleting videos 

`https://video.laaksonen.me/api/videos/:videoId` where `:videoId` is the ObjectId of the video.

### PATCH

Changes are sent as `application/json` to Mongoose and MongoDB. E.g. to update the first media stream's index send the following body to the endpoint.

```
{"streams.1.index":"12"}
```

### DELETE

Deletions are done through the same endpoint as PATCH, and require no body.

## Socket.io

Uploading videos, updating videos and deleting videos are sent through WebSocket messages and are updated inside React's props.

## Authentication

The site uses Passport.js and bcrypt to verify users. If a username does not exist in the database, the backend will automatically create a new user and log them in. The hash-and-salt functions are asynchronous not to block the node.js thread.

## Built With

* [Visual Studio Code](https://code.visualstudio.com/)
* [This project was bootstrapped with Create React App.](https://github.com/facebook/create-react-app)
* [Express](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose](https://mongoosejs.com/)
* [Socket.io](https://socket.io/)
* [Passport.js](http://www.passportjs.org/)
* [Filepond](https://pqina.nl/filepond/)

## Authors

* **Teemu Laaksonen**

See also the list of [contributors](https://github.com/telaak/react-video-site/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
