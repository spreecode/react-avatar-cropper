import "./styles.css";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Modal, Button } from "semantic-ui-react";
import {isDataURL, isUrl, getOrientation, resetOrientation} from "./utils";
import warning from "warning";

var numberableType = (props, propName, componentName) => {
  warning(
    !isNaN(parseInt(props[propName])),
    `Invalid ${propName} '${props.size}' sent to '${componentName}'. Requires an
    int or string capable of conversion to an int.
    Check the render method of == '${componentName}'. == `
  );
};

class Cropper extends Component {
  constructor() {
    super();

    this.state = {
      dragging: false,
      image: {},
      mouse: {
        x: null,
        y: null
      },
      preview: null,
      zoom: 1
    };

    this.listeners = [];

  }

  fitImageToCanvas = (width, height) => {
    var scaledHeight, scaledWidth;

    var canvasAspectRatio = this.props.height / this.props.width;
    var imageAspectRatio = height / width;

    if (canvasAspectRatio > imageAspectRatio) {
      scaledHeight = this.props.height;
      let scaleRatio = scaledHeight / height;
      scaledWidth = width * scaleRatio;
    } else {
      scaledWidth = this.props.width;
      let scaleRatio = scaledWidth / width;
      scaledHeight = height * scaleRatio;
    }

    return { width: scaledWidth, height: scaledHeight };
  }

  prepareImage = (imageUri) => {
    var img = new Image();
    if (!isDataURL(imageUri)) img.crossOrigin = 'anonymous';
    img.onload = () => {
      var scaledImage = this.fitImageToCanvas(img.width, img.height);
      scaledImage.resource = img;
      scaledImage.x = 0;
      scaledImage.y = 0;
      this.setState({dragging: false, image: scaledImage, preview: this.toDataURL()});
    };
    img.src = imageUri;
  }

  mouseDownListener = (e) => {
    this.setState({
      dragging: true,
      mouse: {
        x: null,
        y: null
      }
    });
  }

  preventSelection = (e) => {
    if (this.state.dragging) {
      e.preventDefault();
      return false;
    }
  }

  mouseUpListener = (e) => {
    this.setState({ dragging: false, preview: this.toDataURL() });
  }

  mouseMoveListener = (e) => {
    if (!this.state.dragging) return;

    var mouseX = e.clientX || e.touches[0].clientX;
    var mouseY = e.clientY || e.touches[0].clientY;
    var imageX = this.state.image.x;
    var imageY = this.state.image.y;

    var newImage = this.state.image;

    if (this.state.mouse.x && this.state.mouse.y) {
      var dx = this.state.mouse.x - mouseX;
      var dy = this.state.mouse.y - mouseY;

      var bounded = this.boundedCoords(imageX, imageY, dx, dy);

      newImage.x = bounded.x;
      newImage.y = bounded.y;
    }

    this.setState({
      mouse: {
        x: mouseX,
        y: mouseY
      }
    });
  }

