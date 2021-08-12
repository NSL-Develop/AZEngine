//AZEngine by NSL-Develop

document.body.focus();
document.body.style.margin = "0px";
document.body.dataset.cameraPosition = [0,0];
const height = window.innerHeight, width = window.innerWidth;
let oldWidth = width, oldHeight = height;
document.body.onresize = () => {
    const newHeight = window.innerHeight;
    const newWidth = window.innerWidth;
    if (height == newHeight && newHeight == oldHeight && width == newWidth && newWidth == oldWidth)
        return;
    for (let e of document.body.children) {
        if (e.tagName != "SCRIPT") {
            e['style'].height = ((+e['offsetHeight'] * (height / oldHeight)) * (newHeight / height)) + "px";
            e['style'].width = ((+e['offsetWidth'] * (width / oldWidth)) * (newWidth / width)) + "px";
            e['style'].marginLeft = ((+e['style'].marginLeft.replace("px", "") * (width / oldWidth)) * (newWidth / width)) + "px";
            e['style'].marginTop = ((+e['style'].marginTop.replace("px", "") * (height / oldHeight)) * (newHeight / height)) + "px";
        };
    };
    oldWidth = newWidth;
    oldHeight = newHeight;
};
window.objectsConfig = {};
window.inputActions = {};
window.audioChannels = {};
window.interfaces = {};
class AZEngine {
    static createScene() {
        return new GameScene();
    }
    static removeScene(id) {
        document.body.removeChild(document.getElementById("scn-" + id));
    }
    static createAudio() {
        return new AudioChannel();
    }
    static setCameraPosition(position) {
        document.querySelector("body").dataset.cameraPosition = [(+(document.body.dataset.cameraPosition.split(/\s*(,|$)\s*/)[0])+position.x), (+(document.body.dataset.cameraPosition.split(/\s*(,|$)\s*/)[2])+position.y)];
        for (let e of document.body.children) {
            if (e.tagName == "IMG") {
                e['style'].marginLeft = (+e['style'].marginLeft.replace("px","") + -(+position.x)) + "px";
                e['style'].marginTop = (+e['style'].marginTop.replace("px","") + -(+position.y)) + "px";
                document.body.onresize();
            };
        };
    };
    static getCameraPosition() {
        var position = document.body.dataset.cameraPosition.split(/\s*(,|$)\s*/);
        return {x: +position[0], y: +position[2]};
    };
    static createAction(action) {
        if (typeof(action.name) != "undefined" && typeof(inputActions[action.name]) == "undefined") {
            inputActions[action.name] = {type: action.type, trigger: action.trigger, key: action.key, value: action.value, trueCallback: action.trueCallback, falseCallback: action.falseCallback}
        };
    };
    static startAction(name) {
        setTimeout(() => {
            if (typeof(inputActions[name]) != "undefined") {
                inputActions[name].active = true;
                var eventType = inputActions[name].type;
                var eventTrigger = inputActions[name].trigger;
                if (eventType == "keyboard") {
                    var eventKey = inputActions[name].key;
                    var eventValue = inputActions[name].value;
                    if (eventTrigger == "keydown") {
                        var eventInterval;
                        var keydownTriggered = false;
                        var keyupTriggered = false;
                        document.addEventListener("keydown", function (event) {
                            if (!keydownTriggered && inputActions[name].active == true) {
                                keydownTriggered = true;
                                keyupTriggered = false
                                if (typeof(event[eventKey]) != "undefined" && +event[eventKey] == +eventValue) {
                                    inputActions[name].interval = setInterval(() => {
                                        window[inputActions[name].trueCallback]();
                                    }, 1)
                                };
                            };
                        }, false);
                        document.addEventListener("keyup", function (event) {
                            if (!keyupTriggered && inputActions[name].active == true) {
                                keyupTriggered = true;
                                keydownTriggered = false
                                if (typeof(event[eventKey]) != "undefined" && +event[eventKey] == +eventValue) {
                                    window[inputActions[name].falseCallback]();
                                    clearInterval(inputActions[name].interval);
                                };
                            };
                        }, false);
                    };
                };
            };
        }, 5);
    };
    static stopAction(name) {
        inputActions[name].active = false;
    };
    static restartAction(name) {
        this.stopAction(name)
        inputActions[name].active = true;
    };
};

