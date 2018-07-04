import React, {Component} from 'react'
import ReactDom from 'react-dom'
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

  handleCrop = (dataURI) => {
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
          <FileUpload handleFileChange={this.handleFileChange} />
          <div className="avatar-edit">
            <span>Click to Pick Avatar</span>
            <i className="fa fa-camera"></i>
          </div>
          <img src={this.state.croppedImg} />
        </div>
        {this.state.cropperOpen &&
          <AvatarCropper
            modalOptions={{header: 'Crop image', dimmer: 'blurring', size: 'small'}}
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
  handleFile = (e) => {
    let reader = new FileReader()
    let file = e.target.files[0]

    if (!file) return

    reader.onload = function(img) {
      ReactDom.findDOMNode(this.refs.in).value = '';
      this.props.handleFileChange(img.target.result);
    }.bind(this)
    reader.readAsDataURL(file)
  }

  render() {
    return(
      <input ref="in" type="file" accept="image/*" onChange={this.handleFile} />
    )
  }
}

ReactDom.render(<App />, document.getElementById('content'))