  boundedCoords = (x, y, dx, dy) => {
    var newX = x - dx;
    var newY = y - dy;

    var scaledWidth = this.state.image.width * this.state.zoom;
    var dw = (scaledWidth - this.state.image.width) / 2;
    var imageLeftEdge = this.state.image.x - dw;
    var imageRightEdge = (imageLeftEdge + scaledWidth);

    var rightEdge = this.props.width;
    var leftEdge = 0;

    if (newX - dw > 0) { x = dw; }
    else if (newX < (-scaledWidth + rightEdge)) { x = rightEdge - scaledWidth; }
    else {
      x = newX;
    }

    var scaledHeight = this.state.image.height * this.state.zoom;
    var dh = (scaledHeight - this.state.image.height) / 2;
    var imageTopEdge = this.state.image.y - dh;
    var imageBottomEdge = imageTopEdge + scaledHeight;

    var bottomEdge = this.props.height;
    var topEdge = 0;
    if (newY - dh > 0) { y = dh; }
    else if (newY < (-scaledHeight + bottomEdge)) { y = bottomEdge - scaledHeight; }
    else {
      y = newY;
    }

    return { x: x, y: y };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.image !== nextProps.image) {
      this.prepareImage(nextProps.image)
    }
  }

  componentDidMount() {
    var context = this.canvas.getContext("2d");
    this.prepareImage(this.props.image);

    this.listeners = {
      mousemove: e => this.mouseMoveListener(e),
      mouseup: e => this.mouseUpListener(e),
      mousedown: e => this.mouseDownListener(e)
    };

    window.addEventListener("mousemove", this.listeners.mousemove, false);
    window.addEventListener("mouseup", this.listeners.mouseup, false);
    this.canvas.addEventListener("mousedown", this.listeners.mousedown, false);

    // make it work on mobile devices
    window.addEventListener("touchmove", this.listeners.mousemove, false);
    window.addEventListener("touchend", this.listeners.mouseup, false);
    this.canvas.addEventListener("touchstart", this.listeners.mousedown, false);

    document.onselectstart = e => this.preventSelection(e);
  }

  // make sure we clean up listeners when unmounted.
  componentWillUnmount() {
    window.removeEventListener("mousemove", this.listeners.mousemove);
    window.removeEventListener("mouseup", this.listeners.mouseup);
    this.canvas.removeEventListener("mousedown", this.listeners.mousedown);

    window.removeEventListener("touchmove", this.listeners.mousemove, false);
    window.removeEventListener("touchend", this.listeners.mouseup, false);
    this.canvas.removeEventListener("touchstart", this.listeners.mousedown, false);
  }

  componentDidUpdate() {
    let context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.props.width, this.props.height);
    this.addImageToCanvas(context, this.state.image);
  }

  /* fitting original size image to maximum available canvas size */
  addImageToCanvasWithOriginalSize = (context, canvasWidth, canvasHeight, image) => {
    if (!image.resource) return

    const { zoom } = this.state
    const { resource } = image

    context.save()
    context.globalCompositeOperation = "destination-over"

    let scaledHeight, scaledWidth;

    let canvasAspectRatio = canvasHeight / canvasWidth
    let imageAspectRatio  = resource.height / resource.width

    if (canvasAspectRatio > imageAspectRatio) {
      scaledHeight   = canvasHeight
      let scaleRatio = canvasHeight / resource.height
      scaledWidth = resource.width * scaleRatio
    } else {
      scaledWidth = canvasWidth
      let scaleRatio = canvasWidth / resource.width
      scaledHeight = resource.height * scaleRatio
    }

    let zoomedWidth = scaledWidth * zoom
    let zoomedHeight = scaledHeight * zoom

    let scaleRatioX = canvasWidth/this.props.width
    let scaleRatioY = canvasHeight/this.props.height

    let x = image.x * scaleRatioX - (zoomedWidth - scaledWidth) / 2
    let y = image.y * scaleRatioY - (zoomedHeight - scaledHeight) / 2

    x = Math.min(x, 0)
    y = Math.min(y, 0)
    y = zoomedHeight + y >= canvasHeight ? y : (y + (canvasHeight - (zoomedHeight + y)))
    x = zoomedWidth + x >= canvasWidth ? x : (x + (canvasWidth - (zoomedWidth + x)))

    context.drawImage(resource, x, y, scaledWidth * zoom, scaledHeight * zoom)
    context.restore()
  }

  /* getting original cropped image */
  getOriginalCroppedImage = () => {
    return new Promise((resolve, reject) => {
      const { image } = this.state
      let orCanvas = document.createElement('canvas');
      let orCanvasContext = orCanvas.getContext('2d');

      let initialCanvasHeight = this.props.height
      let initialCanvasWidth = this.props.width
      var imageAspectRatio = initialCanvasWidth / initialCanvasHeight
      let canvasWidth, canvasHeight

      if (image.resource.width > image.resource.height) {
        canvasHeight = image.resource.height
        canvasWidth  = canvasHeight * imageAspectRatio
      } else {
        canvasWidth  = image.resource.width
        canvasHeight = canvasWidth / imageAspectRatio
      }

      orCanvas.width  = canvasWidth/this.state.zoom;
      orCanvas.height = canvasHeight/this.state.zoom;

      if (this.props.maxCanvasSize && orCanvas.width > this.props.maxCanvasSize) {
        orCanvas.width  = this.props.maxCanvasSize
        orCanvas.height = this.props.maxCanvasSize
      }

      this.addImageToCanvasWithOriginalSize(orCanvasContext, orCanvas.width, orCanvas.height, image)

      orCanvas.toBlob((blob) => {
        let imgFile = new File([blob], this.props.file.name)
        let imgUrl = orCanvas.toDataURL('image/jpeg', 0.9)
        resolve({url: imgUrl, file: imgFile})
      }, 'image/jpeg', 0.9)
    })
  }

  addImageToCanvas = (context, image) => {
    if (!image.resource) return;
    context.save();
    context.globalCompositeOperation = "destination-over";
    var scaledWidth = this.state.image.width * this.state.zoom;
    var scaledHeight = this.state.image.height * this.state.zoom;

    var x = image.x - (scaledWidth - this.state.image.width) / 2;
    var y = image.y - (scaledHeight - this.state.image.height) / 2;

    // need to make sure we aren't going out of bounds here...
    x = Math.min(x, 0);
    y = Math.min(y, 0);
    y = scaledHeight + y >= this.props.height ? y : (y + (this.props.height - (scaledHeight + y)));
    x = scaledWidth + x >= this.props.width ? x : (x + (this.props.width - (scaledWidth + x)));

    context.drawImage(image.resource, x, y, image.width * this.state.zoom, image.height * this.state.zoom);
    context.restore();
  }

  toDataURL = () => {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = this.props.width;
    canvas.height = this.props.height;

    this.addImageToCanvas(context, {
      resource: this.state.image.resource,
      x: this.state.image.x,
      y: this.state.image.y,
      height: this.state.image.height,
      width: this.state.image.width
    });

    return canvas.toDataURL()
  }

  getCroppedImage = () => {
    return new Promise((resolve, reject) => {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");

      canvas.width = this.props.width;
      canvas.height = this.props.height;

      this.addImageToCanvas(context, {
        resource: this.state.image.resource,
        x: this.state.image.x,
        y: this.state.image.y,
        height: this.state.image.height,
        width: this.state.image.width
      });

      canvas.toBlob((blob) => {
        let imgFile = new File([blob], this.props.file.name)
        let imgURL = canvas.toDataURL('image/jpeg', 0.9)
        resolve({file: imgFile, url: imgURL})
      }, 'image/jpeg', 0.9)
    })
  }

  handleCrop = () => {
    const { image } = this.state
    const { isOriginalSize, onCrop } = this.props

    if (isOriginalSize) this.getOriginalCroppedImage().then(({url, file}) => onCrop(url, file))
    else this.getCroppedImage().then(({url, file}) => onCrop(url, file))
  }

  handleZoomUpdate = () => {
    this.setState({zoom: this.zoom.value});
  }

  render() {
    return (
      <div className="AvatarCropper-canvas">
        <div className="row">
          <canvas
            ref={el => this.canvas = el}
            width={this.props.width}
            height={this.props.height}>
          </canvas>
        </div>

        <div className="row">
          <input
            type="range"
            name="zoom"
            ref={el => this.zoom = el}
            onChange={this.handleZoomUpdate}
            style={{width: this.props.width}}
            min="1"
            max="3"
            step="0.01"
            defaultValue="1"
          />
        </div>

        <div className='modal-footer'>
          <Button onClick={this.props.onRequestHide}>{this.props.closeButtonCopy}</Button>
          <Button primary onClick={this.handleCrop.bind(this)}>
            {this.props.cropButtonCopy}
          </Button>
        </div>

      </div>
    );
  }
}

