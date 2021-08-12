# AZEngine | Web & Electron Game Engine
## Setup
To install the module :
```
npm i azengine
```
Insert your script in the Electron index.html :
```html
<!DOCTYPE html>
<html>
    <head>
        <title>AZEngine</title>
    </head>
    <body>
        <script type="text/javascript" src="myScript.js"></script>
    </body>
</html>
```
To use AZEngine in your script :
```javascript
const AZEngine = require("azengine")
```
## Using objects
We will first create an image object in position (0,0), and of square size 250x250.

To create a new object :
```javascript
var myObject = AZEngine.createObject("image.png", {x: 0, y: 0}, {width: 250, height: 250}, 0)
```
To get the object ID :
```javascript
myObject.getId()
```
To remove the object :
```javascript
AZEngine.removeObject(myObject.getId())
```
## Using transforms
We will see how to define the position, size, and rotation of an object.

To set the position :
```javascript
myObject.setPosition({x: 100, y: 100})
```
To get the position :
```javascript
myObject.getPosition().x
//return position x
myObject.getPosition().y
//return position y
```
To set the size :
```javascript
myObject.setSize({width: 500, height: 500})
```
To get the size :
```javascript
myObject.getSize().width
//return width
myObject.getSize().height
//return height
```
To set the rotation :
```javascript
myObject.setRotation(45)
```
To get the rotation :
```javascript
myObject.getRotation()
//return rotation
```
## Using animations
Now, let's animate the created object.

To create an animation :
```javascript
myObject.createAnimation("myAnimation", {frames_delay: 10, loop: true}, ["image1.png","image2.png","image3.png"])
```
To start the created animation :
```javascript
myObject.startAnimation("myAnimation")
```
To stop the current animation :
```javascript
myObject.stopAnimation()
```
To get the current animation :
```javascript
myObject.getAnimation()
//return current animation name
```
## Using interfaces
Let's see how to create a simple menu.

To create a new interface :
```javascript
var myInterface = AZEngine.createInterface()
```
To get the interface ID :
```javascript
myInterface.getId()
```
To remove the interface :
```javascript
AZEngine.removeInterface(myInterface.getId())
```
To create a new element in the interface :
```javascript
var myInterfaceElement = myInterface.createElement('button', {x: 0, y: 0}, {width: 250, height: 40}, {text: "Hello", color: "#000000", background_color: "#ffffff", font_size: 30})
```
To get the element ID :
```javascript
myInterfaceElement.getId()
```
To remove the element :
```javascript
myInterfaceElement.removeElement(myInterfaceElement.getId())
```
## Using audios
Now let's see how to manipulate the audio channels

To create a new audio channel :
```javascript
var myAudio = AZEngine.createAudio("myChannel")
```
To play a file on the channel :
```javascript
myAudio.play("music.mp3")
```
To stop the audio of a channel :
```javascript
myAudio.stop();
```
To pause the audio of a channel :
```javascript
myAudio.pause();
```