class GameScene {
    constructor() {
        this.#ID = "scn-" + createRandomNumber();
        this.#scene = document.createElement("div");
        this.#scene.id = this.#ID;
        this.#scene.style.position = "fixed";
        this.#scene.style.height = "100%";
        this.#scene.style.width = "100%";
        this.#scene.style.marginTop = "0px";
        this.#scene.style.marginLeft = "0px";
        document.body.appendChild(this.#scene);
        document.body.onresize(undefined);
    }
    createObject(file, position = { x: 0, y: 0 }, size, rotation = 0) {
        return new GameObject(file, position, size);
    };
    removeObject(id) {
        document.body.removeChild(document.getElementById("obj-" + id));
    };
    getId() {
        return this.#ID;
    };
    createInterface() {
        return new GameInterface();
    };
    removeInterface(id) {
        document.body.removeChild(document.getElementById(id + ""));
    };
}

class GameObject {
    constructor(file, position, size) {
        this.#ID = "obj-" + createRandomNumber();
        this.#object = document.createElement("img");
        this.#object.src = file.toString();
        this.#object.id = this.#ID + "";
        this.#object.style.position = "fixed";
        this.#object.style.height = size.height + "px";
        this.#object.style.width = size.width + "px";
        this.#object.style.marginTop = position.y + "px";
        this.#object.style.marginLeft = position.x + "px";
        this.#object.style.zIndex = "100";
        this.#objectConfig = {"id":null,"transform":{"position":{"x":position.x,"y":position.y},"size":{"width":size.width,"height":size.height},"rotation":0},"body":{"weight":0,"gravity":0,"shape":{"position":{"x":0,"y":0},"size":{"width":0,"height":0}}},"animations":{"current_animation":{"interval":null, "name":null}}};
        this.#objectBodyPhysics = {"colliders":{}};
        document.body.appendChild(this.#object);
        document.body.onresize(undefined);
    }
    #ID;
    #object;
    #objectConfig;
    #objectBodyPhysics;

    getId() {
        if (document.getElementById(this.#ID) != null) {
            return this.#ID;
        } else {
            console.error("Error in getId() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getObject() {
        if (document.getElementById(this.#ID) != null) {
            return this.#object;
        } else {
            console.error("Error in getObject() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setPosition(position) {
        if (document.getElementById(this.#ID) != null) {
            this.#object.style.marginLeft = position.x + "px";
            this.#object.style.marginTop = position.y + "px";
            document.body.onresize(undefined);
            this.#objectConfig.transform.position = {"x":position.x,"y":position.y}
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in setPosition() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getPosition() {
        if (document.getElementById(this.#ID) != null) {
            return {x: +this.#object.style.marginLeft.replace("px", ""), y: +this.#object.style.marginTop.replace("px", "")}
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in getPosition() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setSize(size) {
        if (document.getElementById(this.#ID) != null) {
            this.#object.style.width = size.width + "px";
            this.#object.style.height = size.height + "px";
            document.body.onresize(undefined);
            this.#objectConfig.transform.size = {"width":size.width,"height":size.height}
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in setSize() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getSize() {
        if (document.getElementById(this.#ID) != null) {
            return {width: +this.#object.style.width.replace("px", ""), height: +this.#object.style.height.replace("px", "")}
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in getSize() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setRotation(deg) {
        if (document.getElementById(this.#ID) != null) {
            let t = this.#object.style.transform.split(" ");
            let k = false;
            for (let e in t) {
                if (t[e].includes("rotate")) {
                    t[e] = "rotate(" + deg + "deg)";
                    k = true;
                    break;
                };
            };
            if (!k)
                t.push("rotate(" + deg + "deg)");
            this.#object.style.transform = t.join(" ");
            this.#objectConfig.transform.rotation = deg;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in setRotation() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getRotation() {
        if (document.getElementById(this.#ID) != null) {
            return this.#objectConfig.transform.rotation;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in getRotation() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setFlipX() {
        if (document.getElementById(this.#ID) != null) {
            this.#editTransform("scaleX", ["-1", "1"]);
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in flipX() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getFlipX() {
        if (document.getElementById(this.#ID) != null) {
            let t = this.#object.style.transform.split(" ");
            for (let e in t) {
                if (t[e].includes("scaleX")) {
                    if (t[e].includes("-1")) return true;
                    else if (t[e].includes("1")) return false;
                };
            };
            return false;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in getFlipX() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setFlipY() {
        if (document.getElementById(this.#ID) != null) {
            this.#editTransform("scaleY", ["-1", "1"]);
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in flipY() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getFlipY() {
        if (document.getElementById(this.#ID) != null) {
            let t = this.#object.style.transform.split(" ");
            for (let e in t) {
                if (t[e].includes("scaleY")) {
                    if (t[e].includes("-1")) return true;
                    else if (t[e].includes("1")) return false;
                };
            };
            return false;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in getFlipY() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    #editTransform(key, value) {
        if (document.getElementById(this.#ID) != null) {
            let t = this.#object.style.transform.split(" ");
            let k = false;
            for (let e in t) {
                if (t[e].includes(key)) {
                    if (t[e].includes(value[0]))
                        t[e] = key + "(" + value[1] + ")";
                    else
                        t[e] = key + "(" + value[0] + ")";
                    k = true;
                    break;
                };
            };
            if (!k)
                t.push(key + "(" + value[0] + ")");
            this.#object.style.transform = t.join(" ");
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in editTransform() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setImage(file) {
        if (document.getElementById(this.#ID) != null) {
            document.getElementById(this.#ID).src = file;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in setImage() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setImageSettings(settings = {rendering: "auto"}) {
        if (document.getElementById(this.#ID) != null) {
            var settingsRendering = settings.rendering;
            this.#object.style.imageRendering = settingsRendering;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in setImageMode() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    createAnimation(name, config, frames) {
        if (document.getElementById(this.#ID) != null) {
            if (typeof(this.#objectConfig.animations[name]) == "undefined") {
                this.#objectConfig.animations[name] = {"config":config,"frames":frames};
            };
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in createAnimation() : his object is empty, it must be deleted with the delete() function.");
        };
    };
    startAnimation(name) {
        if (document.getElementById(this.#ID) != null) {
            this.stopAnimation()
            clearInterval(this.#objectConfig.animations.current_animation.interval);
            if (typeof(this.#objectConfig.animations[name]) != "undefined") {
                var framesDelay = this.#objectConfig.animations[name].config.frames_delay;
                var animationLoop = this.#objectConfig.animations[name].config.loop;
                var animationFrames = (this.#objectConfig.animations[name].frames);
                var framesCount = 1;
                var framesEnd = animationFrames.length;
                this.#objectConfig.animations.current_animation.name = name
                this.setImage((this.#objectConfig.animations[name].frames)[0])
                this.#objectConfig.animations.current_animation.intersval = setInterval(() => {
                    if (document.getElementById(this.#ID) != null) {    
                        if (framesCount+1 <= framesEnd) {
                            var animationCurrenFrame = (this.#objectConfig.animations[name].frames)[framesCount];
                            this.setImage(animationCurrenFrame);
                            framesCount += 1
                            if (framesCount == framesEnd) {
                                if (animationLoop != true) {
                                    clearInterval(refreshInterval);
                                } else {
                                    framesCount = 0;
                                };
                            };
                        };
                    } else {
                        clearInterval(this.#objectConfig.animations.current_animation.interval);
                        console.error("Error in startAnimation() : This object is empty, it must be deleted with the delete() function.");
                    };
                }, framesDelay);
            };
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in startAnimation() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    stopAnimation() {
        if (document.getElementById(this.#ID) != null) {
            clearInterval(this.#objectConfig.animations.current_animation.interval);
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in stopAnimation() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    getAnimation() {
        if (document.getElementById(this.#ID) != null) {
            return this.#objectConfig.animations.current_animation.name;
            this.#objectConfig.id = this.#ID;
        } else {
            console.error("Error in getAnimation() : This object is empty, it must be deleted with the delete() function.");
        };
    };
    setBodyValues(values) {
        this.#objectConfig.body.weight = values.weight;
        this.#objectConfig.body.gravity = values.gravity;
        this.#objectConfig.id = this.#ID;
        window.objectsConfig[this.#ID + ""] = this.#objectConfig;
    };
    setBodyShape(shape) {
        this.#objectConfig.body.shape.position.x = shape.position.x;
        this.#objectConfig.body.shape.position.y = shape.position.y;
        this.#objectConfig.body.shape.size.width = shape.size.width;
        this.#objectConfig.body.shape.size.height = shape.size.height;
        this.#objectConfig.id = this.#ID;
        window.objectsConfig[this.#ID + ""] = this.#objectConfig;
    };
    startBody() {
        window.objectsConfig[this.#ID + ""] = this.#objectConfig;
        this.#objectBodyPhysics.interval = setInterval(() => {
            this.#physicsProcess();
        }, 10);
    };
    stopBody() {
        clearInterval(this.#objectBodyPhysics.interval);
    };
    getColliders() {
        if (typeof(this.#objectBodyPhysics.colliders) != "undefined") {
            return this.#objectBodyPhysics.colliders;
        };
    };
    #physicsProcess() {
        var objectsConfigArray = window.objectsConfig;
        Object.keys(objectsConfigArray).forEach(currentObject => {
            if (typeof(currentObject) != "undefined" && objectsConfigArray[currentObject] != this.#objectConfig) {
                var sourceLeft = this.#objectConfig.transform.position.x+this.#objectConfig.body.shape.position.x;
                var sourceRight = this.#objectConfig.transform.position.x+(this.#objectConfig.body.shape.position.x+this.#objectConfig.body.shape.size.width);
                var sourceTop = this.#objectConfig.transform.position.y+this.#objectConfig.body.shape.position.y;
                var sourceBottom = this.#objectConfig.transform.position.y+(this.#objectConfig.body.shape.position.y+this.#objectConfig.body.shape.size.height);
                var targetLeft = objectsConfigArray[currentObject].transform.position.x+objectsConfigArray[currentObject].body.shape.position.x;
                var targetRight = objectsConfigArray[currentObject].transform.position.x+(objectsConfigArray[currentObject].body.shape.position.x+objectsConfigArray[currentObject].body.shape.size.width);
                var targetTop = objectsConfigArray[currentObject].transform.position.y+objectsConfigArray[currentObject].body.shape.position.y;
                var targetBottom = objectsConfigArray[currentObject].transform.position.y+(objectsConfigArray[currentObject].body.shape.position.y+objectsConfigArray[currentObject].body.shape.size.height);
                var collisionLeft;
                var collisionRight;
                var collisionTop;
                var collisionBottom;

                if ((sourceLeft > targetRight) || (sourceBottom < targetTop || sourceTop > targetBottom)) {
                    collisionLeft = false;
                } else {
                    collisionLeft = true;
                };
                if ((targetLeft > sourceRight) || (sourceBottom < targetTop || sourceTop > targetBottom)) {
                    collisionRight = false;
                } else {
                    collisionRight = true;
                };
                if ((sourceTop > targetBottom) || (sourceRight < targetLeft || sourceLeft > targetRight)) {
                    collisionTop = false;
                } else {
                    collisionTop = true;
                };
                if ((targetTop > sourceBottom) || (sourceRight < targetLeft || sourceLeft > targetRight)) {
                    collisionBottom = false;
                } else {
                    collisionBottom = true;
                };

                var colliderContent = {"direction":{"left":collisionLeft,"right":collisionRight,"top":collisionTop,"bottom":collisionBottom}}
                if (typeof(objectsConfigArray[currentObject].id) != "undefined") {
                    this.#objectBodyPhysics.colliders[objectsConfigArray[currentObject].id] = colliderContent;
                };
            };
        });
    };
};

class GameInterface {
    constructor() {
        this.#interfaceConfig = {"id":"itf" + createRandomNumber(),"content":{}};
        this.#interface = document.createElement("div");
        this.#interface.style.margin = '0px';
        this.#interface.id =  this.#interfaceConfig.id;
        document.body.appendChild(this.#interface)
    }
    #interfaceConfig;
    #interface;
    getId() {
        if (this.#interfaceConfig.id != null) {
            return this.#interfaceConfig.id;
        };
    };
    getInterface() {
        return this.#interface;
    };
    createElement(type, position = {x: 0, y: 0}, size, prorieties) {
        return new GameInterfaceElement(this.interfaceConfig.id, type, position, size, prorieties)
    };
    removeElement(id) {
        document.body.removeChild(document.getElementById(id + ""));
    };
}

class GameInterfaceElement {
    constructor(interfaceID, type, position, size, prorieties) {
        this.#element = document.createElement(type);
        this.#element.id = createRandomNumber();
        this.#element.style.position = "fixed";
        this.#element.style.left = position.x;
        this.#element.style.top = position.y;
        this.#element.style.width = size.width;
        this.#element.style.height = size.height;
        this.#element.style.innerText = prorieties.text;
        this.#element.style.fontSize = prorieties.font_size;
        this.#element.style.color = prorieties.color;
        this.#element.style.backgroundColor = prorieties.background_color;
        this.#element.style.borderRadius = prorieties.border_radius;
        this.#element.style.borderWidth = prorieties.border_width;
        this.#element.style.borderColor = prorieties.border_color;
        this.#element.style.borderRadius = prorieties.border_radius;
        document.getElementById(interfaceID).appendChild(this.#element)
    }
    #element;
    getId() {
        return this.#element.id;
    };
    getElement() {
        return this.#element
    };
}

function createRandomNumber() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

function startActionProcess(event, name) {
    if (window.inputActions[name].loop ==  true) {
        var actionInterval = setInterval(() => {
            if (window.inputActions[name].active == true) {
                window[(window.inputActions[name].callback)](event);
            } else {
                clearInterval(actionInterval);
            };
        }, 1);
    } else {
        window[(window.inputActions[name].callback)](event);
    };
};

class AudioChannel {
    constructor() {
        this.#audio = new Audio();
    }
    #audio;
    play(file) {
        this.#audio.src = file;
        this.#audio.play();
    };
    stop() {
        this.#audio.stop();
    };
    pause() {
        this.#audio.pause();
    };
};