Cropper.propTypes = {
  image: PropTypes.string.isRequired,
  file: PropTypes.object.isRequired,
  width: numberableType,
  height: numberableType,
  zoom: numberableType,
  isOriginalSize: PropTypes.bool,
  maxCanvasSize: PropTypes.number
}

Cropper.defaultProps = {
  width: 400, height: 400,
  zoom: 1,
  isOriginalSize: true
}

class AvatarCropper extends React.Component {
  constructor() {
    super()
    this.state = {
      imageUrl: null
    }
  }

  componentWillMount() {
    this.prepareImage()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.image !== nextProps.image) {
      this.prepareImage(nextProps)
    }
  }

  prepareImage = (props=this.props) => {
    let reader = new FileReader()
    let { image, maxCanvasSize } = props

    if (!image) return

    if (typeof(image) === 'string' && isUrl(image)) {
      this.setState({imageUrl: image})
    } else {
      reader.addEventListener("load", () => {
        getOrientation(image, orientation =>
          resetOrientation(reader.result, orientation, maxCanvasSize, imageUrl =>
            this.setState({imageUrl: imageUrl})
          )
        )
      }, false);

      reader.readAsDataURL(image)
    }
  }

  render () {
    const { header, content, isModal, ...modalOptions } = this.props.modalOptions
    let mainContent =
      <div>
        { header && <Modal.Header>{header}</Modal.Header> }
        <div className="modal-body">
          <div className="AvatarCropper-base">
            { this.state.imageUrl &&
              <Cropper
                image={this.state.imageUrl}
                file={this.props.image}
                width={this.props.width}
                height={this.props.height}
                onCrop={this.props.onCrop}
                onRequestHide={this.props.onRequestHide}
                closeButtonCopy={this.props.closeButtonCopy}
                cropButtonCopy={this.props.cropButtonCopy}
                isOriginalSize={this.props.isOriginalSize}
                maxCanvasSize={this.props.maxCanvasSize}
              />
            }
          </div>
        </div>
      </div>

    let toRender = mainContent

    if (isModal) toRender =
      <Modal
        open={this.props.cropperOpen}
        onClose={this.props.onRequestHide}
        children={mainContent}
        {...modalOptions}
      />


    return toRender
  }
}

AvatarCropper.propTypes = {
  image: PropTypes.oneOfType([
    PropTypes.string, PropTypes.object
  ]),
  onCrop: PropTypes.func.isRequired,
  isOriginalSize: PropTypes.bool,
  maxCanvasSize: PropTypes.number, //sometimes needs to constrict max canvas size because big size doesnt work on all devices
  closeButtonCopy: PropTypes.string,
  cropButtonCopy: PropTypes.string,
  width: numberableType,
  height: numberableType,
  onRequestHide: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
  modalOptions: PropTypes.object //semantic ui react modal options
};

AvatarCropper.defaultProps = {
  width: 400, height: 400,
  closeButtonCopy: "Close", cropButtonCopy: "Crop and Save",
  isModal: false,
  modalOptions: {}
};

export default AvatarCropper;
