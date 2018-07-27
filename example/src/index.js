import React, {Component} from 'react'
import {render} from 'react-dom'
import AvatarCropper from '../../lib'

class App extends Component {
  constructor() {
    super()
    this.state = {
      cropperOpen: false,
      img: null,
      croppedImg: "http://www.fillmurray.com/400/400"
    }
  }

  handleFileChange = (dataURI) => {
    this.setState({
      img: dataURI,
      croppedImg: this.state.croppedImg,
      cropperOpen: true
    })
  }

  handleCrop = (dataURI, file) => {
    this.setState({
      cropperOpen: false,
      img: null,
      croppedImg: dataURI
    })
  }

  handleRequestHide = () => {
    this.setState({cropperOpen: false})
  }

  render () {
    return (
      <div>
        <div className="avatar-photo">
          <FileUpload handleFileChange={this.handleFileChange} changePic={this.changePic} />
          <div className="avatar-edit">
            <span>Click to Pick Avatar</span>
            <i className="fa fa-camera"></i>
          </div>
          <img src={this.state.croppedImg} />
        </div>
        {this.state.cropperOpen &&
          <AvatarCropper
            modalOptions={{header: 'Crop image', dimmer: 'blurring', size: 'small'}}
            isOriginalSize={true}
            maxCanvasSize={1400}
            onRequestHide={this.handleRequestHide}
            cropperOpen={this.state.cropperOpen}
            onCrop={this.handleCrop}
            image={this.state.img}
            width={400}
            height={400}
          />
        }
      </div>
   )
  }
}

class FileUpload extends Component {
  handleFile = (e, f) => {
    let reader = new FileReader()
    let file = e.target.files[0]
    this.props.handleFileChange(file)
  }

  render() {
    return(
      <input ref="in" type="file" accept="image/*" onChange={this.handleFile} />
    )
  }
}

render(<App />, document.getElementById('content'))
