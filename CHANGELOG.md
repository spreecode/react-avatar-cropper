## 1.1.1

* Bugs fixed:
  ** return image file too when original image is not requested;
  ** pass isOriginalSize prop down to the Cropper.

## 1.1.0

* now cropper simply accept image file instead of dataURL of it, through same
prop `image`
* onCrop callback now returns two arguments: cropped image dataURI and image file

## 1.0.0

* updated to react 16 and webpack 4 and at least making sure it works with it
* codestyle updated (ES6)

## 0.4.0

* return original cropped size image by default, instead of given canvas size

* add prop isOriginalSize to Cropper (default: true)

## 0.3.0

* add device touches events (now dragging is allowed on devices)

## 0.2.0

* add semantic-ui-react modal component instead of react-bootstrap modal
