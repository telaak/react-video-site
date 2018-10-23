import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import fetch from 'isomorphic-fetch'
import {
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarToggler,
  Collapse,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'mdbreact'
import { withRouter } from 'react-router'
import Video from './Video.js'
import HomePage from './HomePage.js'
import FileUploader from './FileUploader.js'
import VideoManager from './VideoManager.js'
import VideoPage from './VideoPage.js'
import openSocket from 'socket.io-client'
import 'delayed-scroll-restoration-polyfill'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      collapse: false,
      isWideEnough: false,
      videos: []
    }
    this.Login = this.Login.bind(this)
    this.UserName = this.UserName.bind(this)
    this.RouterElement = this.RouterElement.bind(this)
    this.onClick = this.onClick.bind(this)
    this.Videos = this.Videos.bind(this)
    this.socket = openSocket('https://video.laaksonen.me/')
    this.socket.on('newVideo', video => {
      if (this.state.user.sessionId === video.uploaderId) {
        let userObject = Object.assign({}, this.state.user)
        userObject.videos.push(video._id)
        this.setState({ user: userObject })
      }
      this.setState(prevState => ({
        videos: [...prevState.videos, video]
      }))
    })
    this.socket.on('videoDeleted', video => {
      this.setState(prevState => ({
        videos: prevState.videos.filter(oldVideo => oldVideo._id !== video._id)
      }))
    })
    this.socket.on('videoChanged', video => {
      this.setState(prevState => ({
        videos: prevState.videos.map(
          videoObject => (videoObject._id === video._id ? video : videoObject)
        )
      }))
    })
  }

  onClick () {
    this.setState({
      collapse: !this.state.collapse
    })
  }

  componentDidMount () {
    fetch('https://video.laaksonen.me/api/videos')
      .then(response => response.json())
      .then(json => {
        this.setState({ videos: json })
      })
    fetch('https://video.laaksonen.me/api/current')
      .then(response => response.json())
      .then(json => {
        if (!json.error) {
          this.setState({ user: json })
        }
      })
  }

  sendUserData (values, { setSubmitting }, loginFailed = false) {
    fetch(loginFailed ? 'https://video.laaksonen.me/api/register' : 'https://video.laaksonen.me/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then(response => {
        if (response.status !== 401) {
          return response.json()
        } else {
          return response.text()
        }
      })
      .then(parsedResponse => {
        if (parsedResponse === 'Unauthorized') {
          this.sendUserData(values, { setSubmitting }, true)
        } else {
          if (parsedResponse.hasOwnProperty('errors')) {
            alert(parsedResponse.errors.username.message)
          } else {
            this.setState({ user: parsedResponse })
          }
        }
      })
    setSubmitting(false)
  }

  Login (props) {
    return !props.loggedIn ? (
      <Formik
        initialValues={{ username: '', password: '' }}
        validate={values => {
          let errors = {}
          return errors
        }}
        onSubmit={(values, { setSubmitting }) => this.sendUserData(values, { setSubmitting })}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field type="username" name="username" />
            <ErrorMessage name="username" component="div" />
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />
            <button type="submit" disabled={isSubmitting}>
                Login
            </button>
          </Form>
        )}
      </Formik>
    ) : (
      <this.UserName />
    )
  }

  UserName (props) {
    if (this.state.user && this.state.user.username) {
      return (
        <NavItem>
          <Dropdown>
            <DropdownToggle nav caret>
              {this.state.user.username}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                onClick={() => {
                  fetch('https://video.laaksonen.me/api/logout')
                    .then(response => response.json())
                    .then(json => {
                      if (json.success) {
                        this.setState(
                          prevState => ({
                            user: {
                              ...prevState.user,
                              username: null,
                              videos: prevState.videos.filter(
                                video =>
                                  video.uploaderId === this.state.user.sessionId
                              ),
                              admin: false
                            }
                          })
                        )
                      }
                    })
                }}
                href="#"
              >
                Log out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavItem>
      )
    } else {
      return null
    }
  }

  RouterElement () {
    return (
      <div>
        <Router>
          <div>
            <Navbar color="indigo" dark expand="md" scrolling>
              <Link to={'/'}>
                <NavbarBrand href="#">
                  <strong>React Video Site</strong>
                </NavbarBrand>
              </Link>
              {!this.state.isWideEnough && (
                <NavbarToggler onClick={this.onClick} />
              )}
              <Collapse isOpen={this.state.collapse} navbar>
                <NavbarNav left>
                  <NavItem>
                    <NavLink to="/videos">Videos</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink to="/upload">Upload</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink to="/video-manager">Video Manager</NavLink>
                  </NavItem>
                </NavbarNav>
                <NavbarNav right>
                  <this.Login
                    loggedIn={this.state.user && this.state.user.username}
                  />
                </NavbarNav>
              </Collapse>
            </Navbar>
            <Route
              exact
              path="/"
              render={() => <HomePage videoList={this.state.videos} />}
            />
            <Route exact path="/upload" render={() => <FileUploader />} />
            <Route
              path="/video-manager"
              render={() => (
                <VideoManager
                  user={this.state.user}
                  videoList={this.state.videos}
                />
              )}
            />
            <Route path="/videos" component={this.Videos} />
          </div>
        </Router>
      </div>
    )
  }

  Videos ({ match }) {
    return (
      <div>
        <Route path={`${match.path}/:videoId`} render={() => <Video videoList={this.state.videos} />} />
        <Route
          exact
          path={match.path}
          render={() => <VideoPage videoList={this.state.videos} />}
        />
      </div>
    )
  }

  render () {
    return (
      <div className="App">
        <this.RouterElement />
      </div>
    )
  }
}

export default App
